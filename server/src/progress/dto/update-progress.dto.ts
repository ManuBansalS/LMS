import { IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}
