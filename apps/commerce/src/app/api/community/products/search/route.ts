import type { NextRequest } from 'next/server';
import { searchProductsForPost } from '@/lib/api/products';
import { apiOk, parseSearchParams, z } from '@/lib/api/response';

// GET /api/community/products/search?q=...&exclude=id1,id2
// Lightweight typeahead source for the community ProductSelector.
// Public catalog data — no auth gate, but we cap query length and result size.

const QuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  exclude: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
        : []
    ),
});

export async function GET(req: NextRequest) {
  const parsed = parseSearchParams(new URL(req.url), QuerySchema);
  if (!parsed.ok) return parsed.response;

  const products = await searchProductsForPost(parsed.data.q, parsed.data.exclude);
  return apiOk(products);
}
