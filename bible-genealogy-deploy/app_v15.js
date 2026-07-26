// Configuration Constants
const CARD_WIDTH = 152;
const CARD_HEIGHT = 62;
const GEN_HEIGHT = 180;
const COL_WIDTH = 240;
const BOARD_PADDING_Y = 120;
const BOARD_PADDING_X = 200;

// Safe localStorage wrapper to prevent crashes in restricted environments (like file:// in Safari)
const localStorage = (() => {
  const isSupported = (() => {
    try {
      window.localStorage.setItem('__test__', '1');
      window.localStorage.removeItem('__test__');
      return true;
    } catch (e) {
      return false;
    }
  })();

  const memStore = {};

  return {
    getItem(key) {
      if (isSupported) return window.localStorage.getItem(key);
      return memStore[key] || null;
    },
    setItem(key, value) {
      if (isSupported) {
        try {
          window.localStorage.setItem(key, value);
          return;
        } catch (e) {}
      }
      memStore[key] = String(value);
    },
    removeItem(key) {
      if (isSupported) {
        try {
          window.localStorage.removeItem(key);
          return;
        } catch (e) {}
      }
      delete memStore[key];
    },
    clear() {
      if (isSupported) {
        try {
          window.localStorage.clear();
          return;
        } catch (e) {}
      }
      for (const k in memStore) delete memStore[k];
    }
  };
})();

// Database State Variable (Loads from LocalStorage or Fallback)
let db = [];
let lineBends = {};

// Style Editor Settings (Loads from LocalStorage or Defaults)
let styleSettings = {
  lineColor: '#94a3b8',
  mainLineColor: '#ff7800',
  spouseLineColor: '#ef4444',
  lineWidth: 3,
  cornerRadius: 12,
  splitOffset: 90,
  lineType: 'orthogonal',
  siblingGap: 7
};

// State Variables
let currentScale = 1.0;
const MIN_SCALE = 0.15;
const MAX_SCALE = 2.0;
const ZOOM_STEP = 0.1;

let isDragging = false;
let startX, startY;
let panX = 0;
let panY = 0;
let startPanX = 0;
let startPanY = 0;
let initialCentered = false;

// Touch Zoom/Pan State
let touchStartDistance = 0;
let touchStartScale = 1.0;
let isTouchZooming = false;
let touchStartPanX = 0;
let touchStartPanY = 0;

// Selected person for study panel
let activePersonId = null;
let selectedPersonId = null;
let selectedPersonIds = new Set();
let hoveredPersonId = null; // Currently hovered card in admin mode
let selectedLineKey = null; // Currently selected line key for editing bends
let isLineEditModeActive = true; // Toggle for line custom editing capability
let isGridSnapActive = true; // Toggle for snapping dragged line bend points to 10px grid
let customVisualLines = []; // Custom free-form connection lines (Logos style)
let canvasJunctions = []; // Custom line-junction elements (meet points)
let selectedJunctionId = null; // Currently selected junction node ID
let isAddLinkModeActive = false; // Add Link mode toggle state
let linkSourceId = null; // Source element ID for link drawing
let spouseSplits = {}; // Custom horizontal split ratios for spouse connector lines
let coupleMidpoints = {}; // Midpoints for spouse lines
let centerX = 0;
let boardWidth = 0;
let boardHeight = 0;

// Filter Settings
const charGroups = {};
let activeFilters = {
  cain: true,
  japheth: true,
  ham: true,
  joktan: true,
  keturah: true,
  ishmael: true,
  esau: true,
  north_kings: true,
  independent_1chr4: true,
  levite_priests: true,
  horite_chiefs: true,
  reuben_simeon: true
};

// Undo / Redo Stacks for Admin Actions
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 100;

function pushHistoryState() {
  if (!isAdminMode) return;
  const state = {
    characterEdits: localStorage.getItem('bible_tree_character_edits'),
    customCharacters: localStorage.getItem('bible_tree_custom_characters'),
    deletedIds: localStorage.getItem('bible_tree_deleted_ids'),
    lineBends: localStorage.getItem('bible_tree_line_bends'),
    annotations: localStorage.getItem('bible_tree_annotations'),
    spouseSplits: localStorage.getItem('bible_tree_spouse_splits'),
    customVisualLines: localStorage.getItem('bible_tree_custom_visual_lines')
  };
  undoStack.push(state);
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
  redoStack = []; // Clear redo stack on new action
}

function performUndo() {
  if (undoStack.length === 0) {
    showToast("되돌릴 작업이 없습니다.");
    return;
  }
  
  // Save current state to redoStack
  const currentState = {
    characterEdits: localStorage.getItem('bible_tree_character_edits'),
    customCharacters: localStorage.getItem('bible_tree_custom_characters'),
    deletedIds: localStorage.getItem('bible_tree_deleted_ids'),
    lineBends: localStorage.getItem('bible_tree_line_bends'),
    annotations: localStorage.getItem('bible_tree_annotations'),
    spouseSplits: localStorage.getItem('bible_tree_spouse_splits'),
    customVisualLines: localStorage.getItem('bible_tree_custom_visual_lines')
  };
  redoStack.push(currentState);
  
  // Restore previous state
  const prevState = undoStack.pop();
  restoreState(prevState);
  
  showToast("작업을 되돌렸습니다 (Ctrl+Z).");
}

function performRedo() {
  if (redoStack.length === 0) {
    showToast("다시 실행할 작업이 없습니다.");
    return;
  }
  
  // Save current state to undoStack
  const currentState = {
    characterEdits: localStorage.getItem('bible_tree_character_edits'),
    customCharacters: localStorage.getItem('bible_tree_custom_characters'),
    deletedIds: localStorage.getItem('bible_tree_deleted_ids'),
    lineBends: localStorage.getItem('bible_tree_line_bends'),
    annotations: localStorage.getItem('bible_tree_annotations'),
    spouseSplits: localStorage.getItem('bible_tree_spouse_splits'),
    customVisualLines: localStorage.getItem('bible_tree_custom_visual_lines')
  };
  undoStack.push(currentState);
  
  // Restore next state
  const nextState = redoStack.pop();
  restoreState(nextState);
  
  showToast("작업을 다시 실행했습니다 (Ctrl+Y).");
}

function restoreState(state) {
  if (state.characterEdits) localStorage.setItem('bible_tree_character_edits', state.characterEdits);
  else localStorage.removeItem('bible_tree_character_edits');
  
  if (state.customCharacters) localStorage.setItem('bible_tree_custom_characters', state.customCharacters);
  else localStorage.removeItem('bible_tree_custom_characters');
  
  if (state.deletedIds) localStorage.setItem('bible_tree_deleted_ids', state.deletedIds);
  else localStorage.removeItem('bible_tree_deleted_ids');
  
  if (state.lineBends) localStorage.setItem('bible_tree_line_bends', state.lineBends);
  else localStorage.removeItem('bible_tree_line_bends');
  
  if (state.annotations) localStorage.setItem('bible_tree_annotations', state.annotations);
  else localStorage.removeItem('bible_tree_annotations');
  
  if (state.spouseSplits) localStorage.setItem('bible_tree_spouse_splits', state.spouseSplits);
  else localStorage.removeItem('bible_tree_spouse_splits');
  
  if (state.customVisualLines) localStorage.setItem('bible_tree_custom_visual_lines', state.customVisualLines);
  else localStorage.removeItem('bible_tree_custom_visual_lines');
  
  initDatabase();
  initBoard();
  renderTree();
}

function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.background = 'rgba(15, 23, 42, 0.9)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px)';
  toast.style.transition = 'all 0.3s ease';
  
  container.appendChild(toast);
  
  // Trigger animation reflow
  toast.offsetHeight;
  
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

// Global shortcut keydown listener for Admin Mode Undo/Redo
window.addEventListener('keydown', (e) => {
  if (!isAdminMode) return;
  
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
    return;
  }
  
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? e.metaKey : e.ctrlKey;
  
  if (modifierKey && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      performRedo();
    } else {
      performUndo();
    }
  } else if (modifierKey && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    performRedo();
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedLineKey) {
      e.preventDefault();
      deleteSelectedLine();
    } else if (selectedJunctionId) {
      e.preventDefault();
      if (confirm("선택한 연결점(분기점)을 삭제하시겠습니까? 연결되어 있던 선들도 함께 제거됩니다.")) {
        pushHistoryState();
        const targetIdStr = String(selectedJunctionId);
        customVisualLines = customVisualLines.filter(l => String(l.from) !== targetIdStr && String(l.to) !== targetIdStr);
        canvasJunctions = canvasJunctions.filter(j => String(j.id) !== targetIdStr);
        selectedJunctionId = null;
        saveCanvasJunctions();
        saveCustomVisualLines();
        renderJunctions();
        drawConnections();
        showToast("연결점(분기점)이 삭제되었습니다.");
      }
    }
  }
});

function deleteSelectedLine() {
  if (!selectedLineKey) return;
  
  const isCustomLine = selectedLineKey.startsWith('link-');
  const isSingleRelationLine = selectedLineKey.startsWith('rel-');
  const isSpouseLine = selectedLineKey.includes('+') && !isSingleRelationLine && !isCustomLine;
  
  if (isCustomLine) {
    if (confirm("선택한 연결선을 정말 삭제하시겠습니까?")) {
      pushHistoryState();
      customVisualLines = customVisualLines.filter(l => l.id !== selectedLineKey);
      delete lineBends[selectedLineKey];
      selectedLineKey = null;
      saveCustomVisualLines();
      saveLineBends();
      drawConnections();
      showToast("연결선이 삭제되었습니다.");
    }
  } else if (isSingleRelationLine) {
    if (confirm("선택한 인물의 가족 관계선(부모-자녀 연결선)을 삭제하시겠습니까?\n이 작업은 해당 인물 한 명의 부모 관계 데이터를 해제(삭제)합니다.")) {
      pushHistoryState();
      // Format: rel-[parentKey]->[childId]
      const relContent = selectedLineKey.replace('rel-', '');
      const arrowParts = relContent.split('->');
      const parentKey = arrowParts[0];
      const childId = arrowParts[1];
      
      db.forEach(c => {
        if (c.id === childId) {
          c.parents = []; // Sever parents only for this child!
        }
      });
      
      delete lineBends[selectedLineKey];
      selectedLineKey = null;
      
      saveDatabase();
      saveLineBends();
      initBoard();
      renderTree();
      showToast("선택한 인물의 부모-자녀 관계가 해제되었습니다.");
    }
  } else if (isSpouseLine) {
    if (confirm("선택한 부부 연결선(배우자 관계)을 삭제하시겠습니까?\n이 작업은 두 인물 간의 배우자 결합 관계 데이터를 해제(삭제)합니다.")) {
      pushHistoryState();
      const cleanKey = selectedLineKey.replace('spouse-', '');
      const spouseParts = cleanKey.split('+');
      const hId = spouseParts[0];
      const wId = spouseParts[1];
      
      db.forEach(c => {
        if (c.id === hId && Array.isArray(c.spouses)) {
          c.spouses = c.spouses.filter(s => s !== wId);
          c.isManual = true;
        }
        if (c.id === wId && Array.isArray(c.spouses)) {
          c.spouses = c.spouses.filter(s => s !== hId);
          c.isManual = true;
        }
      });
      
      delete lineBends[selectedLineKey];
      selectedLineKey = null;
      
      saveDatabase();
      saveLineBends();
      initBoard();
      renderTree();
      showToast("부부 결합 관계가 해제되었습니다.");
    }
  } else {
    // It's a default family relation line!
    if (confirm("선택한 가계도 기본 관계선(가족선)을 삭제하시겠습니까?\n이 작업은 인물 간의 가족 관계 데이터를 편집(삭제)합니다.")) {
      pushHistoryState();
      const parts = selectedLineKey.split('+');
      let spousePairFound = false;
      
      if (parts.length === 2) {
        const char1 = db.find(c => c.id === parts[0]);
        if (char1 && char1.spouses && char1.spouses.includes(parts[1])) {
          spousePairFound = true;
        }
      }
      
      if (spousePairFound) {
        const p1 = parts[0];
        const p2 = parts[1];
        
        db.forEach(c => {
          if (c.id === p1 && c.spouses) {
            c.spouses = c.spouses.filter(s => s !== p2);
          }
          if (c.id === p2 && c.spouses) {
            c.spouses = c.spouses.filter(s => s !== p1);
          }
        });
        
        delete spouseSplits[selectedLineKey];
        delete lineBends[selectedLineKey];
        selectedLineKey = null;
        
        saveDatabase();
        saveSpouseSplits();
        saveLineBends();
        initBoard();
        renderTree();
        showToast("부부 관계선 및 가족 관계가 삭제되었습니다.");
      } else {
        db.forEach(c => {
          if (c.parents) {
            const pKey = [...c.parents].sort().join('+');
            if (pKey === selectedLineKey) {
              c.parents = []; // Sever parent relationship
            }
          }
        });
        
        delete lineBends[selectedLineKey];
        selectedLineKey = null;
        
        saveDatabase();
        saveLineBends();
        initBoard();
        renderTree();
        showToast("부모-자녀 관계선 및 가족 관계가 삭제되었습니다.");
      }
    }
  }
}

// Bible Names Dictionary mapping (Revised Korean Bible names -> English names)
const BIBLE_NAMES_DICTIONARY = {
  "아담": "Adam", "하와": "Eve", "가인": "Cain", "아벨": "Abel", "셋": "Seth",
  "에녹": "Enoch", "이라드": "Irad", "므후야엘": "Mehujael", "므드사엘": "Methushael",
  "라멕": "Lamech", "아다": "Adah", "씰라": "Zillah", "야발": "Jabal",
  "유발": "Jubal", "두발가인": "Tubal-cain", "나아마": "Naamah", "에노스": "Enosh",
  "게난": "Kenan", "마할랄렐": "Mahalalel", "야렛": "Jared", "므두셀라": "Methuselah",
  "노아": "Noah", "셈": "Shem", "함": "Ham", "야벳": "Japheth", "고멜": "Gomer",
  "마곡": "Magog", "마대": "Madai", "야완": "Javan", "구스": "Cush",
  "미스라임": "Mizraim", "붓": "Put", "가나안": "Canaan", "아르박삿": "Arpachshad",
  "니므롯": "Nimrod", "셀라": "Shelah", "에벨": "Eber", "벨렉": "Peleg",
  "욕단": "Joktan", "르우": "Reu", "스룩": "Serug", "나홀": "Nahor",
  "데라": "Terah", "아브라함": "Abraham", "사라": "Sarah", "하갈": "Hagar",
  "그두라": "Keturah", "밀가": "Milcah", "이삭": "Isaac", "리브가": "Rebekah",
  "이스마엘": "Ishmael", "미디안": "Midian", "롯": "Lot", "브두엘": "Bethuel",
  "야곱": "Jacob", "레아": "Leah", "라헬": "Rachel", "빌하": "Bilhah",
  "실바": "Zilpah", "에서": "Esau", "라반": "Laban", "모압": "Moab",
  "벤암미": "Ben-Ammi", "르우벤": "Reuben", "시므온": "Simeon", "레위": "Levi",
  "유다": "Judah", "다말": "Tamar", "단": "Dan", "납달리": "Naphtali",
  "갓": "Gad", "아셀": "Aser", "잇사갈": "Issachar", "스불론": "Zebulun",
  "디나": "Dinah", "요셉": "Joseph", "아스낫": "Asenath", "베냐민": "Benjamin",
  "고핫": "Kohath", "베레스": "Perez", "세라": "Zerah", "므나쎄": "Manasseh",
  "에브라임": "Ephraim", "아므람": "Amram", "요게벳": "Jochebed", "이스할": "Izhar",
  "헤스론": "Hezron", "아론": "Aaron", "엘리세바": "Elisheba", "모세": "Moses",
  "십보라": "Zipporah", "미리암": "Miriam", "고라": "Korah", "람": "Ram",
  "나답": "Nadab", "아비후": "Abihu", "엘르아살": "Eleazar", "이다말": "Ithamar",
  "게르솜": "Gershom", "엘리에셀": "Eliezer", "암미나답": "Amminadab", "나손": "Nahshon",
  "살몬": "Salmon", "라합": "Rahab", "보아스": "Boaz", "룻": "Ruth",
  "오벳": "Obed", "기스": "Kish", "이새": "Jesse", "사울": "Saul",
  "스루야": "Zeruiah", "다윗": "David", "밧세바": "Bathsheba", "미갈": "Michal",
  "요나단": "Jonathan", "이스보셋": "Ish-bosheth", "아비새": "Abishai", "요압": "Joab",
  "아사헬": "Asahel", "솔로몬": "Solomon", "나단": "Nathan", "므비보셋": "Mephibosheth",
  "르호보암": "Rehoboam", "마아가": "Maacah", "아비야": "Abijah", "아사": "Asa",
  "아수바": "Azubah", "여호사밧": "Jehoshaphat", "여호람": "Jehoram", "아달랴": "Athaliah",
  "아하시야": "Ahaziah", "시비야": "Zibiah", "요아스": "Joash", "여호앗단": "Jehoaddan",
  "아마샤": "Amaziah", "여골리야": "Jecholiah", "웃시야": "Uzziah", "여루사": "Jerusha",
  "요담": "Jotham", "아하스": "Ahaz", "히스기야": "Hezekiah", "헾시바": "Hephzibah",
  "므낫세": "Manasseh", "므술레멧": "Meshullemeth", "아몬": "Amon", "여디다": "Jedidah",
  "요시야": "Josiah", "하무달": "Hamutal", "스비다": "Zebidah", "여호아하스": "Jehoahaz",
  "여호야김": "Jehoiakim", "느후스다": "Nehushta", "시드기야": "Sethekiah", "여호야긴": "Jeconiah",
  "스알디엘": "Shealtiel", "스룹바벨": "Zerubbabel", "아비훗": "Abiud", "엘리아김": "Eliakim",
  "아소르": "Azor", "사독": "Zadok", "아킴": "Achim", "엘리웃": "Eliud",
  "맛단": "Matthan", "헬리": "Heli", "마리아": "Mary", "예수": "Jesus",
  "멜기세덱": "Melchizedek", "갈렙": "Caleb", "여호수아": "Joshua", "기드온": "Gideon",
  "삼손": "Samson", "사무엘": "Samuel", "엘리": "Eli", "한나": "Hannah",
  "압살롬": "Absalom", "여로보암": "Jeroboam", "엘리야": "Elijah", "엘리사": "Elisha",
  "느헤미야": "Nehemiah", "에스더": "Esther", "다니엘": "Daniel", "베드로": "Peter",
  "바울": "Paul", "요한": "John", "야고보": "James", "누가": "Luke",
  "마가": "Mark", "마태": "Matthew", "디모데": "Timothy", "디도": "Titus",
  "오네시모": "Onesimus"
};

// Floating annotations state
let annotations = [];
let activeAnnotationId = null;
let annotDragStartX = 0;
let annotDragStartY = 0;
let annotOriginalX = 0;
let annotOriginalY = 0;

// Admin Mode State
let isAdminMode = false;
let editingPersonId = null; // null means adding a new person
let isAddPersonModeActive = false;

// DOM Elements
const viewerContainer = document.getElementById('viewer-container');
const zoomWrapper = document.getElementById('zoom-wrapper');
const treeBoard = document.getElementById('tree-board');
const svgLayer = document.getElementById('svg-layer');
const zoomLevelText = document.getElementById('zoom-level');
const searchInput = document.getElementById('searchInput');
const studyPanel = document.getElementById('study-panel');

// Admin Elements
const adminLockBtn = document.getElementById('admin-lock-btn');
const adminActionsBar = document.getElementById('admin-actions-bar');
const adminSaveBtn = document.getElementById('admin-save-btn');
const adminAddBtn = document.getElementById('admin-add-btn');
const adminAddNoteBtn = document.getElementById('admin-add-note-btn');
const adminAddLinkBtn = document.getElementById('admin-add-link-btn');
const adminAddJunctionBtn = document.getElementById('admin-add-junction-btn');
const adminExportBtn = document.getElementById('admin-export-btn');
const adminImportBtn = document.getElementById('admin-import-btn');
const adminResetBtn = document.getElementById('admin-reset-btn');
const importFileInput = document.getElementById('import-file-input');

// Admin Modal Elements
const adminModal = document.getElementById('admin-modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const adminForm = document.getElementById('admin-form');
const formDeleteBtn = document.getElementById('form-delete-btn');

// Style Editor Elements
const styleEditorToggle = document.getElementById('style-editor-toggle');
const styleEditorPanel = document.getElementById('style-editor-panel');
const stylePanelClose = document.getElementById('style-panel-close');
const styleResetBtn = document.getElementById('style-reset-btn');

// Style Form Control Elements
const inputLineColor = document.getElementById('style-line-color');
const inputMainLineColor = document.getElementById('style-main-line-color');
const inputSpouseLineColor = document.getElementById('style-spouse-line-color');
const inputLineWidth = document.getElementById('style-line-width');
const inputCornerRadius = document.getElementById('style-corner-radius');
const inputSplitOffset = document.getElementById('style-split-offset');
const inputLineType = document.getElementById('style-line-type');
const inputSiblingGap = document.getElementById('style-sibling-gap');

// Style Form Value Labels
const labelLineWidth = document.getElementById('label-line-width');
const labelCornerRadius = document.getElementById('label-corner-radius');
const labelSplitOffset = document.getElementById('label-split-offset');
const labelSiblingGap = document.getElementById('label-sibling-gap');

// Node Coordinate Map
let coordinates = {};

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  // Ensure layout version is synchronized without resetting any manual edits
  if (typeof LAYOUT_VERSION !== 'undefined') {
    localStorage.setItem('bible_tree_layout_version', LAYOUT_VERSION);
  }
  


  precomputeGroups();
  setupFilters();
  applyFilters();
  initStyleSettings();
  setupZoomPan();
  setupSearch();
  setupStudyPanel();
  setupThemeToggle();
  setupAdminMode();
  setupStyleEditor();
  updateStats();
  
  // Center view on Adam initially if the ResizeObserver hasn't already done it
  setTimeout(() => {
    if (!initialCentered) {
      initialCentered = true;
      centerOnNode('adam');
    }
  }, 100);
  
  // Register keyboard nudge listeners for Admin Mode
  window.addEventListener('keydown', (e) => {
    if (!isAdminMode) return;
    
    // Ignore nudging if typing in inputs/textareas
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
      return;
    }
    
    // Auto-select hovered card if no selection active
    if (selectedPersonIds.size === 0 && hoveredPersonId) {
      selectedPersonIds.add(hoveredPersonId);
      selectedPersonId = hoveredPersonId;
      const cardEl = document.getElementById(`card-${hoveredPersonId}`);
      if (cardEl) cardEl.classList.add('selected-for-edit');
    }
    
    if (selectedPersonIds.size === 0) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nudgeSelectedPerson(-0.1, false, e.shiftKey);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nudgeSelectedPerson(0.1, false, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nudgeSelectedPerson(-0.1, true, e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nudgeSelectedPerson(0.1, true, e.shiftKey);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      selectedPersonIds.clear();
      selectedPersonId = null;
      renderTree();
    }
  });

  // Register click listener for Add Link Mode (using capturing phase)
  document.addEventListener('click', (e) => {
    if (!isAddLinkModeActive) return;
    
    const card = e.target.closest('.person-card');
    const annot = e.target.closest('.canvas-annotation');
    
    if (!card && !annot) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const clickedId = card ? card.getAttribute('data-id') : annot.id;
    
    if (!linkSourceId) {
      linkSourceId = clickedId;
      const el = card || annot;
      el.classList.add('link-source-highlight');
      showToast("연결할 대상 상자를 클릭하세요.");
    } else {
      if (linkSourceId === clickedId) {
        showToast("자기 자신은 연결할 수 없습니다.");
        return;
      }
      
      pushHistoryState();
      customVisualLines.push({
        id: `link-${Date.now()}`,
        from: linkSourceId,
        to: clickedId
      });
      saveCustomVisualLines();
      
      deactivateAddLinkMode();
      drawConnections();
      showToast("시각적 연결선이 생성되었습니다.");
    }
  }, true);
});

function getFamilyTreeTargets(personId) {
  const targets = new Set();
  const queue = [personId];
  targets.add(personId);
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    
    // Add spouses of the current person being traversed
    const currentChar = db.find(c => c.id === currentId);
    if (currentChar && currentChar.spouses) {
      currentChar.spouses.forEach(spId => {
        if (!targets.has(spId)) {
          targets.add(spId);
          queue.push(spId);
        }
      });
    }
    
    // Add children of the current person being traversed
    const children = db.filter(c => c.parents && c.parents.includes(currentId));
    children.forEach(child => {
      if (!targets.has(child.id)) {
        targets.add(child.id);
        queue.push(child.id);
      }
    });
  }
  return Array.from(targets);
}

function nudgeSelectedPerson(amount, isVertical = false, forceMoveDescendants = false) {
  if (selectedPersonIds.size === 0) return;
  pushHistoryState();
  
  const checkbox = document.getElementById('admin-move-descendants-toggle');
  const moveDescendants = forceMoveDescendants || (checkbox && checkbox.checked);
  
  let allTargets = new Set();
  selectedPersonIds.forEach(personId => {
    if (moveDescendants) {
      const targetIds = getFamilyTreeTargets(personId);
      targetIds.forEach(id => {
        const tChar = db.find(c => c.id === id);
        if (tChar) {
          tChar.isManual = true;
          allTargets.add(tChar);
        }
      });
    } else {
      const tChar = db.find(c => c.id === personId);
      if (tChar) {
        tChar.isManual = true;
        allTargets.add(tChar);
      }
    }
  });
  
  allTargets.forEach(target => {
    if (isVertical) {
      target.generation = parseFloat((target.generation + amount).toFixed(2));
    } else {
      target.column = parseFloat((target.column + amount).toFixed(3));
    }
  });
  
  saveDatabase();
  initBoard();
  updateTreeLayout();
}

function nudgePersonDirect(personId, amount, isVertical = false, adjustCamera = false, forceMoveDescendants = false) {
  pushHistoryState();
  // If the nudged person is part of the selection, nudge all selected cards together
  if (selectedPersonIds.has(personId)) {
    nudgeSelectedPerson(amount, isVertical, forceMoveDescendants);
    return;
  }
  
  const char = db.find(c => c.id === personId);
  if (!char) return;
  
  selectedPersonId = personId;
  
  const checkbox = document.getElementById('admin-move-descendants-toggle');
  const moveDescendants = forceMoveDescendants || (checkbox && checkbox.checked);
  
  let targets = [];
  if (moveDescendants) {
    const targetIds = getFamilyTreeTargets(personId);
    targetIds.forEach(id => {
      const tChar = db.find(c => c.id === id);
      if (tChar) {
        tChar.isManual = true;
        targets.push(tChar);
      }
    });
  } else {
    char.isManual = true;
    targets = [char];
  }
  
  targets.forEach(target => {
    if (isVertical) {
      target.generation = parseFloat((target.generation + amount).toFixed(2));
      if (adjustCamera && target.id === personId) {
        const dy = amount * GEN_HEIGHT;
        panY -= dy * currentScale;
      }
    } else {
      target.column = parseFloat((target.column + amount).toFixed(3));
      if (adjustCamera && target.id === personId) {
        const dx = amount * COL_WIDTH;
        panX -= dx * currentScale;
      }
    }
  });
  
  saveDatabase();
  initBoard();
  updateTreeLayout();
  
  if (adjustCamera) {
    updateTransform();
  }
}

function deletePersonDirect(personId) {
  deletePerson(personId);
}

