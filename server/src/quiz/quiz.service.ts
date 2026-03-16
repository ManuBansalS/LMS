import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @Inject('QUIZ_REPOSITORY')
    private quizRepository: Repository<Quiz>,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    try {
      const quiz = this.quizRepository.create(createQuizDto);
      return await this.quizRepository.save(quiz);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to create quiz: ' + message);
    }
  }

  async findAll(): Promise<Quiz[]> {
    try {
      return await this.quizRepository.find({
        relations: ['section'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to fetch quizzes: ' + message);
    }
  }

  async findBySectionId(sectionId: number): Promise<Quiz[]> {
    try {
      return await this.quizRepository.find({
        where: { sectionId },
        relations: ['section'],
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        'Failed to fetch section quizzes: ' + message,
      );
    }
  }

  async findOne(id: number): Promise<Quiz> {
    try {
      const quiz = await this.quizRepository.findOne({
        where: { id },
        relations: ['section'],
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }

      return quiz;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to fetch quiz: ' + message);
    }
  }

  async update(id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    try {
      const quiz = await this.findOne(id);
      Object.assign(quiz, updateQuizDto);
      return await this.quizRepository.save(quiz);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to update quiz: ' + message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const quiz = await this.findOne(id);
      await this.quizRepository.remove(quiz);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Failed to delete quiz: ' + message);
    }
  }
}
