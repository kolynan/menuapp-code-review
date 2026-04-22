---
page: PublicMenu
code_file: pages/PublicMenu/CartView.jsx
budget: 10
agent: cc+codex
chain_template: quick-fix
---

# CartView PM-104: Apply Exact B44 Diff — Drag Handle + ChevronDown Alignment

Reference: `BUGS_MASTER.md` PM-104.

⚠️ IMPORTANT: This fix has been attempted 4+ times via КС and failed each time. The exact solution was confirmed by Base44 AI. Apply the diff EXACTLY AS SPECIFIED below — do NOT improvise or restructure differently.

---

## Fix 1 — PM-104 (P3) [MUST-FIX]: Drag handle and ChevronDown not aligned in CartView header

### Сейчас
CartView bottom-sheet header: drag handle (grey bar) and ChevronDown chevron are on different visual levels. ChevronDown size is w-7 h-7 (28px). Elements are not properly centered relative to each other.

### Должно быть
- Drag handle: centered horizontally in header
- ChevronDown: on the far RIGHT, vertically centered with drag handle
- Left spacer balances the close button so drag handle appears truly centered
- ChevronDown size: w-9 h-9 (36px), color: text-gray-500 when active
- 44px minimum tap target for close button

### НЕ должно быть
- Do NOT keep drag handle and chevron in the same `justify-center` flex row
- Do NOT use `gap-3` on the header container
- Do NOT use `justify-center` on the header container

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Component: bottom-sheet sticky header `<div className="sticky top-0 z-10 ...">` — the first sticky div inside the CartView bottom sheet container.

### Exact diff to apply

Replace this OLD code:
```jsx
<div className="sticky top-0 z-10 bg-white pt-2 pb-1 flex items-center justify-center gap-3">
  <div className="w-10 h-1 rounded-full bg-gray-300" />
  <button
    className="min-w-[44px] min-h-[44px] flex items-center justify-center"
    onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
    aria-label="Close cart"
  >
    <ChevronDown
      className={`w-9 h-9 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 cursor-pointer'}`}
    />
  </button>
</div>
```

With this NEW code:
```jsx
<div className="sticky top-0 z-10 bg-white px-4 pt-3 pb-1 flex items-center justify-between">
  <div className="w-9" /> {/* Spacer to balance the close button */}
  <div className="w-12 h-1.5 bg-gray-300 rounded-full" /> {/* Drag handle */}
  <button
    className="w-11 h-11 flex items-center justify-center -mr-2"
    onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
    aria-label="Close cart"
  >
    <ChevronDown
      className={`w-9 h-9 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}`}
    />
  </button>
</div>
```

### Уже пробовали
Attempted 4+ times in chains (chains 98ba and others). Every attempt resulted in incorrect layout because CC/Codex tried to redesign the layout instead of applying the exact structure. This diff is confirmed correct by Base44 platform AI.

### Проверка
Open CartView (add item to cart) → bottom sheet appears → drag handle is centered, chevron (˅) is on the far right, both visually aligned at the same height.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Change ONLY the sticky header div as described in Fix 1.
- Do NOT change any other part of CartView.jsx.
- Do NOT change cart logic, item list, total calculation, submit button.
- Do NOT change any other files.

## Implementation Notes
- File: `pages/PublicMenu/CartView.jsx`
- Apply the exact diff above — no structural changes beyond what's specified
- git add pages/PublicMenu/CartView.jsx && git commit -m "fix(PM-104): align drag handle and chevron in CartView header" && git push
