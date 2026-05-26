# 선생님앱(TeacherAdmin) 플래너 검사·채점 연동 — Phase 2 구현 계획

작성일: 2026-05-24
대상 저장소: `E:\Dev\github\TeacherAdmin`
연동 방식: **A안 — 크로스 스키마 DB 직접 접근**

---

## 1. 이번 작업으로 구현할 내용

선생님이 StudyPlanner 웹의 `/teacher` 페이지가 아니라 **선생님앱(TeacherAdmin) 안에서** 담당 학생의 플래너를 열람하고, 자유 코멘트와 1~10점 성취도 점수를 부여할 수 있게 한다. 채점 결과는 StudyPlanner와 같은 물리 DB(`geobukschool_dev`)의 `PlannerRating` 테이블에 그대로 기록되므로, Phase 1에서 이미 완성한 학생 앱의 「My Group → 담당 선생님 반」 화면(차트·순위·내 평가)이 추가 작업 없이 그대로 재사용된다.

핵심 산출물은 TeacherAdmin의 학생 상세 화면(`/student-management/detail`)에 **「플래너 검사」 탭**을 추가하고, 그 탭에서 플래너 조회와 코멘트·점수 입력을 처리하는 것이다.

---

## 2. 기존 구현 현황 진단 (TeacherAdmin 실제 코드 확인 결과)

TeacherAdmin은 문서에 적힌 "Next.js 앱"이라는 표현과 달리, 실제로는 **NestJS 백엔드(`backend/`)와 Next.js 16 프론트엔드(`frontend/`)로 분리된 구조**다. 진단 결과를 갈래별로 정리하면 다음과 같다.

| 구성요소 | 현황 | 비고 |
|---|---|---|
| 플래너 검사용 데이터 모델 (PlannerRating, TeacherStudent) | **전무** | `backend/prisma/schema.prisma`에 StudyPlanner 모델이 하나도 없음 |
| 플래너 채점 백엔드 엔드포인트 | **전무** | `tutor` 모듈에 학생 열람용 API는 있으나 플래너 관련 없음 |
| 플래너 검사 화면 | **전무** | 대시보드 "학생 관리" 카드에 `"학생 페이지 접근, 플래너 검사, 쪽지"`라는 **설명 문구만** 존재 |
| 채점(`/grading`) 페이지 | 존재하나 **무관** | 모의고사 OMR 답안 채점 화면이며 플래너와 별개 |
| Prisma 멀티 스키마 기반 | **이미 갖춰짐** | A안 진입 장벽이 낮음 (3장 참조) |

### 2-1. 인증·식별 체계

백엔드는 Hub SSO JWT를 사용한다. 모든 `tutor` 엔드포인트는 `@UseGuards(AuthGuard('jwt'))`로 보호되고, 컨트롤러는 `req.user.jti`(= Hub member ID)를 `teacherId`로 사용한다(`tutor.controller.ts`의 `getHubId`). 즉 **TeacherAdmin은 학생·선생님을 모두 Hub member_id(`auth_member.id`, `VarChar(30)`)로 식별**한다.

선생님↔학생 연결은 Hub의 `mentoring_account_link_tb`(`member_id` ↔ `linked_member_id`)로 검증한다. `tutor.service.ts`의 `verifyStudentAccess(teacherHubId, studentId)`가 이 역할을 하며, 신규 플래너 엔드포인트에서도 그대로 재사용할 수 있다.

### 2-2. 학생 상세 화면 구조 — 탭 추가의 적합성

`frontend/src/app/(dashboard)/student-management/detail/page.tsx`는 이미 다음 탭 구조를 갖추고 있다.

- `overview`(학습 요약) / `assignments`(과제) / `tests`(성적) / `attendance`(출석)
- 우측에 코멘트 사이드 패널(Hub 코멘트 연동)

탭은 `TABS` 배열과 `TabId` 유니온 타입으로 선언되어 있어, **`planner` 탭 하나를 추가하는 형태**로 자연스럽게 확장된다. URL은 `/student-management/detail?id=<Hub member_id>`이며, `id` 쿼리 파라미터가 곧 학생의 Hub member_id다.

