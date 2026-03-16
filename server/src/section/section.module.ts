import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';
import { sectionProviders } from './section.providers';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SectionController],
  providers: [...sectionProviders, SectionService, RolesGuard],
  exports: [SectionService],
})
export class SectionModule {}
