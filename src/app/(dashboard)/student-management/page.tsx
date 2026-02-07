"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MessageSquare,
  ExternalLink,
  Calendar,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";

// Mock 데이터
const mockStudents = [
  {
    id: 1,
    name: "김철수",
    class: "A반",
    number: 1,
    plannerCompletion: 85,
    lastAccess: "2시간 전",
    unreadMessages: 2,
  },
  {
    id: 2,
    name: "이영희",
    class: "A반",
    number: 2,
    plannerCompletion: 92,
    lastAccess: "30분 전",
    unreadMessages: 0,
  },
  {
    id: 3,
    name: "박민수",
    class: "A반",
    number: 3,
    plannerCompletion: 76,
    lastAccess: "5시간 전",
    unreadMessages: 1,
  },
  {
    id: 4,
    name: "정수진",
    class: "B반",
    number: 1,
    plannerCompletion: 88,
    lastAccess: "1시간 전",
    unreadMessages: 3,
  },
];

const mockMessages = [
  {
    id: 1,
    studentId: 1,
    studentName: "김철수",
    content: "선생님, 수학 숙제 관련해서 질문이 있습니다.",
    time: "2시간 전",
    isRead: false,
  },
  {
    id: 2,
    studentId: 4,
    studentName: "정수진",
    content: "과제 제출 완료했습니다!",
    time: "3시간 전",
    isRead: false,
  },
  {
    id: 3,
    studentId: 2,
    studentName: "이영희",
    content: "감사합니다 선생님",
    time: "1일 전",
    isRead: true,
  },
];

export default function StudentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadMessages = mockMessages.filter((msg) => !msg.isRead).length;

  return (
    <div className="flex flex-col">
      <Header title="학생 관리" />

      <div className="flex-1 p-6 space-y-6">
        {/* 검색 및 통계 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-3">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="학생 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{unreadMessages}</p>
                <p className="text-sm text-muted-foreground">읽지 않은 쪽지</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 탭 */}
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access">
              <ExternalLink className="w-4 h-4 mr-2" />
              학생 페이지 접근
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              쪽지 ({unreadMessages})
            </TabsTrigger>
          </TabsList>

          {/* 학생 페이지 접근 */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>학생 목록 (플래너 검사 가능)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {student.class}
                          <br />
                          {student.number}
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              최근 접속: {student.lastAccess}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClipboardCheck className="w-3 h-3" />
                              플래너: {student.plannerCompletion}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          플래너 검사
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          페이지 접근
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 쪽지 */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>받은 쪽지함</CardTitle>
                  <Button size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    새 쪽지 보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        !message.isRead
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedStudent(message.studentId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {!message.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                          <p className="font-medium">{message.studentName}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {message.time}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

