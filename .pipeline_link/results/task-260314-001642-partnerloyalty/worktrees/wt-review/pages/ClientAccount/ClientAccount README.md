# ClientAccount — README

## Description
Client account/balance page for the MenuApp loyalty system. Shows total loyalty balance, restaurant list (if multiple accounts), and transaction history. Clients access this after logging in via the Client login page.

## Entities Used
- `Client` — via `useClientAccounts` hook
- `LoyaltyAccount` — loyalty accounts with balance and partner info
- Transactions — via `useTransactions` hook

## Key Components
- `useClientAccounts(email)` — fetches loyalty accounts for a given email
- `useTransactions(accountId)` — fetches transactions for selected account
- `useExpiration(transactions, expiryDays)` — calculates nearest bonus expiry
- `BalanceCard` — displays total balance and expiry info
- `RestaurantList` — restaurant selection (when multiple accounts)
- `TransactionList` — transaction history display

## Routes
- `/clientaccount?email=<email>` — this page

## RELEASE History

| Version | Date | File | Notes |
|---|---|---|---|
| 260225-00 | 2026-02-25 | `260225-00 clientaccount RELEASE.jsx` | Initial review. No P0/P1 issues found. 5 P2/P3 issues documented. |

## UX Changelog

### 260225-00 (Initial Review)
- No changes applied — page passed review with no P0/P1 issues
- Key concern documented: email source inconsistency with ClientMessages page (BUG-CA-001)
