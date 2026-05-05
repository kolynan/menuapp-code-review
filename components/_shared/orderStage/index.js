// ============================================================
// SHARED — OrderStage helpers (canonical exports, S571 R5a-2 Phase A v2)
// ============================================================
// Single import point для canonical OrderStage helpers.
//
// Usage:
//   import { getStartStage, getStageInternalCode, getStageDisplay, mapLegacyStatus }
//     from '@/components/_shared/orderStage';
//
//   // OR namespace import:
//   import helpers from '@/components/_shared/orderStage';
//   helpers.getStartStage(...)
//
// Cross-refs:
//   - getStartStage.js (RF-1 Bundle 6, S443 LOCKED)
//   - getStageInternalCode.js (R5a-2 Phase A)
//   - getStageDisplay.js (R5a-2 Phase A)
//   - mapLegacyStatus.js (R5a-2 Phase A)
//   - outputs/permanent/RFK_R5a1_Migration_Plan.md §3 A.2
// ============================================================

import { getStartStage } from './getStartStage';
import { getStageInternalCode } from './getStageInternalCode';
import { getStageDisplay } from './getStageDisplay';
import { mapLegacyStatus } from './mapLegacyStatus';

export { getStartStage, getStageInternalCode, getStageDisplay, mapLegacyStatus };

export default { getStartStage, getStageInternalCode, getStageDisplay, mapLegacyStatus };
