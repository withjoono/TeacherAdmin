import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class HubGroupsClient {
  private readonly logger = new Logger(HubGroupsClient.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly serviceId: string;

  constructor() {
    this.baseUrl = process.env.HUB_BACKEND_URL ?? 'http://localhost:4000';
    this.token = process.env.HUB_SERVICE_TOKEN ?? '';
    this.serviceId = process.env.HUB_SERVICE_ID ?? 'teacher_admin';
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      'X-Service-Id': this.serviceId,
    };
  }

  private async call<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let res: Response;
    try {
      res = await fetch(url, {
        ...opts,
        headers: { ...this.headers(), ...(opts.headers as Record<string, string> ?? {}) },
      });
    } catch (err) {
      this.logger.error(`Hub API 연결 실패 (${url}): ${err}`);
      throw new InternalServerErrorException('Hub API 연결 오류');
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Hub API 오류 ${res.status} (${url}): ${text}`);
      throw new InternalServerErrorException(`Hub API 오류: ${res.status}`);
    }
    const body: any = await res.json();
    return body.data ?? body;
  }

  async createTeacherGroup(dto: {
    teacherHubId: string;
    name: string;
    subject?: string;
    description?: string;
    maxMembers?: number;
  }): Promise<any> {
    return this.call('/api/internal/groups/teacher', {
      method: 'POST',
      body: JSON.stringify({ ...dto, sourceApp: 'teacher_admin' }),
    });
  }

  async addStudents(
    groupId: string,
    teacherHubId: string,
    studentIds: string[],
  ): Promise<any> {
    return this.call(`/api/internal/groups/teacher/${groupId}/students`, {
      method: 'POST',
      body: JSON.stringify({ teacherHubId, studentIds }),
    });
  }
}
