import { createLazyFileRoute, useNavigate, Outlet, useMatch } from '@tanstack/react-router';
import { useState } from 'react';
import { Users, Plus, Search, Trash2, BookOpen, Camera, BarChart } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';

export const Route = createLazyFileRoute('/students')({
  component: StudentsPage,
});

function StudentsPage() {
  // 자식 라우트 (학생 상세 페이지)가 활성화되어 있으면 Outlet만 렌더링
  const childMatch = useMatch({ from: '/students/$studentId', shouldThrow: false });
  if (childMatch) return <Outlet />;

  return <StudentsListView />;
}

function StudentsListView() {
  const { data: students, isLoading } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
          <p className="text-sm text-slate-500">학생 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const filteredStudents = (students || []).filter(
    (s) =>
      s.name.includes(searchQuery) ||
      (s.schoolName || '').includes(searchQuery) ||
      s.managedSubjects.some((sub) => sub.kyokwa?.includes(searchQuery)),
  );

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <Users className="h-5 w-5 text-emerald-400" />
          학생 관리
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
        >
          <Plus className="h-4 w-4" />
          학생 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/50 p-2 backdrop-blur-sm">
        <Search className="ml-2 h-4 w-4 text-slate-600" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="학생 이름, 학교, 과목으로 검색..."
          className="flex-1 border-0 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
        />
      </div>

      {/* 학생 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-600">
            등록된 학생이 없습니다.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const managedSubjectNames = student.managedSubjects.map((s) => s.kyokwa).join(', ');

            return (
              <div
                key={student.id}
                className="cursor-pointer rounded-xl border border-white/5 bg-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-emerald-500/20 hover:bg-slate-800/50"
                onClick={() => navigate({ to: '/students/$studentId', params: { studentId: String(student.id) } })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20"
                    >
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">{student.name}</h3>
                      <p className="text-xs text-slate-500">
                        {student.schoolName || '학교미입력'} · {student.grade || '학년미입력'}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">관리 과목</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {student.managedSubjects.length > 0 ? (
                        student.managedSubjects.map((sub) => (
                          <span
                            key={sub.id}
                            className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
                          >
                            {sub.kyokwa}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600">관리 과목 없음</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate({ to: '/students/$studentId', params: { studentId: String(student.id) } }); }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/5 bg-slate-800/50 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <BookOpen className="h-3 w-3" /> 미션
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate({ to: '/students/$studentId', params: { studentId: String(student.id) } }); }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/5 bg-slate-800/50 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <Camera className="h-3 w-3" /> 사진
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate({ to: '/students/$studentId', params: { studentId: String(student.id) } }); }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/5 bg-slate-800/50 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                  >
                    <BarChart className="h-3 w-3" /> 성적
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 학생 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">학생 추가</h3>
            <p className="mt-1 text-sm text-slate-500">학생 코드를 입력하여 학생을 추가하세요.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-300">학생 코드</label>
                <input
                  type="text"
                  placeholder="STU001"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5"
              >
                취소
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