// Load Database from LocalStorage or data.js
function initDatabase() {
  try {
    // Master migration for legacy 'manasseh' ID (King Manasseh, generation 46) to 'manasseh_king'
    try {
      // 1. Migrate character edits
      const characterEdits = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
      if (characterEdits['manasseh']) {
        const edit = characterEdits['manasseh'];
        const isKingEdit = edit.generation === 46 || edit.generation === undefined;
        if (isKingEdit) {
          characterEdits['manasseh_king'] = edit;
          delete characterEdits['manasseh'];
          localStorage.setItem('bible_tree_character_edits', JSON.stringify(characterEdits));
        }
      }
      
      // 2. Migrate custom characters
      let customCharacters = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
      let customChanged = false;
      customCharacters.forEach(c => {
        if (c.id === 'manasseh' && c.generation === 46) {
          c.id = 'manasseh_king';
          customChanged = true;
        }
        if (c.spouses && c.spouses.includes('manasseh')) {
          c.spouses = c.spouses.map(id => id === 'manasseh' ? 'manasseh_king' : id);
          customChanged = true;
        }
        if (c.parents && c.parents.includes('manasseh')) {
          c.parents = c.parents.map(id => id === 'manasseh' ? 'manasseh_king' : id);
          customChanged = true;
        }
      });
      if (customChanged) {
        localStorage.setItem('bible_tree_custom_characters', JSON.stringify(customCharacters));
      }
      
      // 3. Undelete King Manasseh and Joseph's son Manasseh if they were accidentally deleted
      let deletedIds = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
      if (deletedIds.includes('manasseh') || deletedIds.includes('manasseh_king')) {
        deletedIds = deletedIds.filter(id => id !== 'manasseh' && id !== 'manasseh_king');
        localStorage.setItem('bible_tree_deleted_ids', JSON.stringify(deletedIds));
      }
      
      // 4. Migrate line bends
      let bends = JSON.parse(localStorage.getItem('bible_tree_line_bends') || '{}');
      let bendsChanged = false;
      Object.keys(bends).forEach(key => {
        if (key.includes('manasseh')) {
          const newKey = key.replace(/manasseh/g, 'manasseh_king');
          bends[newKey] = bends[key];
          delete bends[key];
          bendsChanged = true;
        }
      });
      if (bendsChanged) {
        localStorage.setItem('bible_tree_line_bends', JSON.stringify(bends));
      }

      // 5. Migrate legacy 'azubah' references in characterEdits and customCharacters
      let editsChanged = false;
      const characterEditsToMigrate = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
      Object.keys(characterEditsToMigrate).forEach(id => {
        const edit = characterEditsToMigrate[id];
        if (edit.parents && edit.parents.includes('azubah')) {
          edit.parents = edit.parents.map(p => p === 'azubah' ? (id.includes('caleb') ? 'azubah_caleb' : 'azubah_asa') : p);
          editsChanged = true;
        }
        if (edit.spouses && edit.spouses.includes('azubah')) {
          edit.spouses = edit.spouses.map(s => s === 'azubah' ? (id === 'chelubai' || id === 'hezron' ? 'azubah_caleb' : 'azubah_asa') : s);
          editsChanged = true;
        }
      });
      if (editsChanged) {
        localStorage.setItem('bible_tree_character_edits', JSON.stringify(characterEditsToMigrate));
      }

      let customChangedToMigrate = false;
      const customCharactersToMigrate = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
      customCharactersToMigrate.forEach(edit => {
        if (edit.parents && edit.parents.includes('azubah')) {
          edit.parents = edit.parents.map(p => p === 'azubah' ? (edit.id.includes('caleb') ? 'azubah_caleb' : 'azubah_asa') : p);
          customChangedToMigrate = true;
        }
        if (edit.spouses && edit.spouses.includes('azubah')) {
          edit.spouses = edit.spouses.map(s => s === 'azubah' ? (edit.id === 'chelubai' || edit.id === 'hezron' ? 'azubah_caleb' : 'azubah_asa') : s);
          customChangedToMigrate = true;
        }
      });
      if (customChangedToMigrate) {
        localStorage.setItem('bible_tree_custom_characters', JSON.stringify(customCharactersToMigrate));
      }
    } catch (err) {
      console.error("Master migration error:", err);
    }

    // 1. Start with copy of static canonical characters
    db = JSON.parse(JSON.stringify(BIBLE_CHARACTERS));
    
    // 2. Remove deleted canonical characters
    let deletedIds = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
    if (!Array.isArray(deletedIds)) deletedIds = [];
    db = db.filter(c => !deletedIds.includes(c.id));
    
    // 3. Apply edits to canonical characters
    let characterEdits = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
    if (!characterEdits || typeof characterEdits !== 'object' || Array.isArray(characterEdits)) characterEdits = {};
    db.forEach(c => {
      if (characterEdits[c.id]) {
        Object.assign(c, characterEdits[c.id]);
      }
    });
    
    // 4. Load and append custom characters (filtering out any that are now canonical)
    let customCharacters = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
    if (!Array.isArray(customCharacters)) customCharacters = [];
    const canonIds = new Set(BIBLE_CHARACTERS.map(c => c.id));
    const filteredCustom = customCharacters.filter(c => !canonIds.has(c.id));
    db.push(...filteredCustom);
    if (filteredCustom.length !== customCharacters.length) {
      localStorage.setItem('bible_tree_custom_characters', JSON.stringify(filteredCustom));
    }
    
    // One-time migration for legacy bible_tree_db key
    const oldLocalDb = localStorage.getItem('bible_tree_db');
    if (oldLocalDb) {
      try {
        const parsedOld = JSON.parse(oldLocalDb);
        if (Array.isArray(parsedOld)) {
          db = parsedOld;
          saveDatabase(); // Instantly splits and saves to new keys
        }
      } catch (err) {
        console.error("Failed to migrate legacy database", err);
      }
      localStorage.removeItem('bible_tree_db');
    }
    
    // 5. Validation and Self-Healing Safeguard
    db.forEach(c => {
      const canon = BIBLE_CHARACTERS.find(orig => orig.id === c.id);
      
      // If canonical, preserve edits but ensure array properties and basic types are valid
      if (canon) {
        if (c.name === undefined || c.name === null) c.name = canon.name;
        if (c.engName === undefined || c.engName === null) c.engName = canon.engName;
        if (c.gender === undefined || c.gender === null) c.gender = canon.gender;
        if (c.isMain === undefined || c.isMain === null) c.isMain = canon.isMain;
        
        // Ensure parents and spouses are arrays
        if (!Array.isArray(c.parents)) {
          c.parents = canon.parents ? [...canon.parents] : [];
        }
        if (!Array.isArray(c.spouses)) {
          c.spouses = canon.spouses ? [...canon.spouses] : [];
        }
      } else {
        // For custom characters, make sure parents and spouses are arrays
        if (!Array.isArray(c.parents)) c.parents = [];
        if (!Array.isArray(c.spouses)) c.spouses = [];
      }

      if (typeof c.column !== 'number' || isNaN(c.column)) {
        c.column = canon && typeof canon.column === 'number' ? canon.column : 0.0;
      }
      if (typeof c.generation !== 'number' || isNaN(c.generation)) {
        c.generation = canon && typeof canon.generation === 'number' ? canon.generation : 0;
      }
    });
  } catch (e) {
    console.error("Failed to initialize database. Falling back to default.", e);
    db = JSON.parse(JSON.stringify(BIBLE_CHARACTERS));
  }
  
  loadAnnotations();
  loadLineBends();
  loadSpouseSplits();
  loadCustomVisualLines();
  loadCanvasJunctions();
}

function saveDatabase() {
  const customCharacters = [];
  const characterEdits = {};
  const deletedIds = [];
  
  const canonIds = new Set(BIBLE_CHARACTERS.map(c => c.id));
  
  // Load previously saved state to preserve hidden items
  const prevCustom = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
  const prevEdits = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
  const prevDeleted = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
  
  // Helper to check if a group is hidden
  const isGroupHidden = (group) => {
    if (!group) return false;
    return activeFilters[group] === false;
  };
  
  // 1. Process current db (active/visible items)
  db.forEach(char => {
    if (canonIds.has(char.id)) {
      const canon = BIBLE_CHARACTERS.find(c => c.id === char.id);
      const isModified = JSON.stringify(char) !== JSON.stringify(canon);
      if (isModified) {
        characterEdits[char.id] = char;
      }
    } else {
      customCharacters.push(char);
    }
  });
  
  // 2. Preserve hidden custom characters
  prevCustom.forEach(char => {
    const group = getCharacterGroup(char);
    if (isGroupHidden(group)) {
      if (!customCharacters.some(c => c.id === char.id)) {
        customCharacters.push(char);
      }
    }
  });
  
  // 3. Preserve hidden edits
  Object.keys(prevEdits).forEach(id => {
    const char = prevEdits[id];
    const group = getCharacterGroup(char);
    if (isGroupHidden(group)) {
      if (!characterEdits[id]) {
        characterEdits[id] = char;
      }
    }
  });
  
  // 4. Handle deleted canonical characters
  const currentDbIds = new Set(db.map(c => c.id));
  BIBLE_CHARACTERS.forEach(canon => {
    const group = getCharacterGroup(canon);
    if (isGroupHidden(group)) {
      if (prevDeleted.includes(canon.id) && !deletedIds.includes(canon.id)) {
        deletedIds.push(canon.id);
      }
    } else {
      if (!currentDbIds.has(canon.id)) {
        deletedIds.push(canon.id);
      }
    }
  });
  
  // 5. Save to localStorage
  localStorage.setItem('bible_tree_custom_characters', JSON.stringify(customCharacters));
  localStorage.setItem('bible_tree_character_edits', JSON.stringify(characterEdits));
  localStorage.setItem('bible_tree_deleted_ids', JSON.stringify(deletedIds));
}

// Load Custom Annotations/Text boxes
function loadAnnotations() {
  const savedAnnots = localStorage.getItem('bible_tree_annotations');
  if (savedAnnots) {
    try {
      annotations = JSON.parse(savedAnnots);
      if (!Array.isArray(annotations)) annotations = [];
    } catch (e) {
      console.error("Failed to parse annotations.", e);
      annotations = [];
    }
  } else {
    annotations = [
      {
        id: "note-welcome",
        text: "성경 인물 족보 보드\n(마우스 드래그로 이동, 휠로 확대/축소)",
        x: -50,
        y: 40,
        width: 260,
        height: 55,
        fontSize: 13,
        bold: true,
        color: "#1e293b",
        bgColor: "#f8fafc"
      }
    ];
    saveAnnotations();
  }
}

function saveAnnotations() {
  localStorage.setItem('bible_tree_annotations', JSON.stringify(annotations));
}

function loadLineBends() {
  const saved = localStorage.getItem('bible_tree_line_bends');
  if (saved) {
    try {
      lineBends = JSON.parse(saved);
      if (!lineBends || typeof lineBends !== 'object' || Array.isArray(lineBends)) {
        lineBends = {};
      }
      
      // Migrate legacy 'azubah' line keys
      let bendsChanged = false;
      Object.keys(lineBends).forEach(key => {
        if (key.includes('azubah') && !key.includes('azubah_caleb') && !key.includes('azubah_asa')) {
          let newKey = key;
          if (key.includes('chelubai') || key.includes('hezron') || key.includes('caleb')) {
            newKey = key.replace(/azubah/g, 'azubah_caleb');
          } else {
            newKey = key.replace(/azubah/g, 'azubah_asa');
          }
          lineBends[newKey] = lineBends[key];
          delete lineBends[key];
          bendsChanged = true;
        }
      });
      if (bendsChanged) {
        saveLineBends();
      }
    } catch (e) {
      console.error("Failed to parse line bends.", e);
      lineBends = {};
    }
  } else {
    lineBends = {};
  }
}

function saveLineBends() {
  localStorage.setItem('bible_tree_line_bends', JSON.stringify(lineBends));
}

function loadSpouseSplits() {
  const saved = localStorage.getItem('bible_tree_spouse_splits');
  if (saved) {
    try {
      spouseSplits = JSON.parse(saved);
      if (!spouseSplits || typeof spouseSplits !== 'object' || Array.isArray(spouseSplits)) {
        spouseSplits = {};
      }
      
      // Migrate legacy 'azubah' spouse splits keys
      let splitsChanged = false;
      Object.keys(spouseSplits).forEach(key => {
        if (key.includes('azubah') && !key.includes('azubah_caleb') && !key.includes('azubah_asa')) {
          let newKey = key;
          if (key.includes('chelubai') || key.includes('hezron') || key.includes('caleb')) {
            newKey = key.replace(/azubah/g, 'azubah_caleb');
          } else {
            newKey = key.replace(/azubah/g, 'azubah_asa');
          }
          spouseSplits[newKey] = spouseSplits[key];
          delete spouseSplits[key];
          splitsChanged = true;
        }
      });
      if (splitsChanged) {
        saveSpouseSplits();
      }
    } catch (e) {
      console.error("Failed to parse spouse splits.", e);
      spouseSplits = {};
    }
  } else {
    spouseSplits = {};
  }
  
  // Enforce clean defaults to align children trunks perfectly under mothers
  spouseSplits["abraham+keturah"] = 0.018;
  spouseSplits["abraham+hagar"] = 0.02;
}

function saveSpouseSplits() {
  localStorage.setItem('bible_tree_spouse_splits', JSON.stringify(spouseSplits));
}

function loadCustomVisualLines() {
  const saved = localStorage.getItem('bible_tree_custom_visual_lines');
  if (saved) {
    try {
      customVisualLines = JSON.parse(saved);
      if (!Array.isArray(customVisualLines)) customVisualLines = [];
    } catch (e) {
      console.error("Failed to parse custom visual lines.", e);
      customVisualLines = [];
    }
  } else {
    customVisualLines = [];
  }
}

function saveCustomVisualLines() {
  localStorage.setItem('bible_tree_custom_visual_lines', JSON.stringify(customVisualLines));
}

function loadCanvasJunctions() {
  const saved = localStorage.getItem('bible_tree_canvas_junctions');
  if (saved) {
    try {
      canvasJunctions = JSON.parse(saved);
      if (!Array.isArray(canvasJunctions)) canvasJunctions = [];
    } catch (e) {
      console.error("Failed to parse canvas junctions.", e);
      canvasJunctions = [];
    }
  } else {
    canvasJunctions = [];
  }
}

function saveCanvasJunctions() {
  localStorage.setItem('bible_tree_canvas_junctions', JSON.stringify(canvasJunctions));
}

function isJunctionId(id) {
  if (!id) return false;
  const idStr = String(id);
  if (idStr.startsWith('junction-')) return true;
  return canvasJunctions.some(n => String(n.id) === idStr);
}

function getElementCenter(id) {
  if (!id) return null;
  id = String(id);
  if (id.startsWith('card-')) {
    id = id.replace('card-', '');
  }
  if (isJunctionId(id)) {
    const jNode = canvasJunctions.find(node => String(node.id) === String(id));
    if (jNode) {
      return {
        x: jNode.x,
        y: jNode.y
      };
    }
  } else if (id.startsWith('annot-')) {
    const annotId = parseInt(id.replace('annot-', ''));
    if (isNaN(annotId)) return null;
    const annot = annotations.find(a => a.id === annotId);
    if (annot) {
      return {
        x: annot.x + annot.width / 2,
        y: annot.y + annot.height / 2
      };
    }
  } else {
    const coord = coordinates[id];
    if (coord) {
      return {
        x: coord.x,
        y: coord.y
      };
    }
  }
  return null;
}

function getElementPortCoordinates(id, portName) {
  if (!id) return null;
  id = String(id);
  if (id.startsWith('card-')) {
    id = id.replace('card-', '');
  }
  
  // If portName is not specified, default to center coordinates
  if (!portName) return getElementCenter(id);
  
  const ports = getBoxPorts(id);
  if (ports && ports[portName]) {
    return ports[portName];
  }
  return getElementCenter(id);
}

function projectPointOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  
  const ab2 = abx * abx + aby * aby;
  if (ab2 === 0) return { x: ax, y: ay };
  
  let t = (apx * abx + apy * aby) / ab2;
  t = Math.max(0, Math.min(1, t)); // clamp to segment
  
  return { x: ax + t * abx, y: ay + t * aby };
}

function getClosestPointOnParentLine(px, py, parentKey) {
  const parents = parentKey.split('+');
  let sourceX = 0;
  let sourceY = 0;
  
  if (parents.length === 1) {
    const pCoord = coordinates[parents[0]];
    if (pCoord) {
      sourceX = pCoord.x;
      sourceY = pCoord.y + CARD_HEIGHT / 2;
    }
  } else if (parents.length === 2) {
    const p1 = coordinates[parents[0]];
    const p2 = coordinates[parents[1]];
    if (p1 && p2) {
      const leftNode = p1.x < p2.x ? p1 : p2;
      const rightNode = p1.x < p2.x ? p2 : p1;
      const x1 = leftNode.x + CARD_WIDTH / 2;
      const x2 = rightNode.x - CARD_WIDTH / 2;
      const ratio = spouseSplits[parentKey] !== undefined ? spouseSplits[parentKey] : 0.5;
      sourceX = x1 + (x2 - x1) * ratio;
      sourceY = leftNode.y;
    }
  }
  
  const children = db.filter(c => c.parents && [...c.parents].sort().join('+') === parentKey);
  if (children.length === 0) return { x: sourceX, y: sourceY };
  
  const childCoords = children.map(c => coordinates[c.id]).filter(c => c);
  if (childCoords.length === 0) return { x: sourceX, y: sourceY };
  
  const minX = Math.min(...childCoords.map(c => c.x));
  const maxX = Math.max(...childCoords.map(c => c.x));
  
  const firstChildCoord = childCoords[0];
  const targetY = firstChildCoord.y - (CARD_HEIGHT / 2);
  const defaultSplitOffset = styleSettings.splitOffset || 0.4;
  const ySplit = sourceY + (targetY - sourceY) * defaultSplitOffset;
  
  let trunkEndY = ySplit;
  const segments = [];
  const customBends = lineBends[parentKey];
  
  let curX = sourceX;
  let curY = sourceY;
  
  if (customBends && customBends.length > 0) {
    customBends.forEach(pt => {
      segments.push({ ax: curX, ay: curY, bx: curX, by: pt.y });
      segments.push({ ax: curX, ay: pt.y, bx: pt.x, by: pt.y });
      curX = pt.x;
      curY = pt.y;
    });
    trunkEndY = curY;
  } else {
    segments.push({ ax: sourceX, ay: sourceY, bx: sourceX, by: ySplit });
  }
  
  segments.push({ ax: minX, ay: trunkEndY, bx: maxX, by: trunkEndY });
  
  let minD = Infinity;
  let closestPt = { x: sourceX, y: sourceY };
  
  segments.forEach(seg => {
    const proj = projectPointOnSegment(px, py, seg.ax, seg.ay, seg.bx, seg.by);
    const d = Math.hypot(px - proj.x, py - proj.y);
    if (d < minD) {
      minD = d;
      closestPt = proj;
    }
  });
  
  return closestPt;
}

function getClosestPointOnCustomLine(px, py, lineId) {
  const line = customVisualLines.find(l => l.id === lineId);
  if (!line) return { x: px, y: py };
  
  const start = getElementCenter(line.from);
  const end = getElementCenter(line.to);
  if (!start || !end) return { x: px, y: py };
  
  const segments = [];
  const customBends = lineBends[lineId];
  let curX = start.x;
  let curY = start.y;
  
  if (customBends && customBends.length > 0) {
    customBends.forEach(pt => {
      segments.push({ ax: curX, ay: curY, bx: pt.x, by: pt.y });
      curX = pt.x;
      curY = pt.y;
    });
    segments.push({ ax: curX, ay: curY, bx: end.x, by: end.y });
  } else {
    segments.push({ ax: start.x, ay: start.y, bx: end.x, by: end.y });
  }
  
  let minD = Infinity;
  let closestPt = { x: px, y: py };
  
  segments.forEach(seg => {
    const proj = projectPointOnSegment(px, py, seg.ax, seg.ay, seg.bx, seg.by);
    const d = Math.hypot(px - proj.x, py - proj.y);
    if (d < minD) {
      minD = d;
      closestPt = proj;
    }
  });
  
  return closestPt;
}

function getTargetPoint(startX, startY, toId) {
  if (!toId) return null;
  toId = String(toId);
  if (toId.startsWith('card-')) {
    toId = toId.replace('card-', '');
  }
  if (toId.startsWith('annot-') || coordinates[toId]) return null;
  if (toId.startsWith('link-')) return getClosestPointOnCustomLine(startX, startY, toId);
  return getClosestPointOnParentLine(startX, startY, toId);
}

function getBoxPorts(id) {
  if (!id) return null;
  id = String(id);
  if (id.startsWith('card-')) {
    id = id.replace('card-', '');
  }
  if (isJunctionId(id)) {
    const jNode = canvasJunctions.find(node => String(node.id) === String(id));
    if (!jNode) return null;
    const r = (jNode.size || 16) / 2;
    return {
      top:    { x: jNode.x,     y: jNode.y - r, dir: 'UP' },
      right:  { x: jNode.x + r, y: jNode.y,     dir: 'RIGHT' },
      bottom: { x: jNode.x,     y: jNode.y + r, dir: 'DOWN' },
      left:   { x: jNode.x - r, y: jNode.y,     dir: 'LEFT' }
    };
  } else if (id.startsWith('annot-')) {
    const annotId = parseInt(id.replace('annot-', ''));
    if (isNaN(annotId)) return null;
    const annot = annotations.find(a => a.id === annotId);
    if (!annot) return null;
    const x = annot.x;
    const y = annot.y;
    const w = annot.width;
    const h = annot.height;
    return {
      top:          { x: x + w / 2, y: y,         dir: 'UP' },
      right:        { x: x + w,     y: y + h / 2, dir: 'RIGHT' },
      bottom:       { x: x + w / 2, y: y + h,     dir: 'DOWN' },
      left:         { x: x,         y: y + h / 2, dir: 'LEFT' },
      'top-left':     { x: x,         y: y,         dir: 'UP' },
      'top-right':    { x: x + w,     y: y,         dir: 'UP' },
      'bottom-left':  { x: x,         y: y + h,     dir: 'DOWN' },
      'bottom-right': { x: x + w,     y: y + h,     dir: 'DOWN' }
    };
  } else {
    const coord = coordinates[id];
    if (!coord) return null;
    const x = coord.x - CARD_WIDTH / 2;
    const y = coord.y - CARD_HEIGHT / 2;
    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;
    return {
      top:          { x: x + w / 2 + 15, y: y,         dir: 'UP' },
      right:        { x: x + w,          y: y + h / 2, dir: 'RIGHT' },
      bottom:       { x: x + w / 2 + 15, y: y + h,     dir: 'DOWN' },
      left:         { x: x,         y: y + h / 2, dir: 'LEFT' },
      'top-left':     { x: x,         y: y,         dir: 'UP' },
      'top-right':    { x: x + w,     y: y,         dir: 'UP' },
      'bottom-left':  { x: x,         y: y + h,     dir: 'DOWN' },
      'bottom-right': { x: x + w,     y: y + h,     dir: 'DOWN' }
    };
  }
}

function getClosestPortOfBox(boxId, targetX, targetY) {
  const ports = getBoxPorts(boxId);
  if (!ports) return 'top';
  let minD = Infinity;
  let bestPort = 'top';
  Object.keys(ports).forEach(k => {
    const p = ports[k];
    if (p) {
      const d = Math.hypot(p.x - targetX, p.y - targetY);
      if (d < minD) {
        minD = d;
        bestPort = k;
      }
    }
  });
  return bestPort;
}

function findSnappingTarget(mouseX, mouseY, otherEndId) {
  let bestTargetId = null;
  let bestPortKey = null;
  let bestPortCoord = null;
  let minD = Infinity;
  const snapRadius = 45; // snapping distance in pixels
  
  // 1. Scan Junction Nodes (prioritized for easier spatial selection)
  canvasJunctions.forEach(jNode => {
    if (jNode.id === otherEndId) return;
    const ports = getBoxPorts(jNode.id);
    if (ports) {
      Object.keys(ports).forEach(k => {
        const p = ports[k];
        if (p) {
          const d = Math.hypot(p.x - mouseX, p.y - mouseY);
          if (d < snapRadius && d < minD) {
            minD = d;
            bestTargetId = jNode.id;
            bestPortKey = k;
            bestPortCoord = p;
          }
        }
      });
    }
  });
  
  if (bestTargetId) {
    return { targetId: bestTargetId, targetPort: bestPortKey, targetPt: bestPortCoord };
  }
  
  // 2. Scan person-cards and canvas-annotations
  const candidateBoxes = [];
  document.querySelectorAll('.person-card, .canvas-annotation').forEach(el => {
    const id = el.getAttribute('data-id') || el.id;
    if (!id || id === otherEndId) return;
    candidateBoxes.push({ id, el });
  });
  
  candidateBoxes.forEach(cand => {
    const ports = getBoxPorts(cand.id);
    if (ports) {
      Object.keys(ports).forEach(k => {
        const p = ports[k];
        if (p) {
          const d = Math.hypot(p.x - mouseX, p.y - mouseY);
          if (d < snapRadius && d < minD) {
            minD = d;
            bestTargetId = cand.id;
            bestPortKey = k;
            bestPortCoord = p;
          }
        }
      });
    }
  });
  
  if (bestTargetId) {
    return { targetId: bestTargetId, targetPort: bestPortKey, targetPt: bestPortCoord };
  }
  
  return null;
}

function getBestPorts(fromId, toId) {
  const ports1 = getBoxPorts(fromId);
  const ports2 = getBoxPorts(toId);
  if (!ports1 || !ports2) return null;
  
  let minD = Infinity;
  let best1 = ports1.bottom;
  let best2 = ports2.top;
  
  const keys1 = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const keys2 = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
  
  keys1.forEach(k1 => {
    const p1 = ports1[k1];
    keys2.forEach(k2 => {
      const p2 = ports2[k2];
      if (p1 && p2) {
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < minD) {
          minD = d;
          best1 = p1;
          best2 = p2;
        }
      }
    });
  });
  
  return { start: best1, end: best2 };
}

function routeOrthogonal(start, end) {
  const M = 20;
  
  const project = (pt) => {
    if (!pt.dir) return { x: pt.x, y: pt.y };
    if (pt.dir === 'UP') return { x: pt.x, y: pt.y - M };
    if (pt.dir === 'DOWN') return { x: pt.x, y: pt.y + M };
    if (pt.dir === 'LEFT') return { x: pt.x - M, y: pt.y };
    if (pt.dir === 'RIGHT') return { x: pt.x + M, y: pt.y };
    return { x: pt.x, y: pt.y };
  };
  
  const pStart = project(start);
  const pEnd = project(end);
  
  if (!end.dir) {
    const vertices = [start, pStart];
    if (start.dir === 'UP' || start.dir === 'DOWN') {
      vertices.push({ x: pStart.x, y: end.y });
    } else {
      vertices.push({ x: end.x, y: pStart.y });
    }
    vertices.push(end);
    return vertices;
  }
  
  const vertices = [start, pStart];
  const isStartVertical = start.dir === 'UP' || start.dir === 'DOWN';
  const isEndVertical = end.dir === 'UP' || end.dir === 'DOWN';
  
  if (isStartVertical && isEndVertical) {
    const midY = (pStart.y + pEnd.y) / 2;
    vertices.push({ x: pStart.x, y: midY });
    vertices.push({ x: pEnd.x, y: midY });
  } else if (!isStartVertical && !isEndVertical) {
    const midX = (pStart.x + pEnd.x) / 2;
    vertices.push({ x: midX, y: pStart.y });
    vertices.push({ x: midX, y: pEnd.y });
  } else {
    if (isStartVertical) {
      vertices.push({ x: pStart.x, y: pEnd.y });
    } else {
      vertices.push({ x: pEnd.x, y: pStart.y });
    }
  }
  
  vertices.push(pEnd);
  vertices.push(end);
  
  return vertices;
}

