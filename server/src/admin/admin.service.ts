import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { ROLES } from '../user/roles';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { DashboardStats } from './interfaces/dashboard-stats.interface';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('COURSE_REPOSITORY')
    private readonly courseRepository: Repository<Course>,
    @Inject('ENROLLMENT_REPOSITORY')
    private readonly enrollmentRepository: Repository<Enrollment>,
    @Inject('QUIZ_REPOSITORY')
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  // ─── Authentication ────────────────────────────────────────────────

  async adminLogin(dto: AdminLoginDto) {
    const result = await this.authService.login(dto as any);

    if (result.user.role !== ROLES.ADMIN) {
      throw new ForbiddenException('Access denied. Admin role required.');
    }

    return result;
  }

  // ─── User Management ──────────────────────────────────────────────

  async getAllUsers(search?: string): Promise<User[]> {
    if (search && search.trim()) {
      return this.userService.searchUsers(search);
    }
    return this.userService.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserAdminDto): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const updated = await this.userService.update(id, dto as any);
    return updated as User;
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    return this.userService.remove(id);
  }

  async blockUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    if (user.role === ROLES.ADMIN) {
      throw new ForbiddenException('Cannot block an admin user');
    }
    return (await this.userService.update(id, { is_active: false } as any)) as User;
  }

  async unblockUser(id: string): Promise<User> {
    await this.getUserById(id);
    return (await this.userService.update(id, { is_active: true } as any)) as User;
  }

  // ─── Instructor Management ────────────────────────────────────────

  async getAllInstructors(): Promise<User[]> {
    return this.userService.findByRole(ROLES.INSTRUCTOR);
  }

  async approveInstructor(id: string): Promise<User> {
    const user = await this.getUserById(id);
    if (user.role !== ROLES.INSTRUCTOR) {
      throw new BadRequestException('User is not an instructor');
    }
    return (await this.userService.update(id, { is_active: true } as any)) as User;
  }

  async blockInstructor(id: string): Promise<User> {
    const user = await this.getUserById(id);
    if (user.role !== ROLES.INSTRUCTOR) {
      throw new BadRequestException('User is not an instructor');
    }
    return (await this.userService.update(id, { is_active: false } as any)) as User;
  }

  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    const user = await this.getUserById(instructorId);
    if (user.role !== ROLES.INSTRUCTOR) {
      throw new BadRequestException('User is not an instructor');
    }
    return this.courseRepository.find({
      where: { instructorId },
      relations: ['sections', 'enrollments'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Course Moderation ────────────────────────────────────────────

  async getAllCourses(status?: string): Promise<Course[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.courseRepository.find({
      where,
      relations: ['instructor', 'sections', 'enrollments'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveCourse(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    course.status = 'published';
    return this.courseRepository.save(course);
  }

  async rejectCourse(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    course.status = 'draft';
    return this.courseRepository.save(course);
  }

  async deleteCourse(id: number): Promise<void> {
    const course = await this.courseRepository.findOne({ 
      where: { id },
      relations: ['sections', 'enrollments'] 
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Handled clustered deletes to prevent FK violations
    if (course.enrollments && course.enrollments.length > 0) {
      await this.enrollmentRepository.remove(course.enrollments);
    }
    
    // Quizzes may be attached to sections, those will need to be deleted
    if (course.sections && course.sections.length > 0) {
      for (const section of course.sections) {
         const quizzes = await this.quizRepository.find({ where: { section: { id: section.id } } });
         if (quizzes.length > 0) {
           await this.quizRepository.remove(quizzes);
         }
      }
      // Depending on setup, `courseRepository.remove` might cascade sections. 
      // If it doesn't, we should delete them here, but we will rely on TypeORM's
      // cascade or let course removal delete them if FK is ON DELETE CASCADE.
    }

    await this.courseRepository.remove(course);
  }

  async getCourseStats(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'sections', 'enrollments'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return {
      course: {
        id: course.id,
        title: course.title,
        status: course.status,
        instructor: course.instructor
          ? {
              id: course.instructor.id,
              username: course.instructor.username,
              email: course.instructor.email,
            }
          : null,
      },
      totalSections: course.sections ? course.sections.length : 0,
      totalEnrollments: course.enrollments ? course.enrollments.length : 0,
    };
  }

  // ─── Enrollment Management ────────────────────────────────────────

  async getAllEnrollments(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      relations: ['user', 'course'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async deleteEnrollment(id: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    await this.enrollmentRepository.remove(enrollment);
  }

  // ─── Dashboard ────────────────────────────────────────────────────

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalUsers, totalInstructors, totalCourses, totalEnrollments, totalQuizzes] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { role: ROLES.INSTRUCTOR } }),
        this.courseRepository.count(),
        this.enrollmentRepository.count(),
        this.quizRepository.count(),
      ]);

    return {
      totalUsers,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalQuizzes,
    };
  }
}
