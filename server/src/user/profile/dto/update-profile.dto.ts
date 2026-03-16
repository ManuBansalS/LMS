import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { ROLES } from 'src/user/roles';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  current_organisation?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;
}
