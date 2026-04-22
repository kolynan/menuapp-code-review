---
applyTo: "**/*.js,**/*.jsx"
---

# Base44 Platform Rules — MenuApp

These rules apply automatically to all JavaScript/JSX files in this repository. They reflect the coding standards and platform constraints of the Base44 no-code platform.

## Critical Rules (P0 — violations cause crashes)

1. **PartnerShell Wrapper Pattern**: `usePartnerAccess()` must ONLY be called inside a `<PartnerShell>` component. Partner cabinet pages must follow this structure:
   ```jsx
   // Content component (has usePartnerAccess)
   function PageNameContent() {
     const { partner, role } = usePartnerAccess();
     // ... page logic
   }

   // Default export (wrapper only)
   export default function PageName() {
     return (
       <PartnerShell activeTab="tabname">
         <PageNameContent />
       </PartnerShell>
     );
   }
   ```

2. **TDZ Safety**: All `const`/`let` variables, `useMemo`, `useQuery`, `useEffect` must be declared AFTER every identifier they reference. New computed values go NEAR their usage, not at the top.

3. **No Conditional Hooks**: Never place React hooks inside `if`, loops, or after early returns.

## High Priority Rules (P1 — violations cause incorrect behavior)

4. **i18n Required**: ALL user-facing strings must use `t('key')` from `useI18n`.
   - Key format: `page.section.element` (e.g., `partner_tables.form.save`)
   - Common keys: `common.save`, `common.cancel`, `common.loading`, `common.error`
   - Toast keys: `toast.saved`, `toast.error`
   - Do NOT translate: entity/DB names, currencies (`$`, `₸`), language codes
   - Arrays/constants with text → functions accepting `t` parameter

5. **No Data Model Changes**: Page code cannot modify the Base44 data model. Data model changes require a separate B44 prompt.

6. **No Auth/Security/Layout Changes**: Never modify authentication, security logic, or `Layout.js` from page code.

7. **Context-First**: Always analyze existing context and imports before suggesting changes.

## Code Quality Rules (P2)

8. **Naming Conventions**:
   - Components: `PascalCase`
   - Functions/variables: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Event handlers: `handleXxx` or `onXxx`
   - Booleans: `isXxx`, `hasXxx`, `canXxx`

9. **No Magic Numbers**: Use named constants for repeated values.

10. **No Debug Logs**: Remove all `console.log` before final code. Exception: explicit debug tasks.

11. **No Dynamic Tailwind Classes**: Use mapping objects instead of string interpolation for Tailwind classes.

12. **Blob URL Cleanup**: Every `URL.createObjectURL()` must have a corresponding `URL.revokeObjectURL()`.

## Routing Rules

13. **Route Stability**: PROD pages use lowercase routes. LAB pages use suffix `1`.
14. **Public Routes**: `/x` must remain public. QR/Hall contract: `/x?partner=<id>&table=<code>&mode=hall`.
15. **PartnerShell Routes**: Partner pages must be registered in `PARTNER_SHELL_ROUTES` in `Layout.js`.
