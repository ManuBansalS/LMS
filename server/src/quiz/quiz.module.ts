import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { quizProviders } from './quiz.providers';
import { AuthModule } from '../auth/auth.module';
import { SectionModule } from '../section/section.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, AuthModule, SectionModule],
  controllers: [QuizController],
  providers: [...quizProviders, QuizService, RolesGuard],
  exports: [QuizService],
})
export class QuizModule {}
