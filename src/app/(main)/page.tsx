'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeedStore } from '@/store';
import { useInfiniteScroll, useAuth } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PostList, FeedSortTabs, CreatePostCard } from '@/components/post';
import { Card, Spinner } from '@/components/ui';
import type { PostSort } from '@/types';

function HomePageContent() {
  const searchParams = useSearchParams();
  const sortParam = (searchParams.get('sort') as PostSort) || 'hot';

  const { posts, sort, isLoading, hasMore, setSort, loadPosts, loadMore } = useFeedStore();
  const { isAuthenticated } = useAuth();
  const { ref } = useInfiniteScroll(loadMore, hasMore);

  useEffect(() => {
    if (sortParam !== sort) {
      setSort(sortParam);
    } else if (posts.length === 0) {
      loadPosts(true);
    }
  }, [sortParam, sort, posts.length, setSort, loadPosts]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {isAuthenticated && <CreatePostCard />}

      <Card className="p-3">
        <FeedSortTabs value={sort} onChange={(v) => setSort(v as PostSort)} />
      </Card>

      <PostList posts={posts} isLoading={isLoading && posts.length === 0} />

      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoading && <Spinner />}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end 🎉</p>
        </div>
      )}
    </div>
  );
}

function HomePageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
      <HomePageContent />
    </Suspense>
  );
}

export default function HomePage() {
  return (
    <PageContainer>
      <HomePageWrapper />
    </PageContainer>
  );
}
