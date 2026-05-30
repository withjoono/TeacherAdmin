import {
  Star,
  User,
  ClipboardList,
  FileText,
  Calendar,
  StickyNote,
  Eye,
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
  title: "학생 케어 — 선생님앱",
  description: "학생 한 명의 모든 학습 흔적을 5개 탭으로. 플래너 1~10점 채점·비공개 코멘트까지.",
};

export default function PromoStudentPage() {
  return (
    <main>
      <PromoHero
        badge="학생 케어"
        Icon={Star}
        title="학생 한 명의 모든 것을"
        highlight="한 화면에"
        body="요약·과제·성적·출석·플래너 — 5개 탭으로 학생의 학습 흐름을 따라가세요. 1~10점 플래너 채점과 비공개 코멘트는 학부모 상담의 근거가 됩니다."
        primaryHref="/student-management"
        primaryLabel="학생 관리"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="학생 상세 5개 탭"
        subtitle="요약 한 번, 깊이 한 번. 매일 보는 정보와 상담용 정보가 모두 한곳에."
      >
        <FeatureGrid
          items={[
            { icon: User, title: "요약", body: "출석률·평균 점수·최근 과제 상태가 한눈에" },
            { icon: ClipboardList, title: "과제", body: "전 과제 제출 이력·점수·코멘트 누적" },
            { icon: FileText, title: "성적", body: "시험별 점수·반 평균 대비·추이 그래프" },
            { icon: Calendar, title: "출석", body: "출석/지각/결석 누적 + 회차별 기록" },
            { icon: Star, title: "플래너 검사", body: "학생 StudyPlanner를 1~10점으로 채점" },
            { icon: StickyNote, title: "비공개 코멘트", body: "선생님끼리만 보는 메모 (학생/학부모 비노출)" },
          ]}
        />
      </PromoSection>

      <PromoSection title="플래너 채점, 이렇게" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "학생 플래너 열기",
                body: "학생 상세 → '플래너 검사' 탭. 학생이 StudyPlanner에 기록한 학습량이 그대로 표시.",
              },
              {
                title: "1~10점 채점",
                body: "오늘의 학습량·집중도를 슬라이더로 점수 매김. 코멘트도 함께.",
              },
              {
                title: "학생·학부모에게 노출",
                body: "공개 코멘트는 학생앱과 학부모 화면으로 전달. 비공개 메모는 선생님끼리만.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "학생 상세 5탭 (요약·과제·성적·출석·플래너)",
              "플래너 1~10점 채점",
              "공개 코멘트·비공개 메모 분리",
              "출석·과제 제출률 자동 집계",
              "시험 점수 추이 그래프",
              "반 평균 대비 위치 표시",
              "학부모 화면 자동 전달",
              "상담 메모 누적 보관",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Eye}
        title="학생 한 명의 한 학기 흐름이 한 화면에"
        body="학생 상세를 한 번 열어 보세요. 흩어진 정보가 5개 탭으로 정리되어 있습니다."
        primaryHref="/student-management"
        primaryLabel="학생 관리 열기"
      />
    </main>
  );
}
