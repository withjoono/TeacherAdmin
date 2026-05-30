import {
  FileText,
  Zap,
  ListChecks,
  Calculator,
  CheckCircle2,
  Sparkles,
  PenLine,
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
  title: "시험·평가 — 선생님앱",
  description: "출제는 클릭 4번. 25문항 5지선다 시험을 마법사로 즉시 발행. 분석은 ExamHub가 그대로 재사용.",
};

export default function PromoExamPage() {
  return (
    <main>
      <PromoHero
        badge="시험·평가"
        Icon={FileText}
        title="출제는"
        highlight="클릭 4번"
        body="25문항 5지선다 동일배점 시험을 마법사 4단계만에 발행. 객관식·단답형은 자동채점, 주관식만 수동. 분석은 ExamHub의 오답노트·약점·추이 화면이 그대로 작동합니다."
        primaryHref="/exams/new"
        primaryLabel="시험 출제하기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="만드는 데 손이 덜 가도록"
        subtitle="동일 배점·일괄 정답·일괄 유형 — 매번 반복되는 입력을 클릭 하나로."
      >
        <FeatureGrid
          items={[
            { icon: ListChecks, title: "전체 객관식 토글", body: "모든 문항을 한 번에 객관식으로 지정" },
            { icon: Calculator, title: "배점 일괄 분배", body: "전체 3점, 또는 100점 균등 분배 자동 계산" },
            { icon: PenLine, title: "정답 일괄 입력", body: "`3 1 4 2 5` 공백 구분으로 한 번에" },
            { icon: Zap, title: "자동 채점", body: "객관식·단답형은 학생 제출 즉시 점수 산출" },
            { icon: CheckCircle2, title: "주관식 수동 채점", body: "한 학생씩 점수·코멘트 입력, 부분점수 가능" },
            { icon: Sparkles, title: "ExamHub 분석 자동 연결", body: "오답노트·약점·성적추이가 별도 작업 없이 작동" },
          ]}
        />
      </PromoSection>

      <PromoSection title="4단계 출제 마법사" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              { title: "기본 정보", body: "반·시험 이름·시험일·시간 입력" },
              { title: "문항 유형", body: "'전체 객관식 5지선다' 같은 일괄 옵션으로 한 번에" },
              { title: "배점 설정", body: "전체 3점·100점 균등 분배·문항별 수동 — 셋 중 선택" },
              { title: "정답 입력", body: "공백 구분으로 한 줄에 끝. 발행 클릭." },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "객관식·단답형·주관식 출제",
              "전체 객관식 일괄 지정",
              "배점 일괄 분배 (균등/고정)",
              "정답 일괄 입력 (공백 구분)",
              "객관식·단답형 자동 채점",
              "주관식 수동 채점·부분점수",
              "ExamHub 오답노트 자동 연결",
              "ExamHub 약점·성적추이 분석 자동 연결",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="25문항 시험을 1분 안에"
        body="시험 출제 마법사로 첫 시험을 발행해 보세요. 자동 채점·분석은 학생이 답안 제출하는 순간 알아서 시작합니다."
        primaryHref="/exams/new"
        primaryLabel="시험 출제하기"
      />
    </main>
  );
}
