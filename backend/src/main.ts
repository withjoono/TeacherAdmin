import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // CORS 설정 (teacher_admin 프론트엔드 허용)
  app.enableCors({
    origin: [
      // 프로덕션 도메인
      'https://teacher-front.web.app', // TeacherAdmin 프론트엔드
      'https://ts-front-479305.web.app', // Hub 프론트엔드
      'https://www.geobukschool.kr',
      'https://geobukschool.kr',
      // 로컬 개발 환경
      'http://localhost:3019',  // teacher_admin frontend
      'http://localhost:3006',  // StudyArena frontend
    ],
    credentials: true,
  });

  // 글로벌 prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4019;
  await app.listen(port);
  logger.log(`Teacher Admin 백엔드 서버가 포트 ${port}에서 실행 중입니다.`);
}
bootstrap();
