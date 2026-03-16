import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course-dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @Inject('COURSE_REPOSITORY')
    private courseRepository: Repository<Course>,
    @Inject('SECTION_REPOSITORY')
    private sectionRepository: Repository<any>,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<Course> {
    try {
      const { sections, ...courseData } = createCourseDto;

      const course = this.courseRepository.create({
        ...courseData,
        instructorId,
        status: createCourseDto.status || 'draft',
      });

      const savedCourse = await this.courseRepository.save(course);

      if (sections && sections.length > 0) {
        const sectionEntities = sections.map((section, index) =>
          this.sectionRepository.create({
            title: section.title,
            description: section.description,
            videoUrl: section.videoUrl,
            orderIndex: section.orderIndex ?? index,
            course: savedCourse,
          }),
        );
        await this.sectionRepository.save(sectionEntities);
      }

      return this.findOne(savedCourse.id);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create course: ' + error.message,
      );
    }
  }

  async findAll(instructorId?: string, status?: string): Promise<Course[]> {
    try {
      const where: any = {};

      if (instructorId) {
        where.instructorId = instructorId;
      }

      if (status) {
        where.status = status;
      } else if (!instructorId) {
        where.status = 'published';
      }

      return await this.courseRepository.find({
        where,
        relations: ['instructor', 'sections'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch courses: ' + error.message,
      );
    }
  }

  async findOne(id: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['instructor', 'sections', 'enrollments'],
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch course: ' + error.message);
    }
  }

  async findByTitle(title: string): Promise<Course[]> {
    try {
      return await this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.instructor', 'instructor')
        .leftJoinAndSelect('course.sections', 'sections')
        .where('course.title LIKE :title', { title: `%${title}%` })
        .andWhere('course.status = :status', { status: 'published' })
        .orderBy('course.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw new BadRequestException(
        'Failed to search courses: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    instructorId: string,
  ): Promise<Course> {
    try {
      const course = await this.findOne(id);

      if (course.instructorId !== instructorId) {
        throw new ForbiddenException('You can only update your own courses');
      }

      Object.assign(course, updateCourseDto);
      return await this.courseRepository.save(course);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update course: ' + error.message,
      );
    }
  }

  async remove(id: number, instructorId: string): Promise<void> {
    try {
      const course = await this.findOne(id);

      if (course.instructorId !== instructorId) {
        throw new ForbiddenException('You can only delete your own courses');
      }

      await this.courseRepository.remove(course);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to delete course: ' + error.message,
      );
    }
  }

  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    return this.findAll(instructorId);
  }

  async getPublishedCourses(): Promise<Course[]> {
    return this.findAll(undefined, 'published');
  }
}
