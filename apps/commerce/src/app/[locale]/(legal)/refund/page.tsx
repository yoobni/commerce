import type { Metadata } from 'next';
import { COMPANY } from '@/lib/legal/company';
import { LegalHeader, LegalSection } from '../_components/LegalShell';

export const metadata: Metadata = {
  title: '교환 / 환불 정책',
  description: `${COMPANY.brandName} 교환 및 환불 정책`,
};

const LAST_UPDATED = '2026-06-11';

export default function RefundPage() {
  return (
    <>
      <LegalHeader
        title="교환 / 환불 정책"
        lastUpdated={LAST_UPDATED}
        summary="「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라 청약철회 권리를 보장합니다."
      />

      <LegalSection title="청약 철회 기간">
        <ul className="list-disc pl-5 space-y-1">
          <li>단순 변심 — 상품 수령일로부터 7일 이내</li>
          <li>상품 하자 또는 표시·광고 내용과 다른 경우 — 상품 수령일로부터 3개월 이내, 그 사실을
            안 날 또는 알 수 있었던 날로부터 30일 이내</li>
        </ul>
      </LegalSection>

      <LegalSection title="교환 / 환불이 불가한 경우">
        <ul className="list-disc pl-5 space-y-1">
          <li>회원의 책임 있는 사유로 상품이 멸실되거나 훼손된 경우 (포장 개봉으로 인한 가치 감소
            포함, 단 상품 확인을 위한 개봉은 제외)</li>
          <li>회원의 사용 또는 일부 소비로 인하여 상품의 가치가 현저히 감소한 경우</li>
          <li>시간 경과에 의해 재판매가 곤란할 정도로 상품의 가치가 현저히 감소한 경우</li>
          <li>주문 제작 상품 등 개봉으로 인해 상품의 가치가 현저히 감소하는 경우 (사전 고지)</li>
        </ul>
      </LegalSection>

      <LegalSection title="배송비 부담">
        <ul className="list-disc pl-5 space-y-1">
          <li>단순 변심 — 왕복 배송비 회원 부담</li>
          <li>상품 하자 또는 오배송 — 회사 전액 부담</li>
        </ul>
      </LegalSection>

      <LegalSection title="환불 처리 절차">
        <ol className="list-decimal pl-5 space-y-1">
          <li>마이페이지 &gt; 주문내역에서 환불 요청, 또는 고객센터({COMPANY.email}) 접수</li>
          <li>회수 운송장 발송, 회수 완료 후 상품 확인 (영업일 기준 2~3일)</li>
          <li>결제 수단별 환불 처리 (카드 취소 3~5영업일, 무통장입금 1~2영업일)</li>
        </ol>
      </LegalSection>

      <LegalSection title="쿠폰 / 포인트 처리">
        <p>주문에 사용된 쿠폰 및 포인트는 전액 환불 시 자동 복구됩니다. 부분 환불의 경우 사용
          내역에 비례하여 처리됩니다.</p>
      </LegalSection>
    </>
  );
}
