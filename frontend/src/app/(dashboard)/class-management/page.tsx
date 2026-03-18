"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Loader2,
  UserPlus,
  BarChart3,
  X,
  Copy,
  CheckCircle2,
  GraduationCap,
  Hash,
  Crown,
  User,
  Layers,
} from "lucide-react";
import { getMyArenaClasses, createArenaClass, getClassMembers } from "@/lib/api/classes";
import type { ArenaClass, ClassMember } from "@/lib/api/classes";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ArenaClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const data = await getMyArenaClasses();
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    async function fetchMembers() {
      try {
        setMembersLoading(true);
        const data = await getClassMembers(selectedClass!);
        setMembers(data || []);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    }
    fetchMembers();
  }, [selectedClass]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      setCreating(true);
      const newClass = await createArenaClass({
        name: newClassName.trim(),
        description: newClassDesc.trim() || undefined,
      });
      setClasses((prev) => [newClass, ...prev]);
      setSelectedClass(newClass.id);
      setNewClassName("");
      setNewClassDesc("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create class:", err);
      alert("클래스 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedArena = classes.find((c) => c.id === selectedClass);
  const totalMembers = classes.reduce((sum, c) => sum + (c.memberCount || 0), 0);

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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div className="gb-page-header" style={{ marginBottom: 0 }}>
          <h1 className="gb-page-title">클래스 관리</h1>
          <p className="gb-page-desc">
            {classes.length > 0
              ? `${classes.length}개의 클래스를 관리하고 있습니다`
              : "새로운 클래스를 만들어 학생을 관리하세요"}
          </p>
        </div>
        <button
          className="gb-btn gb-btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus style={{ width: 18, height: 18 }} />
          클래스 생성
        </button>
      </div>

      {/* 상단: 통계 카드 */}
      <div className="gb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        <StatCard label="전체 클래스" value={classes.length} unit="개" icon={Layers} />
        <StatCard label="전체 멤버" value={totalMembers} unit="명" icon={Users} />
        <StatCard label="평균 인원" value={classes.length > 0 ? Math.round(totalMembers / classes.length) : 0} unit="명" icon={GraduationCap} />
      </div>

      {/* 클래스 카드 그리드 */}
      {classes.length > 0 ? (
        <div>
          <h2 className="gb-section-title">내 클래스</h2>
          <div className="gb-grid gb-grid-3">
            {classes.map((cls) => {
              const isSelected = cls.id === selectedClass;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className="gb-card"
                  style={{
                    cursor: "pointer",
                    borderColor: isSelected ? "var(--color-primary)" : undefined,
                    borderWidth: isSelected ? 2 : undefined,
                    background: isSelected ? "var(--color-primary-50, var(--color-bg-secondary))" : undefined,
                    transition: "all var(--transition-normal)",
                  }}
                >
                  <div className="gb-row gb-row-3">
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 44, height: 44, borderRadius: "var(--radius-md)",
                      background: "var(--color-primary-50, var(--color-bg-secondary))",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)" }}>
                        {cls.name.charAt(0)}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {cls.name}
                      </div>
                      <div className="gb-row gb-row-3" style={{ marginTop: "var(--space-1)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                          <Users style={{ width: 14, height: 14 }} />
                          {cls.memberCount || 0}명
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", fontFamily: "monospace", color: "var(--color-text-tertiary)" }}>
                          <Hash style={{ width: 12, height: 12 }} />
                          {cls.inviteCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="gb-card">
          <div className="gb-empty-state" style={{ padding: "var(--space-16) var(--space-4)" }}>
            <div className="gb-empty-icon">📚</div>
            <div className="gb-empty-title">아직 클래스가 없습니다</div>
            <div className="gb-empty-desc">클래스를 생성하고 학생들을 초대해보세요</div>
            <button className="gb-btn gb-btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setShowCreateModal(true)}>
              <Plus style={{ width: 16, height: 16 }} />
              첫 클래스 만들기
            </button>
          </div>
        </div>
      )}

      {/* 선택된 클래스 상세 */}
      {selectedArena && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-6)" }}>
          {/* Left: 정보 */}
          <div className="gb-stack gb-stack-4">
            {/* 초대 코드 */}
            <div className="gb-card">
              <div className="gb-stat-label">초대 코드</div>
              <div className="gb-row gb-row-3" style={{ marginTop: "var(--space-2)" }}>
                <code style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", fontFamily: "monospace", letterSpacing: "0.2em", color: "var(--color-primary)" }}>
                  {selectedArena.inviteCode}
                </code>
                <button
                  onClick={() => copyInviteCode(selectedArena.inviteCode)}
                  className="gb-header-icon-btn"
                  style={{ background: "var(--color-primary-50, var(--color-bg-secondary))", color: "var(--color-primary)" }}
                >
                  {copiedCode === selectedArena.inviteCode ? (
                    <CheckCircle2 style={{ width: 16, height: 16, color: "var(--color-success)" }} />
                  ) : (
                    <Copy style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-2)" }}>
                학생에게 이 코드를 공유하세요
              </div>
            </div>

            {/* Quick Actions */}
            <Link href={`/class-management/students?id=${selectedArena.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="gb-card" style={{ cursor: "pointer" }}>
                <div className="gb-row gb-row-3">
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 40, height: 40, borderRadius: "var(--radius-md)",
                    background: "var(--color-primary-50, var(--color-bg-secondary))",
                  }}>
                    <UserPlus style={{ width: 20, height: 20, color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text)" }}>학생 임포트</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>학생 ID로 일괄 등록</div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={`/class-management/stats?id=${selectedArena.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="gb-card" style={{ cursor: "pointer" }}>
                <div className="gb-row gb-row-3">
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 40, height: 40, borderRadius: "var(--radius-md)",
                    background: "var(--color-primary-50, var(--color-bg-secondary))",
                  }}>
                    <BarChart3 style={{ width: 20, height: 20, color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text)" }}>학습 통계</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>일간/주간 학습량 분석</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: 멤버 목록 */}
          <div className="gb-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="gb-row gb-row-3" style={{ padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--color-border-light)", justifyContent: "space-between" }}>
              <div className="gb-row gb-row-2">
                <Users style={{ width: 18, height: 18, color: "var(--color-primary)" }} />
                <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-base)" }}>멤버 목록</span>
                {members.length > 0 && (
                  <span className="gb-badge gb-badge-primary">{members.length}명</span>
                )}
              </div>
              <Link href={`/class-management/students?id=${selectedClass}`}>
                <button className="gb-btn gb-btn-outline gb-btn-sm">
                  <UserPlus style={{ width: 16, height: 16 }} />
                  학생 추가
                </button>
              </Link>
            </div>

            <div style={{ padding: "var(--space-3) var(--space-4)" }}>
              {membersLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-12) 0" }}>
                  <Loader2 style={{ width: 24, height: 24, color: "var(--color-text-disabled)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : members.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 500 }}>#</th>
                      <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 500 }}>이름</th>
                      <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)", fontWeight: 500 }}>아이디</th>
                      <th style={{ textAlign: "right", padding: "var(--space-2) var(--space-3)", fontWeight: 500 }}>역할</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr key={member.memberId} style={{ borderTop: "1px solid var(--color-border-light)" }}>
                        <td style={{ padding: "var(--space-3)" }}>
                          <span style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: "var(--radius-full)",
                            background: "var(--color-bg-secondary)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                          }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ padding: "var(--space-3)" }}>
                          <div className="gb-row gb-row-3">
                            <div style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              width: 32, height: 32, borderRadius: "var(--radius-full)",
                              background: "var(--color-primary-50, var(--color-bg-secondary))",
                              fontSize: "var(--text-xs)", fontWeight: "var(--weight-bold)", color: "var(--color-primary)",
                            }}>
                              {member.nickname?.charAt(0) || "?"}
                            </div>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{member.nickname}</span>
                          </div>
                        </td>
                        <td style={{ padding: "var(--space-3)", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                          {member.authMemberId || member.email || "—"}
                        </td>
                        <td style={{ padding: "var(--space-3)", textAlign: "right" }}>
                          <span className={`gb-badge ${member.role === "owner" ? "gb-badge-warning" : "gb-badge-primary"}`} style={{ gap: 4 }}>
                            {member.role === "owner" ? <><Crown style={{ width: 12, height: 12 }} /> 관리자</> : <><User style={{ width: 12, height: 12 }} /> 학생</>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="gb-empty-state" style={{ padding: "var(--space-12) var(--space-4)" }}>
                  <div className="gb-empty-icon">👥</div>
                  <div className="gb-empty-title">등록된 멤버가 없습니다</div>
                  <div className="gb-empty-desc">&quot;학생 추가&quot; 버튼으로 학생을 등록하세요</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 클래스 생성 모달 ─── */}
      {showCreateModal && (
        <div className="gb-modal-overlay">
          <div className="gb-modal">
            <div className="gb-row" style={{ justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
              <h2 className="gb-modal-title" style={{ marginBottom: 0 }}>새 클래스 생성</h2>
              <button className="gb-header-icon-btn" onClick={() => setShowCreateModal(false)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div className="gb-stack gb-stack-4">
              <div>
                <label className="gb-input-label">
                  클래스 이름 <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <input
                  type="text"
                  className="gb-input"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 고2 수학반 A"
                  autoFocus
                />
              </div>
              <div>
                <label className="gb-input-label">설명</label>
                <textarea
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="클래스에 대한 설명을 입력하세요 (선택)"
                  rows={3}
                  className="gb-input"
                  style={{ height: "auto", padding: "var(--space-3) var(--space-4)", resize: "none" }}
                />
              </div>
            </div>
            <div className="gb-modal-actions" style={{ marginTop: "var(--space-6)", justifyContent: "flex-end" }}>
              <button className="gb-btn gb-btn-secondary" onClick={() => setShowCreateModal(false)}>취소</button>
              <button
                className="gb-btn gb-btn-primary"
                onClick={handleCreateClass}
                disabled={creating || !newClassName.trim()}
              >
                {creating ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Plus style={{ width: 16, height: 16 }} />}
                생성
              </button>
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