function renderAnnotations() {
  // Clear existing annotation elements on the board
  document.querySelectorAll('.canvas-annotation').forEach(el => el.remove());
  
  const board = document.getElementById('tree-board');
  if (!board) return;
  
  annotations.forEach(annot => {
    const el = document.createElement('div');
    el.id = `annot-${annot.id}`;
    el.className = 'canvas-annotation';
    el.dataset.x = annot.x;
    el.dataset.y = annot.y;
    el.style.width = `${annot.width}px`;
    el.style.height = `${annot.height}px`;
    el.style.backgroundColor = annot.bgColor || '#ffffff';
    
    // Add text element
    const textarea = document.createElement('textarea');
    textarea.className = 'annotation-text';
    textarea.value = annot.text;
    textarea.style.fontSize = `${annot.fontSize || 14}px`;
    textarea.style.fontWeight = annot.bold ? 'bold' : 'normal';
    textarea.style.color = annot.color || '#1e293b';
    
    textarea.addEventListener('input', (e) => {
      annot.text = e.target.value;
      saveAnnotations();
    });
    
    el.appendChild(textarea);
    
    // Add Toolbar (for Admin Mode)
    const toolbar = document.createElement('div');
    toolbar.className = 'annotation-toolbar';
    
    // Size input
    const sizeInput = document.createElement('input');
    sizeInput.type = 'number';
    sizeInput.className = 'annot-size-input';
    sizeInput.value = annot.fontSize || 14;
    sizeInput.min = 10;
    sizeInput.max = 72;
    sizeInput.step = 2;
    sizeInput.addEventListener('change', (e) => {
      annot.fontSize = parseInt(e.target.value) || 14;
      textarea.style.fontSize = `${annot.fontSize}px`;
      saveAnnotations();
    });
    toolbar.appendChild(sizeInput);
    
    // Bold button
    const boldBtn = document.createElement('button');
    boldBtn.className = `annot-btn annot-bold-btn ${annot.bold ? 'active' : ''}`;
    boldBtn.innerHTML = '<b>B</b>';
    boldBtn.addEventListener('click', () => {
      annot.bold = !annot.bold;
      boldBtn.classList.toggle('active', annot.bold);
      textarea.style.fontWeight = annot.bold ? 'bold' : 'normal';
      saveAnnotations();
    });
    toolbar.appendChild(boldBtn);
    
    // Color pickers
    const colorWrapper = document.createElement('div');
    colorWrapper.className = 'annot-color-wrapper';
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'annot-color-picker';
    colorPicker.value = annot.color || '#1e293b';
    colorPicker.title = '글자 색상';
    colorPicker.addEventListener('input', (e) => {
      annot.color = e.target.value;
      textarea.style.color = annot.color;
      saveAnnotations();
    });
    colorWrapper.appendChild(colorPicker);
    
    const bgPicker = document.createElement('input');
    bgPicker.type = 'color';
    bgPicker.className = 'annot-color-picker';
    bgPicker.value = annot.bgColor || '#ffffff';
    bgPicker.title = '배경 색상';
    bgPicker.addEventListener('input', (e) => {
      annot.bgColor = e.target.value;
      el.style.backgroundColor = annot.bgColor;
      saveAnnotations();
    });
    colorWrapper.appendChild(bgPicker);
    
    toolbar.appendChild(colorWrapper);
    
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'annot-btn';
    delBtn.innerHTML = '🗑️';
    delBtn.addEventListener('click', () => {
      if (confirm('이 텍스트 상자를 삭제하시겠습니까?')) {
        pushHistoryState();
        annotations = annotations.filter(a => a.id !== annot.id);
        saveAnnotations();
        
        customVisualLines = customVisualLines.filter(l => l.from !== `annot-${annot.id}` && l.to !== `annot-${annot.id}`);
        saveCustomVisualLines();
        
        el.remove();
        drawConnections();
      }
    });
    toolbar.appendChild(delBtn);
    
    el.appendChild(toolbar);
    
    // Drag handlers
    el.addEventListener('mousedown', (e) => {
      if (!isAdminMode) return;
      if (e.target.closest('.annotation-toolbar')) return; // Avoid drag when clicking toolbar
      
      e.stopPropagation(); // Avoid dragging board
      activeAnnotationId = annot.id;
      annotDragStartX = e.clientX;
      annotDragStartY = e.clientY;
      annotOriginalX = annot.x;
      annotOriginalY = annot.y;
      
      document.querySelectorAll('.canvas-annotation').forEach(n => n.style.zIndex = 95);
      el.style.zIndex = 99;
    });
    
    if (isAdminMode) {
      ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(portName => {
        const port = document.createElement('div');
        port.className = `card-link-port port-${portName}`;
        let portTitle = `드래그하여 연결선 만들기 (${portName})`;
        if (portName === 'top') portTitle = "드래그하여 연결선 만들기 (상단 중앙)";
        else if (portName === 'bottom') portTitle = "드래그하여 연결선 만들기 (하단 중앙)";
        else if (portName === 'left') portTitle = "드래그하여 연결선 만들기 (좌측 중앙)";
        else if (portName === 'right') portTitle = "드래그하여 연결선 만들기 (우측 중앙)";
        else if (portName === 'top-left') portTitle = "드래그하여 연결선 만들기 (좌측 상단 모서리)";
        else if (portName === 'top-right') portTitle = "드래그하여 연결선 만들기 (우측 상단 모서리)";
        else if (portName === 'bottom-left') portTitle = "드래그하여 연결선 만들기 (좌측 하단 모서리)";
        else if (portName === 'bottom-right') portTitle = "드래그하여 연결선 만들기 (우측 하단 모서리)";
        port.title = portTitle;
        
        port.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          const ports = getBoxPorts(`annot-${annot.id}`);
          if (!ports || !ports[portName]) return;
          const startPt = ports[portName];
          const startX = startPt.x;
          const startY = startPt.y;
          
          document.querySelectorAll('.person-card').forEach(c => c.classList.add('link-active-dragging'));
          document.querySelectorAll('.canvas-annotation').forEach(a => a.classList.add('link-active-dragging'));
          
          const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          tempPath.setAttribute("class", "temp-drag-line");
          tempPath.setAttribute("d", `M ${startX} ${startY} L ${startX} ${startY}`);
          svgLayer.appendChild(tempPath);
          
          let currentTargetId = null;
          let currentTargetPort = null;
          
          const onMouseMove = (moveEvt) => {
            const rect = treeBoard.getBoundingClientRect();
            const mouseX = (moveEvt.clientX - rect.left) / currentScale;
            const mouseY = (moveEvt.clientY - rect.top) / currentScale;
            
            tempPath.setAttribute("d", `M ${startX} ${startY} L ${mouseX} ${mouseY}`);
            
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            document.querySelectorAll('.connector-line').forEach(l => l.classList.remove('link-target-hover'));
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-target-hover');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-target-hover');
              a.classList.remove('link-hovered-target');
            });
            
            currentTargetId = null;
            currentTargetPort = null;
            
            const snap = findSnappingTarget(mouseX, mouseY, `annot-${annot.id}`);
            
            if (snap) {
              currentTargetId = snap.targetId;
              currentTargetPort = snap.targetPort;
              
              const targetEl = document.getElementById(currentTargetId) || document.getElementById(`card-${currentTargetId}`) || document.getElementById(`annot-${currentTargetId}`);
              if (targetEl) {
                targetEl.classList.add('link-hovered-target');
                const portEl = targetEl.querySelector(`.port-${currentTargetPort}`);
                if (portEl) {
                  portEl.classList.add('port-target-hover');
                }
              }
              
              tempPath.setAttribute("d", `M ${startX} ${startY} L ${snap.targetPt.x} ${snap.targetPt.y}`);
              return;
            }
            
            // Fallback: Check if mouse is hovering over a line
            const hoveredElements = document.elementsFromPoint(moveEvt.clientX, moveEvt.clientY) || [];
            const lineElement = hoveredElements.find(el => el.classList.contains('connector-line') && !el.classList.contains('temp-drag-line'));
            if (lineElement) {
              const parentKey = lineElement.getAttribute('data-parent-key');
              const linkId = lineElement.getAttribute('data-link-id');
              const childId = lineElement.getAttribute('data-child-id');
              
              let targetKey = parentKey || linkId;
              if (!targetKey && childId) {
                const child = db.find(c => c.id === childId);
                if (child && child.parents) {
                  targetKey = [...child.parents].sort().join('+');
                }
              }
              
              if (targetKey) {
                lineElement.classList.add('link-target-hover');
                currentTargetId = targetKey;
                currentTargetPort = null;
                return;
              }
            }
          };
          
          const onMouseUp = (upEvt) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            tempPath.remove();
            
            let finalTargetId = currentTargetId;
            let finalTargetPort = currentTargetPort;
            
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-active-dragging');
              c.classList.remove('link-target-hover');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-active-dragging');
              a.classList.remove('link-target-hover');
              a.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            document.querySelectorAll('.connector-line').forEach(l => l.classList.remove('link-target-hover'));
            
            if (finalTargetId) {
              pushHistoryState();
              customVisualLines.push({
                id: `link-${Date.now()}`,
                from: `annot-${annot.id}`,
                to: finalTargetId,
                fromPort: portName,
                toPort: finalTargetPort
              });
              saveCustomVisualLines();
              drawConnections();
              showToast("시각적 연결선이 생성되었습니다.");
            } else {
              pushHistoryState();
              const newAnnotId = Date.now();
              const dropRect = treeBoard.getBoundingClientRect();
              const dropX = (upEvt.clientX - dropRect.left) / currentScale;
              const dropY = (upEvt.clientY - dropRect.top) / currentScale;
              
              const defaultW = 120;
              const defaultH = 40;
              
              const newAnnot = {
                id: newAnnotId,
                text: "텍스트 입력...",
                x: Math.round(dropX - defaultW / 2),
                y: Math.round(dropY - defaultH / 2),
                width: defaultW,
                height: defaultH,
                color: "#ffffff",
                textColor: "#1f2937",
                fontSize: 14
              };
              
              annotations.push(newAnnot);
              saveAnnotations();
              
              customVisualLines.push({
                id: `link-${Date.now()}`,
                from: `annot-${annot.id}`,
                to: `annot-${newAnnotId}`,
                fromPort: portName,
                toPort: 'top'
              });
              
              saveCustomVisualLines();
              initBoard();
              renderTree();
              
              setTimeout(() => {
                const newEl = document.getElementById(`annot-${newAnnotId}`);
                if (newEl) {
                  const textDisplay = newEl.querySelector('.annot-text');
                  if (textDisplay) textDisplay.click();
                }
              }, 100);
              
              showToast("새 텍스트 상자와 연결되었습니다.");
            }
          };
          
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });
        
        el.appendChild(port);
      });
    }
    
    board.appendChild(el);
  });
  
  // Call renderJunctions at the end of renderAnnotations to keep them in sync
  renderJunctions();
}

function getAllBoardSegments() {
  const segments = [];
  
  // 1. Gather Custom Visual Lines Segments
  customVisualLines.forEach(l => {
    if (!l || !l.from || !l.to) return;
    const start = getElementCenter(l.from);
    const end = getElementCenter(l.to);
    if (!start || !end) return;
    
    const customBends = lineBends[l.id];
    let curX = start.x;
    let curY = start.y;
    if (customBends && customBends.length > 0) {
      customBends.forEach(pt => {
        segments.push({ ax: curX, ay: curY, bx: pt.x, by: pt.y, type: 'custom', id: l.id });
        curX = pt.x;
        curY = pt.y;
      });
      segments.push({ ax: curX, ay: curY, bx: end.x, by: end.y, type: 'custom', id: l.id });
    } else {
      segments.push({ ax: start.x, ay: start.y, bx: end.x, by: end.y, type: 'custom', id: l.id });
    }
  });
  
  // 2. Gather Spouse Connector Lines
  const drawnSpouses = new Set();
  db.forEach(char => {
    if (char.spouses && char.spouses.length > 0) {
      char.spouses.forEach(spouseId => {
        const spousePair = [char.id, spouseId].sort().join('+');
        if (drawnSpouses.has(spousePair)) return;
        drawnSpouses.add(spousePair);
        
        const p1 = coordinates[char.id];
        const p2 = coordinates[spouseId];
        if (!p1 || !p2) return;
        
        const leftNode = p1.x < p2.x ? p1 : p2;
        const rightNode = p1.x < p2.x ? p2 : p1;
        
        const x1 = leftNode.x + (CARD_WIDTH / 2);
        const y1 = leftNode.y;
        const x2 = rightNode.x - (CARD_WIDTH / 2);
        const y2 = rightNode.y;
        
        segments.push({ ax: x1, ay: y1, bx: x2, by: y2, type: 'spouse', id: spousePair });
      });
    }
  });
  
  // 3. Gather Parent-Children lines
  const parentGroups = {};
  db.forEach(char => {
    if (char.parents && char.parents.length > 0) {
      const parentKey = [...char.parents].sort().join('+');
      if (!parentGroups[parentKey]) {
        parentGroups[parentKey] = [];
      }
      parentGroups[parentKey].push(char.id);
    }
  });
  
  Object.keys(parentGroups).forEach(parentKey => {
    const childrenIds = parentGroups[parentKey];
    const parentIds = parentKey.split('+');
    
    let sourceX, sourceY;
    const fatherId = parentIds[0];
    const fatherNode = db.find(c => c.id === fatherId);
    
    if (parentIds.length === 2) {
      const p1 = coordinates[parentIds[0]];
      const p2 = coordinates[parentIds[1]];
      if (!p1 || !p2) return;
      
      const leftNode = p1.x < p2.x ? p1 : p2;
      const rightNode = p1.x < p2.x ? p2 : p1;
      
      const x1 = leftNode.x + (CARD_WIDTH / 2);
      const x2 = rightNode.x - (CARD_WIDTH / 2);
      
      const spousePair = [parentIds[0], parentIds[1]].sort().join('+');
      const ratio = spouseSplits[spousePair] !== undefined ? spouseSplits[spousePair] : 0.5;
      
      sourceX = x1 + (x2 - x1) * ratio;
      sourceY = leftNode.y;
    } else {
      const parentCoord = coordinates[parentIds[0]];
      if (!parentCoord) return;
      sourceX = parentCoord.x;
      sourceY = parentCoord.y + (CARD_HEIGHT / 2);
    }
    
    const validChildrenIds = childrenIds.filter(id => coordinates[id]);
    if (validChildrenIds.length === 0) return;
    
    const parentNode1 = coordinates[parentIds[0]];
    if (!parentNode1) return;
    const parentCenterY = (parentIds.length === 2 && coupleMidpoints[parentKey])
      ? coupleMidpoints[parentKey].y
      : parentNode1.y;
    const ySplit = parentCenterY + styleSettings.splitOffset;
    
    const customBends = lineBends[parentKey];
    
    if (validChildrenIds.length === 1) {
      const childId = validChildrenIds[0];
      const childCoord = coordinates[childId];
      const targetY = childCoord.y - (CARD_HEIGHT / 2);
      const childRelationKey = 'rel-' + parentKey + '->' + childId;
      
      if (customBends && customBends.length > 0) {
        let curX = sourceX;
        let curY = sourceY;
        customBends.forEach(pt => {
          segments.push({ ax: curX, ay: curY, bx: pt.x, by: pt.y, type: 'parent', id: childRelationKey });
          curX = pt.x;
          curY = pt.y;
        });
        segments.push({ ax: curX, ay: curY, bx: childCoord.x, by: targetY, type: 'parent', id: childRelationKey });
      } else {
        segments.push({ ax: sourceX, ay: sourceY, bx: sourceX, by: ySplit, type: 'parent', id: childRelationKey });
        segments.push({ ax: sourceX, ay: ySplit, bx: childCoord.x, by: ySplit, type: 'parent', id: childRelationKey });
        segments.push({ ax: childCoord.x, ay: ySplit, bx: childCoord.x, by: targetY, type: 'parent', id: childRelationKey });
      }
    } else {
      const childCoords = validChildrenIds.map(id => coordinates[id]);
      const minX = Math.min(...childCoords.map(c => c.x));
      const maxX = Math.max(...childCoords.map(c => c.x));
      
      let trunkEndY = ySplit;
      
      if (customBends && customBends.length > 0) {
        let curX = sourceX;
        let curY = sourceY;
        customBends.forEach(pt => {
          segments.push({ ax: curX, ay: curY, bx: pt.x, by: pt.y, type: 'parent', id: parentKey });
          curX = pt.x;
          curY = pt.y;
        });
        trunkEndY = customBends[customBends.length - 1].y;
      } else {
        segments.push({ ax: sourceX, ay: sourceY, bx: sourceX, by: ySplit, type: 'parent', id: parentKey });
      }
      
      segments.push({ ax: minX, ay: trunkEndY, bx: maxX, by: trunkEndY, type: 'parent', id: parentKey });
      
      validChildrenIds.forEach(childId => {
        const childCoord = coordinates[childId];
        const targetY = childCoord.y - (CARD_HEIGHT / 2);
        const childRelationKey = 'rel-' + parentKey + '->' + childId;
        segments.push({ ax: childCoord.x, ay: trunkEndY, bx: childCoord.x, by: targetY, type: 'parent', id: childRelationKey });
      });
    }
  });
  
  return segments;
}

function renderJunctions() {
  // Clear existing canvas junction elements on the board
  document.querySelectorAll('.canvas-junction-node').forEach(el => el.remove());
  
  const board = document.getElementById('tree-board');
  if (!board) return;
  
  canvasJunctions.forEach(jNode => {
    const el = document.createElement('div');
    el.id = jNode.id;
    el.className = `canvas-junction-node ${(selectedJunctionId && String(selectedJunctionId) === String(jNode.id)) ? 'selected-junction' : ''}`;
    el.dataset.x = jNode.x;
    el.dataset.y = jNode.y;
    el.style.width = `${jNode.size || 16}px`;
    el.style.height = `${jNode.size || 16}px`;
    el.title = "연결점 (드래그하여 이동, 클릭하여 선택, Del/Backspace로 삭제)";
    
    // Select on click
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedJunctionId = jNode.id;
      selectedLineKey = null;
      document.querySelectorAll('.canvas-junction-node').forEach(n => n.classList.remove('selected-junction'));
      el.classList.add('selected-junction');
      document.querySelectorAll('.line-highlight').forEach(l => l.classList.remove('line-highlight'));
    });
    
    // Select automatically on hover (mouseenter)
    el.addEventListener('mouseenter', () => {
      if (!isAdminMode) return;
      selectedJunctionId = jNode.id;
      selectedLineKey = null;
      document.querySelectorAll('.canvas-junction-node').forEach(n => n.classList.remove('selected-junction'));
      el.classList.add('selected-junction');
      document.querySelectorAll('.line-highlight').forEach(l => l.classList.remove('line-highlight'));
    });
    
    // Drag to move junction
    el.addEventListener('mousedown', (e) => {
      if (!isAdminMode) return;
      e.stopPropagation();
      
      // Select immediately on mousedown to ensure it takes priority during dragging
      selectedJunctionId = jNode.id;
      selectedLineKey = null;
      document.querySelectorAll('.canvas-junction-node').forEach(n => n.classList.remove('selected-junction'));
      el.classList.add('selected-junction');
      document.querySelectorAll('.line-highlight').forEach(l => l.classList.remove('line-highlight'));
      
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startNodeX = jNode.x;
      const startNodeY = jNode.y;
      
      // Determine if currently docked on a line segment to set as the active rail
      let activeRailSegment = null;
      const allSegments = getAllBoardSegments();
      let minStartDist = Infinity;
      allSegments.forEach(seg => {
        // Skip checking if it is a custom line connected to J itself, as those are not rails to slide on
        const isConnected = seg.type === 'custom' && (customVisualLines.find(l => l && l.id === seg.id && (String(l.from) === String(jNode.id) || String(l.to) === String(jNode.id))));
        if (isConnected) return;
        
        const pt = projectPointOnSegment(jNode.x, jNode.y, seg.ax, seg.ay, seg.bx, seg.by);
        if (!pt) return;
        const dist = Math.hypot(jNode.x - pt.x, jNode.y - pt.y);
        if (dist < 5 && dist < minStartDist) {
          minStartDist = dist;
          activeRailSegment = seg;
        }
      });
      
      const onMouseMove = (moveEvt) => {
        const deltaX = (moveEvt.clientX - startMouseX) / currentScale;
        const deltaY = (moveEvt.clientY - startMouseY) / currentScale;
        
        let newX = startNodeX + deltaX;
        let newY = startNodeY + deltaY;
        
        if (isGridSnapActive) {
          newX = Math.round(newX / 10) * 10;
          newY = Math.round(newY / 10) * 10;
        }
        
        let activeSnapLineId = null;
        let activeSnapPoint = null;
        let activeSnapType = null;
        
        // 1. If currently locked to an active rail, evaluate rail-slide first
        if (activeRailSegment) {
          const pt = projectPointOnSegment(newX, newY, activeRailSegment.ax, activeRailSegment.ay, activeRailSegment.bx, activeRailSegment.by);
          if (pt) {
            const dist = Math.hypot(newX - pt.x, newY - pt.y);
            if (dist < 80) { // Large sticky rail break threshold
              activeSnapLineId = activeRailSegment.id;
              activeSnapPoint = pt;
              activeSnapType = activeRailSegment.type;
            } else {
              // Break rail lock if dragged far away
              activeRailSegment = null;
            }
          } else {
            activeRailSegment = null;
          }
        }
        
        // 2. If no active rail (or broken), scan all segments with 30px snap threshold
        if (!activeSnapPoint) {
          let minLineDist = Infinity;
          const allSegments = getAllBoardSegments();
          
          allSegments.forEach(seg => {
            let pt = null;
            const isConnected = seg.type === 'custom' && (customVisualLines.find(l => l && l.id === seg.id && (String(l.from) === String(jNode.id) || String(l.to) === String(jNode.id))));
            
            if (isConnected) {
              const l = customVisualLines.find(line => line && line.id === seg.id);
              if (!l) return;
              let start = null;
              let end = null;
              
              if (String(l.to) === String(jNode.id)) {
                start = getElementCenter(l.from);
                const companion = customVisualLines.find(c => c && String(c.from) === String(jNode.id) && c.id !== l.id);
                if (companion) end = getElementCenter(companion.to);
              } else if (String(l.from) === String(jNode.id)) {
                end = getElementCenter(l.to);
                const companion = customVisualLines.find(c => c && String(c.to) === String(jNode.id) && c.id !== l.id);
                if (companion) start = getElementCenter(companion.from);
              }
              
              if (start && end) {
                pt = projectPointOnSegment(newX, newY, start.x, start.y, end.x, end.y);
              } else {
                return;
              }
            } else {
              pt = projectPointOnSegment(newX, newY, seg.ax, seg.ay, seg.bx, seg.by);
            }
            
            if (!pt) return;
            const dist = Math.hypot(newX - pt.x, newY - pt.y);
            if (dist < 30 && dist < minLineDist) {
              minLineDist = dist;
              activeSnapLineId = seg.id;
              activeSnapPoint = pt;
              activeSnapType = seg.type;
              activeRailSegment = seg; // Lock to this rail!
            }
          });
        }
        
        const finalX = activeSnapPoint ? activeSnapPoint.x : newX;
        const finalY = activeSnapPoint ? activeSnapPoint.y : newY;
        
        jNode.x = finalX;
        jNode.y = finalY;
        el.style.left = `${finalX}px`;
        el.style.top = `${finalY}px`;
        
        el.setAttribute('data-snap-line-id', activeSnapLineId || '');
        el.setAttribute('data-snap-type', activeSnapType || '');
        if (activeSnapPoint) {
          el.setAttribute('data-snap-x', activeSnapPoint.x);
          el.setAttribute('data-snap-y', activeSnapPoint.y);
          el.style.borderColor = '#ff7800'; // highlight yellow/orange when snapped to a line
        } else {
          el.removeAttribute('data-snap-x');
          el.removeAttribute('data-snap-y');
          el.style.borderColor = ''; // reset border color
        }
        
        // Redraw connections in real-time as the junction node is dragged
        drawConnections();
      };
      
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        
        const snapLineId = el.getAttribute('data-snap-line-id');
        const snapType = el.getAttribute('data-snap-type');
        const snapXStr = el.getAttribute('data-snap-x');
        const snapYStr = el.getAttribute('data-snap-y');
        
        if (snapLineId && snapType === 'custom' && snapXStr && snapYStr) {
          const snapX = parseFloat(snapXStr);
          const snapY = parseFloat(snapYStr);
          
          const targetLine = customVisualLines.find(l => l.id === snapLineId);
          if (targetLine && String(targetLine.from) !== String(jNode.id) && String(targetLine.to) !== String(jNode.id)) {
            pushHistoryState();
            
            const startA = getElementCenter(targetLine.from);
            const endB = getElementCenter(targetLine.to);
            
            if (startA && endB) {
              const portToJunction = getClosestPortOfBox(jNode.id, startA.x, startA.y);
              const portFromJunction = getClosestPortOfBox(jNode.id, endB.x, endB.y);
              
              const line1 = {
                id: `link-${Date.now()}-1`,
                from: targetLine.from,
                to: jNode.id,
                fromPort: targetLine.fromPort,
                toPort: portToJunction,
                style: targetLine.style || 'normal'
              };
              
              const line2 = {
                id: `link-${Date.now()}-2`,
                from: jNode.id,
                to: targetLine.to,
                fromPort: portFromJunction,
                toPort: targetLine.toPort,
                style: targetLine.style || 'normal'
              };
              
              customVisualLines = customVisualLines.filter(l => l.id !== targetLine.id);
              customVisualLines.push(line1, line2);
              
              saveCustomVisualLines();
              showToast("🟢 연결점이 선에 도킹 및 분기 연결되었습니다!");
            }
          }
        }
        
        el.removeAttribute('data-snap-line-id');
        el.removeAttribute('data-snap-type');
        el.removeAttribute('data-snap-x');
        el.removeAttribute('data-snap-y');
        el.style.borderColor = '';
        
        saveCanvasJunctions();
        renderJunctions();
        drawConnections();
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
    
    // Render 4 ports for drag connection
    if (isAdminMode) {
      ['top', 'right', 'bottom', 'left'].forEach(portName => {
        const port = document.createElement('div');
        port.className = `card-link-port port-${portName}`;
        port.title = `드래그하여 연결선 만들기 (${portName})`;
        
        port.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          const ports = getBoxPorts(jNode.id);
          if (!ports || !ports[portName]) return;
          const startPt = ports[portName];
          const startX = startPt.x;
          const startY = startPt.y;
          
          document.querySelectorAll('.person-card').forEach(c => c.classList.add('link-active-dragging'));
          document.querySelectorAll('.canvas-annotation').forEach(a => a.classList.add('link-active-dragging'));
          document.querySelectorAll('.canvas-junction-node').forEach(j => j.classList.add('link-active-dragging'));
          
          const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          tempPath.setAttribute("class", "temp-drag-line");
          tempPath.setAttribute("d", `M ${startX} ${startY} L ${startX} ${startY}`);
          svgLayer.appendChild(tempPath);
          
          let currentTargetId = null;
          let currentTargetPort = null;
          
          const onMouseMove = (moveEvt) => {
            const rect = treeBoard.getBoundingClientRect();
            const mouseX = (moveEvt.clientX - rect.left) / currentScale;
            const mouseY = (moveEvt.clientY - rect.top) / currentScale;
            
            tempPath.setAttribute("d", `M ${startX} ${startY} L ${mouseX} ${mouseY}`);
            
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-target-hover');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-target-hover');
              a.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-junction-node').forEach(j => {
              j.classList.remove('link-hovered-target');
            });
            
            currentTargetId = null;
            currentTargetPort = null;
            
            const snap = findSnappingTarget(mouseX, mouseY, jNode.id);
            
            if (snap) {
              currentTargetId = snap.targetId;
              currentTargetPort = snap.targetPort;
              
              const targetEl = document.getElementById(currentTargetId) || document.getElementById(`card-${currentTargetId}`) || document.getElementById(`annot-${currentTargetId}`);
              if (targetEl) {
                targetEl.classList.add('link-hovered-target');
                const portEl = targetEl.querySelector(`.port-${currentTargetPort}`);
                if (portEl) portEl.classList.add('port-target-hover');
              }
              
              tempPath.setAttribute("d", `M ${startX} ${startY} L ${snap.targetPt.x} ${snap.targetPt.y}`);
            }
          };
          
          const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            tempPath.remove();
            
            let finalTargetId = currentTargetId;
            let finalTargetPort = currentTargetPort;
            
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-active-dragging');
              c.classList.remove('link-target-hover');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-active-dragging');
              a.classList.remove('link-target-hover');
              a.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-junction-node').forEach(j => {
              j.classList.remove('link-active-dragging');
              j.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            
            if (finalTargetId) {
              pushHistoryState();
              customVisualLines.push({
                id: `link-${Date.now()}`,
                from: jNode.id,
                to: finalTargetId,
                fromPort: portName,
                toPort: finalTargetPort
              });
              saveCustomVisualLines();
              drawConnections();
              showToast("시각적 연결선이 생성되었습니다.");
            }
          };
          
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });
        
        el.appendChild(port);
      });
    }
    
    board.appendChild(el);
  });
}

