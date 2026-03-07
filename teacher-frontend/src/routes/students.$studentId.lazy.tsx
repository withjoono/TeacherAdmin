/**
 * 학생 상세 페이지 - 학생 앱 뷰어
 * 선생님이 연동된 학생의 학습 데이터를 열람하고 코멘트를 남길 수 있는 페이지
 */
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
    ArrowLeft, LayoutDashboard, ClipboardList, BarChart3, CalendarCheck,
    MessageSquare, Send, Clock, CheckCircle, XCircle, AlertCircle,
    FileText, User,
} from 'lucide-react';
import {
    useStudentOverview,
    useStudentAssignments,
    useStudentTests,
    useStudentAttendance,
    useStudentComments,
    useCreateComment,
} from '../hooks/useStudentDetail';
import type {
    StudentOverview,
    StudentAssignment,
    StudentTest,
    StudentAttendanceRecord,
    PrivateComment,
} from '../hooks/useStudentDetail';

export const Route = createLazyFileRoute('/students/$studentId')({
    component: StudentDetailPage,
});

type TabId = 'overview' | 'assignments' | 'tests' | 'attendance';

const TABS = [
    { id: 'overview' as TabId, label: '학습 요약', icon: LayoutDashboard },
    { id: 'assignments' as TabId, label: '과제', icon: ClipboardList },
    { id: 'tests' as TabId, label: '성적', icon: BarChart3 },
    { id: 'attendance' as TabId, label: '출석', icon: CalendarCheck },
];

