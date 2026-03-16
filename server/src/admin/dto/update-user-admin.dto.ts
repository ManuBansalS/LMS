import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ROLES } from '../../user/roles';

export class UpdateUserAdminDto {
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
  username?: string;

  @IsOptional()
  @IsString()
  current_organisation?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