// Ancestor Highlighting Engine
function highlightAncestors(charId) {
  const ancestors = new Set();
  getAncestors(charId, ancestors);
  
  // Activate highlight mode on board
  treeBoard.classList.add('tree-highlight-active');
  
  // Highlight ancestor cards
  ancestors.forEach(id => {
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.classList.add('ancestor-highlight');
    }
  });
  
  // Highlight connector paths
  document.querySelectorAll('.connector-line').forEach(path => {
    const childId = path.getAttribute('data-child-id');
    if (childId && ancestors.has(childId)) {
      path.classList.add('line-highlight');
    }
  });
  
  // Highlight spouse connector paths
  document.querySelectorAll('.spouse-connector').forEach(path => {
    const spouseIdsAttr = path.getAttribute('data-spouse-ids');
    if (spouseIdsAttr) {
      const ids = spouseIdsAttr.split(',');
      if (ids.every(id => ancestors.has(id))) {
        path.classList.add('line-highlight');
      }
    }
  });
}

function clearHighlight() {
  treeBoard.classList.remove('tree-highlight-active');
  document.querySelectorAll('.person-card').forEach(card => {
    card.classList.remove('ancestor-highlight');
  });
  document.querySelectorAll('.connector-line, .spouse-connector').forEach(path => {
    path.classList.remove('line-highlight');
  });
}

function getAncestors(charId, set) {
  if (set.has(charId)) return;
  set.add(charId);
  const char = db.find(c => c.id === charId);
  if (char && char.parents) {
    char.parents.forEach(pId => {
      getAncestors(pId, set);
    });
  }
}

// Load and Apply Style Settings
function initStyleSettings() {
  const savedSettings = localStorage.getItem('bible_tree_style_settings');
  if (savedSettings) {
    try {
      styleSettings = { ...styleSettings, ...JSON.parse(savedSettings) };
      
      // Auto-upgrade / self-heal old faint style settings
      let changed = false;
      if (!styleSettings.lineColor) {
        styleSettings.lineColor = '#94a3b8';
        changed = true;
      }
      if (styleSettings.lineWidth === 2 || typeof styleSettings.lineWidth !== 'number' || isNaN(styleSettings.lineWidth) || styleSettings.lineWidth < 1) {
        styleSettings.lineWidth = 3;
        changed = true;
      }
      if (styleSettings.splitOffset === 45) {
        styleSettings.splitOffset = 90;
        changed = true;
      }
      
      if (changed) {
        saveStyleSettings();
      }
    } catch (e) {
      console.error("Failed to parse style settings. Using defaults.", e);
    }
  }
  applyStyleSettings();
}

function saveStyleSettings() {
  localStorage.setItem('bible_tree_style_settings', JSON.stringify(styleSettings));
}

function applyStyleSettings() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // Theme-aware default color handling
  let activeLineColor = styleSettings.lineColor;
  let activeMainLineColor = styleSettings.mainLineColor;
  let activeSpouseLineColor = styleSettings.spouseLineColor;
  
  if (isDark) {
    if (activeLineColor === '#94a3b8') activeLineColor = '#64748b';
    if (activeMainLineColor === '#ff7800') activeMainLineColor = '#f97316';
    if (activeSpouseLineColor === '#ef4444') activeSpouseLineColor = '#f87171';
  }
  
  // Set CSS Variables on root element
  document.documentElement.style.setProperty('--line-color', activeLineColor);
  document.documentElement.style.setProperty('--line-main-color', activeMainLineColor);
  document.documentElement.style.setProperty('--spouse-line-color', activeSpouseLineColor);
  document.documentElement.style.setProperty('--line-width', `${styleSettings.lineWidth}px`);
  
  // Update inputs values
  inputLineColor.value = styleSettings.lineColor;
  inputMainLineColor.value = styleSettings.mainLineColor;
  inputSpouseLineColor.value = styleSettings.spouseLineColor;
  
  inputLineWidth.value = styleSettings.lineWidth;
  inputCornerRadius.value = styleSettings.cornerRadius;
  inputSplitOffset.value = styleSettings.splitOffset;
  inputLineType.value = styleSettings.lineType;
  if (inputSiblingGap) inputSiblingGap.value = styleSettings.siblingGap !== undefined ? styleSettings.siblingGap : 7;
  
  // Update labels
  labelLineWidth.textContent = `${styleSettings.lineWidth}px`;
  labelCornerRadius.textContent = `${styleSettings.cornerRadius}px`;
  labelSplitOffset.textContent = `${styleSettings.splitOffset}px`;
  if (labelSiblingGap) labelSiblingGap.textContent = `${styleSettings.siblingGap !== undefined ? styleSettings.siblingGap : 7}px`;
}

// Calculate Board Dimensions and Setup Coordinates
function initBoard() {
  if (db.length === 0) return;
  
  // Find min/max generations and columns based on active db
  // to ensure centerX remains consistent for the currently visible cards.
  let minGen = 0;
  let maxGen = 0;
  let minCol = 0;
  let maxCol = 0;
  
  db.forEach(char => {
    if (char.generation > maxGen) maxGen = char.generation;
    if (char.generation < minGen) minGen = char.generation;
    if (char.column > maxCol) maxCol = char.column;
    if (char.column < minCol) minCol = char.column;
  });
  
  // Add safety padding for custom additions/nudges
  minCol -= 5;
  maxCol += 5;
  maxGen += 2;
  
  // Total dimensions
  const totalGens = maxGen - minGen + 1;
  const totalCols = maxCol - minCol + 1;
  
  boardHeight = (totalGens * GEN_HEIGHT) + (BOARD_PADDING_Y * 2);
  boardWidth = (totalCols * COL_WIDTH) + (BOARD_PADDING_X * 2);
  
  // Set dimensions on elements
  treeBoard.style.width = `${boardWidth}px`;
  treeBoard.style.height = `${boardHeight}px`;
  zoomWrapper.style.width = `${boardWidth}px`;
  zoomWrapper.style.height = `${boardHeight}px`;
  
  // Set SVG viewbox and explicit width/height attributes to prevent browser clipping on the right edge
  svgLayer.setAttribute('viewBox', `0 0 ${boardWidth} ${boardHeight}`);
  svgLayer.setAttribute('width', boardWidth);
  svgLayer.setAttribute('height', boardHeight);
  svgLayer.style.width = `${boardWidth}px`;
  svgLayer.style.height = `${boardHeight}px`;
  
  // Center point
  centerX = boardWidth / 2;
  
  // Map coordinates
  coordinates = {};
  db.forEach(char => {
    coordinates[char.id] = {
      x: centerX + (char.column * COL_WIDTH),
      y: BOARD_PADDING_Y + (char.generation * GEN_HEIGHT)
    };
  });
}

// Render Generation Labels, Cards, and SVG lines
function precomputeGroups() {
  for (const key in charGroups) delete charGroups[key];
  
  const roots = {
    cain: ['cain'],
    japheth: ['japheth'],
    ham: ['ham'],
    joktan: ['joktan'],
    keturah: ['zimran', 'jokshan', 'medan', 'midian', 'ishbak', 'shuah'],
    ishmael: ['ishmael'],
    esau: ['esau'],
    north_kings: ['nebat'],
    independent_1chr4: ['chelub_suhah', 'jephunneh', 'jehalelyel', 'ezrah_juda', 'parent_hodiah_wife', 'shimon', 'ishi_1chr4'],
    levite_priests: ['jehoiarib_div', 'abinadab_ark', 'eli_priest'],
    horite_chiefs: ['lotan_chief', 'shobal_chief', 'zibeon_chief', 'anah_chief', 'dishon_chief', 'ezer_chief', 'dishan_chief'],
    reuben_simeon: ['joel_reuben', 'meshobab_simeon'],
    mary: [
      'nathan', 'mattatha', 'menna', 'melea', 'eliakim_luke', 'jonam', 'joseph_luke1', 'judah_luke1',
      'simeon_luke', 'levi_luke1', 'matthat_luke1', 'jorim', 'eliezer_luke', 'joshua_luke', 'er_luke',
      'elmadam', 'cosam', 'addi', 'melchi_luke1', 'neri', 'shealtiel_luke', 'zerubbabel_luke',
      'rhesa', 'joanan', 'joda', 'josech', 'semein', 'mattathias_luke1', 'maath', 'naggai', 'esli',
      'nahum', 'amos', 'mattathias_luke2', 'joseph_luke2', 'jannai', 'melchi_luke2', 'levi_luke2',
      'matthat_luke2', 'heli', 'mary'
    ]
  };
  
  Object.keys(roots).forEach(groupName => {
    const queue = [...roots[groupName]];
    queue.forEach(id => {
      charGroups[id] = groupName;
    });
    
    let index = 0;
    while (index < queue.length) {
      const currentId = queue[index++];
      BIBLE_CHARACTERS.forEach(c => {
        if (c.parents && c.parents.includes(currentId)) {
          if (!queue.includes(c.id)) {
            queue.push(c.id);
            charGroups[c.id] = groupName;
          }
        }
      });
    }
    
    // Also include spouses in the same group
    BIBLE_CHARACTERS.forEach(c => {
      if (queue.includes(c.id)) {
        if (c.spouses) {
          c.spouses.forEach(spId => {
            charGroups[spId] = groupName;
          });
        }
      }
    });
  });
}

function getCharacterGroup(char) {
  if (!char) return null;
  return charGroups[char.id] || null;
}

function applyFilters() {
  initDatabase();
  
  // Filter out characters belonging to hidden lineages
  db = db.filter(char => {
    const group = getCharacterGroup(char);
    if (group === 'cain' && !activeFilters.cain) return false;
    if (group === 'japheth' && !activeFilters.japheth) return false;
    if (group === 'ham' && !activeFilters.ham) return false;
    if (group === 'joktan' && !activeFilters.joktan) return false;
    if (group === 'keturah' && !activeFilters.keturah) return false;
    if (group === 'ishmael' && !activeFilters.ishmael) return false;
    if (group === 'esau' && !activeFilters.esau) return false;
    if (group === 'north_kings' && !activeFilters.north_kings) return false;
    if (group === 'independent_1chr4' && !activeFilters.independent_1chr4) return false;
    if (group === 'levite_priests' && !activeFilters.levite_priests) return false;
    if (group === 'horite_chiefs' && !activeFilters.horite_chiefs) return false;
    if (group === 'reuben_simeon' && !activeFilters.reuben_simeon) return false;
    return true;
  });
  
  initBoard();
  renderTree();
  updateTransform();
}

function setupFilters() {
  const filterPanel = document.getElementById('filter-panel');
  const toggleBtn = document.getElementById('filter-panel-toggle');
  const closeBtn = document.getElementById('filter-panel-close');
  
  // Toggle panel
  toggleBtn.addEventListener('click', () => {
    filterPanel.classList.toggle('active');
  });
  
  closeBtn.addEventListener('click', () => {
    filterPanel.classList.remove('active');
  });
  
  // Load saved filters
  const savedFilters = localStorage.getItem('bible_tree_filters');
  if (savedFilters) {
    try {
      const parsed = JSON.parse(savedFilters);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        activeFilters = parsed;
      }
    } catch (err) {
      console.error("Failed to parse saved filters", err);
    }
  }
  
  // Sync checkboxes
  const groups = ['cain', 'japheth', 'ham', 'joktan', 'keturah', 'ishmael', 'esau', 'north_kings', 'independent_1chr4', 'levite_priests', 'horite_chiefs', 'reuben_simeon'];
  groups.forEach(group => {
    const cb = document.getElementById(`filter-${group}`);
    if (cb) {
      cb.checked = activeFilters[group];
      cb.addEventListener('change', (e) => {
        activeFilters[group] = e.target.checked;
        localStorage.setItem('bible_tree_filters', JSON.stringify(activeFilters));
        applyFilters();
      });
    }
  });
}

function updateTreeLayout() {
  // Update all card positions in the DOM
  db.forEach(c => {
    const cardEl = document.getElementById(`card-${c.id}`);
    if (cardEl) {
      const coords = coordinates[c.id];
      if (coords) {
        cardEl.style.left = `${coords.x - (CARD_WIDTH / 2)}px`;
        cardEl.style.top = `${coords.y - (CARD_HEIGHT / 2)}px`;
      }
    }
  });
  
  // Redraw SVG connections
  svgLayer.innerHTML = '';
  drawConnections();
  
  // Update generation divider top/left (badge position bottom-left of Noah)
  const divider = treeBoard.querySelector('.generation-divider-badge');
  if (divider) {
    const coordsNoah = coordinates['noah'];
    if (coordsNoah) {
      divider.style.left = `${coordsNoah.x - 260}px`;
      divider.style.top = `${coordsNoah.y + 40}px`;
    }
  }
  
  // Re-render family group panels
  treeBoard.querySelectorAll('.family-group-panel').forEach(el => el.remove());
  const groupNames = ['cain', 'japheth', 'ham', 'joktan', 'keturah', 'ishmael', 'esau', 'mary'];
  groupNames.forEach(groupName => {
    const groupChars = db.filter(c => getCharacterGroup(c) === groupName);
    if (groupChars.length === 0) return;
    
    const coordsList = groupChars.map(c => coordinates[c.id]).filter(Boolean);
    if (coordsList.length === 0) return;
    
    const minX = Math.min(...coordsList.map(co => co.x));
    const maxX = Math.max(...coordsList.map(co => co.x));
    const minY = Math.min(...coordsList.map(co => co.y));
    const maxY = Math.max(...coordsList.map(co => co.y));
    
    const padLeftRight = 36;
    const padTopBottom = 30;
    
    const panel = document.createElement('div');
    panel.className = `family-group-panel ${groupName}`;
    panel.style.left = `${minX - (CARD_WIDTH / 2) - padLeftRight}px`;
    panel.style.top = `${minY - (CARD_HEIGHT / 2) - padTopBottom}px`;
    panel.style.width = `${(maxX - minX) + CARD_WIDTH + (padLeftRight * 2)}px`;
    panel.style.height = `${(maxY - minY) + CARD_HEIGHT + (padTopBottom * 2)}px`;
    
    let labelText = '';
    switch(groupName) {
      case 'cain': labelText = '가인 자손 계열'; break;
      case 'japheth': labelText = '야벳 자손 (유럽/북방계 민족)'; break;
      case 'ham': labelText = '함 자손 (가나안/아프리카계 민족)'; break;
      case 'joktan': labelText = '욕단 자손 (아라비아 부족 연합)'; break;
      case 'keturah': labelText = '그두라 자손 (미디안 등 아라비아 부족)'; break;
      case 'ishmael': labelText = '이스마엘 자손 (아라비아 부족)'; break;
      case 'esau': labelText = '에돔 자손 (에서 계열)'; break;
      case 'mary': labelText = '신약/마리아 계열'; break;
    }
    panel.innerHTML = `<span class="group-label">${labelText}</span>`;
    
    const firstCard = treeBoard.querySelector('.person-card');
    if (firstCard) {
      treeBoard.insertBefore(panel, firstCard);
    } else {
      treeBoard.appendChild(panel);
    }
  });
  
  // Re-render annotations
  renderAnnotations();
}

function renderTree() {
  // Clear previous DOM nodes except SVG layer
  treeBoard.querySelectorAll('.person-card').forEach(el => el.remove());
  treeBoard.querySelectorAll('.generation-label').forEach(el => el.remove());
  treeBoard.querySelectorAll('.family-group-panel, .generation-divider-badge').forEach(el => el.remove());
  svgLayer.innerHTML = '';
  
  if (db.length === 0) return;

  // Render Generation Divider Badge at bottom-left of Noah
  const divider = document.createElement('div');
  divider.className = 'generation-divider-badge';
  const coordsNoah = coordinates['noah'];
  let divX, divY;
  if (coordsNoah) {
    divX = coordsNoah.x - 260;
    divY = coordsNoah.y + 40;
  } else {
    divX = centerX - 260;
    divY = BOARD_PADDING_Y + (10 * GEN_HEIGHT) + 40;
  }
  divider.dataset.x = divX;
  divider.dataset.y = divY;
  divider.style.left = `${divX}px`;
  divider.style.top = `${divY}px`;
  divider.innerHTML = '<span>✦ 대홍수 이후 인류의 재분산 및 바벨탑 사건 세대 ✦</span>';
  treeBoard.appendChild(divider);

  // Render Family Group Shaded Background Panels
  const groupNames = ['cain', 'japheth', 'ham', 'joktan', 'keturah', 'ishmael', 'esau', 'mary'];
  groupNames.forEach(groupName => {
    const groupChars = db.filter(c => getCharacterGroup(c) === groupName);
    if (groupChars.length === 0) return;
    
    const coordsList = groupChars.map(c => coordinates[c.id]).filter(Boolean);
    if (coordsList.length === 0) return;
    
    const minX = Math.min(...coordsList.map(co => co.x));
    const maxX = Math.max(...coordsList.map(co => co.x));
    const minY = Math.min(...coordsList.map(co => co.y));
    const maxY = Math.max(...coordsList.map(co => co.y));
    
    const padLeftRight = 36;
    const padTopBottom = 30;
    
    const pX = minX - (CARD_WIDTH / 2) - padLeftRight;
    const pY = minY - (CARD_HEIGHT / 2) - padTopBottom;
    const pW = (maxX - minX) + CARD_WIDTH + (padLeftRight * 2);
    const pH = (maxY - minY) + CARD_HEIGHT + (padTopBottom * 2);
    
    const panel = document.createElement('div');
    panel.className = `family-group-panel ${groupName}`;
    panel.dataset.x = pX;
    panel.dataset.y = pY;
    panel.dataset.w = pW;
    panel.dataset.h = pH;
    
    panel.style.left = `${pX}px`;
    panel.style.top = `${pY}px`;
    panel.style.width = `${pW}px`;
    panel.style.height = `${pH}px`;
    
    // Group Label
    let labelText = '';
    switch(groupName) {
      case 'cain': labelText = '가인 자손 계열'; break;
      case 'japheth': labelText = '야벳 자손 (유럽/북방계 민족)'; break;
      case 'ham': labelText = '함 자손 (가나안/아프리카계 민족)'; break;
      case 'joktan': labelText = '욕단 자손 (아라비아 부족 연합)'; break;
      case 'keturah': labelText = '그두라 자손 (미디안 등 아라비아 부족)'; break;
      case 'ishmael': labelText = '이스마엘 12방백 자손 (아랍 민족)'; break;
      case 'esau': labelText = '에서(에돔) 자손 족장 계열'; break;
      case 'mary': labelText = '마리아 계보 (누가복음 3장 혈통)'; break;
    }
    
    const label = document.createElement('div');
    label.className = 'family-group-label';
    label.textContent = labelText;
    panel.appendChild(label);
    
    treeBoard.appendChild(panel);
  });

  // 1. Render Generation Labels on the left edge
  const maxGen = Math.max(...db.map(c => c.generation));
  for (let g = 0; g <= maxGen; g++) {
    const label = document.createElement('div');
    label.className = 'generation-label';
    label.style.top = `${BOARD_PADDING_Y + (g * GEN_HEIGHT)}px`;
    label.textContent = `${g}대`;
    treeBoard.appendChild(label);
  }

  // 2. Render Cards
  db.forEach(char => {
    const coords = coordinates[char.id];
    if (!coords) return;
    
    const card = document.createElement('div');
    card.id = `card-${char.id}`;
    card.className = `person-card ${char.gender === 'M' ? 'male' : 'female'}`;
    if (char.isMain) {
      card.classList.add('main-line');
    }
    if (isAdminMode) {
      card.classList.add('admin-editable');
      if (selectedPersonIds.has(char.id)) {
        card.classList.add('selected-for-edit');
      }
    }
    
    // Store raw coords in dataset for dynamic scaling and positioning
    card.dataset.x = coords.x;
    card.dataset.y = coords.y;
    
    // Check if notes exist in localStorage
    const hasNote = localStorage.getItem(`bible_tree_note_${char.id}`);
    const noteBadgeHTML = hasNote ? `<div class="card-note-badge" title="메모 있음">📝</div>` : '';
    
    // Render Inner HTML: Centered name, no gender icons, combined English & Description line
    const descText = char.desc ? ` · ${char.desc}` : '';
    const subtitle = `${char.engName}${descText}`;
    
    card.innerHTML = `
      <div class="card-name-row">
        <span class="card-title">${char.name}</span>
      </div>
      <span class="card-eng" title="${char.engName}${char.desc ? ': ' + char.desc : ''}">${subtitle}</span>
      ${noteBadgeHTML}
      <div class="card-edit-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; padding: 6px; box-sizing: border-box; transform: translateZ(0); will-change: transform; pointer-events: none; opacity: 0; transition: opacity 0.2s ease; z-index: 15;">
        <div class="card-edit-overlay-btns">
          <button class="card-edit-btn" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); openAdminForm('${char.id}')" title="상세 정보 수정">✏️</button>
          <button class="card-edit-btn delete" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); deletePersonDirect('${char.id}')" title="인물 삭제">🗑️</button>
        </div>
        <div class="card-nudge-grid">
          <button class="nudge-btn" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); nudgePersonDirect('${char.id}', -0.1, false, false, event ? event.shiftKey : false)" title="왼쪽 Nudge (◀)">◀</button>
          <button class="nudge-btn" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); nudgePersonDirect('${char.id}', -0.1, true, false, event ? event.shiftKey : false)" title="위쪽 Nudge (▲)">▲</button>
          <button class="nudge-btn" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); nudgePersonDirect('${char.id}', 0.1, true, false, event ? event.shiftKey : false)" title="아래쪽 Nudge (▼)">▼</button>
          <button class="nudge-btn" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); nudgePersonDirect('${char.id}', 0.1, false, false, event ? event.shiftKey : false)" title="오른쪽 Nudge (▶)">▶</button>
        </div>
      </div>
    `;
    
    // Drag & Drop functionality for Admin Mode (Mouse & Touch supported)
    if (isAdminMode) {
      let isDragging = false;
      let startX = 0;
      let cardLeft = 0;
      
      let descendantDragData = [];
      
      function startDrag(clientX, e) {
        if (isAddPersonModeActive) return;
        
        e.stopPropagation();
        startX = clientX;
        cardLeft = parseFloat(card.dataset.x) - (CARD_WIDTH / 2);
        isDragging = false;
        
        // Handle selection during drag start
        const isDraggedSelected = selectedPersonIds.has(char.id);
        if (!isDraggedSelected) {
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
            selectedPersonIds.clear();
          }
          selectedPersonIds.add(char.id);
          selectedPersonId = char.id;
          
          document.querySelectorAll('.person-card').forEach(el => el.classList.remove('selected-for-edit'));
          selectedPersonIds.forEach(id => {
            const targetEl = document.getElementById(`card-${id}`);
            if (targetEl) targetEl.classList.add('selected-for-edit');
          });
          updateTransform();
        }
        
        const checkbox = document.getElementById('admin-move-descendants-toggle');
        const moveDescendants = e.shiftKey || (checkbox && checkbox.checked);
        
        descendantDragData = [];
        
        // 1. Gather other selected cards
        const otherSelectedIds = new Set(selectedPersonIds);
        otherSelectedIds.delete(char.id);
        
        otherSelectedIds.forEach(id => {
          const targetCard = document.getElementById(`card-${id}`);
          const targetChar = db.find(c => c.id === id);
          if (targetCard && targetChar) {
            descendantDragData.push({
              id: id,
              element: targetCard,
              char: targetChar,
              startLeft: parseFloat(targetCard.dataset.x) - (CARD_WIDTH / 2)
            });
          }
        });
        
        // 2. Gather descendants of all selected cards
        if (moveDescendants) {
          const descendantIds = new Set();
          selectedPersonIds.forEach(id => {
            const targets = getFamilyTreeTargets(id);
            targets.forEach(tId => {
              if (!selectedPersonIds.has(tId)) {
                descendantIds.add(tId);
              }
            });
          });
          
          descendantIds.forEach(id => {
            const descCard = document.getElementById(`card-${id}`);
            const descChar = db.find(c => c.id === id);
            if (descCard && descChar) {
              descendantDragData.push({
                id: id,
                element: descCard,
                char: descChar,
                startLeft: parseFloat(descCard.dataset.x) - (CARD_WIDTH / 2)
              });
            }
          });
        }
        
        function moveDrag(currentX, moveEvent) {
          moveEvent.stopPropagation();
          const deltaX = currentX - startX;
          if (Math.abs(deltaX) > 4) {
            if (!isDragging) {
              pushHistoryState();
            }
            isDragging = true;
            card.classList.add('dragging');
            descendantDragData.forEach(d => d.element.classList.add('dragging'));
          }
          
          if (isDragging) {
            const scaledDeltaX = deltaX / currentScale;
            const newLeft = cardLeft + scaledDeltaX;
            card.style.left = `${(newLeft + CARD_WIDTH / 2) * currentScale - CARD_WIDTH / 2}px`;
            
            // Real-time coordinates update for connections drawing (unscaled!)
            coordinates[char.id].x = newLeft + (CARD_WIDTH / 2);
            char.column = parseFloat(((newLeft + (CARD_WIDTH / 2) - centerX) / COL_WIDTH).toFixed(3));
            if (scaledDeltaX !== 0) char.isManual = true;
            
            // Parallel move descendants (unscaled coordinates scaled dynamically for DOM style)
            descendantDragData.forEach(data => {
              const newDescLeft = data.startLeft + scaledDeltaX;
              data.element.style.left = `${(newDescLeft + CARD_WIDTH / 2) * currentScale - CARD_WIDTH / 2}px`;
              coordinates[data.id].x = newDescLeft + (CARD_WIDTH / 2);
              data.char.column = parseFloat(((newDescLeft + (CARD_WIDTH / 2) - centerX) / COL_WIDTH).toFixed(3));
              data.char.isManual = true;
            });
            
            drawConnections();
          }
        }
        
        function endDrag(endEvent) {
          endEvent.stopPropagation();
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
          clearHighlight();
          
          if (isDragging) {
            card.classList.remove('dragging');
            descendantDragData.forEach(d => d.element.classList.remove('dragging'));
            
            saveDatabase();
            initBoard();
            renderTree();
            
            // Set flag on card to prevent click trigger
            card.isDraggingFinished = true;
          }
        }
        
        function onMouseMove(moveEvent) {
          moveDrag(moveEvent.clientX, moveEvent);
        }
        function onMouseUp(endEvent) {
          endDrag(endEvent);
        }
        function onTouchMove(moveEvent) {
          if (moveEvent.touches.length > 0) {
            moveDrag(moveEvent.touches[0].clientX, moveEvent);
          }
        }
        function onTouchEnd(endEvent) {
          endDrag(endEvent);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
      }
      
      card.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // left click only
        if (e.target.closest('button')) return;
        e.preventDefault(); // prevent native selection/drag
        startDrag(e.clientX, e);
      });
      
      card.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;
        if (e.touches.length > 0) {
          startDrag(e.touches[0].clientX, e);
        }
      });
    }

    card.addEventListener('mouseenter', () => {
      if (isAdminMode) hoveredPersonId = char.id;
    });
    card.addEventListener('mouseleave', () => {
      if (hoveredPersonId === char.id) hoveredPersonId = null;
    });

    // Highlight ancestors on long press/click-hold
    card.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      if (isAdminMode && !isAddPersonModeActive) return; // let drag listener handle mousedown
      highlightAncestors(char.id);
    });
    card.addEventListener('mouseup', clearHighlight);
    card.addEventListener('mouseleave', clearHighlight);
    
    card.addEventListener('touchstart', (e) => {
      if (e.target.closest('button')) return;
      highlightAncestors(char.id);
    });
    card.addEventListener('touchend', clearHighlight);
    card.addEventListener('touchcancel', clearHighlight);

    // Click action opens study panel or adds a child if in Add Person Mode
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (card.isDraggingFinished) {
        card.isDraggingFinished = false;
        return;
      }
      if (isAddPersonModeActive) {
        deactivateAddPersonMode();
        openAdminFormWithParent(char.id);
      } else {
        if (isAdminMode) {
          const isModifierPressed = e.shiftKey || e.ctrlKey || e.metaKey;
          if (isModifierPressed) {
            if (selectedPersonIds.has(char.id)) {
              selectedPersonIds.delete(char.id);
            } else {
              selectedPersonIds.add(char.id);
            }
            // Set selectedPersonId as the last selected person (or null if empty)
            selectedPersonId = selectedPersonIds.size > 0 ? Array.from(selectedPersonIds)[selectedPersonIds.size - 1] : null;
          } else {
            selectedPersonIds.clear();
            selectedPersonIds.add(char.id);
            selectedPersonId = char.id;
          }
          // Update selected-for-edit classes on cards directly
          document.querySelectorAll('.person-card').forEach(el => {
            const id = el.id.replace('card-', '');
            if (selectedPersonIds.has(id)) {
              el.classList.add('selected-for-edit');
            } else {
              el.classList.remove('selected-for-edit');
            }
          });
          updateTransform();
        }
        openStudyPanel(char.id);
      }
    });
    
    if (isAdminMode) {
      ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(portName => {
        const port = document.createElement('div');
        port.className = `card-link-port port-${portName}`;
        let portTitle = `드래그하여 연결선 만들기 (${portName})`;
        if (portName === 'top') portTitle = "드래그하여 연결선 만들기 (상단 중앙)";
        else if (portName === 'bottom') portTitle = "드래그하여 연결선 만들기 (하단 중앙)";
        else if (portName === 'left') portTitle = "드래그하여 연결선 만들기 (좌측 중앙)";
        else if (portName === 'right') portTitle = "드래그하여 연결선 만들기 (우측 중앙)";
        else if (portName === 'top-left') portTitle = "드래그하여 연결선 만들기 (좌측 상단 모서리)";
        else if (portName === 'top-right') portTitle = "드래그하여 연결선 만들기 (우측 상단 모서리)";
        else if (portName === 'bottom-left') portTitle = "드래그하여 연결선 만들기 (좌측 하단 모서리)";
        else if (portName === 'bottom-right') portTitle = "드래그하여 연결선 만들기 (우측 하단 모서리)";
        port.title = portTitle;
        
        port.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          const ports = getBoxPorts(char.id);
          if (!ports || !ports[portName]) return;
          const startPt = ports[portName];
          const startX = startPt.x;
          const startY = startPt.y;
          
          document.querySelectorAll('.person-card').forEach(c => c.classList.add('link-active-dragging'));
          document.querySelectorAll('.canvas-annotation').forEach(a => a.classList.add('link-active-dragging'));
          
          const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          tempPath.setAttribute("class", "temp-drag-line");
          tempPath.setAttribute("d", `M ${startX} ${startY} L ${startX} ${startY}`);
          svgLayer.appendChild(tempPath);
          
          let currentTargetId = null;
          let currentTargetPort = null;
          
          const onMouseMove = (moveEvt) => {
            const rect = treeBoard.getBoundingClientRect();
            const mouseX = (moveEvt.clientX - rect.left) / currentScale;
            const mouseY = (moveEvt.clientY - rect.top) / currentScale;
            
            tempPath.setAttribute("d", `M ${startX} ${startY} L ${mouseX} ${mouseY}`);
            
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            document.querySelectorAll('.connector-line').forEach(l => l.classList.remove('link-target-hover'));
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-target-hover');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-target-hover');
              a.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-junction-node').forEach(j => {
              j.classList.remove('link-hovered-target');
            });
            
            currentTargetId = null;
            currentTargetPort = null;
            
            const snap = findSnappingTarget(mouseX, mouseY, char.id);
            
            if (snap) {
              currentTargetId = snap.targetId;
              currentTargetPort = snap.targetPort;
              
              const targetEl = document.getElementById(currentTargetId) || document.getElementById(`card-${currentTargetId}`) || document.getElementById(`annot-${currentTargetId}`);
              if (targetEl) {
                targetEl.classList.add('link-hovered-target');
                const portEl = targetEl.querySelector(`.port-${currentTargetPort}`);
                if (portEl) {
                  portEl.classList.add('port-target-hover');
                }
              }
              
              tempPath.setAttribute("d", `M ${startX} ${startY} L ${snap.targetPt.x} ${snap.targetPt.y}`);
              return;
            }
            
            // Fallback: Check if mouse is hovering over a line
            const hoveredElements = document.elementsFromPoint(moveEvt.clientX, moveEvt.clientY) || [];
            const lineElement = hoveredElements.find(el => el.classList.contains('connector-line') && !el.classList.contains('temp-drag-line'));
            if (lineElement) {
              const parentKey = lineElement.getAttribute('data-parent-key');
              const linkId = lineElement.getAttribute('data-link-id');
              const childId = lineElement.getAttribute('data-child-id');
              
              let targetKey = parentKey || linkId;
              if (!targetKey && childId) {
                const child = db.find(c => c.id === childId);
                if (child && child.parents) {
                  targetKey = [...child.parents].sort().join('+');
                }
              }
              
              if (targetKey) {
                lineElement.classList.add('link-target-hover');
                currentTargetId = targetKey;
                currentTargetPort = null;
                return;
              }
            }
          };
          
          const onMouseUp = (upEvt) => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            tempPath.remove();
            
            let finalTargetId = currentTargetId;
            let finalTargetPort = currentTargetPort;
            
            document.querySelectorAll('.person-card').forEach(c => c.classList.remove('link-active-dragging'));
            document.querySelectorAll('.canvas-annotation').forEach(a => a.classList.remove('link-active-dragging'));
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            document.querySelectorAll('.connector-line').forEach(l => l.classList.remove('link-target-hover'));
            document.querySelectorAll('.person-card').forEach(c => c.classList.remove('link-target-hover'));
            document.querySelectorAll('.canvas-annotation').forEach(a => a.classList.remove('link-target-hover'));
            
            if (finalTargetId) {
              pushHistoryState();
              customVisualLines.push({
                id: `link-${Date.now()}`,
                from: char.id,
                to: finalTargetId,
                fromPort: portName,
                toPort: finalTargetPort
              });
              saveCustomVisualLines();
              drawConnections();
              showToast("시각적 연결선이 생성되었습니다.");
            } else {
              pushHistoryState();
              const newAnnotId = Date.now();
              const dropRect = treeBoard.getBoundingClientRect();
              const dropX = (upEvt.clientX - dropRect.left) / currentScale;
              const dropY = (upEvt.clientY - dropRect.top) / currentScale;
              
              const defaultW = 120;
              const defaultH = 40;
              
              const newAnnot = {
                id: newAnnotId,
                text: "텍스트 입력...",
                x: Math.round(dropX - defaultW / 2),
                y: Math.round(dropY - defaultH / 2),
                width: defaultW,
                height: defaultH,
                color: "#ffffff",
                textColor: "#1f2937",
                fontSize: 14
              };
              
              annotations.push(newAnnot);
              saveAnnotations();
              
              customVisualLines.push({
                id: `link-${Date.now()}`,
                from: char.id,
                to: `annot-${newAnnotId}`,
                fromPort: portName,
                toPort: 'top'
              });
              
              saveCustomVisualLines();
              initBoard();
              renderTree();
              
              setTimeout(() => {
                const newEl = document.getElementById(`annot-${newAnnotId}`);
                if (newEl) {
                  const textDisplay = newEl.querySelector('.annot-text');
                  if (textDisplay) textDisplay.click();
                }
              }, 100);
              
              showToast("새 텍스트 상자와 연결되었습니다.");
            }
          };
          
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });
        
        card.appendChild(port);
      });
    }
    
    treeBoard.appendChild(card);
  });
  
  // 3. Draw Connecting Lines
  drawConnections();
  
  // 4. Render Floating Annotation Boxes
  renderAnnotations();

  // 5. Apply scale and pan position to all newly created elements
  updateTransform();
}

