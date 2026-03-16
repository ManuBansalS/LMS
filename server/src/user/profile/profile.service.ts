import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private userService: UserService) {}

  async getProfile(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user profile without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...profileWithoutPassword } = user;
    return profileWithoutPassword;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already taken by another user
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userService.findByEmail(
        updateProfileDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Check if username is already taken by another user
    if (
      updateProfileDto.username &&
      updateProfileDto.username !== user.username
    ) {
      const allUsers = await this.userService.findAll();
      const userExists = allUsers.find(
        (u) => u.username === updateProfileDto.username && u.id !== userId,
      );
      if (userExists) {
        throw new BadRequestException('Username already in use');
      }
    }

    const updatedUser = await this.userService.update(userId, updateProfileDto);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Return updated profile without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...profileWithoutPassword } = updatedUser;
    return profileWithoutPassword;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isPasswordMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new password and confirm password match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.userService.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}
