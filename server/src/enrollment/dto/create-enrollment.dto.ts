import { IsOptional, IsNotEmpty, IsNumber, IsString } from 'class-validator';
 
export class CreateEnrollmentDto {
  @IsOptional()
  @IsString()
  userId: string;
 
  @IsNotEmpty()
  @IsNumber()
  courseId: number;
}