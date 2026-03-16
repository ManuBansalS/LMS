import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SimpleAuthGuard } from './simple-auth.guard';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: 'MY_SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
  ],
  providers: [AuthService, SimpleAuthGuard],
  controllers: [AuthController],
  exports: [JwtModule, SimpleAuthGuard, AuthService],
})
export class AuthModule {}
