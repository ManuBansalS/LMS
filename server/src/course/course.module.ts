import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { courseProviders } from './course.providers';
import { sectionProviders } from '../section/section.providers';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CourseController],
  providers: [
    ...courseProviders,
    ...sectionProviders,
    CourseService,
    RolesGuard,
  ],
  exports: [CourseService],
})
export class CourseModule {}
