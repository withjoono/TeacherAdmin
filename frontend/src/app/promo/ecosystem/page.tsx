import {
  Network,
  KeyRound,
  CalendarClock,
  FileBarChart,
  Users,
  Smartphone,
  Repeat,
  Wand2,
} from "lucide-react";
import {
  PromoHero,
  PromoSection,
  FeatureGrid,
  StepList,
  CheckList,
  FinalCTA,
} from "../_components";

export const metadata = {
  title: "생태계 연동 — 선생님앱",
  description: "Hub·StudyPlanner·ExamHub·TutorBoard·ParentAdmin이 한 계정·한 데이터로 묶여 자동으로 함께 움직입니다.",
};

const APPS = [
  {
    name: "Hub",
    role: "SSO · 계정연동 · 알림",
    body: "한 번 로그인하면 모든 앱이 같은 계정으로 자동 로그인",
    Icon: KeyRound,
  },
  {
    name: "StudyPlanner",
    role: "학생 플래너 · 담당 선생님 채점 반영",
    body: "학생의 학습량 기록을 선생님이 1~10점으로 채점",
    Icon: CalendarClock,
  },
  {
    name: "ExamHub",
    role: "시험 엔진 · 자동채점 · 분석",
    body: "선생님 출제 시험에도 오답노트·약점·추이 분석이 그대로 작동",
    Icon: FileBarChart,
  },
  {
    name: "TutorBoard",
    role: "학생 통합 화면 (= Classboard)",
    body: "학생이 보는 일정·과제·시험 통합 화면",
    Icon: Smartphone,
  },
  {
    name: "ParentAdmin",
    role: "학부모용 화면",
    body: "학부모가 자녀 학습 상황을 보는 별도 화면",
    Icon: Users,
  },
];

export default function PromoEcosystemPage() {
  return (
    <main>
      <PromoHero
        badge="생태계 연동"
        Icon={Network}
        title="한 번 연동,"
        highlight="다섯 앱이 함께"
        body="선생님은 본 앱 하나만 쓰면 됩니다. 나머지 4개 앱은 학생·학부모가 자기 화면에서 보는 결과 화면 — 자동으로 따라옵니다."
        primaryHref="/dashboard"
        primaryLabel="대시보드 가기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="거북스쿨 5개 앱"
        subtitle="한 계정 · 한 데이터로 묶여, 한 곳에서 입력한 것이 다른 곳에 자동으로 보입니다."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">중심</p>
            <p className="mt-2 text-lg font-bold">선생님앱</p>
            <p className="mt-1 text-xs opacity-80">출제 · 채점 · 학생 관리</p>
            <p className="mt-3 text-sm leading-relaxed opacity-90">
              선생님이 매일 쓰는 운영 도구. 다른 앱들은 여기서 시작된 데이터를 자기 화면에서 보여주는 역할.
            </p>
          </div>
          {APPS.map((app) => {
            const Icon = app.Icon;
            return (
              <div key={app.name} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{app.name}</p>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {app.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{app.body}</p>
              </div>
            );
          })}
        </div>
      </PromoSection>

      <PromoSection title="자동 연동, 이런 식으로" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "수업 만들면 → 학생 Classboard에 일정",
                body: "선생님이 수업 계획을 만들면 학생의 TutorBoard 일정에 자동 표식. 학부모 화면에도 같이.",
              },
              {
                title: "시험 출제하면 → ExamHub 분석",
                body: "선생님 시험에도 ExamHub의 오답노트·약점·성적추이 분석이 자동 작동.",
              },
              {
                title: "플래너 채점하면 → 학생·학부모 화면",
                body: "선생님이 1~10점으로 채점한 결과가 학생 StudyPlanner와 ParentAdmin에 동시 표시.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="자동 연동 항목">
        <div className="mx-auto max-w-3xl">
          <FeatureGrid
            columns={2}
            items={[
              { icon: Repeat, title: "수업·과제·시험 일정", body: "→ 학생 TutorBoard / Classboard로 자동" },
              { icon: Repeat, title: "출제 시험 분석", body: "→ ExamHub 오답·약점·추이 자동 연결" },
              { icon: Repeat, title: "플래너 점수·코멘트", body: "→ 학생 StudyPlanner / ParentAdmin로 자동" },
              { icon: Repeat, title: "학생 출석·과제 제출", body: "→ 학부모 ParentAdmin로 자동" },
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="선생님은 한 앱, 학생·학부모는 자기 앱"
        body="별도 통보·따로 동기화·이중 입력 없음. 거북스쿨 한 계정으로 모든 흐름이 연결됩니다."
        primaryHref="/dashboard"
        primaryLabel="대시보드 가기"
      />
    </main>
  );
}
