import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course-dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SimpleAuthGuard } from '../auth/simple-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ROLES } from '../user/roles';

@Controller('courses')
@UseGuards(SimpleAuthGuard, RolesGuard)
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Public()
  @Get()
  getAllCourses(
    @Query('title') title?: string,
    @Query('instructorId') instructorId?: string,
    @Query('status') status?: string,
  ) {
    if (title) {
      return this.courseService.findByTitle(title);
    }
    return this.courseService.findAll(instructorId, status);
  }

  @Public()
  @Get('published')
  getPublishedCourses() {
    return this.courseService.getPublishedCourses();
  }

  @Get('my-courses')
  @Roles(ROLES.INSTRUCTOR)
  getInstructorCourses(@GetUser('sub') instructorId: string) {
    return this.courseService.getInstructorCourses(instructorId);
  }

  @Public()
  @Get(':id')
  getCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Post()
  @Roles(ROLES.INSTRUCTOR)
  createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @GetUser('sub') instructorId: string,
  ) {
    return this.courseService.create(createCourseDto, instructorId);
  }

  @Patch(':id')
  @Roles(ROLES.INSTRUCTOR)
  updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @GetUser('sub') instructorId: string,
  ) {
    return this.courseService.update(id, updateCourseDto, instructorId);
  }

  @Delete(':id')
  @Roles(ROLES.INSTRUCTOR)
  deleteCourse(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') instructorId: string,
  ) {
    return this.courseService.remove(id, instructorId);
  }
}
