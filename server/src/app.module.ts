import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './user/profile/profile.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { SectionModule } from './section/section.module';
import { QuizModule } from './quiz/quiz.module';
import { ContentTypeModule } from './content-type/content-type.module';
import { ProgressModule } from './progress/progress.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProfileModule,
    CourseModule,
    EnrollmentModule,
    SectionModule,
    QuizModule,
    ContentTypeModule,
    ProgressModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
