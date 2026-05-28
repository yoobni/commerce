import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, PageHeader } from '@/components/ui';

export const metadata = { title: '설정' };

/**
 * 설정 페이지 — SUPER_ADMIN 전용.
 * 현재는 placeholder (실제 설정 항목은 추후 추가).
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="설정"
        description="시스템 환경설정 · SUPER_ADMIN만 접근 가능합니다."
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <SettingsIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="max-w-md space-y-1">
            <p className="text-[14px] font-medium text-foreground">설정 항목이 준비 중입니다</p>
            <p className="text-[12.5px] text-muted-foreground">
              관리자 계정 · 권한 · 알림 · 시스템 환경 등의 설정이 추가될 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
