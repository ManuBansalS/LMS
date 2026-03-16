import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/**
 * @name AuthService
 * @summary This service interacts with the UserService to manage user data and uses JwtService to generate JWT tokens for authenticated users. It also handles password hashing and validation using bcrypt.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * @name register
   * @summary This method registers a new user. It first checks if a user with the provided email already exists. If so, it throws a BadRequestException. If not, it hashes the user's password using bcrypt and creates a new user in the database. Finally, it generates a JWT token for the newly registered user and returns it along with the user's information.
   * @param {RegisterDto} dto - The data transfer object containing the user's registration information.
   * @returns An object containing a success message, the generated JWT token, and the user's information.
   * @throws {BadRequestException} If a user with the provided email already exists.
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    return {
      message: 'User registered successfully',
      token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        role: newUser.role,
      },
    };
  }

  /**
   * @name login
   * @summary This method handles user login. It first checks if a user with the provided email exists. If not, it throws an UnauthorizedException. If the user exists, it compares the provided password with the hashed password stored in the database using bcrypt. If the passwords match, it generates a JWT token for the user and returns it along with the user's information.
   * @param {RegisterDto} dto - The data transfer object containing the user's login information.
   * @returns An object containing the generated JWT token and the user's information.
   * @throws {UnauthorizedException} If the provided credentials are invalid.
   */
  async login(dto: RegisterDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
    };
  }

  // TODO: This should probably be removed or should be restricted to admin users only
  async getUsers() {
    return this.usersService.findAll();
  }

  /**
   * @name refreshToken
   * @summary Generate a fresh JWT for the given user ID by re-reading
   * the user's current role (useful after their permissions change).
   * The controller will typically call this when a role update occurs.
   */
  async refreshToken(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
    };
  }
}
