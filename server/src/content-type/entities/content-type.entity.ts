import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Section } from '../../section/entities/section.entity';

@Entity('content_types')
export class ContentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sectionId: number;

  @Column({
    type: 'enum',
    enum: ['video', 'article', 'quiz', 'assignment', 'resource'],
  })
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  url: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: 0 })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Section, (section) => section.contents)
  @JoinColumn({ name: 'sectionId' })
  section: Section;
}
