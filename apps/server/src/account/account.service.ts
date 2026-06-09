import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Address, Country, User } from '@commerce/types';
import { SUPABASE_ADMIN } from '../supabase/supabase.module';

// users 테이블은 own-row RLS이므로 SUPABASE_ADMIN로 처리하되, 모든 메서드가
// userId를 첫 인자로 받아 controller 단에서 항상 req.user!.id로만 호출되도록 강제.

export interface UpdateProfileInput {
  name: string;
  phone: string | null;
  marketingAgreed: boolean;
}

export interface AddressInput {
  label: string | null;
  recipientName: string;
  phone: string;
  country: Country;
  postalCode: string;
  stateProvince: string | null;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
}

function snake(input: AddressInput): Record<string, unknown> {
  return {
    label: input.label,
    recipient_name: input.recipientName,
    phone: input.phone,
    country: input.country,
    postal_code: input.postalCode,
    state_province: input.stateProvince,
    city: input.city,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2,
    is_default: input.isDefault,
  };
}

@Injectable()
export class AccountService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) {}

  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('users') as any)
      .select('*')
      .eq('id', userId)
      .single();
    return (data as User) ?? null;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('users') as any)
      .update({
        name: input.name,
        phone: input.phone,
        marketing_agreed: input.marketingAgreed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) throw error;
  }

  async withdraw(userId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('users') as any)
      .update({
        status: 'WITHDRAWN',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) throw error;
  }

  // ── Addresses ────────────────────────────────────────────────────────────

  async listAddresses(userId: string): Promise<Address[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (this.supabase.from('addresses') as any)
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    return (data as Address[]) ?? [];
  }

  async createAddress(userId: string, input: AddressInput): Promise<{ id: string }> {
    if (input.isDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.supabase.from('addresses') as any)
        .update({ is_default: false })
        .eq('user_id', userId);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase.from('addresses') as any)
      .insert({ ...snake(input), user_id: userId })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('address_create_failed');
    return { id: (data as { id: string }).id };
  }

  async updateAddress(
    userId: string,
    addressId: string,
    input: AddressInput
  ): Promise<void> {
    if (input.isDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.supabase.from('addresses') as any)
        .update({ is_default: false })
        .eq('user_id', userId);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('addresses') as any)
      .update(snake(input))
      .eq('id', addressId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('addresses') as any)
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.supabase.from('addresses') as any)
      .update({ is_default: false })
      .eq('user_id', userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase.from('addresses') as any)
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);
    if (error) throw error;
  }
}
