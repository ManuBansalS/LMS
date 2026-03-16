import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockUserService = {};
  const mockAuthService = {};
  const mockRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: 'USER_REPOSITORY', useValue: mockRepository },
        { provide: 'COURSE_REPOSITORY', useValue: mockRepository },
        { provide: 'ENROLLMENT_REPOSITORY', useValue: mockRepository },
        { provide: 'QUIZ_REPOSITORY', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
