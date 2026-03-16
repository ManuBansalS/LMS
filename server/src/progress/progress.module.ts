import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { progressProviders } from './progress.providers';
import { enrollmentProviders } from '../enrollment/enrollment.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProgressController],
  providers: [...progressProviders, ...enrollmentProviders, ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
