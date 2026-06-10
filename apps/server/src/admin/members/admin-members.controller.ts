import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminMembersService } from './admin-members.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminListMembersQuerySchema,
  MemberOrdersQuerySchema,
  UpdateStatusBodySchema,
  UuidParamSchema,
} from './admin-members.schemas';

//   GET   /admin/members                list (status/search 페이지)
//   GET   /admin/members/:id            detail (전체 User)
//   GET   /admin/members/:id/orders     최근 주문 N건 (default 5)
//   PATCH /admin/members/:id/status     ACTIVE / SUSPENDED / WITHDRAWN

@Controller('admin/members')
@UseGuards(AdminAuthGuard)
export class AdminMembersController {
  constructor(private readonly members: AdminMembersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminListMembersQuerySchema))
    query: typeof AdminListMembersQuerySchema._output
  ) {
    return this.members.list(query);
  }

  @Get(':id')
  async getById(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output
  ) {
    const row = await this.members.getById(params.id);
    if (!row) throw new NotFoundException('member_not_found');
    return row;
  }

  @Get(':id/orders')
  listOrders(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Query(new ZodValidationPipe(MemberOrdersQuerySchema))
    query: typeof MemberOrdersQuerySchema._output
  ) {
    return this.members.listOrders(params.id, query.limit);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatus(
    @Param(new ZodValidationPipe(UuidParamSchema)) params: typeof UuidParamSchema._output,
    @Body(new ZodValidationPipe(UpdateStatusBodySchema))
    body: typeof UpdateStatusBodySchema._output
  ) {
    await this.members.updateStatus(params.id, body.status);
  }
}
