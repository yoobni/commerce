/**
 * Admin Design Demo — 어드민이 쓰는 모든 디자인 컴포넌트 카탈로그.
 * `/design-demo` 으로 접근 가능 (로그인 불필요, middleware PUBLIC_PATHS).
 *
 * 추가 컴포넌트가 생기면 여기에 섹션을 추가해서 한눈에 검수 가능하게 유지.
 */
'use client';

import * as React from 'react';
import {
  Search,
  Mail,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  Download,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Label,
  Badge,
  Tag,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Checkbox,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Skeleton,
  Toaster,
  toast,
  Separator,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  DataTable,
  type DataTableColumn,
  PageHeader,
} from '@/components/ui';

type DemoOrder = {
  id: string;
  customer: string;
  total: string;
  status: 'paid' | 'shipping' | 'refunded';
  createdAt: string;
};

const DEMO_ORDERS: DemoOrder[] = [
  { id: 'ORD-2026-0581', customer: '김민지', total: '₩148,000', status: 'paid', createdAt: '2026-05-21 14:22' },
  { id: 'ORD-2026-0580', customer: '이준호', total: '₩89,500', status: 'shipping', createdAt: '2026-05-21 12:08' },
  { id: 'ORD-2026-0579', customer: '박서연', total: '₩212,000', status: 'paid', createdAt: '2026-05-21 10:41' },
  { id: 'ORD-2026-0578', customer: '최도윤', total: '₩66,000', status: 'refunded', createdAt: '2026-05-20 22:13' },
];

const STATUS_VARIANT: Record<DemoOrder['status'], React.ComponentProps<typeof Badge>['variant']> = {
  paid: 'success',
  shipping: 'accent',
  refunded: 'destructive',
};

const STATUS_LABEL: Record<DemoOrder['status'], string> = {
  paid: '결제완료',
  shipping: '배송중',
  refunded: '환불',
};

export default function AdminDesignDemo() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <Toaster />
        <div className="mx-auto max-w-[1280px] px-6 py-10">
          <PageHeader
            title="Admin Design Demo"
            description="어드민에서 사용 가능한 디자인 컴포넌트 카탈로그. Muzzle Direction B · Olive 토큰 기반."
            actions={
              <>
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-4 w-4" />
                  내보내기
                </Button>
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  새로 만들기
                </Button>
              </>
            }
          />

          <BreadcrumbDemo />

          <SectionDivider />

          <Section title="01. Color tokens">
            <ColorTokens />
          </Section>

          <Section title="02. Typography">
            <TypographyDemo />
          </Section>

          <Section title="03. Button">
            <ButtonDemo />
          </Section>

          <Section title="04. Badge & Tag">
            <BadgeTagDemo />
          </Section>

          <Section title="05. Input · Textarea · Label">
            <FormFieldDemo />
          </Section>

          <Section title="06. Select">
            <SelectDemo />
          </Section>

          <Section title="07. Checkbox · Switch">
            <CheckboxSwitchDemo />
          </Section>

          <Section title="08. Card">
            <CardDemo />
          </Section>

          <Section title="09. Tabs">
            <TabsDemo />
          </Section>

          <Section title="10. Avatar · Skeleton">
            <AvatarSkeletonDemo />
          </Section>

          <Section title="11. Tooltip · Dropdown · Dialog · Sheet">
            <OverlayDemo />
          </Section>

          <Section title="12. Toast">
            <ToastDemo />
          </Section>

          <Section title="13. Pagination">
            <PaginationDemo />
          </Section>

          <Section title="14. DataTable (어드민 표준 list 패턴)">
            <DataTableDemo />
          </Section>

          <div className="h-20" />
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ──────────────────────── helpers ──────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      <div className="rounded-lg border border-border bg-card p-6">{children}</div>
    </section>
  );
}

function SectionDivider() {
  return <div className="my-8" />;
}

