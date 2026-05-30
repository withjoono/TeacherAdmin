import Link from "next/link";
import {
  ArrowRight,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Star,
  MessageSquare,
  Wand2,
  CheckCircle2,
  Sparkles,
  Zap,
  Repeat,
} from "lucide-react";

export const metadata = {
  title: "선생님앱 — 학원·강사 통합 운영 도구",
  description: "반·수업·시험·분석을 한 곳에서. 학생과 한 번 연동하면 모든 도구가 알아서 함께 움직입니다.",
};

const VALUE_PROPS = [
  {
    icon: Repeat,
    title: "한 번 연동, 다섯 앱이 함께",
    body:
      "학생이 Hub에서 한 번 계정연동하면, 선생님이 만든 일정·과제·시험·채점 결과가 학생의 TutorBoard·ExamHub로 자동으로 흘러갑니다.",
  },
  {
    icon: Zap,
    title: "출제는 클릭 4번",
    body:
      "전체 객관식·전체 배점·정답 일괄 입력. 25문항 5지선다 시험을 마법사 4단계만에 발행할 수 있습니다.",
  },
  {
    icon: Sparkles,
    title: "분석은 만들 필요 없이 재사용",
    body:
      "ExamHub의 오답노트·약점 분석·성적 추이 화면이 선생님 시험 결과에도 그대로 작동합니다.",
  },
];

const FEATURES = [
  { icon: Users, title: "반 운영", body: "반 생성 · 학생 초대(코드/일괄등록) · 학습 통계" },
  { icon: Calendar, title: "수업", body: "수업 계획 · 수업 기록 · 출결 · Classboard 일정 자동 표식" },
  { icon: FileText, title: "시험·평가", body: "출제 마법사(객관식·단답형·주관식) · 자동/수동 채점" },
  { icon: ClipboardList, title: "과제", body: "과제 출제 · 제출 현황 · 채점 · 마감일 자동 일정" },
  { icon: Star, title: "학생 케어", body: "플래너 1~10점 채점 · 학생 상세 5탭 · 비공개 코멘트" },
  { icon: MessageSquare, title: "학부모 소통", body: "학부모가 자녀 계정으로 학생앱에서 그대로 확인" },
];

const ECOSYSTEM = [
  { name: "Hub", desc: "인증·계정연동·일정 공유" },
  { name: "StudyPlanner", desc: "학생 플래너·담당 선생님 채점" },
  { name: "ExamHub", desc: "시험 엔진·자동채점·분석" },
  { name: "TutorBoard", desc: "학생 통합 화면 (= Classboard)" },
  { name: "ParentAdmin", desc: "학부모용 화면" },
];

const READY = [
  "반 만들고 학생 연동",
  "수업 계획 세우기 (빈칸 허용)",
  "수업 기록 · 출결",
  "과제 출제·채점",
  "시험 출제·자동채점·주관식 수동채점",
  "학생 플래너 검사 (1~10점·코멘트)",
  "비공개 코멘트 · 학부모 관리",
  "Classboard 일정 자동 동기화",
  "ExamHub 오답·약점·추이 분석 자동 연결",
];

export default function PromoPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-background">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-12 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            거북스쿨 생태계
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            반·수업·시험을 <span className="text-primary">한 곳에서</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            선생님앱은 학원·강사가 학생과 한 번 연동하면 일정·과제·시험·분석이 자동으로 이어지는 통합 운영 도구입니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.tskool.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              Hub에서 가입
            </a>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURE GRID ===== */}
      <section className="bg-secondary/30 px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              무엇이 들어 있나
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              반 운영부터 학부모 소통까지 — 선생님이 매일 쓰는 도구가 한 화면에 모여 있습니다.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEM ===== */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            한 학생이 다섯 앱을 따로 쓰지 않습니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            거북스쿨의 5개 앱이 한 계정·한 데이터로 묶여 있어, 선생님은 본 앱 하나만 쓰면 학생·학부모가 자기 앱에서 결과를 봅니다.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">중심</p>
            <p className="mt-2 text-lg font-bold">선생님앱</p>
            <p className="mt-1 text-xs opacity-80">출제 · 채점 · 관리</p>
          </div>
          {ECOSYSTEM.map((e) => (
            <div key={e.name} className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">앱</p>
              <p className="mt-2 text-lg font-bold text-foreground">{e.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== READY ===== */}
      <section className="bg-secondary/30 px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            지금 바로 가능한 것
          </h2>
          <p className="mt-4 text-muted-foreground">아래 모든 기능이 작동 중입니다.</p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-2">
          {READY.map((r) => (
            <li
              key={r}
              className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-foreground"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Wand2 className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          첫 반을 만드는 데 1분이면 됩니다
        </h2>
        <p className="mt-4 text-muted-foreground">
          Hub 계정으로 로그인하고 첫 반을 만들어 보세요. 사용 중에 도움이 필요하면 상단 도움말(?) 버튼에서 빠른 시작 가이드를 열 수 있습니다.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t bg-card py-8 text-center text-xs text-muted-foreground">
        © 거북스쿨 · Teacher Admin
      </footer>
    </main>
  );
}
