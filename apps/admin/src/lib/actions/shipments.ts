'use server';

import { revalidatePath } from 'next/cache';
import {
  adminStartShipment,
  adminUpdateShipmentStatus,
  adminSetReturnTracking,
} from '@/lib/api/shipments';
import { ApiCallError } from '@/lib/api/client';
import type { Carrier, ShipmentStatus } from '@commerce/types';

export interface StartShipmentInput {
  orderId: string;
  carrier: Carrier;
  trackingNumber: string;
  country: string;
}

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      tracking_number_required: '운송장 번호를 입력해주세요.',
      shipment_upsert_failed: '배송 정보 저장 실패',
      order_status_update_failed: '주문 상태 변경 실패',
      shipment_not_found: '배송 정보를 찾을 수 없습니다.',
      invalid_shipment_transition: '배송 상태 전이가 허용되지 않습니다.',
      shipment_status_update_failed: '배송 상태 변경 실패',
      return_tracking_update_failed: '반송 운송장 번호 저장 실패',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

export async function startShipment(input: StartShipmentInput): Promise<void> {
  const { orderId, carrier, trackingNumber, country } = input;
  if (!trackingNumber.trim()) throw new Error('운송장 번호를 입력해주세요.');
  try {
    await adminStartShipment(orderId, carrier, trackingNumber, country);
  } catch (e) {
    throw mapError(e, '배송 시작 실패');
  }
  revalidatePath(`/shipping/${orderId}`);
  revalidatePath('/shipping');
}

export async function updateShipmentStatus(
  shipmentId: string,
  newStatus: ShipmentStatus
): Promise<void> {
  try {
    await adminUpdateShipmentStatus(shipmentId, newStatus);
  } catch (e) {
    throw mapError(e, '배송 상태 변경 실패');
  }
  // revalidatePath: 상세 페이지는 shipmentId 가 아닌 orderId 기반이라 list 만 wipe.
  revalidatePath('/shipping');
}

export async function setReturnTracking(
  shipmentId: string,
  returnTrackingNumber: string
): Promise<void> {
  try {
    await adminSetReturnTracking(shipmentId, returnTrackingNumber);
  } catch (e) {
    throw mapError(e, '반송 운송장 번호 저장 실패');
  }
  revalidatePath('/shipping');
}
