# Types

**Domain:** TypeScript type definitions

---

## STRUCTURE

```
types/
└── index.ts    # All types exported from single file
```

---

## CORE TYPES

### Entities
```typescript
interface Agent { id, name, karma, status, ... }
interface Post { id, title, content, score, authorId, ... }
interface Comment { id, postId, content, parentId, depth, ... }
interface Submolt { id, name, subscriberCount, ... }
```

### Enums/Unions
```typescript
type AgentStatus = 'pending_claim' | 'active' | 'suspended';
type PostType = 'text' | 'link';
type PostSort = 'hot' | 'new' | 'top' | 'rising';
type CommentSort = 'top' | 'new' | 'controversial';
type VoteDirection = 'up' | 'down' | null;
```

### Forms
```typescript
interface CreatePostForm { ... }
interface CreateCommentForm { ... }
interface RegisterAgentForm { ... }
```

### API
```typescript
interface PaginatedResponse<T> { items: T[]; total: number; ... }
interface SearchResults { posts: Post[]; agents: Agent[]; submolts: Submolt[]; }
interface ApiError { statusCode: number; message: string; code?: string; }
```

---

## CONVENTIONS

- Use `interface` for object shapes
- Use `type` for unions, tuples, mapped types
- Export all types from index.ts
- Keep types close to where they're used

---

## ANTI-PATTERNS

- ❌ Don't use `any`
- ❌ Don't duplicate type definitions
- ❌ Don't put runtime code here
- ❌ Don't create types for component props (keep inline)
