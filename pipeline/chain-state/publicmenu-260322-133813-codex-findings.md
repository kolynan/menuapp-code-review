# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-133813

## Findings
1. [P1] Table verification logic is split between a hidden `CartView` effect and the visible bottom sheet - `CartView.jsx:99-225` still owns attempt/cooldown state and an auto-verify effect, while the active sheet input and CTA live in `x.jsx:3441-3479`. Entering the last digit can trigger hidden auto-verification from `CartView`, and the visible CTA can call `verifyTableCode()` again, so verification can fire unexpectedly or twice. The lockout state also never becomes visible in the active sheet. FIX: move verification attempts, cooldown, and submit logic into `x.jsx` or a shared hook used only by the visible sheet, and remove the hidden `CartView` effect/state.
2. [P1] Bill-state props are passed from `x.jsx` but dropped in `CartView` - `x.jsx:3363-3367` passes `handleRequestBill`, `billRequested`, `billCooldown`, `otherGuestsBills`, and `othersTotal`, but `CartView.jsx:52-82` does not accept or render them. The drawer therefore cannot switch to post-send/open-bill layouts or expose the expected bill CTA from this surface. FIX: accept these props in `CartView`, render the visit-state-driven sections/CTA matrix, and wire the bill request action.
3. [P1] Partner lookup masks backend failures as "restaurant not found" - `x.jsx:1325-1345` swallows Partner lookup exceptions and returns `null`; `x.jsx:3042-3046` then always renders `error.partner_not_found`. Transient API failures are misreported as a bad QR link, with no retry path. FIX: keep request errors separate from real not-found results and render a retryable backend-error state.
4. [P2] Cart drawer header still uses a scrolling X close control - `CartView.jsx:441-495` renders an `X` close button with no `aria-label`, and its class is only `p-2`, which is below the 44x44 mobile tap target. Because the whole `CartView` sits inside the drawer scroll container (`x.jsx:3311-3315`), the header also scrolls away on long carts instead of staying pinned. FIX: make the header sticky inside the drawer scroll area and replace the close button with a `ChevronDown` control in a `w-11 h-11` localized button.
5. [P2] Table-confirmation bottom sheet has no explicit close/minimize affordance - `x.jsx:3405-3414` renders only the drag handle and text in the sheet header; there is no top-right chevron/button. Dismissal depends on swipe/backdrop only, which is inconsistent with the cart drawer and weaker on mobile. FIX: add a top-right `ChevronDown` button with a 44x44 tap zone that closes the sheet without clearing cart/order state.
6. [P2] Rate-limit guard fails open on fetch errors - `x.jsx:2389-2414` returns `true` from `checkRateLimit()` on any exception after logging the error. If the order lookup fails, anti-spam protection is silently disabled and the order still proceeds. FIX: fail closed with a retryable submit error, or distinguish transient backend failure from an allowed submit.
7. [P3] Reward-email placeholder bypasses i18n - `CartView.jsx:530-535` hardcodes `placeholder="email@example.com"` instead of going through the same translation path used later for the loyalty email field. FIX: use `tr('loyalty.email_placeholder', 'email@example.com')` here too.

## Summary
Total: 7 findings (0 P0, 3 P1, 3 P2, 1 P3)

## Prompt Clarity
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): The opening scope says "ONLY these 3 files above", but the task context names 4 concrete files (`x.jsx`, `CartView.jsx`, `README.md`, `BUGS.md`).
- Missing context (what info would have helped): None needed for this review pass.
- Scope questions (anything you weren't sure if it's in scope): Whether `pages/PublicMenu/*.jsx` meant every JSX file in the folder or only `x.jsx` and `CartView.jsx`; the scope lock later clarified the target pair.
