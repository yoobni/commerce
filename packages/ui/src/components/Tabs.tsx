'use client';

import { createContext, useContext, useId, useState } from 'react';
import { cn } from '../lib/cn';

export type TabsVariant = 'underline' | 'pill';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs sub-components must be used inside <Tabs>');
  return ctx;
}

// ─── Tabs root ─────────────────────────────────────────────────────────────────

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'underline',
  className,
  children,
}: TabsProps) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const activeTab = value !== undefined ? value : internalValue;
  const setActiveTab = (v: string) => {
    if (value === undefined) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, baseId }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ─── TabList ───────────────────────────────────────────────────────────────────

export interface TabListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabList({ className, children }: TabListProps) {
  const { variant } = useTabsContext();

  return (
    <div
      role="tablist"
      className={cn(
        'flex',
        variant === 'underline'
          ? 'border-b border-[var(--mz-line)] gap-0'
          : 'gap-1 p-1 rounded-[var(--mz-radius-pill,999px)] bg-[var(--mz-bg-deep)]',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Tab ───────────────────────────────────────────────────────────────────────

export interface TabProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Tab({ value, disabled = false, className, children }: TabProps) {
  const { activeTab, setActiveTab, variant, baseId } = useTabsContext();
  const isActive = activeTab === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      role="tab"
      id={tabId}
      aria-controls={panelId}
      aria-selected={isActive}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'text-[13px] font-medium transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        variant === 'underline'
          ? cn(
              'px-4 py-3 border-b-2 -mb-px whitespace-nowrap',
              isActive
                ? 'border-[var(--mz-ink)] text-[var(--mz-ink)]'
                : 'border-transparent text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink-soft)] hover:border-[var(--mz-line-strong)]'
            )
          : cn(
              'px-4 py-2 rounded-[var(--mz-radius-pill,999px)] whitespace-nowrap',
              isActive
                ? 'bg-[var(--mz-ink)] text-[var(--mz-bg)] shadow-sm'
                : 'text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)]'
            ),
        className
      )}
    >
      {children}
    </button>
  );
}

// ─── TabPanel ─────────────────────────────────────────────────────────────────

export interface TabPanelProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabPanel({ value, className, children }: TabPanelProps) {
  const { activeTab, baseId } = useTabsContext();
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn('focus:outline-none', className)}
    >
      {children}
    </div>
  );
}