---

## 3. A안 실현 가능성 검증 결과

A안(크로스 스키마 DB 직접 접근)은 **기술적으로 즉시 가능**하다. 근거는 다음과 같다.

`backend/prisma/schema.prisma`의 generator에 `previewFeatures = ["multiSchema"]`가 **이미 활성화**되어 있고, datasource는 이미 6개 스키마를 다루고 있다.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["teacher_admin", "hub", "tutorboard", "susi", "jungsi", "mysanggibu"]
}
```

`backend/.env`의 `DATABASE_URL`도 같은 DB를 가리킨다.

```
.../geobukschool_dev?schema=teacher_admin&search_path=teacher_admin,hub,tutorboard,susi,jungsi,mysanggibu
```

즉 StudyPlanner와 **이미 동일한 물리 DB를 공유**하고 있으며, 부족한 것은 단 두 가지다. (1) StudyPlanner의 Postgres 스키마가 `schemas` 배열·`search_path`에 빠져 있다는 점, (2) `PlannerRating`·`TeacherStudent` 등 StudyPlanner 모델이 매핑되어 있지 않다는 점. 둘 다 마이그레이션 없이 스키마 파일 수정만으로 해결된다.

### 3-1. 선행 확인 필요 사항 (PC에서 StudyPlanner 저장소 확인)

본 계획은 TeacherAdmin 저장소만으로 작성되었으므로, 다음 항목은 StudyPlanner 저장소에서 **반드시 먼저 확인**해야 한다. 이 값들이 확정되어야 4장의 Prisma 모델을 정확히 작성할 수 있다.

1. **StudyPlanner의 Postgres 스키마 이름** — TeacherAdmin의 다른 앱 스키마 명명 규칙(`susi`, `jungsi`, `mysanggibu`)을 볼 때 `studyplanner` 또는 유사 이름으로 추정되나, StudyPlanner `prisma/schema.prisma`의 `@@schema(...)` 값으로 확정한다.
2. **`PlannerRating` 테이블의 정확한 컬럼·타입·인덱스** — 특히 점수 컬럼(1~10), 코멘트 컬럼, 학생 식별 컬럼, 채점일/주기 컬럼, 선생님 식별 컬럼.
3. **`TeacherStudent` 테이블 구조** — 선생님과 학생을 각각 어떤 식별자로 저장하는지(Hub member_id인지 `sp_` 접두사 userId인지).
4. **플래너 조회에 필요한 테이블** — 학생 플래너 항목/미션을 담는 테이블(예: `Planner`, `Mission`, `MissionResult`, `DailyScore`)의 이름과 키.
5. **`getOrCreateStudent` 정책** — `sp_` 접두사 userId 생성·매핑 로직 (5장 참조).

---

## 4. 단계별 구현 계획 (A안)

### Step 0 — 선행 확인 (PC, StudyPlanner 저장소)

3-1의 5개 항목을 확정한다. 이 단계 없이 진행하면 4장 모델이 추측 기반이 되어 재작업이 발생한다.

### Step 1 — Prisma 멀티 스키마 확장 (`backend/`)

1. `backend/.env`의 `DATABASE_URL` `search_path`에 StudyPlanner 스키마를 추가한다.
   ```
   search_path=teacher_admin,hub,tutorboard,susi,jungsi,mysanggibu,studyplanner
   ```
2. `backend/prisma/schema.prisma`의 datasource `schemas` 배열에 `"studyplanner"`를 추가한다.
3. StudyPlanner의 필요한 테이블을 `schema.prisma`에 모델로 추가하고 각 모델에 `@@schema("studyplanner")`를 붙인다.
   - **쓰기 필요**: `PlannerRating` (코멘트 + 1~10점 저장)
   - **읽기 필요**: 학생 플래너/미션 테이블, `TeacherStudent`(연동 학생·식별자 매핑 확인용)
   - 컬럼·타입은 StudyPlanner 원본과 **정확히 일치**시킨다(`BigInt`/`Decimal`/`@db.VarChar` 등).
4. 모델명이 TeacherAdmin 기존 모델과 충돌하지 않도록 한다(예: 이미 `auth_member`가 `hub` 스키마에 있으므로 StudyPlanner의 동명 테이블은 매핑하지 않거나 별칭 사용).
5. 크로스 스키마 관계(relation)는 만들지 않고 **스칼라 필드만 매핑 후 서비스 레이어에서 수동 조인**한다. StudyPlanner 내부 관계는 TeacherAdmin에서 필요 없다.
6. `npx prisma generate`로 클라이언트를 재생성한다.

> ⚠️ **주의 — 마이그레이션 안전장치**: TeacherAdmin은 `studyplanner` 스키마의 소유자가 아니다. `package.json`의 `prisma:push`(`prisma db push`)는 **절대 실행하지 않는다.** `db push`는 datasource의 모든 스키마를 동기화하려 하므로 StudyPlanner 테이블을 손상시킬 수 있다. TeacherAdmin에서는 `prisma generate`만 사용하고, `studyplanner` 모델은 "읽기/특정 테이블 쓰기 전용 매핑"으로만 취급한다.

### Step 2 — 백엔드 플래너 채점 모듈 신규 (`backend/src/planner/`)

`tutor` 모듈과 동일한 패턴으로 신규 모듈을 만든다.

- 신규 파일: `planner.module.ts`, `planner.controller.ts`, `planner.service.ts`
- 컨트롤러는 `@Controller('tutor')` 하위 경로 또는 별도 `@Controller('planner')`로 두되, `@UseGuards(AuthGuard('jwt'))`와 `getHubId(req)` 패턴을 동일하게 사용한다.
- 엔드포인트(안):
  - `GET /tutor/students/:studentId/planner?date=&period=` — 학생 플래너 조회
  - `GET /tutor/students/:studentId/planner-ratings` — 기존 채점 이력 조회
  - `POST /tutor/students/:studentId/planner-ratings` — `{ score: 1~10, comment, date/period }` 저장 → `PlannerRating` insert
- 각 핸들러는 먼저 `verifyStudentAccess(teacherHubId, studentId)`로 권한을 검증한다(서비스 헬퍼 재사용 또는 동일 로직 복제).
- 식별자 변환 로직(Hub member_id → StudyPlanner userId)을 서비스에 둔다(5장 참조).
- `backend/src/app.module.ts`의 `imports` 배열에 `PlannerModule`을 등록한다.

### Step 3 — 프론트엔드 API 클라이언트 (`frontend/src/lib/api/`)

- 신규 파일: `frontend/src/lib/api/planner-rating.ts`
  - `getStudentPlanner(studentId, params)`, `getPlannerRatings(studentId)`, `createPlannerRating(studentId, body)`
  - 기존 `authClient`(`./client`)를 그대로 사용 — 토큰 주입·401 갱신 인터셉터가 이미 구성되어 있음.
- `frontend/src/lib/api/index.ts`에 export 추가.

### Step 4 — 「플래너 검사」 탭 추가 (`student-management/detail/page.tsx`)

- `TabId` 유니온 타입에 `"planner"` 추가, `TABS` 배열에 `{ id: "planner", label: "플래너 검사", icon: ... }` 추가.
- `TAB_LABELS`에 `planner: "플래너 검사"` 추가(코멘트 패널 컨텍스트 라벨용).
- `fetchAll`에 플래너 데이터 로드 추가.
- `PlannerTab` 컴포넌트 신규: 플래너 항목 목록, 1~10 점수 입력 UI, 자유 코멘트 입력, 저장 버튼, 기존 채점 이력 표시.
- 탭 콘텐츠 렌더 분기(`activeTab === "planner" && <PlannerTab ... />`) 추가.

### Step 5 — 진입 동선 정리 (선택)

대시보드 "학생 관리" 카드 설명에 이미 "플래너 검사"가 적혀 있으므로 별도 메뉴는 필수가 아니다. 다만 사용성을 위해 `student-management` 목록의 학생 행에서 플래너 검사 탭으로 바로 가는 링크(`?id=...&tab=planner`)를 검토할 수 있다. 이 경우 detail 페이지가 `tab` 쿼리 파라미터를 읽도록 소폭 수정한다.

### Step 6 — 검증

- 프론트엔드 `tsc` 타입체크 0 오류 확인.
- 백엔드 `tsc`/`nest build` 0 오류 확인(`prisma generate` 선행).
- 통합 확인: 선생님 계정으로 TeacherAdmin에서 학생을 채점 → 학생 계정으로 StudyPlanner 「My Group → 담당 선생님 반」 진입 → 차트·순위·「내가 받은 선생님 평가」에 반영되는지 확인.
- StudyPlanner `/teacher` 페이지로 채점했을 때와 **동일한 결과**가 나오는지 교차 검증(같은 `PlannerRating` 테이블을 쓰므로 일치해야 함).

---

## 5. 식별자 정합성 — 가장 중요한 리스크

이 작업의 핵심 위험은 **두 앱의 학생 식별자 체계가 다르다**는 점이다.

- TeacherAdmin: 학생을 **Hub member_id**(`auth_member.id`, `VarChar(30)`)로 식별. detail 페이지의 `?id=` 값도 이것.
- StudyPlanner: 학생을 **`sp_` 접두사가 붙은 userId**로 식별.

`PlannerRating`에 채점을 기록할 때 학생 식별 컬럼이 StudyPlanner의 `sp_` userId여야 Phase 1에서 만든 학생 화면이 그 평가를 읽을 수 있다. 따라서 **저장 직전에 Hub member_id → StudyPlanner userId 변환이 반드시 필요**하다.

변환 경로 후보는 다음과 같으며, Step 0에서 어느 것이 실제인지 확정한다.

1. `TeacherStudent` 테이블이 두 식별자를 함께 보관한다면 이를 매핑 테이블로 사용.
2. StudyPlanner에 Hub member_id ↔ `sp_` userId 매핑 테이블(또는 `getOrCreateStudent`가 생성하는 사용자 레코드)이 별도로 있다면 그것을 사용.
3. 매핑이 없다면, StudyPlanner의 `getOrCreateStudent`와 동일한 정책으로 TeacherAdmin에서도 레코드를 조회/생성.

변환에 실패하면 채점은 저장되지만 학생 화면에 노출되지 않는 **무증상 오류**가 되므로, Step 6 통합 검증에서 반드시 끝단까지 확인한다.

---

## 6. 변경·신규 파일 요약

**백엔드 (`backend/`)**

- 수정: `.env` (`DATABASE_URL` search_path)
- 수정: `prisma/schema.prisma` (datasource `schemas` + StudyPlanner 모델 추가)
- 신규: `src/planner/planner.module.ts`, `src/planner/planner.controller.ts`, `src/planner/planner.service.ts`
- 수정: `src/app.module.ts` (`PlannerModule` 등록)

**프론트엔드 (`frontend/`)**

- 신규: `src/lib/api/planner-rating.ts`
- 수정: `src/lib/api/index.ts` (export 추가)
- 수정: `src/app/(dashboard)/student-management/detail/page.tsx` (`planner` 탭 + `PlannerTab` 컴포넌트)
- 선택 수정: `src/app/(dashboard)/student-management/page.tsx`, dashboard 진입 동선

---

## 7. 배포 안내

1. PC에서 `backend` 디렉터리에서 `npx prisma generate` 실행(StudyPlanner 모델 추가 반영). `prisma db push`는 실행하지 않는다.
2. 백엔드·프론트엔드 빌드 및 타입체크 통과 확인.
3. 커밋·푸시 → CI 자동 배포.
4. 배포 후 5장의 식별자 변환을 포함한 끝단 검증(선생님 채점 → 학생 화면 반영)을 수행한다.

---

## 8. 권장 진행 순서 요약

Phase 1(StudyPlanner)은 이미 완료되어 운영 가능한 상태이므로, 당분간 선생님은 `studyplanner.kr/teacher`로 채점을 계속할 수 있다. Phase 2는 위 Step 0(선행 확인) → Step 1(Prisma) → Step 2(백엔드) → Step 3~4(프론트엔드) → Step 6(검증) 순서로 진행하며, 식별자 정합성(5장)은 전 과정에서 가장 우선해 점검할 항목이다.
