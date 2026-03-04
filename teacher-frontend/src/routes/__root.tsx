import { createRootRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import { Home, Users, MessageSquare, Settings, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PromoPage from '../components/PromoPage';

export const Route = createRootRoute({
  component: TeacherLayout,
});

function TeacherLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // SSO 처리 중
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-sm text-slate-400">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 → 프로모 페이지
  if (!isAuthenticated) {
    return <PromoPage />;
  }

  const navItems = [
    { to: '/' as const, label: '대시보드', icon: Home },
    { to: '/students' as const, label: '학생 관리', icon: Users },
    { to: '/messages' as const, label: '쪽지', icon: MessageSquare },
    { to: '/settings' as const, label: '설정', icon: Settings },
  ];

  // 로그인 → 대시보드 + 상단 네비게이션
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">선생님</h1>
              <p className="text-[10px] tracking-wider text-slate-500">GB PLANNER</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400 md:flex"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-slate-950/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${isActive ? 'text-emerald-400' : 'text-slate-600'
                  }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}
