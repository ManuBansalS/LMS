import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { ContentType } from '../../content-type/entities/content-type.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.sections)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => ContentType, (content) => content.section)
  contents: ContentType[];

  @OneToMany(() => Quiz, (quiz) => quiz.section)
  quizzes: Quiz[];
}
