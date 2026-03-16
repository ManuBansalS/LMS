import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { CourseModule } from '../course/course.module';
import { UserProviders } from '../user/user.providers';
import { courseProviders } from '../course/course.providers';
import { enrollmentProviders } from '../enrollment/enrollment.providers';
import { quizProviders } from '../quiz/quiz.providers';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, CourseModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminGuard,
    ...UserProviders,
    ...courseProviders,
    ...enrollmentProviders,
    ...quizProviders,
  ],
})
export class AdminModule {}