function StudentDetailPage() {
    const { studentId } = Route.useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const { data: overview, isLoading: overviewLoading } = useStudentOverview(studentId);
    const { data: assignments } = useStudentAssignments(studentId);
    const { data: tests } = useStudentTests(studentId);
    const { data: attendance } = useStudentAttendance(studentId);
    const { data: comments } = useStudentComments(studentId);
    const createComment = useCreateComment();

    const [commentText, setCommentText] = useState('');

    const handleSendComment = () => {
        if (!commentText.trim() || !overview?.student) return;
        createComment.mutate({
            targetId: overview.student.id,
            studentId: overview.student.id,
            contextType: activeTab,
            content: commentText.trim(),
        });
        setCommentText('');
    };

    if (overviewLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
                    <p className="text-sm text-slate-500">학생 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="mb-3 h-10 w-10 text-slate-600" />
                <p className="text-slate-400">학생 정보를 찾을 수 없습니다.</p>
                <button
                    onClick={() => navigate({ to: '/students' })}
                    className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                    학생 목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-screen-xl px-4 py-6">
            {/* 상단: 학생 정보 + 뒤로가기 */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate({ to: '/students' })}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
                        {overview.student.username.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">{overview.student.username}</h2>
                        <p className="text-xs text-slate-500">
                            {overview.classes.map((c) => `${c.name} · ${c.subject}`).join(' | ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/5 bg-slate-900/50 p-1 backdrop-blur-sm">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            <div className="mb-6">
                {activeTab === 'overview' && <OverviewTab overview={overview} />}
                {activeTab === 'assignments' && <AssignmentsTab assignments={assignments || []} />}
                {activeTab === 'tests' && <TestsTab tests={tests || []} />}
                {activeTab === 'attendance' && <AttendanceTab attendance={attendance || []} />}
            </div>

            {/* 코멘트 섹션 */}
            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-5 backdrop-blur-sm">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-200">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    코멘트
                    {overview.stats.commentCount > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            {overview.stats.commentCount}
                        </span>
                    )}
                </h3>

                {/* 기존 코멘트 목록 */}
                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                    {(!comments || comments.length === 0) ? (
                        <p className="py-4 text-center text-sm text-slate-600">아직 코멘트가 없습니다.</p>
                    ) : (
                        comments.map((comment) => (
                            <CommentBubble key={comment.id} comment={comment} />
                        ))
                    )}
                </div>

                {/* 코멘트 입력 */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="코멘트를 입력하세요..."
                        className="flex-1 rounded-full border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                    />
                    <button
                        onClick={handleSendComment}
                        disabled={!commentText.trim() || createComment.isPending}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ===== 탭 컴포넌트들 =====

function OverviewTab({ overview }: { overview: StudentOverview }) {
    const { stats } = overview;
    const assignmentRate = stats.assignments.total > 0
        ? Math.round((stats.assignments.submitted / stats.assignments.total) * 100)
        : 0;
    const attendanceRate = stats.attendance.total > 0
        ? Math.round((stats.attendance.present / stats.attendance.total) * 100)
        : 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                label="과제 제출률"
                value={`${assignmentRate}%`}
                sub={`${stats.assignments.submitted}/${stats.assignments.total}`}
                color={assignmentRate >= 70 ? 'emerald' : assignmentRate >= 40 ? 'amber' : 'red'}
            />
            <StatCard
                label="평균 성적"
                value={stats.tests.avgScore !== null ? `${stats.tests.avgScore}점` : '-'}
                sub={`${stats.tests.count}회 응시`}
                color={stats.tests.avgScore !== null && stats.tests.avgScore >= 70 ? 'emerald' : 'amber'}
            />
            <StatCard
                label="출석률"
                value={`${attendanceRate}%`}
                sub={`출석 ${stats.attendance.present} / 지각 ${stats.attendance.late} / 결석 ${stats.attendance.absent}`}
                color={attendanceRate >= 90 ? 'emerald' : attendanceRate >= 70 ? 'amber' : 'red'}
            />
            <StatCard
                label="코멘트"
                value={`${stats.commentCount}건`}
                sub="선생님 ↔ 학생"
                color="slate"
            />

            {/* 최근 시험 결과 */}
            {stats.tests.recentResults.length > 0 && (
                <div className="col-span-full rounded-xl border border-white/5 bg-slate-900/30 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-300">최근 시험 결과</h4>
                    <div className="space-y-2">
                        {stats.tests.recentResults.map((r) => (
                            <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                                <span className="text-sm text-slate-300">{r.test.title}</span>
                                <span className={`text-sm font-semibold ${(r.score / r.test.maxScore) >= 0.7 ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                    {r.score}/{r.test.maxScore}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AssignmentsTab({ assignments }: { assignments: StudentAssignment[] }) {
    if (assignments.length === 0) {
        return <EmptyState icon={ClipboardList} message="해당 학생의 과제 데이터가 없습니다." />;
    }

    return (
        <div className="space-y-3">
            {assignments.map((assignment) => {
                const submission = assignment.submissions[0];
                const statusConfig = getSubmissionStatusConfig(submission?.status);

                return (
                    <div key={assignment.id} className="rounded-xl border border-white/5 bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-200">{assignment.title}</h4>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {assignment.lesson.class.name} · {assignment.lesson.title}
                                </p>
                                {assignment.description && (
                                    <p className="mt-2 text-sm text-slate-400">{assignment.description}</p>
                                )}
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.classes}`}>
                                <statusConfig.icon className="h-3 w-3" />
                                {statusConfig.label}
                            </span>
                        </div>
                        {submission && (
                            <div className="mt-3 flex items-center gap-4 border-t border-white/5 pt-3">
                                {submission.grade !== null && submission.grade !== undefined && (
                                    <span className="text-sm text-slate-400">점수: <strong className="text-emerald-400">{submission.grade}</strong></span>
                                )}
                                {submission.feedback && (
                                    <span className="text-sm text-slate-500">피드백: {submission.feedback}</span>
                                )}
                                <span className="ml-auto text-xs text-slate-600">
                                    {new Date(submission.submittedAt).toLocaleDateString('ko-KR')}
                                </span>
                            </div>
                        )}
                        {assignment.dueDate && !submission && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                                <Clock className="h-3 w-3" />
                                마감: {new Date(assignment.dueDate).toLocaleDateString('ko-KR')}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function TestsTab({ tests }: { tests: StudentTest[] }) {
    if (tests.length === 0) {
        return <EmptyState icon={BarChart3} message="해당 학생의 시험 데이터가 없습니다." />;
    }

    return (
        <div className="space-y-3">
            {tests.map((test) => {
                const result = test.results[0];
                const scorePercent = result ? Math.round((result.score / test.maxScore) * 100) : null;

                return (
                    <div key={test.id} className="rounded-xl border border-white/5 bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-medium text-slate-200">{test.title}</h4>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {test.lesson.class.name} · {test.lesson.title}
                                </p>
                            </div>
                            {result ? (
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${scorePercent! >= 70 ? 'text-emerald-400' : scorePercent! >= 40 ? 'text-amber-400' : 'text-red-400'
                                        }`}>
                                        {result.score}<span className="text-sm text-slate-500">/{test.maxScore}</span>
                                    </div>
                                    <div className="text-xs text-slate-600">{scorePercent}%</div>
                                </div>
                            ) : (
                                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-500">미응시</span>
                            )}
                        </div>
                        {result && (
                            <div className="mt-3">
                                {/* 점수 바 */}
                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className={`h-full rounded-full transition-all ${scorePercent! >= 70 ? 'bg-emerald-500' : scorePercent! >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${scorePercent}%` }}
                                    />
                                </div>
                                {result.feedback && (
                                    <p className="mt-2 text-sm text-slate-400">💬 {result.feedback}</p>
                                )}
                                {result.wrongAnswerNote && (
                                    <p className="mt-1 text-sm text-slate-500">📝 {result.wrongAnswerNote}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function AttendanceTab({ attendance }: { attendance: StudentAttendanceRecord[] }) {
    if (attendance.length === 0) {
        return <EmptyState icon={CalendarCheck} message="해당 학생의 출석 데이터가 없습니다." />;
    }

    const statusMap = {
        present: { label: '출석', icon: CheckCircle, classes: 'bg-emerald-500/10 text-emerald-400' },
        late: { label: '지각', icon: AlertCircle, classes: 'bg-amber-500/10 text-amber-400' },
        absent: { label: '결석', icon: XCircle, classes: 'bg-red-500/10 text-red-400' },
    };

    // 월별 그룹핑
    const grouped = attendance.reduce<Record<string, StudentAttendanceRecord[]>>((acc, record) => {
        const month = new Date(record.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(record);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            {/* 요약 통계 */}
            <div className="grid grid-cols-3 gap-3">
                {(['present', 'late', 'absent'] as const).map((status) => {
                    const count = attendance.filter((a) => a.status === status).length;
                    const config = statusMap[status];
                    return (
                        <div key={status} className={`rounded-xl border border-white/5 bg-slate-900/50 p-3 text-center`}>
                            <config.icon className={`mx-auto mb-1 h-5 w-5 ${config.classes.split(' ')[1]}`} />
                            <div className="text-xl font-bold text-slate-200">{count}</div>
                            <div className="text-xs text-slate-500">{config.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* 월별 기록 */}
            {Object.entries(grouped).map(([month, records]) => (
                <div key={month}>
                    <h4 className="mb-2 text-sm font-semibold text-slate-400">{month}</h4>
                    <div className="space-y-1">
                        {records.map((record) => {
                            const config = statusMap[record.status];
                            return (
                                <div key={record.id} className="flex items-center gap-3 rounded-lg bg-slate-900/30 px-3 py-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.classes}`}>
                                        <config.icon className="h-3 w-3" />
                                        {config.label}
                                    </span>
                                    <span className="text-sm text-slate-300">
                                        {new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                                    </span>
                                    <span className="text-xs text-slate-500">{record.class.name}</span>
                                    {record.note && <span className="ml-auto text-xs text-slate-600">{record.note}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ===== 헬퍼 컴포넌트들 =====

function StatCard({ label, value, sub, color }: {
    label: string; value: string; sub: string; color: string;
}) {
    const colorMap: Record<string, string> = {
        emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20',
        amber: 'from-amber-500/10 to-orange-500/5 border-amber-500/20',
        red: 'from-red-500/10 to-rose-500/5 border-red-500/20',
        slate: 'from-slate-800/50 to-slate-900/30 border-white/5',
    };
    const valueColor: Record<string, string> = {
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
        slate: 'text-slate-300',
    };

    return (
        <div className={`rounded-xl border bg-gradient-to-br p-4 ${colorMap[color] || colorMap.slate}`}>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${valueColor[color] || valueColor.slate}`}>{value}</p>
            <p className="mt-0.5 text-[11px] text-slate-600">{sub}</p>
        </div>
    );
}

function CommentBubble({ comment }: { comment: PrivateComment }) {
    const isTeacher = comment.author.role === 'teacher';
    return (
        <div className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isTeacher
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'border border-white/5 bg-slate-800/50 text-slate-200'
                }`}>
                <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                    <User className="h-2.5 w-2.5" />
                    {comment.author.username}
                    {comment.contextType && (
                        <span className="rounded bg-white/10 px-1">{comment.contextType}</span>
                    )}
                </div>
                <p className="mt-0.5 text-sm">{comment.content}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isTeacher ? 'text-emerald-100' : 'text-slate-600'}`}>
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(comment.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/30 py-12">
            <Icon className="mb-3 h-10 w-10 text-slate-700" />
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
}

function getSubmissionStatusConfig(status?: string) {
    switch (status) {
        case 'graded':
            return { label: '채점 완료', icon: CheckCircle, classes: 'bg-emerald-500/10 text-emerald-400' };
        case 'submitted':
            return { label: '제출됨', icon: FileText, classes: 'bg-blue-500/10 text-blue-400' };
        default:
            return { label: '미제출', icon: AlertCircle, classes: 'bg-slate-500/10 text-slate-400' };
    }
}
