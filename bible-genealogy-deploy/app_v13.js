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
let centerX = 0;

// Filter Settings
const charGroups = {};
let activeFilters = {
  cain: true,
  japheth: true,
  ham: true,
  joktan: true,
  keturah: true,
  ishmael: true,
  esau: true
};

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
const adminAddBtn = document.getElementById('admin-add-btn');
const adminAddNoteBtn = document.getElementById('admin-add-note-btn');
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
  // Clear custom edits if database layout version changed to force vertical coordinates
  if (typeof LAYOUT_VERSION !== 'undefined') {
    const savedLayoutVer = localStorage.getItem('bible_tree_layout_version');
    if (savedLayoutVer !== LAYOUT_VERSION) {
      // Clean only Japheth's and Joktan's lineage edits to prevent resetting unrelated manual tweaks!
      const characterEdits = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
      const resetIds = [
        'japheth', 'gomer', 'magog', 'madai', 'javan', 'tubal', 'meshech', 'tiras', 'ashkenaz', 'riphath', 'togarmah', 'elishah', 'tarshish', 'kittim', 'dodanim',
        'joktan', 'almodad', 'sheleph', 'hazarmaveth', 'jerah', 'hadoram', 'uzal', 'diklah', 'obal', 'abimael', 'sheba_joktan', 'ophir', 'havilah_joktan', 'jobab',
        'laban', 'leah_daughter', 'rachel_daughter', 'rebekah_daughter',
        'nadab', 'abihu', 'eleazar_priest', 'ithamar', 'gershom', 'eliezer_moses',
        'amram', 'jochebed', 'aaron', 'elisheba', 'moses', 'zipporah', 'miriam'
      ];
      resetIds.forEach(id => {
        delete characterEdits[id];
      });
      localStorage.setItem('bible_tree_character_edits', JSON.stringify(characterEdits));
      localStorage.setItem('bible_tree_layout_version', LAYOUT_VERSION);
    }
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
    if (!isAdminMode || selectedPersonIds.size === 0) return;
    
    // Ignore nudging if typing in inputs/textareas
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }
    
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
});

