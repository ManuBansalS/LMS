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
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { SimpleAuthGuard } from '../auth/simple-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ROLES } from '../user/roles';

@Controller('enrollments')
@UseGuards(SimpleAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @Roles(ROLES.STUDENT, ROLES.INSTRUCTOR)
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @GetUser('sub') userId: string,
  ) {
    createEnrollmentDto.userId = userId;
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @GetUser('sub') currentUserId?: string,
    @GetUser('role') role?: ROLES,
  ) {
    if (userId) {
      if (role !== ROLES.INSTRUCTOR && userId !== currentUserId) {
        return this.enrollmentService.findByUserId(currentUserId!);
      }
      return this.enrollmentService.findByUserId(userId);
    }
    if (courseId) {
      return this.enrollmentService.findByCourseId(+courseId);
    }
    return this.enrollmentService.findByUserId(currentUserId!);
  }

  @Get('check/:courseId')
  @Roles(ROLES.STUDENT, ROLES.INSTRUCTOR)
  checkEnrollment(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser('sub') userId: string,
  ) {
    return this.enrollmentService.checkEnrollment(userId, courseId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') userId: string,
    @GetUser('role') role: ROLES,
  ) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @GetUser('sub') userId: string,
    @GetUser('role') role: ROLES,
  ) {
    const isInstructor = role === ROLES.INSTRUCTOR;
    return this.enrollmentService.update(
      id,
      updateEnrollmentDto,
      isInstructor ? undefined : userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') userId: string,
    @GetUser('role') role: ROLES,
  ) {
    const isInstructor = role === ROLES.INSTRUCTOR;
    return this.enrollmentService.remove(id, userId, isInstructor);
  }
}
