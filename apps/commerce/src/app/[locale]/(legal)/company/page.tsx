import type { Metadata } from 'next';
import { COMPANY, displayOrPending } from '@/lib/legal/company';
import { DefinitionList, LegalHeader, LegalSection } from '../_components/LegalShell';

export const metadata: Metadata = {
  title: '회사 정보',
  description: `${COMPANY.brandName} 운영 회사 및 사업자 정보`,
};

const LAST_UPDATED = '2026-06-11';

export default function CompanyPage() {
  return (
    <>
      <LegalHeader
        title="회사 정보"
        lastUpdated={LAST_UPDATED}
        summary={`${COMPANY.brandName}을 운영하는 ${COMPANY.legalName}의 사업자 정보입니다.`}
      />

      <LegalSection title="기본 정보">
        <DefinitionList
          items={[
            { term: '상호', value: COMPANY.legalName },
            { term: '대표자', value: displayOrPending(COMPANY.representative) },
            { term: '사업자등록번호', value: displayOrPending(COMPANY.businessNumber) },
            { term: '통신판매업 신고번호', value: displayOrPending(COMPANY.mailOrderNumber) },
            { term: '사업장 주소', value: displayOrPending(COMPANY.address) },
            { term: '호스팅 제공자', value: COMPANY.hostingProvider },
          ]}
        />
      </LegalSection>

      <LegalSection title="고객센터">
        <DefinitionList
          items={[
            { term: '전화', value: displayOrPending(COMPANY.phone) },
            { term: '이메일', value: COMPANY.email },
            { term: '운영 시간', value: COMPANY.customerHours },
          ]}
        />
      </LegalSection>

      <LegalSection title="개인정보보호">
        <DefinitionList
          items={[
            { term: '책임자', value: displayOrPending(COMPANY.privacyOfficer) },
            { term: '이메일', value: COMPANY.privacyOfficerEmail },
          ]}
        />
        <p className="text-[13px] text-[var(--mz-ink-mute)]">
          개인정보 처리에 관한 자세한 내용은 <a className="underline" href="/privacy">
          개인정보처리방침</a>을 참고해 주세요.
        </p>
      </LegalSection>
    </>
  );
}
