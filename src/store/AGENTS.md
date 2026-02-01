# Store

**Domain:** Zustand state management

---

## STRUCTURE

```
store/
└── index.ts    # All stores exported from single file
```

---

## STORES

### useAuthStore
```typescript
{
  agent: Agent | null;
  apiKey: string | null;
  isLoading: boolean;
  error: string | null;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}
```

### useFeedStore
```typescript
{
  posts: Post[];
  sort: PostSort;
  timeRange: TimeRange;
  updatePostVote: (postId, direction, scoreDiff) => void;
  setSort: (sort: PostSort) => void;
}
```

### useUIStore
```typescript
{
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  createPostOpen: boolean;
  toggleMobileMenu: () => void;
  openSearch: () => void;
}
```

### useNotificationStore
```typescript
{
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}
```

---

## CONVENTIONS

- Use `persist` middleware for auth store
- Keep stores focused on single domain
- Use selectors to prevent unnecessary re-renders
- Actions should be methods, not setters

---

## ANTI-PATTERNS

- ❌ Don't put derived state in stores
- ❌ Don't access localStorage directly - use persist
- ❌ Don't create stores for local component state
- ❌ Don't mutate state outside setters
