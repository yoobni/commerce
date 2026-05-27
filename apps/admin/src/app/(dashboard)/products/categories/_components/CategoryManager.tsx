'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus } from 'lucide-react';
import type { Category } from '@commerce/types';
import type { CategoryInput } from '@/lib/actions/products';
import { saveCategory, deleteCategory } from '@/lib/actions/products';
import {
  Badge,
  Button,
  Checkbox,
  DataTable,
  type DataTableColumn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InfoSection,
  Input,
  Label,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@/components/ui';

type Mode =
  | 'list'
  | { type: 'new'; parentId: string | null }
  | { type: 'edit'; category: Category };

function blankInput(parentId: string | null): CategoryInput {
  return {
    parent_id: parentId,
    slug: '',
    name_ko: '',
    name_en: '',
    name_ja: '',
    name_de: '',
    sort_order: 0,
    is_active: true,
  };
}

function categoryToInput(c: Category): CategoryInput {
  return {
    parent_id: c.parent_id,
    slug: c.slug,
    name_ko: c.name_ko,
    name_en: c.name_en,
    name_ja: c.name_ja,
    name_de: c.name_de,
    sort_order: c.sort_order,
    is_active: c.is_active,
  };
}

/* ─── form panel ──────────────────────────────────────────────────────────── */

interface FormPanelProps {
  title: string;
  initial: CategoryInput;
  categoryId: string | null;
  roots: Category[];
  onDone: () => void;
}

function CategoryFormPanel({ title, initial, categoryId, roots, onDone }: FormPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CategoryInput>(initial);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.slug) {
      setError('슬러그를 입력해주세요.');
      return;
    }
    if (!form.name_ko) {
      setError('카테고리명(한국어)을 입력해주세요.');
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await saveCategory(categoryId, form);
        toast.success(categoryId ? '카테고리를 수정했습니다.' : '카테고리를 추가했습니다.');
        router.refresh();
        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '저장 실패';
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <InfoSection title={title}>
      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>상위 카테고리</Label>
          <Select
            value={form.parent_id ?? 'NONE'}
            onValueChange={(v) => patch('parent_id', v === 'NONE' ? null : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">없음 (최상위)</SelectItem>
              {roots.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name_ko}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">슬러그 *</Label>
          <Input
            id="cat-slug"
            value={form.slug}
            onChange={(e) => patch('slug', e.target.value)}
            placeholder="category-slug"
            className="font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-name-ko">이름 (KO) *</Label>
          <Input
            id="cat-name-ko"
            value={form.name_ko}
            onChange={(e) => patch('name_ko', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name-en">이름 (EN)</Label>
          <Input
            id="cat-name-en"
            value={form.name_en}
            onChange={(e) => patch('name_en', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name-ja">이름 (JA)</Label>
          <Input
            id="cat-name-ja"
            value={form.name_ja}
            onChange={(e) => patch('name_ja', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name-de">이름 (DE)</Label>
          <Input
            id="cat-name-de"
            value={form.name_de}
            onChange={(e) => patch('name_de', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-sort">정렬 순서</Label>
          <Input
            id="cat-sort"
            type="number"
            value={form.sort_order}
            onChange={(e) => patch('sort_order', Number(e.target.value))}
            min={0}
            className="font-mono"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(c) => patch('is_active', c === true)}
            />
            <span className="text-[13px] text-foreground">활성 표시</span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSubmit} disabled={isPending} size="sm">
          {isPending ? '저장 중…' : '저장'}
        </Button>
        <Button variant="outline" onClick={onDone} size="sm">
          취소
        </Button>
      </div>
    </InfoSection>
  );
}

/* ─── delete confirm ──────────────────────────────────────────────────────── */

function DeleteButton({ category }: { category: Category }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCategory(category.id);
        toast.success('카테고리를 삭제했습니다.');
        router.refresh();
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '삭제 실패';
        toast.error(msg);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="text-[12px] text-destructive hover:underline disabled:opacity-60"
      >
        삭제
      </button>
      <Dialog open={open} onOpenChange={(o) => !isPending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
            <DialogDescription>
              <strong className="text-foreground">{category.name_ko}</strong>을(를) 삭제합니다.
              사용 중인 상품이 있으면 삭제할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? '삭제 중…' : '삭제 확정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

interface Props {
  categories: Category[];
}

type Row =
  | { kind: 'root'; cat: Category }
  | { kind: 'child'; cat: Category };

export function CategoryManager({ categories }: Props) {
  const [mode, setMode] = useState<Mode>('list');

  const roots = categories.filter((c) => c.parent_id === null);
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id);

  // Flatten roots + children for DataTable
  const rows: Row[] = roots.flatMap((root) => [
    { kind: 'root' as const, cat: root },
    ...childrenOf(root.id).map((c) => ({ kind: 'child' as const, cat: c })),
  ]);

  const columns: DataTableColumn<Row>[] = [
    {
      key: 'name',
      header: '카테고리명',
      cell: (r) =>
        r.kind === 'root' ? (
          <span className="text-[13px] font-medium text-foreground">{r.cat.name_ko}</span>
        ) : (
          <span className="pl-5 text-[13px] text-muted-foreground">└ {r.cat.name_ko}</span>
        ),
    },
    {
      key: 'slug',
      header: '슬러그',
      cell: (r) => <span className="font-mono text-[12px] text-muted-foreground">{r.cat.slug}</span>,
    },
    {
      key: 'sort',
      header: '정렬',
      align: 'center',
      width: '70px',
      cell: (r) => (
        <span className="font-mono text-[12.5px] text-muted-foreground">{r.cat.sort_order}</span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      align: 'center',
      width: '90px',
      cell: (r) => (
        <Badge variant={r.cat.is_active ? 'success' : 'muted'}>
          {r.cat.is_active ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '180px',
      cell: (r) => (
        <div className="flex items-center justify-end gap-3 text-[12px]">
          {r.kind === 'root' && (
            <button
              type="button"
              onClick={() => setMode({ type: 'new', parentId: r.cat.id })}
              className="text-[var(--mz-accent)] hover:underline"
            >
              하위 추가
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode({ type: 'edit', category: r.cat })}
            className="text-muted-foreground hover:text-foreground"
          >
            수정
          </button>
          <DeleteButton category={r.cat} />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="카테고리 관리"
        description={`총 ${categories.length.toLocaleString()}개`}
        actions={
          <Button
            size="sm"
            onClick={() => setMode({ type: 'new', parentId: null })}
            disabled={mode !== 'list'}
          >
            <Plus className="mr-1.5 h-4 w-4" /> 카테고리 추가
          </Button>
        }
      />

      {mode !== 'list' && (
        <div className="mb-4">
          <CategoryFormPanel
            title={mode.type === 'new' ? '새 카테고리' : '카테고리 수정'}
            initial={mode.type === 'new' ? blankInput(mode.parentId) : categoryToInput(mode.category)}
            categoryId={mode.type === 'edit' ? mode.category.id : null}
            roots={roots}
            onDone={() => setMode('list')}
          />
        </div>
      )}

      <DataTable<Row>
        columns={columns}
        rows={rows}
        rowKey={(r, i) => `${r.kind}-${r.cat.id}-${i}`}
        empty="카테고리가 없습니다. 새로 추가해보세요."
      />
    </div>
  );
}
