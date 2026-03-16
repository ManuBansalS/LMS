import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ContentTypeService } from './content-type.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { SimpleAuthGuard } from '../auth/simple-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ROLES } from '../user/roles';
import { SectionService } from '../section/section.service';

@Controller('content-types')
@UseGuards(SimpleAuthGuard)
export class ContentTypeController {
  constructor(
    private readonly contentTypeService: ContentTypeService,
    private readonly sectionService: SectionService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async create(
    @Body() createContentTypeDto: CreateContentTypeDto,
    @GetUser('sub') instructorId: string,
  ) {
    const section = await this.sectionService.findOne(
      createContentTypeDto.sectionId,
    );
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only create content for your own courses',
      );
    }

    return this.contentTypeService.create(createContentTypeDto);
  }

  @Get()
  findAll(
    @Query('sectionId') sectionId?: string,
    @Query('type') type?: string,
  ) {
    if (sectionId) {
      return this.contentTypeService.findBySectionId(+sectionId);
    }
    if (type) {
      return this.contentTypeService.findByType(type);
    }
    return this.contentTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contentTypeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentTypeDto: UpdateContentTypeDto,
    @GetUser('sub') instructorId: string,
  ) {
    const content = await this.contentTypeService.findOne(id);
    const section = await this.sectionService.findOne(content.sectionId);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only update content of your own courses',
      );
    }

    return this.contentTypeService.update(id, updateContentTypeDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') instructorId: string,
  ) {
    const content = await this.contentTypeService.findOne(id);
    const section = await this.sectionService.findOne(content.sectionId);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only delete content of your own courses',
      );
    }

    return this.contentTypeService.remove(id);
  }
}
