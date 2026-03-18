"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  Home,
  Loader2,
  Users,
  UserRound,
} from "lucide-react";
import { getMyClasses, getClassStudents } from "@/lib/api/teacher";
import type { ClassInfo, StudentInfo } from "@/lib/api/teacher";

interface ParentInfo {
  id: string;
  name: string;
  studentName: string;
  className: string;
  phone: string;
  email: string;
}

export default function ParentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParentInfo() {
      try {
        setLoading(true);
        const classes = await getMyClasses();
        const parentPromises = (classes || []).map(async (cls: ClassInfo) => {
          const students = await getClassStudents(cls.id);
          return (students || []).map((s: StudentInfo) => ({
            id: `parent-${s.id}`,
            name: `${s.name} 학부모`,
            studentName: s.name,
            className: cls.name,
            phone: '',
            email: '',
          }));
        });
        const results = await Promise.all(parentPromises);
        setParents(results.flat());
      } catch (err) {
        console.error('Failed to fetch parent info:', err);
        setParents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchParentInfo();
  }, []);

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const classCount = new Set(parents.map(p => p.className)).size;

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
          <h1 className="gb-page-title">학부모 관리</h1>
          <p className="gb-page-desc">학부모 연락처와 소통 현황을 확인하세요</p>
        </div>
        <button className="gb-btn gb-btn-primary">
          <MessageSquare style={{ width: 18, height: 18 }} />
          일괄 메시지 발송
        </button>
      </div>

      {/* 상단: 통계 카드 */}
      <div className="gb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        <StatCard label="전체 학부모" value={parents.length} unit="명" icon={Users} />
        <StatCard label="담당 학생" value={parents.length} unit="명" icon={UserRound} />
        <StatCard label="소속 반" value={classCount} unit="개" icon={Home} />
      </div>

      {/* 검색 */}
      <div style={{ position: "relative", maxWidth: 400 }}>
        <Search style={{
          position: "absolute", left: "var(--space-4)", top: "50%", transform: "translateY(-50%)",
          width: 16, height: 16, color: "var(--color-text-disabled)", pointerEvents: "none",
        }} />
        <input
          type="text"
          className="gb-input"
          placeholder="학부모명 또는 학생명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* 학부모 카드 그리드 */}
      {filteredParents.length > 0 ? (
        <div className="gb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filteredParents.map((parent) => (
            <div key={parent.id} className="gb-card">
              <div className="gb-row gb-row-3" style={{ marginBottom: "var(--space-3)" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "var(--color-primary-50, var(--color-bg-secondary))",
                  flexShrink: 0,
                }}>
                  <Home style={{ width: 20, height: 20, color: "var(--color-primary)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {parent.name}
                  </div>
                  <div className="gb-row gb-row-2" style={{ marginTop: "var(--space-1)" }}>
                    <span className="gb-badge gb-badge-neutral" style={{ gap: 4 }}>
                      <UserRound style={{ width: 12, height: 12 }} />
                      {parent.studentName}
                    </span>
                    <span className="gb-badge gb-badge-primary" style={{ gap: 4 }}>
                      {parent.className}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-light)" }}>
                <button className="gb-btn gb-btn-outline gb-btn-sm gb-btn-full">
                  <MessageSquare style={{ width: 16, height: 16 }} />
                  쪽지 보내기
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gb-card">
          <div className="gb-empty-state" style={{ padding: "var(--space-16) var(--space-4)" }}>
            <div className="gb-empty-icon">👨‍👩‍👧</div>
            <div className="gb-empty-title">
              {searchTerm ? "검색 결과가 없습니다" : "등록된 학부모가 없습니다"}
            </div>
            <div className="gb-empty-desc">
              {searchTerm
                ? "다른 검색어를 시도해보세요"
                : "학생이 등록되면 학부모 정보가 자동으로 표시됩니다"}
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
