import { DataSource } from 'typeorm';
import { ContentType } from './entities/content-type.entity';

export const contentTypeProviders = [
  {
    provide: 'CONTENT_TYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ContentType),
    inject: ['DATA_SOURCE'],
  },
];
