import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(
    @Inject('SECTION_REPOSITORY')
    private sectionRepository: Repository<Section>,
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    try {
      const section = this.sectionRepository.create(createSectionDto);
      return await this.sectionRepository.save(section);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create section: ' + error.message,
      );
    }
  }

  async findAll(): Promise<Section[]> {
    try {
      return await this.sectionRepository.find({
        relations: ['course'],
        order: { orderIndex: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch sections: ' + error.message,
      );
    }
  }

  async findByCourseId(courseId: number): Promise<Section[]> {
    try {
      return await this.sectionRepository.find({
        where: { courseId },
        relations: ['course', 'contents', 'quizzes'],
        order: { orderIndex: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch course sections: ' + error.message,
      );
    }
  }

  async findOne(id: number): Promise<Section> {
    try {
      const section = await this.sectionRepository.findOne({
        where: { id },
        relations: ['course', 'contents', 'quizzes'],
      });

      if (!section) {
        throw new NotFoundException(`Section with ID ${id} not found`);
      }

      return section;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to fetch section: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    try {
      const section = await this.findOne(id);
      Object.assign(section, updateSectionDto);
      return await this.sectionRepository.save(section);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update section: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const section = await this.findOne(id);
      await this.sectionRepository.remove(section);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to delete section: ' + error.message,
      );
    }
  }

  async verifyCourseOwnership(
    courseId: number,
    instructorId: string,
  ): Promise<boolean> {
    try {
      const section = await this.sectionRepository.findOne({
        where: { courseId },
        relations: ['course'],
      });
      return section?.course?.instructorId === instructorId;
    } catch (error) {
      return false;
    }
  }
}