function Label2({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

/* ──────────────────────── 01. colors ──────────────────────── */

function ColorTokens() {
  const swatches: Array<{ name: string; var: string; hex: string }> = [
    { name: 'mz-bg', var: '--mz-bg', hex: '#F7F6F3' },
    { name: 'mz-bg-deep', var: '--mz-bg-deep', hex: '#EFEDE7' },
    { name: 'mz-surface', var: '--mz-surface', hex: '#FFFFFF' },
    { name: 'mz-ink', var: '--mz-ink', hex: '#0E0E0C' },
    { name: 'mz-ink-soft', var: '--mz-ink-soft', hex: '#4D4D48' },
    { name: 'mz-ink-mute', var: '--mz-ink-mute', hex: '#8F8F88' },
    { name: 'mz-accent', var: '--mz-accent', hex: '#4A5237' },
    { name: 'mz-accent-soft', var: '--mz-accent-soft', hex: '#E5E7D8' },
    { name: 'mz-accent-ink', var: '--mz-accent-ink', hex: '#2E3422' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {swatches.map((s) => (
        <div key={s.var} className="rounded-md border border-border bg-card overflow-hidden">
          <div
            className="h-16 w-full border-b border-border"
            style={{ background: `var(${s.var})` }}
          />
          <div className="px-3 py-2">
            <div className="text-[12.5px] font-medium text-foreground">{s.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground">{s.hex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────── 02. typography ──────────────────────── */

function TypographyDemo() {
  return (
    <div className="space-y-4">
      <div>
        <Label2>page-title · 22/600</Label2>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">
          주문 관리 · 2026년 5월
        </h1>
      </div>
      <div>
        <Label2>section-title · 16/600</Label2>
        <h2 className="text-base font-semibold">최근 활동</h2>
      </div>
      <div>
        <Label2>body · 14/400</Label2>
        <p className="text-sm text-foreground">
          어드민은 Inter(영문) + Pretendard(한글) sans-serif만 사용합니다. 정보 밀도 우선.
        </p>
      </div>
      <div>
        <Label2>muted · 13/400</Label2>
        <p className="text-[13px] text-muted-foreground">
          헬프 텍스트, 셀 보조 정보, 메타 데이터.
        </p>
      </div>
      <div>
        <Label2>mono · 12/500 (주문번호, 토큰)</Label2>
        <p className="font-mono text-[12px] font-medium">ORD-2026-0581 · TXN_8f3a92e1</p>
      </div>
    </div>
  );
}

/* ──────────────────────── 03. button ──────────────────────── */

function ButtonDemo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="accent">Accent (Olive)</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="추가">
          <Plus />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> 상품 추가
        </Button>
        <Button variant="outline">
          <Edit className="mr-1.5 h-4 w-4" /> 수정
        </Button>
        <Button variant="destructive">
          <Trash2 className="mr-1.5 h-4 w-4" /> 삭제
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}

/* ──────────────────────── 04. badge / tag ──────────────────────── */

function BadgeTagDemo() {
  return (
    <div className="space-y-4">
      <div>
        <Label2>Badge — 주문/회원/리뷰 상태</Label2>
        <div className="flex flex-wrap gap-1.5">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="success">결제완료</Badge>
          <Badge variant="warning">대기</Badge>
          <Badge variant="destructive">환불</Badge>
          <Badge variant="accent">배송중</Badge>
        </div>
      </div>
      <div>
        <Label2>Tag — 필터 칩 / 카테고리</Label2>
        <div className="flex flex-wrap gap-1.5">
          <Tag>아우터</Tag>
          <Tag>대형견</Tag>
          <Tag removable onRemove={() => {}}>
            필터 · M사이즈
          </Tag>
          <Tag removable onRemove={() => {}}>
            필터 · 재고있음
          </Tag>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── 05. form fields ──────────────────────── */

function FormFieldDemo() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="demo-email">이메일</Label>
        <Input id="demo-email" type="email" placeholder="user@example.com" />
        <p className="text-[12px] text-muted-foreground">로그인 ID로 사용됩니다.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-search">검색</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="demo-search" placeholder="주문번호, 회원명…" className="pl-9" />
        </div>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="demo-memo">메모</Label>
        <Textarea
          id="demo-memo"
          rows={3}
          placeholder="환불 사유, 내부 메모 등…"
          defaultValue="고객 변심 — 사이즈 미스. 다음 주문 시 1사이즈 큰 것 권장."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-disabled">비활성</Label>
        <Input id="demo-disabled" disabled placeholder="수정 불가" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-error">에러 상태</Label>
        <Input
          id="demo-error"
          placeholder="유효하지 않은 값"
          className="border-destructive focus-visible:ring-destructive"
        />
        <p className="text-[12px] text-destructive">올바른 형식이 아닙니다.</p>
      </div>
    </div>
  );
}

/* ──────────────────────── 06. select ──────────────────────── */

function SelectDemo() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label>주문 상태</Label>
        <Select defaultValue="paid">
          <SelectTrigger>
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">결제대기</SelectItem>
            <SelectItem value="paid">결제완료</SelectItem>
            <SelectItem value="shipping">배송중</SelectItem>
            <SelectItem value="delivered">배송완료</SelectItem>
            <SelectItem value="refunded">환불</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>정렬</Label>
        <Select defaultValue="recent">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">최신순</SelectItem>
            <SelectItem value="old">오래된 순</SelectItem>
            <SelectItem value="amount-desc">금액 높은 순</SelectItem>
            <SelectItem value="amount-asc">금액 낮은 순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ──────────────────────── 07. checkbox/switch ──────────────────────── */

function CheckboxSwitchDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Label2>Checkbox</Label2>
        <div className="flex items-center gap-2">
          <Checkbox id="cb1" defaultChecked />
          <Label htmlFor="cb1">전체 선택</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb2" />
          <Label htmlFor="cb2">알림 받기</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb3" disabled />
          <Label htmlFor="cb3" className="opacity-60">
            비활성
          </Label>
        </div>
      </div>
      <div className="space-y-3">
        <Label2>Switch</Label2>
        <div className="flex items-center gap-2">
          <Switch id="sw1" defaultChecked />
          <Label htmlFor="sw1">노출 활성화</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw2" />
          <Label htmlFor="sw2">자동 환불 처리</Label>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── 08. card ──────────────────────── */

function CardDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>총 매출 · 이번 달</CardTitle>
          <CardDescription>2026년 5월 기준</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-[28px] font-semibold tracking-tight">₩12,481,200</div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            전월 대비 <span className="text-[var(--mz-accent)]">+18.2%</span>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>활성 회원</CardTitle>
          <CardDescription>최근 30일 로그인 기준</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-[28px] font-semibold tracking-tight">2,148</div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">
            상세 보기 <ChevronDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ──────────────────────── 09. tabs ──────────────────────── */

function TabsDemo() {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">전체</TabsTrigger>
        <TabsTrigger value="paid">결제완료</TabsTrigger>
        <TabsTrigger value="shipping">배송중</TabsTrigger>
        <TabsTrigger value="refunded">환불</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <p className="text-sm text-muted-foreground">전체 주문 · 1,248건</p>
      </TabsContent>
      <TabsContent value="paid">
        <p className="text-sm text-muted-foreground">결제완료 · 982건</p>
      </TabsContent>
      <TabsContent value="shipping">
        <p className="text-sm text-muted-foreground">배송중 · 142건</p>
      </TabsContent>
      <TabsContent value="refunded">
        <p className="text-sm text-muted-foreground">환불 · 124건</p>
      </TabsContent>
    </Tabs>
  );
}

/* ──────────────────────── 10. avatar / skeleton ──────────────────────── */

function AvatarSkeletonDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Label2>Avatar</Label2>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>김민</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/64?u=ravi-admin-1" alt="박서연" />
            <AvatarFallback>박서</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-base">RA</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div>
        <Label2>Skeleton</Label2>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── 11. overlays ──────────────────────── */

function OverlayDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            Hover for tooltip
          </Button>
        </TooltipTrigger>
        <TooltipContent>이 항목은 SUPER_ADMIN만 수정 가능합니다.</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            행 액션 <MoreHorizontal className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" /> 수정
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" /> 이메일 발송
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">확인 Dialog 열기</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 환불 처리</DialogTitle>
            <DialogDescription>
              ORD-2026-0581 을 환불 처리합니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">취소</Button>
            <Button variant="destructive">
              <Check className="mr-1.5 h-4 w-4" /> 환불 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            Sheet (사이드 패널) 열기
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>회원 상세 — 박서연</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">가입일</span>
              <span>2024-11-12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">누적 주문</span>
              <span>14건</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">누적 금액</span>
              <span className="font-mono">₩1,842,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">상태</span>
              <Badge variant="success">활성</Badge>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ──────────────────────── 12. toast ──────────────────────── */

function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => toast.success('주문 상태가 업데이트되었습니다.')}>
        성공 토스트
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast('환불 요청이 접수되었습니다.', { description: '처리에 영업일 기준 3-5일 소요됩니다.' })}
      >
        기본 토스트
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => toast.error('상품 등록 중 오류가 발생했습니다.')}
      >
        에러 토스트
      </Button>
    </div>
  );
}

/* ──────────────────────── 13. pagination ──────────────────────── */

function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">42</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/* ──────────────────────── 14. data table ──────────────────────── */

function DataTableDemo() {
  const columns: DataTableColumn<DemoOrder>[] = [
    {
      key: 'id',
      header: '주문번호',
      cell: (r) => <span className="font-mono text-[12.5px]">{r.id}</span>,
      width: '180px',
    },
    {
      key: 'customer',
      header: '고객',
      cell: (r) => r.customer,
    },
    {
      key: 'total',
      header: '결제 금액',
      cell: (r) => <span className="font-mono">{r.total}</span>,
      align: 'right',
    },
    {
      key: 'status',
      header: '상태',
      cell: (r) => (
        <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: '주문 시각',
      cell: (r) => <span className="text-muted-foreground">{r.createdAt}</span>,
      align: 'right',
    },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="액션">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>상세 보기</DropdownMenuItem>
              <DropdownMenuItem>송장 출력</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                환불 처리
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: '60px',
      align: 'right',
    },
  ];

  return (
    <DataTable<DemoOrder>
      columns={columns}
      rows={DEMO_ORDERS}
      rowKey={(r) => r.id}
      footer={
        <>
          <span className="text-sm text-muted-foreground">4건 표시 · 총 1,248건</span>
          <Pagination className="m-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      }
    />
  );
}

/* ──────────────────────── breadcrumb top ──────────────────────── */

function BreadcrumbDemo() {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Admin</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Design</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Demo</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
