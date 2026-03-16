import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { SimpleAuthGuard } from '../auth/simple-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('progress')
@UseGuards(SimpleAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  createOrUpdate(
    @Body() createProgressDto: CreateProgressDto,
    @GetUser('sub') userId: string,
  ) {
    return this.progressService.createOrUpdate(userId, createProgressDto);
  }

  @Post('complete/:contentId')
  markComplete(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body('courseId') courseId: number,
    @Body('sectionId') sectionId: number,
    @GetUser('sub') userId: string,
  ) {
    return this.progressService.markContentComplete(
      userId,
      contentId,
      courseId,
      sectionId,
    );
  }

  @Get('course/:courseId')
  getCourseProgress(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser('sub') userId: string,
  ) {
    return this.progressService.getUserCourseProgress(userId, courseId);
  }

  @Get('all')
  getAllProgress(@GetUser('sub') userId: string) {
    return this.progressService.getUserAllProgress(userId);
  }

  @Get('content/:contentId')
  getContentProgress(
    @Param('contentId', ParseIntPipe) contentId: number,
    @GetUser('sub') userId: string,
  ) {
    return this.progressService.getContentProgress(userId, contentId);
  }

  @Delete('course/:courseId')
  resetCourseProgress(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser('sub') userId: string,
  ) {
    return this.progressService.resetCourseProgress(userId, courseId);
  }
}
