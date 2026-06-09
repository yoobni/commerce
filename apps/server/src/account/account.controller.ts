import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Country } from '@commerce/types';
import { AccountService, type AddressInput } from './account.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import {
  AddressIdParamSchema,
  CreateAddressBodySchema,
  UpdateAddressBodySchema,
  UpdateProfileBodySchema,
} from './account.schemas';

// REST resource: account / profile + addresses (always self-scoped).
//   GET    /account/me                          profile
//   PATCH  /account/me                          update profile
//   POST   /account/me/withdraw                 withdraw
//   GET    /account/me/addresses                list
//   POST   /account/me/addresses                create
//   PATCH  /account/me/addresses/:id            update
//   DELETE /account/me/addresses/:id            remove
//   POST   /account/me/addresses/:id/default    set as default

function toAddressInput(b: typeof CreateAddressBodySchema._output): AddressInput {
  return {
    label: b.label,
    recipientName: b.recipient_name,
    phone: b.phone,
    country: b.country as Country,
    postalCode: b.postal_code,
    stateProvince: b.state_province,
    city: b.city,
    addressLine1: b.address_line1,
    addressLine2: b.address_line2,
    isDefault: b.is_default,
  };
}

@Controller('account/me')
@UseGuards(SupabaseAuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}

  // ── Profile ──

  @Get()
  async getProfile(@Req() req: Request) {
    const profile = await this.account.getProfile(req.user!.id);
    if (!profile) throw new NotFoundException('profile_not_found');
    return profile;
  }

  @Patch()
  async updateProfile(
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateProfileBodySchema))
    body: typeof UpdateProfileBodySchema._output
  ) {
    await this.account.updateProfile(req.user!.id, {
      name: body.name,
      phone: body.phone,
      marketingAgreed: body.marketing_agreed,
    });
    return { id: req.user!.id };
  }

  @Post('withdraw')
  async withdraw(@Req() req: Request) {
    await this.account.withdraw(req.user!.id);
    return { id: req.user!.id, status: 'WITHDRAWN' };
  }

  // ── Addresses ──

  @Get('addresses')
  listAddresses(@Req() req: Request) {
    return this.account.listAddresses(req.user!.id);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateAddressBodySchema))
    body: typeof CreateAddressBodySchema._output
  ) {
    return this.account.createAddress(req.user!.id, toAddressInput(body));
  }

  @Patch('addresses/:id')
  async updateAddress(
    @Req() req: Request,
    @Param(new ZodValidationPipe(AddressIdParamSchema))
    params: typeof AddressIdParamSchema._output,
    @Body(new ZodValidationPipe(UpdateAddressBodySchema))
    body: typeof UpdateAddressBodySchema._output
  ) {
    await this.account.updateAddress(req.user!.id, params.id, toAddressInput(body));
    return { id: params.id };
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAddress(
    @Req() req: Request,
    @Param(new ZodValidationPipe(AddressIdParamSchema))
    params: typeof AddressIdParamSchema._output
  ) {
    await this.account.deleteAddress(req.user!.id, params.id);
  }

  @Post('addresses/:id/default')
  async setDefaultAddress(
    @Req() req: Request,
    @Param(new ZodValidationPipe(AddressIdParamSchema))
    params: typeof AddressIdParamSchema._output
  ) {
    await this.account.setDefaultAddress(req.user!.id, params.id);
    return { id: params.id, is_default: true };
  }
}
