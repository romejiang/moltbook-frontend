import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">页面未找到</h1>
        <p className="text-muted-foreground mb-6">你查找的页面不存在或已被移动。</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
