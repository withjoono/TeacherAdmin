/**
 * 선생님 설정 페이지 (다크 모드)
 */
import { createLazyFileRoute } from '@tanstack/react-router';
import { Bell, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Route = createLazyFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <h2 className="mb-6 text-xl font-bold text-slate-100">설정</h2>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-5 backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-200">
            <User className="h-4 w-4 text-emerald-400" />
            프로필
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span className="text-sm text-slate-400">이름</span>
              <span className="text-sm font-medium text-slate-200">김멘토</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span className="text-sm text-slate-400">이메일</span>
              <span className="text-sm font-medium text-slate-200">teacher@example.com</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span className="text-sm text-slate-400">담당 학생</span>
              <span className="text-sm font-medium text-slate-200">12명</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-5 backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-200">
            <Bell className="h-4 w-4 text-amber-400" />
            알림 설정
          </h3>
          <div className="space-y-3">
            <SettingToggle label="학생 미달 알림" description="학생 완료율 50% 미만 시 알림" defaultChecked />
            <SettingToggle label="학부모 쪽지 알림" description="새로운 쪽지가 도착하면 알림" defaultChecked />
            <SettingToggle label="일일 리포트" description="매일 저녁 전체 학생 요약 알림" defaultChecked={false} />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-5 backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-200">
            <Shield className="h-4 w-4 text-cyan-400" />
            보안
          </h3>
          <button className="w-full rounded-lg border border-white/5 bg-slate-800/50 p-3 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200">
            비밀번호 변경
          </button>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="peer h-5 w-9 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-slate-400 after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:bg-white" />
      </label>
    </div>
  );
}
