import { z } from 'zod';

export const UpdateProfileBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
  phone: z.string().max(40).nullable(),
  marketing_agreed: z.boolean(),
});

const AddressBodyShape = {
  label: z.string().max(40).nullable(),
  recipient_name: z.string().min(1).max(80),
  phone: z.string().min(1).max(40),
  country: z.string().min(2).max(8),
  postal_code: z.string().min(1).max(20),
  state_province: z.string().max(80).nullable(),
  city: z.string().min(1).max(80),
  address_line1: z.string().min(1).max(200),
  address_line2: z.string().max(200).nullable(),
  is_default: z.boolean(),
};

export const CreateAddressBodySchema = z.object(AddressBodyShape);
export const UpdateAddressBodySchema = z.object(AddressBodyShape);

export const AddressIdParamSchema = z.object({
  id: z.string().uuid(),
});
