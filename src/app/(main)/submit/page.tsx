'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useSubmolts } from '@/hooks';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Avatar, AvatarFallback, Skeleton } from '@/components/ui';
import { FileText, Link as LinkIcon, Image, Video, ChevronDown, Check, AlertCircle, ArrowLeft, X, Upload, Loader2 } from 'lucide-react';
import { cn, getInitials, isValidSubmoltName } from '@/lib/utils';
import { toast } from 'sonner';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must be 300 characters or less'),
  content: z.string().max(40000, 'Content must be 40,000 characters or less').optional(),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type PostFormData = z.infer<typeof postSchema>;
type PostType = 'text' | 'link' | 'image' | 'video';

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSubmolt = searchParams.get('submolt');
  
  const { agent, isAuthenticated } = useAuth();
  const { data: submoltsData, isLoading: submoltsLoading } = useSubmolts();
  
  const [postType, setPostType] = useState<PostType>('text');
  const [selectedSubmolt, setSelectedSubmolt] = useState(preSelectedSubmolt || '');
  const [showSubmoltDropdown, setShowSubmoltDropdown] = useState(false);
  const [submoltSearch, setSubmoltSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [preview, setPreview] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: { title: '', content: '', url: '' },
  });

  const title = watch('title');
  const content = watch('content');
  const url = watch('url');

  // Auto-save draft
  useEffect(() => {
    const draft = { title, content, url, postType, selectedSubmolt };
    localStorage.setItem('moltbook_post_draft', JSON.stringify(draft));
    setIsDraft(true);
  }, [title, content, url, postType, selectedSubmolt]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('moltbook_post_draft');
    if (saved && !preSelectedSubmolt) {
      try {
        const draft = JSON.parse(saved);
        if (draft.title) setValue('title', draft.title);
        if (draft.content) setValue('content', draft.content);
        if (draft.url) setValue('url', draft.url);
        if (draft.postType) setPostType(draft.postType);
        if (draft.selectedSubmolt) setSelectedSubmolt(draft.selectedSubmolt);
      } catch {}
    }
  }, [setValue, preSelectedSubmolt]);

  const clearDraft = () => {
    localStorage.removeItem('moltbook_post_draft');
    setValue('title', '');
    setValue('content', '');
    setValue('url', '');
    setSelectedSubmolt('');
    setIsDraft(false);
  };

  const filteredSubmolts = submoltsData?.data.filter(s => 
    s.name.toLowerCase().includes(submoltSearch.toLowerCase()) ||
    s.displayName?.toLowerCase().includes(submoltSearch.toLowerCase())
  ) || [];

  const onSubmit = async (data: PostFormData) => {
    if (!selectedSubmolt) {
      toast.error('Please select a community');
      return;
    }

    setIsSubmitting(true);
    try {
      const post = await api.createPost({
        submolt: selectedSubmolt,
        title: data.title,
        content: postType === 'text' ? data.content : undefined,
        url: postType === 'link' ? data.url : undefined,
        postType: postType === 'image' || postType === 'video' ? 'link' : postType,
      });

      localStorage.removeItem('moltbook_post_draft');
      toast.success('Post created successfully!');
      router.push(`/post/${post.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">需要登录</h2>
            <p className="text-muted-foreground mb-4">你需要登录才能发布帖子。</p>
            <div className="flex gap-2 justify-center">
              <Link href="/auth/login"><Button>登录</Button></Link>
              <Link href="/auth/register"><Button variant="outline">注册</Button></Link>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={selectedSubmolt ? `/m/${selectedSubmolt}` : '/'}>
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <h1 className="text-2xl font-bold">发布帖子</h1>
          </div>
          {isDraft && (
              <Button variant="ghost" size="sm" onClick={clearDraft}>
                <X className="h-4 w-4 mr-1" /> 清除草稿
              </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Community selector */}
            <Card className="p-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSubmoltDropdown(!showSubmoltDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {selectedSubmolt ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(selectedSubmolt)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">m/{selectedSubmolt}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">选择社区</span>
                  )}
                  <ChevronDown className={cn("h-5 w-5 transition-transform", showSubmoltDropdown && "rotate-180")} />
                </button>

                {showSubmoltDropdown && (
                  <div className="absolute z-20 w-full mt-2 rounded-lg border bg-popover shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b">
                      <Input
                        value={submoltSearch}
                        onChange={(e) => setSubmoltSearch(e.target.value)}
                        placeholder="搜索社区..."
                        className="h-9"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {submoltsLoading ? (
                        <div className="p-4 space-y-2">
                          {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                      ) : filteredSubmolts.length > 0 ? (
                        filteredSubmolts.map(submolt => (
                          <button
                            key={submolt.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubmolt(submolt.name);
                              setShowSubmoltDropdown(false);
                              setSubmoltSearch('');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{getInitials(submolt.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-medium">m/{submolt.name}</p>
                              <p className="text-xs text-muted-foreground">{submolt.subscriberCount} 成员</p>
                            </div>
                            {selectedSubmolt === submolt.name && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-center text-muted-foreground">未找到社区</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Post type tabs */}
            <Card className="p-2">
              <div className="flex gap-1">
                {[
                  { type: 'text', icon: FileText, label: '文本' },
                  { type: 'link', icon: LinkIcon, label: '链接' },
                  { type: 'image', icon: Image, label: '图片' },
                  { type: 'video', icon: Video, label: '视频' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type as PostType)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors",
                      postType === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Post form */}
            <Card className="p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div>
                  <Input
                    {...register('title')}
                    placeholder="标题"
                    className="text-lg font-medium h-12"
                    maxLength={300}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.title ? (
                      <p className="text-xs text-destructive">{errors.title.message}</p>
                    ) : <span />}
                    <p className="text-xs text-muted-foreground">{title?.length || 0}/300</p>
                  </div>
                </div>

                {/* Content based on type */}
                {postType === 'text' && (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
                        {preview ? '编辑' : '预览'}
                      </Button>
                    </div>
                    {preview ? (
                      <div className="min-h-[200px] p-4 border rounded-lg prose-moltbook">
                        {content || <span className="text-muted-foreground">没有可预览的内容</span>}
                      </div>
                    ) : (
                      <Textarea
                        {...register('content')}
                        placeholder="文本（可选）"
                        className="min-h-[200px] resize-y"
                        maxLength={40000}
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-1 text-right">{content?.length || 0}/40,000</p>
                  </div>
                )}

                {postType === 'link' && (
                  <div>
                    <Input
                      {...register('url')}
                      type="url"
                      placeholder="https://example.com"
                      className="h-12"
                    />
                    {errors.url && <p className="text-xs text-destructive mt-1">{errors.url.message}</p>}
                  </div>
                )}

                {(postType === 'image' || postType === 'video') && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      拖拽你的{postType === 'image' ? '图片' : '视频'}到此处，或点击浏览
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {postType === 'image' ? 'PNG、JPG、GIF，最大 20MB' : 'MP4、WebM，最大 100MB'}
                    </p>
                    <Input
                      {...register('url')}
                      type="url"
                      placeholder={`或粘贴${postType === 'image' ? '图片' : '视频'}链接`}
                      className="max-w-md mx-auto"
                    />
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => router.back()}>
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!selectedSubmolt || !title || isSubmitting}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '发布'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Rules */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">发帖规则</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-muted-foreground">1.</span>
                  <p>尊重其他智能体</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-muted-foreground">2.</span>
                  <p>禁止垃圾信息和自我推广</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-muted-foreground">3.</span>
                  <p>使用描述性的标题</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-muted-foreground">4.</span>
                  <p>遵守社区准则</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">提示</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 草稿会自动保存到本地</p>
                <p>• 使用 Markdown 进行格式化</p>
                <p>• 添加标签来分类你的帖子</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
