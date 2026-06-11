import type { Metadata } from 'next';
import { COMPANY, displayOrPending } from '@/lib/legal/company';
import { LegalHeader, LegalSection } from '../_components/LegalShell';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: `${COMPANY.brandName} 개인정보처리방침`,
};

const LAST_UPDATED = '2026-06-11';

export default function PrivacyPage() {
  return (
    <>
      <LegalHeader
        title="개인정보처리방침"
        lastUpdated={LAST_UPDATED}
        summary={`${COMPANY.legalName}(이하 "회사")는 「개인정보 보호법」 등 관련 법령을 준수하며 회원의 개인정보를 안전하게 관리합니다.`}
      />

      <LegalSection title="1. 수집하는 개인정보 항목 및 수집 방법">
        <p>
          회사는 회원가입, 상품 주문, 고객 문의 등 서비스 제공을 위해 다음의 개인정보를 수집합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>필수 — 이메일 주소, 비밀번호(암호화 저장), 이름, 휴대전화번호, 배송 주소</li>
          <li>선택 — 프로필 이미지, 반려견 정보(품종/체중/사이즈)</li>
          <li>자동 수집 — 접속 IP, 브라우저 정보, 쿠키, 서비스 이용 기록</li>
          <li>결제 시 — 결제 수단별 결제 정보 (PG사를 통해 처리, 회사 서버에는 저장하지 않음)</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. 개인정보의 수집 및 이용 목적">
        <ul className="list-disc pl-5 space-y-1">
          <li>회원 식별 및 본인 확인, 가입 의사 확인, 부정 이용 방지</li>
          <li>상품 주문, 결제, 배송 등 계약 이행</li>
          <li>고객 문의·불만 처리, 공지사항 전달</li>
          <li>맞춤형 상품 추천, 서비스 개선을 위한 통계 분석</li>
          <li>법령상 의무 이행 (전자상거래법, 통신비밀보호법 등)</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 개인정보의 보유 및 이용 기간">
        <p>
          회사는 원칙적으로 개인정보 수집·이용 목적이 달성되면 지체 없이 파기합니다. 다만 관련
          법령에 따라 보관이 필요한 경우 다음 기간 동안 보관합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>계약 또는 청약철회 등에 관한 기록 — 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록 — 5년 (전자상거래법)</li>
          <li>소비자의 불만 또는 분쟁처리에 관한 기록 — 3년 (전자상거래법)</li>
          <li>로그인 기록 — 3개월 (통신비밀보호법)</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. 개인정보의 제3자 제공">
        <p>
          회사는 회원의 개인정보를 본 방침에서 고지한 범위를 초과하여 이용하거나 제3자에게 제공하지
          않습니다. 다만 다음의 경우는 예외로 합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>회원이 사전에 동의한 경우 (예: 배송업체에 배송 정보 제공)</li>
          <li>법령에 의거하거나 수사기관의 적법한 절차에 의한 요구가 있는 경우</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. 개인정보 처리 위탁">
        <p>
          회사는 서비스 향상 및 원활한 업무 처리를 위해 다음 업무를 외부에 위탁할 수 있으며,
          위탁업체와 위탁 업무 내용은 변경 시 사전에 공지합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>결제 처리 — Toss Payments 등 PG사</li>
          <li>배송 — 택배사 (CJ대한통운, 한진택배 등)</li>
          <li>호스팅 / 데이터 처리 — {COMPANY.hostingProvider}</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. 회원의 권리와 행사 방법">
        <p>
          회원은 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있습니다.
          마이페이지 또는 개인정보보호 책임자에게 서면, 전화, 이메일로 요청해 주시면 지체 없이
          조치합니다.
        </p>
      </LegalSection>

      <LegalSection title="7. 쿠키의 운영 및 거부">
        <p>
          회사는 회원에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용합니다. 회원은 브라우저 설정을
          통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="8. 개인정보보호 책임자">
        <p>
          개인정보 처리에 관한 업무를 총괄해서 책임지고, 회원의 불만 처리 및 피해 구제를 위해
          개인정보보호 책임자를 지정하고 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>책임자: {displayOrPending(COMPANY.privacyOfficer)}</li>
          <li>연락처: {COMPANY.privacyOfficerEmail}</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. 개인정보처리방침의 변경">
        <p>
          본 방침은 시행일로부터 적용되며, 변경되는 경우 시행일자 7일 전부터 서비스 내 공지사항을
          통해 안내합니다.
        </p>
      </LegalSection>

      <p className="mt-12 text-[12px] text-[var(--mz-ink-mute)]">
        본 방침은 {LAST_UPDATED}부터 적용됩니다.
      </p>
    </>
  );
}
