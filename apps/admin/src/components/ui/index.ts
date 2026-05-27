/**
 * Admin UI 래퍼 — 어드민 코드는 항상 여기서 import.
 *   import { Button, DataTable, Dialog } from '@/components/ui';
 *
 * shadcn 원본(src/components/shadcn/*)은 직접 import 금지.
 * 토큰/스타일 변경은 globals.css 한 곳에서, 컴포넌트 API 변경은 래퍼 한 곳에서.
 */
export { Button, type ButtonProps } from './button';
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';
export { Badge, type BadgeProps } from './badge';
export { Tag, type TagProps } from './tag';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './table';
export { DataTable, type DataTableColumn, type DataTableProps } from './data-table';
export { Checkbox } from './checkbox';
export { Switch } from './switch';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select';
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Skeleton } from './skeleton';
export { Toaster, toast } from './toaster';
export { Separator } from './separator';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
export { PageHeader, type PageHeaderProps } from './page-header';
export { InfoRow, type InfoRowProps } from './info-row';
export { InfoSection, type InfoSectionProps } from './info-section';
export {
  DataTablePagination,
  type DataTablePaginationProps,
} from './data-table-pagination';
export {
  FilterPills,
  type FilterPill,
  type FilterPillsProps,
} from './filter-pills';
