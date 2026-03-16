import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserProgress } from './entities/progress.entity';
import { CreateProgressDto } from './dto/create-progress.dto';

interface Enrollment {
  id: number;
  userId: string;
  courseId: number;
  progress: number;
  status: string;
  completedAt?: Date;
}

export interface SectionProgress {
  sectionId: number;
  completed: number;
  total: number;
  progress: number;
  timeSpent: number;
}

@Injectable()
export class ProgressService {
  constructor(
    @Inject('PROGRESS_REPOSITORY')
    private progressRepository: Repository<UserProgress>,
    @Inject('ENROLLMENT_REPOSITORY')
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async createOrUpdate(
    userId: string,
    createProgressDto: CreateProgressDto,
  ): Promise<UserProgress> {
    try {
      const existing = await this.progressRepository.findOne({
        where: {
          userId,
          contentId: createProgressDto.contentId,
        },
      });

      if (existing) {
        Object.assign(existing, createProgressDto);
        existing.lastAccessedAt = new Date();

        if (createProgressDto.completed && !existing.completedAt) {
          existing.completedAt = new Date();
        }

        const updated = await this.progressRepository.save(existing);
        await this.updateEnrollmentProgress(userId, createProgressDto.courseId);
        return updated;
      }

      const progress = this.progressRepository.create({
        ...createProgressDto,
        userId,
        lastAccessedAt: new Date(),
        completedAt: createProgressDto.completed ? new Date() : null,
      });

      const saved = await this.progressRepository.save(progress);
      await this.updateEnrollmentProgress(userId, createProgressDto.courseId);
      return saved;
    } catch (error) {
      throw new BadRequestException(
        'Failed to update progress: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async getUserCourseProgress(userId: string, courseId: number) {
    try {
      const progressRecords = await this.progressRepository.find({
        where: { userId, courseId },
        relations: ['content'],
        order: { sectionId: 'ASC', createdAt: 'ASC' },
      });

      const totalContent = await this.progressRepository
        .createQueryBuilder('progress')
        .select('COUNT(DISTINCT progress.contentId)', 'count')
        .where('progress.courseId = :courseId', { courseId })
        .getRawOne<{ count: string }>();

      const completedContent = progressRecords.filter(
        (p) => p.completed,
      ).length;
      const totalTimeSpent = progressRecords.reduce(
        (sum, p) => sum + p.timeSpent,
        0,
      );

      const overallProgress =
        totalContent?.count && parseInt(totalContent.count, 10) > 0
          ? Math.round(
              (completedContent / parseInt(totalContent.count, 10)) * 100,
            )
          : 0;

      const sectionProgress = this.groupProgressBySection(progressRecords);

      return {
        courseId,
        userId,
        overallProgress,
        completedContent,
        totalContent: totalContent?.count
          ? parseInt(totalContent.count, 10)
          : 0,
        totalTimeSpent,
        sectionProgress,
        contentProgress: progressRecords,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch course progress: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async getUserAllProgress(userId: string) {
    try {
      const progressRecords = await this.progressRepository.find({
        where: { userId },
        relations: ['content'],
        order: { courseId: 'ASC', sectionId: 'ASC' },
      });

      const courseIds = [...new Set(progressRecords.map((p) => p.courseId))];

      const courseProgressList = await Promise.all(
        courseIds.map((courseId) =>
          this.getUserCourseProgress(userId, courseId),
        ),
      );

      return {
        userId,
        courses: courseProgressList,
        totalCoursesInProgress: courseIds.length,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch user progress: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async getContentProgress(
    userId: string,
    contentId: number,
  ): Promise<UserProgress> {
    try {
      const progress = await this.progressRepository.findOne({
        where: { userId, contentId },
        relations: ['content', 'user'],
      });

      if (!progress) {
        throw new NotFoundException(
          `Progress record not found for content ${contentId}`,
        );
      }

      return progress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to fetch content progress: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async markContentComplete(
    userId: string,
    contentId: number,
    courseId: number,
    sectionId: number,
  ): Promise<UserProgress> {
    try {
      const createDto: CreateProgressDto = {
        contentId,
        courseId,
        sectionId,
        completed: true,
        progressPercentage: 100,
      };

      return await this.createOrUpdate(userId, createDto);
    } catch (error) {
      throw new BadRequestException(
        'Failed to mark content as complete: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async resetCourseProgress(userId: string, courseId: number): Promise<void> {
    try {
      await this.progressRepository.delete({ userId, courseId });
      await this.updateEnrollmentProgress(userId, courseId);
    } catch (error) {
      throw new BadRequestException(
        'Failed to reset course progress: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  private groupProgressBySection(progressRecords: UserProgress[]) {
    const sections = new Map<number, SectionProgress>();

    progressRecords.forEach((record) => {
      if (!sections.has(record.sectionId)) {
        sections.set(record.sectionId, {
          sectionId: record.sectionId,
          completed: 0,
          total: 0,
          progress: 0,
          timeSpent: 0,
        });
      }

      const section = sections.get(record.sectionId)!;
      section.total++;
      section.timeSpent += record.timeSpent;

      if (record.completed) {
        section.completed++;
      }
    });

    sections.forEach((section) => {
      section.progress =
        section.total > 0
          ? Math.round((section.completed / section.total) * 100)
          : 0;
    });

    return Array.from(sections.values());
  }

  private async updateEnrollmentProgress(
    userId: string,
    courseId: number,
  ): Promise<void> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { userId, courseId },
      });

      if (!enrollment) {
        return;
      }

      const progressData = await this.getUserCourseProgress(userId, courseId);
      enrollment.progress = progressData.overallProgress;

      if (
        progressData.overallProgress === 100 &&
        enrollment.status === 'active'
      ) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }

      await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      console.error('Failed to update enrollment progress:', error);
    }
  }
}
