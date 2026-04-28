import type {
  ShippingAdapter,
  ShippingRegisterParams,
  ShippingRegisterResult,
  ShippingStatusResult,
} from './shipping';
import type { PaymentMode } from './payment';

export class MockShippingAdapter implements ShippingAdapter {
  readonly mode: PaymentMode = 'mock';

  async registerTracking(params: ShippingRegisterParams): Promise<ShippingRegisterResult> {
    return {
      trackerId: `mock_${params.carrier}_${params.trackingNumber}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStatus(_trackerId: string): Promise<ShippingStatusResult> {
    return {
      status: 'IN_TRANSIT',
      history: [
        {
          status: 'PICKED_UP',
          location: null,
          message: '[MOCK] 상품 픽업 완료',
          occurredAt: new Date().toISOString(),
        },
      ],
    };
  }
}
