import type { Metadata } from 'next';
import { COMPANY } from '@/lib/legal/company';
import { LegalHeader, LegalSection } from '../_components/LegalShell';

export const metadata: Metadata = {
  title: '이용약관',
  description: `${COMPANY.brandName} 서비스 이용약관`,
};

const LAST_UPDATED = '2026-06-11';

export default function TermsPage() {
  return (
    <>
      <LegalHeader
        title="이용약관"
        lastUpdated={LAST_UPDATED}
        summary={`본 약관은 ${COMPANY.legalName}(이하 "회사")이 운영하는 ${COMPANY.brandName} 서비스의 이용 조건을 규정합니다.`}
      />

      <LegalSection title="제1조 (목적)">
        <p>
          본 약관은 회원이 회사가 제공하는 서비스를 이용함에 있어 회사와 회원의 권리, 의무 및
          책임사항을 규정함을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (정의)">
        <p>
          "회원"이란 본 약관에 동의하고 회사가 제공하는 서비스에 가입하여 이용하는 자를 말합니다.
          "서비스"는 회사가 운영하는 웹사이트 및 모바일 환경에서 제공하는 상품 판매, 커뮤니티 등
          일체의 서비스를 의미합니다.
        </p>
      </LegalSection>

      <LegalSection title="제3조 (약관의 효력 및 변경)">
        <p>
          본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이
          발생합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 변경된
          약관은 적용일자 7일 이전에 공지합니다. 회원에게 불리한 변경의 경우 30일 이전에
          공지합니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조 (회원가입)">
        <p>
          회원가입은 이용자가 약관에 동의한 후 회원가입 양식에 따른 정보를 입력하고 회사가 이를
          승낙함으로써 체결됩니다. 회사는 본인 명의가 아니거나 허위 정보로 신청한 경우, 또는 이미
          가입된 회원과 동일한 정보로 신청한 경우 가입을 거절할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제5조 (서비스의 제공 및 변경)">
        <p>
          회사는 상품 정보 제공, 구매 계약 체결, 주문 및 결제 처리, 배송, 커뮤니티 운영 등의
          서비스를 제공합니다. 서비스의 내용은 운영상·기술상 필요에 따라 변경될 수 있으며 변경 시
          그 내용을 사전에 공지합니다.
        </p>
      </LegalSection>

      <LegalSection title="제6조 (구매 신청 및 계약 성립)">
        <p>
          이용자는 서비스를 통해 상품 구매를 신청할 수 있으며, 회사가 결제 완료 사실을 통보함으로써
          매매 계약이 성립합니다. 회사는 재고 부족, 결제 오류 등 정당한 사유가 있는 경우 구매
          신청을 승낙하지 않을 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제7조 (대금 결제 및 환불)">
        <p>
          상품 결제 수단은 신용카드, 간편결제, 무통장입금 등 회사가 제공하는 방법으로 합니다. 환불
          및 청약철회는 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령과 회사의
          교환/환불 정책에 따라 처리됩니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조 (회원의 의무)">
        <p>
          회원은 관련 법령, 본 약관 및 회사가 통지하는 사항을 준수해야 하며, 다음의 행위를 해서는
          안 됩니다. 타인의 정보 도용, 회사의 운영 방해, 음란·폭력·차별적 표현물 게시, 상업적 광고
          또는 스팸, 기타 공서양속에 반하는 행위.
        </p>
      </LegalSection>

      <LegalSection title="제9조 (게시물의 관리)">
        <p>
          회원이 서비스에 게시한 게시물의 저작권은 게시한 회원에게 귀속됩니다. 단, 회사는 서비스
          운영·홍보 목적으로 해당 게시물을 노출·이용할 수 있습니다. 회사는 관련 법령에 위반되거나
          공서양속에 반하는 게시물을 사전 통지 없이 삭제·임시조치 할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (계약 해지 및 회원 자격 상실)">
        <p>
          회원은 언제든지 마이페이지 또는 고객센터를 통해 탈퇴를 요청할 수 있습니다. 회사는 회원이
          본 약관 또는 관련 법령을 위반한 경우 사전 통지 후 회원 자격을 제한·정지·상실시킬 수
          있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제11조 (분쟁의 해결)">
        <p>
          서비스 이용으로 발생한 분쟁에 대해 회사와 회원은 성실히 협의하여 해결합니다. 협의가
          이루어지지 않을 경우 「전자상거래 등에서의 소비자보호에 관한 법률」상 소비자분쟁해결기준
          및 관할 법원의 판결에 따릅니다.
        </p>
      </LegalSection>

      <p className="mt-12 text-[12px] text-[var(--mz-ink-mute)]">
        본 약관은 {LAST_UPDATED}부터 적용됩니다.
      </p>
    </>
  );
}
