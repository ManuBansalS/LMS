import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ROLES } from '../../user/roles';

export class RegisterDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  current_organisation?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;
}
