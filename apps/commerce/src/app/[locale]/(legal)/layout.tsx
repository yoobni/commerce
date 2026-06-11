import { Container } from '@/components/layout/Container';

// 정책 / 약관 페이지 공통 레이아웃. 본문은 한국어 기준으로 작성하되 페이지
// chrome (제목 frame, breadcrumb 등) 만 노출합니다.

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--mz-bg)] min-h-[calc(100vh-56px)] py-10 md:py-16">
      <Container className="max-w-[760px]">
        <article className="prose-legal text-[var(--mz-ink)]">{children}</article>
      </Container>
    </div>
  );
}
