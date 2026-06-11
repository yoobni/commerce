import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { COMPANY, displayOrPending } from '@/lib/legal/company';

// Footer columns:
//   Shop / Community / Account — existing
//   Support — FAQ + Shipping + Refund
//
// Business info row sits beneath the columns and pulls from
// apps/commerce/src/lib/legal/company.ts. 사업자번호 등 placeholder("TBD")
// 는 화면에 "(준비 중)" 으로 표시됩니다 — 그 파일 한 곳만 수정하면 푸터와
// /company 페이지에 동시 반영.

export async function Footer() {
  const t = await getTranslations('nav');
  const tMeta = await getTranslations('meta');

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-auto">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] md:px-[var(--container-padding-md)] py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3 md:max-w-[220px]">
            <Link
              href="/"
              className="inline-block font-bold text-lg tracking-[0.2em] text-[var(--color-brand-primary)]"
            >
              {COMPANY.brandName}
            </Link>
            <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
              {tMeta('description')}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6">
            <FooterColumn title="Shop">
              <FooterLink href="/products">{t('shop')}</FooterLink>
              <FooterLink href="/search">{t('search')}</FooterLink>
            </FooterColumn>

            <FooterColumn title="Community">
              <FooterLink href="/community">{t('community')}</FooterLink>
            </FooterColumn>

            <FooterColumn title="Account">
              <FooterLink href="/account">{t('account')}</FooterLink>
              <FooterLink href="/cart">{t('cart')}</FooterLink>
            </FooterColumn>

            <FooterColumn title="Support">
              <FooterLink href="/faq">자주 묻는 질문</FooterLink>
              <FooterLink href="/shipping">배송 안내</FooterLink>
              <FooterLink href="/refund">교환/환불</FooterLink>
            </FooterColumn>
          </div>
        </div>

        {/* Legal links row */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--color-text-secondary)]">
          <Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">
            <strong>개인정보처리방침</strong>
          </Link>
          <Link href="/company" className="hover:text-[var(--color-text-primary)] transition-colors">
            회사 정보
          </Link>
        </div>

        {/* Business info — 전자상거래법 § 13 의무 표시 */}
        <address className="not-italic mt-4 text-[11px] leading-[1.7] text-[var(--color-text-tertiary)] space-y-0.5">
          <p>
            <strong className="font-medium text-[var(--color-text-secondary)]">
              {COMPANY.legalName}
            </strong>
            {' · '}대표 {displayOrPending(COMPANY.representative)}
          </p>
          <p>
            사업자등록번호 {displayOrPending(COMPANY.businessNumber)}
            {' · '}통신판매업 신고 {displayOrPending(COMPANY.mailOrderNumber)}
          </p>
          <p>주소 {displayOrPending(COMPANY.address)}</p>
          <p>
            고객센터 {displayOrPending(COMPANY.phone)} · {COMPANY.email}
            {' · '}{COMPANY.customerHours}
          </p>
        </address>

        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[var(--color-text-tertiary)]">
          <p>
            &copy; {COMPANY.foundedYear}–{new Date().getFullYear()} {tMeta('siteName')}. All rights reserved.
          </p>
          <p>Premium Large Dog Apparel</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
        {title}
      </p>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
