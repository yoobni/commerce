'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Container } from '@/components/layout/Container';
import { saveHoundProfile, type HoundBodyType, type HoundSize } from '@/lib/api/hound-profile';
import { cn } from '@/lib/cn';

// 3-step onboarding flow. Source of truth for the hound profile is server-
// side users.hound_profile; this component only collects + posts. The whole
// thing is client because step state and weight slider are interactive.

const BODY_TYPES: HoundBodyType[] = ['Sporty', 'Sturdy', 'Slim', 'Cloud'];

// Weight → recommended size mapping. Kept in one place so admin/PDP can
// reuse it if we ever surface fit-by-size on the catalog side.
function deriveSize(weightKg: number): HoundSize {
  if (weightKg < 15) return 'S';
  if (weightKg < 25) return 'M';
  if (weightKg < 35) return 'L';
  if (weightKg < 50) return 'XL';
  return 'XXL';
}

export function OnboardingClient() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [bodyType, setBodyType] = useState<HoundBodyType | null>(null);
  const [weight, setWeight] = useState(28);
  const [error, setError] = useState<string | null>(null);

  const canNextFromStep1 = name.trim().length > 0;
  const canNextFromStep2 = bodyType !== null;
  const recommendedSize = deriveSize(weight);

  function next() {
    setError(null);
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  }
  function back() {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  function submit() {
    if (!bodyType) return;
    setError(null);
    startTransition(async () => {
      try {
        await saveHoundProfile({
          name: name.trim(),
          breed: breed.trim() || null,
          body_type: bodyType,
          weight_kg: weight,
          size: recommendedSize,
        });
        router.push('/');
        router.refresh();
      } catch {
        setError(t('errorSubtitle'));
      }
    });
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[var(--mz-bg)] py-8 md:py-12">
      <Container className="max-w-[560px]">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--mz-ink-mute)] font-semibold">
            {t('step', { current: step, total: 3 })}
          </span>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-[12px] text-[var(--mz-ink-mute)] hover:text-[var(--mz-ink)] transition-colors"
          >
            {t('skip')}
          </button>
        </div>
        <div className="h-[3px] rounded bg-[var(--mz-line)] overflow-hidden mb-7">
          <div
            className="h-full bg-[var(--mz-ink)] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Title */}
        <header className="mb-8">
          <h1 className="font-serif text-[28px] md:text-[32px] font-[500] leading-[1.1] tracking-[-0.025em] text-[var(--mz-ink)]">
            {step === 1
              ? t('step1.title')
              : step === 2
                ? t('step2.title')
                : t('step3.title')}
          </h1>
          {step === 1 && (
            <p className="mt-3 text-[13px] text-[var(--mz-ink-soft)] leading-[1.55]">
              {t('subtitle')}
            </p>
          )}
        </header>

        {/* Step bodies */}
        {step === 1 && (
          <div className="space-y-5">
            <Field
              label={t('step1.nameLabel')}
              value={name}
              onChange={setName}
              placeholder={t('step1.namePlaceholder')}
              autoFocus
            />
            <Field
              label={t('step1.breedLabel')}
              value={breed}
              onChange={setBreed}
              placeholder={t('step1.breedPlaceholder')}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            {BODY_TYPES.map((bt) => {
              const selected = bodyType === bt;
              return (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setBodyType(bt)}
                  className={cn(
                    'text-left p-4 rounded-[var(--radius-md)] border-[1.5px]',
                    'transition-colors duration-150',
                    selected
                      ? 'border-[var(--mz-ink)] bg-[var(--mz-surface)]'
                      : 'border-[var(--mz-line)] hover:border-[var(--mz-ink-mute)]'
                  )}
                  aria-pressed={selected}
                >
                  <div className="font-serif text-[16px] font-[500]">
                    {t(`step2.${bt}`)}
                    {selected && (
                      <span className="ml-1.5 text-[var(--mz-accent)]" aria-hidden="true">●</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--mz-ink-mute)]">
                    {t(`step2.${bt}Desc`)}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[13px] font-[600]">{t('step3.weightLabel')}</span>
                <span className="font-mono text-[14px] text-[var(--mz-ink)]">{weight} kg</span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-[var(--mz-ink)]"
                aria-label={t('step3.weightLabel')}
              />
              <div className="flex justify-between mt-1 font-mono text-[10px] text-[var(--mz-ink-mute)]">
                <span>1kg</span>
                <span>80kg</span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--mz-accent-soft)] p-4">
              <p className="text-[10px] font-[700] tracking-[0.16em] uppercase text-[var(--mz-accent-ink)]">
                {t('step3.recommendedSize')}
              </p>
              <p className="mt-1 font-serif text-[24px] font-[500] text-[var(--mz-accent-ink)]">
                {recommendedSize}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-5 text-[13px] text-[var(--color-error)]">
            {error}
          </p>
        )}

        {/* Footer actions */}
        <div className="mt-10 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={back}
              disabled={pending}
              className="h-12 px-5 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] text-[13px] font-medium text-[var(--mz-ink)] hover:bg-[var(--mz-bg-deep)] transition-colors disabled:opacity-50"
            >
              {t('back')}
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              disabled={(step === 1 && !canNextFromStep1) || (step === 2 && !canNextFromStep2)}
              className="flex-1 h-12 rounded-[var(--radius-md)] bg-[var(--mz-ink)] text-[var(--mz-bg)] text-[13px] font-medium tracking-[0.02em] transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('continue')}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="flex-1 h-12 rounded-[var(--radius-md)] bg-[var(--mz-ink)] text-[var(--mz-bg)] text-[13px] font-medium tracking-[0.02em] transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('submit')}
            </button>
          )}
        </div>
      </Container>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function Field({ label, value, onChange, placeholder, autoFocus }: FieldProps) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[12px] font-[600] text-[var(--mz-ink)]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="block w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--mz-line-strong)] bg-[var(--mz-surface)] text-[14px] text-[var(--mz-ink)] focus:outline-none focus:border-[var(--mz-ink)]"
      />
    </label>
  );
}
