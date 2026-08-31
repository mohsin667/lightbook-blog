# lightbook.info — Frontend UI

## What this repo is
The frontend for **lightbook.info**, a Medium-style blog platform. This phase is
**UI only** — static, presentational React components built from a finished
HTML/CSS prototype. All real logic (data fetching, auth, persistence, API
calls) is written by the developer afterward, not by Claude Code, in a later
phase.

Read this file before writing any code. It's the standing context for every
session in this repo, not just the first one.

---

## Ground rules

1. **No business logic.** No `fetch`, no real API calls, no localStorage, no
   real authentication. Data originates from `src/data/mockData.ts`.

2. **State management: Redux Toolkit — structure only, reducers are stubs.**
   All shared state (posts, users, categories, toasts) lives in Redux slices
   under `src/features/`, read via `useSelector`. Every slice's *read* side
   (initial state seeded from `src/data/mockData.ts`, selectors) is real.
   Every slice's *write* side — reducers like `deletePost`, `postUpdated`,
   `toggleLike`, `addComment`, `reportPost`, `restrictUser` — is a **no-op
   stub**: the action exists and components call `dispatch(...)` on click,
   but the reducer body doesn't mutate state. This replaced the earlier
   Context-based `DataProvider`/`ToastProvider` — see
   `docs/redux-migration-prompt.md`. Toast is the one exception: showing/
   dismissing a toast is cosmetic feedback, not a data mutation, so its
   reducer is real.

3. **Local UI state is still fine for anything purely visual.** A mobile menu
   open/closed, an active tab, a controlled input mid-edit before submit —
   plain `useState` is fine and doesn't need to go through Redux. Put
   something in a slice when more than one component needs to read or react
   to it; keep it local otherwise.

4. **No routing guards.** `react-router-dom` gives each page a URL and lets
   the Navbar link between them. No protected routes, no redirects based on
   auth state, no route loaders.

5. **Mock data only, shaped like the real thing.** Use the field names in
   "Data shapes" below so the real API response can drop into the same slices
   later without renaming anything.

6. **Interactive-looking, functionally inert.** "Publish", "Sign in", "Like",
   "Report", "Restrict user" etc. should be real clickable buttons that
   dispatch a real action — but the reducer handling that action is a stub
   (see rule 2). Nothing persists, nothing actually changes what's rendered
   elsewhere, no `fetch` call happens.

7. When unsure whether something counts as "logic," ask: *does this decide
   how data changes, or just how it's displayed/dispatched?* Deciding how
   data changes is logic — stub it, don't build it, even in a Redux reducer.

---

## Tech stack

- React 18 + Vite
- Redux Toolkit + react-redux for state (see `src/app/store.ts`,
  `src/features/*/*.ts`)
- TypeScript
- Tailwind CSS v3
- `react-router-dom` — routing structure only
- `lucide-react` — icon set (stand-in for the prototype's custom icons; match
  icon *meaning*, not exact SVG paths — e.g. `PenLine` for write, `Heart` for
  like, `Flag` for report, `ShieldCheck` for admin)

---

## Design tokens

There's a finished prototype at `design-reference/prototype.html` — treat it
as the visual source of truth over anything written here. It's a single-file
vanilla JS app; each page's markup and styling lives in one render function
(`renderHome()`, `renderPost()`, etc.). The tokens below are extracted from
it, but the prototype itself is more precise on spacing, hover states, and
layout structure.

Add these to `tailwind.config.ts` under `theme.extend`. Use Tailwind classes
in components — don't hardcode hex values inline.

### Colors

| Token | Value | Use |
|---|---|---|
| `bg` | `#0D0F13` | page background |
| `surface` | `#15181E` | cards, inputs, nav, code blocks |
| `surface-tint` | `#1D2129` | hover states, subtle fills, active tab bg |
| `ink` | `#F5F4F0` | primary text |
| `ink-soft` | `#9297A3` | secondary text, meta, labels |
| `border` | `rgba(255,255,255,0.08)` | default 1px borders |
| `border-strong` | `rgba(255,255,255,0.18)` | hover/focus borders |
| `coral` | `#FF6A4D` | **the** primary accent — buttons, links, active states, icons |
| `coral-light` | `rgba(255,106,77,0.16)` | tinted backgrounds on coral |
| `coral-deep` | `#170804` | text sitting on top of solid coral |
| `danger` | `#FF4D5E` | flagged / restricted / destructive actions only |
| `danger-light` | `rgba(255,77,94,0.15)` | tinted danger backgrounds |
| `danger-deep` | `#FF9CA8` | text on tinted danger backgrounds |

