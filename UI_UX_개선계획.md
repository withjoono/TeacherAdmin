# 선생님앱(TeacherAdmin) UI/UX 디자인 개선 계획

작성일: 2026-05-24
대상: `E:\Dev\github\TeacherAdmin\frontend` (Next.js 16 + React 19 + Tailwind v4)
접근 방식: **디자인 시스템 단일화 → 공통 컴포넌트 정비 → 화면 재정리**

---

## 1. 평가 대상 — 기능 및 화면 구성

선생님앱은 학원/교사가 학생을 관리하는 어드민 도구로, 상단 네비게이션 + 단일 콘텐츠 영역 구조다. 현재 19개 페이지가 다음과 같이 구성되어 있다.

| 영역 | 페이지 | 기능 |
|---|---|---|
| 홈 | `dashboard` | 통계 카드 5개 + 관리 메뉴 카드 8개 + 최근 활동 |
| 클래스 | `class-management` | 아레나 클래스 생성·멤버·초대코드 |
| 클래스 | `class-management/stats` | 학습 통계 |
| 클래스 | `class-management/students` | 학생 일괄 등록 |
| 학생 | `student-management` | 연동 학생 목록·반 배정·대리접속 |
| 학생 | `student-management/detail` | 학생 상세(요약/과제/성적/출석/플래너 검사) + 코멘트 |
| 수업 | `curriculum-management` | 수업 계획 (+ `_components` 3종) |
| 수업 | `lesson-records` | 수업 기록 |
| 수업 | `attendance` | 출결 관리 |
| 시험 | `exam-management` · `exams` · `exams/new` | 시험 관리 (**중복 3개**) |
| 시험 | `question-upload` · `questions/upload` | 문제 업로드 (**중복 2개**) |
| 시험 | `grading` · `grading-management` | 채점 관리 (**중복 2개**) |
| 과제 | `assignment-management` | 과제 출제·제출·채점 |
| 상담 | `comments` | 비공개 코멘트 |
| 상담 | `parent-management` | 학부모 관리 |

기능 자체는 어드민으로서 필요한 것을 대체로 갖추고 있다. 문제는 기능이 아니라 **그것을 담는 디자인의 일관성·완성도**에 있다.

---

## 2. 핵심 진단 — 무엇이 문제인가

한마디로, **디자인 시스템은 존재하지만 아무도 그것을 일관되게 쓰지 않는다.** 화면마다 스타일을 만드는 방식이 다르고, 그 결과 같은 앱 안에서 페이지마다 다른 제품처럼 보인다.

### 2-1. 스타일링 체계가 3중으로 공존

같은 코드베이스 안에 서로 다른 스타일링 방식이 셋 섞여 있다.

1. **`gb-*` 디자인 시스템 CSS** — `src/styles/design-system/`에 토스 스타일의 완성도 있는 시스템(버튼·카드·뱃지·모달·그리드·빈상태 등 60여 개 클래스)이 있고, `class-management`·`attendance`·`comments` 등 13개 페이지가 사용한다.
2. **shadcn 토큰 + Tailwind 유틸리티** — `globals.css`가 `--primary`·`--card`·`--muted-foreground` 등 별도 토큰을 정의하고, `dashboard`·`student detail`·`grading` 등 신규 페이지가 `bg-card`·`text-muted-foreground` 같은 유틸리티로 사용한다.
3. **인라인 `style={{}}`** — 거의 모든 페이지가 수십~100개 이상의 인라인 스타일 객체를 직접 박아 쓴다.

인라인 스타일 사용량(파일별 `style={{` 등장 횟수)만 봐도 심각하다.

```
attendance            107
exam-management        83
assignment-management  80
class-management       75
grading-management     66
curriculum-management  55
sidebar                49
question-upload        47
comments               47
...
```

즉 한 페이지가 `gb-*` 클래스 + 인라인 스타일 + (경우에 따라) Tailwind 유틸리티를 동시에 쓴다. 디자인을 바꾸려면 같은 값을 세 군데에서 따로 고쳐야 하고, 그래서 아무도 제대로 못 고친다.

### 2-2. 디자인 토큰이 이중화되어 있다

색·간격·반경·타이포가 두 벌 존재하며 값도 다르다.

- `globals.css` (shadcn 계열): `--primary: #3f8efc`, `--radius: 0.5rem`, 색상은 slate 계열.
- `design-system/tokens` (토스 계열): `--color-primary`, `--space-1~20`, `--radius-xs~2xl`, `--text-xs~4xl`, 색상은 `#191F28` 계열.

두 토큰 모두 `layout.tsx`에서 import되어 살아 있다. 어떤 컴포넌트는 `var(--foreground)`(globals)를, 다른 컴포넌트는 `var(--color-text)`(design-system)를 쓴다. 같은 "본문 텍스트 색"이 화면마다 다른 변수에서 나온다.

