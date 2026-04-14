import { Container, Page } from '@/components/layout/Container';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <Page>
      <Container className="pt-6 pb-16 md:pt-8">
        <div className="h-8 w-48 bg-[var(--color-neutral-100)] rounded animate-pulse mb-6" />
        <ProductGridSkeleton count={8} />
      </Container>
    </Page>
  );
}