function getFamilyTreeTargets(personId) {
  const targets = new Set();
  const queue = [personId];
  
  // Add self and spouses
  const startChar = db.find(c => c.id === personId);
  if (startChar) {
    targets.add(personId);
    if (startChar.spouses) {
      startChar.spouses.forEach(spId => {
        targets.add(spId);
        queue.push(spId);
      });
    }
  }
  
  // Recursively add children and descendants
  while (queue.length > 0) {
    const currentId = queue.shift();
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
      
      // 3. Migrate deleted IDs
      let deletedIds = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
      if (deletedIds.includes('manasseh')) {
        deletedIds = deletedIds.map(id => id === 'manasseh' ? 'manasseh_king' : id);
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
    } catch (err) {
      console.error("Master migration error:", err);
    }

    // 1. Start with copy of static canonical characters
    db = JSON.parse(JSON.stringify(BIBLE_CHARACTERS));
    
    // 2. Remove deleted canonical characters
    const deletedIds = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
    db = db.filter(c => !deletedIds.includes(c.id));
    
    // 3. Apply edits to canonical characters
    const characterEdits = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
    db.forEach(c => {
      if (characterEdits[c.id]) {
        Object.assign(c, characterEdits[c.id]);
      }
    });
    
    // 4. Load and append custom characters (filtering out any that are now canonical)
    const customCharacters = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
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
      
      // If canonical, protect its identity and relationships from corrupted edits
      if (canon) {
        c.name = canon.name;
        c.engName = canon.engName;
        c.gender = canon.gender;
        c.isMain = canon.isMain;
        
        // Restore correct parents if altered
        if (!Array.isArray(c.parents) || c.parents.length !== canon.parents.length || !c.parents.every(p => canon.parents.includes(p))) {
          c.parents = [...canon.parents];
        }
        // Restore correct spouses if altered
        if (!Array.isArray(c.spouses) || c.spouses.length !== canon.spouses.length || !c.spouses.every(s => canon.spouses.includes(s))) {
          c.spouses = [...canon.spouses];
        }
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

function renderAnnotations() {
  // Clear existing annotation elements on the board
  document.querySelectorAll('.canvas-annotation').forEach(el => el.remove());
  
  const board = document.getElementById('tree-board');
  if (!board) return;
  
  annotations.forEach(annot => {
    const el = document.createElement('div');
    el.id = `annot-${annot.id}`;
    el.className = 'canvas-annotation';
    el.style.left = `${annot.x}px`;
    el.style.top = `${annot.y}px`;
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
        annotations = annotations.filter(a => a.id !== annot.id);
        saveAnnotations();
        el.remove();
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
      if (styleSettings.splitOffset === 45) {
        styleSettings.splitOffset = 90;
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
  // Set CSS Variables on root element
  document.documentElement.style.setProperty('--line-color', styleSettings.lineColor);
  document.documentElement.style.setProperty('--line-main-color', styleSettings.mainLineColor);
  document.documentElement.style.setProperty('--spouse-line-color', styleSettings.spouseLineColor);
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
  
  const boardHeight = (totalGens * GEN_HEIGHT) + (BOARD_PADDING_Y * 2);
  const boardWidth = (totalCols * COL_WIDTH) + (BOARD_PADDING_X * 2);
  
  // Set dimensions on elements
  treeBoard.style.width = `${boardWidth}px`;
  treeBoard.style.height = `${boardHeight}px`;
  
  // Set SVG viewbox
  svgLayer.setAttribute('viewBox', `0 0 ${boardWidth} ${boardHeight}`);
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
    mary: [
      'nathan', 'mattatha', 'menna', 'melea', 'eliakim_luke', 'jonam', 'joseph_luke1', 'judah_luke1',
      'simeon_luke', 'levi_luke1', 'matthat_luke1', 'jorim', 'eliezer_luke', 'joshua_luke', 'er_luke',
      'elmadam', 'cosam', 'addi', 'melchi_luke1', 'neri',
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
      activeFilters = JSON.parse(savedFilters);
    } catch (err) {
      console.error("Failed to parse saved filters", err);
    }
  }
  
  // Sync checkboxes
  const groups = ['cain', 'japheth', 'ham', 'joktan', 'keturah', 'ishmael', 'esau'];
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
  if (coordsNoah) {
    divider.style.left = `${coordsNoah.x - 260}px`;
    divider.style.top = `${coordsNoah.y + 40}px`;
  } else {
    divider.style.left = `${centerX - 260}px`;
    divider.style.top = `${BOARD_PADDING_Y + (10 * GEN_HEIGHT) + 40}px`;
  }
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
    
    const panel = document.createElement('div');
    panel.className = `family-group-panel ${groupName}`;
    panel.style.left = `${minX - (CARD_WIDTH / 2) - padLeftRight}px`;
    panel.style.top = `${minY - (CARD_HEIGHT / 2) - padTopBottom}px`;
    panel.style.width = `${(maxX - minX) + CARD_WIDTH + (padLeftRight * 2)}px`;
    panel.style.height = `${(maxY - minY) + CARD_HEIGHT + (padTopBottom * 2)}px`;
    
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
    
    // Position card
    card.style.left = `${coords.x - (CARD_WIDTH / 2)}px`;
    card.style.top = `${coords.y - (CARD_HEIGHT / 2)}px`;
    
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
      <div class="card-edit-overlay">
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
        cardLeft = parseFloat(card.style.left) || 0;
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
              startLeft: parseFloat(targetCard.style.left) || 0
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
                startLeft: parseFloat(descCard.style.left) || 0
              });
            }
          });
        }
        
        function moveDrag(currentX, moveEvent) {
          moveEvent.stopPropagation();
          const deltaX = currentX - startX;
          if (Math.abs(deltaX) > 4) {
            isDragging = true;
            card.classList.add('dragging');
            descendantDragData.forEach(d => d.element.classList.add('dragging'));
          }
          
          if (isDragging) {
            const scaledDeltaX = deltaX / currentScale;
            const newLeft = cardLeft + scaledDeltaX;
            card.style.left = `${newLeft}px`;
            
            // Real-time coordinates update for connections drawing
            coordinates[char.id].x = newLeft + (CARD_WIDTH / 2);
            char.column = parseFloat(((newLeft + (CARD_WIDTH / 2) - BOARD_PADDING_X) / COL_WIDTH).toFixed(3));
            if (scaledDeltaX !== 0) char.isManual = true;
            
            // Parallel move descendants
            descendantDragData.forEach(data => {
              const newDescLeft = data.startLeft + scaledDeltaX;
              data.element.style.left = `${newDescLeft}px`;
              coordinates[data.id].x = newDescLeft + (CARD_WIDTH / 2);
              data.char.column = parseFloat(((newDescLeft + (CARD_WIDTH / 2) - BOARD_PADDING_X) / COL_WIDTH).toFixed(3));
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
          renderTree();
        }
        openStudyPanel(char.id);
      }
    });
    
    treeBoard.appendChild(card);
  });
  
  // 3. Draw Connecting Lines
  drawConnections();
  
  // 4. Render Floating Annotation Boxes
  renderAnnotations();
}

