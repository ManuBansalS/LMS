import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ContentType } from './entities/content-type.entity';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';

@Injectable()
export class ContentTypeService {
  constructor(
    @Inject('CONTENT_TYPE_REPOSITORY')
    private contentTypeRepository: Repository<ContentType>,
  ) {}

  async create(
    createContentTypeDto: CreateContentTypeDto,
  ): Promise<ContentType> {
    try {
      const contentType =
        this.contentTypeRepository.create(createContentTypeDto);
      return await this.contentTypeRepository.save(contentType);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create content: ' + error.message,
      );
    }
  }

  async findAll(): Promise<ContentType[]> {
    try {
      return await this.contentTypeRepository.find({
        relations: ['section'],
        order: { orderIndex: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch contents: ' + error.message,
      );
    }
  }

  async findBySectionId(sectionId: number): Promise<ContentType[]> {
    try {
      return await this.contentTypeRepository.find({
        where: { sectionId },
        relations: ['section'],
        order: { orderIndex: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch section contents: ' + error.message,
      );
    }
  }

  async findByType(type: string): Promise<ContentType[]> {
    try {
      return await this.contentTypeRepository.find({
        where: { type },
        relations: ['section'],
        order: { orderIndex: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch contents by type: ' + error.message,
      );
    }
  }

  async findOne(id: number): Promise<ContentType> {
    try {
      const contentType = await this.contentTypeRepository.findOne({
        where: { id },
        relations: ['section'],
      });

      if (!contentType) {
        throw new NotFoundException(`Content type with ID ${id} not found`);
      }

      return contentType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to fetch content: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateContentTypeDto: UpdateContentTypeDto,
  ): Promise<ContentType> {
    try {
      const contentType = await this.findOne(id);
      Object.assign(contentType, updateContentTypeDto);
      return await this.contentTypeRepository.save(contentType);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update content: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const contentType = await this.findOne(id);
      await this.contentTypeRepository.remove(contentType);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to delete content: ' + error.message,
      );
    }
  }
}
