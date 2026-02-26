# Lab — BUGS.md

## Fixed Bugs

### BUG-LAB-001 (P2): Nested interactive elements — Link wrapping Button
- **Found by:** Codex (S35 Codex round)
- **Problem:** `<Link to={...}><Button>...</Button></Link>` creates an `<a>` wrapping a `<button>` — invalid HTML per spec. Screen readers can't determine which element to activate, keyboard navigation is ambiguous.
- **Locations:** Featured lab cards + "Other Lab Pages" cards
- **Fix:** Replaced `<Link>` wrapper with `<Button onClick={() => navigate(path)}>` using `useNavigate()` from react-router-dom. Applied to both card sections.
- **Status:** FIXED (S35)

## False Alarms

### FA-LAB-001: Codex flagged undefined routes (S35)
- **Flagged by:** Codex
- **Claim:** Route paths like `/menudishes1`, `/partnerhome1` etc. are "not defined and would 404."
- **Verdict:** FALSE ALARM. These routes ARE defined in Base44's routing system (`Layout.js` / platform config), just not visible in this file. No fix needed.

## Active Bugs

None.
