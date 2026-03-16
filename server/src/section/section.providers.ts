import { DataSource } from 'typeorm';
import { Section } from './entities/section.entity';

export const sectionProviders = [
  {
    provide: 'SECTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Section),
    inject: ['DATA_SOURCE'],
  },
];
