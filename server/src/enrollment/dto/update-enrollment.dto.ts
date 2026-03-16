import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(['active', 'completed', 'dropped'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}
