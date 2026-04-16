"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Users,
  Calendar,
  CheckCircle,
  Eye,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { getLinkedAccounts, getMyClasses, setLinkClass, type LinkedAccount, type MentoringClass } from "@/lib/api/hub";

export default function StudentManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [linkedStudents, setLinkedStudents] = useState<LinkedAccount[]>([]);
  const [myClasses, setMyClasses] = useState<MentoringClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [impersonatingMap, setImpersonatingMap] = useState<Record<string, boolean>>({});
  const [selectedAppMap, setSelectedAppMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [links, classes] = await Promise.all([
          getLinkedAccounts(),
          getMyClasses(),
        ]);
        const students = (Array.isArray(links) ? links : []).filter(l => l.partnerType !== 'teacher');
        setLinkedStudents(students);
        setMyClasses(Array.isArray(classes) ? classes : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setLinkedStudents([]);
        setMyClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return linkedStudents.filter((student) => {
      const matchName = student.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === "all" || 
        (selectedClass === "none" ? !student.classId : student.classId === Number(selectedClass));
      return matchName && matchClass;
    });
  }, [linkedStudents, searchTerm, selectedClass]);

  const handleClassChange = async (linkId: number, classId: number | null) => {
    try {
      await setLinkClass(linkId, classId);
      setLinkedStudents(prev => prev.map(s => {
        if (s.linkId === linkId) {
          const cls = myClasses.find(c => c.id === classId);
          return { ...s, classId, className: cls?.name || null };
        }
        return s;
      }));
    } catch (err) {
      console.error('Failed to change class:', err);
    }
  };

  const goToDetail = (studentId: string) => {
    router.push(`/student-management/detail?id=${studentId}`);
  };

  const handleImpersonate = async (studentId: string, sharedApps: string[]) => {
    if (!sharedApps || sharedApps.length === 0) return;
    
    // 선택된 앱이 없으면 첫 번째 공유 앱 사용
    const appId = selectedAppMap[studentId] || sharedApps[0];
    
    try {
      setImpersonatingMap(prev => ({ ...prev, [studentId]: true }));
      const { impersonateApp } = await import('@/lib/api/hub');
      const code = await impersonateApp(studentId, appId);
      
      const targetUrls: Record<string, string> = {
        'susi': process.env.NEXT_PUBLIC_SUSI_URL || 'https://susi-front.web.app',
        'jungsi': process.env.NEXT_PUBLIC_JUNGSI_URL || 'https://jungsi-front.web.app',
        'studyplanner': process.env.NEXT_PUBLIC_STUDYPLANNER_URL || 'https://studyplanner-front.web.app',
        'examhub': process.env.NEXT_PUBLIC_EXAMHUB_URL || 'https://examhub-front.web.app',
        'mysanggibu': process.env.NEXT_PUBLIC_MYSANGGIBU_URL || 'https://ms-front.web.app',
      };
      
      const baseUrl = targetUrls[appId] || targetUrls['susi'];
      const targetUrl = new URL('/main', baseUrl);
      targetUrl.searchParams.set('sso_code', code);
      
      window.open(targetUrl.toString(), '_blank');
    } catch (err) {
      console.error('Failed to impersonate:', err);
      alert('앱 대리 접속에 실패했습니다. 권한을 확인해주세요.');
    } finally {
      setImpersonatingMap(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const assignedCount = linkedStudents.filter(s => s.classId).length;
  const appLinkedCount = linkedStudents.filter(s => s.sharedApps?.length > 0).length;

  if (loading) {
    return (
      <div className="gb-page-dashboard gb-stack gb-stack-6" style={{ paddingTop: "var(--space-10)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
          <Loader2 style={{ width: 32, height: 32, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="gb-page-dashboard gb-stack gb-stack-8" style={{ paddingTop: "var(--space-10)" }}>
      {/* 페이지 헤더 */}
      <div className="gb-page-header" style={{ marginBottom: 0 }}>
        <h1 className="gb-page-title">학생 관리</h1>
        <p className="gb-page-desc">연동된 학생을 관리하고 학습 현황을 확인하세요</p>
      </div>

      {/* 상단: 통계 카드 */}
      <div className="gb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        <StatCard label="전체 학생" value={linkedStudents.length} unit="명" icon={Users} />
        <StatCard label="반 배정" value={assignedCount} unit="명" icon={CheckCircle} />
        <StatCard label="앱 연동" value={appLinkedCount} unit="명" icon={BookOpen} />
      </div>

      {/* 검색 + 필터 */}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{
            position: "absolute", left: "var(--space-4)", top: "50%", transform: "translateY(-50%)",
            width: 16, height: 16, color: "var(--color-text-disabled)", pointerEvents: "none",
          }} />
          <input
            type="text"
            className="gb-input"
            placeholder="학생 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="gb-input"
          style={{ width: "auto", minWidth: 140 }}
        >
          <option value="all">전체 반</option>
          <option value="none">미배정</option>
          {myClasses.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {/* 학생 목록 */}
      {filteredStudents.length > 0 ? (
        <div className="gb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filteredStudents.map((student) => (
            <div key={student.linkId} className="gb-card" style={{ cursor: "default" }}>
              <div className="gb-row gb-row-3" style={{ marginBottom: "var(--space-3)" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "var(--color-primary-50, var(--color-bg-secondary))",
                  flexShrink: 0,
                }}>
                  <GraduationCap style={{ width: 22, height: 22, color: "var(--color-primary)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)",
                      color: "var(--color-text)", cursor: "pointer",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                    onClick={() => goToDetail(student.partnerId)}
                  >
                    {student.partnerName}
                  </div>
                  <div className="gb-row gb-row-3" style={{ marginTop: "var(--space-1)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                      <Calendar style={{ width: 12, height: 12 }} />
                      {new Date(student.linkedAt).toLocaleDateString('ko-KR')}
                    </span>
                    {student.sharedApps?.length > 0 && (
                      <span className="gb-badge gb-badge-primary" style={{ gap: 4 }}>
                        <CheckCircle style={{ width: 12, height: 12 }} />
                        앱 {student.sharedApps.length}개
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 공유 앱 수 표시 (뷰어에서 확인 가능) */}
              {student.sharedApps?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
                  <span className="gb-badge gb-badge-info" style={{ gap: 4 }}>
                    <BookOpen style={{ width: 12, height: 12 }} />
                    연동 앱 {student.sharedApps.length}개
                  </span>
                </div>
              )}

              {/* 하단 액션 */}
              <div style={{
                display: "flex", alignItems: "center", gap: "var(--space-2)",
                paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-light)",
              }}>
                <select
                  value={student.classId || ''}
                  onChange={(e) => handleClassChange(student.linkId, e.target.value ? Number(e.target.value) : null)}
                  onClick={(e) => e.stopPropagation()}
                  className="gb-input"
                  style={{ height: 36, flex: 1, fontSize: "var(--text-sm)" }}
                >
                  <option value="">반 미배정</option>
                  {myClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <button
                  className="gb-btn gb-btn-outline gb-btn-sm"
                  onClick={() => goToDetail(student.partnerId)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Eye style={{ width: 16, height: 16 }} />
                  상세
                </button>
              </div>

              {/* 앱 대리 접속 (Impersonation) UI */}
              {student.sharedApps?.length > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "var(--space-2)",
                  paddingTop: "var(--space-3)", marginTop: "var(--space-3)", borderTop: "1px dashed var(--color-border-light)",
                }}>
                  <select
                    value={selectedAppMap[student.partnerId] || student.sharedApps[0] || ''}
                    onChange={(e) => setSelectedAppMap(prev => ({ ...prev, [student.partnerId]: e.target.value }))}
                    className="gb-input"
                    style={{ height: 32, flex: 1, fontSize: "var(--text-xs)" }}
                  >
                    {student.sharedApps.map(app => (
                      <option key={app} value={app}>{app.toUpperCase()} 앱</option>
                    ))}
                  </select>
                  <button
                    className="gb-btn gb-btn-primary gb-btn-sm"
                    onClick={() => handleImpersonate(student.partnerId, student.sharedApps)}
                    disabled={impersonatingMap[student.partnerId]}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {impersonatingMap[student.partnerId] ? (
                      <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                    ) : (
                      <BookOpen style={{ width: 14, height: 14 }} />
                    )}
                    {impersonatingMap[student.partnerId] ? "접속 중" : "앱 접속"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="gb-card">
          <div className="gb-empty-state" style={{ padding: "var(--space-16) var(--space-4)" }}>
            <div className="gb-empty-icon">👩‍🎓</div>
            <div className="gb-empty-title">
              {searchTerm || selectedClass !== "all" ? "검색 결과가 없습니다" : "연동된 학생이 없습니다"}
            </div>
            <div className="gb-empty-desc">
              {searchTerm || selectedClass !== "all"
                ? "다른 검색 조건을 시도해보세요"
                : "Hub에서 초대 링크를 생성하여 학생을 연동하세요"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon }: { label: string; value: number; unit: string; icon: any }) {
  return (
    <div className="gb-stat-card">
      <div className="gb-stat-label">{label}</div>
      <div className="gb-row gb-row-3" style={{ justifyContent: "space-between" }}>
        <div className="gb-stat-value">
          {value}
          <span className="gb-stat-unit">{unit}</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: "var(--radius-full)",
          background: "var(--color-primary-50, var(--color-bg-secondary))",
        }}>
          <Icon style={{ width: 20, height: 20, color: "var(--color-primary)" }} />
        </div>
      </div>
    </div>
  );
}
