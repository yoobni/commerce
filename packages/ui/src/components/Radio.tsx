'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';

export interface RadioOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  required?: boolean;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  className,
  required,
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset className={cn('flex flex-col gap-2', className)} aria-describedby={errorId}>
      {label && (
        <legend className="text-sm font-medium text-[var(--mz-ink)] mb-1">
          {label}
          {required && (
            <span className="text-[var(--mz-error,#c0392b)] ml-1" aria-hidden="true">*</span>
          )}
        </legend>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <RadioItem
            key={opt.value}
            name={name}
            option={opt}
            checked={value === opt.value}
            onChange={onChange}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--mz-error,#c0392b)]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function RadioItem({
  name,
  option,
  checked,
  onChange,
}: {
  name: string;
  option: RadioOption;
  checked: boolean;
  onChange?: (value: string) => void;
}) {
  const radioId = useId();

  return (
    <label
      htmlFor={radioId}
      className={cn(
        'flex items-start gap-3 cursor-pointer',
        option.disabled && 'cursor-not-allowed opacity-40'
      )}
    >
      <input
        type="radio"
        id={radioId}
        name={name}
        value={option.value}
        checked={checked}
        disabled={option.disabled}
        onChange={() => onChange?.(option.value)}
        style={{ accentColor: 'var(--mz-ink)' }}
        className={cn(
          'mt-0.5 shrink-0 w-4 h-4 cursor-pointer',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mz-ink)]',
          option.disabled && 'cursor-not-allowed'
        )}
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-[var(--mz-ink)] leading-tight">{option.label}</span>
        {option.hint && (
          <span className="text-xs text-[var(--mz-ink-mute)]">{option.hint}</span>
        )}
      </div>
    </label>
  );
}
