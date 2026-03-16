import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Course } from './course/entities/course.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { Section } from './section/entities/section.entity';
import { Quiz } from './quiz/entities/quiz.entity';
import { ContentType } from './content-type/entities/content-type.entity';
import { UserProgress } from './progress/entities/progress.entity';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          User,
          Course,
          Enrollment,
          Section,
          Quiz,
          ContentType,
          UserProgress,
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
