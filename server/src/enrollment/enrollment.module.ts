import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { enrollmentProviders } from './enrollment.providers';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [EnrollmentController],
  providers: [...enrollmentProviders, EnrollmentService, RolesGuard],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
