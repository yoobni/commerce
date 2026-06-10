'use server';

import { revalidatePath } from 'next/cache';
import {
  adminUpdateOrderStatus,
  adminUpdateOrderMemo,
  adminProcessRefund,
} from '@/lib/api/orders';
import { ApiCallError } from '@/lib/api/client';
import type { OrderStatus } from '@commerce/types';

function mapError(e: unknown, fallback: string): Error {
  if (e instanceof ApiCallError) {
    const map: Record<string, string> = {
      order_not_found: '주문을 찾을 수 없습니다.',
      invalid_status_transition: '주문 상태 전이가 허용되지 않습니다.',
      status_update_failed: '상태 변경 실패',
      memo_update_failed: '메모 저장 실패',
      payment_not_found: '결제 정보를 찾을 수 없습니다.',
      payment_not_refundable: '환불 가능한 결제 상태가 아닙니다.',
      order_not_in_refund_requested: '환불 요청 상태가 아닙니다.',
      invalid_refund_amount: '환불 금액이 유효하지 않습니다.',
      pg_cancel_failed: 'PG 취소 실패',
      refund_payment_update_failed: '환불 처리 중 오류 (결제 record)',
      refund_order_update_failed: '환불 처리 중 오류 (주문 status)',
      unauthorized: '권한이 없습니다.',
      forbidden: '권한이 없습니다.',
    };
    return new Error(map[e.code] ?? fallback);
  }
  return e instanceof Error ? e : new Error(fallback);
}

// ─── Update order status ──────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  try {
    await adminUpdateOrderStatus(orderId, newStatus);
  } catch (e) {
    throw mapError(e, '주문 상태 변경 실패');
  }
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Process refund ───────────────────────────────────────────────────────────

export async function processRefund(orderId: string, refundAmount: number): Promise<void> {
  try {
    await adminProcessRefund(orderId, refundAmount);
  } catch (e) {
    throw mapError(e, '환불 처리 실패');
  }
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
}

// ─── Update admin memo ────────────────────────────────────────────────────────

export async function updateOrderAdminMemo(orderId: string, memo: string): Promise<void> {
  try {
    await adminUpdateOrderMemo(orderId, memo);
  } catch (e) {
    throw mapError(e, '메모 저장 실패');
  }
  revalidatePath(`/orders/${orderId}`);
}
