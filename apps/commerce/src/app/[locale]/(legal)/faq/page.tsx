import type { Metadata } from 'next';
import { COMPANY, displayOrPending } from '@/lib/legal/company';
import { LegalHeader, LegalSection } from '../_components/LegalShell';

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description: `${COMPANY.brandName} 자주 묻는 질문과 고객센터 안내`,
};

const LAST_UPDATED = '2026-06-11';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: { category: string; items: FAQItem[] }[] = [
  {
    category: '주문 / 결제',
    items: [
      {
        q: '주문 후 결제 수단을 바꿀 수 있나요?',
        a: '결제 완료된 주문은 결제 수단 변경이 불가합니다. 주문 취소 후 다시 주문해 주세요.',
      },
      {
        q: '해외에서도 주문할 수 있나요?',
        a: '영어 / 일본어 / 독일어 사이트에서 주문이 가능하며, 해외 배송비는 지역별로 안내됩니다.',
      },
    ],
  },
  {
    category: '배송',
    items: [
      {
        q: '배송 조회는 어떻게 하나요?',
        a: '마이페이지 > 주문 내역에서 운송장 번호를 확인하거나, 발송 안내 이메일의 링크로 추적할 수 있습니다.',
      },
      {
        q: '배송지 변경이 가능한가요?',
        a: '발송 전 상태(준비 중)에서는 고객센터로 문의 주시면 변경해드립니다. 발송 후에는 변경이 어렵습니다.',
      },
    ],
  },
  {
    category: '교환 / 환불',
    items: [
      {
        q: '단순 변심으로 환불할 수 있나요?',
        a: '상품 수령 후 7일 이내 청약 철회가 가능합니다. 왕복 배송비는 회원 부담입니다.',
      },
      {
        q: '환불은 얼마나 걸리나요?',
        a: '회수 완료 후 영업일 기준 2~3일 내 상품 확인 후, 결제 수단에 따라 1~5영업일 내 환불됩니다.',
      },
    ],
  },
  {
    category: '회원',
    items: [
      {
        q: '회원 탈퇴는 어떻게 하나요?',
        a: '마이페이지 > 설정에서 탈퇴 신청이 가능합니다. 단, 진행 중인 주문이 있다면 완료 후 탈퇴할 수 있습니다.',
      },
      {
        q: '비밀번호를 잊어버렸어요.',
        a: '로그인 페이지의 "비밀번호 찾기"에서 가입 이메일을 입력하시면 재설정 링크를 보내드립니다.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <LegalHeader
        title="자주 묻는 질문"
        lastUpdated={LAST_UPDATED}
        summary="고객센터에 문의가 많은 항목을 정리했습니다. 답변이 없으면 직접 문의 주세요."
      />

      {FAQS.map((group) => (
        <LegalSection key={group.category} title={group.category}>
          <dl className="space-y-5">
            {group.items.map((it) => (
              <div key={it.q}>
                <dt className="text-[14px] font-[500] text-[var(--mz-ink)] mb-1">Q. {it.q}</dt>
                <dd className="text-[14px] leading-[1.7] text-[var(--mz-ink-soft)]">A. {it.a}</dd>
              </div>
            ))}
          </dl>
        </LegalSection>
      ))}

      <LegalSection title="추가 문의">
        <p>
          위 내용에서 답을 찾지 못하셨다면 고객센터로 연락해 주세요.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>이메일: {COMPANY.email}</li>
          <li>전화: {displayOrPending(COMPANY.phone)}</li>
          <li>운영 시간: {COMPANY.customerHours}</li>
        </ul>
      </LegalSection>
    </>
  );
}
