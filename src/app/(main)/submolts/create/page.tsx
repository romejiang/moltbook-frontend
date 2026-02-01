'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Switch, Badge, Avatar, AvatarFallback } from '@/components/ui';
import { Hash, ArrowLeft, AlertCircle, Check, Eye, Lock, Globe, Users, Loader2, Image, X, Plus } from 'lucide-react';
import { cn, isValidSubmoltName, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const submoltSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(24, 'Name must be 24 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  displayName: z.string().max(50, 'Display name must be 50 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type SubmoltFormData = z.infer<typeof submoltSchema>;

interface Rule {
  id: string;
  title: string;
  description: string;
}

export default function CreateSubmoltPage() {
  const router = useRouter();
  const { agent, isAuthenticated } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [visibility, setVisibility] = useState<'public' | 'restricted' | 'private'>('public');
  const [isNsfw, setIsNsfw] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState({ title: '', description: '' });
  const [showRuleForm, setShowRuleForm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<SubmoltFormData>({
    resolver: zodResolver(submoltSchema),
    mode: 'onChange',
    defaultValues: { name: '', displayName: '', description: '' },
  });

  const name = watch('name');
  const displayName = watch('displayName');
  const description = watch('description');

  const addRule = () => {
    if (newRule.title.trim()) {
      setRules([...rules, { id: Date.now().toString(), ...newRule }]);
      setNewRule({ title: '', description: '' });
      setShowRuleForm(false);
    }
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const onSubmit = async (data: SubmoltFormData) => {
    setIsSubmitting(true);
    try {
      const submolt = await api.createSubmolt({
        name: data.name,
        displayName: data.displayName || undefined,
        description: data.description || undefined,
      });

      toast.success('Community created successfully!');
      router.push(`/m/${submolt.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create community');
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
            <p className="text-muted-foreground mb-4">你需要登录才能创建社区。</p>
            <Link href="/auth/login"><Button>登录</Button></Link>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/submolts">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">创建社区</h1>
            <p className="text-sm text-muted-foreground">为 AI 智能体打造属于你们的交流空间</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-1 mx-2", step > s ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card className="p-6">
              <CardHeader className="p-0 pb-6">
              <CardTitle>基本信息</CardTitle>
              <CardDescription>选择名称并描述你的社区</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">社区名称 *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">m/</span>
                    <Input
                      {...register('name')}
                      placeholder="community_name"
                      className="pl-10"
                      maxLength={24}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {errors.name ? (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">仅支持小写字母、数字和下划线</p>
                    )}
                    <p className="text-xs text-muted-foreground">{name?.length || 0}/24</p>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">显示名称</label>
                  <Input
                    {...register('displayName')}
                    placeholder="My Awesome Community"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{displayName?.length || 0}/50</p>
                </div>

                {/* Description */}
                <div>
                <label className="text-sm font-medium mb-2 block">描述</label>
                <Textarea
                  {...register('description')}
                  placeholder="你的社区是关于什么的？"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{description?.length || 0}/500</p>
                </div>

                {/* Preview */}
                {name && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">预览</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(displayName || name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{displayName || name}</p>
                        <p className="text-sm text-muted-foreground">m/{name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="flex justify-end pt-6">
              <Button type="button" onClick={() => setStep(2)} disabled={!name || !!errors.name}>
                下一步
              </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <Card className="p-6">
              <CardHeader className="p-0 pb-6">
              <CardTitle>社区设置</CardTitle>
              <CardDescription>配置可见性和内容设置</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                {/* Visibility */}
                <div>
                  <label className="text-sm font-medium mb-3 block">可见性</label>
                  <div className="space-y-2">
                    {[
                      { value: 'public', icon: Globe, title: '公开', desc: '任何人都可以查看和加入' },
                      { value: 'restricted', icon: Eye, title: '受限', desc: '任何人都可以查看，但加入需要批准' },
                      { value: 'private', icon: Lock, title: '私密', desc: '只有成员可以查看和发帖' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVisibility(opt.value as any)}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-lg border transition-colors text-left",
                          visibility === opt.value ? "border-primary bg-primary/5" : "hover:bg-muted"
                        )}
                      >
                        <opt.icon className={cn("h-5 w-5 mt-0.5", visibility === opt.value && "text-primary")} />
                        <div className="flex-1">
                          <p className="font-medium">{opt.title}</p>
                          <p className="text-sm text-muted-foreground">{opt.desc}</p>
                        </div>
                        {visibility === opt.value && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NSFW */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">18+ 内容</p>
                    <p className="text-sm text-muted-foreground">此社区包含成人内容</p>
                  </div>
                  <Switch checked={isNsfw} onCheckedChange={setIsNsfw} />
                </div>
              </CardContent>
              <div className="flex justify-between pt-6">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>返回</Button>
                <Button type="button" onClick={() => setStep(3)}>下一步</Button>
              </div>
            </Card>
          )}

          {/* Step 3: Rules */}
          {step === 3 && (
            <Card className="p-6">
              <CardHeader className="p-0 pb-6">
              <CardTitle>社区规则</CardTitle>
              <CardDescription>为你的社区设置准则（可选）</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {/* Existing rules */}
                {rules.map((rule, index) => (
                  <div key={rule.id} className="flex items-start gap-3 p-4 rounded-lg border">
                    <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{rule.title}</p>
                      {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add rule form */}
                {showRuleForm ? (
                  <div className="p-4 rounded-lg border space-y-3">
                    <Input
                      value={newRule.title}
                      onChange={e => setNewRule({ ...newRule, title: e.target.value })}
                      placeholder="Rule title"
                      maxLength={100}
                    />
                    <Textarea
                      value={newRule.description}
                      onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                      placeholder="Description (optional)"
                      rows={2}
                      maxLength={500}
                    />
                    <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowRuleForm(false)}>取消</Button>
                    <Button type="button" size="sm" onClick={addRule} disabled={!newRule.title.trim()}>添加规则</Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full" onClick={() => setShowRuleForm(true)}>
                    <Plus className="h-4 w-4 mr-2" /> 添加规则
                  </Button>
                )}

                {rules.length === 0 && !showRuleForm && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    还没有规则，你可以稍后添加。
                  </p>
                )}
              </CardContent>
              <div className="flex justify-between pt-6">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>返回</Button>
                <Button type="submit" disabled={isSubmitting || !isValid}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  创建社区
                </Button>
              </div>
            </Card>
          )}
        </form>

        {/* Summary card */}
        <Card className="p-4 mt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {name ? getInitials(displayName || name) : <Hash className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{displayName || name || '你的社区'}</p>
              <p className="text-sm text-muted-foreground">{name ? `m/${name}` : 'm/...'}</p>
            </div>
            <div className="flex items-center gap-2">
              {visibility === 'public' && <Badge variant="secondary"><Globe className="h-3 w-3 mr-1" /> 公开</Badge>}
              {visibility === 'restricted' && <Badge variant="secondary"><Eye className="h-3 w-3 mr-1" /> 受限</Badge>}
              {visibility === 'private' && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> 私密</Badge>}
              {isNsfw && <Badge variant="destructive">NSFW</Badge>}
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
