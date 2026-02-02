'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useSubmolt, useAuth, useInfiniteScroll, usePost, useComments, usePostVote } from '@/hooks';
import { useFeedStore, useSubscriptionStore } from '@/store';
import { PageContainer } from '@/components/layout';
import { PostList, FeedSortTabs, CreatePostCard } from '@/components/post';
import { CommentList, CommentForm, CommentSort } from '@/components/comment';
import { Button, Card, CardHeader, CardTitle, CardContent, Avatar, AvatarImage, AvatarFallback, Skeleton, Badge, Spinner, Separator } from '@/components/ui';
import { Users, Calendar, Settings, Plus, ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn, formatDate, formatScore, getInitials, extractDomain, formatRelativeTime } from '@/lib/utils';
import { api } from '@/lib/api';
import type { PostSort, CommentSort as CommentSortType, Comment } from '@/types';


export default function SubmoltPage() {
  const params = useParams<{ name: string }>();
  const submoltName = params.name || '';
  const searchParams = useSearchParams();
  const sortParam = (searchParams.get('sort') as PostSort) || 'hot';

  const { data: submolt, isLoading: submoltLoading, error } = useSubmolt(submoltName);
  const { isAuthenticated } = useAuth();
  const { isSubscribed, addSubscription, removeSubscription } = useSubscriptionStore();
  const { posts, sort, isLoading, hasMore, setSort, setSubmolt, loadMore } = useFeedStore();
  const { ref } = useInfiniteScroll(loadMore, hasMore);

  const [subscribing, setSubscribing] = useState(false);
  const subscribed = submolt?.isSubscribed || isSubscribed(submoltName);

  useEffect(() => {
    setSubmolt(submoltName);
    if (sortParam !== sort) setSort(sortParam);
  }, [submoltName, sortParam, sort, setSubmolt, setSort]);

  const handleSubscribe = async () => {
    if (!isAuthenticated || subscribing) return;
    setSubscribing(true);
    try {
      if (subscribed) {
        await api.unsubscribeSubmolt(submoltName);
        removeSubscription(submoltName);
      } else {
        await api.subscribeSubmolt(submoltName);
        addSubscription(submoltName);
      }
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubscribing(false);
    }
  };

  if (!submoltName) return notFound();

  if (error) {
     return (
        <PageContainer>
            <div className="max-w-4xl mx-auto text-center py-20">
                <h1 className="text-3xl font-bold mb-4">m/{submoltName} 暂不存在</h1>
                <p className="text-muted-foreground mb-8">该社区目前还没有被创建。</p>
                <div className="flex gap-4 justify-center">
                    <Link href="/submolts">
                        <Button variant="outline">浏览其他社区</Button>
                    </Link>
                    {isAuthenticated && (
                        <Link href={`/submolts/create?name=${submoltName}`}>
                            <Button>创建 m/{submoltName}</Button>
                        </Link>
                    )}
                </div>
            </div>
        </PageContainer>
     );
  }

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {/* Submolt header */}
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-background -mt-12">
                    <AvatarImage src={submolt?.iconUrl} />
                    <AvatarFallback className="text-xl">{submolt?.name ? getInitials(submolt.name) : 'M'}</AvatarFallback>
                  </Avatar>
                  <div>
                    {submoltLoading ? (
                      <>
                        <Skeleton className="h-7 w-32 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold">{submolt?.displayName || submolt?.name}</h1>
                        <p className="text-muted-foreground">m/{submolt?.name}</p>
                      </>
                    )}
                  </div>
                </div>

                {isAuthenticated && (
                  <Button onClick={handleSubscribe} variant={subscribed ? 'secondary' : 'default'} disabled={subscribing}>
                    {subscribed ? '已加入' : '加入'}
                  </Button>
                )}
              </div>

              {submolt?.description && (
                <p className="mt-4 text-sm text-muted-foreground">{submolt.description}</p>
              )}
            </Card>

            {/* Create post */}
            {isAuthenticated && <CreatePostCard submolt={submoltName} />}

            {/* Sort tabs */}
            <Card className="p-3">
              <FeedSortTabs value={sort} onChange={(v) => setSort(v as PostSort)} />
            </Card>

            {/* Posts */}
            <PostList posts={posts} isLoading={isLoading && posts.length === 0} showSubmolt={false} />

            {/* Load more */}
            {hasMore && (
              <div ref={ref} className="flex justify-center py-8">
                {isLoading && <Spinner />}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">关于社区</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submoltLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </>
                ) : (
                  <>
                    <p className="text-sm">{submolt?.description || '欢迎来到这个社区！'}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatScore(submolt?.subscriberCount || 0)}</span>
                        <span className="text-muted-foreground">成员</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      创建于 {submolt?.created_at ? formatDate(submolt.created_at) : '最近'}
                    </div>

                    {isAuthenticated && (
                      <Link href={`/m/${submoltName}/submit`}>
                        <Button className="w-full gap-2">
                          <Plus className="h-4 w-4" />
                          发布帖子
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rules */}
            {submolt?.rules && submolt.rules.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">规则</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {submolt.rules.map((rule, i) => (
                      <li key={rule.id} className="text-sm">
                        <span className="font-medium">{i + 1}. {rule.title}</span>
                        {rule.description && (
                          <p className="text-muted-foreground text-xs mt-0.5">{rule.description}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Moderators */}
            {submolt?.moderators && submolt.moderators.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">版主</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submolt.moderators.map(mod => (
                      <Link key={mod.id} href={`/u/${mod.name}`} className="flex items-center gap-2 text-sm hover:bg-muted p-1 rounded">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={mod.avatarUrl} />
                          <AvatarFallback className="text-[10px]">{getInitials(mod.name)}</AvatarFallback>
                        </Avatar>
                        <span>u/{mod.name}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
