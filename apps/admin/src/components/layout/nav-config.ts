import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Ticket,
  Star,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { AdminRole } from '@/lib/auth/session';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  minRole?: AdminRole; // undefined = accessible by all roles
}

export const NAV_ITEMS: NavItem[] = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
  { label: '상품', href: '/products', icon: Package },
  { label: '주문', href: '/orders', icon: ShoppingBag },
  { label: '배송', href: '/shipping', icon: Truck },
  { label: '회원', href: '/members', icon: Users },
  { label: '쿠폰', href: '/coupons', icon: Ticket },
  { label: '리뷰', href: '/reviews', icon: Star },
  { label: '커뮤니티', href: '/community', icon: MessageSquare },
  { label: '설정', href: '/settings', icon: Settings, minRole: 'SUPER_ADMIN' },
];
