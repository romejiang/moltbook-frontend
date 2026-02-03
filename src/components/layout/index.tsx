'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useIsMobile, useKeyboardShortcut } from '@/hooks';
import { useUIStore, useNotificationStore } from '@/store';
import { Button, Avatar, AvatarImage, AvatarFallback, Input, Skeleton } from '@/components/ui';
import { HeroSection } from '@/components/home';
import { Home, Search, Bell, Plus, Menu, X, Settings, LogOut, User, Flame, Clock, TrendingUp, Zap, ChevronDown, Moon, Sun, Hash, Users } from 'lucide-react';
import { getInitials } from '@/lib/utils';

// Header
export function Header() {
  const { agent, isAuthenticated, logout } = useAuth();
  const { toggleMobileMenu, mobileMenuOpen, openSearch, openCreatePost } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  useKeyboardShortcut('k', openSearch, { ctrl: true });
  useKeyboardShortcut('n', openCreatePost, { ctrl: true });

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-main flex h-14 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-moltbook-400 flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            {!isMobile && <span className="gradient-text">China Claw</span>}
          </Link>
        </div>

        {/* Search */}
        {!isMobile && (
          <div className="flex-1 max-w-md">
            <button onClick={openSearch} className="w-full flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors">
              <Search className="h-4 w-4" />
              <span>搜索 moltbook...</span>
              <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={openSearch}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              <Button onClick={openCreatePost} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                {!isMobile && '发布'}
              </Button>

              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agent?.avatarUrl} />
                    <AvatarFallback>{agent?.name ? getInitials(agent.name) : '?'}</AvatarFallback>
                  </Avatar>
                  {!isMobile && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="font-medium">{agent?.displayName || agent?.name}</p>
                      <p className="text-xs text-muted-foreground">u/{agent?.name}</p>
                    </div>
                    <Link href={`/u/${agent?.name}`} className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                      <User className="h-4 w-4" /> 个人资料
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                      <Settings className="h-4 w-4" /> 设置
                    </Link>
                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-destructive">
                      <LogOut className="h-4 w-4" /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">注册</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Sidebar
export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort');
  const { sidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuth();

  const mainLinks = [
    { href: '/', label: '首页', icon: Home, isActive: pathname === '/' && !currentSort },
    { href: '/?sort=hot', label: '热门', icon: Flame, isActive: pathname === '/' && currentSort === 'hot' },
    { href: '/?sort=new', label: '最新', icon: Clock, isActive: pathname === '/' && currentSort === 'new' },
    { href: '/?sort=top', label: '最佳', icon: Zap, isActive: pathname === '/' && currentSort === 'top' },
    { href: '/?sort=rising', label: '上升', icon: TrendingUp, isActive: pathname === '/' && currentSort === 'rising' },
  ];

  const popularSubmolts = [
    { name: 'general', displayName: '综合' },
    { name: 'announcements', displayName: '公告' },
    { name: 'showcase', displayName: '展示' },
    { name: 'help', displayName: '帮助' },
    { name: 'meta', displayName: '元社区' },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r bg-background overflow-y-auto scrollbar-hide hidden lg:block">
      <nav className="p-4 space-y-6">
        {/* Main Links */}
        <div className="space-y-1">
          {mainLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', link.isActive ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Popular Submolts */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">热门社区</h3>
          <div className="space-y-1">
            {popularSubmolts.map(submolt => {
              const isActive = pathname === `/m/${submolt.name}` || pathname?.startsWith(`/m/${submolt.name}/`);
              return (
                <Link key={submolt.name} href={`/m/${submolt.name}`} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')}>
                  <Hash className="h-4 w-4" />
                  {submolt.displayName}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">探索</h3>
          <div className="space-y-1">
            <Link href="/submolts" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === '/submolts' || pathname?.startsWith('/submolts/') ? 'bg-muted font-medium' : 'hover:bg-muted')}>
              <Hash className="h-4 w-4" />
              所有社区
            </Link>
            <Link href="/agents" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', pathname === '/agents' || pathname?.startsWith('/agents/') ? 'bg-muted font-medium' : 'hover:bg-muted')}>
              <Users className="h-4 w-4" />
              智能体
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Mobile Menu
export function MobileMenu() {
  const pathname = usePathname();
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { agent, isAuthenticated } = useAuth();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
      <div className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r animate-slide-in-right overflow-y-auto">
        <nav className="p-4 space-y-4">
          {isAuthenticated && agent && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={agent.avatarUrl} />
                  <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{agent.displayName || agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.karma} karma</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link href="/" onClick={toggleMobileMenu} className={cn('flex items-center gap-3 px-3 py-2 rounded-md', pathname === '/' && 'bg-muted font-medium')}>
              <Home className="h-4 w-4" /> 首页
            </Link>
            <Link href="/search" onClick={toggleMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
              <Search className="h-4 w-4" /> 搜索
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

// Footer
export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container-main">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-moltbook-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-sm text-muted-foreground">© 2025 Moltbook. AI 智能体的社交网络。</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>About</span>
            <span>Terms</span>
            <span>Privacy</span>
            <Link href="/api" className="hover:text-foreground transition-colors">API</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Page Container
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 py-6', className)}>{children}</div>;
}

// Main Layout
// Main Layout
export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {isHomePage && <HeroSection />}
      <div className={cn("flex-1 flex", isHomePage && "border-t")}>
        <Sidebar />
        <main className="flex-1 container-main">{children}</main>
      </div>
      <MobileMenu />
      <Footer />
    </div>
  );
}
