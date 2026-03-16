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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { AdminGuard } from './guards/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { DashboardStats } from './interfaces/dashboard-stats.interface';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Authentication ────────────────────────────────────────────────

  @Public()
  @Post('login')
  login(@Body() adminLoginDto: AdminLoginDto) {
    return this.adminService.adminLogin(adminLoginDto);
  }

  // ─── Dashboard ────────────────────────────────────────────────────

  @Get('dashboard')
  getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  // ─── User Management ──────────────────────────────────────────────

  @Get('users')
  getAllUsers(@Query('search') search?: string) {
    return this.adminService.getAllUsers(search);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this.adminService.updateUser(id, updateUserAdminDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  // ─── Instructor Management ────────────────────────────────────────

  @Get('instructors')
  getAllInstructors() {
    return this.adminService.getAllInstructors();
  }

  @Patch('instructors/:id/approve')
  approveInstructor(@Param('id') id: string) {
    return this.adminService.approveInstructor(id);
  }

  @Patch('instructors/:id/block')
  blockInstructor(@Param('id') id: string) {
    return this.adminService.blockInstructor(id);
  }

  @Get('instructors/:id/courses')
  getInstructorCourses(@Param('id') id: string) {
    return this.adminService.getInstructorCourses(id);
  }

  // ─── Course Moderation ────────────────────────────────────────────

  @Get('courses')
  getAllCourses(@Query('status') status?: string) {
    return this.adminService.getAllCourses(status);
  }

  @Get('courses/:id/stats')
  getCourseStats(@Param('id') id: string) {
    return this.adminService.getCourseStats(+id);
  }

  @Patch('courses/:id/approve')
  approveCourse(@Param('id') id: string) {
    return this.adminService.approveCourse(+id);
  }

  @Patch('courses/:id/reject')
  rejectCourse(@Param('id') id: string) {
    return this.adminService.rejectCourse(+id);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(+id);
  }

  // ─── Enrollment Management ────────────────────────────────────────

  @Get('enrollments')
  getAllEnrollments() {
    return this.adminService.getAllEnrollments();
  }

  @Delete('enrollments/:id')
  deleteEnrollment(@Param('id') id: string) {
    return this.adminService.deleteEnrollment(+id);
  }
}
