/**
 * InfoSection — Card + uppercase 타이틀의 detail 페이지 표준 섹션.
 * 우측 액션이 필요하면 actions prop 사용.
 */
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export interface InfoSectionProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InfoSection({ title, actions, children, className }: InfoSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
