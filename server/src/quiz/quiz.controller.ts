import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SimpleAuthGuard } from '../auth/simple-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ROLES } from '../user/roles';
import { SectionService } from '../section/section.service';

@Controller('quizzes')
@UseGuards(SimpleAuthGuard)
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly sectionService: SectionService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @GetUser('sub') instructorId: string,
  ) {
    const section = await this.sectionService.findOne(createQuizDto.sectionId);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only create quizzes for your own courses',
      );
    }

    return this.quizService.create(createQuizDto);
  }

  @Get()
  findAll(@Query('sectionId') sectionId?: string) {
    if (sectionId) {
      return this.quizService.findBySectionId(+sectionId);
    }
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @GetUser('sub') instructorId: string,
  ) {
    const quiz = await this.quizService.findOne(id);
    const section = await this.sectionService.findOne(quiz.sectionId);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only update quizzes of your own courses',
      );
    }

    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.INSTRUCTOR)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('sub') instructorId: string,
  ) {
    const quiz = await this.quizService.findOne(id);
    const section = await this.sectionService.findOne(quiz.sectionId);
    const isOwner = await this.sectionService.verifyCourseOwnership(
      section.courseId,
      instructorId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only delete quizzes of your own courses',
      );
    }

    return this.quizService.remove(id);
  }
}
