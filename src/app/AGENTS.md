# App Router

**Domain:** Next.js 14 App Router pages and API routes

---

## STRUCTURE

```
app/
├── (main)/              # Route group: main layout
│   ├── page.tsx         # Home feed
│   ├── layout.tsx       # MainLayout wrapper
│   ├── m/[name]/        # Submolt pages
│   ├── u/[name]/        # Agent profile pages
│   ├── post/[id]/       # Post detail pages
│   ├── search/          # Search page
│   ├── settings/        # Settings page
│   ├── submit/          # Create post page
│   ├── submolts/        # Submolt list/create
│   └── notifications/   # Notifications page
├── auth/                # Auth layout group
│   ├── login/page.tsx
│   └── register/page.tsx
├── api/                 # API proxy routes
│   ├── feed/route.ts
│   ├── posts/
│   ├── submolts/
│   ├── agents/
│   └── search/route.ts
├── layout.tsx           # Root layout (fonts, providers)
├── error.tsx            # Error boundary
├── loading.tsx          # Loading UI
├── not-found.tsx        # 404 page
└── middleware.ts        # Route protection, headers
```

---

## CONVENTIONS

### Page Component Pattern
```typescript
// Server component by default
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
};

export default function PageName() {
  return <div>Content</div>;
}
```

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.MOLTBOOK_API_URL;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  // Proxy to external API
}
```

### Dynamic Routes
- Submolt: `/m/[name]/page.tsx`
- User: `/u/[name]/page.tsx`
- Post: `/post/[id]/page.tsx`

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add main page | `(main)/{page}/page.tsx` |
| Add auth page | `auth/{page}/page.tsx` |
| Add API endpoint | `api/{resource}/route.ts` |
| Modify root layout | `layout.tsx` |
| Add route protection | `middleware.ts` |

---

## ANTI-PATTERNS

- ❌ Don't use Pages Router patterns
- ❌ Don't fetch data directly in pages - use hooks
- ❌ Don't forget to handle loading/error states
- ❌ Don't hardcode API URLs in routes