// Draw Spouse and Parent-Children Connecting Lines in SVG
function drawConnections() {
  svgLayer.innerHTML = "";
  const svgNS = "http://www.w3.org/2000/svg";
  const spouseCirclesToDraw = [];
  const drawnSpouses = new Set();
  const parentGroups = {};
  
  db.forEach(char => {
    if (char.parents && char.parents.length > 0) {
      const parentKey = [...char.parents].sort().join('+');
      if (!parentGroups[parentKey]) {
        parentGroups[parentKey] = [];
      }
      parentGroups[parentKey].push(char.id);
    }
  });
  
  // Draw Spouse Connections & Gather Couple Midpoints
  coupleMidpoints = {};
  
  db.forEach(char => {
    if (char.spouses && char.spouses.length > 0) {
      char.spouses.forEach(spouseId => {
        const spousePair = [char.id, spouseId].sort().join('+');
        if (drawnSpouses.has(spousePair)) return;
        drawnSpouses.add(spousePair);
        
        const p1 = coordinates[char.id];
        const p2 = coordinates[spouseId];
        if (!p1 || !p2) return;
        
        // Find left and right cards
        const leftNode = p1.x < p2.x ? p1 : p2;
        const rightNode = p1.x < p2.x ? p2 : p1;
        
        // Draw spouse line
        const path = document.createElementNS(svgNS, "path");
        const x1 = leftNode.x + (CARD_WIDTH / 2);
        const y1 = leftNode.y;
        const x2 = rightNode.x - (CARD_WIDTH / 2);
        const y2 = rightNode.y;
        
        const spouseKey = 'spouse-' + spousePair;
        const customBends = lineBends[spouseKey];
        let vertices = [{ x: x1, y: y1 }, ...(customBends || []), { x: x2, y: y2 }];
        let pathD = getRoundedCornersPath(vertices, styleSettings.cornerRadius);
        
        path.setAttribute("d", pathD);
        path.setAttribute("class", `spouse-connector ${selectedLineKey === spouseKey ? 'line-highlight' : ''}`);
        path.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        path.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        svgLayer.appendChild(path);
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.style.pointerEvents = 'stroke';
        helperPath.style.cursor = 'pointer';
        
        helperPath.addEventListener('click', (e) => {
          if (!isAdminMode || !isLineEditModeActive) return;
          e.stopPropagation();
          
          if (selectedLineKey !== spouseKey) {
            selectedLineKey = spouseKey;
            drawConnections();
            return;
          }
          
          const rect = treeBoard.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / currentScale;
          const clickY = (e.clientY - rect.top) / currentScale;
          
          pushHistoryState();
          if (!lineBends[spouseKey]) {
            lineBends[spouseKey] = [];
          }
          lineBends[spouseKey].push({ x: clickX, y: clickY });
          saveLineBends();
          drawConnections();
        });
        
        svgLayer.appendChild(helperPath);
        
        // Midpoint with custom spouse split ratio along the bent path
        const ratio = spouseSplits[spousePair] !== undefined ? spouseSplits[spousePair] : 0.5;
        const midPoint = getPointAlongPath(vertices, ratio);
        
        coupleMidpoints[spousePair] = midPoint;
        
        // Draw spouse node circle
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", midPoint.x);
        circle.setAttribute("cy", midPoint.y);
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "#fff");
        circle.setAttribute("stroke", "var(--spouse-line-color)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "spouse-node-circle");
        
        if (isAdminMode) {
          circle.style.cursor = 'ew-resize';
          circle.setAttribute("r", 7);
          circle.setAttribute("fill", "#10b981"); // Green color for edit handle
          circle.title = "드래그하여 부부 분기선 위치 조절";
          
          circle.addEventListener('mouseenter', () => {
            selectedLineKey = 'spouse-' + spousePair;
            circle.setAttribute("r", 9);
            circle.setAttribute("stroke", "#ff7800");
            circle.setAttribute("stroke-width", "3");
            const pathEl = document.querySelector(`[data-spouse-ids="${char.id},${spouseId}"]`) || document.querySelector(`[data-spouse-ids="${spouseId},${char.id}"]`);
            if (pathEl) {
              pathEl.classList.add('line-highlight');
            }
          });
          
          circle.addEventListener('mouseleave', () => {
            if (selectedLineKey !== 'spouse-' + spousePair) {
              circle.setAttribute("r", 7);
              circle.setAttribute("stroke", "var(--spouse-line-color)");
              circle.setAttribute("stroke-width", "2");
              const pathEl = document.querySelector(`[data-spouse-ids="${char.id},${spouseId}"]`) || document.querySelector(`[data-spouse-ids="${spouseId},${char.id}"]`);
              if (pathEl) {
                pathEl.classList.remove('line-highlight');
              }
            }
          });
          
          circle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            pushHistoryState();
            
            const onMouseMove = (moveEvt) => {
              const rect = treeBoard.getBoundingClientRect();
              const currentMouseX = (moveEvt.clientX - rect.left) / currentScale;
              
              let newRatio = (currentMouseX - x1) / (x2 - x1);
              newRatio = Math.max(0.05, Math.min(0.95, newRatio));
              
              spouseSplits[spousePair] = newRatio;
              
              // Redraw connections in real-time
              drawConnections();
            };
            
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
              saveSpouseSplits();
              drawConnections();
            };
            
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          });
        }
        
        spouseCirclesToDraw.push(circle);
      });
    }
  });
  
  // Draw Parent-Children lines using shared trunk / sibling bar structure to ensure one vertical trunk line
  Object.keys(parentGroups).forEach(parentKey => {
    const childrenIds = parentGroups[parentKey];
    const parentIds = parentKey.split('+');
    
    let sourceX, sourceY;
    let isMainLine = false;
    
    const fatherId = parentIds[0];
    const motherId = parentIds[1];
    
    const fatherNode = db.find(c => c.id === fatherId);
    
    // Determine connection point
    if (parentIds.length === 2 && coupleMidpoints[parentKey]) {
      sourceX = coupleMidpoints[parentKey].x;
      const r = isAdminMode ? 7 : 5;
      sourceY = coupleMidpoints[parentKey].y + r;
      
      const hasMainChild = childrenIds.some(childId => {
        const child = db.find(c => c.id === childId);
        return child && child.isMain;
      });
      if (fatherNode && fatherNode.isMain && hasMainChild) {
        isMainLine = true;
      }
    } else {
      // Single parent recorded
      const parentCoord = coordinates[parentIds[0]];
      if (!parentCoord) return;
      sourceX = parentCoord.x;
      sourceY = parentCoord.y + (CARD_HEIGHT / 2);
      
      const hasMainChild = childrenIds.some(childId => {
        const child = db.find(c => c.id === childId);
        return child && child.isMain;
      });
      if (fatherNode && fatherNode.isMain && hasMainChild) {
        isMainLine = true;
      }
    }
    
    const validChildrenIds = childrenIds.filter(id => coordinates[id]);
    if (validChildrenIds.length === 0) return;
    
    const parentNode1 = coordinates[parentIds[0]];
    if (!parentNode1) return;
    const parentCenterY = (parentIds.length === 2 && coupleMidpoints[parentKey])
      ? coupleMidpoints[parentKey].y
      : parentNode1.y;
    const ySplit = parentCenterY + styleSettings.splitOffset;
    
    // If only one child, draw a single line from source to child card
    if (validChildrenIds.length === 1) {
      const childId = validChildrenIds[0];
      const childCoord = coordinates[childId];
      const child = db.find(c => c.id === childId);
      const isChildMain = isMainLine && child && child.isMain;
      
      const childPath = document.createElementNS(svgNS, "path");
      const targetY = childCoord.y - (CARD_HEIGHT / 2);
      
      const key = 'rel-' + parentKey + '->' + childId;
      const customBends = lineBends[key];
      
      let pathD = "";
      if (customBends && customBends.length > 0) {
        pathD = getCustomOrthogonalPath(sourceX, sourceY, childCoord.x, targetY, customBends);
      } else {
        if (styleSettings.lineType === 'diagonal') {
          pathD = `M ${sourceX} ${sourceY} L ${childCoord.x} ${targetY}`;
        } else {
          pathD = getRoundedOrthogonalPath(sourceX, sourceY, childCoord.x, targetY, ySplit, styleSettings.cornerRadius);
        }
      }
      
      childPath.setAttribute("d", pathD);
      childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${selectedLineKey === key ? 'line-highlight' : ''}`);
      childPath.setAttribute("data-parent-key", parentKey);
      childPath.setAttribute("data-child-id", childId);
      childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
      svgLayer.appendChild(childPath);
      
      // Transparent thick helper path for easy selection
      const helperPath = document.createElementNS(svgNS, "path");
      helperPath.setAttribute("d", pathD);
      helperPath.setAttribute("fill", "none");
      helperPath.setAttribute("stroke", "transparent");
      helperPath.setAttribute("stroke-width", "14");
      helperPath.style.pointerEvents = 'stroke';
      helperPath.style.cursor = 'pointer';
      
      helperPath.addEventListener('click', (e) => {
        if (!isAdminMode || !isLineEditModeActive) return;
        e.stopPropagation();
        
        if (selectedLineKey !== key) {
          selectedLineKey = key;
          drawConnections();
          return;
        }
        
        const rect = treeBoard.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / currentScale;
        const clickY = (e.clientY - rect.top) / currentScale;
        
        pushHistoryState();
        if (!lineBends[key]) {
          lineBends[key] = [];
        }
        lineBends[key].push({ x: clickX, y: clickY });
        saveLineBends();
        drawConnections();
      });
      
      svgLayer.appendChild(helperPath);
    } else {
      // Multiple children: draw individual rounded orthogonal lines to each child
      validChildrenIds.forEach(childId => {
        const childCoord = coordinates[childId];
        const child = db.find(c => c.id === childId);
        const isChildMain = isMainLine && child && child.isMain;
        
        const childTargetY = childCoord.y - (CARD_HEIGHT / 2);
        const childPath = document.createElementNS(svgNS, "path");
        
        const childRelationKey = 'rel-' + parentKey + '->' + childId;
        const customBends = lineBends[childRelationKey] || lineBends[parentKey];
        
        let pathD = "";
        if (customBends && customBends.length > 0) {
          pathD = getCustomOrthogonalPath(sourceX, sourceY, childCoord.x, childTargetY, customBends);
        } else {
          if (styleSettings.lineType === 'diagonal') {
            pathD = `M ${sourceX} ${sourceY} L ${childCoord.x} ${childTargetY}`;
          } else {
            pathD = getRoundedOrthogonalPath(sourceX, sourceY, childCoord.x, childTargetY, ySplit, styleSettings.cornerRadius);
          }
        }
        
        childPath.setAttribute("d", pathD);
        const isSelected = selectedLineKey === childRelationKey;
        childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${isSelected ? 'line-highlight' : ''}`);
        childPath.setAttribute("data-parent-key", parentKey);
        childPath.setAttribute("data-child-id", childId);
        childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        svgLayer.appendChild(childPath);
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.style.pointerEvents = 'stroke';
        helperPath.style.cursor = 'pointer';
        
        helperPath.addEventListener('click', (e) => {
          if (!isAdminMode || !isLineEditModeActive) return;
          e.stopPropagation();
          
          if (selectedLineKey !== childRelationKey) {
            selectedLineKey = childRelationKey;
            drawConnections();
            return;
          }
          
          const rect = treeBoard.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / currentScale;
          const clickY = (e.clientY - rect.top) / currentScale;
          
          pushHistoryState();
          if (!lineBends[childRelationKey]) {
            lineBends[childRelationKey] = lineBends[parentKey] ? JSON.parse(JSON.stringify(lineBends[parentKey])) : [];
          }
          lineBends[childRelationKey].push({ x: clickX, y: clickY });
          saveLineBends();
          drawConnections();
        });
        
        svgLayer.appendChild(helperPath);
      });
    }
  });
  
  // Draw deferred spouse node circles so they render on top of all spouse/parent-child connector lines
  spouseCirclesToDraw.forEach(c => svgLayer.appendChild(c));
  
  // 4. Render Custom Visual Lines (Logos style)
  renderCustomVisualLines(svgNS, true);
  
  // Render bend handles if in Admin Mode
  renderBendHandles();
  
  // Update line editor buttons state
  const clearSelectedBtn = document.getElementById('style-clear-selected-line-btn');
  if (clearSelectedBtn) {
    clearSelectedBtn.disabled = !selectedLineKey;
  }
  const deleteSelectedBtn = document.getElementById('style-delete-selected-line-btn');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.disabled = !selectedLineKey;
  }
}

function renderBendHandles() {
  // Clear existing annotation elements on the board
  document.querySelectorAll('.line-bend-handle').forEach(el => el.remove());
  
  if (!isAdminMode || !selectedLineKey) return;
  
  const points = lineBends[selectedLineKey];
  if (!points) return;
  
  points.forEach((pt, index) => {
    const handle = document.createElement('div');
    handle.className = 'line-bend-handle';
    handle.style.left = `${pt.x}px`;
    handle.style.top = `${pt.y}px`;
    handle.title = "드래그하여 이동, 우클릭 또는 더블클릭하여 삭제";
    
    let dragStartX = 0;
    let dragStartY = 0;
    let originalX = 0;
    let originalY = 0;
    
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      pushHistoryState();
      
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      originalX = pt.x;
      originalY = pt.y;
      
      const onMouseMove = (moveEvt) => {
        const dx = (moveEvt.clientX - dragStartX) / currentScale;
        const dy = (moveEvt.clientY - dragStartY) / currentScale;
        let targetX = originalX + dx;
        let targetY = originalY + dy;
        
        if (isGridSnapActive) {
          const SNAP_GRID = 10;
          targetX = Math.round(targetX / SNAP_GRID) * SNAP_GRID;
          targetY = Math.round(targetY / SNAP_GRID) * SNAP_GRID;
        }
        
        pt.x = targetX;
        pt.y = targetY;
        handle.style.left = `${pt.x}px`;
        handle.style.top = `${pt.y}px`;
        
        // Re-draw connections in real-time (but don't recreate handles while dragging)
        drawConnectionsWithoutRecreatingHandles();
      };
      
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        simplifyBends(selectedLineKey);
        saveLineBends();
        drawConnections(); // full redraw
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
    
    // Helper function to delete point
    const deletePoint = () => {
      pushHistoryState();
      points.splice(index, 1);
      if (points.length === 0) {
        delete lineBends[selectedLineKey];
        selectedLineKey = null;
      }
      saveLineBends();
      drawConnections();
    };
    
    // Click to select the bend point
    handle.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.line-bend-handle').forEach(h => h.classList.remove('selected'));
      handle.classList.add('selected');
    });
    
    // Double click to delete bend point if selected
    handle.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (handle.classList.contains('selected')) {
        deletePoint();
      }
    });
    
    // Right click to delete bend point
    handle.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deletePoint();
    });
    
    treeBoard.appendChild(handle);
  });
}

function simplifyBends(key) {
  const points = lineBends[key];
  if (!points || points.length === 0) return;
  
  // 1. Remove duplicate points
  for (let i = points.length - 1; i > 0; i--) {
    const p1 = points[i];
    const p2 = points[i - 1];
    if (Math.abs(p1.x - p2.x) < 2 && Math.abs(p1.y - p2.y) < 2) {
      points.splice(i, 1);
    }
  }
  
  // 2. Remove collinear points
  for (let i = points.length - 2; i > 0; i--) {
    const prev = points[i - 1];
    const pt = points[i];
    const next = points[i + 1];
    
    const isCollinearX = Math.abs(prev.x - pt.x) < 2 && Math.abs(pt.x - next.x) < 2;
    const isCollinearY = Math.abs(prev.y - pt.y) < 2 && Math.abs(pt.y - next.y) < 2;
    
    if (isCollinearX || isCollinearY) {
      points.splice(i, 1);
    }
  }
  
  if (points.length === 0) {
    delete lineBends[key];
  }
}

