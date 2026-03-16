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
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SimpleAuthGuard } from '../auth/simple-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ROLES } from '../user/roles';

@Controller('sections')
@UseGuards(SimpleAuthGuard)
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }

  @Get()
  findAll(@Query('courseId') courseId?: string) {
    if (courseId) {
      return this.sectionService.findByCourseId(+courseId);
    }
    return this.sectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
    @GetUser('sub') instructorId: string,
  ) {
    const section = await this.sectionService.findOne(id);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only update sections of your own courses',
      );
    }

    return this.sectionService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') instructorId: string,
  ) {
    const section = await this.sectionService.findOne(id);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only delete sections of your own courses',
      );
    }

    return this.sectionService.remove(id);
  }
}
