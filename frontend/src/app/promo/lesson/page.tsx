import {
  Calendar,
  BookOpen,
  ClipboardCheck,
  CalendarClock,
  PencilLine,
  CheckCircle2,
  Layers,
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
  title: "수업 관리 — 선생님앱",
  description: "수업 계획·기록·출결을 한 곳에서. 일정은 학생 Classboard에 자동 동기화.",
};

export default function PromoLessonPage() {
  return (
    <main>
      <PromoHero
        badge="수업 관리"
        Icon={Calendar}
        title="수업 한 줄도"
        highlight="빈칸으로 OK"
        body="요일·시간·과목·교재·진도·총회차 — 정해진 칸을 다 못 채워도 일단 만드세요. 채워지지 않은 칸은 그대로, 잡힌 일정은 학생 Classboard에 자동으로 뜹니다."
        primaryHref="/curriculum-management"
        primaryLabel="수업 계획 시작"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="수업 흐름 전체를 한 도구로"
        subtitle="계획부터 기록·출결까지 — 한 화면에서 시작해 한 화면에서 마칩니다."
      >
        <FeatureGrid
          items={[
            { icon: BookOpen, title: "수업 계획", body: "요일·시간·과목·교재·진도·총회차. 빈칸 허용." },
            { icon: PencilLine, title: "수업 기록", body: "당일 진도·과제·전달사항을 즉시 메모" },
            { icon: ClipboardCheck, title: "출결", body: "출석/지각/결석 한 번에 체크, 누적 통계까지" },
            { icon: CalendarClock, title: "Classboard 자동 표식", body: "수업·과제·시험이 학생 일정에 자동 등록" },
            { icon: Layers, title: "회차별 진도 누적", body: "총회차 대비 진행률을 자동 계산" },
            { icon: CheckCircle2, title: "수업 기록 보존", body: "학기 종료 후에도 회차별 기록 그대로" },
          ]}
        />
      </PromoSection>

      <PromoSection title="이렇게 흘러갑니다" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "수업 계획 만들기",
                body: "반 안에서 '수업 계획 +' → 요일·시간·과목만 채워도 일단 발행. 학생 Classboard에 즉시 표시.",
              },
              {
                title: "수업 당일 기록",
                body: "당일 진행한 진도·전달사항을 입력. 다음 회차 자동 생성.",
              },
              {
                title: "출결 체크",
                body: "출석/지각/결석 클릭 한 번. 누적 통계는 학생 상세 '출석' 탭에 자동 반영.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "수업 계획 작성 (빈칸 허용)",
              "회차별 수업 기록",
              "출석/지각/결석 체크",
              "출결 누적 통계",
              "학생 Classboard 일정 자동 표시",
              "과목·교재·진도 자동 누적",
              "수업 종료 후 회차 기록 보존",
              "수업 단위 코멘트(학생별 비공개)",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="빈칸이 있어도 수업 일정은 만들어집니다"
        body="첫 수업 계획을 시작하세요. 정해지지 않은 정보는 나중에 채워도 됩니다."
        primaryHref="/curriculum-management"
        primaryLabel="수업 계획 시작"
      />
    </main>
  );
}
