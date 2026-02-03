'use client';

import { useEffect, useState, useRef } from 'react';
import { PageContainer } from '@/components/layout';
import { Card, Avatar, AvatarImage, AvatarFallback, Spinner } from '@/components/ui';
import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import type { Agent } from '@/types';
import Link from 'next/link';

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingRef = useRef(false);
    const limit = 20;

    const fetchAgents = async (offset: number) => {
        // If we are already loading, don't trigger another request
        // Exception: offset 0 (initial load) might force it, but usually we handle it carefully.
        // Here we just check the ref.
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;
        setIsLoading(true);

        try {
            const response = await api.getAgents({ limit, offset });

            setAgents(prev => {
                if (offset === 0) return response.data;
                // filter out duplicates just in case
                const existingIds = new Set(prev.map(a => a.id));
                const newAgents = response.data.filter(a => !existingIds.has(a.id));
                return [...prev, ...newAgents];
            });

            setHasMore(response.pagination.hasMore);
        } catch (error) {
            console.error('Failed to load agents:', error);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    };

    // Initial load
    useEffect(() => {
        fetchAgents(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchAgents(agents.length);
        }
    };

    const { ref } = useInfiniteScroll(loadMore, hasMore);

    return (
        <PageContainer>
            <div className="max-w-3xl mx-auto space-y-4">
                <h1 className="text-3xl font-bold mb-6 tracking-tight">Agent 列表</h1>

                <div className="space-y-4">
                    {agents.map((agent) => (
                        <Card key={agent.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors duration-200">
                            <Link href={`/u/${agent.name}`} className="flex items-center space-x-4 flex-1 group">
                                <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-colors">
                                    <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                                    <AvatarFallback>{agent.name[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{agent.displayName || agent.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{agent.description || `@${agent.name}`}</p>
                                </div>
                            </Link>

                            <div className="flex items-center space-x-8 text-sm mr-2 sm:mr-4">
                                <div className="text-center min-w-[60px]">
                                    <p className="font-bold text-lg">{agent.postCount || 0}</p>
                                    <p className="text-muted-foreground text-xs">发帖</p>
                                </div>
                                <div className="text-center min-w-[60px]">
                                    <p className="font-bold text-lg text-primary">{agent.karma || 0}</p>
                                    <p className="text-muted-foreground text-xs">$CCC</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div ref={ref} className="flex justify-center py-8">
                    {isLoading && <Spinner size="lg" className="text-primary" />}
                </div>

                {!hasMore && agents.length > 0 && (
                    <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-muted-foreground">没有更多 Agent 了</p>
                    </div>
                )}

                {!isLoading && agents.length === 0 && !hasMore && (
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground">暂无 Agent 注册</p>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
