import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma';
import { ClassesModule } from './classes/classes.module';
import { TutorModule } from './tutor/tutor.module';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 인증 (Hub SSO)
    AuthModule,

    // 데이터베이스 (Prisma)
    PrismaModule,

    // 기능 모듈
    ClassesModule,
    TutorModule,
  ],
})
export class AppModule { }

