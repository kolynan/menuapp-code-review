1. **Below 44px buttons**
- None of the buttons in your excerpt are explicitly below `44x44`; icon buttons shown are `h-11 w-11` (for example [line 768](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:768), [line 776](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:776), [line 852](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:852), [line 917](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:917), [line 2172](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:2172)).
- One risk to verify: `StatusDot` is clickable and may render smaller than 44 if not wrapped in a larger touch target ([line 894](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:894)).

2. **Buttons that should be 48px but aren’t**
- Mobile reorder arrows are currently `h-11 w-11`; should be `h-12 w-12` per your rule:
  - Up: [line 852](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:852)
  - Down: [line 861](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:861)

3. **3+ icons in a row without overflow**
- Zone actions row can show 3 icon actions (`QR`, `Edit`, `Delete`) without overflow ([lines 767-798](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:767)).
- Top toolbar has 4 icon buttons in a row (`Search`, `QR all`, `Expand/Collapse`, `Settings`) without overflow ([lines 2171-2175](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:2171)).
- Table row actions are compliant with overflow pattern (`QR` + `More` menu), assuming `StatusDot` is treated as a primary toggle.

4. **Gap classes (8px target spacing)**
- Not correct:
  - Zone actions uses `gap-1` (4px), should be `gap-2` ([line 753](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:753)).
  - Mobile up/down stack uses `gap-1`, should be `gap-2` ([line 850](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:850)).
- Correct:
  - Table row main actions `gap-2` ([line 839](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:839)).
  - Top toolbar `gap-2` ([line 2170](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:2170)).
  - QR dialog buttons `gap-2` ([line 2445](/C:/Users/ASUS/OneDrive/002%20Menu/Claude%20AI%20Cowork/menuapp-code-review/pages/partnertables/partnertables_v1.5_RELEASE.js:2445)).

5. **Other mobile UX issues**
- Toolbar and zone action rows rely heavily on icon-only controls; on small screens this increases ambiguity and wrap jitter.
- Tooltips won’t help most mobile users; overflow menu labels become more important.
- Table row is dense (`number + code + status + toggles + QR + menu`), so truncation/priority rules may be needed to avoid cramped interactions.
