import { DataSource } from 'typeorm';
import { UserProgress } from './entities/progress.entity';

export const progressProviders = [
  {
    provide: 'PROGRESS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserProgress),
    inject: ['DATA_SOURCE'],
  },
];
