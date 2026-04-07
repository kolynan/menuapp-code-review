# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-125326

## Findings

### Fix 1 — #87a: Replace loyalty section with motivational text in checkout drawer

1. [P1] **Loyalty section in CartView must be replaced with compact motivational text** (lines 902-1026) — The entire loyalty section (lines 902-1026 in CartView.jsx) — including the collapsible "Бонусы" header with Gift icon, email input, balance display, points redemption, and discount applied/hint — should be replaced with a compact 1-2 line motivational block positioned above the CTA button. The replacement block should be dynamic based on partner settings:
   - **Bonuses only** (`partner.loyalty_enabled && earnedPoints > 0`): Line 1: "Начислим +{earnedPoints} бонуса за этот заказ" / Line 2: "Официант сразу увидит его" (text-sm, text-slate-500)
   - **Discount only** (`partner.discount_enabled && partner.discount_percent > 0`): Line 1: "Скидка {partner.discount_percent}% на этот заказ" / Line 2: "Официант сразу увидит его"
   - **Both**: Line 1: "Скидка {partner.discount_percent}% и +{earnedPoints} бонуса за этот заказ" / Line 2: "Официант сразу увидит его"
   - **Nothing configured**: Single line: "Официант сразу увидит заказ" OR hide block entirely.
   FIX: Remove lines 902-1026 (the entire `showLoyaltySection` block with collapsible loyalty UI). Replace with a compact `<div>` block placed just before the sticky submit button (around line 1065). The new block reads `partner.loyalty_enabled`, `earnedPoints`, `partner.discount_enabled`, `partner.discount_percent` to determine text. Use `text-sm text-slate-700` for line 1, `text-xs text-slate-500` for line 2. All strings via `tr()`.

2. [P1] **Remove "Бонусы за онлайн-заказ" line** (line 1030-1035) — The line `tr('loyalty.online_bonus_label', 'Бонусы за онлайн-заказ')` with earnedPoints is shown below the loyalty section when collapsed. This entire block (lines 1030-1035) must be removed — it uses the forbidden word "онлайн" and represents the premature loyalty display.
   FIX: Delete lines 1030-1035 entirely.

3. [P2] **Remove unused loyalty state variables** — After removing the loyalty section, several state variables become unused: `loyaltyExpanded` (line 91), and possibly the `infoModal` state (line 98 — comment says 'online' | 'tableCode'). Props like `showLoyaltySection`, `loyaltyLoading`, `loyaltyAccount`, `earnedPoints`, `maxRedeemPoints`, `redeemedPoints`, `setRedeemedPoints` may become partially unused in CartView (though some are still needed for the motivational text calculation).
   FIX: Remove `loyaltyExpanded`/`setLoyaltyExpanded` state (line 91). Keep props needed for the motivational block (`earnedPoints`, `partner` — already available). Remove `loyaltySummary` useMemo (lines 421-429) and `reviewRewardLabel` useMemo (lines 432-436) if no longer referenced. Keep all other props that may be used elsewhere.

4. [P1] **"онлайн" word in x.jsx hall verify block** (lines 3132-3136, line 3107) — `showHallOnlineBenefitsHint` renders `t('hall.verify.online_benefits')` which is "Бонусы и скидки за онлайн-заказы". The word "онлайн" is forbidden in client-facing UI.
   FIX: Replace `t('hall.verify.online_benefits')` text with something neutral, e.g., `tr('hall.verify.order_benefits', 'Бонусы и скидки за заказ')` — removing "онлайн". Also rename the variable `showHallOnlineBenefitsHint` to `showHallBenefitsHint`.

5. [P2] **Translation keys with "online" in x.jsx** (lines 467-479, 495, 513) — Multiple i18n keys contain "online" or "онлайн": `cart.verify.bonus_label` ("Бонусы за онлайн-заказ"), `cart.verify.discount_label` ("Скидка за онлайн-заказ"), `cart.verify.info_online_point1/2/3`, `cart.verify.info_online_title`, `cart.verify.online_order_title`, `loyalty.online_bonus_label`, `cart.confirm_table.benefit_loyalty` ("По онлайн-заказу вы получите бонусы / скидку"). These are in the translations object.
   FIX: Update translation values to remove "онлайн" — e.g., "Бонусы за заказ", "Скидка за заказ", "Заказ официанту" etc. Also update keys to not contain "online" for consistency. Check which keys are actually used in rendering code and prioritize those.

### Fix 2 — #87b: Redesign table code verification bottom sheet

6. [P1] **BS title should be "Введите код стола" not "Подтвердите стол"** (line 3409) — Currently `tr('cart.confirm_table.title', 'Подтвердите стол')`. Must change to "Введите код стола".
   FIX: Change line 3409 to `tr('cart.verify.enter_table_code', 'Введите код стола')` — this key already exists (line 470).

7. [P1] **Remove subtitle "Чтобы отправить заказ официанту"** (lines 3411-3413) — Per spec, the subtitle should be replaced with helper text about where to find the code.
   FIX: Replace lines 3411-3413 with: `<p className="text-sm text-slate-500 mt-1">{tr('cart.verify.helper_text', 'Код указан на табличке на столе. Если не нашли — спросите у официанта.')}</p>`

8. [P1] **Remove "По онлайн-заказу вы получите бонусы / скидку" text** (lines 3414-3418) — The green benefit text must be removed entirely from the BS.
   FIX: Delete lines 3414-3418.

