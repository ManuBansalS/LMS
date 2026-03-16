import { Inject, Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ROLES } from './roles';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findByRole(role: ROLES): Promise<User[]> {
    return this.userRepository.find({ where: { role } });
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.userRepository.find({
      where: [
        { username: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { firstname: Like(`%${query}%`) },
        { lastname: Like(`%${query}%`) },
      ],
    });
  }
}
