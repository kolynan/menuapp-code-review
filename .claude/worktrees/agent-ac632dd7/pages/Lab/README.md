# Lab Page

## Description
Hub page for accessing all Lab (*1) experimental pages in MenuApp. Provides quick navigation to featured and other lab pages, plus a "Promote to PROD" checklist for when lab experiments are ready to go live.

## Features
- Featured lab cards (Menu Builder LAB, Menu Translations LAB) with icons and descriptions
- Grid of other lab page links (Partner Home, Tables, Settings, Staff, Orders, Hall Migration, Table Sessions)
- Promote-to-PROD checklist with 5 verification steps

## UX Changelog

### S35 (2026-02-26) — Codex round fix
- **Fixed:** Replaced nested `<Link><Button>` with `<Button onClick={navigate}>` for valid HTML and better accessibility (keyboard nav + screen reader support). Applied to all navigation buttons.
