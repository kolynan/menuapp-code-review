chain_template: pssk-review
page: PartnerOrderProcess
prompt_file: pipeline/drafts/pssk-partnerorderprocess-redesign-260404-v3.md
budget: 3
notes: "Round 3 ПССК. v2 had 4 CRITICAL wrong prop names in JSX skeleton (slot.channels.hall→enabled_hall, stage?.is_active→slot.active, stage?.allowed_roles→slot.allowedRoles, getDisplayName→slot.label) + missing call-site update. All fixed in v3. Also: Fix 4 Зафиксирован consistent, Fix 5 hook order warning added, Fix 3 uses grep anchors not line numbers."
