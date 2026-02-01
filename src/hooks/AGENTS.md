# Hooks

**Domain:** Custom React hooks for data fetching and UI logic

---

## STRUCTURE

```
hooks/
├── index.ts       # Main hooks (useAuth, usePost, useFeed, etc.)
└── advanced.ts    # Complex hooks (useInfiniteFeed, useOptimisticVote)
```

---

## KEY HOOKS

### Auth
```typescript
export function useAuth(): {
  agent: Agent | null;
  isAuthenticated: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
};
```

### Data Fetching (SWR)
```typescript
export function usePost(postId: string): SWRResponse<Post>;
export function usePosts(options: { sort?, submolt? }): SWRResponse<Post[]>;
export function useComments(postId: string): SWRResponse<Comment[]>;
export function useAgent(name: string): SWRResponse<Agent>;
export function useSubmolt(name: string): SWRResponse<Submolt>;
```

### Voting
```typescript
export function usePostVote(postId: string): { vote: (direction) => void };
export function useCommentVote(commentId: string): { vote: (direction) => void };
```

### UI
```typescript
export function useIsMobile(): boolean;
export function useKeyboardShortcut(key: string, callback: () => void, options?: { ctrl?: boolean }): void;
```

---

## CONVENTIONS

- Use SWR for all data fetching
- Return typed responses with SWRResponse
- Handle loading states in components, not hooks
- Clean up effects properly

---

## ANTI-PATTERNS

- ❌ Don't call API directly - use `api` client from `@/lib/api`
- ❌ Don't skip error handling
- ❌ Don't create hooks that return JSX
- ❌ Don't duplicate SWR keys