9. [P1] **Remove duplicate input field showing "0000"** (lines 3441-3454) — There is a hidden `<Input>` field below the visual cells that shows the raw code with placeholder "0000". This is confusing — the visual cells already display the digits. The hidden input is needed for actual text entry, but it must be invisible (not showing "0000" as placeholder).
   FIX: Add `className` to include `opacity-0 absolute` or `sr-only` to make the input invisible while keeping it functional for keyboard input. Or change placeholder to empty string. The current `placeholder={'0'.repeat(tableCodeLength)}` shows "0000" — change to `placeholder=""`.

10. [P1] **BS cells are display-only, not interactive** (lines 3426-3440) — The 4 cells are just `<div>` elements that display digits from the hidden input. Per spec, they should behave like individual input cells with auto-advance, backspace-to-previous, and paste support. Current implementation uses a single hidden input + visual divs.
    FIX: The current approach (hidden input + display divs) is functional but doesn't meet the spec for individual cell behavior (auto-advance, backspace-to-previous). Two options: (a) keep current single-input approach but make it visually better (the hidden input is already autoFocus and handles numeric), or (b) rewrite to use individual input refs per cell. Option (a) is safer — the current approach works, just needs the hidden input's placeholder fixed. The auto-advance/paste behavior is already handled by the single input. Mark as "current implementation is functional, individual cells would be enhancement."

11. [P1] **Button text too long: "Подтвердить и отправить"** (line 3479) — Must be shortened to "Отправить".
    FIX: Change line 3479 `tr('cart.confirm_table.submit', 'Подтвердить и отправить')` to `tr('cart.confirm_table.submit', 'Отправить')`.

12. [P1] **Remove "Не тот стол? Изменить" link** (lines 3482-3490) — Per spec, this link must be removed.
    FIX: Delete lines 3482-3490 entirely.

13. [P1] **Add compact motivation line near BS button** — Per spec, near the submit button show "Начислим +X бонуса" (text-sm, accent color text-[primaryColor]) — dynamic based on partner settings.
    FIX: After the submit button (line 3480), add a compact motivation line:
    ```jsx
    {(partner?.loyalty_enabled && earnedPoints > 0) && (
      <p className="text-center text-sm mt-2" style={{color: primaryColor}}>
        {tr('cart.verify.earn_bonus', `Начислим +${earnedPoints} бонуса`)}
      </p>
    )}
    ```
    Note: `earnedPoints` needs to be accessible in this scope. Check if it's passed as prop — currently it's in the main component scope. The BS is rendered inside the main component's return, so `earnedPoints` should be in scope.

### Fix 3 — PM-150-01: Email validation check

14. [P2] **Email input in loyalty section will be removed by Fix 1** — The email input (lines 938-946 in CartView.jsx) is part of the loyalty section being removed. After Fix 1, check if the reward email form (lines 508-564, the `shouldShowReviewRewardNudge` section) still has an email input. That section at line 530 has `<Input type="email" ...>` — this is the reward email form, NOT part of the loyalty section. It has validation at line 544 (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rewardEmail.trim())`).
    FIX: PM-150-01 is resolved by Fix 1 (loyalty email input removed). The remaining reward email form already has proper validation (line 544). No additional changes needed.

### Additional findings (not in task scope but noted)

15. [P2] **console.log in production** — BUG-PM-045 already tracked. Not in scope. SKIP.

16. [P3] **`infoModal` state comment references 'online'** (line 98) — Comment says `// 'online' | 'tableCode' | null`. Minor, comment-only. SKIP per scope lock.

17. [P2] **Translation key `loyalty.online_bonus_label` at line 495 of x.jsx** — Used in CartView line 1032. After Fix 1 removes the usage in CartView, verify if this key is used elsewhere. If not, it can be cleaned from the translations object.
    FIX: After applying Fix 1 and Fix 2, grep for remaining usages of `online_bonus_label`. Remove from translations object if unused.

## Summary
Total: 17 findings (0 P0, 10 P1, 5 P2, 2 P3)
- Fix 1 scope: 5 findings (2 P1, 1 P2, 1 P1 in x.jsx, 1 P2 translation keys)
- Fix 2 scope: 8 findings (7 P1, 1 P1 enhancement note)
- Fix 3 scope: 1 finding (P2 — auto-resolved by Fix 1)
- Out of scope: 3 findings (noted, skipped per scope lock)

## Key implementation notes
- CartView.jsx lines 902-1035: Remove loyalty section + "Бонусы за онлайн-заказ" → replace with motivational block above CTA
- x.jsx lines 3391-3493: Redesign table code BS (title, remove subtitle/benefit text/change link, shorten button, add motivation)
- x.jsx lines 3107, 3132-3136: Remove "онлайн" from hall verify hint
- All `tr()` keys with "онлайн"/"online" in translation object need updating
- `earnedPoints` and `partner.discount_percent` are the data sources for motivational text
- The hidden input placeholder "0000" (line 3452) must be changed to empty string

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions: Fix 1 says "Read partner settings: partner.loyalty_points_per_order (or similar)" — the actual field used in code is `earnedPoints` (computed by `useLoyalty` hook), not a direct partner field. The "(or similar)" was slightly unclear but resolvable by reading code.
- Missing context: Would have helped to know if `earnedPoints` is always available in the BS scope (it is — same component).
- Scope questions: Fix 2 item 10 — the spec asks for individual cell inputs (auto-advance, backspace-to-previous), but current implementation uses a single hidden input. Unclear if a full rewrite is expected or if the current approach (which works) is acceptable. Documented both options.