**Only two hues exist in this UI: coral (primary) and danger red (semantic —
flags, restrictions, delete). Categories are told apart by icon, not by
color.** Don't introduce a rainbow of category colors; that was tried and
explicitly rejected earlier in this project.

### Fonts

Load via Google Fonts: Space Grotesk (500/600/700), Inter (400–800),
JetBrains Mono (400–700).

- `font-display` (Space Grotesk) → all headings, buttons, nav links, logo, stat numbers
- `font-sans` (Inter, default) → body copy
- `font-mono` (JetBrains Mono) → code blocks, inline code, language labels

### Radii & feel

- Inputs / buttons → `rounded-lg` (8px)
- Cards → `rounded-xl` (12px)
- Hero / large panels → `rounded-2xl` (16px)
- Badges / pills → `rounded-md` (~7px)
- Dark, bold, minimal. Thin 1px borders (not heavy/dashed). No drop shadows
  except the floating "write" button. No gradients except the dark overlay
  behind the home page hero image.

---

## Folder structure

```
src/
  app/
    store.ts        configureStore, combines all feature reducers
  features/
    posts/           postsSlice.ts
    users/           usersSlice.ts
    categories/       categoriesSlice.ts
    toast/           toastSlice.ts
  components/
    layout/        Navbar, Footer
    ui/             Button, Badge, Card, Input, Textarea, Select, Tabs,
                     StatCard, Avatar, ToastContainer, EmptyState, BarRow
    post/           PostCard, PostGrid, FeaturedHero, CodeBlock, InlineCode,
                     CommentItem, CommentList, CommentForm, LikeButton,
                     StatusBadge, CategoryBadge
    admin/          AdminTabs, UserRow, FlaggedPostRow, CategoryRow,
                     FeaturedPostSelect
  pages/
    HomePage.tsx
    PostPage.tsx
    EditorPage.tsx
    ProfilePage.tsx
    SearchPage.tsx
    DashboardPage.tsx
    AdminPage.tsx
    SignInPage.tsx
    SignUpPage.tsx
  data/
    mockData.ts       seed content, imported once into slice initial state
  App.tsx           route definitions
  main.tsx
```

## Conventions

- One component per file, named exports, PascalCase filenames.
- Props typed with an interface named `<Component>Props`.
- Tailwind utility classes only — no inline `style={{}}` except for a
  genuinely computed value (e.g. a bar chart's `width: ${pct}%`).
- Build once, reuse everywhere: every button/badge/card in every page should
  be the shared `ui/` component, not one-off markup copied per page.
- Icons default to 18–20px, `strokeWidth={1.75}`, from `lucide-react`.
- Images: use `https://picsum.photos/seed/<anything>/<w>/<h>` as placeholder
  cover photos in mock data.

## Data shapes

Match these shapes in `mockData.ts` — this is what the real API will return later.

```ts
interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;       // markdown-ish: blank-line paragraphs, ```lang fenced code blocks, `inline code`
  category: string;
  authorId: string;
  image: string;
  status: 'published' | 'draft' | 'flagged';
  createdAt: number;      // epoch ms
  views: number;
  likes: number;
  flagCount: number;
  comments: { author: string; text: string; createdAt: number }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: 'user' | 'admin';
  status: 'active' | 'restricted';
  joinedAt: string;       // 'YYYY-MM-DD'
}

interface Category {
  name: string;
  icon: string;           // lucide icon name to render
}
```

## Commands

```
npm install
npm run dev
npm run build
```

## Explicitly out of scope for this phase

- Auth/session logic, JWT, password hashing
- API integration, data fetching, caching
- Form validation business rules (basic HTML5 `required`/`type=email` is fine)
- Persisted state of any kind
- Tests