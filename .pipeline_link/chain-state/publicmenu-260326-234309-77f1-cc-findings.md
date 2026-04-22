# CC Writer Findings — PublicMenu
Chain: publicmenu-260326-234309-77f1

## Findings

### Fix 1 — PM-148: Remove table confirmation banner

1. **[P3] Table confirmation banner — already removed from x.jsx, but i18n key and external component may still show it**

   **Analysis:** The green "Стол подтверждён" banner was ALREADY removed from x.jsx's inline rendering. Line 3298 has a comment: `// HALL CHECKOUT SCREEN (TASK-260127-01: removed "Стол подтверждён" block)`. The i18n key `cart.verify.table_verified` at line 481 ("Стол подтверждён") is defined but NEVER used anywhere in x.jsx rendering code.

   However, the banner may still appear from one of these sources:
   - **`useHallTable` hook** (imported from `@/components/publicMenu/refactor/hooks/useHallTable` at line 111) — this hook manages `verifiedByCode` state. Its success callback may trigger a toast or banner.
   - **`ModeTabs` component** (imported from `@/components/publicMenu/refactor/ModeTabs` at line 104) — receives `isTableVerified`, `verifiedByCode`, `currentTable`, and `t` props. It could render the green banner inline.

   **FIX options (from x.jsx scope):**
   - **Option A (safe):** Remove the unused i18n key `cart.verify.table_verified` from the translations object at line 481. This won't stop the banner if it's rendered by an imported component using its own translation, but it cleans up dead code.
   - **Option B (if ModeTabs renders it):** Since we can only modify x.jsx, we could intercept the `t` function to return empty string for `cart.verify.table_verified` — but this is hacky and not recommended.
   - **Option C (recommended):** The banner is likely rendered inside `ModeTabs` or `useHallTable`. Since we can only modify x.jsx, the most effective approach is: (1) remove the i18n key at line 481, AND (2) check if `useHallTable` exposes a callback or state variable that controls the banner. If `verifiedByCode` becoming `true` triggers a toast internally, the fix must be in the hook, not x.jsx.

   **FIX (within x.jsx scope):** Remove the i18n key definition at line 481 (`"cart.verify.table_verified": "Стол подтверждён",`). If the banner is rendered by an external component (ModeTabs/useHallTable), a fix in those files is needed — this is outside x.jsx scope. Flag as "needs investigation in ModeTabs/useHallTable" if banner persists after removing the i18n key.

### Fix 2 — PM-149: Remove guest ID suffix from guest name display

2. **[P3] Guest ID suffix (#N) visible in guest-facing UI — strip in wrapper function**

   **Analysis:** The guest display name is composed by `getGuestDisplayName()` imported from `@/components/sessionHelpers` (line 58). This function is passed directly to CartView (line 3530) and also called at line 2773 for the confirmation screen guest label. The function presumably returns a string like `"Timur #1313"` or `"Гость 1 #1313"`.

   Since `getGuestDisplayName` is an imported function from an external module we can't modify, the fix is to create a **wrapper function** in x.jsx that strips the `#N` suffix before display.

   **FIX:** Create a wrapper function in x.jsx that removes the `#N` suffix:
   ```jsx
   // PM-149: Strip guest ID suffix (#N) from guest-facing display
   const getGuestDisplayNameClean = (guest) => {
     const raw = getGuestDisplayName(guest);
     if (!raw) return raw;
     // Remove trailing " #1234" suffix (system-generated guest ID)
     return raw.replace(/\s*#\d+$/, '');
   };
   ```

   Then replace all guest-facing usages:
   - **Line 2773:** Change `getGuestDisplayName(guestToUse)` → `getGuestDisplayNameClean(guestToUse)` (confirmation screen guest label)
   - **Line 3530:** Change `getGuestDisplayName={getGuestDisplayName}` → `getGuestDisplayName={getGuestDisplayNameClean}` (CartView prop — this changes the display in the cart header)

   This keeps the original `getGuestDisplayName` function intact for any internal/staff usage while stripping the suffix only in guest-facing UI (x.jsx).

## Summary
Total: 2 findings (0 P0, 0 P1, 0 P2, 2 P3)

## Prompt Clarity

- **Overall clarity: 4/5**
- **Ambiguous Fix descriptions:**
  - Fix 1: The description says "the green banner" but the banner was already removed from x.jsx inline code (TASK-260127-01). The actual source of the banner (external component: ModeTabs or useHallTable) is uncertain. The description assumes the banner is rendered in x.jsx, but it may not be. Score: 3/5 for this fix specifically.
  - Fix 2: Clear and actionable. The pattern `#N` suffix is well-described, and the file/location hints are useful. Score: 5/5.
- **Missing context:**
  - For Fix 1: Would help to know which component actually renders the green banner (ModeTabs? useHallTable toast?). The task says "search for `подтверждён` or `tableConfirmed`" but the only match is the i18n key definition (line 481) which is never used in rendering.
  - For Fix 2: Would help to see the output of `getGuestDisplayName()` to confirm the exact format of the suffix.
- **Scope questions:**
  - Fix 1: If the banner is rendered by an external component (ModeTabs/useHallTable), is modifying those files in scope? The task says "TARGET FILES: x.jsx" only.
  - Fix 2: The wrapper approach changes the prop passed to CartView — this is within x.jsx scope but affects CartView's behavior. Seems in scope per the instructions.
