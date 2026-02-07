"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Home,
} from "lucide-react";

// Mock 데이터
const mockParents = [
  {
    id: 1,
    name: "김영수",
    studentName: "김철수",
    class: "A반",
    phone: "010-1234-5678",
    email: "parent1@example.com",
    lastContact: "2일 전",
    unreadMessages: 1,
  },
  {
    id: 2,
    name: "이미숙",
    studentName: "이영희",
    class: "A반",
    phone: "010-2345-6789",
    email: "parent2@example.com",
    lastContact: "1주일 전",
    unreadMessages: 0,
  },
  {
    id: 3,
    name: "박준호",
    studentName: "박민수",
    class: "A반",
    phone: "010-3456-7890",
    email: "parent3@example.com",
    lastContact: "3일 전",
    unreadMessages: 2,
  },
];

const mockReports = [
  {
    id: 1,
    studentName: "김철수",
    title: "3월 중간고사 결과 리포트",
    date: "2025-03-18",
    status: "발송완료",
  },
  {
    id: 2,
    studentName: "이영희",
    title: "3월 학습 진도 리포트",
    date: "2025-03-15",
    status: "발송완료",
  },
  {
    id: 3,
    studentName: "박민수",
    title: "출결 현황 안내",
    date: "2025-03-12",
    status: "미발송",
  },
];

export default function ParentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredParents = mockParents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <Header title="학부모 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 검색 */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="학부모명 또는 학생명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 학부모 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>학부모 연락처</CardTitle>
              <Button size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                일괄 메시지 발송
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredParents.map((parent) => (
                <div
                  key={parent.id}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Home className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{parent.name}</p>
                          {parent.unreadMessages > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                              {parent.unreadMessages}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          자녀: {parent.studentName} ({parent.class})
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {parent.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {parent.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            최근 연락: {parent.lastContact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        전화
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        쪽지
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        이메일
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 발송 리포트 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>학부모 리포트 관리</CardTitle>
              <Button size="sm">
                <FileText className="w-4 h-4 mr-2" />
                새 리포트 작성
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.studentName} | {report.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === "발송완료"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {report.status}
                    </span>
                    <Button variant="outline" size="sm">
                      {report.status === "발송완료" ? "다시보기" : "발송하기"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




























