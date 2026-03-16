import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ROLES } from '../roles';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ default: '' })
  firstname: string;

  @Column({ default: '' })
  lastname: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  current_organisation: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ default: false })
  email_verified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({
    type: 'enum',
    enum: ROLES,
    default: ROLES.STUDENT,
  })
  role: ROLES;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
