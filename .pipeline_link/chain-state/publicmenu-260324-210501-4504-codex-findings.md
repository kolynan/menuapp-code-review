# Codex Writer Findings — PublicMenu Chain: publicmenu-260324-210501-4504

## Findings
1. [P2] Table confirmation drawer still opens in the broken history-first order — In [`x.jsx`](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L2749), `handleSubmitOrder` still calls `pushOverlay('tableConfirm')` before `setShowTableConfirmSheet(true)`. Because `pushOverlay` immediately runs `window.history.pushState()` in [`x.jsx`](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L1305), the Bottom Sheet is still mounted after the history mutation instead of before it, which matches the regression described in Fix 1. FIX: set `setShowTableConfirmSheet(true)` first, then defer `pushOverlay('tableConfirm')` with `requestAnimationFrame` or a microtask; keep the existing `onOpenChange` close/pop logic unchanged.
2. [P2] Main-menu bell is still hidden until table verification succeeds — The bell render guard in [`x.jsx`](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L3838) still requires `orderMode === "hall" && isTableVerified && currentTableId`, so users in hall mode cannot open help before they have already verified a table. That directly contradicts Fix 2. FIX: replace the condition with `view === "menu" && isHallMode && drawerMode !== 'cart' && (` and remove the `isTableVerified` / `currentTableId` requirements.
3. [P3] Help drawer still has no top-right chevron close control — The help drawer markup in [`x.jsx`](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L3650) still opens `<DrawerContent className="max-h-[85vh] rounded-t-2xl">` without `relative`, and there is no ChevronDown button wired to `closeHelpDrawer` after `DrawerContent` opens. Users are still limited to swipe-down or the footer cancel button, so Fix 3 is not applied. FIX: add `relative` to the help drawer `DrawerContent` and insert the same gray circular chevron button used by the table-code drawer, calling `closeHelpDrawer`.

## Summary
Total: 3 findings (0 P0, 0 P1, 2 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): The task references `BUGS_MASTER.md` and `ux-concepts/ACCEPTANCE_CRITERIA_publicmenu.md`, but the top-level scope restriction forbids reading outside the page folder. The inline fix descriptions were sufficient, so this did not block the review.
- Scope questions (anything you weren't sure if it's in scope): The top-level instructions require reading only `README.md` and `BUGS.md` in the page folder, while the task context also lists `pages/PublicMenu/CartView.jsx` as read-only context. I treated `CartView.jsx` as optional local context and kept findings limited to Fix 1–3 in `x.jsx`.
