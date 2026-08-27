# Keyboard Active Layout Fix: Unifying Fixed Elements Behavior Across All Memo/Input Fields

This plan outlines the changes to ensure that when the virtual keyboard is active (focusing on any input/textarea field, such as event/location/person descriptions and resources), the main title box (`#main-header`), search box (`#search-panel`), and layer control panel (`.layer-control-panel`) remain properly fixed and aligned at the top of the visible screen.

## User Review Required

> [!IMPORTANT]
> - We will add global `focusin` and `focusout` event listeners to the application. When any input or textarea is focused (which opens the keyboard), we will immediately recalculate the layouts using `alignLayerControlPanel()` and `alignStudyPanel()`.
> - This guarantees that on both iOS and Android, focusing on Event, Location, and Custom Area text inputs/textareas behaves exactly like focusing on the Namebox's memo textarea, keeping the layout headers and panels perfectly fixed at the top.

---

## Proposed Changes

### 1. Application Layout Alignment Logic

#### [MODIFY] [app_v16_v2.js](file:///Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/app_v16_v2.js)
- Register global `focusin` and `focusout` event listeners on `document` within the initialization block.
- When an `INPUT` or `TEXTAREA` is focused:
  - Immediately call `alignLayerControlPanel()` and `alignStudyPanel()`.
  - Set multiple delayed calls (e.g., after 50ms, 150ms, 300ms, and 600ms) to ensure coordinates stay aligned throughout the keyboard transition/scroll animation on mobile devices.

---

## Verification Plan

### Automated Tests
- None

### Manual Verification
1. Open the app on a mobile device or browser mobile simulator (responsive mode).
2. Click a person card (name box), click the memo textarea, and verify that the keyboard activates while the header, search box, and layer control panel remain fixed at the top of the viewport.
3. Open Event and Location details/memos, focus on their description textarea or link inputs, and verify that the header, search box, and layer control panel remain fixed at the top of the viewport in the same manner.
4. Try editing custom area names or polygon details in Admin mode, focus on the input fields, and verify that the layout elements stay locked at the top of the viewport.
