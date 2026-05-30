import {
  Users,
  UserPlus,
  BarChart3,
  Hash,
  Upload,
  Building2,
  ListTree,
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
  title: "반 운영 — 선생님앱",
  description: "반 생성·학생 초대·반별 학습 통계까지. 학원과 1:N 강사 모두에게 맞는 반 관리 도구.",
};

export default function PromoClassPage() {
  return (
    <main>
      <PromoHero
        badge="반 운영"
        Icon={Users}
        title="첫 반 생성까지"
        highlight="1분"
        body="이름·요일·시간만 입력하면 반이 만들어집니다. 학생 초대는 코드 한 줄 또는 CSV 일괄 등록. 반 단위 학습 통계도 그 자리에서 확인하세요."
        primaryHref="/class-management"
        primaryLabel="반 만들기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="반 운영, 이런 게 다 됩니다"
        subtitle="학원 원장·1:N 강사·1:1 개인 강사 — 어떤 형태든 같은 도구 하나로."
      >
        <FeatureGrid
          items={[
            { icon: Users, title: "반 생성", body: "이름·과목·요일·시간만 입력하면 즉시 활성화" },
            { icon: Hash, title: "초대 코드", body: "6자리 코드로 학생이 셀프 가입. 비공개 토글 가능" },
            { icon: Upload, title: "CSV 일괄 등록", body: "신학기 명단을 한 번에 업로드해 즉시 연결" },
            { icon: BarChart3, title: "반별 학습 통계", body: "출석·과제 제출률·시험 평균을 한 카드로" },
            { icon: ListTree, title: "여러 반 동시 운영", body: "메인반·심화반·보충반 — 학생 중복 배치 가능" },
            { icon: Building2, title: "학원 단위 분리", body: "원장 계정 아래 강사별 반 권한 격리" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 반 운영 시작" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "반 만들기",
                body: "메인 메뉴 '반 운영' → '+ 새 반'. 이름·과목·요일·시간만 채우면 끝.",
              },
              {
                title: "학생 초대",
                body: "코드 발급 후 카카오톡으로 학생에게 전달, 또는 CSV 업로드로 신학기 명단 한 번에 등록.",
              },
              {
                title: "운영 시작",
                body: "수업 계획·과제·시험을 만들면 학생 Classboard 일정에 자동 표시됩니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "반 생성·수정·아카이브",
              "학생 초대 코드 발급/회수",
              "CSV·엑셀 일괄 등록",
              "반별 학습 통계 대시보드",
              "학생 학습량 1~10점 채점",
              "학생 상세 5탭(요약·과제·성적·출석·플래너)",
              "강사별 권한 분리",
              "반 아카이브·졸업반 처리",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="반 하나 만드는 데 1분이면 됩니다"
        body="Hub 계정으로 로그인하고 메인 메뉴 '반 운영'에서 시작하세요."
        primaryHref="/class-management"
        primaryLabel="반 운영 시작하기"
      />
    </main>
  );
}
