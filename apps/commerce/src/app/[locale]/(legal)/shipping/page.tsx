import type { Metadata } from 'next';
import { COMPANY } from '@/lib/legal/company';
import { LegalHeader, LegalSection } from '../_components/LegalShell';

export const metadata: Metadata = {
  title: '배송 안내',
  description: `${COMPANY.brandName} 배송 정책 안내`,
};

const LAST_UPDATED = '2026-06-11';

export default function ShippingPage() {
  return (
    <>
      <LegalHeader title="배송 안내" lastUpdated={LAST_UPDATED} />

      <LegalSection title="배송 지역">
        <p>전국 (제주 및 도서산간 지역 포함). 일부 도서산간 지역은 추가 배송비가 발생할 수 있습니다.</p>
        <p>해외 배송은 국가에 따라 별도 안내합니다. 현재 영어·일본어·독일어 사이트에서 접수되는
          주문은 EMS/DHL 등을 통해 발송됩니다.</p>
      </LegalSection>

      <LegalSection title="배송 비용">
        <ul className="list-disc pl-5 space-y-1">
          <li>국내 — 50,000원 이상 구매 시 무료, 미만 시 3,000원 (제주·도서산간 추가 3,000원)</li>
          <li>EU — 50EUR 이상 무료, 미만 시 5EUR</li>
          <li>US/UK — 50USD 이상 무료, 미만 시 5USD</li>
          <li>JP — 5,000JPY 이상 무료, 미만 시 500JPY</li>
        </ul>
      </LegalSection>

      <LegalSection title="배송 기간">
        <ul className="list-disc pl-5 space-y-1">
          <li>국내 — 결제 완료 후 영업일 기준 1~3일 (도서산간 지역 1~2일 추가)</li>
          <li>해외 — 결제 완료 후 영업일 기준 5~10일 (통관 사정에 따라 변동)</li>
        </ul>
        <p>주문 폭주, 천재지변, 택배사 사정 등 부득이한 경우 배송이 지연될 수 있습니다. 지연 시
          회원에게 별도 안내합니다.</p>
      </LegalSection>

      <LegalSection title="배송 추적">
        <p>발송 완료 시 운송장 번호가 등록되며, 마이페이지 &gt; 주문내역 또는 발송 안내 이메일에서
          실시간 배송 상태를 확인할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="문의">
        <p>배송 관련 문의는 고객센터({COMPANY.email})로 연락 주시기 바랍니다.</p>
      </LegalSection>
    </>
  );
}
