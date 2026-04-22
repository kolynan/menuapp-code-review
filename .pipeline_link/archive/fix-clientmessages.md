---
page: ClientMessages
budget: 3.00
type: fix
---

# Fix Task: ClientMessages — 8 active bugs (CM-005 to CM-012)

Fix all 8 active bugs listed in `../../code/ClientMessages/BUGS.md`.

## Code file
`pages/ClientMessages/clientmessages.jsx` (242 lines)

## Bugs to fix (solutions already described in BUGS.md)

1. **BUG-CM-005 (P2)** — Add accounts dependency to messages queryKey
2. **BUG-CM-006 (P2)** — Memoize partnerIds with useMemo for stable queryKey
3. **BUG-CM-007 (P2)** — Back button touch target: add min-w-[44px] min-h-[44px]
4. **BUG-CM-008 (P2)** — Back button: add aria-label={t('common.back')}
5. **BUG-CM-009 (P2)** — Message cards: add role="button" tabIndex={0} onKeyDown
6. **BUG-CM-010 (P2)** — Move onError from useQuery options to useEffect
7. **BUG-CM-011 (P3)** — Dead code: simplify !sortedMessages to .length === 0
8. **BUG-CM-012 (P3)** — Unread dot: add aria-label for accessibility

## After fixes
- Update `../../code/ClientMessages/BUGS.md` — move all 8 from Active to Fixed
- Update `../../code/ClientMessages/ClientMessages README.md` — add RELEASE History row
- Create RELEASE file in `../../code/ClientMessages/`

## IMPORTANT: Test progress reports
After EACH phase (analysis, fixes, release), update the Telegram message using the progress-live.txt method described in cc-system-rules.txt. This is a test of the new progress reporting feature.