// Special lightweight redraw function to prevent handle recreation glitches during drag
function drawConnectionsWithoutRecreatingHandles() {
  const svgNS = "http://www.w3.org/2000/svg";
  const spouseCirclesToDraw = [];
  const drawnSpouses = new Set();
  const parentGroups = {};
  
  db.forEach(char => {
    if (char.parents && char.parents.length > 0) {
      const parentKey = [...char.parents].sort().join('+');
      if (!parentGroups[parentKey]) {
        parentGroups[parentKey] = [];
      }
      parentGroups[parentKey].push(char.id);
    }
  });
  
  // Clear connections from SVG
  svgLayer.innerHTML = "";
  
  coupleMidpoints = {};
  db.forEach(char => {
    if (char.spouses && char.spouses.length > 0) {
      char.spouses.forEach(spouseId => {
        const spousePair = [char.id, spouseId].sort().join('+');
        if (drawnSpouses.has(spousePair)) return;
        drawnSpouses.add(spousePair);
        
        const p1 = coordinates[char.id];
        const p2 = coordinates[spouseId];
        if (!p1 || !p2) return;
        
        const leftNode = p1.x < p2.x ? p1 : p2;
        const rightNode = p1.x < p2.x ? p2 : p1;
        const path = document.createElementNS(svgNS, "path");
        const x1 = leftNode.x + (CARD_WIDTH / 2);
        const y1 = leftNode.y;
        const x2 = rightNode.x - (CARD_WIDTH / 2);
        const y2 = rightNode.y;
        
        const spouseKey = 'spouse-' + spousePair;
        const customBends = lineBends[spouseKey];
        let vertices = [{ x: x1, y: y1 }, ...(customBends || []), { x: x2, y: y2 }];
        let pathD = getRoundedCornersPath(vertices, styleSettings.cornerRadius);
        
        path.setAttribute("d", pathD);
        path.setAttribute("class", `spouse-connector ${selectedLineKey === spouseKey ? 'line-highlight' : ''}`);
        path.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        path.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        svgLayer.appendChild(path);
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.style.pointerEvents = 'stroke';
        helperPath.style.cursor = 'pointer';
        
        helperPath.addEventListener('click', (e) => {
          if (!isAdminMode || !isLineEditModeActive) return;
          e.stopPropagation();
          
          if (selectedLineKey !== spouseKey) {
            selectedLineKey = spouseKey;
            drawConnections();
            return;
          }
          
          const rect = treeBoard.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / currentScale;
          const clickY = (e.clientY - rect.top) / currentScale;
          
          pushHistoryState();
          if (!lineBends[spouseKey]) {
            lineBends[spouseKey] = [];
          }
          lineBends[spouseKey].push({ x: clickX, y: clickY });
          saveLineBends();
          drawConnections();
        });
        
        svgLayer.appendChild(helperPath);
        
        const ratio = spouseSplits[spousePair] !== undefined ? spouseSplits[spousePair] : 0.5;
        const midPoint = getPointAlongPath(vertices, ratio);
        
        coupleMidpoints[spousePair] = midPoint;
        
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", midPoint.x);
        circle.setAttribute("cy", midPoint.y);
        circle.setAttribute("r", isAdminMode ? 7 : 5);
        circle.setAttribute("fill", isAdminMode ? "#10b981" : "#fff");
        circle.setAttribute("stroke", "var(--spouse-line-color)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "spouse-node-circle");
        
        if (isAdminMode) {
          circle.style.cursor = 'ew-resize';
          circle.addEventListener('mouseenter', () => {
            selectedLineKey = 'spouse-' + spousePair;
            circle.setAttribute("r", 9);
            circle.setAttribute("stroke", "#ff7800");
            circle.setAttribute("stroke-width", "3");
            const pathEl = document.querySelector(`[data-spouse-ids="${char.id},${spouseId}"]`) || document.querySelector(`[data-spouse-ids="${spouseId},${char.id}"]`);
            if (pathEl) {
              pathEl.classList.add('line-highlight');
            }
          });
          
          circle.addEventListener('mouseleave', () => {
            if (selectedLineKey !== 'spouse-' + spousePair) {
              circle.setAttribute("r", 7);
              circle.setAttribute("stroke", "var(--spouse-line-color)");
              circle.setAttribute("stroke-width", "2");
              const pathEl = document.querySelector(`[data-spouse-ids="${char.id},${spouseId}"]`) || document.querySelector(`[data-spouse-ids="${spouseId},${char.id}"]`);
              if (pathEl) {
                pathEl.classList.remove('line-highlight');
              }
            }
          });
        }
        
        spouseCirclesToDraw.push(circle);
      });
    }
  });
  
  // Draw Parent-Children lines using shared trunk / sibling bar structure to ensure one vertical trunk line
  Object.keys(parentGroups).forEach(parentKey => {
    const childrenIds = parentGroups[parentKey];
    const parentIds = parentKey.split('+');
    
    let sourceX, sourceY;
    let isMainLine = false;
    
    const fatherId = parentIds[0];
    const fatherNode = db.find(c => c.id === fatherId);
    
    // Determine connection point
    if (parentIds.length === 2 && coupleMidpoints[parentKey]) {
      sourceX = coupleMidpoints[parentKey].x;
      const r = isAdminMode ? 7 : 5;
      sourceY = coupleMidpoints[parentKey].y + r;
      
      const hasMainChild = childrenIds.some(childId => {
        const child = db.find(c => c.id === childId);
        return child && child.isMain;
      });
      if (fatherNode && fatherNode.isMain && hasMainChild) {
        isMainLine = true;
      }
    } else {
      // Single parent recorded
      const parentCoord = coordinates[parentIds[0]];
      if (!parentCoord) return;
      sourceX = parentCoord.x;
      sourceY = parentCoord.y + (CARD_HEIGHT / 2);
      
      const hasMainChild = childrenIds.some(childId => {
        const child = db.find(c => c.id === childId);
        return child && child.isMain;
      });
      if (fatherNode && fatherNode.isMain && hasMainChild) {
        isMainLine = true;
      }
    }
    
    const validChildrenIds = childrenIds.filter(id => coordinates[id]);
    if (validChildrenIds.length === 0) return;
    
    const parentNode1 = coordinates[parentIds[0]];
    if (!parentNode1) return;
    const parentCenterY = (parentIds.length === 2 && coupleMidpoints[parentKey])
      ? coupleMidpoints[parentKey].y
      : parentNode1.y;
    const ySplit = parentCenterY + styleSettings.splitOffset;
    
    // If only one child, draw a single line from source to child card
    if (validChildrenIds.length === 1) {
      const childId = validChildrenIds[0];
      const childCoord = coordinates[childId];
      const child = db.find(c => c.id === childId);
      const isChildMain = isMainLine && child && child.isMain;
      
      const childPath = document.createElementNS(svgNS, "path");
      const targetY = childCoord.y - (CARD_HEIGHT / 2);
      
      const key = 'rel-' + parentKey + '->' + childId;
      const customBends = lineBends[key];
      
      let pathD = "";
      if (customBends && customBends.length > 0) {
        pathD = getCustomOrthogonalPath(sourceX, sourceY, childCoord.x, targetY, customBends);
      } else {
        if (styleSettings.lineType === 'diagonal') {
          pathD = `M ${sourceX} ${sourceY} L ${childCoord.x} ${targetY}`;
        } else {
          pathD = getRoundedOrthogonalPath(sourceX, sourceY, childCoord.x, targetY, ySplit, styleSettings.cornerRadius);
        }
      }
      
      childPath.setAttribute("d", pathD);
      childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${selectedLineKey === key ? 'line-highlight' : ''}`);
      childPath.setAttribute("data-parent-key", parentKey);
      childPath.setAttribute("data-child-id", childId);
      childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
      svgLayer.appendChild(childPath);
      
      // Transparent thick helper path for easy selection
      const helperPath = document.createElementNS(svgNS, "path");
      helperPath.setAttribute("d", pathD);
      helperPath.setAttribute("fill", "none");
      helperPath.setAttribute("stroke", "transparent");
      helperPath.setAttribute("stroke-width", "14");
      helperPath.style.pointerEvents = 'stroke';
      helperPath.style.cursor = 'pointer';
      
      helperPath.addEventListener('click', (e) => {
        if (!isAdminMode || !isLineEditModeActive) return;
        e.stopPropagation();
        
        if (selectedLineKey !== key) {
          selectedLineKey = key;
          drawConnections();
          return;
        }
        
        const rect = treeBoard.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / currentScale;
        const clickY = (e.clientY - rect.top) / currentScale;
        
        pushHistoryState();
        if (!lineBends[key]) {
          lineBends[key] = [];
        }
        lineBends[key].push({ x: clickX, y: clickY });
        saveLineBends();
        drawConnections();
      });
      
      svgLayer.appendChild(helperPath);
    } else {
      // Multiple children: draw individual rounded orthogonal lines to each child
      validChildrenIds.forEach(childId => {
        const childCoord = coordinates[childId];
        const child = db.find(c => c.id === childId);
        const isChildMain = isMainLine && child && child.isMain;
        
        const childTargetY = childCoord.y - (CARD_HEIGHT / 2);
        const childPath = document.createElementNS(svgNS, "path");
        
        const childRelationKey = 'rel-' + parentKey + '->' + childId;
        const customBends = lineBends[childRelationKey] || lineBends[parentKey];
        
        let pathD = "";
        if (customBends && customBends.length > 0) {
          pathD = getCustomOrthogonalPath(sourceX, sourceY, childCoord.x, childTargetY, customBends);
        } else {
          if (styleSettings.lineType === 'diagonal') {
            pathD = `M ${sourceX} ${sourceY} L ${childCoord.x} ${childTargetY}`;
          } else {
            pathD = getRoundedOrthogonalPath(sourceX, sourceY, childCoord.x, childTargetY, ySplit, styleSettings.cornerRadius);
          }
        }
        
        childPath.setAttribute("d", pathD);
        const isSelected = selectedLineKey === childRelationKey;
        childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${isSelected ? 'line-highlight' : ''}`);
        childPath.setAttribute("data-parent-key", parentKey);
        childPath.setAttribute("data-child-id", childId);
        childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        svgLayer.appendChild(childPath);
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.style.pointerEvents = 'stroke';
        helperPath.style.cursor = 'pointer';
        
        helperPath.addEventListener('click', (e) => {
          if (!isAdminMode || !isLineEditModeActive) return;
          e.stopPropagation();
          
          if (selectedLineKey !== childRelationKey) {
            selectedLineKey = childRelationKey;
          } else {
            selectedLineKey = null;
          }
          drawConnections();
        });
        
        svgLayer.appendChild(helperPath);
      });
    }
  });
  
  // Draw deferred spouse node circles so they render on top of all spouse/parent-child connector lines
  spouseCirclesToDraw.forEach(c => svgLayer.appendChild(c));
  
  // Render Custom Visual Lines (Logos style)
  renderCustomVisualLines(svgNS, false);
}

function adjustJunctionIntersection(centerPt, nextPt, radius) {
  if (!centerPt || !nextPt) return centerPt;
  const dx = nextPt.x - centerPt.x;
  const dy = nextPt.y - centerPt.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return centerPt;
  return {
    x: centerPt.x + (dx / len) * radius,
    y: centerPt.y + (dy / len) * radius
  };
}

function renderCustomVisualLines(svgNS, recreateClickListeners) {
  customVisualLines.forEach(line => {
    if (!line || !line.from || !line.to || typeof line.from !== 'string' || typeof line.to !== 'string') return;
    let start = null;
    let end = null;
    
    const isLineTarget = line.to.includes('+') || line.to.startsWith('link-') || db.some(c => c.parents && [...c.parents].sort().join('+') === line.to);
    
    if (isLineTarget) {
      const defaultStart = getElementCenter(line.from);
      if (!defaultStart) return;
      start = defaultStart;
      
      const snapPt = getTargetPoint(start.x, start.y, line.to);
      if (!snapPt) return;
      end = snapPt;
      
      if (line.fromPort) {
        const portStart = getElementPortCoordinates(line.from, line.fromPort);
        if (portStart) {
          start = portStart;
          const reSnap = getTargetPoint(start.x, start.y, line.to);
          if (reSnap) end = reSnap;
        }
      } else {
        const ports = getBoxPorts(line.from);
        if (ports && end) {
          let minD = Infinity;
          let bestPort = ports.bottom;
          ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(k => {
            const p = ports[k];
            if (p) {
              const d = Math.hypot(p.x - end.x, p.y - end.y);
              if (d < minD) {
                minD = d;
                bestPort = p;
              }
            }
          });
          start = bestPort;
          const reSnap = getTargetPoint(start.x, start.y, line.to);
          if (reSnap) end = reSnap;
        }
      }
    } else {
      if (line.fromPort && line.toPort) {
        start = getElementPortCoordinates(line.from, line.fromPort);
        end = getElementPortCoordinates(line.to, line.toPort);
      } else if (line.fromPort && !line.toPort) {
        start = getElementPortCoordinates(line.from, line.fromPort);
        if (start) {
          const targetPorts = getBoxPorts(line.to);
          if (targetPorts) {
            let minD = Infinity;
            ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(k => {
              const p = targetPorts[k];
              if (p) {
                const d = Math.hypot(p.x - start.x, p.y - start.y);
                if (d < minD) {
                  minD = d;
                  end = p;
                }
              }
            });
          } else {
            end = getElementCenter(line.to);
          }
        }
      } else if (!line.fromPort && line.toPort) {
        end = getElementPortCoordinates(line.to, line.toPort);
        if (end) {
          const sourcePorts = getBoxPorts(line.from);
          if (sourcePorts) {
            let minD = Infinity;
            ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(k => {
              const p = sourcePorts[k];
              if (p) {
                const d = Math.hypot(p.x - end.x, p.y - end.y);
                if (d < minD) {
                  minD = d;
                  start = p;
                }
              }
            });
          } else {
            start = getElementCenter(line.from);
          }
        }
      } else {
        const best = getBestPorts(line.from, line.to);
        if (best) {
          start = best.start;
          end = best.end;
        } else {
          start = getElementCenter(line.from);
          end = getElementCenter(line.to);
        }
      }
    }
    
    if (!start || !end) return;
    
    // Adjust start/end coordinates if connected to a junction to connect at the border (prevent overlap)
    const key = line.id;
    const customBends = lineBends[key];
    
    if (isJunctionId(line.from)) {
      const jNode = canvasJunctions.find(n => String(n.id) === String(line.from));
      const r = jNode ? (jNode.size || 16) / 2 : 8;
      const nextPt = (customBends && customBends.length > 0) ? customBends[0] : end;
      start = adjustJunctionIntersection(start, nextPt, r);
    }
    
    if (isJunctionId(line.to)) {
      const jNode = canvasJunctions.find(n => String(n.id) === String(line.to));
      const r = jNode ? (jNode.size || 16) / 2 : 8;
      const prevPt = (customBends && customBends.length > 0) ? customBends[customBends.length - 1] : start;
      end = adjustJunctionIntersection(end, prevPt, r);
    }
    
    let pathD = "";
    if (customBends && customBends.length > 0) {
      let vertices = [start, ...customBends, end];
      pathD = getRoundedCornersPath(vertices, styleSettings.cornerRadius);
    } else {
      const vertices = routeOrthogonal(start, end);
      pathD = getRoundedCornersPath(vertices, styleSettings.cornerRadius);
    }
    
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    const lineStyleClass = line.style === 'main' ? 'line-main' : line.style === 'spouse' ? 'line-spouse' : 'line-normal';
    path.setAttribute("class", `connector-line custom-visual-line ${lineStyleClass} ${selectedLineKey === key ? 'line-highlight' : ''}`);
    path.setAttribute("data-link-id", line.id);
    path.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
    svgLayer.appendChild(path);
    
    // Transparent thick helper path for easy selection
    const helperPath = document.createElementNS(svgNS, "path");
    helperPath.setAttribute("d", pathD);
    helperPath.setAttribute("fill", "none");
    helperPath.setAttribute("stroke", "transparent");
    helperPath.setAttribute("stroke-width", "14");
    helperPath.style.pointerEvents = 'stroke';
    helperPath.style.cursor = 'pointer';
    
    if (recreateClickListeners) {
      helperPath.addEventListener('click', (e) => {
        if (!isAdminMode || !isLineEditModeActive) return;
        e.stopPropagation();
        
        if (selectedLineKey !== key) {
          selectedLineKey = key;
          drawConnections();
          return;
        }
        
        const isModifierPressed = e.shiftKey || e.ctrlKey || e.metaKey;
        
        if (isModifierPressed) {
          const rect = treeBoard.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / currentScale;
          const clickY = (e.clientY - rect.top) / currentScale;
          
          pushHistoryState();
          if (!lineBends[key]) {
            lineBends[key] = [];
          }
          lineBends[key].push({ x: clickX, y: clickY });
          saveLineBends();
          drawConnections();
        } else {
          pushHistoryState();
          if (!line.style || line.style === 'normal') {
            line.style = 'main';
            showToast("메시아 직계선 스타일로 변경되었습니다.");
          } else if (line.style === 'main') {
            line.style = 'spouse';
            showToast("배우자 연결선 스타일로 변경되었습니다.");
          } else {
            line.style = 'normal';
            showToast("일반 연결선 스타일로 변경되었습니다.");
          }
          saveCustomVisualLines();
          drawConnections();
        }
      });
    }
    
    svgLayer.appendChild(helperPath);
    
    // Create drag handles for endpoints of all custom lines in admin edit mode
    if (isAdminMode && isLineEditModeActive) {
      const createHandle = (pt, isStart) => {
        const handle = document.createElementNS(svgNS, "circle");
        handle.setAttribute("cx", pt.x);
        handle.setAttribute("cy", pt.y);
        handle.setAttribute("r", 5);
        handle.setAttribute("class", "line-drag-handle");
        handle.setAttribute("title", isStart ? "연결선 시작점 이동" : "연결선 끝점 이동");
        
        const startPress = (clientX, clientY) => {
          let isDetachedMode = false;
          let activeSnapTarget = null;
          let activeSnapPort = null;
          let activeSnapPt = null;
          
          showToast("연결선 분리를 위해 2초간 꾹 눌러주세요...", 1000);
          handle.classList.add('long-press-waiting');
          
          const longPressTimeout = setTimeout(() => {
            isDetachedMode = true;
            handle.classList.remove('long-press-waiting');
            handle.classList.add('long-press-detached');
            showToast("연결선이 분리되었습니다! 끌어서 다른 박스에 연결하세요.");
            
            document.querySelectorAll('.person-card').forEach(c => c.classList.add('link-active-dragging'));
            document.querySelectorAll('.canvas-annotation').forEach(a => a.classList.add('link-active-dragging'));
          }, 2000);
          
          const moveHandler = (moveX, moveY, rawEvent) => {
            if (!isDetachedMode) {
              const dist = Math.hypot(moveX - clientX, moveY - clientY);
              if (dist > 10) {
                clearTimeout(longPressTimeout);
                handle.classList.remove('long-press-waiting');
              }
              return;
            }
            if (rawEvent) {
              rawEvent.stopPropagation();
              if (rawEvent.cancelable) rawEvent.preventDefault();
            }
            
            const rect = treeBoard.getBoundingClientRect();
            const mouseX = (moveX - rect.left) / currentScale;
            const mouseY_correct = (moveY - rect.top) / currentScale;
            
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-target-hover');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-target-hover');
              a.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-junction-node').forEach(j => {
              j.classList.remove('link-target-hover');
              j.classList.remove('link-hovered-target');
            });
            
            activeSnapTarget = null;
            activeSnapPort = null;
            activeSnapPt = null;
            
            const otherEndId = isStart ? line.to : line.from;
            const snap = findSnappingTarget(mouseX, mouseY_correct, otherEndId);
            
            if (snap) {
              activeSnapTarget = snap.targetId;
              activeSnapPort = snap.targetPort;
              activeSnapPt = snap.targetPt;
              
              const targetEl = document.getElementById(activeSnapTarget) || document.getElementById(`card-${activeSnapTarget}`) || document.getElementById(`annot-${activeSnapTarget}`);
              if (targetEl) {
                targetEl.classList.add('link-hovered-target');
                const portEl = targetEl.querySelector(`.port-${activeSnapPort}`);
                if (portEl) portEl.classList.add('port-target-hover');
              }
            }
            
            const curStart = isStart ? (activeSnapPt || { x: mouseX, y: mouseY_correct }) : start;
            const curEnd = isStart ? end : (activeSnapPt || { x: mouseX, y: mouseY_correct });
            
            let previewPathD = "";
            if (customBends && customBends.length > 0) {
              let vertices = [curStart, ...customBends, curEnd];
              previewPathD = getRoundedCornersPath(vertices, styleSettings.cornerRadius);
            } else {
              const vertices = routeOrthogonal(curStart, curEnd);
              previewPathD = getRoundedCornersPath(vertices, styleSettings.cornerRadius);
            }
            path.setAttribute("d", previewPathD);
            
            handle.setAttribute("cx", isStart ? curStart.x : curEnd.x);
            handle.setAttribute("cy", isStart ? curStart.y : curEnd.y);
          };
          
          const endHandler = () => {
            clearTimeout(longPressTimeout);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            
            handle.classList.remove('long-press-waiting');
            handle.classList.remove('long-press-detached');
            
            document.querySelectorAll('.person-card').forEach(c => {
              c.classList.remove('link-active-dragging');
              c.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-annotation').forEach(a => {
              a.classList.remove('link-active-dragging');
              a.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.canvas-junction-node').forEach(j => {
              j.classList.remove('link-active-dragging');
              j.classList.remove('link-hovered-target');
            });
            document.querySelectorAll('.card-link-port').forEach(p => p.classList.remove('port-target-hover'));
            
            if (isDetachedMode) {
              if (activeSnapTarget) {
                pushHistoryState();
                if (isStart) {
                  line.from = activeSnapTarget;
                  line.fromPort = activeSnapPort;
                } else {
                  line.to = activeSnapTarget;
                  line.toPort = activeSnapPort;
                }
                saveCustomVisualLines();
                showToast("연결선 연결 위치가 성공적으로 이동되었습니다.");
              } else {
                showToast("연결할 포트를 찾지 못해 기존 포트 위치로 복원되었습니다.");
              }
            }
            
            drawConnections();
          };
          
          const onMouseMove = (moveEvt) => {
            moveHandler(moveEvt.clientX, moveEvt.clientY, moveEvt);
          };
          const onMouseUp = () => {
            endHandler();
          };
          const onTouchMove = (moveEvt) => {
            if (moveEvt.touches.length > 0) {
              moveHandler(moveEvt.touches[0].clientX, moveEvt.touches[0].clientY, moveEvt);
            }
          };
          const onTouchEnd = () => {
            endHandler();
          };
          
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
          window.addEventListener('touchmove', onTouchMove, { passive: false });
          window.addEventListener('touchend', onTouchEnd);
        };
        
        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          startPress(e.clientX, e.clientY);
        });
        
        handle.addEventListener('touchstart', (e) => {
          e.stopPropagation();
          if (e.touches.length > 0) {
            startPress(e.touches[0].clientX, e.touches[0].clientY);
          }
        });
        
        svgLayer.appendChild(handle);
      };
      
      createHandle(start, true);
      createHandle(end, false);
    }
  });
}

// Calculate Orthogonal Path with Bezier Rounded Corners
function getRoundedOrthogonalPath(x1, y1, x2, y2, ySplit, radius) {
  // If points are horizontally aligned (straight vertical line)
  if (Math.abs(x1 - x2) < 1) {
    return `M ${x1} ${y1} L ${x1} ${y2}`;
  }
  
  // Clamp radius to fit segment lengths and avoid curve overlap glitches
  const xDiff = Math.abs(x2 - x1);
  const yDiff1 = Math.abs(ySplit - y1);
  const yDiff2 = Math.abs(y2 - ySplit);
  const r = Math.min(radius, xDiff / 2, yDiff1, yDiff2);
  
  // Fallback to sharp corners if space is too constrained
  if (r < 1) {
    return `M ${x1} ${y1} L ${x1} ${ySplit} L ${x2} ${ySplit} L ${x2} ${y2}`;
  }
  
  const dx = x2 > x1 ? 1 : -1;
  const dy = y2 > ySplit ? 1 : -1;
  
  // Path points calculation:
  // Drop vertically -> curve 1 -> horizontal bar -> curve 2 -> drop to child top
  const path = [
    `M ${x1} ${y1}`,
    `L ${x1} ${ySplit - r}`, // Stop before the horizontal bend
    `Q ${x1} ${ySplit} ${x1 + r * dx} ${ySplit}`, // Curve 1 (bends outward to horizontal)
    `L ${x2 - r * dx} ${ySplit}`, // Run along horizontal bar
    `Q ${x2} ${ySplit} ${x2} ${ySplit + r * dy}`, // Curve 2 (bends downward to vertical)
    `L ${x2} ${y2}` // Finish straight drop
  ];
  
  return path.join(' ');
}

function getRoundedCornersPath(vertices, radius) {
  if (vertices.length < 3) {
    let d = `M ${vertices[0].x} ${vertices[0].y}`;
    for (let i = 1; i < vertices.length; i++) {
      d += ` L ${vertices[i].x} ${vertices[i].y}`;
    }
    return d;
  }
  
  let path = [`M ${vertices[0].x} ${vertices[0].y}`];
  
  for (let i = 1; i < vertices.length - 1; i++) {
    const prev = vertices[i - 1];
    const cur = vertices[i];
    const next = vertices[i + 1];
    
    const len1 = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const len2 = Math.hypot(next.x - cur.x, next.y - cur.y);
    
    // Skip tiny segment adjustments to avoid curve glitches
    if (len1 < 1 || len2 < 1) {
      path.push(`L ${cur.x} ${cur.y}`);
      continue;
    }
    
    const r = Math.min(radius, len1 / 2, len2 / 2);
    
    if (r < 1) {
      path.push(`L ${cur.x} ${cur.y}`);
    } else {
      const d1x = (cur.x - prev.x) / len1;
      const d1y = (cur.y - prev.y) / len1;
      const d2x = (next.x - cur.x) / len2;
      const d2y = (next.y - cur.y) / len2;
      
      const p1x = cur.x - r * d1x;
      const p1y = cur.y - r * d1y;
      const p2x = cur.x + r * d2x;
      const p2y = cur.y + r * d2y;
      
      path.push(`L ${p1x} ${p1y}`);
      path.push(`Q ${cur.x} ${cur.y} ${p2x} ${p2y}`);
    }
  }
  
  const last = vertices[vertices.length - 1];
  path.push(`L ${last.x} ${last.y}`);
  
  return path.join(' ');
}

function getPointAlongPath(vertices, ratio) {
  if (!vertices || vertices.length === 0) return { x: 0, y: 0 };
  if (vertices.length === 1) return { x: vertices[0].x, y: vertices[0].y };
  
  let totalLength = 0;
  const lengths = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const dx = vertices[i+1].x - vertices[i].x;
    const dy = vertices[i+1].y - vertices[i].y;
    const len = Math.hypot(dx, dy);
    lengths.push(len);
    totalLength += len;
  }
  
  if (totalLength === 0) return { x: vertices[0].x, y: vertices[0].y };
  
  const targetDist = totalLength * ratio;
  let accumulated = 0;
  for (let i = 0; i < vertices.length - 1; i++) {
    const len = lengths[i];
    if (accumulated + len >= targetDist) {
      const remain = targetDist - accumulated;
      const segRatio = len > 0 ? remain / len : 0;
      const v1 = vertices[i];
      const v2 = vertices[i+1];
      return {
        x: v1.x + (v2.x - v1.x) * segRatio,
        y: v1.y + (v2.y - v1.y) * segRatio
      };
    }
    accumulated += len;
  }
  return { x: vertices[vertices.length - 1].x, y: vertices[vertices.length - 1].y };
}

// Calculate Orthogonal Path through Custom Bend Points maintaining rounded corners
function getCustomOrthogonalPath(x0, y0, x_child, y_child, points) {
  if (!points || points.length === 0) {
    return `M ${x0} ${y0} L ${x_child} ${y_child}`;
  }
  
  let vertices = [{ x: x0, y: y0 }];
  let curX = x0;
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    vertices.push({ x: curX, y: pt.y });
    vertices.push({ x: pt.x, y: pt.y });
    curX = pt.x;
  }
  vertices.push({ x: x_child, y: points[points.length - 1].y });
  vertices.push({ x: x_child, y: y_child });
  
  return getRoundedCornersPath(vertices, styleSettings.cornerRadius);
}

