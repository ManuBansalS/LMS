import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject('ENROLLMENT_REPOSITORY')
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    try {
      const existing = await this.enrollmentRepository.findOne({
        where: {
          userId: createEnrollmentDto.userId,
          courseId: createEnrollmentDto.courseId,
        },
      });

      if (existing) {
        throw new ConflictException('User already enrolled in this course');
      }

      const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
      return await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create enrollment: ' + error.message,
      );
    }
  }

  async findAll(): Promise<Enrollment[]> {
    try {
      return await this.enrollmentRepository.find({
        relations: ['user', 'course'],
        order: { enrolledAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch enrollments: ' + error.message,
      );
    }
  }

  async findByUserId(userId: string): Promise<Enrollment[]> {
    try {
      return await this.enrollmentRepository.find({
        where: { userId },
        relations: ['user', 'course'],
        order: { enrolledAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch user enrollments: ' + error.message,
      );
    }
  }

  async findByCourseId(courseId: number): Promise<Enrollment[]> {
    try {
      return await this.enrollmentRepository.find({
        where: { courseId },
        relations: ['user', 'course'],
        order: { enrolledAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch course enrollments: ' + error.message,
      );
    }
  }

  async findOne(id: number): Promise<Enrollment> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id },
        relations: ['user', 'course'],
      });

      if (!enrollment) {
        throw new NotFoundException(`Enrollment with ID ${id} not found`);
      }

      return enrollment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to fetch enrollment: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
    userId?: string,
  ): Promise<Enrollment> {
    try {
      const enrollment = await this.findOne(id);

      if (userId && enrollment.userId !== userId) {
        throw new ForbiddenException(
          'You can only update your own enrollments',
        );
      }

      if (
        updateEnrollmentDto.status === 'completed' &&
        !enrollment.completedAt
      ) {
        enrollment.completedAt = new Date();
      }

      Object.assign(enrollment, updateEnrollmentDto);
      return await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update enrollment: ' + error.message,
      );
    }
  }

  async remove(
    id: number,
    userId?: string,
    isInstructor?: boolean,
  ): Promise<void> {
    try {
      const enrollment = await this.findOne(id);

      if (!isInstructor && userId && enrollment.userId !== userId) {
        throw new ForbiddenException(
          'You can only delete your own enrollments',
        );
      }

      await this.enrollmentRepository.remove(enrollment);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to delete enrollment: ' + error.message,
      );
    }
  }

  async checkEnrollment(userId: string, courseId: number): Promise<boolean> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { userId, courseId, status: 'active' },
      });
      return !!enrollment;
    } catch (error) {
      throw new BadRequestException(
        'Failed to check enrollment: ' + error.message,
      );
    }
  }
}
