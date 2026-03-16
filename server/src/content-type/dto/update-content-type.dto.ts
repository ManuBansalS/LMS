import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateContentTypeDto {
  @IsOptional()
  @IsEnum(['video', 'article', 'quiz', 'assignment', 'resource'])
  type?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}