// Setup Zoom and Pan Interaction Handler
function setupZoomPan() {
  document.getElementById('zoom-in').addEventListener('click', () => applyZoom('in'));
  document.getElementById('zoom-out').addEventListener('click', () => applyZoom('out'));
  document.getElementById('zoom-reset').addEventListener('click', () => applyZoom('reset'));
  
  // Prevent any native browser scroll offset shifts inside viewerContainer (e.g. from element focus)
  viewerContainer.addEventListener('scroll', () => {
    viewerContainer.scrollLeft = 0;
    viewerContainer.scrollTop = 0;
  });
  
  // Robust ResizeObserver for page loads, resizes, orientation changes
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        if (!initialCentered) {
          initialCentered = true;
          centerOnNode('adam');
        } else {
          updateTransform();
        }
      }
    }
  });
  resizeObserver.observe(viewerContainer);
  
  // Intercept wheel events: Figma style zoom (with Ctrl Key / trackpad pinch) and panning (without Ctrl)
  viewerContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    if (e.ctrlKey) {
      // Zoom
      const direction = e.deltaY < 0 ? 'in' : 'out';
      let targetScale = currentScale;
      if (direction === 'in') targetScale = Math.min(MAX_SCALE, currentScale + ZOOM_STEP);
      else targetScale = Math.max(MIN_SCALE, currentScale - ZOOM_STEP);
      
      if (targetScale === currentScale) return;
      
      const rect = viewerContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldX = (mouseX - panX) / currentScale;
      const worldY = (mouseY - panY) / currentScale;
      
      currentScale = targetScale;
      zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
      
      panX = mouseX - worldX * currentScale;
      panY = mouseY - worldY * currentScale;
      
      updateTransform();
    } else {
      // Trackpad Swipe/Mouse Scroll panning
      panX -= e.deltaX;
      panY -= e.deltaY;
      updateTransform();
    }
  }, { passive: false });
  
  let startClickX = 0;
  let startClickY = 0;
  viewerContainer.addEventListener('mousedown', (e) => {
    if (e.target.closest('.person-card') || e.target.closest('header') || e.target.closest('#control-panel') || e.target.closest('#search-panel') || e.target.closest('#admin-actions-bar') || e.target.closest('.modal-content') || e.target.closest('#style-editor-panel') || e.target.closest('.canvas-annotation')) return;
    
    // Prevent native selection/drag on background
    e.preventDefault();
    
    startClickX = e.clientX;
    startClickY = e.clientY;
    
    isDragging = true;
    if (!isAddPersonModeActive) {
      viewerContainer.style.cursor = 'grabbing';
    }
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
    viewerContainer.style.cursor = 'grab';
    
    if (activeAnnotationId) {
      activeAnnotationId = null;
      saveAnnotations();
    }
    
    // Resize check: save note sizes on mouseup
    if (isAdminMode) {
      annotations.forEach(annot => {
        const el = document.getElementById(`annot-${annot.id}`);
        if (el) {
          annot.width = el.offsetWidth;
          annot.height = el.offsetHeight;
        }
      });
      saveAnnotations();
    }
  });
  
  // Prevent Chrome native drag/select interference
  viewerContainer.addEventListener('dragstart', (e) => e.preventDefault());
  viewerContainer.addEventListener('selectstart', (e) => e.preventDefault());
  
  viewerContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    viewerContainer.style.cursor = 'grab';
    
    if (activeAnnotationId) {
      activeAnnotationId = null;
      saveAnnotations();
    }
  });
  
  viewerContainer.addEventListener('mousemove', (e) => {
    if (activeAnnotationId) {
      const annot = annotations.find(a => a.id === activeAnnotationId);
      if (annot) {
        const dx = (e.clientX - annotDragStartX) / currentScale;
        const dy = (e.clientY - annotDragStartY) / currentScale;
        annot.x = annotOriginalX + dx;
        annot.y = annotOriginalY + dy;
        const el = document.getElementById(`annot-${annot.id}`);
        if (el) {
          el.style.left = `${annot.x}px`;
          el.style.top = `${annot.y}px`;
        }
      }
      return;
    }
    
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panX = startPanX + dx;
    panY = startPanY + dy;
    updateTransform();
  });
  
  // Mobile Touch Support
  viewerContainer.addEventListener('touchstart', (e) => {
    const rect = viewerContainer.getBoundingClientRect();
    if (e.touches.length === 2) {
      isTouchZooming = true;
      touchStartDistance = getTouchDistance(e.touches[0], e.touches[1]);
      touchStartScale = currentScale;
      touchStartPanX = panX;
      touchStartPanY = panY;
    } else if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startPanX = panX;
      startPanY = panY;
    }
  });
  
  viewerContainer.addEventListener('touchmove', (e) => {
    const rect = viewerContainer.getBoundingClientRect();
    if (isTouchZooming && e.touches.length === 2) {
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / touchStartDistance;
      const targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, touchStartScale * factor));
      
      const touchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const touchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      
      const worldX = (touchCenterX - touchStartPanX) / touchStartScale;
      const worldY = (touchCenterY - touchStartPanY) / touchStartScale;
      
      currentScale = targetScale;
      zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
      
      panX = touchCenterX - worldX * currentScale;
      panY = touchCenterY - worldY * currentScale;
      
      updateTransform();
    } else if (isDragging && e.touches.length === 1) {
      e.preventDefault(); // Stop mobile native elastic scrolling and bounce
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      panX = startPanX + dx;
      panY = startPanY + dy;
      updateTransform();
    }
  });
  
  viewerContainer.addEventListener('touchend', () => {
    isTouchZooming = false;
    isDragging = false;
  });

  viewerContainer.addEventListener('click', (e) => {
    // Ignore click if the user was dragging/panning the board
    const clickDist = Math.sqrt(Math.pow(e.clientX - startClickX, 2) + Math.pow(e.clientY - startClickY, 2));
    if (clickDist > 6) return;

    // If a card or line is selected in Admin Mode, clicking empty space clears it
    const clickedEmptySpace = !e.target.closest('.person-card') && 
                              !e.target.closest('header') && 
                              !e.target.closest('#control-panel') && 
                              !e.target.closest('#search-panel') && 
                              !e.target.closest('#admin-actions-bar') && 
                              !e.target.closest('.modal-content') && 
                              !e.target.closest('#style-editor-panel') && 
                              !e.target.closest('.canvas-annotation') && 
                              !e.target.closest('.canvas-junction-node') &&
                              !e.target.closest('.line-bend-handle') &&
                              !e.target.closest('.spouse-connector') && 
                              !e.target.closest('.connector-line');
                              
    if (clickedEmptySpace && (selectedPersonId || selectedPersonIds.size > 0 || selectedLineKey || selectedJunctionId)) {
      selectedPersonId = null;
      selectedPersonIds.clear();
      selectedLineKey = null;
      selectedJunctionId = null;
      document.querySelectorAll('.canvas-junction-node').forEach(n => n.classList.remove('selected-junction'));
      renderTree();
    }
    
    if (!isAddPersonModeActive) return;
    if (e.target.closest('.person-card') || e.target.closest('header') || e.target.closest('#control-panel') || e.target.closest('#search-panel') || e.target.closest('#admin-actions-bar') || e.target.closest('.modal-content') || e.target.closest('#style-editor-panel') || e.target.closest('.canvas-annotation')) return;
    
    // Only proceed if it was a genuine click, not a drag
    const dist = Math.hypot(e.clientX - startClickX, e.clientY - startClickY);
    if (dist > 5) return;
    
    // Convert click coordinates to world space
    const rect = viewerContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - panX) / currentScale;
    const worldY = (mouseY - panY) / currentScale;
    
    const clickGen = Math.max(0, Math.round((worldY - BOARD_PADDING_Y) / GEN_HEIGHT));
    const clickCol = parseFloat(((worldX - centerX) / COL_WIDTH).toFixed(1));
    
    deactivateAddPersonMode();
    openAdminFormWithCoords(clickGen, clickCol);
  });
}

function getTouchDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function applyZoom(direction) {
  let targetScale = currentScale;
  if (direction === 'in') targetScale = Math.min(MAX_SCALE, currentScale + ZOOM_STEP);
  if (direction === 'out') targetScale = Math.max(MIN_SCALE, currentScale - ZOOM_STEP);
  if (direction === 'reset') targetScale = 1.0;
  
  if (targetScale === currentScale && direction !== 'reset') return;
  
  let containerCenterX = viewerContainer.clientWidth / 2;
  let containerCenterY = viewerContainer.clientHeight / 2;
  
  // Fallback if container is not fully rendered yet
  if (containerCenterX === 0) {
    containerCenterX = window.innerWidth / 2;
    containerCenterY = (window.innerHeight - 80) / 2;
  }
  
  const worldX = (containerCenterX - panX) / currentScale;
  const worldY = (containerCenterY - panY) / currentScale;
  
  currentScale = targetScale;
  zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
  
  if (direction === 'reset') {
    centerOnNode('adam');
  } else {
    panX = containerCenterX - worldX * currentScale;
    panY = containerCenterY - worldY * currentScale;
    updateTransform();
  }
}

function centerOnNode(nodeId) {
  const coords = coordinates[nodeId];
  if (!coords) return;
  
  let containerCenterX = viewerContainer.clientWidth / 2;
  let containerCenterY = viewerContainer.clientHeight / 2;
  
  // Fallback if container is not fully rendered yet
  if (containerCenterX === 0) {
    containerCenterX = window.innerWidth / 2;
    containerCenterY = (window.innerHeight - 80) / 2;
  }
  
  panX = containerCenterX - coords.x * currentScale;
  panY = containerCenterY - coords.y * currentScale;
  
  updateTransform();
}

function updateTransform() {
  // Pan zoomWrapper (No composite scale or zoom, 100% texture safe!)
  zoomWrapper.style.left = `${panX}px`;
  zoomWrapper.style.top = `${panY}px`;
  zoomWrapper.style.transform = 'none';
  zoomWrapper.style.zoom = 'normal';
  
  // Set dimensions on board and wrapper based on scale
  const scaledWidth = boardWidth * currentScale;
  const scaledHeight = boardHeight * currentScale;
  treeBoard.style.width = `${scaledWidth}px`;
  treeBoard.style.height = `${scaledHeight}px`;
  zoomWrapper.style.width = `${scaledWidth}px`;
  zoomWrapper.style.height = `${scaledHeight}px`;
  
  // Update SVG layer size and viewBox (which scales the paths automatically!)
  svgLayer.style.width = `${scaledWidth}px`;
  svgLayer.style.height = `${scaledHeight}px`;
  svgLayer.setAttribute("viewBox", `0 0 ${boardWidth} ${boardHeight}`);
  
  // Scale cards
  const cards = treeBoard.querySelectorAll('.person-card');
  cards.forEach(card => {
    const x = parseFloat(card.dataset.x);
    const y = parseFloat(card.dataset.y);
    card.style.left = `${x * currentScale - CARD_WIDTH / 2}px`;
    card.style.top = `${y * currentScale - CARD_HEIGHT / 2}px`;
    
    // Apply 1.03 selection scale factor dynamically in JavaScript
    const charId = card.id.replace('card-', '');
    const isSelected = selectedPersonIds.has(charId);
    const cardScale = isSelected ? currentScale * 1.03 : currentScale;
    
    card.style.transform = `scale(${cardScale})`;
    card.style.transformOrigin = '50% 50%';
  });
  
  // Scale annotations
  const annots = treeBoard.querySelectorAll('.canvas-annotation');
  annots.forEach(annot => {
    const x = parseFloat(annot.dataset.x);
    const y = parseFloat(annot.dataset.y);
    annot.style.left = `${x * currentScale}px`;
    annot.style.top = `${y * currentScale}px`;
    annot.style.transform = `scale(${currentScale})`;
    annot.style.transformOrigin = '0 0';
  });
  
  // Scale junctions
  const junctions = treeBoard.querySelectorAll('.canvas-junction-node');
  junctions.forEach(j => {
    const x = parseFloat(j.dataset.x);
    const y = parseFloat(j.dataset.y);
    j.style.left = `${x * currentScale}px`;
    j.style.top = `${y * currentScale}px`;
    j.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
    j.style.transformOrigin = '50% 50%';
  });
  
  // Scale family group panels
  const panels = treeBoard.querySelectorAll('.family-group-panel');
  panels.forEach(p => {
    const x = parseFloat(p.dataset.x);
    const y = parseFloat(p.dataset.y);
    const w = parseFloat(p.dataset.w);
    const h = parseFloat(p.dataset.h);
    p.style.left = `${x * currentScale}px`;
    p.style.top = `${y * currentScale}px`;
    p.style.width = `${w}px`;
    p.style.height = `${h}px`;
    p.style.transform = `scale(${currentScale})`;
    p.style.transformOrigin = '0 0';
  });

  // Scale generation divider badges
  const dividers = treeBoard.querySelectorAll('.generation-divider-badge');
  dividers.forEach(div => {
    const x = parseFloat(div.dataset.x);
    const y = parseFloat(div.dataset.y);
    div.style.left = `${x * currentScale}px`;
    div.style.top = `${y * currentScale}px`;
    div.style.transform = `scale(${currentScale})`;
    div.style.transformOrigin = '0 0';
  });

  // Keep generation labels sticky at the left end of the browser viewport
  const labels = treeBoard.querySelectorAll('.generation-label');
  const stickyLeft = -panX + 24;
  labels.forEach(label => {
    label.style.left = `${stickyLeft}px`;
    label.style.transform = `translateY(-50%) scale(${currentScale})`;
    label.style.transformOrigin = '0 50%';
  });
}

// Setup Search
function setupSearch() {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    document.querySelectorAll('.person-card.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
    
    if (!query) return;
    
    const matched = db.find(char => 
      char.name.toLowerCase().includes(query) || 
      char.engName.toLowerCase().includes(query)
    );
    
    if (matched) {
      const card = document.getElementById(`card-${matched.id}`);
      if (card) {
        card.classList.add('highlight');
        centerOnNode(matched.id);
      }
    }
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchInput.blur();
    }
  });
}

// Study Sidebar Panel Note management
function setupStudyPanel() {
  const closeBtn = document.getElementById('panel-close');
  const cancelBtn = document.getElementById('panel-cancel');
  const saveBtn = document.getElementById('panel-save');
  const addResourceBtn = document.getElementById('add-resource-btn');
  const noteTextarea = document.getElementById('note-text');
  
  closeBtn.addEventListener('click', closeStudyPanel);
  cancelBtn.addEventListener('click', closeStudyPanel);
  
  saveBtn.addEventListener('click', () => {
    if (!activePersonId) return;
    
    const noteContent = noteTextarea.value.trim();
    
    if (noteContent) {
      localStorage.setItem(`bible_tree_note_${activePersonId}`, noteContent);
    } else {
      localStorage.removeItem(`bible_tree_note_${activePersonId}`);
    }
    
    const card = document.getElementById(`card-${activePersonId}`);
    if (card) {
      let badge = card.querySelector('.card-note-badge');
      if (noteContent) {
        if (!badge) {
          const body = card.querySelector('.card-body');
          const badgeEl = document.createElement('div');
          badgeEl.className = 'card-note-badge';
          badgeEl.title = '메모 있음';
          badgeEl.textContent = '📝';
          body.appendChild(badgeEl);
        }
      } else {
        if (badge) {
          badge.remove();
        }
      }
    }
    
    closeStudyPanel();
  });
  
  addResourceBtn.addEventListener('click', () => {
    const titleInput = document.getElementById('resource-title');
    const urlInput = document.getElementById('resource-url');
    
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!title || !url) return;
    
    let resources = JSON.parse(localStorage.getItem(`bible_tree_resources_${activePersonId}`)) || [];
    resources.push({ id: Date.now(), title, url });
    
    localStorage.setItem(`bible_tree_resources_${activePersonId}`, JSON.stringify(resources));
    
    titleInput.value = '';
    urlInput.value = '';
    
    renderResourcesList(resources);
  });
}

function openStudyPanel(personId) {
  if (isAdminMode) return; // Prevent study panel from blocking edits in admin mode
  
  activePersonId = personId;
  const char = db.find(c => c.id === personId);
  if (!char) return;
  
  document.getElementById('panel-name').textContent = char.name;
  document.getElementById('panel-eng').textContent = `${char.engName} (${char.gender === 'M' ? '남성' : '여성'}) - 성경 ${char.generation}대손`;
  document.getElementById('panel-desc').textContent = char.desc || '정보가 없습니다.';
  
  const noteTextarea = document.getElementById('note-text');
  const savedNote = localStorage.getItem(`bible_tree_note_${personId}`) || '';
  noteTextarea.value = savedNote;
  
  const resources = JSON.parse(localStorage.getItem(`bible_tree_resources_${personId}`)) || [];
  renderResourcesList(resources);
  
  studyPanel.classList.add('active');
}

function closeStudyPanel() {
  studyPanel.classList.remove('active');
  activePersonId = null;
}

