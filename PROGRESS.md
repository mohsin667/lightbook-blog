<!--
HOW TO USE THIS FILE

This file is @imported from the root CLAUDE.md, so its full contents load
into every Claude Code session automatically — you never have to re-explain
where the project is at.

Rules for keeping it useful:
1. Only "Current Sprint" and "Up next" should ever be long. Once a sprint is
   done, compress it to one or two lines under "Sprint history" and move any
   detail worth keeping into docs/sprints/sprint-N.md (not auto-loaded — only
   read on request, so history doesn't eat context budget every session).
2. Update it at the END of a work session, not during. See the prompt
   template below.
3. Keep entries factual and short. "Built the editor page, code-block
   toolbar included" not a paragraph of narration.
-->

# Progress

## Current sprint — Sprint 2: state management
**Goal:** replace Context (`DataProvider`/`ToastProvider`) with Redux Toolkit
across the frontend UI — structure only, no working mutations.

### Done
- [x] Sprint 1 — static UI (all 9 pages, component library, Tailwind tokens)
- [x] Redux Toolkit migration (`redux-migration-prompt.md`) — store, slices,
      and component wiring in place

### In progress
- [ ] Strip real mutation logic out of the slices (`redux-strip-logic-prompt.md`)
      — first pass over-implemented reducers as working CRUD; fixing now
- [ ] Fix mismatched mock cover images (a couple of posts are showing the
      wrong `picsum.photos/seed/...` image — seeds got shuffled during
      migration)

### Up next
- [ ] Remaining pages: Post, Editor, Profile, Search, Admin
- [ ] Decide: RTK Query vs keeping slices as plain mock data until backend
      exists

### Decisions Claude Code should remember
- State management is Redux Toolkit, not Context or Zustand — see
  `frontend/CLAUDE.md`
- **Redux reducers must be no-op stubs, not real mutations.** This broke
  once already — the first migration pass implemented working delete/edit/
  like/comment logic, which is exactly what this phase forbids. Read
  side (initial state, selectors) is real; write side is a stub. Only the
  toast slice's reducers are allowed to actually do something, since a
  toast is cosmetic feedback, not a data mutation.
- Still no real API calls / auth / persistence anywhere yet — that's a later
  sprint, not this one

---

## Sprint history
- **Sprint 1** — Static UI built in React + Tailwind from the approved HTML
  prototype. 9 pages, shared component library, design tokens in
  `frontend/CLAUDE.md`. No logic, Context-based mock data.

<!--
END-OF-SPRINT PROMPT TEMPLATE — paste into Claude Code when a sprint wraps:

"This sprint is done. Update PROGRESS.md:
 - Move everything from 'In progress' to 'Done' (or drop it if it didn't ship)
 - Compress this sprint into one line under 'Sprint history'
 - Start a new 'Current sprint' section for: <next sprint's goal>
 - Carry over anything still true under 'Decisions Claude Code should remember'"
-->
