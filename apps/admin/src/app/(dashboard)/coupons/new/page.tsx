import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, InfoSection, PageHeader } from '@/components/ui';
import { CouponForm } from '../_components/CouponForm';

export const metadata = { title: '쿠폰 생성' };

export default function CouponNewPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/coupons">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> 쿠폰 목록
          </Link>
        </Button>
      </div>

      <PageHeader title="쿠폰 생성" description="새 쿠폰의 기본 정보와 유효기간을 입력합니다." />

      <InfoSection title="쿠폰 정보">
        <CouponForm coupon={null} />
      </InfoSection>
    </div>
  );
}
