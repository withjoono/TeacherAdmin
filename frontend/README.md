# Teacher Admin Dashboard

선생님을 위한 학생 관리 대시보드입니다.

## 기능

### 학생 관리
- 반별 학생 목록 조회
- 학생 추가/삭제
- 반 생성/삭제
- 학생 상세 정보 관리

### 시험 관리
- 새 시험 생성
- 문제 업로드 (Excel/CSV)
- 답안 채점
- 성적 분석

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: NestJS (GB-Back-Nest)
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **UI Components**: Radix UI, shadcn/ui

## 시작하기

### 환경 설정

1. 환경 변수 파일 생성:
```bash
cp .env.example .env.development
```

2. `.env.development` 파일 수정:
```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_FRONT_URL=http://localhost:3001
NODE_ENV=development
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3001)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 백엔드 연동

이 프로젝트는 GB-Back-Nest 백엔드와 연동됩니다.

### 백엔드 실행

```bash
cd ../GB-Back-Nest
npm run start:dev
```

백엔드는 기본적으로 `http://localhost:4001`에서 실행됩니다.

### API 엔드포인트

#### 인증
- `POST /auth/login-with-email` - 이메일 로그인
- `POST /auth/logout` - 로그아웃
- `POST /auth/refresh` - 토큰 갱신
- `GET /auth/me` - 현재 사용자 정보

#### 학생/반 관리
- `GET /mentoring/classes` - 반 목록 조회
- `POST /mentoring/classes` - 반 추가
- `DELETE /mentoring/classes` - 반 삭제
- `GET /mentoring/students` - 학생 목록 조회
- `POST /mentoring/students` - 학생 추가
- `DELETE /mentoring/students/:id` - 학생 삭제

## GB-Front 연동

GB-Front에서 선생님으로 로그인하면 자동으로 이 Teacher Admin 대시보드로 리다이렉트됩니다.

### 설정 방법

GB-Front의 `/mentor` 라우트가 이미 설정되어 있습니다:

```typescript
// GB-Front/src/routes/mentor/index.tsx
// 선생님 로그인 시 http://localhost:3001로 자동 리다이렉트
```

## 프로젝트 구조

```
teacher_Admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # 대시보드 레이아웃
│   │   │   └── page.tsx       # 메인 대시보드
│   │   └── auth/              # 인증 페이지
│   │       └── login/
│   ├── components/            # React 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   └── ui/               # UI 컴포넌트
│   ├── hooks/                # Custom Hooks
│   │   └── use-auth.ts       # 인증 Hook
│   └── lib/                  # 유틸리티
│       ├── api/              # API 클라이언트
│       │   ├── client.ts     # Axios 설정
│       │   ├── auth.ts       # 인증 API
│       │   └── mentoring.ts  # 학생/반 관리 API
│       └── config.ts         # 환경 설정
├── .env.example              # 환경 변수 예시
└── package.json
```

## 개발 가이드

### API 연동 추가하기

1. `src/lib/api/` 에 새 API 파일 생성
2. API 함수 작성
3. React Query를 사용하여 컴포넌트에서 호출

예시:
```typescript
// src/lib/api/exams.ts
export const getExams = async () => {
  const response = await authClient.get('/exams');
  return response.data.data;
};

// 컴포넌트에서 사용
const { data: exams } = useQuery({
  queryKey: ['exams'],
  queryFn: getExams,
});
```

### 새 페이지 추가하기

1. `src/app/(dashboard)/` 에 새 폴더 생성
2. `page.tsx` 파일 생성
3. 사이드바에 링크 추가 (`src/components/layout/sidebar.tsx`)

## 배포

### Vercel 배포

```bash
npm run build
vercel deploy
```

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `NEXT_PUBLIC_API_URL`: 프로덕션 백엔드 URL
- `NEXT_PUBLIC_FRONT_URL`: 프로덕션 프론트엔드 URL

## 라이선스

Private Project
