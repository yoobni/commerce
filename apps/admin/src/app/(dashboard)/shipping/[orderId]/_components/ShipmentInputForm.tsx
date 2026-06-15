'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import type { Carrier } from '@commerce/types';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@/components/ui';
import { CARRIER_LABEL } from '@/lib/admin-ui/shipments-labels';
import { startShipment } from '@/lib/actions/shipments';

interface Props {
  orderId: string;
  country: string;
}

const CARRIERS = Object.keys(CARRIER_LABEL) as Carrier[];

export function ShipmentInputForm({ orderId, country }: Props) {
  const router = useRouter();
  const [carrier, setCarrier] = useState<Carrier>('CJ');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!trackingNumber.trim()) {
      setError('운송장 번호를 입력해주세요.');
      return;
    }
    startTransition(async () => {
      try {
        await startShipment({
          orderId,
          carrier,
          trackingNumber: trackingNumber.trim(),
          country,
        });
        toast.success('배송을 시작했습니다.');
        setTrackingNumber('');
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.';
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>택배사</Label>
        <Select value={carrier} onValueChange={(v) => setCarrier(v as Carrier)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CARRIERS.map((c) => (
              <SelectItem key={c} value={c}>
                {CARRIER_LABEL[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tracking-number">운송장 번호</Label>
        <Input
          id="tracking-number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="운송장 번호 입력"
          required
          disabled={isPending}
          className="font-mono"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-1.5 text-[11.5px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={isPending || !trackingNumber} className="w-full" size="md">
        {isPending ? '처리 중…' : '배송 처리'}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        상태가 <span className="font-medium">PREPARING → SHIPPED</span>로 전환됩니다.
      </p>
    </form>
  );
}