### 2-3. 공통 컴포넌트도 두 벌

버튼·카드·인풋 같은 공통 컴포넌트가 `@/components/ui/*`(shadcn 이식본, 4개 파일에서 사용)와 `geobuk-shared/ui`(공유 패키지, 7개 파일에서 사용) 두 곳에 따로 있다. 같은 "버튼"이 페이지마다 다른 구현에서 온다.

### 2-4. 폰트가 어긋나 한글이 의도한 서체로 안 나온다

`layout.tsx`는 영문 전용 **Geist**를 로드하고, `design-tokens.css`는 한글용 **Pretendard**를 로드한다. 그런데 `globals.css`의 `body { font-family: var(--font-sans) }`가 마지막에 적용되어 Geist가 이긴다. Geist는 한글 글리프가 없어 한글은 OS 기본 폰트로 폴백된다 — Pretendard를 받아놓고 못 쓰는 상태다.

### 2-5. 의도치 않은 다크모드

`globals.css`에 `@media (prefers-color-scheme: dark)`가 있어 OS가 다크모드인 사용자에게는 shadcn 토큰 기반 페이지(`dashboard`·`detail` 등)가 어두운 배경으로 바뀐다. 반면 `gb-*` 토큰에는 다크 대응이 없어 그 페이지들은 밝게 남는다. 결과적으로 **OS 다크모드 사용자는 한 앱 안에서 어두운 페이지와 밝은 페이지를 오간다.** 어드민 도구에 다크모드가 꼭 필요하지 않다면 이 미디어쿼리는 제거하는 편이 안전하다.

### 2-6. 레이아웃 — 여백·정렬·그리드가 깨진다

대시보드 화면 기준으로 다음이 한눈에 보인다.

- **콘텐츠 최대 너비(max-width) 컨테이너가 없다.** 본문이 화면 끝까지 늘어나 와이드 모니터에서 카드가 과도하게 길어진다.
- **통계 카드 그리드가 깨진다.** 5개 카드를 `lg:grid-cols-5`로 의도했으나 실제로는 2열로 떨어지고, 카드 높이가 눌려 숫자·아이콘이 어색하게 배치된다.
- **관리 메뉴 카드가 카드가 아니라 얇은 줄(row)처럼 보인다.** 카드 그리드 의도(`lg:grid-cols-4`)와 실제 렌더가 다르다.
- **여백 충돌.** "선생님 대시보드" 제목이 좌측 끝에 붙고, "최근 활동" 제목이 위 카드와 거의 맞닿는다. 섹션 간 수직 리듬이 없다.

### 2-7. 네비게이션

- 파일명은 `sidebar.tsx`이지만 실제로는 **상단 바**다. 명칭과 구현이 어긋난다.
- 데스크톱 네비는 `@media (max-width: 1023px)`에서 사라지고 햄버거만 남는다. **태블릿~좁은 노트북(약 1024px 미만)에서는 메뉴가 통째로 숨는다.** 어드민 도구에는 부적절한 브레이크포인트다.
- 상단 바 전체가 인라인 스타일로만 작성되어 있고, 디자인 시스템에 이미 `.gb-header` 세트가 있는데도 쓰지 않는다.
- 대시보드의 메뉴 카드 구성과 상단 네비의 메뉴 구성이 1:1로 맞지 않는다(`lesson-records`·`stats` 등은 대시보드에 없음). 정보 구조(IA)가 두 군데에서 따로 논다.

### 2-8. 중복 페이지와 미완성 화면

- 시험(`exam-management`/`exams`/`exams/new`), 채점(`grading`/`grading-management`), 문제 업로드(`question-upload`/`questions/upload`) — **세 기능이 각각 중복 페이지**를 가진다. 어떤 것이 진짜인지 코드만으로 알기 어렵다.
- `exams`·`exams/new`·`grading-management`·`question-upload`·`questions/upload` 등은 목(mock)·더미 데이터로 채워진 미완성 화면이다.
- 페이지 제목 표기도 두 가지다 — 일부는 `<Header title="...">` 컴포넌트, 일부는 `<h1 className="gb-page-title">`. 제목의 위치·크기·여백이 페이지마다 다르다.

### 2-9. 상태 표현(빈 상태·로딩·에러)이 제각각

- 로딩 스피너가 페이지마다 다르게 구현된다 — `class-management`는 인라인 `animation: "spin..."`(전역 `spin` 키프레임이 없어 **회전하지 않을 수 있음**), `login`은 `<style>` 태그에 키프레임을 직접 선언, `detail`은 lucide `Loader2 animate-spin`.
- 빈 상태(empty state)는 디자인 시스템에 `.gb-empty-state`가 있는데도 페이지마다 별도 마크업으로 만든다.
- 에러 처리는 대부분 `alert()` 또는 `console.error`로, 사용자에게 보이는 일관된 피드백이 없다.

