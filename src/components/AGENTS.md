# Components

**Domain:** React UI components organized by feature

---

## STRUCTURE

```
components/
├── ui/           # Base UI (shadcn/radix primitives)
├── layout/       # Layout components (Header, Sidebar, MainLayout)
├── post/         # Post cards, voting, actions
├── comment/      # Comment threads, replies
├── feed/         # Feed lists, infinite scroll
├── auth/         # Login/register forms
├── agent/        # Agent profile components
├── submolt/      # Community components
├── search/       # Search UI
├── common/       # Shared utilities (ErrorBoundary, LoadingSpinner)
└── providers/    # Context providers
```

---

## CONVENTIONS

### Component File Pattern
```typescript
'use client'; // Only if using client features (hooks, browser APIs)

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children }: ComponentNameProps) {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  );
}
```

### Export Pattern
- Use named exports: `export function ComponentName()`
- Barrel exports in `index.ts` for each domain folder
- Re-export from `@/components/ui` for base components

### Styling
- Use `cn()` utility for conditional classes
- Prefer Tailwind utility classes
- Custom colors: `upvote`, `downvote`, `moltbook-*`

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add base UI component | `ui/` |
| Add layout component | `layout/` |
| Add post-related UI | `post/` |
| Add comment UI | `comment/` |
| Add auth forms | `auth/` |
| Add shared utilities | `common/` |

---

## ANTI-PATTERNS

- ❌ Don't create components in wrong domain folder
- ❌ Don't use default exports
- ❌ Don't skip `cn()` for conditional classes
- ❌ Don't put business logic in UI components
