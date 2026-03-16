import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateContentTypeDto {
  @IsNotEmpty()
  @IsNumber()
  sectionId: number;

  @IsNotEmpty()
  @IsEnum(['video', 'article', 'quiz', 'assignment', 'resource'])
  type: string;

  @IsNotEmpty()
  @IsString()
  title: string;

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
