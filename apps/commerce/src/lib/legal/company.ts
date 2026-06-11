// Company / legal info — single source of truth.
//
// 이 파일 한 곳만 수정하면 푸터 + 회사소개(/company) + 약관 / 개인정보처리방침
// 등 정책 페이지 전부에 즉시 반영됩니다. 사업자번호 등 실제 값을 받으면 아래
// 필드만 교체해 주세요. 한국 전자상거래법 § 13 + 시행령 § 17 표시 의무에
// 맞춰 노출 위치도 함께 잡혀 있습니다.

export const COMPANY = {
  /** 상호 / 법인명. */
  legalName: '주식회사 라비',
  /** 대외 서비스명. */
  brandName: 'RAVI',
  /** 대표자 성명. */
  representative: 'TBD',
  /** 사업자등록번호 (XXX-XX-XXXXX). */
  businessNumber: 'TBD',
  /** 통신판매업 신고번호 (제 YYYY-지역-XXXXX호). */
  mailOrderNumber: 'TBD',
  /** 사업장 주소 (도로명). */
  address: 'TBD',
  /** 고객센터 대표 전화. */
  phone: 'TBD',
  /** 고객센터 대표 이메일. */
  email: 'support@ravi.example',
  /** 개인정보보호 책임자. */
  privacyOfficer: 'TBD',
  /** 개인정보보호 책임자 연락 이메일. */
  privacyOfficerEmail: 'privacy@ravi.example',
  /** 호스팅 서비스 제공자. */
  hostingProvider: 'Vercel Inc.',
  /** 운영 시작 연도 — 푸터 카피라이트 표기에 사용. */
  foundedYear: 2026,
  /** 고객센터 운영 시간. */
  customerHours: '평일 10:00 — 18:00 (점심 12:00 — 13:00, 주말·공휴일 휴무)',
} as const;

// 필드가 TBD 상태인지 한 곳에서 확인할 수 있게 헬퍼 노출. 정책 페이지에서
// "(준비 중)" 같은 fallback 표시에 사용.
export function isPlaceholder(value: string): boolean {
  return value === 'TBD';
}

export function displayOrPending(value: string, pending = '(준비 중)'): string {
  return isPlaceholder(value) ? pending : value;
}