// Draw Spouse and Parent-Children Connecting Lines in SVG
function drawConnections() {
  const svgNS = "http://www.w3.org/2000/svg";
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
  const coupleMidpoints = {};
  
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
        
        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
        path.setAttribute("class", "spouse-connector");
        path.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        svgLayer.appendChild(path);
        
        // Midpoint
        coupleMidpoints[spousePair] = {
          x: (x1 + x2) / 2,
          y: y1
        };
      });
    }
  });
  
  // Draw Parent-Children lines using rounded orthogonal bending paths
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
      sourceY = coupleMidpoints[parentKey].y;
      
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
    
    // Draw paths dynamically for each child to allow automatic curves at elbow joints
    validChildrenIds.forEach(childId => {
      const childCoord = coordinates[childId];
      const child = db.find(c => c.id === childId);
      const isChildMain = isMainLine && child && child.isMain;
      
      const childPath = document.createElementNS(svgNS, "path");
      const targetY = childCoord.y - (CARD_HEIGHT / 2);
      
      const key = `${parentKey}->${childId}`;
      const customBends = lineBends[key];
      
      // Calculate path based on line style preference or custom bends
      let pathD = "";
      if (customBends && customBends.length > 0) {
        let pathParts = [`M ${sourceX} ${sourceY}`];
        customBends.forEach(pt => {
          pathParts.push(`L ${pt.x} ${pt.y}`);
        });
        pathParts.push(`L ${childCoord.x} ${targetY}`);
        pathD = pathParts.join(' ');
      } else {
        if (styleSettings.lineType === 'diagonal') {
          pathD = `M ${sourceX} ${sourceY} L ${childCoord.x} ${targetY}`;
        } else {
          pathD = getRoundedOrthogonalPath(sourceX, sourceY, childCoord.x, targetY, ySplit, styleSettings.cornerRadius);
        }
      }
      
      childPath.setAttribute("d", pathD);
      childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''}`);
      childPath.setAttribute("data-child-id", childId);
      childPath.setAttribute("data-parent-ids", parentIds.join(','));
      
      // Add click listener to add a bend point in Admin Mode
      childPath.addEventListener('click', (e) => {
        if (!isAdminMode) return;
        e.stopPropagation();
        
        const rect = treeBoard.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / currentScale;
        const clickY = (e.clientY - rect.top) / currentScale;
        
        if (!lineBends[key]) {
          lineBends[key] = [];
        }
        lineBends[key].push({ x: clickX, y: clickY });
        saveLineBends();
        drawConnections();
      });
      
      svgLayer.appendChild(childPath);
    });
  });
  
  // Render bend handles if in Admin Mode
  renderBendHandles();
}

function renderBendHandles() {
  // Clear existing annotation elements on the board
  document.querySelectorAll('.line-bend-handle').forEach(el => el.remove());
  
  if (!isAdminMode) return;
  
  Object.keys(lineBends).forEach(key => {
    const points = lineBends[key];
    points.forEach((pt, index) => {
      const handle = document.createElement('div');
      handle.className = 'line-bend-handle';
      handle.style.left = `${pt.x}px`;
      handle.style.top = `${pt.y}px`;
      handle.title = "드래그하여 이동, 더블클릭하여 삭제";
      
      let dragStartX = 0;
      let dragStartY = 0;
      let originalX = 0;
      let originalY = 0;
      
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        originalX = pt.x;
        originalY = pt.y;
        
        const onMouseMove = (moveEvt) => {
          const dx = (moveEvt.clientX - dragStartX) / currentScale;
          const dy = (moveEvt.clientY - dragStartY) / currentScale;
          pt.x = originalX + dx;
          pt.y = originalY + dy;
          handle.style.left = `${pt.x}px`;
          handle.style.top = `${pt.y}px`;
          
          // Re-draw connections in real-time (but don't recreate handles while dragging)
          drawConnectionsWithoutRecreatingHandles();
        };
        
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          saveLineBends();
          drawConnections(); // full redraw
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
      
      // Double click to delete bend point
      handle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        points.splice(index, 1);
        if (points.length === 0) {
          delete lineBends[key];
        }
        saveLineBends();
        drawConnections();
      });
      
      treeBoard.appendChild(handle);
    });
  });
}

// Special lightweight redraw function to prevent handle recreation glitches during drag
function drawConnectionsWithoutRecreatingHandles() {
  const svgNS = "http://www.w3.org/2000/svg";
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
  
  const coupleMidpoints = {};
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
        
        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
        path.setAttribute("class", "spouse-connector");
        path.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        svgLayer.appendChild(path);
        
        coupleMidpoints[spousePair] = {
          x: (x1 + x2) / 2,
          y: y1
        };
      });
    }
  });
  
  Object.keys(parentGroups).forEach(parentKey => {
    const childrenIds = parentGroups[parentKey];
    const parentIds = parentKey.split('+');
    
    let sourceX, sourceY;
    let isMainLine = false;
    
    const fatherId = parentIds[0];
    const fatherNode = db.find(c => c.id === fatherId);
    
    if (parentIds.length === 2 && coupleMidpoints[parentKey]) {
      sourceX = coupleMidpoints[parentKey].x;
      sourceY = coupleMidpoints[parentKey].y;
      
      const hasMainChild = childrenIds.some(childId => {
        const child = db.find(c => c.id === childId);
        return child && child.isMain;
      });
      if (fatherNode && fatherNode.isMain && hasMainChild) {
        isMainLine = true;
      }
    } else {
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
    
    validChildrenIds.forEach(childId => {
      const childCoord = coordinates[childId];
      const child = db.find(c => c.id === childId);
      const isChildMain = isMainLine && child && child.isMain;
      
      const childPath = document.createElementNS(svgNS, "path");
      const targetY = childCoord.y - (CARD_HEIGHT / 2);
      
      const key = `${parentKey}->${childId}`;
      const customBends = lineBends[key];
      
      let pathD = "";
      if (customBends && customBends.length > 0) {
        let pathParts = [`M ${sourceX} ${sourceY}`];
        customBends.forEach(pt => {
          pathParts.push(`L ${pt.x} ${pt.y}`);
        });
        pathParts.push(`L ${childCoord.x} ${targetY}`);
        pathD = pathParts.join(' ');
      } else {
        if (styleSettings.lineType === 'diagonal') {
          pathD = `M ${sourceX} ${sourceY} L ${childCoord.x} ${targetY}`;
        } else {
          pathD = getRoundedOrthogonalPath(sourceX, sourceY, childCoord.x, targetY, ySplit, styleSettings.cornerRadius);
        }
      }
      
      childPath.setAttribute("d", pathD);
      childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''}`);
      childPath.setAttribute("data-child-id", childId);
      childPath.setAttribute("data-parent-ids", parentIds.join(','));
      svgLayer.appendChild(childPath);
    });
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
    // If a card is selected in Admin Mode, clicking empty space clears it
    if ((selectedPersonId || selectedPersonIds.size > 0) && !e.target.closest('.person-card') && !e.target.closest('header') && !e.target.closest('#control-panel') && !e.target.closest('#search-panel') && !e.target.closest('#admin-actions-bar') && !e.target.closest('.modal-content') && !e.target.closest('#style-editor-panel') && !e.target.closest('.canvas-annotation') && !e.target.closest('.line-bend-handle')) {
      selectedPersonId = null;
      selectedPersonIds.clear();
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
  zoomWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
  
  // Keep generation labels sticky at the left end of the browser viewport
  const labels = treeBoard.querySelectorAll('.generation-label');
  const stickyLeft = (-panX + 24) / currentScale;
  labels.forEach(label => {
    label.style.left = `${stickyLeft}px`;
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

  adminExportBtn.addEventListener('click', exportDatabaseJSON);

  adminImportBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', importDatabaseJSON);

  adminResetBtn.addEventListener('click', () => {
    if (confirm("정말로 데이터베이스를 초기 상태로 재설정하시겠습니까? 기록한 모든 추가 인물이 제거됩니다.")) {
      localStorage.removeItem('bible_tree_db');
      localStorage.removeItem('bible_tree_custom_characters');
      localStorage.removeItem('bible_tree_character_edits');
      localStorage.removeItem('bible_tree_deleted_ids');
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

function enterAdminMode() {
  isAdminMode = true;
  adminLockBtn.textContent = '🔓';
  adminLockBtn.title = '관리자 편집 모드 잠금';
  adminActionsBar.style.display = 'flex';
  styleEditorToggle.style.display = 'flex';
  
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
  
  deactivateAddPersonMode();
  
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
        isMain
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
      isMain
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
  
  rebuildAllLayouts();
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
  
  rebuildAllLayouts();
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
  const dataStr = JSON.stringify(db, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = "bible_tree_data.json";
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
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects.");
      
      const isValid = parsed.every(item => 
        item.id && 
        item.name && 
        item.gender && 
        (item.generation !== undefined) && 
        (item.column !== undefined)
      );
      
      if (!isValid) throw new Error("필수 필드(id, name, gender, generation, column)가 유실되었습니다.");
      
      db = parsed;
      saveDatabase();
      initBoard();
      renderTree();
      updateStats();
      
      alert(`총 ${db.length}명의 인물 데이터가 업로드되었습니다.`);
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
}

function openStyleEditorPanel() {
  // Close other sidebar to prevent overlapping on small viewports
  closeStudyPanel();
  
  styleEditorPanel.classList.add('active');
}

function closeStyleEditorPanel() {
  styleEditorPanel.classList.remove('active');
}
