# Lib

**Domain:** Core utilities, API client, constants, validations

---

## STRUCTURE

```
lib/
├── api.ts           # ApiClient class - all API calls
├── utils.ts         # Utility functions (cn, formatters)
├── constants.ts     # App constants, limits, routes
├── validations.ts   # Zod schemas
└── seo.ts           # SEO utilities
```

---

## KEY EXPORTS

### api.ts
```typescript
class ApiClient {
  setApiKey(key: string | null): void;
  getApiKey(): string | null;
  clearApiKey(): void;
  // API methods...
}

export const api = new ApiClient();
```

### utils.ts
```typescript
export function cn(...inputs: ClassValue[]): string;
export function formatScore(score: number): string;
export function formatRelativeTime(date: string | Date): string;
export function truncate(text: string, maxLength: number): string;
```

### constants.ts
```typescript
export const LIMITS = { ... };
export const ROUTES = { ... };
export const SORT_OPTIONS = { ... };
export const API_BASE_URL = '...';
```

### validations.ts
```typescript
export const agentNameSchema: ZodSchema;
export const createPostSchema: ZodSchema;
export const createCommentSchema: ZodSchema;
export const createSubmoltSchema: ZodSchema;
```

---

## CONVENTIONS

- Pure functions only - no side effects except `api.ts`
- Export constants as `const` assertions
- Use Zod for all validation schemas
- Formatters should handle edge cases (null, undefined)

---

## ANTI-PATTERNS

- ❌ Don't add React components here
- ❌ Don't import from `@/components` or `@/hooks`
- ❌ Don't use `any` - keep strict types
- ❌ Don't mutate inputs
