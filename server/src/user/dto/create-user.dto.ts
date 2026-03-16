import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ROLES } from '../roles';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  current_organisation?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsEnum(ROLES)
  @IsOptional()
  role?: ROLES;
}