---

## 3. 개선 계획 — 디자인 시스템 단일화 우선

개별 화면을 먼저 손대면 또 다른 변형이 하나 늘 뿐이다. **단일한 기준(토큰·컴포넌트)을 먼저 세우고**, 그 기준으로 화면을 옮기는 순서로 진행한다. 네 단계로 나눈다.

### Phase A — 디자인 토큰 단일화 (기반)

목표: 색·간격·반경·타이포·그림자의 **단일 출처(single source of truth)**를 정한다.

1. **토큰 한 벌로 통일.** 두 토큰 세트 중 하나를 정본으로 채택한다. 권장은 이미 토스 스타일로 체계가 잡힌 `design-system/tokens` (`--color-*`, `--space-*`, `--radius-*`, `--text-*`)다. `globals.css`의 shadcn 토큰은 정본 토큰을 참조하도록 별칭(alias) 처리하거나 제거한다.
2. **Tailwind v4 `@theme`를 정본 토큰에 연결.** `@theme inline`이 정본 CSS 변수를 가리키게 해, Tailwind 유틸리티(`bg-primary` 등)와 `gb-*` 클래스가 **같은 값**을 쓰게 한다.
3. **폰트 확정.** 본문 서체를 Pretendard로 단일화한다. `body`의 `font-family`가 한 곳에서만 정의되도록 정리하고, Geist는 코드/숫자 등 한정 용도로만 두거나 제거한다. 한글이 Pretendard로 렌더되는지 확인한다.
4. **다크모드 정책 결정.** 어드민 도구로서 라이트 단일을 권장. `prefers-color-scheme: dark` 미디어쿼리를 제거하거나, 유지한다면 `gb-*` 토큰까지 다크 변수를 갖추어 **전 화면이 함께** 전환되게 한다.
5. 전역 `*` 리셋 규칙이 두 파일(`globals.css`, `components.css`)에 중복 — 하나로 합친다.

산출물: 정리된 토큰 파일 1세트, 토큰↔Tailwind 연결, 폰트·다크모드 정책 확정.

### Phase B — 공통 컴포넌트·레이아웃 정비

목표: 모든 화면이 **같은 부품**으로 조립되게 한다.

1. **컴포넌트 라이브러리 일원화.** `@/components/ui`와 `geobuk-shared/ui` 중 하나를 표준으로 정한다. 여러 앱이 공유하는 `geobuk-shared`를 표준으로 삼고, 부족한 컴포넌트만 보강하는 방향을 권장한다.
2. **표준 컴포넌트 셋 확정·문서화**: `Button`, `Card`, `Input`/`Select`/`Textarea`, `Table`, `Badge`, `Modal`, `Tabs`, `EmptyState`, `Spinner`/`Skeleton`, `Toast`. 각각 정본 토큰만 사용.
3. **앱 셸(AppShell) 정립.** `sidebar.tsx`(실제로는 상단 바)를 디자인 시스템의 `.gb-header` 세트 기반으로 재작성하고, 인라인 스타일을 걷어낸다. 파일명도 역할에 맞게 정리(`top-nav` 또는 `app-header`).
4. **`PageHeader` 컴포넌트 단일화.** `<Header>` 컴포넌트와 `gb-page-title` 두 패턴을 하나로 통합 — 제목·설명·우측 액션 슬롯을 가진 표준 헤더.
5. **`PageContainer` 도입.** 콘텐츠 최대 너비(예: 1080~1280px)·좌우 패딩·섹션 수직 리듬을 한 컴포넌트가 책임지게 해, 페이지마다 `paddingTop` 인라인 지정하는 일을 없앤다.
6. **상태 컴포넌트 표준화.** 로딩(`Spinner`/`Skeleton`), 빈 상태(`EmptyState`), 에러 배너를 표준 컴포넌트로 만들어 `alert()`·제각각 스피너를 대체한다.

산출물: 표준 컴포넌트 셋 + `AppShell`/`PageHeader`/`PageContainer`/상태 컴포넌트.

### Phase C — 화면 재정리 (페이지 마이그레이션)

목표: 모든 페이지를 표준 부품으로 다시 조립하고, 인라인 스타일·중복을 제거한다.

1. **정보 구조(IA) 확정.** 상단 네비와 대시보드 메뉴 카드가 **동일한 메뉴 트리**를 쓰도록 맞춘다.
2. **중복 페이지 정리.** 시험·채점·문제 업로드 각 쌍에서 정본 1개만 남기고 나머지는 제거하거나 리다이렉트. 라우트 정리.
3. **목·더미 데이터 화면 처리.** 미완성 화면은 실제 데이터 연결 또는 명시적 "준비 중" 상태로 통일.
4. **페이지별 마이그레이션** — 인라인 스타일 사용량이 많은 순으로(아래 6장 체크리스트) `gb-*`/인라인 혼용을 표준 컴포넌트로 치환. 페이지당 인라인 `style={{}}` 0개를 목표로 한다.
5. **반응형 점검.** 네비 브레이크포인트를 어드민에 맞게 조정(예: 좁은 화면에서도 핵심 메뉴 노출), 그리드가 의도대로 떨어지는지 폭별로 확인.

