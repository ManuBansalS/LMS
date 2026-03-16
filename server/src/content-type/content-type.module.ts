import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { ContentTypeController } from './content-type.controller';
import { ContentTypeService } from './content-type.service';
import { contentTypeProviders } from './content-type.providers';
import { AuthModule } from '../auth/auth.module';
import { SectionModule } from '../section/section.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, AuthModule, SectionModule],
  controllers: [ContentTypeController],
  providers: [...contentTypeProviders, ContentTypeService, RolesGuard],
  exports: [ContentTypeService],
})
export class ContentTypeModule {}
