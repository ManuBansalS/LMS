import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CourseAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class CourseActionDto {
  @IsEnum(CourseAction)
  action: CourseAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