function renderResourcesList(resources) {
  const listElement = document.getElementById('resources-list');
  listElement.innerHTML = '';
  
  if (resources.length === 0) {
    listElement.innerHTML = '<li style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px 0;">등록된 참고 자료가 없습니다.</li>';
    return;
  }
  
  resources.forEach(item => {
    const li = document.createElement('li');
    li.className = 'resource-item';
    li.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
      <button class="delete-resource-btn" data-id="${item.id}">삭제</button>
    `;
    
    li.querySelector('.delete-resource-btn').addEventListener('click', (e) => {
      const idToDelete = parseFloat(e.target.dataset.id);
      let list = JSON.parse(localStorage.getItem(`bible_tree_resources_${activePersonId}`)) || [];
      list = list.filter(r => r.id !== idToDelete);
      localStorage.setItem(`bible_tree_resources_${activePersonId}`, JSON.stringify(list));
      renderResourcesList(list);
    });
    
    listElement.appendChild(li);
  });
}

// Theme Toggle
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('bible_tree_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bible_tree_theme', newTheme);
    updateThemeIcon(newTheme);
    applyStyleSettings();
  });
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function updateStats() {
  const statsSpan = document.getElementById('stats');
  const maleCount = db.filter(c => c.gender === 'M').length;
  const femaleCount = db.filter(c => c.gender === 'F').length;
  
  statsSpan.textContent = `전체 인물: ${db.length}명 (남: ${maleCount}, 여: ${femaleCount})`;
}

// ==========================================
// Admin Mode Logic & CRUD Handlers
// ==========================================

function setupAdminMode() {
  adminLockBtn.addEventListener('click', () => {
    if (isAdminMode) {
      exitAdminMode();
    } else {
      const pw = prompt("관리자 비밀번호를 입력하세요 (기본값: admin):", "");
      if (pw === 'admin') {
        enterAdminMode();
      } else if (pw !== null) {
        alert("비밀번호가 올바르지 않습니다.");
      }
    }
  });

  adminAddBtn.addEventListener('click', () => {
    if (isAddPersonModeActive) {
      deactivateAddPersonMode();
    } else {
      activateAddPersonMode();
    }
  });

  adminAddNoteBtn.addEventListener('click', () => {
    const containerCenterX = viewerContainer.clientWidth / 2;
    const containerCenterY = viewerContainer.clientHeight / 2;
    const worldX = (containerCenterX - panX) / currentScale;
    const worldY = (containerCenterY - panY) / currentScale;
    
    const newNote = {
      id: `note-${Date.now()}`,
      text: "새 텍스트 상자\n(클릭하여 편집)",
      x: Math.round(worldX - 100),
      y: Math.round(worldY - 30),
      width: 200,
      height: 60,
      fontSize: 14,
      bold: false,
      color: "#1e293b",
      bgColor: "#ffffff"
    };
    
    annotations.push(newNote);
    saveAnnotations();
    renderAnnotations();
  });

  if (adminAddLinkBtn) {
    adminAddLinkBtn.addEventListener('click', () => {
      if (isAddLinkModeActive) {
        deactivateAddLinkMode();
      } else {
        activateAddLinkMode();
      }
    });
  }

  if (adminAddJunctionBtn) {
    adminAddJunctionBtn.addEventListener('click', () => {
      const containerCenterX = viewerContainer.clientWidth / 2;
      const containerCenterY = viewerContainer.clientHeight / 2;
      const worldX = (containerCenterX - panX) / currentScale;
      const worldY = (containerCenterY - panY) / currentScale;
      
      pushHistoryState();
      const newJunction = {
        id: `junction-${Date.now()}`,
        x: Math.round(worldX),
        y: Math.round(worldY),
        size: 16
      };
      
      canvasJunctions.push(newJunction);
      saveCanvasJunctions();
      renderJunctions();
      drawConnections();
      showToast("🟢 새 연결점(분기점)이 추가되었습니다.");
    });
  }

  if (adminSaveBtn) {
    adminSaveBtn.addEventListener('click', () => {
      saveDatabase();
      saveLineBends();
      saveCustomVisualLines();
      saveCanvasJunctions();
      saveSpouseSplits();
      saveAnnotations();
      saveStyleSettings();
      showToast("💾 모든 편집 내용이 브라우저에 안전하게 영구 저장되었습니다!");
    });
  }

  adminExportBtn.addEventListener('click', exportDatabaseJSON);

  adminImportBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', importDatabaseJSON);

  adminResetBtn.addEventListener('click', () => {
    if (confirm("정말로 데이터베이스를 초기 상태로 재설정하시겠습니까? 기록한 모든 추가 인물, 메모, 연결선 설정이 제거됩니다.")) {
      localStorage.removeItem('bible_tree_db');
      localStorage.removeItem('bible_tree_custom_characters');
      localStorage.removeItem('bible_tree_character_edits');
      localStorage.removeItem('bible_tree_deleted_ids');
      localStorage.removeItem('bible_tree_line_bends');
      localStorage.removeItem('bible_tree_custom_visual_lines');
      localStorage.removeItem('bible_tree_canvas_junctions');
      localStorage.removeItem('bible_tree_spouse_splits');
      localStorage.removeItem('bible_tree_annotations');
      localStorage.removeItem('bible_tree_style_settings');
      initDatabase();
      initBoard();
      renderTree();
      updateStats();
      exitAdminMode();
      alert("데이터가 성공적으로 초기화되었습니다.");
    }
  });

  modalClose.addEventListener('click', closeAdminForm);
  modalCancel.addEventListener('click', closeAdminForm);
  document.getElementById('modal-cancel').addEventListener('click', closeAdminForm);

  adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAdminForm();
  });

  formDeleteBtn.addEventListener('click', () => {
    deletePerson(editingPersonId);
  });

  const presetChildBtn = document.getElementById('preset-child-btn');
  const presetSpouseBtn = document.getElementById('preset-spouse-btn');

  if (presetChildBtn) {
    presetChildBtn.addEventListener('click', () => {
      if (!activePersonId) return;
      const activeChar = db.find(c => c.id === activePersonId);
      if (!activeChar) return;
      
      const genInput = document.getElementById('form-gen');
      const parentsInput = document.getElementById('form-parents');
      const spousesInput = document.getElementById('form-spouses');
      
      if (genInput) genInput.value = activeChar.generation + 1;
      if (parentsInput) {
        if (activeChar.spouses && activeChar.spouses.length > 0) {
          parentsInput.value = `${activeChar.id}, ${activeChar.spouses[0]}`;
        } else {
          parentsInput.value = activeChar.id;
        }
      }
      if (spousesInput) spousesInput.value = '';
      
      // Auto-calculate column position dynamically
      const autoBtn = document.getElementById('form-col-auto-btn');
      if (autoBtn) autoBtn.click();
    });
  }

  if (presetSpouseBtn) {
    presetSpouseBtn.addEventListener('click', () => {
      if (!activePersonId) return;
      const activeChar = db.find(c => c.id === activePersonId);
      if (!activeChar) return;
      
      const genInput = document.getElementById('form-gen');
      const parentsInput = document.getElementById('form-parents');
      const spousesInput = document.getElementById('form-spouses');
      const genderSelect = document.getElementById('form-gender');
      const colInput = document.getElementById('form-col');
      
      if (genInput) genInput.value = activeChar.generation;
      if (spousesInput) spousesInput.value = activeChar.id;
      if (parentsInput) parentsInput.value = '';
      if (genderSelect) genderSelect.value = activeChar.gender === 'M' ? 'F' : 'M';
      if (colInput) colInput.value = parseFloat((activeChar.column + 1.2).toFixed(3));
    });
  }

  const colAutoBtn = document.getElementById('form-col-auto-btn');
  if (colAutoBtn) {
    colAutoBtn.addEventListener('click', () => {
      const parentsVal = document.getElementById('form-parents').value.trim();
      const parents = parentsVal ? parentsVal.split(',').map(p => p.trim()).filter(p => p.length > 0) : [];
      
      if (parents.length === 0) {
        document.getElementById('form-gen').value = 0;
        document.getElementById('form-col').value = 0;
        return;
      }
      
      const firstParent = db.find(p => p.id === parents[0]);
      if (!firstParent) {
        alert(`부모 ID '${parents[0]}'가 데이터베이스에 존재하지 않습니다.`);
        return;
      }
      
      const targetGen = firstParent.generation + 1;
      document.getElementById('form-gen').value = targetGen;
      
      let parentMidpoint = firstParent.column;
      if (parents.length === 2) {
        const secondParent = db.find(p => p.id === parents[1]);
        if (secondParent) {
          parentMidpoint = (firstParent.column + secondParent.column) / 2;
        }
      }
      
      const siblings = db.filter(c => {
        if (!c.parents || c.parents.length === 0) return false;
        return c.parents.some(p => parents.includes(p)) && c.id !== editingPersonId;
      });
      
      let recommendedCol = parentMidpoint;
      const siblingSpacing = (CARD_WIDTH + styleSettings.siblingGap) / COL_WIDTH;
      if (siblings.length > 0) {
        const rightmostCol = Math.max(...siblings.map(s => s.column));
        recommendedCol = rightmostCol + siblingSpacing;
      } else {
        // If single child, place exactly at midpoint
        recommendedCol = parentMidpoint;
      }
      
      document.getElementById('form-col').value = parseFloat(recommendedCol.toFixed(3));
    });
  }

  // Populate Bible Names Datalist
  const datalist = document.getElementById('bible-names-list');
  if (datalist) {
    datalist.innerHTML = '';
    Object.keys(BIBLE_NAMES_DICTIONARY).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
  }

  // Bind input event to name field to auto-suggest / autofill English Name & ID
  const formNameEl = document.getElementById('form-name');
  if (formNameEl) {
    formNameEl.addEventListener('input', (e) => {
      const typedVal = e.target.value.trim();
      if (BIBLE_NAMES_DICTIONARY[typedVal]) {
        const engName = BIBLE_NAMES_DICTIONARY[typedVal];
        const formEngEl = document.getElementById('form-eng');
        const formIdEl = document.getElementById('form-id');
        
        if (formEngEl) {
          formEngEl.value = engName;
        }
        if (formIdEl && !formIdEl.disabled) {
          formIdEl.value = engName.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }
    });
  }

  setupAutocomplete();
}

function setupAutocomplete() {
  const parentsInput = document.getElementById('form-parents');
  const spousesInput = document.getElementById('form-spouses');
  const parentsSug = document.getElementById('parents-suggestions');
  const spousesSug = document.getElementById('spouses-suggestions');
  
  function handleInput(inputEl, suggestionsEl) {
    inputEl.addEventListener('input', () => {
      const val = inputEl.value;
      const parts = val.split(',');
      const currentTerm = parts[parts.length - 1].trim().toLowerCase();
      
      if (currentTerm.length === 0) {
        suggestionsEl.style.display = 'none';
        return;
      }
      
      const matches = db.filter(c => 
        c.id.toLowerCase().includes(currentTerm) || 
        c.name.toLowerCase().includes(currentTerm)
      ).slice(0, 5);
      
      if (matches.length === 0) {
        suggestionsEl.style.display = 'none';
        return;
      }
      
      suggestionsEl.innerHTML = '';
      matches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `<span>${match.name}</span><span class="sug-id">${match.id}</span>`;
        item.addEventListener('click', () => {
          parts[parts.length - 1] = ` ${match.id}`;
          inputEl.value = parts.join(',').trim();
          suggestionsEl.style.display = 'none';
          inputEl.focus();
        });
        suggestionsEl.appendChild(item);
      });
      suggestionsEl.style.display = 'block';
    });
    
    document.addEventListener('click', (e) => {
      if (e.target !== inputEl && e.target !== suggestionsEl && !suggestionsEl.contains(e.target)) {
        suggestionsEl.style.display = 'none';
      }
    });
  }
  
  if (parentsInput && parentsSug) handleInput(parentsInput, parentsSug);
  if (spousesInput && spousesSug) handleInput(spousesInput, spousesSug);
}

function activateAddPersonMode() {
  isAddPersonModeActive = true;
  adminAddBtn.innerHTML = '❌ 추가 취소';
  adminAddBtn.classList.add('danger');
  viewerContainer.style.cursor = 'cell';
  
  const banner = document.getElementById('add-person-instruction');
  if (banner) banner.style.display = 'flex';
}

function deactivateAddPersonMode() {
  isAddPersonModeActive = false;
  adminAddBtn.innerHTML = '➕ 인물 추가';
  adminAddBtn.classList.remove('danger');
  viewerContainer.style.cursor = 'grab';
  
  const banner = document.getElementById('add-person-instruction');
  if (banner) banner.style.display = 'none';
}

function activateAddLinkMode() {
  isAddLinkModeActive = true;
  linkSourceId = null;
  if (adminAddLinkBtn) {
    adminAddLinkBtn.classList.add('active');
    adminAddLinkBtn.style.background = '#ff7800';
    adminAddLinkBtn.style.color = '#fff';
  }
  showToast("연결선 추가 모드: 연결할 첫 번째 상자(인물 또는 텍스트)를 클릭하세요.");
  
  if (isAddPersonModeActive) deactivateAddPersonMode();
}

function deactivateAddLinkMode() {
  isAddLinkModeActive = false;
  linkSourceId = null;
  if (adminAddLinkBtn) {
    adminAddLinkBtn.classList.remove('active');
    adminAddLinkBtn.style.background = '';
    adminAddLinkBtn.style.color = '';
  }
  document.querySelectorAll('.link-source-highlight').forEach(el => el.classList.remove('link-source-highlight'));
}

function enterAdminMode() {
  isAdminMode = true;
  adminLockBtn.textContent = '🔓';
  adminLockBtn.title = '관리자 편집 모드 잠금';
  adminActionsBar.style.display = 'flex';
  styleEditorToggle.style.display = 'flex';
  
  const lineSec = document.getElementById('line-editor-section');
  if (lineSec) lineSec.style.display = 'block';
  
  treeBoard.classList.add('admin-mode-active');
  closeStudyPanel();
  closeStyleEditorPanel();
  renderTree();
}

function exitAdminMode() {
  isAdminMode = false;
  adminLockBtn.textContent = '🔒';
  adminLockBtn.title = '관리자 편집 모드 해제';
  adminActionsBar.style.display = 'none';
  styleEditorToggle.style.display = 'none';
  
  const lineSec = document.getElementById('line-editor-section');
  if (lineSec) lineSec.style.display = 'none';
  selectedLineKey = null;
  
  deactivateAddPersonMode();
  deactivateAddLinkMode();
  
  treeBoard.classList.remove('admin-mode-active');
  closeStyleEditorPanel();
  renderTree();
}

function openAdminForm(personId) {
  editingPersonId = personId;
  const formEl = document.getElementById('admin-form');
  if (formEl) formEl.reset();
  
  const idInput = document.getElementById('form-id');
  const modalTitleEl = document.getElementById('modal-title');
  const formDeleteBtnEl = document.getElementById('form-delete-btn');
  const modalEl = document.getElementById('admin-modal');
  
  const presetContainer = document.getElementById('relation-presets-container');
  
  if (personId) {
    if (presetContainer) presetContainer.style.display = 'none';
    if (modalTitleEl) modalTitleEl.textContent = "인물 정보 수정";
    if (idInput) idInput.disabled = true;
    if (formDeleteBtnEl) formDeleteBtnEl.style.display = 'inline-block';
    
    const char = db.find(c => c.id === personId);
    if (char) {
      if (idInput) idInput.value = char.id;
      const nameInput = document.getElementById('form-name');
      if (nameInput) nameInput.value = char.name;
      const engInput = document.getElementById('form-eng');
      if (engInput) engInput.value = char.engName || '';
      const genderSelect = document.getElementById('form-gender');
      if (genderSelect) genderSelect.value = char.gender;
      const genInput = document.getElementById('form-gen');
      if (genInput) genInput.value = char.generation;
      const colInput = document.getElementById('form-col');
      if (colInput) colInput.value = char.column;
      const parentsInput = document.getElementById('form-parents');
      if (parentsInput) parentsInput.value = char.parents ? char.parents.join(', ') : '';
      const spousesInput = document.getElementById('form-spouses');
      if (spousesInput) spousesInput.value = char.spouses ? char.spouses.join(', ') : '';
      const descInput = document.getElementById('form-desc');
      if (descInput) descInput.value = char.desc || '';
      const mainCheckbox = document.getElementById('form-main');
      if (mainCheckbox) mainCheckbox.checked = !!char.isMain;
    }
  } else {
    if (activePersonId) {
      const activeChar = db.find(c => c.id === activePersonId);
      if (activeChar && presetContainer) {
        presetContainer.style.display = 'flex';
        const targetNameEl = document.getElementById('relation-target-name');
        if (targetNameEl) targetNameEl.textContent = `${activeChar.name} (${activeChar.id})`;
      } else if (presetContainer) {
        presetContainer.style.display = 'none';
      }
    } else if (presetContainer) {
      presetContainer.style.display = 'none';
    }
    
    if (modalTitleEl) modalTitleEl.textContent = "새 인물 추가";
    if (idInput) idInput.disabled = false;
    if (formDeleteBtnEl) formDeleteBtnEl.style.display = 'none';
    
    const genInput = document.getElementById('form-gen');
    if (genInput) genInput.value = 0;
    const colInput = document.getElementById('form-col');
    if (colInput) colInput.value = 0;
  }
  
  if (modalEl) modalEl.style.display = 'flex';
}

function openAdminFormWithParent(parentId) {
  openAdminForm(null);
  const parentChar = db.find(c => c.id === parentId);
  if (!parentChar) return;
  
  const genInput = document.getElementById('form-gen');
  const parentsInput = document.getElementById('form-parents');
  
  if (genInput) genInput.value = parentChar.generation + 1;
  if (parentsInput) {
    if (parentChar.spouses && parentChar.spouses.length > 0) {
      parentsInput.value = `${parentChar.id}, ${parentChar.spouses[0]}`;
    } else {
      parentsInput.value = parentChar.id;
    }
  }
  
  // Auto-calculate column position dynamically
  const autoBtn = document.getElementById('form-col-auto-btn');
  if (autoBtn) autoBtn.click();
}

function openAdminFormWithCoords(gen, col) {
  openAdminForm(null);
  const genInput = document.getElementById('form-gen');
  const colInput = document.getElementById('form-col');
  if (genInput) genInput.value = gen;
  if (colInput) colInput.value = col;
}

function closeAdminForm() {
  const modalEl = document.getElementById('admin-modal');
  if (modalEl) modalEl.style.display = 'none';
  editingPersonId = null;
}

function saveAdminForm() {
  const id = document.getElementById('form-id').value.trim();
  const name = document.getElementById('form-name').value.trim();
  const engName = document.getElementById('form-eng').value.trim();
  const gender = document.getElementById('form-gender').value;
  const generation = parseInt(document.getElementById('form-gen').value);
  const rawColumn = parseFloat(document.getElementById('form-col').value);
  const parentsInput = document.getElementById('form-parents').value.trim();
  const spousesInput = document.getElementById('form-spouses').value.trim();
  const desc = document.getElementById('form-desc').value.trim();
  const isMain = document.getElementById('form-main').checked;
  const column = (isMain && gender === 'M') ? 0.0 : rawColumn;
  
  const parents = parentsInput ? parentsInput.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  const spouses = spousesInput ? spousesInput.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  
  const idRegex = /^[a-zA-Z0-9_\-]+$/;
  if (!idRegex.test(id)) {
    alert("ID는 영문자, 숫자, 언더바(_), 하이픈(-)만 가능하며 공백을 포함할 수 없습니다.");
    return;
  }
  
  for (let pId of parents) {
    if (!db.some(c => c.id === pId)) {
      alert(`부모 ID '${pId}'가 데이터베이스에 존재하지 않습니다.`);
      return;
    }
  }
  if (parents.length > 2) {
    alert("부모는 최대 2명(아버지와 어머니)까지만 등록할 수 있습니다.");
    return;
  }
  
  for (let sId of spouses) {
    if (!db.some(c => c.id === sId)) {
      alert(`배우자 ID '${sId}'가 데이터베이스에 존재하지 않습니다.`);
      return;
    }
  }
  

  pushHistoryState();
  if (editingPersonId) {
    const index = db.findIndex(c => c.id === editingPersonId);
    if (index !== -1) {
      const oldSpouses = db[index].spouses || [];
      
      db[index] = {
        id: editingPersonId,
        name,
        engName,
        gender,
        generation,
        column,
        parents,
        spouses,
        desc,
        isMain,
        isManual: true
      };
      
      oldSpouses.forEach(oldSpouseId => {
        if (!spouses.includes(oldSpouseId)) {
          const spNode = db.find(c => c.id === oldSpouseId);
          if (spNode && spNode.spouses) {
            spNode.spouses = spNode.spouses.filter(id => id !== editingPersonId);
          }
        }
      });
      
      spouses.forEach(newSpouseId => {
        const spNode = db.find(c => c.id === newSpouseId);
        if (spNode) {
          if (!spNode.spouses) spNode.spouses = [];
          if (!spNode.spouses.includes(editingPersonId)) {
            spNode.spouses.push(editingPersonId);
          }
        }
      });
    }
  } else {
    if (db.some(c => c.id === id)) {
      alert(`동일한 ID '${id}'를 가진 인물이 이미 존재합니다. 다른 영문 고유 ID를 부여하세요.`);
      return;
    }
    
    const newPerson = {
      id,
      name,
      engName,
      gender,
      generation,
      column,
      parents,
      spouses,
      desc,
      isMain,
      isManual: true
    };
    
    db.push(newPerson);
    
    spouses.forEach(spId => {
      const spNode = db.find(c => c.id === spId);
      if (spNode) {
        if (!spNode.spouses) spNode.spouses = [];
        if (!spNode.spouses.includes(id)) {
          spNode.spouses.push(id);
        }
      }
    });
  }
  
  saveDatabase();
  initBoard();
  renderTree();
  updateStats();
  closeAdminForm();
}

function deletePerson(personId) {
  if (!confirm(`정말로 '${personId}' 인물을 삭제하시겠습니까?\n이 인물과 관련된 모든 부모/배우자 관계 선도 끊어집니다.`)) {
    return;
  }
  
  pushHistoryState();
  const person = db.find(c => c.id === personId);
  const generation = person ? person.generation : null;

  db = db.filter(c => c.id !== personId);
  
  db.forEach(char => {
    if (char.parents) {
      char.parents = char.parents.filter(id => id !== personId);
    }
    if (char.spouses) {
      char.spouses = char.spouses.filter(id => id !== personId);
    }
  });
  
  localStorage.removeItem(`bible_tree_note_${personId}`);
  localStorage.removeItem(`bible_tree_resources_${personId}`);
  
  customVisualLines = customVisualLines.filter(l => l.from !== personId && l.to !== personId);
  saveCustomVisualLines();
  
  // Clean up lineBends keys that contain the deleted personId
  let bendsChanged = false;
  Object.keys(lineBends).forEach(key => {
    if (key.includes(personId)) {
      delete lineBends[key];
      bendsChanged = true;
    }
  });
  if (bendsChanged) {
    saveLineBends();
  }
  
  saveDatabase();
  initBoard();
  renderTree();
  updateStats();
  closeAdminForm();
}

function rebuildAllLayouts() {
  const maxGen = Math.max(...db.map(c => c.generation), 0);
  for (let g = 0; g <= maxGen; g++) {
    rebuildGenerationLayout(g);
  }
  centerParentsBottomUp();
  for (let g = 0; g <= maxGen; g++) {
    rebuildGenerationLayout(g);
  }
}

function rebuildGenerationLayout(gen) {
  const genChars = db.filter(c => c.generation === gen);
  if (genChars.length === 0) return;
  
  // 1. Group characters by parent key
  const groups = {};
  genChars.forEach(char => {
    const parentKey = char.parents && char.parents.length > 0
      ? [...char.parents].sort().join('+')
      : `unconnected_${char.id}`;
      
    if (!groups[parentKey]) {
      groups[parentKey] = {
        key: parentKey,
        children: [],
        parentCol: 0,
        isMain: false
      };
    }
    groups[parentKey].children.push(char);
    if (char.isMain) {
      groups[parentKey].isMain = true;
    }
  });
  
  // 2. Calculate parent midpoint X position for each group
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    if (key.startsWith('unconnected_')) {
      group.parentCol = group.children[0].column;
    } else {
      const parentIds = key.split('+');
      const firstParent = db.find(p => p.id === parentIds[0]);
      if (firstParent) {
        let parentCol = firstParent.column;
        if (parentIds.length === 2) {
          const secondParent = db.find(p => p.id === parentIds[1]);
          if (secondParent) {
            parentCol = (firstParent.column + secondParent.column) / 2;
          }
        }
        group.parentCol = parentCol;
      }
    }
  });
  
  // 3. Sort parent groups by their parentCol
  const sortedGroups = Object.values(groups).sort((a, b) => a.parentCol - b.parentCol);
  
  const siblingSpacing = (CARD_WIDTH + styleSettings.siblingGap) / COL_WIDTH;
  const gap = siblingSpacing + (36 / COL_WIDTH); // Sibling spacing + 36px family group separation
  
  // 4. Resolve overlaps within each group (spacing siblings at least siblingSpacing units apart)
  sortedGroups.forEach(group => {
    // Sort children inside the group: keep current horizontal order
    group.children.sort((a, b) => a.column - b.column);
    
    // Ensure siblings are spaced by at least siblingSpacing units, preserving relative custom offsets
    for (let i = 1; i < group.children.length; i++) {
      const prev = group.children[i - 1];
      const curr = group.children[i];
      if (curr.isManual) continue;
      if (curr.column < prev.column + siblingSpacing) {
        curr.column = parseFloat((prev.column + siblingSpacing).toFixed(3));
      }
    }
  });
  
  // 5. Overlap resolution outward from the main line group (spacing groups at least gap units apart)
  const mainGroupIdx = sortedGroups.findIndex(g => g.isMain);
  const anchorIdx = mainGroupIdx !== -1 ? mainGroupIdx : Math.floor(sortedGroups.length / 2);
  
  // Resolve rightward from anchor
  for (let i = anchorIdx + 1; i < sortedGroups.length; i++) {
    const prevGroup = sortedGroups[i - 1];
    const currGroup = sortedGroups[i];
    
    const prevNonManual = prevGroup.children.filter(c => !c.isManual);
    const prevMax = prevNonManual.length > 0 ? Math.max(...prevNonManual.map(c => c.column)) : -Infinity;
    
    const currNonManual = currGroup.children.filter(c => !c.isManual);
    const currMin = currNonManual.length > 0 ? Math.min(...currNonManual.map(c => c.column)) : Infinity;
    
    if (currMin < prevMax + gap && currMin !== Infinity && prevMax !== -Infinity) {
      const shift = (prevMax + gap) - currMin;
      currGroup.children.forEach(c => {
        if (!c.isManual) {
          c.column = parseFloat((c.column + shift).toFixed(3));
        }
      });
    }
  }
  
  // Resolve leftward from anchor
  for (let i = anchorIdx - 1; i >= 0; i--) {
    const nextGroup = sortedGroups[i + 1];
    const currGroup = sortedGroups[i];
    
    const nextNonManual = nextGroup.children.filter(c => !c.isManual);
    const nextMin = nextNonManual.length > 0 ? Math.min(...nextNonManual.map(c => c.column)) : Infinity;
    
    const currNonManual = currGroup.children.filter(c => !c.isManual);
    const currMax = currNonManual.length > 0 ? Math.max(...currNonManual.map(c => c.column)) : -Infinity;
    
    if (currMax > nextMin - gap && currMax !== -Infinity && nextMin !== Infinity) {
      const shift = currMax - (nextMin - gap);
      currGroup.children.forEach(c => {
        if (!c.isManual) {
          c.column = parseFloat((c.column - shift).toFixed(3));
        }
      });
    }
  }
}

function centerParentsBottomUp() {
  const maxGen = Math.max(...db.map(c => c.generation), 0);
  
  // Go from maxGen - 1 down to 0
  for (let g = maxGen - 1; g >= 0; g--) {
    // Find all parents at generation g who have children at g + 1
    const parentsAtGen = db.filter(c => c.generation === g);
    if (parentsAtGen.length === 0) continue;
    
    // Group children at g + 1 by their parentKey
    const childrenAtNextGen = db.filter(c => c.generation === g + 1);
    const parentToChildren = {};
    
    childrenAtNextGen.forEach(child => {
      if (child.parents && child.parents.length > 0) {
        const parentKey = [...child.parents].sort().join('+');
        if (!parentToChildren[parentKey]) {
          parentToChildren[parentKey] = [];
        }
        parentToChildren[parentKey].push(child);
      }
    });
    
    // For each couple / parent, center them above their children
    Object.keys(parentToChildren).forEach(parentKey => {
      const children = parentToChildren[parentKey];
      if (children.length === 0) return;
      
      const childCols = children.map(c => c.column);
      const minCol = Math.min(...childCols);
      const maxCol = Math.max(...childCols);
      const childrenMidpoint = (minCol + maxCol) / 2;
      
      const parentIds = parentKey.split('+');
      if (parentIds.length === 1) {
        const parent = db.find(p => p.id === parentIds[0]);
        if (parent && !parent.isMain && !parent.isManual) {
          parent.column = parseFloat(childrenMidpoint.toFixed(3));
        }
      } else if (parentIds.length === 2) {
        const p1 = db.find(p => p.id === parentIds[0]);
        const p2 = db.find(p => p.id === parentIds[1]);
        
        if (p1 && p2) {
          if (p1.isMain) {
            const spouseDist = p1.column < p2.column ? 1.2 : -1.2;
            if (!p2.isManual) {
              p2.column = parseFloat((p1.column + spouseDist).toFixed(3));
            }
          } else if (p2.isMain) {
            const spouseDist = p2.column < p1.column ? 1.2 : -1.2;
            if (!p1.isManual) {
              p1.column = parseFloat((p2.column + spouseDist).toFixed(3));
            }
          } else {
            if (p1.isManual && p2.isManual) {
              // Both are manual, do not change
            } else if (p1.isManual) {
              const spouseDist = p1.column < p2.column ? 1.2 : -1.2;
              p2.column = parseFloat((p1.column + spouseDist).toFixed(3));
            } else if (p2.isManual) {
              const spouseDist = p2.column < p1.column ? 1.2 : -1.2;
              p1.column = parseFloat((p2.column + spouseDist).toFixed(3));
            } else {
              const currentDist = Math.abs(p1.column - p2.column);
              const halfDist = currentDist > 0 ? currentDist / 2 : 0.6;
              if (p1.column < p2.column) {
                p1.column = parseFloat((childrenMidpoint - halfDist).toFixed(3));
                p2.column = parseFloat((childrenMidpoint + halfDist).toFixed(3));
              } else {
                p2.column = parseFloat((childrenMidpoint - halfDist).toFixed(3));
                p1.column = parseFloat((childrenMidpoint + halfDist).toFixed(3));
              }
            }
          }
        }
      }
    });
    
    // Resolve overlaps for generation g after moving parents!
    resolveGenerationOverlaps(g);
  }
}

function resolveGenerationOverlaps(gen) {
  const genChars = db.filter(c => c.generation === gen);
  if (genChars.length === 0) return;
  
  const groups = {};
  genChars.forEach(char => {
    const parentKey = char.parents && char.parents.length > 0
      ? [...char.parents].sort().join('+')
      : `unconnected_${char.id}`;
      
    if (!groups[parentKey]) {
      groups[parentKey] = {
        key: parentKey,
        children: [],
        parentCol: 0,
        isMain: false
      };
    }
    groups[parentKey].children.push(char);
    if (char.isMain) {
      groups[parentKey].isMain = true;
    }
  });
  
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    const cols = group.children.map(c => c.column);
    group.parentCol = (Math.min(...cols) + Math.max(...cols)) / 2;
  });
  
  const sortedGroups = Object.values(groups).sort((a, b) => a.parentCol - b.parentCol);
  
  const mainGroupIdx = sortedGroups.findIndex(g => g.isMain);
  const anchorIdx = mainGroupIdx !== -1 ? mainGroupIdx : Math.floor(sortedGroups.length / 2);
  
  const gap = 1.8;
  
  for (let i = anchorIdx + 1; i < sortedGroups.length; i++) {
    const prevGroup = sortedGroups[i - 1];
    const currGroup = sortedGroups[i];
    
    const prevNonManual = prevGroup.children.filter(c => !c.isManual);
    const prevMax = prevNonManual.length > 0 ? Math.max(...prevNonManual.map(c => c.column)) : -Infinity;
    
    const currNonManual = currGroup.children.filter(c => !c.isManual);
    const currMin = currNonManual.length > 0 ? Math.min(...currNonManual.map(c => c.column)) : Infinity;
    
    if (currMin < prevMax + gap && currMin !== Infinity && prevMax !== -Infinity) {
      const shift = (prevMax + gap) - currMin;
      currGroup.children.forEach(c => {
        if (!c.isManual) {
          c.column = parseFloat((c.column + shift).toFixed(3));
        }
      });
    }
  }
  
  for (let i = anchorIdx - 1; i >= 0; i--) {
    const nextGroup = sortedGroups[i + 1];
    const currGroup = sortedGroups[i];
    
    const nextNonManual = nextGroup.children.filter(c => !c.isManual);
    const nextMin = nextNonManual.length > 0 ? Math.min(...nextNonManual.map(c => c.column)) : Infinity;
    
    const currNonManual = currGroup.children.filter(c => !c.isManual);
    const currMax = currNonManual.length > 0 ? Math.max(...currNonManual.map(c => c.column)) : -Infinity;
    
    if (currMax > nextMin - gap && currMax !== -Infinity && nextMin !== Infinity) {
      const shift = currMax - (nextMin - gap);
      currGroup.children.forEach(c => {
        if (!c.isManual) {
          c.column = parseFloat((c.column - shift).toFixed(3));
        }
      });
    }
  }
}

function exportDatabaseJSON() {
  const exportData = {
    version: "14.0",
    db: db,
    lineBends: lineBends,
    customVisualLines: customVisualLines,
    canvasJunctions: canvasJunctions,
    spouseSplits: spouseSplits,
    annotations: annotations,
    styleSettings: styleSettings
  };
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = "bible_tree_full_data.json";
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDatabaseJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      
      // Determine if it is the new unified format or the legacy format
      let importedDb = null;
      let importedLineBends = null;
      let importedCustomVisualLines = null;
      let importedCanvasJunctions = null;
      let importedSpouseSplits = null;
      let importedAnnotations = null;
      let importedStyleSettings = null;
      
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        // Unified format
        if (!parsed.db || !Array.isArray(parsed.db)) {
          throw new Error("올바른 통합 데이터 형식이 아닙니다. db 필드가 누락되었거나 배열이 아닙니다.");
        }
        importedDb = parsed.db;
        importedLineBends = parsed.lineBends || {};
        importedCustomVisualLines = parsed.customVisualLines || [];
        importedCanvasJunctions = parsed.canvasJunctions || [];
        importedSpouseSplits = parsed.spouseSplits || {};
        importedAnnotations = parsed.annotations || [];
        importedStyleSettings = parsed.styleSettings || null;
      } else if (Array.isArray(parsed)) {
        // Legacy format (character array only)
        importedDb = parsed;
      } else {
        throw new Error("지원하지 않는 데이터 형식입니다.");
      }
      
      const isValid = importedDb.every(item => 
        item.id && 
        item.name && 
        item.gender && 
        (item.generation !== undefined) && 
        (item.column !== undefined)
      );
      
      if (!isValid) throw new Error("필수 필드(id, name, gender, generation, column)가 유실되었습니다.");
      
      // 1. Update in-memory state
      db = importedDb;
      if (importedLineBends !== null) lineBends = importedLineBends;
      if (importedCustomVisualLines !== null) customVisualLines = importedCustomVisualLines;
      if (importedCanvasJunctions !== null) canvasJunctions = importedCanvasJunctions;
      if (importedSpouseSplits !== null) spouseSplits = importedSpouseSplits;
      if (importedAnnotations !== null) annotations = importedAnnotations;
      if (importedStyleSettings !== null) styleSettings = { ...styleSettings, ...importedStyleSettings };
      
      // 2. Save everything to localStorage
      saveDatabase();
      saveLineBends();
      saveCustomVisualLines();
      saveCanvasJunctions();
      saveSpouseSplits();
      saveAnnotations();
      if (importedStyleSettings !== null) saveStyleSettings();
      
      // 3. Re-initialize and render
      initBoard();
      renderTree();
      updateStats();
      if (importedStyleSettings !== null) applyStyleSettings();
      
      alert(`총 ${db.length}명의 인물 데이터 및 연결선/스타일 설정이 성공적으로 로드되었습니다.`);
      exitAdminMode();
    } catch (err) {
      alert("파일 로드 중 오류가 발생했습니다: " + err.message);
    }
  };
  
  reader.readAsText(file);
  importFileInput.value = '';
}

// ==========================================
// Line Style Editor Panel Logic
// ==========================================

function setupStyleEditor() {
  // Toggle style editor panel
  styleEditorToggle.addEventListener('click', () => {
    if (styleEditorPanel.classList.contains('active')) {
      closeStyleEditorPanel();
    } else {
      openStyleEditorPanel();
    }
  });
  
  stylePanelClose.addEventListener('click', closeStyleEditorPanel);
  
  // Real-time Style Controls Binding
  inputLineColor.addEventListener('input', (e) => {
    styleSettings.lineColor = e.target.value;
    document.documentElement.style.setProperty('--line-color', styleSettings.lineColor);
    saveStyleSettings();
  });
  
  inputMainLineColor.addEventListener('input', (e) => {
    styleSettings.mainLineColor = e.target.value;
    document.documentElement.style.setProperty('--line-main-color', styleSettings.mainLineColor);
    saveStyleSettings();
  });
  
  inputSpouseLineColor.addEventListener('input', (e) => {
    styleSettings.spouseLineColor = e.target.value;
    document.documentElement.style.setProperty('--spouse-line-color', styleSettings.spouseLineColor);
    saveStyleSettings();
  });
  
  inputLineWidth.addEventListener('input', (e) => {
    styleSettings.lineWidth = parseInt(e.target.value);
    document.documentElement.style.setProperty('--line-width', `${styleSettings.lineWidth}px`);
    labelLineWidth.textContent = `${styleSettings.lineWidth}px`;
    saveStyleSettings();
  });
  
  inputCornerRadius.addEventListener('input', (e) => {
    styleSettings.cornerRadius = parseInt(e.target.value);
    labelCornerRadius.textContent = `${styleSettings.cornerRadius}px`;
    saveStyleSettings();
    
    // Curved coordinates require redrawing elements (lines paths string recalculations)
    renderTree();
  });
  
  inputSplitOffset.addEventListener('input', (e) => {
    styleSettings.splitOffset = parseInt(e.target.value);
    labelSplitOffset.textContent = `${styleSettings.splitOffset}px`;
    saveStyleSettings();
    
    // Vertical shift of split height requires line paths recalculations
    renderTree();
  });

  inputLineType.addEventListener('change', (e) => {
    styleSettings.lineType = e.target.value;
    saveStyleSettings();
    renderTree();
  });
  
  if (inputSiblingGap) {
    inputSiblingGap.addEventListener('input', (e) => {
      styleSettings.siblingGap = parseInt(e.target.value);
      if (labelSiblingGap) labelSiblingGap.textContent = `${styleSettings.siblingGap}px`;
      saveStyleSettings();
      
      // Changing sibling gap changes the tree physical size and positions
      rebuildAllLayouts();
      saveDatabase();
      initBoard();
      renderTree();
    });
  }
  
  // Reset style values to defaults
  styleResetBtn.addEventListener('click', () => {
    if (confirm("연결선 디자인 설정을 기본값으로 되돌리시겠습니까?")) {
      styleSettings = {
        lineColor: '#94a3b8',
        mainLineColor: '#ff7800',
        spouseLineColor: '#ef4444',
        lineWidth: 3,
        cornerRadius: 12,
        splitOffset: 90,
        lineType: 'orthogonal',
        siblingGap: 7
      };
      saveStyleSettings();
      applyStyleSettings();
      rebuildAllLayouts();
      saveDatabase();
      initBoard();
      renderTree();
    }
  });

  // Line Editor Elements Event Listeners
  const lineEditToggle = document.getElementById('style-line-edit-toggle');
  if (lineEditToggle) {
    lineEditToggle.addEventListener('change', (e) => {
      isLineEditModeActive = e.target.checked;
      if (!isLineEditModeActive) {
        selectedLineKey = null;
        drawConnections();
      }
    });
  }

  const gridSnapToggle = document.getElementById('style-grid-snap-toggle');
  if (gridSnapToggle) {
    gridSnapToggle.addEventListener('change', (e) => {
      isGridSnapActive = e.target.checked;
    });
  }

  const clearSelectedLineBtn = document.getElementById('style-clear-selected-line-btn');
  if (clearSelectedLineBtn) {
    clearSelectedLineBtn.addEventListener('click', () => {
      if (selectedLineKey) {
        pushHistoryState();
        delete lineBends[selectedLineKey];
        selectedLineKey = null;
        saveLineBends();
        drawConnections();
        showToast("선택된 연결선 편집이 초기화되었습니다.");
      }
    });
  }

  const deleteSelectedLineBtn = document.getElementById('style-delete-selected-line-btn');
  if (deleteSelectedLineBtn) {
    deleteSelectedLineBtn.addEventListener('click', () => {
      deleteSelectedLine();
    });
  }

  const clearAllLinesBtn = document.getElementById('style-clear-all-lines-btn');
  if (clearAllLinesBtn) {
    clearAllLinesBtn.addEventListener('click', () => {
      if (confirm("모든 연결선의 수동 편집 내역을 초기화하시겠습니까?")) {
        pushHistoryState();
        lineBends = {};
        selectedLineKey = null;
        saveLineBends();
        drawConnections();
        showToast("모든 연결선 편집이 초기화되었습니다.");
      }
    });
  }
}

function openStyleEditorPanel() {
  // Close other sidebar to prevent overlapping on small viewports
  closeStudyPanel();
  
  styleEditorPanel.classList.add('active');
}

function closeStyleEditorPanel() {
  styleEditorPanel.classList.remove('active');
}
