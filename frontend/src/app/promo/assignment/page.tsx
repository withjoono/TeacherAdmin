import {
  ClipboardList,
  Upload,
  CheckSquare,
  CalendarClock,
  MessageSquare,
  TrendingUp,
  Inbox,
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
  title: "과제 관리 — 선생님앱",
  description: "과제 출제부터 제출 현황·채점까지. 마감일은 학생 Classboard 일정에 자동.",
};

export default function PromoAssignmentPage() {
  return (
    <main>
      <PromoHero
        badge="과제 관리"
        Icon={ClipboardList}
        title="과제 하나"
        highlight="여러 반에 동시"
        body="반·학생 단위로 과제를 출제하고 제출 현황을 실시간으로 확인하세요. 마감일은 학생 Classboard 일정에 자동 등록됩니다."
        primaryHref="/assignment-management"
        primaryLabel="과제 출제하기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="제출부터 채점까지 한 흐름"
        subtitle="흩어진 카톡·메일 없이 — 같은 화면 안에서 다 됩니다."
      >
        <FeatureGrid
          items={[
            { icon: Upload, title: "과제 출제", body: "제목·설명·마감일·첨부파일로 즉시 발행" },
            { icon: Inbox, title: "제출 현황 실시간", body: "누가 냈는지 누가 안 냈는지 한눈에" },
            { icon: CheckSquare, title: "점수 입력", body: "학생별 점수·통과/미통과 표시" },
            { icon: MessageSquare, title: "코멘트", body: "학생에게 보이는 코멘트와 비공개 메모 분리" },
            { icon: CalendarClock, title: "마감일 자동 일정", body: "학생 Classboard에 마감일 자동 등록" },
            { icon: TrendingUp, title: "제출률 통계", body: "반별·학생별 누적 제출률 자동 계산" },
          ]}
        />
      </PromoSection>

      <PromoSection title="이렇게 흘러갑니다" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "출제",
                body: "반 선택 → 제목·마감일·설명. 첨부가 있으면 드래그앤드롭.",
              },
              {
                title: "학생 제출 확인",
                body: "학생이 제출하면 자동으로 '제출' 표시. 미제출자 명단을 한 번에 확인.",
              },
              {
                title: "채점·피드백",
                body: "점수와 함께 학생에게 보이는 코멘트 + 선생님 비공개 메모를 동시에 남길 수 있음.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "반·학생 단위 과제 출제",
              "마감일·첨부파일 지원",
              "제출 현황 실시간 확인",
              "미제출자 일괄 리마인드",
              "학생별 점수·코멘트",
              "비공개 메모 (학생/학부모 비노출)",
              "Classboard 자동 일정 등록",
              "반별 누적 제출률",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="이번 주 과제 하나, 1분이면 출제됩니다"
        body="반 선택하고 제목·마감일만 채우면 끝. 학생 알림과 일정은 자동입니다."
        primaryHref="/assignment-management"
        primaryLabel="과제 출제하기"
      />
    </main>
  );
}
