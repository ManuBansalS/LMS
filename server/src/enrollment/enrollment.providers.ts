import { DataSource } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';

export const enrollmentProviders = [
  {
    provide: 'ENROLLMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Enrollment),
    inject: ['DATA_SOURCE'],
  },
];
