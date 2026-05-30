import {
  MessageSquare,
  Smartphone,
  Eye,
  ShieldCheck,
  BellRing,
  UserCheck,
  ChartLine,
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
  title: "학부모 소통 — 선생님앱",
  description: "학부모가 자녀 계정으로 학생앱에서 그대로 확인. 별도 앱·별도 통보 없이 자연스러운 공유.",
};

export default function PromoParentPage() {
  return (
    <main>
      <PromoHero
        badge="학부모 소통"
        Icon={MessageSquare}
        title="별도 앱 없이"
        highlight="자녀 계정 그대로"
        body="학부모는 자녀가 쓰는 학생앱에 같은 계정으로 들어와 출석·과제·성적·코멘트를 확인합니다. 선생님이 따로 통보·정리하지 않아도 됩니다."
        primaryHref="/parent-management"
        primaryLabel="학부모 관리"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="자연스러운 공유 흐름"
        subtitle="선생님이 입력한 그 순간, 학부모가 자녀 화면에서 보는 그 순간 — 같은 데이터."
      >
        <FeatureGrid
          items={[
            { icon: Smartphone, title: "학부모 전용 앱 불필요", body: "자녀 학생앱에 부모도 로그인. 추가 설치 없음." },
            { icon: Eye, title: "출석·과제·성적 자동 공개", body: "선생님이 입력하면 학부모 화면에 즉시 반영" },
            { icon: ShieldCheck, title: "공개/비공개 코멘트 분리", body: "학생·학부모에게 보이는 코멘트와 내부 메모 구분" },
            { icon: BellRing, title: "주요 변화 자동 표시", body: "결석·과제 미제출이 학부모 화면에 우선 노출" },
            { icon: UserCheck, title: "학부모 등록 관리", body: "학생-학부모 연결 상태를 한 화면에서 확인" },
            { icon: ChartLine, title: "상담 자료 자동 정리", body: "학기말 학부모 상담용 자료가 자동 누적" },
          ]}
        />
      </PromoSection>

      <PromoSection title="학부모는 이렇게 들어옵니다" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "Hub 계정 가입",
                body: "학부모는 tskool.kr에서 부모 계정으로 가입. 학생 계정과 같은 가입 절차.",
              },
              {
                title: "자녀 연결",
                body: "자녀의 학생 코드를 입력하면 자녀 데이터에 자동 연결.",
              },
              {
                title: "학생앱에서 확인",
                body: "ParentAdmin 또는 학생앱에서 출석·과제·성적·코멘트를 그대로 열람.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "학생-학부모 연결 관리",
              "출석·과제·성적 자동 공유",
              "공개 코멘트 즉시 전달",
              "비공개 메모(학부모 비노출)",
              "결석·미제출 알림 우선 노출",
              "상담용 학생 요약 자동 생성",
              "학부모 가입 안내 안내문 제공",
              "ParentAdmin 앱 자동 연동",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="학부모 통보, 더 만들지 마세요"
        body="선생님이 평소 쓰던 도구에 입력하는 순간, 학부모가 자녀 화면에서 그대로 봅니다."
        primaryHref="/parent-management"
        primaryLabel="학부모 관리"
      />
    </main>
  );
}