산출물: 전 페이지가 표준 컴포넌트 기반, 인라인 스타일·중복 페이지 제거.

### Phase D — 마감 (반응형·접근성·디테일)

1. 포커스 링·키보드 내비게이션·`aria` 속성 점검(인풋 `label` 연결, 모달 포커스 트랩 등).
2. 색 대비(WCAG AA) 점검 — 특히 `--color-text-tertiary`/뮤트 텍스트.
3. 마이크로 인터랙션 통일 — hover/active/transition을 토큰(`--transition-fast` 등) 기반으로.
4. 빈 상태 일러스트·문구, 로딩 스켈레톤 등 디테일 마감.

---

## 4. 우선순위와 빠른 개선(Quick Wins)

전체 마이그레이션은 Phase C가 가장 크지만, 다음은 **적은 작업으로 체감이 큰** 항목이다.

| 우선순위 | 항목 | 효과 |
|---|---|---|
| 즉시 | 폰트 단일화(Pretendard 적용) | 전 화면 한글 가독성이 한 번에 개선 |
| 즉시 | 의도치 않은 다크모드 제거/정리 | 다크모드 사용자의 깨진 화면 해소 |
| 즉시 | `PageContainer`(max-width + 패딩) 도입 | 와이드 화면 레이아웃 정상화 |
| 높음 | 대시보드 통계/메뉴 카드 그리드 수정 | 첫 화면 인상 개선 |
| 높음 | 상단 네비를 `.gb-header` 기반으로 재작성 | 모든 페이지 공통 영역이 정돈됨 |
| 높음 | `PageHeader` 통일 | 페이지 간 제목 위치·여백 일관성 |
| 중간 | 중복 페이지 3쌍 정리 | 혼란·유지보수 비용 감소 |

---

## 5. 페이지별 개선 체크리스트

마이그레이션 작업량의 가늠표. "인라인 수"는 현재 `style={{}}` 등장 횟수(많을수록 손이 많이 감).

| 페이지 | 인라인 수 | 주요 작업 |
|---|---|---|
| `attendance` | 107 | 표준 Table/Badge/Button으로 전면 치환 |
| `exam-management` | 83 | 표준 컴포넌트화 + `exams`와 중복 정리 |
| `assignment-management` | 80 | 표준 컴포넌트화, 카드/리스트 정리 |
| `class-management` | 75 | `gb-*`+인라인 혼용 → 표준 컴포넌트 |
| `grading-management` | 66 | 중복 정리 + 목 데이터 처리 |
| `curriculum-management` | 55 | `_components` 포함 표준화 |
| `sidebar`(상단 바) | 49 | `.gb-header` 기반 재작성 |
| `question-upload` | 47 | 중복 정리 + 목 데이터 처리 |
| `comments` | 47 | 채팅형 UI 표준 컴포넌트화 |
| `questions/upload` | 42 | 중복 정리 |
| `student-management` | 39 | 표준 Table/Card화 |
| `lesson-records` | 36 | 표준 컴포넌트화 |
| `exams` | 36 | 중복 정리 |
| `parent-management` | 27 | 표준 컴포넌트화 |
| `dashboard` | — | 그리드·여백 수정, `PageContainer` 적용 |
| `student-management/detail` | 1 | 거의 정돈됨 — 토큰만 정본으로 정렬 |

> `dashboard`와 `detail`은 이미 Tailwind 기반이라 비교적 깔끔하다. 이 둘의 패턴을 **표준의 출발점**으로 삼되, 토큰만 정본으로 맞추면 된다.

---

## 6. 요약

선생님앱의 문제는 기능 부족이 아니라 **일관성 부재**다. 디자인 시스템(`gb-*`)이 이미 잘 만들어져 있는데도 페이지마다 인라인 스타일·shadcn 토큰·디자인 시스템이 뒤섞여, 같은 앱이 페이지마다 다른 제품처럼 보인다. 따라서 개별 화면을 손보기 전에 (A) 토큰을 한 벌로, (B) 공통 컴포넌트를 한 벌로 먼저 통일하고, (C) 그 기준으로 전 화면을 옮긴 뒤, (D) 반응형·접근성을 마감하는 순서가 가장 효율적이다. 당장은 폰트 통일·다크모드 정리·`PageContainer` 도입·대시보드 그리드 수정만으로도 첫인상이 크게 개선된다.
