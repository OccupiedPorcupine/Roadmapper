# Saved Roadmaps Sidebar Implementation Framework

This framework outlines the steps to implement a functional "Saved Roadmaps" sidebar (hamburger menu) within the application.

## 1. Component Strategy
We will reuse and enhance the existing `SidebarDrawer` component.
- **Current State**: It only accepts a list of strings (`roadmapTitles`).
- **Required State**: It needs to accept a list of `RoadmapListItem` objects (id, title, created_at) to support navigation.

## 2. Implementation Steps

### Step A: Update `SidebarDrawer` Props
Modify `frontend/src/components/features/SidebarDrawer.tsx`:
1.  Import `RoadmapListItem` from `@/types`.
2.  Update `SidebarDrawerProps` to replace `roadmapTitles: string[]` with `roadmaps: RoadmapListItem[]`.
3.  Update the rendering logic to mapping over `roadmaps`.
4.  Add a `Link` component (from `next/link`) around the list items, pointing to `/roadmap/${roadmap.id}`.

### Step B: Create a Smart Container (or Hook)
Since the sidebar needs to be available in multiple places (Home, Roadmap View), we need a way to fetch roadmaps.
-   **Option 1**: Pass data from parent pages (SSR/Server Components).
    -   *Pros*: SEO friendly, fast initial load.
    -   *Cons*: Requires prop drilling or layout modification.
-   **Option 2**: Client-side fetch in a wrapper component `SidebarContainer`.
    -   *Pros*: Decoupled, easy to drop in.
    -   *Cons*: Loading state.
    
**Recommendation**: Use a **Layout approach** or a **Smart Wrapper** used in `HomePageClient` and `RoadmapPage`.
Given the current structure, `HomePageClient` already has `SidebarDrawer`. We should lift the state or use a hook.

### Step C: Create `useSavedRoadmaps` Hook
Create `frontend/src/hooks/useSavedRoadmaps.ts`:
-   **State**: `roadmaps` (array), `loading` (boolean), `error` (string).
-   **Effect**: Call `roadmapService.list()` on mount (if authenticated).
-   **Return**: `{ roadmaps, loading, refresh }`.

### Step D: Integrate into `HomePageClient`
1.  Use `useSavedRoadmaps` hook.
2.  Pass the fetched `roadmaps` to `SidebarDrawer`.
3.  Update `SidebarDrawer` usage in `HomePageClient` to match new props.

### Step E: Integrate into `RoadmapPage` (`app/roadmap/[id]/page.tsx`)
1.  Currently `RoadmapPage` doesn't have the sidebar.
2.  Add a generic `NavBar` or `Header` overlay that includes the **Hamburger Button**.
3.  Include `SidebarDrawer` in the page tree (or a common Layout).
4.  Use `useSavedRoadmaps` to populate it.

## 3. UI/UX Considerations
-   **Loading State**: Show a skeleton loader in the sidebar while fetching.
-   **Empty State**: "No saved roadmaps. Create one!" link.
-   **Active State**: Highlight the current roadmap if viewing one.
-   **Authentication**: If not logged in, show "Login to see saved roadmaps" or hide the button.

## 4. Code Structure Changes (Summary)

```typescript
// frontend/src/types/index.ts
// Ensure RoadmapListItem is exported

// frontend/src/components/features/SidebarDrawer.tsx
// Update props interface

// frontend/src/hooks/useSavedRoadmaps.ts
// New hook for data fetching
```

## 5. Next Steps for Developer
1.  Update `SidebarDrawer.tsx` to handle objects instead of strings.
2.  Build `useSavedRoadmaps` hook.
3.  Connect the hook to `HomePageClient`.
4.  (Optional) Add Sidebar to `RoadmapPage` for quick navigation between maps.
