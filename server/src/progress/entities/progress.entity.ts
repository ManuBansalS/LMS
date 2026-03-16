import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ContentType } from '../../content-type/entities/content-type.entity';

@Entity('user_progress')
@Unique(['userId', 'contentId'])
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  contentId: number;

  @Column()
  courseId: number;

  @Column()
  sectionId: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'int', default: 0 })
  timeSpent: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ContentType)
  @JoinColumn({ name: 'contentId' })
  content: ContentType;
}
