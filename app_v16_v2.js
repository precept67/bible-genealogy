// Polyfill closest on Node prototype to prevent errors when target is a Text node (common in WebKit/Safari)
if (typeof Node !== 'undefined' && !Node.prototype.closest) {
  Node.prototype.closest = function(selector) {
    return this.parentElement ? this.parentElement.closest(selector) : null;
  };
}

// Global API Base URL Fetch Wrapper for Desktop App
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/') && window.API_BASE_URL) {
      input = window.API_BASE_URL + input;
    }
    return originalFetch(input, init);
  };
}

// Intercept all external link clicks to open in default system browser when running inside Tauri
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.href && (anchor.href.startsWith('http://') || anchor.href.startsWith('https://'))) {
      const isTauri = window.location.protocol.startsWith('tauri') || 
                      window.location.hostname === 'tauri.localhost' || 
                      window.location.protocol.startsWith('file') ||
                      window.location.protocol.startsWith('asset') ||
                      (window.__TAURI__ && window.__TAURI__.shell);
      if (isTauri && window.__TAURI__ && window.__TAURI__.shell) {
        e.preventDefault();
        window.__TAURI__.shell.open(anchor.href).catch(err => {
          console.error("Failed to open external link:", err);
        });
      }
    }
  });
}

// Configuration Constants
// Localization Settings (i18n)
let currentLang = localStorage.getItem('bible_genealogy_lang') || 'ko';

const UI_TEXTS = {
  ko: {
    search_placeholder: "검색 (인물, 사건, 장소)...",
    filter_panel_title: "계보 필터 설정",
    theme_toggle_title: "테마 변경",
    zoom_in_title: "확대",
    zoom_out_title: "축소",
    zoom_reset_title: "원본 크기",
    prophets_toggle_title: "선지자 레이어 표시 토글",
    help_guide_title: "도움말 및 사용 가이드",
    backup_title: "전체 메모 백업 (개인 폴더로 자동 저장)",
    restore_title: "자동저장된 메모 복원 (또는 백업 파일 불러오기)",
    admin_lock_title: "관리자 편집 모드 토글",
    logout_title: "로그아웃",
    study_panel_title_annotation: "성경 족보 텍스트 상자",
    study_panel_title_polygon: "사용자 정의 영역 정보",
    study_panel_title_event: "성경 속 사건 정보",
    study_panel_title_location: "성경 속 장소 정보",
    label_annotation: "📝 텍스트 상자",
    label_polygon: "📐 영역",
    label_event: "📜 사건",
    label_location: "📍 장소",
    desc_annotation: "텍스트 상자 메모입니다. 아래에서 개인 연구 메모를 작성하고 참고 링크를 등록할 수 있습니다.",
    desc_polygon: "사용자 정의 다각형 영역입니다. 아래에서 영역에 대한 연구 메모를 작성하고 참고 링크를 등록할 수 있습니다.",
    desc_no_detail: "상세 설명이 없습니다.",
    related_verses: "📖 관련 성구:",
    notes_placeholder: "이 인물에 대한 메모나 생각들을 여기에 기록하세요. (자동 저장)",
    notes_title: "📖 연구 메모 및 링크",
    resource_desc_placeholder: "자료 설명 (예: 구절, 기사 제목)",
    resource_url_placeholder: "링크 URL (http...)",
    resource_add_btn: "추가",
    gender_m: "남",
    gender_f: "여",
    search_no_results: "검색 결과가 없습니다.",
    admin_mode_locked: "🔒 화면 편집이 잠겨있습니다.",
    admin_mode_unlocked: "🔓 화면 편집이 열려있습니다 (인물/선/장소/사건 조작 가능).",
    admin_mode_prompt: "비밀번호를 입력하세요:",
    admin_mode_wrong: "비밀번호가 올바르지 않습니다.",
    app_title: "열린족보이야기",
    layer_panel_title: "레이어 표시 설정",
    layer_people: "인물 족보 (Genealogy)",
    layer_events: "주요 사건 (Events)",
    layer_locations: "장소/지명 (Locations)",
    layer_polygons: "영역 (Areas)",
    layer_prophets: "선지자 (Prophets)"
  },
  en: {
    search_placeholder: "Search (People, Events, Locations)...",
    filter_panel_title: "Genealogy Filter Settings",
    theme_toggle_title: "Change Theme",
    zoom_in_title: "Zoom In",
    zoom_out_title: "Zoom Out",
    zoom_reset_title: "Reset Zoom",
    prophets_toggle_title: "Toggle Prophets Layer",
    help_guide_title: "Help & Guide",
    backup_title: "Backup All Notes (Auto-saved to personal folder)",
    restore_title: "Restore Auto-saved Notes (or Load Backup File)",
    admin_lock_title: "Toggle Admin Edit Mode",
    logout_title: "Log Out",
    study_panel_title_annotation: "Bible Genealogy Text Box",
    study_panel_title_polygon: "Custom Region Details",
    study_panel_title_event: "Biblical Event Details",
    study_panel_title_location: "Biblical Location Details",
    label_annotation: "📝 Text Box",
    label_polygon: "📐 Region",
    label_event: "📜 Event",
    label_location: "📍 Location",
    desc_annotation: "This is a text box note. You can write your personal study notes and register reference links below.",
    desc_polygon: "This is a custom polygonal region. You can write study notes and register reference links for this region below.",
    desc_no_detail: "No detailed description available.",
    related_verses: "📖 Related Scriptures:",
    notes_placeholder: "Write your study notes or thoughts here. (Auto-saved)",
    notes_title: "📖 Study Notes & Links",
    resource_desc_placeholder: "Resource description (e.g. verse reference, article title)",
    resource_url_placeholder: "Link URL (http...)",
    resource_add_btn: "Add",
    gender_m: "Male",
    gender_f: "Female",
    search_no_results: "No results found.",
    admin_mode_locked: "🔒 Screen editing is locked.",
    admin_mode_unlocked: "🔓 Screen editing is unlocked (You can move cards/lines/locations/events).",
    admin_mode_prompt: "Enter password:",
    admin_mode_wrong: "Incorrect password.",
    app_title: "Open Genealogy Story",
    layer_panel_title: "Layer Settings",
    layer_people: "Genealogy",
    layer_events: "Events",
    layer_locations: "Locations",
    layer_polygons: "Areas",
    layer_prophets: "Prophets"
  }
};

// Data Localization Helpers
function getCharName(c) {
  if (!c) return '';
  return currentLang === 'en' ? (c.engName || c.name) : c.name;
}

function getCharDesc(c) {
  if (!c) return '';
  return currentLang === 'en' ? (c.engDesc || c.desc || '') : (c.desc || '');
}

function getEventName(e) {
  if (!e) return '';
  return currentLang === 'en' ? (e.engName || e.name) : e.name;
}

function getEventDesc(e) {
  if (!e) return '';
  return currentLang === 'en' ? (e.engDesc || e.desc || '') : (e.desc || '');
}

function getLocationName(l) {
  if (!l) return '';
  return currentLang === 'en' ? (l.engName || l.name) : l.name;
}

function getLocationDesc(l) {
  if (!l) return '';
  return currentLang === 'en' ? (l.engDesc || l.desc || '') : (l.desc || '');
}

function getPolygonLabel(p) {
  if (!p) return '';
  return currentLang === 'en' ? (p.label_en || p.label) : p.label;
}

function getLocalizedAnnotationText(text) {
  if (!text) return '';
  if (currentLang !== 'en') return text;
  const trimmed = text.trim();
  if (trimmed === '성경 인물 족보 보드\n(마우스 드래그로 이동, 휠로 확대/축소)') {
    return 'Bible Genealogy Board\n(Drag to pan, Scroll to zoom)';
  } else if (trimmed === '마태복음족보의 첫번째 14대' || trimmed === '마태복음 족보의 첫번째 14대') {
    return "First 14 Generations of Matthew's Genealogy";
  } else if (trimmed === '마태복음 족보의  두번째 14대' || trimmed === '마태복음 족보의 두번째 14대' || trimmed === '마태복음족보의 두번째 14대') {
    return "Second 14 Generations of Matthew's Genealogy";
  } else if (trimmed === '마태복음 족보의 세번째 14대' || trimmed === '마태복음족보의 세번째 14대') {
    return "Third 14 Generations of Matthew's Genealogy";
  } else if (trimmed === '동명이인') {
    return 'Homonyms';
  } else if (trimmed === '다른 시대 우두머리된 자') {
    return 'Chiefs in Another Era';
  } else if (trimmed === '북왕국 이스라엘의 왕들' || trimmed === '북이스라엘의 왕들' || trimmed === '북이스라엘 왕들') {
    return 'Kings of Northern Israel';
  }
  return text;
}

// Configuration Constants
const CARD_WIDTH = 152;
const CARD_HEIGHT = 62;
const GEN_HEIGHT = 180;
const COL_WIDTH = 240;
const BOARD_PADDING_Y = 120;
const BOARD_PADDING_X = 200;

function cleanLayerName(name) {
  if (!name) return '';
  return name.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim();
}

const DEFAULT_LOCATIONS = [
  {
    "id": "loc-eden",
    "name": "에덴동산 (Eden)",
    "desc": "인류 최초의 거처이자 생명나무와 선악을 알게 하는 나무가 있던 낙원.",
    "refs": [
      "창세기 2:8",
      "창세기 2:15"
    ],
    "relatedPeople": [
      "adam",
      "eve"
    ],
    "relatedEvents": [
      "ev-eden_sin"
    ],
    "x": 150,
    "y": 150
  },
  {
    "id": "loc-east_eden",
    "name": "에덴 동쪽 놋 땅 (Land of Nod)",
    "desc": "가인이 아벨을 죽인 후 쫓겨나 유리하며 거주하게 된 에덴 동편의 땅.",
    "refs": [
      "창세기 4:16"
    ],
    "relatedPeople": [
      "cain",
      "abel"
    ],
    "relatedEvents": [
      "ev-cain_abel"
    ],
    "x": -400,
    "y": 330
  },
  {
    "id": "loc-ararat",
    "name": "아라랏산 (Mount Ararat)",
    "desc": "노아의 방주가 대홍수 심판이 끝난 후 머무른 산.",
    "refs": [
      "창세기 8:4"
    ],
    "relatedPeople": [
      "noah",
      "shem",
      "ham",
      "japheth"
    ],
    "relatedEvents": [
      "ev-noah_flood"
    ],
    "x": 150,
    "y": 1770
  },
  {
    "id": "loc-shinar",
    "name": "시날 평지 (Plain of Shinar)",
    "desc": "노아의 후손들이 모여 바벨탑을 쌓으며 하나님께 대적했던 평원.",
    "refs": [
      "창세기 11:2"
    ],
    "relatedPeople": [
      "noah"
    ],
    "relatedEvents": [
      "ev-babel_tower"
    ],
    "x": 280,
    "y": 2130
  },
  {
    "id": "loc-haran",
    "name": "하란 (Haran)",
    "desc": "아브라함의 아버지 데라가 머물다 죽은 곳이자 아브라함이 소명을 받고 떠난 땅.",
    "refs": [
      "창세기 11:31",
      "창세기 12:4"
    ],
    "relatedPeople": [
      "terah",
      "abraham",
      "sarah"
    ],
    "relatedEvents": [
      "ev-abraham_haran"
    ],
    "x": 100,
    "y": 3480
  },
  {
    "id": "loc-shechem",
    "name": "세겜 (Shechem)",
    "desc": "아브라함이 가나안 땅에 들어와 최초로 제단을 쌓고 하나님의 약속을 받은 장소.",
    "refs": [
      "창세기 12:6",
      "창세기 12:7"
    ],
    "relatedPeople": [
      "abraham"
    ],
    "relatedEvents": [
      "ev-abraham_shechem"
    ],
    "x": 150,
    "y": 3570
  },
  {
    "id": "loc-sodom",
    "name": "소돔과 고모라 (Sodom & Gomorrah)",
    "desc": "도덕적 타락으로 인해 유황과 불의 심판을 받아 멸망한 요단 평지의 성읍들.",
    "refs": [
      "창세기 19:24",
      "창세기 19:25"
    ],
    "relatedPeople": [
      "lot",
      "abraham"
    ],
    "relatedEvents": [
      "ev-sodom_destruction"
    ],
    "x": -200,
    "y": 3540
  },
  {
    "id": "loc-moriah",
    "name": "모리아산 (Mount Moriah)",
    "desc": "아브라함이 독자 이삭을 번제로 바치려 했던 산이자 훗날 솔로몬 성전이 건축된 장소.",
    "refs": [
      "창세기 22:2"
    ],
    "relatedPeople": [
      "abraham",
      "isaac"
    ],
    "relatedEvents": [
      "ev-isaac_offering"
    ],
    "x": 150,
    "y": 3660
  },
  {
    "id": "loc-beersheba",
    "name": "브엘세바 (Beersheba)",
    "desc": "맹세의 우물이라는 뜻으로, 아브라함และ 이삭이 그랄 왕 아비멜렉과 평화 언약을 맺은 곳.",
    "refs": [
      "창세기 21:31",
      "창세기 26:33"
    ],
    "relatedPeople": [
      "abraham",
      "isaac"
    ],
    "relatedEvents": [
      "ev-isaac_covenant"
    ],
    "x": 150,
    "y": 3750
  },
  {
    "id": "loc-bethel",
    "name": "벧엘 (Bethel)",
    "desc": "하나님의 집이라는 뜻으로, 야곱이 형 에서를 피해 도망치던 중 돌베개를 베고 자다 하늘 사다리 환상을 본 곳.",
    "refs": [
      "창세기 28:19"
    ],
    "relatedPeople": [
      "jacob"
    ],
    "relatedEvents": [
      "ev-jacob_bethel"
    ],
    "x": 150,
    "y": 3930
  },
  {
    "id": "loc-peniel",
    "name": "브니엘 (Peniel)",
    "desc": "하나님의 얼굴이라는 뜻으로, 야곱이 얍복 나루에서 하나님의 사자와 밤새 씨름하여 '이스라엘'이라는 이름을 얻은 곳.",
    "refs": [
      "창세기 32:30"
    ],
    "relatedPeople": [
      "jacob"
    ],
    "relatedEvents": [
      "ev-jacob_peniel"
    ],
    "x": 150,
    "y": 3990
  },
  {
    "id": "loc-hebron",
    "name": "헤브론 막벨라 굴 (Cave of Machpelah)",
    "desc": "아브라함이 사라를 장사하기 위해 매입한 굴로, 아브라함, 사라, 이삭, 리브가, 야곱, 레아가 묻힌 족장들의 묘실.",
    "refs": [
      "창세기 23:19",
      "창세기 49:30"
    ],
    "relatedPeople": [
      "abraham",
      "sarah",
      "isaac",
      "jacob"
    ],
    "relatedEvents": [
      "ev-machpelah_buy"
    ],
    "x": 120,
    "y": 3610
  },
  {
    "id": "loc-goshen",
    "name": "애굽 고센 땅 (Goshen in Egypt)",
    "desc": "가나안 기근 때 요셉의 초청으로 입성한 야곱의 가족들이 정착하여 번성한 비옥한 목초지.",
    "refs": [
      "창세기 47:6"
    ],
    "relatedPeople": [
      "jacob",
      "joseph"
    ],
    "relatedEvents": [
      "ev-goshen_migration"
    ],
    "x": 350,
    "y": 4080
  },
  {
    "id": "loc-nile",
    "name": "나일강 (Nile River)",
    "desc": "바로의 히브리 유아 학살 명령 속에서 모세가 갈대 상자에 담겨 떠내려가다 바로의 딸에게 구출된 강.",
    "refs": [
      "출애굽기 2:3",
      "출애굽기 2:5"
    ],
    "relatedPeople": [
      "moses",
      "jochebed"
    ],
    "relatedEvents": [
      "ev-moses_rescue"
    ],
    "x": -5900,
    "y": 4560
  },
  {
    "id": "loc-midian",
    "name": "미디안 광야 (Midian Wilderness)",
    "desc": "모세가 애굽 사람을 죽인 후 도망하여 40년간 목자로 살았던 땅이자 호렙산 떨기나무에서 하나님의 부르심을 받은 곳.",
    "refs": [
      "출애굽기 2:15",
      "출애굽기 3:1"
    ],
    "relatedPeople": [
      "moses",
      "zipporah"
    ],
    "relatedEvents": [
      "ev-burning_bush"
    ],
    "x": -6100,
    "y": 4620
  },
  {
    "id": "loc-pharaoh_palace",
    "name": "애굽 바로의 궁전 (Pharaoh's Palace)",
    "desc": "모세와 아론이 이스라엘 백성의 해방을 요구하며 바로와 대치하고 열 가지 재앙을 선포했던 궁전.",
    "refs": [
      "출애굽기 5:1",
      "출애굽기 7:10"
    ],
    "relatedPeople": [
      "moses",
      "aaron"
    ],
    "relatedEvents": [
      "ev-ten_plagues"
    ],
    "x": -5600,
    "y": 4560
  },
  {
    "id": "loc-red_sea",
    "name": "홍해 (Red Sea)",
    "desc": "뒤쫓아오는 애굽 군대 앞에서 모세가 지팡이를 내밀어 밤새 동풍으로 바다를 가르고 마른 땅처럼 건넌 기적의 바다.",
    "refs": [
      "출애굽기 14:21",
      "출애굽기 14:22"
    ],
    "relatedPeople": [
      "moses",
      "aaron"
    ],
    "relatedEvents": [
      "ev-crossing_red_sea"
    ],
    "x": -5900,
    "y": 4740
  },
  {
    "id": "loc-sinai",
    "name": "시내산 (Mount Sinai)",
    "desc": "출애굽한 이스라엘 백성들이 당도하여 하나님과 언약을 맺고 모세가 십계명과 성막 설계도를 받은 성산.",
    "refs": [
      "출애굽기 19:11",
      "출애굽기 20:1"
    ],
    "relatedPeople": [
      "moses"
    ],
    "relatedEvents": [
      "ev-ten_commandments"
    ],
    "x": -5900,
    "y": 4860
  },
  {
    "id": "loc-kadesh",
    "name": "가데스 바네아 (Kadesh Barnea)",
    "desc": "가나안 접경 지역으로, 각 지파별로 12명의 정탐꾼을 보내 가나안 땅을 탐지하고 보고를 들었던 역사적 광야 기지.",
    "refs": [
      "민수기 13:26",
      "신명기 1:19"
    ],
    "relatedPeople": [
      "moses",
      "joshua_eph",
      "caleb_jephunneh"
    ],
    "relatedEvents": [
      "ev-kadesh_spies"
    ],
    "x": -5900,
    "y": 4980
  },
  {
    "id": "loc-nebo",
    "name": "느보산 비스가산대 (Mount Nebo)",
    "desc": "모세가 약속의 땅 가나안을 멀리 바라본 후, 들어가지 못하고 120세로 생을 마감한 모압 땅의 산.",
    "refs": [
      "신명기 34:1",
      "신명기 34:5"
    ],
    "relatedPeople": [
      "moses"
    ],
    "relatedEvents": [
      "ev-moses_death"
    ],
    "x": -5700,
    "y": 4900
  },
  {
    "id": "loc-jordan",
    "name": "요단강 (Jordan River)",
    "desc": "여호수아의 인도 하에 제사장들이 언약궤를 메고 물에 발을 딛자 흐르던 강물이 멈추어 마른 땅으로 건넌 약속의 땅 관문.",
    "refs": [
      "여호수아 3:15",
      "여호수아 3:17"
    ],
    "relatedPeople": [
      "joshua_eph"
    ],
    "relatedEvents": [
      "ev-crossing_jordan"
    ],
    "x": -200,
    "y": 5160
  },
  {
    "id": "loc-jericho",
    "name": "여리고 (Jericho)",
    "desc": "가나안 첫 성읍으로, 정탐꾼을 숨긴 라합의 집이 있던 곳이며 언약궤를 메고 성을 7일간 돌아 무너뜨린 기적의 성.",
    "refs": [
      "여호수아 2:1",
      "여호수아 6:20"
    ],
    "relatedPeople": [
      "joshua_eph",
      "rahab"
    ],
    "relatedEvents": [
      "ev-fall_of_jericho"
    ],
    "x": -200,
    "y": 5220
  },
  {
    "id": "loc-shiloh",
    "name": "실로 (Shiloh)",
    "desc": "사사 시대 성막과 언약궤가 오랫동안 위치했던 영적 중심지이자 어린 사무엘이 하나님의 음성을 듣고 소명을 받은 곳.",
    "refs": [
      "여호수아 18:1",
      "사무엘상 3:21"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedEvents": [
      "ev-samuel_call"
    ],
    "x": 100,
    "y": 5580
  },
  {
    "id": "loc-bethlehem",
    "name": "베들레헴 (Bethlehem)",
    "desc": "룻과 보아스의 만남이 성취된 곳이자 다윗 왕의 고향이며, 선지자 사무엘이 이새의 아들 다윗에게 기름을 부어 왕으로 세운 떡집의 땅.",
    "refs": [
      "룻기 1:22",
      "사무엘상 16:1"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedEvents": [
      "ev-david_anointed"
    ],
    "x": 120,
    "y": 5820
  },
  {
    "id": "loc-elah",
    "name": "엘라 골짜기 (Valley of Elah)",
    "desc": "블레셋 군대와 이스라엘 군대가 대치하던 중, 소년 다윗이 물맷돌 5개와 만군의 여호와의 이름으로 거인 골리앗을 쓰러뜨린 전쟁터.",
    "refs": [
      "사무엘상 17:2",
      "사무엘상 17:49"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedEvents": [
      "ev-david_goliath"
    ],
    "x": 50,
    "y": 5940
  },
  {
    "id": "loc-jerusalem",
    "name": "예루살렘 성전산 (Mount Moriah Temple)",
    "desc": "다윗이 오르난의 타작마당을 매입해 예배한 터로, 솔로몬 왕이 이스라엘 영광의 상징인 제1성전을 건축하여 헌당한 장소.",
    "refs": [
      "역대하 3:1",
      "열왕기상 8:1"
    ],
    "relatedPeople": [
      "david",
      "solomon"
    ],
    "relatedEvents": [
      "ev-temple_building"
    ],
    "x": 120,
    "y": 6060
  },
  {
    "id": "loc-carmel",
    "name": "갈멜산 (Mount Carmel)",
    "desc": "선지자 엘리야가 바알과 아세라 선지자 850명과 대결하여 여호와의 제단에 불이 내리게 함으로써 참 신이 누구인지 입증한 산.",
    "refs": [
      "열왕기상 18:19",
      "열왕기상 18:38"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedEvents": [
      "ev-elijah_fire"
    ],
    "x": -450,
    "y": 6960
  },
  {
    "id": "loc-babylon",
    "name": "바벨론 강가 (Rivers of Babylon)",
    "desc": "예루살렘 멸망 이후 유다 백성들이 포로로 잡혀가 눈물로 시온을 기억하며 수금을 나무에 걸었던 슬픔과 탄식의 유배지.",
    "refs": [
      "시편 137:1",
      "열왕기하 25:11"
    ],
    "relatedPeople": [
      "jeconiah"
    ],
    "relatedEvents": [
      "ev-babylon_captivity"
    ],
    "x": 400,
    "y": 8220
  },
  {
    "id": "loc-second_temple",
    "name": "예루살렘 제2성전 터 (Second Temple Ruins)",
    "desc": "바벨론 포로에서 귀환한 유다 백성들이 총독 스룹바벨의 주도 하에 눈물과 기쁨 속에 재건한 하나님의 성전.",
    "refs": [
      "에스라 3:8",
      "에스라 6:15"
    ],
    "relatedPeople": [
      "zerubbabel"
    ],
    "relatedEvents": [
      "ev-temple_rebuild"
    ],
    "x": 120,
    "y": 9444
  },
  {
    "id": "loc-jerusalem_walls",
    "name": "예루살렘 성벽 (Jerusalem Walls)",
    "desc": "느헤미야 총독의 헌신과 이스라엘 백성들의 일치단결로 방해자들의 위협 속에서도 52일 만에 중건한 예루살렘 성벽 성곽.",
    "refs": [
      "느헤미야 2:17",
      "느헤미야 6:15"
    ],
    "relatedPeople": [
      "zerubbabel"
    ],
    "relatedEvents": [
      "ev-walls_rebuild"
    ],
    "x": 120,
    "y": 9550
  }
];

const DEFAULT_EVENTS = [
  {
    "id": "ev-eden_sin",
    "name": "선악과 사건과 인류의 타락 (Fall of Man)",
    "desc": "뱀의 유혹으로 하와와 아담이 선악과를 먹고 하나님의 명령을 어겨 에덴동산에서 추방당하고 인류에 죄가 들어온 사건.",
    "refs": [
      "창세기 3:6",
      "창세기 3:23"
    ],
    "relatedPeople": [
      "adam",
      "eve"
    ],
    "relatedLocations": [
      "loc-eden"
    ],
    "x": 240,
    "y": 150
  },
  {
    "id": "ev-cain_abel",
    "name": "가인의 아벨 살인 사건 (Cain and Abel)",
    "desc": "하나님께서 아벨의 제사만 받으시자 이에 분노한 형 가인이 들판에서 아우 아벨을 돌로 쳐 죽인 인류 최초의 살인 사건.",
    "refs": [
      "창세기 4:8"
    ],
    "relatedPeople": [
      "cain",
      "abel"
    ],
    "relatedLocations": [
      "loc-east_eden"
    ],
    "x": -310,
    "y": 330
  },
  {
    "id": "ev-enoch_ascension",
    "name": "에녹의 하나님 동행과 승천 (Enoch's Translation)",
    "desc": "에녹이 65세에 므두셀라를 낳고 300년 동안 하나님과 동행하다가, 하나님이 그를 데려가시므로 세상에 있지 아니한 신비한 사건.",
    "refs": [
      "창세기 5:24"
    ],
    "relatedPeople": [
      "enoch_seth",
      "methuselah"
    ],
    "relatedLocations": [
      "loc-eden"
    ],
    "x": 240,
    "y": 150
  },
  {
    "id": "ev-noah_flood",
    "name": "노아의 방주와 대홍수 심판 (Noah's Flood)",
    "desc": "온 세상의 해악이 가득 참에 분노하신 하나님께서 40일 동안 비를 내려 전 지구를 홍수로 심판하시고 노아의 여덟 식구만 구원하신 사건.",
    "refs": [
      "창세기 7:11",
      "창세기 7:23"
    ],
    "relatedPeople": [
      "noah",
      "shem",
      "ham",
      "japheth"
    ],
    "relatedLocations": [
      "loc-ararat"
    ],
    "x": 240,
    "y": 1770
  },
  {
    "id": "ev-babel_tower",
    "name": "바벨탑 건설과 언어의 혼잡 (Tower of Babel)",
    "desc": "인류가 하늘에 닿는 탑을 쌓아 자기 이름을 내고 흩어짐을 면하려 하자, 하나님이 언어를 혼잡하게 하사 온 지면에 흩으신 심판.",
    "refs": [
      "창세기 11:4",
      "창세기 11:9"
    ],
    "relatedPeople": [
      "noah"
    ],
    "relatedLocations": [
      "loc-shinar"
    ],
    "x": 370,
    "y": 2130
  },
  {
    "id": "ev-abraham_haran",
    "name": "아브라함의 갈대아 우르 및 하란 소명 (Call of Abraham)",
    "desc": "본토 친척 아비 집을 떠나 보여줄 땅으로 가라는 하나님의 명령에 순종하여 75세에 아브라함이 믿음의 여정을 시작한 사건.",
    "refs": [
      "창세기 12:1",
      "창세기 12:4"
    ],
    "relatedPeople": [
      "terah",
      "abraham",
      "sarah"
    ],
    "relatedLocations": [
      "loc-haran"
    ],
    "x": 190,
    "y": 3480
  },
  {
    "id": "ev-abraham_shechem",
    "name": "세겜에서의 첫 단 축조와 약속 (Abraham's Altar at Shechem)",
    "desc": "약속의 땅 가나안에 들어온 아브라함에게 하나님이 나타나 '이 땅을 네 자손에게 주리라' 하시자 제단을 쌓아 예배한 사건.",
    "refs": [
      "창세기 12:7"
    ],
    "relatedPeople": [
      "abraham"
    ],
    "relatedLocations": [
      "loc-shechem"
    ],
    "x": 240,
    "y": 3570
  },
  {
    "id": "ev-sodom_destruction",
    "name": "소돔과 고모라의 유황불 비 심판 (Destruction of Sodom)",
    "desc": "소돔성 주민들의 죄악이 심히 무거움으로 하늘에서 유황과 불이 비처럼 내려와 성읍들과 그곳에 살던 생물들을 완전히 소멸시킨 사건.",
    "refs": [
      "창세기 19:24"
    ],
    "relatedPeople": [
      "lot",
      "abraham"
    ],
    "relatedLocations": [
      "loc-sodom"
    ],
    "x": -110,
    "y": 3540
  },
  {
    "id": "ev-isaac_offering",
    "name": "독자 이삭의 모리아산 번제 봉헌 (Binding of Isaac)",
    "desc": "하나님이 아브라함의 믿음을 시험하고자 백세에 얻은 외아들 이삭을 바치라 하실 때, 칼을 들어 드리려 하자 야훼 이레로 수양을 준비하신 사건.",
    "refs": [
      "창세기 22:10",
      "창세기 22:13"
    ],
    "relatedPeople": [
      "abraham",
      "isaac"
    ],
    "relatedLocations": [
      "loc-moriah"
    ],
    "x": 240,
    "y": 3660
  },
  {
    "id": "ev-isaac_covenant",
    "name": "이삭의 브엘세바 평화 언약 체결 (Isaac's Covenant at Beersheba)",
    "desc": "이삭이 그랄 목자들과의 우물 분쟁을 평화롭게 온유함으로 해결한 후, 아비멜렉 왕이 스스로 찾아와 여호와가 함께하심을 고백하고 맺은 맹세.",
    "refs": [
      "창세기 26:28",
      "창세기 26:31"
    ],
    "relatedPeople": [
      "abraham",
      "isaac"
    ],
    "relatedLocations": [
      "loc-beersheba"
    ],
    "x": 240,
    "y": 3750
  },
  {
    "id": "ev-jacob_bethel",
    "name": "야곱의 벧엘 사다리 꿈과 서원 (Jacob's Ladder at Bethel)",
    "desc": "형 에서의 낯을 피해 도망하던 중 광야에서 잠든 야곱에게 하나님이 하늘 사다리 환상으로 나타나 임마누엘 동행을 약속해 주신 은혜의 서원.",
    "refs": [
      "창세기 28:12",
      "창세기 28:15"
    ],
    "relatedPeople": [
      "jacob"
    ],
    "relatedLocations": [
      "loc-bethel"
    ],
    "x": 240,
    "y": 3930
  },
  {
    "id": "ev-jacob_peniel",
    "name": "야곱의 얍복강가 천사 씨름과 이스라엘 축복 (Jacob wrestles at Peniel)",
    "desc": "에서와의 해후를 앞두고 두려움 속에 홀로 남은 야곱이 하나님의 사자와 밤새 목숨 걸고 씨름하다 환도뼈가 부러지며 '이스라엘'로 개명한 축복.",
    "refs": [
      "창세기 32:24",
      "창세기 32:28"
    ],
    "relatedPeople": [
      "jacob"
    ],
    "relatedLocations": [
      "loc-peniel"
    ],
    "x": 240,
    "y": 3990
  },
  {
    "id": "ev-machpelah_buy",
    "name": "아브라함의 막벨라 굴 묘실 매입 사건 (Purchase of Machpelah)",
    "desc": "가나안 헷 족속에게서 은 사백 세겔을 주고 밭과 굴을 정식 매입하여 영구 기업의 묘실로 삼아 향후 3대 족장이 그곳에 함께 묻힌 사건.",
    "refs": [
      "창세기 23:16",
      "창세기 23:18"
    ],
    "relatedPeople": [
      "abraham",
      "sarah",
      "isaac",
      "jacob"
    ],
    "relatedLocations": [
      "loc-hebron"
    ],
    "x": 210,
    "y": 3610
  },
  {
    "id": "ev-goshen_migration",
    "name": "야곱 온 가족의 고센 땅 애굽 이주 (Jacob's Migration to Egypt)",
    "desc": "전례 없는 기근 속에서 요셉의 통치권 하에 있던 애굽으로 70명의 야곱 권속이 수레를 타고 정착하여 거대한 민족의 기틀을 마련한 사건.",
    "refs": [
      "창세기 46:27",
      "창세기 47:1"
    ],
    "relatedPeople": [
      "jacob",
      "joseph"
    ],
    "relatedLocations": [
      "loc-goshen"
    ],
    "x": 440,
    "y": 4080
  },
  {
    "id": "ev-moses_rescue",
    "name": "아기 모세의 갈대 상자 나일강 방류와 구조 (Finding of Moses)",
    "desc": "히브리 남아가 태어나면 죽이라는 바로의 서슬 퍼런 명령 속에 역청을 칠한 상자에 담긴 아기가 나일강에서 건짐을 받아 바로 왕궁의 왕자가 된 사건.",
    "refs": [
      "출애굽기 2:3",
      "출애굽기 2:10"
    ],
    "relatedPeople": [
      "moses",
      "jochebed"
    ],
    "relatedLocations": [
      "loc-nile"
    ],
    "x": -5810,
    "y": 4560
  },
  {
    "id": "ev-burning_bush",
    "name": "호렙산 떨기나무 불꽃 소명 수여 (Moses and the Burning Bush)",
    "desc": "양을 치던 80세의 노인 모세에게 타지 않는 불꽃 떨기나무 가운데서 여호와 하나님이 나타나 이스라엘의 구원자로 세우시며 '스스로 계신 자'를 밝히신 소명.",
    "refs": [
      "출애굽기 3:2",
      "출애굽기 3:14"
    ],
    "relatedPeople": [
      "moses",
      "zipporah"
    ],
    "relatedLocations": [
      "loc-midian"
    ],
    "x": -6010,
    "y": 4620
  },
  {
    "id": "ev-ten_plagues",
    "name": "애굽에 내린 여호와의 열 가지 재앙 심판 (Ten Plagues of Egypt)",
    "desc": "완악한 바로가 백성을 보내지 않자 모세와 아론을 통해 나일강이 피로 변하는 재앙부터 장자의 죽음에 이르기까지 애굽의 우상들을 징벌하신 심판.",
    "refs": [
      "출애굽기 7:20",
      "출애굽기 12:29"
    ],
    "relatedPeople": [
      "moses",
      "aaron"
    ],
    "relatedLocations": [
      "loc-pharaoh_palace"
    ],
    "x": -5510,
    "y": 4560
  },
  {
    "id": "ev-crossing_red_sea",
    "name": "홍해 바다의 갈라짐과 애굽 군대 몰살 (Crossing the Red Sea)",
    "desc": "진퇴양난의 홍해 앞에서 모세가 지팡이로 바다를 갈라 밤새 마른 땅으로 이스라엘 백성을 건너게 하시고, 뒤쫓던 애굽 마병들을 수장시키신 해방의 기적.",
    "refs": [
      "출애굽기 14:21",
      "출애굽기 14:28"
    ],
    "relatedPeople": [
      "moses",
      "aaron"
    ],
    "relatedLocations": [
      "loc-red_sea"
    ],
    "x": -5810,
    "y": 4740
  },
  {
    "id": "ev-ten_commandments",
    "name": "시내산 십계명 돌판 수여와 언약 (The Ten Commandments)",
    "desc": "번개와 빽빽한 구름이 덮인 시내산 정상에서 모세가 하나님과 단독 대면하여 두 돌판에 새겨진 십계명 율법과 성막 법령을 받아 백성에게 공포한 일.",
    "refs": [
      "출애굽기 20:1",
      "출애굽기 31:18"
    ],
    "relatedPeople": [
      "moses"
    ],
    "relatedLocations": [
      "loc-sinai"
    ],
    "x": -5810,
    "y": 4860
  },
  {
    "id": "ev-kadesh_spies",
    "name": "가데스 바네아 12정탐꾼의 보고와 심판 (The 12 Spies at Kadesh)",
    "desc": "가나안을 탐지하고 돌아온 10명의 부정적인 정탐꾼과 백성의 통곡으로 인해, 하나님이 진노하사 가나안 입국을 거부한 세대를 광야 40년 동안 방황하게 하신 심판.",
    "refs": [
      "민수기 14:1",
      "민수기 14:34"
    ],
    "relatedPeople": [
      "moses",
      "joshua_eph",
      "caleb_jephunneh"
    ],
    "relatedLocations": [
      "loc-kadesh"
    ],
    "x": -5810,
    "y": 4980
  },
  {
    "id": "ev-moses_death",
    "name": "느보산에서의 가나안 조망과 모세의 죽음 (Death of Moses)",
    "desc": "화가 나 므리바 반석을 지팡이로 두 번 침으로 하나님의 거룩함을 가린 모세가, 약속의 땅 가나안을 요단강 건너편 느보산에서 바라만 본 채 별세한 종말.",
    "refs": [
      "신명기 34:5",
      "신명기 34:6"
    ],
    "relatedPeople": [
      "moses"
    ],
    "relatedLocations": [
      "loc-nebo"
    ],
    "x": -5610,
    "y": 4900
  },
  {
    "id": "ev-crossing_jordan",
    "name": "요단강 물의 멈춤과 마른 땅 도하 (Crossing of Jordan)",
    "desc": "제사장들의 언약궤 멘 발이 가득 차 흐르던 요단강 상류에 닿자, 흐르던 물이 사르단에 이르기까지 둑처럼 일어서 멈추고 온 이스라엘이 마른 땅으로 강을 건넌 이적.",
    "refs": [
      "여호수아 3:16",
      "여호수아 3:17"
    ],
    "relatedPeople": [
      "joshua_eph"
    ],
    "relatedLocations": [
      "loc-jordan"
    ],
    "x": -110,
    "y": 5160
  },
  {
    "id": "ev-fall_of_jericho",
    "name": "여리고성의 7일간의 순행과 성벽 함락 (Fall of Jericho)",
    "desc": "하루에 성을 한 바퀴씩 돌고 일곱째 날에 일곱 번 돌며 양각 나팔 소리와 함께 백성들이 일제히 큰 소리로 외치자 난공불락의 견고한 여리고 성벽이 와르르 무너져 내린 함락.",
    "refs": [
      "여호수아 6:15",
      "여호수아 6:20"
    ],
    "relatedPeople": [
      "joshua_eph",
      "rahab"
    ],
    "relatedLocations": [
      "loc-jericho"
    ],
    "x": -110,
    "y": 5220
  },
  {
    "id": "ev-samuel_call",
    "name": "실로 성막 안의 어린 사무엘 소명 (Call of Samuel)",
    "desc": "엘리 제사장의 눈이 어두워져 실로의 등불이 꺼져갈 때, 성막 안 여호와의 궤 곁에 누워있던 어린 사무엘을 하나님이 이름을 불러 불러 선지자로 세우신 소명.",
    "refs": [
      "사무엘상 3:4",
      "사무엘상 3:10"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedLocations": [
      "loc-shiloh"
    ],
    "x": 190,
    "y": 5580
  },
  {
    "id": "ev-david_anointed",
    "name": "사무엘의 이새 아들 다윗 기름 부음 (David Anointed by Samuel)",
    "desc": "사울 왕을 폐하고 새 왕을 세우려 하신 하나님의 지시로 베들레헴 이새의 집에 당도한 사무엘이, 막내인 양치기 소년 다윗에게 기름을 붓자 하나님의 신이 임한 사건.",
    "refs": [
      "사무엘상 16:12",
      "사무엘상 16:13"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedLocations": [
      "loc-bethlehem"
    ],
    "x": 210,
    "y": 5820
  },
  {
    "id": "ev-david_goliath",
    "name": "소년 다윗과 거인 골리앗의 물맷돌 결투 (David and Goliath)",
    "desc": "갑옷을 입지 않고 물매와 시냇가의 매끄러운 돌 5개만 가지고 나가, 하나님의 이름을 모욕하는 블레셋의 3미터 거구 장수 골리앗의 이마를 단 한 방으로 맞추어 죽인 승리.",
    "refs": [
      "사무엘상 17:45",
      "사무엘상 17:49"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedLocations": [
      "loc-elah"
    ],
    "x": 140,
    "y": 5940
  },
  {
    "id": "ev-temple_building",
    "name": "솔로몬의 예루살렘 성전 건축 준공 봉헌 (Dedicating Solomon's Temple)",
    "desc": "다윗이 성전 준비를 마치고 아들 솔로몬이 즉위하여 예루살렘 모리아산 터에 7년 반 동안 영광스러운 대성전을 건축하여 지성소에 언약궤를 입당시키며 봉헌한 사건.",
    "refs": [
      "열왕기상 6:38",
      "열왕기상 8:10"
    ],
    "relatedPeople": [
      "david",
      "solomon"
    ],
    "relatedLocations": [
      "loc-jerusalem"
    ],
    "x": 210,
    "y": 6060
  },
  {
    "id": "ev-elijah_fire",
    "name": "선지자 엘리야의 갈멜산 번제 불 응답 (Elijah's Carmel Victory)",
    "desc": "백성과 아합 왕 앞에서 여호와를 잊고 바알을 섬기는 자들과 대결할 때, 밤낮 기도해도 반응 없는 바알과 달리 엘리야의 번제 제단에 야훼의 불이 임해 도랑의 물을 핥은 참 신의 역사.",
    "refs": [
      "열왕기상 18:36",
      "열왕기상 18:38"
    ],
    "relatedPeople": [
      "david"
    ],
    "relatedLocations": [
      "loc-carmel"
    ],
    "x": -360,
    "y": 6960
  },
  {
    "id": "ev-babylon_captivity",
    "name": "유다 왕국의 패망과 바벨론 강제 유배 (Babylonian Captivity)",
    "desc": "여호와의 목전에 악을 행하던 유다 왕국이 결국 느부갓네살 왕의 바벨론 제국 군대에 의해 성전이 불타고 성벽이 허물어지며 귀인과 백성들이 포로로 끌려간 수치와 심판의 비극.",
    "refs": [
      "열왕기하 25:9",
      "열왕기하 25:11"
    ],
    "relatedPeople": [
      "jeconiah"
    ],
    "relatedLocations": [
      "loc-babylon"
    ],
    "x": 490,
    "y": 8220
  },
  {
    "id": "ev-temple_rebuild",
    "name": "스룹바벨의 성전 재건 공사 필역 (Rebuilding the Temple)",
    "desc": "고레스 왕의 조서로 포로 귀환한 유다 백성들이 대적들의 끈질긴 방해와 중단 압박 속에서도 학개와 스가랴 선지자의 격려 속에 성전 기초를 놓고 완공하여 봉헌한 감격의 역사.",
    "refs": [
      "에스라 5:2",
      "에스라 6:15"
    ],
    "relatedPeople": [
      "zerubbabel"
    ],
    "relatedLocations": [
      "loc-second_temple"
    ],
    "x": 210,
    "y": 9444
  },
  {
    "id": "ev-walls_rebuild",
    "name": "느헤미야의 예루살렘 성벽 성곽 중건 완공 (Rebuilding Jerusalem's Walls)",
    "desc": "예루살렘 성벽이 허물어지고 성문이 소화되었다는 소식을 듣고 눈물로 기도한 술관원 느헤미야가, 총독으로 부임해 대적들의 방해 속에 한 손엔 병기를 들고 52일 만에 성벽을 완성한 중건.",
    "refs": [
      "느헤미야 4:17",
      "느헤미야 6:15"
    ],
    "relatedPeople": [
      "zerubbabel"
    ],
    "relatedLocations": [
      "loc-jerusalem_walls"
    ],
    "x": 210,
    "y": 9550
  }
];

let db = [];
let lineBends = {};
let events = [];
let locations = [];
// Style Editor Settings (Loads from LocalStorage or Defaults)
let styleSettings = {
  lineColor: '#ff7800',
  mainLineColor: '#ff7800',
  spouseLineColor: '#ef4444',
  preacherLineColor: '#ff7800',
  lineWidth: 3,
  cornerRadius: 12,
  splitOffset: 90,
  lineType: 'orthogonal',
  siblingGap: 7
};

// State Variables
let currentScale = 1.0;
const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;
const ZOOM_STEP = 0.15;

let isDragging = false;
let startX, startY;
let panX = 0;
let panY = 0;
let startPanX = 0;
let startPanY = 0;
let initialCentered = false;
let targetScale = 1.0;
let targetPanX = 0;
let targetPanY = 0;
let isZoomAnimating = false;
let scaleAtAnimationStart = 1.0;

// Touch Zoom/Pan State
let touchStartDistance = 0;
let touchStartScale = 1.0;
let isTouchZooming = false;
let touchStartPanX = 0;
let touchStartPanY = 0;
let lastTouchX = 0;
let lastTouchY = 0;
let lastTouchTime = 0;
let velocityX = 0;
let velocityY = 0;
let inertiaFrameId = null;
const friction = 0.95;

function stopInertia() {
  if (inertiaFrameId) {
    cancelAnimationFrame(inertiaFrameId);
    inertiaFrameId = null;
  }
  velocityX = 0;
  velocityY = 0;
}

// Selected person for study panel
let activePersonId = null;
let wasOpenedFromFilter = false;
let activeStudyPanelType = null;
let selectedPersonId = null;
let activeLayerItem = null;
let activeLayerType = null;
let isLayerItemAddMode = false;
let newLayerItemCoords = { x: 0, y: 0 };
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
let lineZIndices = {}; // Custom z-order weights for connection lines (maps line key to numeric z-index)
let coupleMidpoints = {}; // Midpoints for spouse lines
let customPolygons = []; // Custom arbitrary polygons (filled regions)
let selectedPolygonId = null; // Selected custom polygon ID
let isAddPolygonModeActive = false; // Add Polygon mode toggle state
let tempPolygonPoints = []; // Uncommitted drawing points for new polygon

// Stable board dimensions variables to prevent layout deforming on card move
let stableBoardWidth = null;
let stableBoardHeight = null;
let stableCenterX = null;
let centerX = 0;
let boardWidth = 0;
let boardHeight = 0;

// Filter Settings
const charGroups = {};
let activeFilters = {
  cain: false,
  japheth: false,
  ham: false,
  joktan: false,
  keturah: false,
  ishmael: false,
  esau: false,
  mary: false,
  north_kings: false,
  independent_1chr4: false,
  levite_priests: false,
  horite_chiefs: false,
  reuben_simeon: false
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
    customVisualLines: localStorage.getItem('bible_tree_custom_visual_lines'),
    canvasJunctions: localStorage.getItem('bible_tree_canvas_junctions'),
    customPolygons: localStorage.getItem('bible_tree_custom_polygons'),
    events: localStorage.getItem('bible_tree_events'),
    locations: localStorage.getItem('bible_tree_locations')
  };
  undoStack.push(state);
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift();
  }
  redoStack = []; // Clear redo stack on new action
  updateHistoryButtonsState();
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
    customVisualLines: localStorage.getItem('bible_tree_custom_visual_lines'),
    canvasJunctions: localStorage.getItem('bible_tree_canvas_junctions'),
    customPolygons: localStorage.getItem('bible_tree_custom_polygons')
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
    customVisualLines: localStorage.getItem('bible_tree_custom_visual_lines'),
    canvasJunctions: localStorage.getItem('bible_tree_canvas_junctions'),
    customPolygons: localStorage.getItem('bible_tree_custom_polygons')
  };
  undoStack.push(currentState);
  
  // Restore next state
  const nextState = redoStack.pop();
  restoreState(nextState);
  
  showToast("작업을 다시 실행했습니다 (Ctrl+Y).");
}

function restoreState(state) {
  // Clear last center tracker to prevent layout-shift shifting of restored state coordinates
  localStorage.removeItem('bible_tree_last_center_x');
  
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
  
  if (state.canvasJunctions) localStorage.setItem('bible_tree_canvas_junctions', state.canvasJunctions);
  else localStorage.removeItem('bible_tree_canvas_junctions');
  
  if (state.customPolygons) localStorage.setItem('bible_tree_custom_polygons', state.customPolygons);
  else localStorage.removeItem('bible_tree_custom_polygons');
  
  // Reload structures
  loadCanvasJunctions();
  loadCustomPolygons();
  
  initDatabase();
  initBoard();
  renderTree();
  updateHistoryButtonsState();
}

function updateHistoryButtonsState() {
  const undoBtn = document.getElementById('admin-undo-btn');
  const redoBtn = document.getElementById('admin-redo-btn');
  
  if (undoBtn) {
    if (undoStack.length > 0) {
      undoBtn.disabled = false;
      undoBtn.style.opacity = "1";
      undoBtn.style.cursor = "pointer";
    } else {
      undoBtn.disabled = true;
      undoBtn.style.opacity = "0.5";
      undoBtn.style.cursor = "not-allowed";
    }
  }
  if (redoBtn) {
    if (redoStack.length > 0) {
      redoBtn.disabled = false;
      redoBtn.style.opacity = "1";
      redoBtn.style.cursor = "pointer";
    } else {
      redoBtn.disabled = true;
      redoBtn.style.opacity = "0.5";
      redoBtn.style.cursor = "not-allowed";
    }
  }
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

  if (activeSpawnerItem && e.key === 'Escape') {
    e.preventDefault();
    cancelPlacementMode();
    showToast("복사 배치가 취소되었습니다.");
    return;
  }

  if (isAddAnnotationModeActive && e.key === 'Escape') {
    e.preventDefault();
    deactivateAddAnnotationMode();
    showToast("텍스트 상자 추가가 취소되었습니다.");
    return;
  }

  // Handle Add Polygon Mode shortcuts
  if (isAddPolygonModeActive) {
    if (e.key === 'Escape') {
      e.preventDefault();
      deactivateAddPolygonMode();
      showToast("다각형 영역 추가가 취소되었습니다.");
      renderTree();
      updateTransform();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      completePolygonCreation();
      return;
    }
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
    if (selectedPolygonId) {
      e.preventDefault();
      const poly = customPolygons.find(p => p.id === selectedPolygonId);
      if (poly && confirm(`선택한 영역 "${poly.label}"을(를) 삭제하시겠습니까?`)) {
        pushHistoryState();
        customPolygons = customPolygons.filter(p => p.id !== selectedPolygonId);
        selectedPolygonId = null;
        saveCustomPolygons();
        renderTree();
        updateTransform();
        showToast("영역이 삭제되었습니다.");
      }
    } else if (selectedLineKey) {
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
  
  const isTeacherLine = selectedLineKey.startsWith('teacher-') || selectedLineKey.startsWith('preacher-');
  const isSpouseLine = selectedLineKey.includes('+') && !isSingleRelationLine && !isCustomLine && !isTeacherLine;
  
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
  } else if (isTeacherLine) {
    if (confirm("선택한 전도자 연결선을 삭제하시겠습니까?\n이 작업은 해당 인물의 전도자 ID 목록에서 상대방을 해제(삭제)합니다.")) {
      pushHistoryState();
      const prefix = selectedLineKey.startsWith('teacher-') ? 'teacher-' : 'preacher-';
      const relContent = selectedLineKey.replace(prefix, '');
      const arrowParts = relContent.split('->');
      const teacherId = arrowParts[0];
      const discipleId = arrowParts[1];
      
      db.forEach(c => {
        if (c.id === discipleId && Array.isArray(c.teachers)) {
          c.teachers = c.teachers.filter(t => t !== teacherId);
          c.isManual = true;
        }
      });
      
      delete lineBends[selectedLineKey];
      selectedLineKey = null;
      
      saveDatabase();
      saveLineBends();
      initBoard();
      renderTree();
      showToast("선택한 전도자 연결선이 해제되었습니다.");
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
let cachedAdminPassword = '';
let editingPersonId = null; // null means adding a new person
let isAddPersonModeActive = false;
let isAddAnnotationModeActive = false;
let activeSpawnerItem = null;
let activeSpawnerType = null;

// DOM Elements
const viewerContainer = document.getElementById('viewer-container');
const zoomWrapper = document.getElementById('zoom-wrapper');
const treeBoard = document.getElementById('tree-board');
const svgLayer = document.getElementById('svg-layer');

// Recreates the SVG filter inside svgLayer whenever it is cleared to prevent losing the glow filter.
function clearSvgLayer() {
  svgLayer.innerHTML = `
    <defs>
      <filter id="line-glow-filter" filterUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
}
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
const adminAddPolygonBtn = document.getElementById('admin-add-polygon-btn');
const adminAddEventBtn = document.getElementById('admin-add-event-btn');
const adminAddLocationBtn = document.getElementById('admin-add-location-btn');
const adminExportBtn = document.getElementById('admin-export-btn');
const adminSyncBtn = document.getElementById('admin-sync-btn');
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

// Layer Item Modal Elements
const layerItemModal = document.getElementById('layer-item-modal');
const layerItemModalTitle = document.getElementById('layer-item-modal-title');
const layerItemModalClose = document.getElementById('layer-item-modal-close');
const layerItemModalCancel = document.getElementById('layer-item-modal-cancel');
const layerItemForm = document.getElementById('layer-item-form');
const layerItemDeleteBtn = document.getElementById('layer-item-delete-btn');

// Style Editor Elements
const styleEditorToggle = document.getElementById('style-editor-toggle');
const styleEditorPanel = document.getElementById('style-editor-panel');
const stylePanelClose = document.getElementById('style-panel-close');
const styleResetBtn = document.getElementById('style-reset-btn');

// Style Form Control Elements
const inputLineColor = document.getElementById('style-line-color');
const inputMainLineColor = document.getElementById('style-main-line-color');
const inputSpouseLineColor = document.getElementById('style-spouse-line-color');
const inputPreacherLineColor = document.getElementById('style-preacher-line-color');
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
  setupThemeToggle();
  initStyleSettings();
  setupFilters();
  applyFilters();
  setupZoomPan();
  setupSearch();
  setupStudyPanel();
  setupAdminMode();
  setupLayerItemModalEvents();
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
    
    let amount = 0.1;
    if (e.altKey) {
      amount = 0.01;      // Alt (Option) key for fine micro-adjustments
    } else if (e.ctrlKey || e.metaKey) {
      amount = 0.001;     // Ctrl / Cmd key for ultra-fine adjustments
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nudgeSelectedPerson(-amount, false, e.shiftKey);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nudgeSelectedPerson(amount, false, e.shiftKey);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nudgeSelectedPerson(-amount, true, e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nudgeSelectedPerson(amount, true, e.shiftKey);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      selectedPersonIds.clear();
      selectedPersonId = null;
      renderTree();
    }
  });

  // Handle click outside text box to deselect annotation (hiding toolbar)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.canvas-annotation')) {
      document.querySelectorAll('.canvas-annotation').forEach(n => n.classList.remove('selected'));
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
  
  const moveDescendants = forceMoveDescendants; // Move only selected card by default, hold Shift key to move descendants together
  
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
  
  const moveDescendants = forceMoveDescendants; // Move only selected card by default, hold Shift key to move descendants together
  
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

function initDatabase() {
  stableBoardWidth = null;
  stableBoardHeight = null;
  stableCenterX = null;
  
  try {
    // 0. Clean up legacy duplicate New Testament IDs (Zechariah, Elizabeth, John_the_Baptist) from local storage
    try {
      let edits = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
      let custom = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
      let deleted = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
      
      let changed = false;
      const targetIds = ['Zechariah', 'Elizabeth', 'John_the_Baptist'];
      
      targetIds.forEach(id => {
        if (edits[id]) {
          delete edits[id];
          changed = true;
        }
      });
      
      if (Array.isArray(custom)) {
        const initialLen = custom.length;
        custom = custom.filter(c => !targetIds.includes(c.id));
        if (custom.length !== initialLen) {
          changed = true;
        }
      }
      
      if (Array.isArray(deleted)) {
        const initialLen = deleted.length;
        deleted = deleted.filter(id => !targetIds.includes(id));
        if (deleted.length !== initialLen) {
          changed = true;
        }
      }
      
      if (changed) {
        localStorage.setItem('bible_tree_character_edits', JSON.stringify(edits));
        localStorage.setItem('bible_tree_custom_characters', JSON.stringify(custom));
        localStorage.setItem('bible_tree_deleted_ids', JSON.stringify(deleted));
        console.log("Cleaned up legacy duplicate New Testament IDs from local storage.");
      }
    } catch (e) {
      console.error("Failed to run duplicate New Testament IDs cleanup:", e);
    }

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

      // 6. Clean up any corrupted legacy character edits and custom characters in localStorage
      let editsChangedToClean = false;
      const editsToClean = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
      
      const cleanCharacterData = (c) => {
        let changed = false;
        if (c.id === 'salmon') {
          if (c.desc && (c.desc.includes('합과') || c.desc.includes('합') || c.desc.includes('') || c.desc.includes('합과'))) {
            c.desc = "가나안 정복의 지도자 중 하나. 여리고 기생 라합과 결혼함.";
            changed = true;
          }
          if (c.engDesc && (c.engDesc.includes('Hap') || c.engDesc.includes(''))) {
            c.engDesc = "One of the leaders of the conquest of Canaan. Married to Jericho gisaeng Rahab.";
            changed = true;
          }
        }
        if (c.id === 'abijah') {
          if (c.desc && (c.desc.includes('쟁에서') || c.desc.includes('쟁') || c.desc.includes(''))) {
            c.desc = "르호보암의 아들. 북이스라엘 여로보암과의 전쟁에서 여호와를 의지해 승리함.";
            changed = true;
          }
        }
        if (c.id === 'zimri') {
          if (c.name && (c.name === '시므' || c.name.includes('') || c.name.startsWith('시므') && c.name.length < 4)) {
            c.name = "시므리";
            changed = true;
          }
        }
        if (c.id === 'jehoaddah') {
          if (c.desc && (c.desc.includes('아하스의') || c.desc.includes('') || c.desc.includes('아하스의 '))) {
            c.desc = "아하스의 아들 (대상 8:36 '여호앗다', 9:42 '야라').";
            changed = true;
          }
          if (c.engDesc && (c.engDesc.includes('Ahaz\'s') || c.engDesc.includes('') || c.engDesc.includes('Ahaz\'s '))) {
            c.engDesc = "Ahaz's son (1 Chronicles 8:36 'Jehoaddah', 9:42 'Jara').";
            changed = true;
          }
        }
        return changed;
      };

      Object.keys(editsToClean).forEach(id => {
        const edit = editsToClean[id];
        edit.id = id;
        if (cleanCharacterData(edit)) {
          editsChangedToClean = true;
        }
      });
      if (editsChangedToClean) {
        localStorage.setItem('bible_tree_character_edits', JSON.stringify(editsToClean));
      }

      let customChangedToClean = false;
      const customToClean = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
      customToClean.forEach(c => {
        if (cleanCharacterData(c)) {
          customChangedToClean = true;
        }
      });
      if (customChangedToClean) {
        localStorage.setItem('bible_tree_custom_characters', JSON.stringify(customToClean));
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
        if (!Array.isArray(c.teachers)) {
          c.teachers = canon.teachers ? [...canon.teachers] : [];
        }
        if (!Array.isArray(c.prophets)) {
          c.prophets = canon.prophets ? [...canon.prophets] : [];
        }
        if (!Array.isArray(c.relatedPeople)) {
          c.relatedPeople = canon.relatedPeople ? [...canon.relatedPeople] : [];
        }
      } else {
        // For custom characters, make sure parents and spouses are arrays
        if (!Array.isArray(c.parents)) c.parents = [];
        if (!Array.isArray(c.spouses)) c.spouses = [];
        if (!Array.isArray(c.teachers)) c.teachers = [];
        if (!Array.isArray(c.prophets)) c.prophets = [];
        if (!Array.isArray(c.relatedPeople)) c.relatedPeople = [];
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
  loadEvents();
  loadLocations();
  loadLineBends();
  loadLineZIndices();
  loadSpouseSplits();
  loadCustomVisualLines();
  loadCanvasJunctions();
  loadCustomPolygons();

  // Compute stable board dimensions from the full unfiltered database
  if (db.length > 0) {
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
    
    // Add safety padding for custom additions/nudges (original specifications)
    minCol -= 5;
    maxCol += 5;
    maxGen += 2;
    
    const totalGens = maxGen - minGen + 1;
    const totalCols = maxCol - minCol + 1;
    
    stableBoardHeight = (totalGens * GEN_HEIGHT) + (BOARD_PADDING_Y * 2);
    stableBoardWidth = (totalCols * COL_WIDTH) + (BOARD_PADDING_X * 2);
    stableCenterX = stableBoardWidth / 2;
  }
  precomputeProphets();
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
    if (isFilterModeActive()) {
      return activeFilters[group] !== true;
    }
    return false;
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
  
  precomputeProphets();
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
  if (isAdminMode) {
    debouncedAutoSaveToServer();
  }
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
  autoSaveToServer();
}

function saveLineZIndices() {
  localStorage.setItem('bible_tree_line_zindices', JSON.stringify(lineZIndices));
  autoSaveToServer();
}

function loadLineZIndices() {
  const saved = localStorage.getItem('bible_tree_line_zindices');
  if (saved) {
    try {
      lineZIndices = JSON.parse(saved);
      if (!lineZIndices || typeof lineZIndices !== 'object' || Array.isArray(lineZIndices)) {
        lineZIndices = {};
      }
    } catch (e) {
      lineZIndices = {};
    }
  } else {
    lineZIndices = {};
  }
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

function loadEvents() {
  const saved = localStorage.getItem('bible_tree_events');
  if (saved && saved !== '[]') {
    try {
      events = JSON.parse(saved);
      if (!Array.isArray(events)) events = [];
    } catch (e) {
      console.error("Failed to parse events.", e);
      events = [];
    }
  } else {
    events = [];
  }
}

function saveEvents() {
  localStorage.setItem('bible_tree_events', JSON.stringify(events));
  if (isAdminMode && typeof renderSpawnerPanel === 'function') renderSpawnerPanel();
}

function loadLocations() {
  const saved = localStorage.getItem('bible_tree_locations');
  if (saved && saved !== '[]') {
    try {
      locations = JSON.parse(saved);
      if (!Array.isArray(locations)) locations = [];
    } catch (e) {
      console.error("Failed to parse locations.", e);
      locations = [];
    }
  } else {
    locations = [];
  }
}

// Ensure local storage save triggers spawner render
function saveLocations() {
  localStorage.setItem('bible_tree_locations', JSON.stringify(locations));
  if (isAdminMode && typeof renderSpawnerPanel === 'function') renderSpawnerPanel();
}

function loadCustomPolygons() {
  const saved = localStorage.getItem('bible_tree_custom_polygons');
  if (saved) {
    try {
      customPolygons = JSON.parse(saved);
      if (!Array.isArray(customPolygons)) customPolygons = [];
    } catch (e) {
      console.error("Failed to parse custom polygons.", e);
      customPolygons = [];
    }
  } else {
    customPolygons = [];
  }
}

let autoSaveTimer = null;
function debouncedAutoSaveToServer() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (typeof autoSaveToServer === 'function') {
      autoSaveToServer();
    }
  }, 1000);
}

function saveCustomPolygons() {
  localStorage.setItem('bible_tree_custom_polygons', JSON.stringify(customPolygons));
  if (isAdminMode) {
    debouncedAutoSaveToServer();
  }
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
      top:          { x: x + w / 2, y: y,         dir: 'UP' },
      right:        { x: x + w,          y: y + h / 2, dir: 'RIGHT' },
      bottom:       { x: x + w / 2, y: y + h,     dir: 'DOWN' },
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

function applyAnnotationBorder(el, annot) {
  const style = annot.borderStyle || 'dashed';
  const width = annot.borderWidth || 1;
  const color = annot.borderColor || (isAdminMode ? 'var(--text-accent)' : 'var(--border-panel)');
  
  if (style === 'none') {
    if (isAdminMode) {
      el.style.border = `1px dashed rgba(168, 85, 247, 0.4)`;
    } else {
      el.style.border = 'none';
    }
  } else {
    el.style.border = `${width}px ${style} ${color}`;
  }
}

function renderAnnotations() {
  // Clear existing annotation elements on the board
  document.querySelectorAll('.canvas-annotation').forEach(el => el.remove());
  
  const board = document.getElementById('tree-board');
  if (!board) return;
  
  annotations.forEach(annot => {
    const el = document.createElement('div');
    el.id = `annot-${annot.id}`;
    const filterClass = getAnnotationFilterClass(annot);
    el.className = `canvas-annotation ${filterClass}`;
    el.dataset.x = annot.x;
    el.dataset.y = annot.y;
    el.style.width = `${annot.width}px`;
    el.style.height = `${annot.height}px`;
    el.style.backgroundColor = annot.bgColor || '#ffffff';
    el.style.resize = 'none'; // Disable default browser resize which requires overflow hidden
    el.style.minWidth = '10px';
    el.style.minHeight = '10px';
    
    // Apply border styles
    applyAnnotationBorder(el, annot);
    
    // Render note badge if note exists
    if (userNotes[annot.id]) {
      const badgeEl = document.createElement('div');
      badgeEl.className = 'annot-note-badge';
      badgeEl.title = '메모 있음';
      badgeEl.textContent = '📝';
      badgeEl.style.position = 'absolute';
      badgeEl.style.top = '-8px';
      badgeEl.style.right = '-8px';
      badgeEl.style.fontSize = '12px';
      badgeEl.style.zIndex = '100';
      el.appendChild(badgeEl);
    }
    
    // Add text element (using contenteditable div for perfect vertical centering and rich behavior)
    const textDiv = document.createElement('div');
    textDiv.className = 'annotation-text';
    textDiv.contentEditable = 'false';
    let textVal = getLocalizedAnnotationText(annot.text);
    textDiv.innerText = textVal;
    
    textDiv.style.fontSize = `${annot.fontSize || 14}px`;
    textDiv.style.fontWeight = annot.bold ? 'bold' : 'normal';
    textDiv.style.fontStyle = annot.italic ? 'italic' : 'normal';
    textDiv.style.textDecoration = annot.underline ? 'underline' : 'none';
    textDiv.style.textAlign = annot.align || 'center';
    textDiv.style.color = annot.color || '#1e293b';
    
    // Flexbox styling to ensure perfect vertical and horizontal alignment
    textDiv.style.display = 'flex';
    textDiv.style.alignItems = 'center';
    textDiv.style.justifyContent = annot.align === 'left' ? 'flex-start' : annot.align === 'right' ? 'flex-end' : 'center';
    textDiv.style.width = '100%';
    textDiv.style.height = '100%';
    textDiv.style.whiteSpace = 'pre-wrap';
    textDiv.style.outline = 'none';
    textDiv.style.wordBreak = 'break-word';
    textDiv.style.overflow = 'hidden';
    textDiv.style.boxSizing = 'border-box';
    textDiv.style.padding = '4px 8px';
    
    el.appendChild(textDiv);
    
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
      textDiv.style.fontSize = `${annot.fontSize}px`;
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
      textDiv.style.fontWeight = annot.bold ? 'bold' : 'normal';
      saveAnnotations();
    });
    toolbar.appendChild(boldBtn);
    
    // Italic button
    const italicBtn = document.createElement('button');
    italicBtn.className = `annot-btn annot-italic-btn ${annot.italic ? 'active' : ''}`;
    italicBtn.innerHTML = '<i>I</i>';
    italicBtn.title = '기울임꼴';
    italicBtn.addEventListener('click', () => {
      annot.italic = !annot.italic;
      italicBtn.classList.toggle('active', annot.italic);
      textDiv.style.fontStyle = annot.italic ? 'italic' : 'normal';
      saveAnnotations();
    });
    toolbar.appendChild(italicBtn);
    
    // Underline button
    const underlineBtn = document.createElement('button');
    underlineBtn.className = `annot-btn annot-underline-btn ${annot.underline ? 'active' : ''}`;
    underlineBtn.innerHTML = '<u>U</u>';
    underlineBtn.title = '밑줄';
    underlineBtn.addEventListener('click', () => {
      annot.underline = !annot.underline;
      underlineBtn.classList.toggle('active', annot.underline);
      textDiv.style.textDecoration = annot.underline ? 'underline' : 'none';
      saveAnnotations();
    });
    toolbar.appendChild(underlineBtn);
    
    // Align button (cycles left, center, right)
    const alignBtn = document.createElement('button');
    alignBtn.className = `annot-btn`;
    const getAlignChar = (a) => a === 'left' ? '▤' : a === 'right' ? '▥' : '▧';
    alignBtn.textContent = getAlignChar(annot.align || 'center');
    alignBtn.title = '텍스트 정렬 (왼쪽/가운데/오른쪽)';
    alignBtn.addEventListener('click', () => {
      const current = annot.align || 'center';
      const next = current === 'center' ? 'left' : current === 'left' ? 'right' : 'center';
      annot.align = next;
      alignBtn.textContent = getAlignChar(next);
      textDiv.style.textAlign = next;
      textDiv.style.justifyContent = next === 'left' ? 'flex-start' : next === 'right' ? 'flex-end' : 'center';
      saveAnnotations();
    });
    toolbar.appendChild(alignBtn);
    
    // Border Style button (cycles dashed, solid, none)
    const borderStyleBtn = document.createElement('button');
    borderStyleBtn.className = `annot-btn`;
    const getBorderStyleLabel = (s) => s === 'solid' ? '▬' : s === 'dashed' ? '╍' : '☐';
    borderStyleBtn.textContent = getBorderStyleLabel(annot.borderStyle || 'dashed');
    borderStyleBtn.title = '테두리 선 스타일 (실선/점선/없음)';
    borderStyleBtn.addEventListener('click', () => {
      const current = annot.borderStyle || 'dashed';
      const next = current === 'dashed' ? 'solid' : current === 'solid' ? 'none' : 'dashed';
      annot.borderStyle = next;
      borderStyleBtn.textContent = getBorderStyleLabel(next);
      applyAnnotationBorder(el, annot);
      saveAnnotations();
    });
    toolbar.appendChild(borderStyleBtn);
    
    // Border Width button (cycles 1px, 2px, 4px)
    const borderWidthBtn = document.createElement('button');
    borderWidthBtn.className = `annot-btn`;
    borderWidthBtn.textContent = `${annot.borderWidth || 1}px`;
    borderWidthBtn.title = '테두리 두께';
    borderWidthBtn.addEventListener('click', () => {
      const current = annot.borderWidth || 1;
      const next = current === 1 ? 2 : current === 2 ? 4 : 1;
      annot.borderWidth = next;
      borderWidthBtn.textContent = `${next}px`;
      applyAnnotationBorder(el, annot);
      saveAnnotations();
    });
    toolbar.appendChild(borderWidthBtn);
    
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
      textDiv.style.color = annot.color;
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
    
    const borderPicker = document.createElement('input');
    borderPicker.type = 'color';
    borderPicker.className = 'annot-color-picker';
    borderPicker.value = annot.borderColor || '#cbd5e1';
    borderPicker.title = '테두리 색상';
    borderPicker.addEventListener('input', (e) => {
      annot.borderColor = e.target.value;
      applyAnnotationBorder(el, annot);
      saveAnnotations();
    });
    colorWrapper.appendChild(borderPicker);
    
    toolbar.appendChild(colorWrapper);
    
    // Relation button
    const relBtn = document.createElement('button');
    relBtn.className = 'annot-btn';
    relBtn.innerHTML = '🔗';
    relBtn.title = '아우라 연동 관계 설정';
    relBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editLayerItem(annot, 'annotation');
    });
    toolbar.appendChild(relBtn);

    // Aura toggle button (Per-annotation aura toggle)
    const auraBtn = document.createElement('button');
    auraBtn.className = 'annot-btn';
    auraBtn.innerHTML = '💡';
    
    const updateAuraBtnStyle = () => {
      if (annot.auraEnabled !== false) {
        auraBtn.style.backgroundColor = '#a855f7'; // Purple
        auraBtn.style.color = '#ffffff';
        auraBtn.title = '클릭 시 아우라 강조 기능 활성화됨';
      } else {
        auraBtn.style.backgroundColor = '#cbd5e1'; // Gray
        auraBtn.style.color = '#64748b';
        auraBtn.title = '클릭 시 아우라 강조 기능 비활성화됨';
      }
    };
    updateAuraBtnStyle();

    auraBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      annot.auraEnabled = (annot.auraEnabled !== false) ? false : true;
      updateAuraBtnStyle();
      saveAnnotations();
      showToast(annot.auraEnabled ? "💡 이 상자의 아우라 강조가 활성화되었습니다." : "📴 이 상자의 아우라 강조가 비활성화되었습니다.");
    });
    toolbar.appendChild(auraBtn);
    
    // Copy/Duplicate button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'annot-btn';
    copyBtn.innerHTML = '📋';
    copyBtn.title = '이 텍스트 상자 복제 (동일 스타일로 복사)';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pushHistoryState();
      
      const newId = 'annotation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const newAnnot = {
        id: newId,
        text: (annot.text || '') + ' (복사본)',
        x: (annot.x || 0) + 30,
        y: (annot.y || 0) + 30,
        width: annot.width || 180,
        height: annot.height || 60,
        fontSize: annot.fontSize || 14,
        bold: annot.bold || false,
        italic: annot.italic || false,
        underline: annot.underline || false,
        align: annot.align || 'center',
        borderStyle: annot.borderStyle || 'dashed',
        borderWidth: annot.borderWidth || 1,
        color: annot.color || '#1e293b',
        bgColor: annot.bgColor || '#ffffff',
        borderColor: annot.borderColor || '#cbd5e1',
        auraEnabled: annot.auraEnabled !== false
      };
      
      annotations.push(newAnnot);
      saveAnnotations();
      renderAnnotations();
      drawConnections();
      showToast("📋 텍스트 상자가 동일한 스타일로 복제되었습니다.");
    });
    toolbar.appendChild(copyBtn);
    
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
    
    // Custom Resize Handle (Admin Mode)
    if (isAdminMode) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'annot-resize-handle';
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.bottom = '2px';
      resizeHandle.style.right = '2px';
      resizeHandle.style.width = '10px';
      resizeHandle.style.height = '10px';
      resizeHandle.style.cursor = 'se-resize';
      resizeHandle.style.borderBottom = '2.5px solid var(--text-accent)';
      resizeHandle.style.borderRight = '2.5px solid var(--text-accent)';
      resizeHandle.style.zIndex = '110';
      resizeHandle.title = '드래그하여 크기 조절';
      
      resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = annot.width || 120;
        const startHeight = annot.height || 60;
        
        const onMouseMove = (moveEvt) => {
          const dx = (moveEvt.clientX - startX) / currentScale;
          const dy = (moveEvt.clientY - startY) / currentScale;
          
          annot.width = Math.max(10, Math.round(startWidth + dx));
          annot.height = Math.max(10, Math.round(startHeight + dy));
          
          el.style.width = `${annot.width}px`;
          el.style.height = `${annot.height}px`;
          
          saveAnnotations();
          
          if (typeof drawConnections === 'function') {
            drawConnections();
          }
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          autoSaveToServer();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      el.appendChild(resizeHandle);
    }
    
    // Click to highlight related elements & open study memo panel
    el.addEventListener('click', (e) => {
      if (e.target.closest('.annotation-toolbar') || e.target.closest('.annot-resize-handle')) return;
      
      e.stopPropagation(); // Avoid triggering board deselection
      
      if (isAdminMode) {
        // Just select, do not focus text edit yet (Figma style)
        document.querySelectorAll('.canvas-annotation').forEach(n => n.classList.remove('selected'));
        el.classList.add('selected');
      } else {
        if (annot.auraEnabled !== false) {
          highlightRelatedElementsForAnnotation(annot);
        }
      }
      openLayerDetails(annot, 'annotation');
    });

    // Double-click to Edit (Figma style with a simple textarea)
    el.addEventListener('dblclick', (e) => {
      if (!isAdminMode) return;
      if (e.target.closest('.annotation-toolbar') || e.target.closest('.annot-resize-handle')) return;
      
      e.stopPropagation();
      el.classList.add('editing');
      textDiv.style.display = 'none';
      
      const textarea = document.createElement('textarea');
      textarea.className = 'annotation-edit-textarea';
      textarea.value = annot.text || '';
      textarea.style.position = 'absolute';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '100%';
      textarea.style.height = '100%';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.background = 'transparent';
      textarea.style.color = annot.color || '#1e293b';
      textarea.style.fontSize = `${annot.fontSize || 14}px`;
      textarea.style.fontWeight = annot.bold ? 'bold' : 'normal';
      textarea.style.fontStyle = annot.italic ? 'italic' : 'normal';
      textarea.style.textDecoration = annot.underline ? 'underline' : 'none';
      textarea.style.textAlign = annot.align || 'center';
      textarea.style.fontFamily = 'inherit';
      textarea.style.boxSizing = 'border-box';
      textarea.style.padding = '8px';
      textarea.style.resize = 'none';
      textarea.style.overflow = 'hidden';
      textarea.style.zIndex = '10';
      
      const saveAndClose = () => {
        if (textarea.parentNode) {
          annot.text = textarea.value;
          textDiv.innerText = annot.text;
          textarea.remove();
          textDiv.style.display = 'flex';
          el.classList.remove('editing');
          saveAnnotations();
        }
      };
      
      textarea.addEventListener('blur', saveAndClose);
      textarea.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape') {
          evt.stopPropagation();
          saveAndClose();
        }
      });
      
      el.appendChild(textarea);
      setTimeout(() => {
        textarea.focus();
        textarea.select();
      }, 10);
    });

    // Drag handlers
    el.addEventListener('mousedown', (e) => {
      if (!isAdminMode) return;
      if (el.classList.contains('editing')) return; // Do not drag while editing text
      if (e.target.closest('.annotation-toolbar') || e.target.closest('.annot-resize-handle')) return; // Avoid drag when clicking toolbar or resize handle
      
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
  if (typeof updateTransform === 'function') {
    updateTransform();
  }
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
        let deltaX = (moveEvt.clientX - startMouseX) / currentScale;
        let deltaY = (moveEvt.clientY - startMouseY) / currentScale;
        
        if (moveEvt && moveEvt.shiftKey && (moveEvt.ctrlKey || moveEvt.metaKey)) {
          if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            deltaY = 0;
          } else {
            deltaX = 0;
          }
        }
        
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
        el.style.left = `${finalX * currentScale}px`;
        el.style.top = `${finalY * currentScale}px`;
        
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
  if (isAdminMode) return;
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
  
  // Highlight spouse connector paths and circles
  document.querySelectorAll('.spouse-connector').forEach(path => {
    const spouseIdsAttr = path.getAttribute('data-spouse-ids');
    if (spouseIdsAttr) {
      const ids = spouseIdsAttr.split(',');
      if (ids.every(id => ancestors.has(id))) {
        path.classList.add('line-highlight');
      }
    }
  });
  
  document.querySelectorAll('.spouse-node-circle').forEach(circle => {
    const spouseIdsAttr = circle.getAttribute('data-spouse-ids');
    if (spouseIdsAttr) {
      const ids = spouseIdsAttr.split(',');
      if (ids.every(id => ancestors.has(id))) {
        circle.classList.add('line-highlight');
      }
    }
  });
}

function clearHighlight() {
  treeBoard.classList.remove('tree-highlight-active');
  document.querySelectorAll('.person-card').forEach(card => {
    card.classList.remove('ancestor-highlight');
  });
  
  const studyPanel = document.getElementById('study-panel');
  if (studyPanel && studyPanel.classList.contains('active') && activePersonId && activeStudyPanelType) {
    if (activeStudyPanelType === 'annotation') {
      const annot = annotations.find(a => a.id === activePersonId);
      if (annot) {
        highlightRelatedElementsForAnnotation(annot);
      }
    } else {
      highlightRelatedElements(activePersonId, activeStudyPanelType);
    }
  } else {
    document.querySelectorAll('.connector-line, .spouse-connector, .spouse-node-circle').forEach(path => {
      path.classList.remove('line-highlight');
    });
  }
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

function isGrayHexColor(hex) {
  if (!hex || typeof hex !== 'string') return true;
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return true;
  let r, g, b;
  if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  }
  return Math.max(r, g, b) - Math.min(r, g, b) < 45;
}

// Load and Apply Style Settings
function initStyleSettings() {
  const savedSettings = localStorage.getItem('bible_tree_style_settings');
  if (savedSettings) {
    try {
      styleSettings = { ...styleSettings, ...JSON.parse(savedSettings) };
      
      // Auto-upgrade / self-heal old empty settings
      let changed = false;
      if (!styleSettings.lineColor) {
        styleSettings.lineColor = '#ff7800';
        changed = true;
      }
      if (!styleSettings.preacherLineColor) {
        styleSettings.preacherLineColor = '#ff7800';
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
  let activePreacherLineColor = styleSettings.preacherLineColor || '#ff7800';
  
  if (isDark) {
    if (activeLineColor === '#ff7800') activeLineColor = '#f97316';
    else if (activeLineColor === '#94a3b8' || activeLineColor === '#919191' || activeLineColor === '#cbd5e1') activeLineColor = '#64748b';
    
    if (activeMainLineColor === '#ff7800') activeMainLineColor = '#f97316';
    if (activeSpouseLineColor === '#ef4444') activeSpouseLineColor = '#f87171';
    if (activePreacherLineColor === '#ff7800') activePreacherLineColor = '#f97316';
  }
  
  // Set CSS Variables on root element
  document.documentElement.style.setProperty('--line-color', activeLineColor);
  document.documentElement.style.setProperty('--line-main-color', activeMainLineColor);
  document.documentElement.style.setProperty('--spouse-line-color', activeSpouseLineColor);
  document.documentElement.style.setProperty('--preacher-line-color', activePreacherLineColor);
  document.documentElement.style.setProperty('--line-width', `${styleSettings.lineWidth}px`);
  
  // Update inputs values
  inputLineColor.value = styleSettings.lineColor;
  inputMainLineColor.value = styleSettings.mainLineColor;
  inputSpouseLineColor.value = styleSettings.spouseLineColor;
  if (inputPreacherLineColor) inputPreacherLineColor.value = styleSettings.preacherLineColor || '#ff7800';
  
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

// Auto-detect and fix custom polygon horizontal misalignment due to layout center shifts
function migratePolygonAlignment() {
  if (customPolygons.length === 0) return;
  
  // Look for any default polygon like 'poly-ham' or 'poly-japheth' to determine the layout offset
  const testPoly = customPolygons.find(p => p.id === 'poly-ham' || p.id === 'poly-japheth' || p.id === 'poly-cain');
  if (!testPoly || !testPoly.points || testPoly.points.length === 0) return;
  
  const groupName = testPoly.id.replace('poly-', '');
  
  // Get all characters belonging to this group in the unfiltered mapping
  const groupCharIds = Object.keys(charGroups).filter(id => charGroups[id] === groupName);
  const coordsList = groupCharIds.map(id => coordinates[id]).filter(Boolean);
  if (coordsList.length === 0) return;
  
  const expectedMinX = Math.min(...coordsList.map(co => co.x));
  const expectedMaxX = Math.max(...coordsList.map(co => co.x));
  const expectedCenterX = ((expectedMinX + expectedMaxX) / 2) - 30;
  
  const polyXCoords = testPoly.points.map(pt => pt.x);
  const actualMinX = Math.min(...polyXCoords);
  const actualMaxX = Math.max(...polyXCoords);
  const actualCenterX = (actualMinX + actualMaxX) / 2;
  
  const offset = actualCenterX - expectedCenterX;
  
  // If the offset is significant (e.g. greater than 200px), it is due to layout center shift.
  if (Math.abs(offset) > 200) {
    console.log(`[Auto-Alignment] Detected polygon shift of ${offset.toFixed(1)}px. Realigning all custom polygons...`);
    customPolygons.forEach(poly => {
      if (poly.points && Array.isArray(poly.points)) {
        poly.points.forEach(pt => {
          pt.x -= offset;
        });
      }
    });
    saveCustomPolygons();
  }
}

// Calculate Board Dimensions and Setup Coordinates
function initBoard() {
  if (db.length === 0) return;
  
  if (stableCenterX === null) {
    // Find min/max generations based on active db
    let minGen = 0;
    let maxGen = 0;
    
    db.forEach(char => {
      if (char.generation > maxGen) maxGen = char.generation;
      if (char.generation < minGen) minGen = char.generation;
    });
    
    maxGen += 2;
    
    // Total dimensions
    const totalGens = maxGen - minGen + 1;
    
    stableBoardHeight = (totalGens * GEN_HEIGHT) + (BOARD_PADDING_Y * 2);
    // Lock horizontal board width and center to the Messiah lineage (column 0) to avoid any layout shifts.
    stableBoardWidth = 60000;
    stableCenterX = 30000;
  }
  
  boardHeight = stableBoardHeight;
  boardWidth = stableBoardWidth;
  centerX = stableCenterX;
  
  // Filter out and delete default relative events/locations that were never manually placed by the admin
  let needsSave = false;
  events = events.filter(ev => {
    if (ev.x !== undefined && ev.x < 5000) {
      needsSave = true;
      return false; // delete it
    }
    return true;
  });
  locations = locations.filter(loc => {
    if (loc.x !== undefined && loc.x < 5000) {
      needsSave = true;
      return false; // delete it
    }
    return true;
  });
  if (needsSave) {
    saveEvents();
    saveLocations();
    autoSaveToServer();
  }
  
  // Set dimensions on elements
  treeBoard.style.width = `${boardWidth}px`;
  treeBoard.style.height = `${boardHeight}px`;
  zoomWrapper.style.width = `${boardWidth}px`;
  zoomWrapper.style.height = `${boardHeight}px`;
  zoomWrapper.style.left = '0px';
  zoomWrapper.style.top = '0px';
  
  // Set SVG viewbox and explicit width/height attributes to prevent browser clipping on the right edge
  svgLayer.setAttribute('viewBox', `0 0 ${boardWidth} ${boardHeight}`);
  svgLayer.setAttribute('width', boardWidth);
  svgLayer.setAttribute('height', boardHeight);
  svgLayer.style.width = `${boardWidth}px`;
  svgLayer.style.height = `${boardHeight}px`;
  
  // Map coordinates for all database characters (even if currently filtered out, to keep coordinate system uniform)
  coordinates = {};
  
  let allChars = [];
  try {
    const custom = JSON.parse(localStorage.getItem('bible_tree_custom_characters') || '[]');
    const deleted = JSON.parse(localStorage.getItem('bible_tree_deleted_ids') || '[]');
    const edited = JSON.parse(localStorage.getItem('bible_tree_character_edits') || '{}');
    
    // Filter out deleted canonical characters and apply custom positions
    allChars = BIBLE_CHARACTERS.filter(c => !deleted.includes(c.id)).map(c => {
      const edit = edited[c.id];
      if (edit) {
        return { ...c, ...edit };
      }
      return c;
    });
    
    // Add custom characters
    custom.forEach(c => {
      if (!deleted.includes(c.id)) {
        allChars.push(c);
      }
    });
  } catch (e) {
    allChars = [...BIBLE_CHARACTERS];
  }
  
  allChars.forEach(char => {
    coordinates[char.id] = {
      x: centerX + (char.column * COL_WIDTH),
      y: BOARD_PADDING_Y + (char.generation * GEN_HEIGHT)
    };
  });
  
  // Self-healing horizontal layout center shift auto-alignment
  let lastCenterX = null;
  const lastCenterXStr = localStorage.getItem('bible_tree_last_center_x');
  if (lastCenterXStr !== null) {
    lastCenterX = parseFloat(lastCenterXStr);
  } else {
    // Fallback: If localStorage center is missing (first load or imported database),
    // calculate what the old dynamic stableCenterX would have been for the current database,
    // so we can seamlessly align the existing database coordinates to the new fixed 30000 center!
    let minCol = 0;
    let maxCol = 0;
    allChars.forEach(char => {
      if (char.column > maxCol) maxCol = char.column;
      if (char.column < minCol) minCol = char.column;
    });
    minCol -= 5;
    maxCol += 5;
    const totalCols = maxCol - minCol + 1;
    const oldBoardWidth = (totalCols * COL_WIDTH) + (BOARD_PADDING_X * 2);
    lastCenterX = oldBoardWidth / 2;
  }
  
  if (lastCenterX !== null && !isNaN(lastCenterX) && Math.abs(centerX - lastCenterX) > 0.01) {
    const deltaX = centerX - lastCenterX;
    console.log(`[Auto-Alignment] Board center shifted by ${deltaX.toFixed(1)}px. Realigning lines, junctions, polygons, and annotations...`);
    
    // 1. Shift custom line bends
    let bendsChanged = false;
    Object.keys(lineBends).forEach(key => {
      if (Array.isArray(lineBends[key])) {
        lineBends[key].forEach(pt => {
          pt.x += deltaX;
        });
        bendsChanged = true;
      }
    });
    if (bendsChanged) saveLineBends();
    
    // 2. Shift canvas junctions
    if (canvasJunctions.length > 0) {
      canvasJunctions.forEach(jNode => {
        jNode.x += deltaX;
      });
      saveCanvasJunctions();
    }
    
    // 3. Shift custom polygons
    if (customPolygons.length > 0) {
      customPolygons.forEach(poly => {
        if (Array.isArray(poly.points)) {
          poly.points.forEach(pt => {
            pt.x += deltaX;
          });
        }
      });
      saveCustomPolygons();
    }
    
    // 4. Shift annotations
    if (annotations && annotations.length > 0) {
      annotations.forEach(annot => {
        annot.x += deltaX;
      });
      saveAnnotations();
    }
  }
  localStorage.setItem('bible_tree_last_center_x', centerX);
  
  // Automatically correct any layout-shift misalignment of custom polygons
  migratePolygonAlignment();
  
  // Shift all existing custom polygons 20px to the left one time
  if (!localStorage.getItem('bible_tree_custom_polygons_shifted_left_20_v2')) {
    customPolygons.forEach(poly => {
      if (poly.points && Array.isArray(poly.points)) {
        poly.points.forEach(pt => {
          pt.x -= 20;
        });
      }
    });
    saveCustomPolygons();
    localStorage.setItem('bible_tree_custom_polygons_shifted_left_20_v2', 'true');
    console.log("[Shift-Migration] Shifted all custom polygons 20px to the left.");
  }
  
  // Shift all existing custom polygons an additional 10px to the left one time (total 30px left from cards)
  if (!localStorage.getItem('bible_tree_custom_polygons_shifted_left_30')) {
    customPolygons.forEach(poly => {
      if (poly.points && Array.isArray(poly.points)) {
        poly.points.forEach(pt => {
          pt.x -= 10;
        });
      }
    });
    saveCustomPolygons();
    localStorage.setItem('bible_tree_custom_polygons_shifted_left_30', 'true');
    console.log("[Shift-Migration] Shifted all custom polygons an additional 10px to the left.");
  }
  
  // Lazy-initialize default polygons if not yet initialized and no custom polygons exist
  if (!localStorage.getItem('bible_tree_custom_polygons_initialized') && customPolygons.length === 0) {
    initDefaultPolygons();
  }
}

function initDefaultPolygons() {
  customPolygons = [];
  const groupNames = ['cain', 'japheth', 'ham', 'joktan', 'keturah', 'ishmael', 'esau', 'mary'];
  precomputeGroups();
  
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
    
    const pX1 = minX - (CARD_WIDTH / 2) - padLeftRight - 30;
    const pY1 = minY - (CARD_HEIGHT / 2) - padTopBottom;
    const pX2 = maxX + (CARD_WIDTH / 2) + padLeftRight - 30;
    const pY2 = maxY + (CARD_HEIGHT / 2) + padTopBottom;
    
    let labelText = "";
    let color = "#94a3b8"; // default slate
    switch (groupName) {
      case 'cain': labelText = '가인 자손 계열'; color = '#ef4444'; break;
      case 'japheth': labelText = '야벳 자손 (유럽/북방계 민족)'; color = '#22c55e'; break;
      case 'ham': labelText = '함 자손 (가나안/아프리카계 민족)'; color = '#f97316'; break;
      case 'joktan': labelText = '욕단 자손 (아라비아 부족 연합)'; color = '#3b82f6'; break;
      case 'keturah': labelText = '그두라 자손 (미디안 등 아라비아 부족)'; color = '#ec4899'; break;
      case 'ishmael': labelText = '이스마엘 12방백 자손 (아랍 민족)'; color = '#a855f7'; break;
      case 'esau': labelText = '에서(에돔) 자손 족장 계열'; color = '#eab308'; break;
      case 'mary': labelText = '마리아 계보 (누가복음 3장 혈통)'; color = '#06b6d4'; break;
    }
    
    customPolygons.push({
      id: `poly-${groupName}`,
      label: labelText,
      color: color,
      fillOpacity: 0.03,
      points: [
        {x: pX1, y: pY1},
        {x: pX2, y: pY1},
        {x: pX2, y: pY2},
        {x: pX1, y: pY2}
      ]
    });
  });
  saveCustomPolygons();
  localStorage.setItem('bible_tree_custom_polygons_initialized', 'true');
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

function isFilterModeActive() {
  return Object.keys(activeFilters).some(key => activeFilters[key] === true);
}

function isPointInPolygon(point, vs) {
  const x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x, yi = vs[i].y;
    const xj = vs[j].x, yj = vs[j].y;
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const TRIBE_KEYWORDS = {
  "르우벤": "reuben",
  "시므온": "simeon",
  "레위": "levi",
  "유다": "judah",
  "잇사갈": "issachar",
  "스불론": "zebulun",
  "단": "dan",
  "베냐민": "benjamin",
  "납달리": "naphtali",
  "갓": "gad",
  "아셀": "asher",
  "므낫세": "joseph",
  "에브라임": "joseph"
};

function getTribeId(charId) {
  const sonsOfJacob = ['reuben', 'simeon', 'levi', 'judah', 'issachar', 'zebulun', 'dan', 'joseph', 'benjamin', 'naphtali', 'gad', 'asher'];
  
  let queue = [charId];
  let visited = new Set();
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    if (sonsOfJacob.includes(currentId)) {
      return currentId;
    }
    
    const c = db.find(x => x.id === currentId);
    if (c && c.parents) {
      c.parents.forEach(pId => {
        if (!visited.has(pId)) {
          queue.push(pId);
        }
      });
    }
  }
  return null;
}

function getElementFilterClass(id) {
  if (!isFilterModeActive()) return "";
  if (typeof id !== 'string') return "";
  if (id.startsWith('annot-')) {
    const annotId = id.replace('annot-', '');
    const annot = annotations.find(a => a.id === annotId);
    return annot ? getAnnotationFilterClass(annot) : "filter-inactive";
  }
  const char = db.find(c => c.id === id);
  if (char) {
    return getCharacterFilterClass(id);
  }
  return "filter-inactive";
}

const PROPHET_BASE_IDS = new Set([
  'deborah_eph', 'john_baptist'
]);

let prophetIds = new Set();
let prophetRelatedIds = new Set();

function precomputeProphets() {
  prophetIds.clear();
  prophetRelatedIds.clear();

  db.forEach(char => {
    const desc = char.desc || "";
    const name = char.name || "";
    let checkIsProphet = false;
    
    // If the character is in the Messiah lineage (isMain: true), they are never a prophet
    if (char.isMain === true) {
      checkIsProphet = false;
    } else if (['moses', 'aaron', 'miriam', 'eli_priest'].includes(char.id)) {
      // Explicitly exclude Moses, Aaron, Miriam, and Eli from being prophets
      checkIsProphet = false;
    } else if (char.isProphet !== undefined) {
      checkIsProphet = char.isProphet;
    } else {
      checkIsProphet = PROPHET_BASE_IDS.has(char.id) || desc.includes("선지자") || desc.includes("예언자") || name.includes("선지자") || name.includes("예언자");
    }
    
    if (checkIsProphet) {
      prophetIds.add(char.id);
    }
  });

  db.forEach(char => {
    if (prophetIds.has(char.id)) return;

    if (char.parents && char.parents.some(pId => prophetIds.has(pId))) {
      prophetRelatedIds.add(char.id);
      return;
    }
    if (char.spouses && char.spouses.some(sId => prophetIds.has(sId))) {
      prophetRelatedIds.add(char.id);
      return;
    }
    if (char.prophets && char.prophets.some(pId => prophetIds.has(pId))) {
      prophetRelatedIds.add(char.id);
      return;
    }
    const isRelated = db.some(otherChar => 
      prophetIds.has(otherChar.id) && 
      otherChar.prophets && 
      otherChar.prophets.includes(char.id)
    );
    if (isRelated) {
      prophetRelatedIds.add(char.id);
      return;
    }
  });

  db.forEach(char => {
    if (prophetIds.has(char.id)) {
      if (char.parents) {
        char.parents.forEach(pId => {
          if (!prophetIds.has(pId)) {
            prophetRelatedIds.add(pId);
          }
        });
      }
    }
  });
}

function isProphet(charId) {
  return prophetIds.has(charId);
}

function isProphetRelated(charId) {
  return prophetRelatedIds.has(charId);
}

function isProphetsPolygon(poly) {
  if (!poly) return false;
  const id = poly.id || '';
  const label = (poly.label || '').toLowerCase();
  const labelEn = (poly.label_en || '').toLowerCase();
  
  return id === 'poly-custom-1785777570404' || 
         id === 'custom-1785777570404' || 
         id.includes('prophet') ||
         label === '선지자들' || 
         label === '선지자' || 
         label === 'prophets' || 
         label === 'prophet' ||
         labelEn === 'prophets' || 
         labelEn === 'prophet';
}

function isProphetInsideProphetsArea(charId) {
  const char = db.find(c => c.id === charId);
  const isSamuel = charId === 'samuel' || (char && char.name && (char.name === '사무엘' || char.name.includes('사무엘')));
  const isProphetChar = isSamuel || isProphet(charId);
  if (!isProphetChar) return false;

  const prophetsPoly = customPolygons.find(isProphetsPolygon);
  if (!prophetsPoly || !prophetsPoly.points) return false;

  const coords = coordinates[charId];
  if (!coords) return false;

  return isPointInPolygon(coords, prophetsPoly.points);
}

function getCharacterFilterClass(charId) {
  if (!isFilterModeActive()) return "";
  
  const char = db.find(c => c.id === charId);
  if (!char) return "filter-inactive";
  
  const showPeople = document.getElementById('toggle-layer-people')?.checked !== false;
  
  // 1. Check if character matches the Prophets filter
  let matchesProphetFilter = false;
  if (activeFilters['prophets'] === true) {
    if (isProphetInsideProphetsArea(charId)) {
      matchesProphetFilter = true;
    }
  }
  
  // 2. Check built-in filters
  let matchesGroupFilter = false;
  const group = getCharacterGroup(char);
  if (group && activeFilters[group] === true) {
    matchesGroupFilter = true;
  }
  
  // 3. Check custom polygon filters geometrically
  let matchesPolygonFilter = false;
  const coords = coordinates[charId];
  if (coords) {
    const charTribe = getTribeId(charId);
    for (const poly of customPolygons) {
      const baseGroup = poly.id.replace('poly-', '');
      if (activeFilters[baseGroup] === true) {
        if (poly.points && poly.points.length >= 3) {
          if (isPointInPolygon(coords, poly.points)) {
            let isTribeMatch = true;
            if (poly.label) {
              for (const [kw, tId] of Object.entries(TRIBE_KEYWORDS)) {
                if (poly.label.includes(kw)) {
                  if (charTribe && charTribe !== tId) {
                    isTribeMatch = false;
                  }
                  break;
                }
              }
            }
            if (isTribeMatch) {
              matchesPolygonFilter = true;
              break;
            }
          }
        }
      }
    }
  }
  
  if (matchesProphetFilter || matchesGroupFilter || matchesPolygonFilter) {
    return "";
  }
  
  return "filter-inactive";
}

function getSpouseFilterClass(charId1, charId2) {
  if (!isCharacterCardVisible(charId1) || !isCharacterCardVisible(charId2)) {
    return "prophets-hide";
  }
  if (!isFilterModeActive()) return "";
  
  const showPeople = document.getElementById('toggle-layer-people')?.checked !== false;
  
  const char1 = db.find(c => c.id === charId1);
  const char2 = db.find(c => c.id === charId2);
  const group1 = char1 ? getCharacterGroup(char1) : null;
  const group2 = char2 ? getCharacterGroup(char2) : null;
  
  // Check if matches other active built-in group filters
  let matchesGroupFilter = false;
  if ((group1 && activeFilters[group1] === true) || (group2 && activeFilters[group2] === true)) {
    matchesGroupFilter = true;
  }
  
  // Check if matches other active custom polygon filters
  let matchesPolygonFilter = false;
  for (const charId of [charId1, charId2]) {
    if (!charId) continue;
    const coords = coordinates[charId];
    if (coords) {
      for (const poly of customPolygons) {
        const baseGroup = poly.id.replace('poly-', '');
        if (activeFilters[baseGroup] === true) {
          if (poly.points && poly.points.length >= 3) {
            if (isPointInPolygon(coords, poly.points)) {
              matchesPolygonFilter = true;
              break;
            }
          }
        }
      }
    }
    if (matchesPolygonFilter) break;
  }
  
  if (matchesGroupFilter || matchesPolygonFilter) {
    return "";
  }
  
  // If prophets filter is active and it didn't match any other active filter, fade it out (and hide it if people layer is unchecked)
  if (activeFilters['prophets'] === true) {
    if (showPeople) {
      return "filter-inactive";
    }
    return "filter-inactive prophets-hide";
  }
  
  return "filter-inactive";
}

function getChildLineFilterClass(childId, parentIds) {
  const isChildVisible = isCharacterCardVisible(childId);
  let areParentsVisible = true;
  if (parentIds && parentIds.length > 0) {
    areParentsVisible = parentIds.every(pId => isCharacterCardVisible(pId));
  }
  if (!isChildVisible || !areParentsVisible) {
    return "prophets-hide";
  }

  if (!isFilterModeActive()) return "";
  
  const showPeople = document.getElementById('toggle-layer-people')?.checked !== false;
  
  const isChildActive = getCharacterFilterClass(childId) === "";
  
  let isLineActive = false;
  if (isChildActive) {
    if (!parentIds || parentIds.length === 0) {
      isLineActive = true;
    } else {
      const anyParentActive = parentIds.some(pId => getCharacterFilterClass(pId) === "");
      if (anyParentActive) {
        isLineActive = true;
      }
    }
  }
  
  if (isLineActive) {
    return "";
  }
  
  // If prophets filter is active and it didn't match any other active filter, fade it out (and hide it if people layer is unchecked)
  if (activeFilters['prophets'] === true) {
    if (showPeople) {
      return "filter-inactive";
    }
    return "filter-inactive prophets-hide";
  }
  
  return "filter-inactive";
}

function getAnnotationFilterClass(annot) {
  if (!isFilterModeActive()) return "";
  
  // Matthew's genealogy specific boxes should always fade out when any filter is active
  if (annot.id === 'note-1784793168468' || annot.id === 'note-1784796431452' || annot.id === 'note-1784797119640') {
    return "filter-inactive";
  }
  
  // 1. Check if the annotation itself is inside an active custom polygon
  const annotPoint = {
    x: annot.x + (annot.width || 0) / 2,
    y: annot.y + (annot.height || 0) / 2
  };
  
  for (const poly of customPolygons) {
    const baseGroup = poly.id.replace('poly-', '');
    if (activeFilters[baseGroup] === true) {
      if (poly.points && poly.points.length >= 3) {
        if (isPointInPolygon(annotPoint, poly.points)) {
          return "";
        }
      }
    }
  }
  
  // 2. Check related people if any
  if (annot.relatedPeople && annot.relatedPeople.length > 0) {
    const hasActivePerson = annot.relatedPeople.some(pId => {
      return getCharacterFilterClass(pId) === "";
    });
    if (hasActivePerson) {
      return "";
    }
  } else {
    // 3. Fallback: If no relatedPeople, check the closest character card (within 1200px)
    let minD = Infinity;
    let closestId = null;
    db.forEach(c => {
      const coords = coordinates[c.id];
      if (coords) {
        const d = Math.hypot(coords.x - annotPoint.x, coords.y - annotPoint.y);
        if (d < minD) {
          minD = d;
          closestId = c.id;
        }
      }
    });
    if (closestId && minD < 1200) {
      if (getCharacterFilterClass(closestId) === "") {
        return "";
      }
    } else if (minD >= 1200) {
      return ""; // General board header/welcome note far from any character stays active
    }
  }
  
  return "filter-inactive";
}

function getEventFilterClass(ev) {
  if (!isFilterModeActive()) return "";
  
  // 1. Check custom polygons geometrically
  const evPoint = { x: ev.x || 0, y: ev.y || 0 };
  for (const poly of customPolygons) {
    const baseGroup = poly.id.replace('poly-', '');
    if (activeFilters[baseGroup] === true) {
      if (poly.points && poly.points.length >= 3) {
        if (isPointInPolygon(evPoint, poly.points)) {
          return "";
        }
      }
    }
  }
  
  // 2. Check related people if any
  if (ev.relatedPeople && ev.relatedPeople.length > 0) {
    const hasActivePerson = ev.relatedPeople.some(pId => {
      return getCharacterFilterClass(pId) === "";
    });
    if (hasActivePerson) {
      return "";
    }
  } else {
    // 3. Fallback: If no relatedPeople, check closest card
    let minD = Infinity;
    let closestId = null;
    db.forEach(c => {
      const coords = coordinates[c.id];
      if (coords) {
        const d = Math.hypot(coords.x - evPoint.x, coords.y - evPoint.y);
        if (d < minD) {
          minD = d;
          closestId = c.id;
        }
      }
    });
    if (closestId && minD < 1200) {
      if (getCharacterFilterClass(closestId) === "") {
        return "";
      }
    } else if (minD >= 1200) {
      return "";
    }
  }
  
  return "filter-inactive";
}

function getLocationFilterClass(loc) {
  if (!isFilterModeActive()) return "";
  
  // 1. Check custom polygons geometrically
  const locPoint = { x: loc.x || 0, y: loc.y || 0 };
  for (const poly of customPolygons) {
    const baseGroup = poly.id.replace('poly-', '');
    if (activeFilters[baseGroup] === true) {
      if (poly.points && poly.points.length >= 3) {
        if (isPointInPolygon(locPoint, poly.points)) {
          return "";
        }
      }
    }
  }
  
  // 2. Check related people if any
  if (loc.relatedPeople && loc.relatedPeople.length > 0) {
    const hasActivePerson = loc.relatedPeople.some(pId => {
      return getCharacterFilterClass(pId) === "";
    });
    if (hasActivePerson) {
      return "";
    }
  } else {
    // 3. Fallback: If no relatedPeople, check closest card
    let minD = Infinity;
    let closestId = null;
    db.forEach(c => {
      const coords = coordinates[c.id];
      if (coords) {
        const d = Math.hypot(coords.x - locPoint.x, coords.y - locPoint.y);
        if (d < minD) {
          minD = d;
          closestId = c.id;
        }
      }
    });
    if (closestId && minD < 1200) {
      if (getCharacterFilterClass(closestId) === "") {
        return "";
      }
    } else if (minD >= 1200) {
      return "";
    }
  }
  
  return "filter-inactive";
}

function isCharacterCardVisible(charId) {
  const showPeople = document.getElementById('toggle-layer-people')?.checked !== false;
  const showProphets = document.getElementById('toggle-layer-prophets')?.checked === true;
  
  const char = db.find(c => c.id === charId);
  if (!char) {
    if (charId === 'samuel') {
      return showProphets;
    }
    return showPeople;
  }
  
  const isProphetChecked = isProphet(charId);
  const isSamuelCard = charId === 'samuel' || (char.name && (char.name === '사무엘' || char.name.includes('사무엘')));
  
  if (isProphetChecked || isSamuelCard) {
    return showProphets;
  }
  return showPeople;
}

function updateLayersVisibility() {
  const showPeople = document.getElementById('toggle-layer-people')?.checked !== false;
  const showEvents = document.getElementById('toggle-layer-events')?.checked !== false;
  const showLocations = document.getElementById('toggle-layer-locations')?.checked !== false;
  const showPolygons = document.getElementById('toggle-layer-polygons')?.checked !== false;
  const showProphets = document.getElementById('toggle-layer-prophets')?.checked === true;

  // 1. Person Cards
  const personCards = document.querySelectorAll('.person-card');
  personCards.forEach(card => {
    const charId = card.id.replace('card-', '');
    const visible = isCharacterCardVisible(charId);
    card.style.display = visible ? '' : 'none';
  });

  // 2. Family Group Panels
  const groupPanels = document.querySelectorAll('.family-group-panel');
  groupPanels.forEach(panel => {
    panel.style.display = showPeople ? '' : 'none';
  });

  // 3. Family Group Labels
  const groupLabels = document.querySelectorAll('.family-group-label');
  groupLabels.forEach(label => {
    label.style.display = (showPeople || showPolygons) ? '' : 'none';
  });

  // 4. Generation labels and divider badges
  const genLabels = document.querySelectorAll('.generation-label');
  genLabels.forEach(el => {
    el.style.display = showPeople ? '' : 'none';
  });
  const genBadges = document.querySelectorAll('.generation-divider-badge');
  genBadges.forEach(el => {
    el.style.display = showPeople ? '' : 'none';
  });

  // 5. SVG Connection Layer
  const svgLayer = document.getElementById('svg-layer');
  if (svgLayer) {
    svgLayer.style.display = showPeople ? '' : 'none';
  }

  // 6. Events Layer
  const layerEvents = document.getElementById('layer-events');
  if (layerEvents) {
    layerEvents.style.display = showEvents ? '' : 'none';
  }

  // 7. Locations Layer
  const layerLocations = document.getElementById('layer-locations');
  if (layerLocations) {
    layerLocations.style.display = showLocations ? '' : 'none';
  }

  // 8. Custom Polygons
  const customPolysGroup = document.getElementById('custom-polygons-group');
  if (customPolysGroup) {
    customPolysGroup.style.display = showPolygons ? '' : 'none';
  }
  const svgPolysLayer = document.getElementById('svg-polygons-layer');
  if (svgPolysLayer) {
    svgPolysLayer.style.display = showPolygons ? '' : 'none';
  }

  customPolygons.forEach(poly => {
    const polyEl = document.getElementById(`svg-poly-${poly.id}`);
    const labelEl = document.getElementById(`label-poly-${poly.id}`);
    
    const isProphetPoly = isProphetsPolygon(poly);
                          
    let visible = showPolygons;
    if (isProphetPoly) {
      visible = showPolygons && showProphets;
    }
    
    if (polyEl) polyEl.style.display = visible ? '' : 'none';
    if (labelEl) labelEl.style.display = (showPeople || showPolygons) && visible ? '' : 'none';
  });

  const polyHandles = document.querySelectorAll('.poly-vertex-handle');
  polyHandles.forEach(handle => {
    const polyId = handle.dataset.polyId;
    const poly = customPolygons.find(p => p.id === polyId);
    if (poly) {
      const isProphetPoly = isProphetsPolygon(poly);
      let visible = showPolygons;
      if (isProphetPoly) {
        visible = showPolygons && showProphets;
      }
      handle.style.display = visible ? '' : 'none';
    } else {
      handle.style.display = showPolygons ? '' : 'none';
    }
  });
}

function applyFilters() {
  initDatabase();
  initBoard();
  renderTree();
  updateTransform();
  
  const treeBoard = document.getElementById('tree-board');
  if (treeBoard) {
    if (activeFilters['prophets'] === true) {
      treeBoard.classList.add('prophets-filter-active');
    } else {
      treeBoard.classList.remove('prophets-filter-active');
    }
  }

  const toggleLayerProphets = document.getElementById('toggle-layer-prophets');
  if (toggleLayerProphets && activeFilters['prophets'] === true) {
    toggleLayerProphets.checked = true;
  }

  updateLayersVisibility();
}

function setupFilters() {
  const filterPanel = document.getElementById('filter-panel');
  const toggleBtn = document.getElementById('filter-panel-toggle');
  const closeBtn = document.getElementById('filter-panel-close');


  // Toggle panel
  toggleBtn.addEventListener('click', () => {
    filterPanel.classList.toggle('active');
    if (filterPanel.classList.contains('active')) {
      wasOpenedFromFilter = false; // Reset flag when manually opened
      renderFilterItems();
    }
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
        activeFilters = { ...activeFilters, ...parsed };
      }
    } catch (err) {
      console.error("Failed to parse saved filters", err);
    }
  }

  // One-time reset migration to default all filters to false (for the new invert/fade-out branch highlight logic)
  if (!localStorage.getItem('bible_tree_filters_reset_v3')) {
    Object.keys(activeFilters).forEach(k => {
      activeFilters[k] = false;
    });
    localStorage.setItem('bible_tree_filters', JSON.stringify(activeFilters));
    localStorage.setItem('bible_tree_filters_reset_v3', 'true');
  }

  function renderFilterItems() {
    const filterGroupEl = filterPanel.querySelector('.filter-group');
    if (!filterGroupEl) return;
    filterGroupEl.innerHTML = '';

    const builtInGroups = [
      { id: 'prophets', label: '선지자 계보 (Prophets)' },
      { id: 'cain', label: '가인 자손 계보 (Cain)' },
      { id: 'japheth', label: '야벳 자손 계보 (Japheth)' },
      { id: 'ham', label: '함 자손 계보 (Ham)' },
      { id: 'joktan', label: '욕단 자손 계보 (Joktan)' },
      { id: 'keturah', label: '그두라 자손 계보 (Keturah)' },
      { id: 'ishmael', label: '이스마엘 자손 계보 (Ishmael)' },
      { id: 'esau', label: '에서(에돔) 자손 계보 (Esau)' },
      { id: 'mary', label: '마리아 계보 (누가복음 3장 혈통 / Mary)' },
      { id: 'north_kings', label: '북이스라엘 왕 계보 (North Israel Kings)' },
      { id: 'independent_1chr4', label: '대상 4장 독립 족보 (1 Chr 4 Lineages)' },
      { id: 'levite_priests', label: '제사장 및 레위인 독립 족보 (Levite Priests)' },
      { id: 'horite_chiefs', label: '호리 족속의 족장들 (Horite Chiefs)' },
      { id: 'reuben_simeon', label: '르우벤 및 시므온 독립 족보 (Reuben & Simeon)' }
    ];

    const allFilters = [...builtInGroups];

    // Add custom polygons dynamically
    customPolygons.forEach(poly => {
      if (isProphetsPolygon(poly)) {
        return;
      }
      const baseGroup = poly.id.replace('poly-', '');
      if (!builtInGroups.some(g => g.id === baseGroup)) {
        allFilters.push({
          id: baseGroup,
          label: poly.label || `영역 (${baseGroup})`,
          isCustom: true
        });
      }
    });

    allFilters.forEach(group => {
      if (activeFilters[group.id] === undefined) {
        activeFilters[group.id] = false;
      }

      const labelEl = document.createElement('label');
      labelEl.className = 'filter-item';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `filter-${group.id}`;
      input.checked = activeFilters[group.id];

      const span = document.createElement('span');
      span.className = 'filter-label';
      span.textContent = group.label;

      labelEl.appendChild(input);
      labelEl.appendChild(span);
      filterGroupEl.appendChild(labelEl);

      input.addEventListener('change', (e) => {
        activeFilters[group.id] = e.target.checked;
        localStorage.setItem('bible_tree_filters', JSON.stringify(activeFilters));
        applyFilters();
        
        if (e.target.checked) {
          // Automatically open study panel on the right
          let poly = customPolygons.find(p => p.id === `poly-${group.id}` || p.id === group.id || p.id.replace('poly-', '') === group.id);
          if (!poly) {
            poly = {
              id: `poly-${group.id}`,
              label: group.label
            };
          }
          wasOpenedFromFilter = true;
          document.getElementById('filter-panel')?.classList.remove('active');
          openLayerDetails(poly, 'polygon');
        } else {
          // Close study panel if it was open for this group
          const targetId = `poly-${group.id}`;
          if (activePersonId === targetId || activePersonId === group.id) {
            closeStudyPanel();
          }
        }
      });
    });
  }

  renderFilterItems();
}

function updateTreeLayout() {
  // Update all card positions dataset coords in the DOM
  db.forEach(c => {
    const cardEl = document.getElementById(`card-${c.id}`);
    if (cardEl) {
      const coords = coordinates[c.id];
      if (coords) {
        cardEl.dataset.x = coords.x;
        cardEl.dataset.y = coords.y;
      }
    }
  });
  
  // Redraw SVG connections (drawConnections uses unscaled coordinates internally, which is correct because the SVG layer viewBox handles the scaling)
  svgLayer.innerHTML = '';
  drawConnections();
  
  // Re-render custom polygons
  renderCustomPolygons();
  
  // Re-render annotations
  renderAnnotations();
  
  // Apply scaled transformations to all DOM elements
  updateTransform();
}

function renderTree() {
  // Clear previous DOM nodes except SVG layer
  treeBoard.querySelectorAll('.person-card').forEach(el => el.remove());
  treeBoard.querySelectorAll('.generation-label').forEach(el => el.remove());
  treeBoard.querySelectorAll('.family-group-panel, .family-group-label, .poly-vertex-handle, .generation-divider-badge').forEach(el => el.remove());
  svgLayer.innerHTML = '';
  
  if (db.length === 0) return;

  // 1. Render Generation Labels on the left edge (Admin Mode only) - Removed as per user request to hide generation numbers
  /*
  if (isAdminMode) {
    const maxGen = Math.max(...db.map(c => c.generation), 0);
    for (let g = 0; g <= maxGen; g++) {
      const label = document.createElement('div');
      label.className = 'generation-label';
      label.style.top = `${BOARD_PADDING_Y + (g * GEN_HEIGHT)}px`;
      label.textContent = `${g}대`;
      treeBoard.appendChild(label);
    }
  }
  */

  // Render Family Group Custom Polygons
  renderCustomPolygons();



  // 2. Render Cards
  db.forEach(char => {
    const coords = coordinates[char.id];
    if (!coords) return;
    
    const card = document.createElement('div');
    card.id = `card-${char.id}`;
    card.className = `person-card ${char.gender === 'M' ? 'male' : 'female'}`;
    if (isProphet(char.id)) {
      card.classList.add('prophet');
    }
    const filterClass = getCharacterFilterClass(char.id);
    if (filterClass) {
      filterClass.split(' ').forEach(cls => {
        if (cls) card.classList.add(cls);
      });
    }
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
    
    // Check if notes exist in userNotes
    const hasNote = userNotes && userNotes[char.id];
    const noteBadgeHTML = hasNote ? `<div class="card-note-badge" title="메모 있음">📝</div>` : '';
    
    // Render Inner HTML: Localized name, English/Korean name swap, localized description
    const localizedName = getCharName(char);
    // In English mode, exclude Korean description from the namebox card
    const localizedDesc = currentLang === 'en' ? (char.engDesc || char.desc || '') : (char.desc || '');
    const secondaryName = currentLang === 'en' ? char.name : char.engName;
    const descText = localizedDesc ? ` · <span class="card-desc">${localizedDesc}</span>` : '';
    const subtitle = `${secondaryName}${descText}`;
    
    const editOverlayHTML = isAdminMode ? `
      <div class="card-edit-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 6px; box-sizing: border-box; transform: translateZ(0); will-change: transform; pointer-events: none; opacity: 0; transition: opacity 0.2s ease; z-index: 15;">
        <button class="card-edit-btn" onmousedown="event.preventDefault(); event.stopPropagation();" ontouchstart="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); openAdminForm('${char.id}')" title="상세 정보 수정">✏️</button>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="card-name-row">
        <span class="card-title">${localizedName}</span>
      </div>
      <span class="card-eng" title="${secondaryName}${localizedDesc ? ': ' + localizedDesc : ''}">${subtitle}</span>
      ${noteBadgeHTML}
      ${editOverlayHTML}
    `;
    
    // Drag & Drop functionality for Admin Mode (Mouse & Touch supported)
    if (isAdminMode) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let cardLeft = 0;
      let cardTop = 0;
      
      let descendantDragData = [];
      
      function startDrag(clientX, clientY, e) {
        if (isAddPersonModeActive) return;
        
        e.stopPropagation();
        startX = clientX;
        startY = clientY;
        cardLeft = parseFloat(card.dataset.x) - (CARD_WIDTH / 2);
        cardTop = parseFloat(card.dataset.y) - (CARD_HEIGHT / 2);
        isDragging = false;
        
        // Handle selection during drag start
        const isDraggedSelected = selectedPersonIds.has(char.id);
        if (!isDraggedSelected) {
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
        
        const moveDescendants = e.shiftKey; // Move only selected card by default, hold Shift key to move descendants together
        
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
              startLeft: parseFloat(targetCard.dataset.x) - (CARD_WIDTH / 2),
              startTop: parseFloat(targetCard.dataset.y) - (CARD_HEIGHT / 2)
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
                startLeft: parseFloat(descCard.dataset.x) - (CARD_WIDTH / 2),
                startTop: parseFloat(descCard.dataset.y) - (CARD_HEIGHT / 2)
              });
            }
          });
        }
        
        function moveDrag(currentX, currentY, moveEvent) {
          moveEvent.stopPropagation();
          let deltaX = currentX - startX;
          let deltaY = currentY - startY;
          
          if (moveEvent && moveEvent.shiftKey && (moveEvent.ctrlKey || moveEvent.metaKey)) {
            if (Math.abs(deltaX) >= Math.abs(deltaY)) {
              deltaY = 0;
            } else {
              deltaX = 0;
            }
          }
          if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            if (!isDragging) {
              pushHistoryState();
            }
            isDragging = true;
            card.classList.add('dragging');
            descendantDragData.forEach(d => d.element.classList.add('dragging'));
          }
          
          if (isDragging) {
            const scaledDeltaX = deltaX / currentScale;
            const scaledDeltaY = deltaY / currentScale;
            
            const newLeft = cardLeft + scaledDeltaX;
            const newTop = cardTop + scaledDeltaY;
            
            card.style.left = `${(newLeft + CARD_WIDTH / 2) * currentScale - CARD_WIDTH / 2}px`;
            card.style.top = `${(newTop + CARD_HEIGHT / 2) * currentScale - CARD_HEIGHT / 2}px`;
            
            // Real-time coordinates update for connections drawing (unscaled!)
            coordinates[char.id].x = newLeft + (CARD_WIDTH / 2);
            coordinates[char.id].y = newTop + (CARD_HEIGHT / 2);
            
            char.column = parseFloat(((newLeft + (CARD_WIDTH / 2) - centerX) / COL_WIDTH).toFixed(3));
            char.generation = parseFloat(((newTop + (CARD_HEIGHT / 2) - BOARD_PADDING_Y) / GEN_HEIGHT).toFixed(2));
            if (scaledDeltaX !== 0 || scaledDeltaY !== 0) char.isManual = true;
            
            // Parallel move descendants
            descendantDragData.forEach(data => {
              const newDescLeft = data.startLeft + scaledDeltaX;
              const newDescTop = data.startTop + scaledDeltaY;
              
              data.element.style.left = `${(newDescLeft + CARD_WIDTH / 2) * currentScale - CARD_WIDTH / 2}px`;
              data.element.style.top = `${(newDescTop + CARD_HEIGHT / 2) * currentScale - CARD_HEIGHT / 2}px`;
              
              coordinates[data.id].x = newDescLeft + (CARD_WIDTH / 2);
              coordinates[data.id].y = newDescTop + (CARD_HEIGHT / 2);
              
              data.char.column = parseFloat(((newDescLeft + (CARD_WIDTH / 2) - centerX) / COL_WIDTH).toFixed(3));
              data.char.generation = parseFloat(((newDescTop + (CARD_HEIGHT / 2) - BOARD_PADDING_Y) / GEN_HEIGHT).toFixed(2));
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
          moveDrag(moveEvent.clientX, moveEvent.clientY, moveEvent);
        }
        function onMouseUp(endEvent) {
          endDrag(endEvent);
        }
        function onTouchMove(moveEvent) {
          if (moveEvent.touches.length > 0) {
            moveDrag(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY, moveEvent);
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
        startDrag(e.clientX, e.clientY, e);
      });
      
      card.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;
        if (e.touches.length > 0) {
          startDrag(e.touches[0].clientX, e.touches[0].clientY, e);
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
          const isModifierPressed = e.shiftKey || e.ctrlKey || e.metaKey || e.altKey;
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
  renderEvents();
  renderLocations();

  // Update Area Editor panel inputs
  updateAreaEditorPanel();

  // 5. Apply scale and pan position to all newly created elements
  updateTransform();
}

// Draw Spouse and Parent-Children Connecting Lines in SVG
function drawConnections() {
  svgLayer.innerHTML = "";
  const svgNS = "http://www.w3.org/2000/svg";
  const pathsToDraw = [];
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
        
        const spouseFilterClass = getSpouseFilterClass(char.id, spouseId);
        path.setAttribute("d", pathD);
        path.setAttribute("class", `spouse-connector ${selectedLineKey === spouseKey ? 'line-highlight' : ''} ${spouseFilterClass}`);
        path.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        path.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.setAttribute("class", spouseFilterClass);
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
        
        pathsToDraw.push({
          key: spouseKey,
          elements: [path, helperPath],
          zIndex: lineZIndices[spouseKey] || 0
        });
        
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
        circle.setAttribute("class", `spouse-node-circle ${selectedLineKey === spouseKey ? 'line-highlight' : ''} ${spouseFilterClass}`);
        circle.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        circle.id = `circle-${char.id}-${spouseId}`;
        
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
      
      const filterClass = getChildLineFilterClass(childId, parentIds);
      childPath.setAttribute("d", pathD);
      childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${selectedLineKey === key ? 'line-highlight' : ''} ${filterClass}`);
      childPath.setAttribute("data-parent-key", parentIds.join(','));
      childPath.setAttribute("data-child-id", childId);
      childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
      
      // Transparent thick helper path for easy selection
      const helperPath = document.createElementNS(svgNS, "path");
      helperPath.setAttribute("d", pathD);
      helperPath.setAttribute("fill", "none");
      helperPath.setAttribute("stroke", "transparent");
      helperPath.setAttribute("stroke-width", "14");
      helperPath.setAttribute("class", filterClass);
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
      
      pathsToDraw.push({
        key: key,
        elements: [childPath, helperPath],
        zIndex: lineZIndices[key] || 0
      });
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
        
        const filterClass = getChildLineFilterClass(childId, parentIds);
        childPath.setAttribute("d", pathD);
        const isSelected = selectedLineKey === childRelationKey;
        childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${isSelected ? 'line-highlight' : ''} ${filterClass}`);
        childPath.setAttribute("data-parent-key", parentIds.join(','));
        childPath.setAttribute("data-child-id", childId);
        childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.setAttribute("class", filterClass);
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
        
        pathsToDraw.push({
          key: childRelationKey,
          elements: [childPath, helperPath],
          zIndex: lineZIndices[childRelationKey] || 0
        });
      });
    }
  });
  
  // Draw Preacher/Discipleship lines
  drawTeacherConnections(svgNS, true, pathsToDraw);

  // 4. Render Custom Visual Lines (Logos style)
  renderCustomVisualLines(svgNS, true, pathsToDraw);
  
  // Sort and append all connector lines by z-index
  pathsToDraw.sort((a, b) => a.zIndex - b.zIndex);
  pathsToDraw.forEach(item => {
    item.elements.forEach(el => svgLayer.appendChild(el));
  });

  // Draw deferred spouse node circles so they render on top of all spouse/parent-child connector lines
  spouseCirclesToDraw.forEach(c => svgLayer.appendChild(c));
  
  // Render bend handles if in Admin Mode
  renderBendHandles();

  // Render Custom Polygons
  renderCustomPolygons();
  
  // Update line editor buttons state and z-order controls
  const clearSelectedBtn = document.getElementById('style-clear-selected-line-btn');
  if (clearSelectedBtn) {
    clearSelectedBtn.disabled = !selectedLineKey;
  }
  const deleteSelectedBtn = document.getElementById('style-delete-selected-line-btn');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.disabled = !selectedLineKey;
  }
  const zorderGroup = document.getElementById('style-line-zorder-group');
  if (zorderGroup) {
    zorderGroup.style.display = selectedLineKey ? 'block' : 'none';
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
    handle.dataset.index = index;
    handle.style.left = `${pt.x * currentScale}px`;
    handle.style.top = `${pt.y * currentScale}px`;
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
        let dx = (moveEvt.clientX - dragStartX) / currentScale;
        let dy = (moveEvt.clientY - dragStartY) / currentScale;
        
        if (moveEvt && moveEvt.shiftKey && (moveEvt.ctrlKey || moveEvt.metaKey)) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            dy = 0;
          } else {
            dx = 0;
          }
        }
        
        let targetX = originalX + dx;
        let targetY = originalY + dy;
        
        if (isGridSnapActive) {
          const SNAP_GRID = 10;
          targetX = Math.round(targetX / SNAP_GRID) * SNAP_GRID;
          targetY = Math.round(targetY / SNAP_GRID) * SNAP_GRID;
        }
        
        pt.x = targetX;
        pt.y = targetY;
        handle.style.left = `${pt.x * currentScale}px`;
        handle.style.top = `${pt.y * currentScale}px`;
        
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
  
  observeAllConnectorPaths();
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
  const pathsToDraw = [];
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
        
        const spouseFilterClass = getSpouseFilterClass(char.id, spouseId);
        path.setAttribute("d", pathD);
        path.setAttribute("class", `spouse-connector ${selectedLineKey === spouseKey ? 'line-highlight' : ''} ${spouseFilterClass}`);
        path.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        path.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.setAttribute("class", spouseFilterClass);
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
        
        pathsToDraw.push({
          key: spouseKey,
          elements: [path, helperPath],
          zIndex: lineZIndices[spouseKey] || 0
        });
        
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
        circle.setAttribute("class", `spouse-node-circle ${selectedLineKey === spouseKey ? 'line-highlight' : ''} ${spouseFilterClass}`);
        circle.setAttribute("data-spouse-ids", `${char.id},${spouseId}`);
        circle.id = `circle-${char.id}-${spouseId}`;
        
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
      
      const filterClass = getChildLineFilterClass(childId, parentIds);
      childPath.setAttribute("d", pathD);
      childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${selectedLineKey === key ? 'line-highlight' : ''} ${filterClass}`);
      childPath.setAttribute("data-parent-key", parentKey);
      childPath.setAttribute("data-child-id", childId);
      childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
      
      // Transparent thick helper path for easy selection
      const helperPath = document.createElementNS(svgNS, "path");
      helperPath.setAttribute("d", pathD);
      helperPath.setAttribute("fill", "none");
      helperPath.setAttribute("stroke", "transparent");
      helperPath.setAttribute("stroke-width", "14");
      helperPath.setAttribute("class", filterClass);
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
      
      pathsToDraw.push({
        key: key,
        elements: [childPath, helperPath],
        zIndex: lineZIndices[key] || 0
      });
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
        
        const filterClass = getChildLineFilterClass(childId, parentIds);
        childPath.setAttribute("d", pathD);
        const isSelected = selectedLineKey === childRelationKey;
        childPath.setAttribute("class", `connector-line ${isChildMain ? 'main-line' : ''} ${isSelected ? 'line-highlight' : ''} ${filterClass}`);
        childPath.setAttribute("data-parent-key", parentKey);
        childPath.setAttribute("data-child-id", childId);
        childPath.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
        
        // Transparent thick helper path for easy selection
        const helperPath = document.createElementNS(svgNS, "path");
        helperPath.setAttribute("d", pathD);
        helperPath.setAttribute("fill", "none");
        helperPath.setAttribute("stroke", "transparent");
        helperPath.setAttribute("stroke-width", "14");
        helperPath.setAttribute("class", filterClass);
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
        
        pathsToDraw.push({
          key: childRelationKey,
          elements: [childPath, helperPath],
          zIndex: lineZIndices[childRelationKey] || 0
        });
      });
    }
  });
  
  // Draw Preacher/Discipleship lines
  drawTeacherConnections(svgNS, false, pathsToDraw);

  // Render Custom Visual Lines (Logos style)
  renderCustomVisualLines(svgNS, false, pathsToDraw);
  
  // Sort and append all connector lines by z-index
  pathsToDraw.sort((a, b) => a.zIndex - b.zIndex);
  pathsToDraw.forEach(item => {
    item.elements.forEach(el => svgLayer.appendChild(el));
  });

  // Draw deferred spouse node circles so they render on top of all spouse/parent-child connector lines
  spouseCirclesToDraw.forEach(c => svgLayer.appendChild(c));
}

function drawTeacherConnections(svgNS, recreateClickListeners, pathsToDraw) {
  db.forEach(char => {
    if (char.teachers && char.teachers.length > 0) {
      char.teachers.forEach(teacherId => {
        const teacherNode = db.find(c => c.id === teacherId);
        if (!teacherNode) return;
        
        const startCoord = coordinates[teacherId];
        const endCoord = coordinates[char.id];
        if (!startCoord || !endCoord) return;
        
        const ports1 = getBoxPorts(teacherId);
        const ports2 = getBoxPorts(char.id);
        
        let start = (ports1 && ports1.bottom) ? ports1.bottom : { x: startCoord.x, y: startCoord.y + (CARD_HEIGHT / 2), dir: 'DOWN' };
        let end = (ports2 && ports2.top) ? ports2.top : { x: endCoord.x, y: endCoord.y - (CARD_HEIGHT / 2), dir: 'UP' };
        
        const key = `teacher-${teacherId}->${char.id}`;
        const customBends = lineBends[key] || lineBends[`preacher-${teacherId}->${char.id}`];
        
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
        path.setAttribute("class", `connector-line preacher-line ${selectedLineKey === key ? 'line-highlight' : ''}`);
        path.setAttribute("data-teacher-id", teacherId);
        path.setAttribute("data-disciple-id", char.id);
        path.style.pointerEvents = 'none';
        
        // Use preacher arrow marker (and highlight if selected)
        path.setAttribute("marker-end", selectedLineKey === key ? "url(#preacher-arrow-highlight)" : "url(#preacher-arrow)");
        
        // Transparent thick helper path for selection
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
        }
        
        if (pathsToDraw) {
          pathsToDraw.push({
            key: key,
            elements: [path, helperPath],
            zIndex: lineZIndices[key] || 0
          });
        } else {
          svgLayer.appendChild(path);
          svgLayer.appendChild(helperPath);
        }
      });
    }
  });
  
  observeAllConnectorPaths();
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

function getPathDFromPoints(points, r = 7) {
  if (!points || points.length < 3) return "";
  const len = points.length;
  let d = "";

  for (let i = 0; i < len; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + len) % len];
    const next = points[(i + 1) % len];

    const dx1 = prev.x - curr.x;
    const dy1 = prev.y - curr.y;
    const len1 = Math.hypot(dx1, dy1);

    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len2 = Math.hypot(dx2, dy2);

    if (len1 === 0 || len2 === 0) {
      if (i === 0) d += `M ${curr.x},${curr.y}`;
      else d += ` L ${curr.x},${curr.y}`;
      continue;
    }

    const r1 = Math.min(r, len1 / 2);
    const r2 = Math.min(r, len2 / 2);
    const actualR = Math.min(r1, r2);

    const ndx1 = dx1 / len1;
    const ndy1 = dy1 / len1;
    const ndx2 = dx2 / len2;
    const ndy2 = dy2 / len2;

    const q1x = curr.x + ndx1 * actualR;
    const q1y = curr.y + ndy1 * actualR;
    const q2x = curr.x + ndx2 * actualR;
    const q2y = curr.y + ndy2 * actualR;

    if (i === 0) {
      d += `M ${q1x},${q1y}`;
    } else {
      d += ` L ${q1x},${q1y}`;
    }
    d += ` Q ${curr.x},${curr.y} ${q2x},${q2y}`;
  }
  d += " Z";
  return d;
}

function renderCustomPolygons() {
  const svgNS = "http://www.w3.org/2000/svg";
  
  // Clear any existing custom polygon DOM elements (labels, handles)
  treeBoard.querySelectorAll('.family-group-label').forEach(el => el.remove());
  treeBoard.querySelectorAll('.poly-vertex-handle').forEach(el => el.remove());
  
  // We will create an SVG group for polygons if it doesn't exist
  let polyGroup = document.getElementById('custom-polygons-group');
  if (polyGroup) {
    polyGroup.innerHTML = '';
  } else {
    polyGroup = document.createElementNS(svgNS, 'g');
    polyGroup.id = 'custom-polygons-group';
    const polygonsLayer = document.getElementById('svg-polygons-layer') || svgLayer;
    polygonsLayer.appendChild(polyGroup);
  }
  
  const isLayerVisible = document.getElementById('toggle-layer-polygons')?.checked !== false;
  if (polyGroup) {
    polyGroup.style.display = isLayerVisible ? '' : 'none';
  }
  const polygonsLayer = document.getElementById('svg-polygons-layer');
  if (polygonsLayer) {
    polygonsLayer.style.display = isLayerVisible ? '' : 'none';
  }
  
  customPolygons.forEach(poly => {
    const baseGroup = poly.id.replace('poly-', '');
    let filterClass = "";
    if (isFilterModeActive()) {
      const isProphetsFilterActive = activeFilters['prophets'] === true;
      const isThisProphetsPoly = isProphetsPolygon(poly);
      
      if (isProphetsFilterActive) {
        if (isThisProphetsPoly) {
          filterClass = "";
        } else if (activeFilters[baseGroup] === true) {
          filterClass = "";
        } else {
          filterClass = "filter-inactive";
        }
      } else {
        if (activeFilters[baseGroup] !== true) {
          filterClass = "filter-inactive";
        }
      }
    }
    
    if (!poly.points || poly.points.length < 3) return;
    
    // Draw polygon SVG element (using path for 7px rounded corners)
    const polyEl = document.createElementNS(svgNS, 'path');
    polyEl.id = `svg-poly-${poly.id}`;
    polyEl.setAttribute('d', getPathDFromPoints(poly.points, 7));
    polyEl.setAttribute('fill', poly.color || '#94a3b8');
    polyEl.setAttribute('fill-opacity', poly.fillOpacity !== undefined ? poly.fillOpacity : 0.03);
    polyEl.setAttribute('stroke', poly.color || '#94a3b8');
    const isSelected = selectedPolygonId === poly.id;
    const baseStrokeWidth = poly.strokeWidth !== undefined ? parseInt(poly.strokeWidth) : 2;
    polyEl.setAttribute('stroke-width', isSelected ? baseStrokeWidth + 2 : baseStrokeWidth);
    let dashArray = 'none';
    if (poly.borderStyle === 'dashed') {
      dashArray = '8 6';
    } else if (poly.borderStyle === 'dotted') {
      dashArray = '2 3';
    } else if (poly.borderStyle === 'dashdot') {
      dashArray = '12 3 3 3';
    } else if (poly.borderStyle === 'solid') {
      dashArray = 'none';
    } else {
      dashArray = '8 6'; // default
    }
    polyEl.setAttribute('stroke-dasharray', dashArray);
    
    // Custom class for selection styling
    polyEl.setAttribute('class', `family-group-panel-poly ${isSelected ? 'poly-selected' : ''} ${filterClass}`);
    if (isAdminMode) {
      polyEl.style.pointerEvents = 'visiblePainted'; // Admins can drag/select the polygon
    } else {
      polyEl.style.pointerEvents = 'none'; // Clicks pass through in user mode to prevent blocking other elements
    }
    polyGroup.appendChild(polyEl);
    
    // Admin Drag entire polygon or Click to select / Edit boundary
    if (isAdminMode) {
      // Double click to rename SVG polygon shape directly in admin mode
      polyEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const newName = prompt("영역 이름을 변경하시겠습니까?", poly.label);
        if (newName !== null) {
          pushHistoryState();
          poly.label = newName;
          saveCustomPolygons();
          renderTree();
          updateTransform();
        }
      });
      let dragStartPos = null;
      let hasDragged = false;
      
      polyEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || isAddPolygonModeActive) return;
        e.stopPropagation();
        
        dragStartPos = { x: e.clientX, y: e.clientY };
        hasDragged = false;
        
        const startPoints = poly.points.map(pt => ({ x: pt.x, y: pt.y }));
        
        const onMouseMove = (moveEvt) => {
          if (!dragStartPos) return;
          let dx = (moveEvt.clientX - dragStartPos.x) / currentScale;
          let dy = (moveEvt.clientY - dragStartPos.y) / currentScale;
          
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            if (!hasDragged) {
              pushHistoryState();
              hasDragged = true;
            }
          }
          
          if (hasDragged) {
            if (isGridSnapActive) {
              dx = Math.round(dx / 10) * 10;
              dy = Math.round(dy / 10) * 10;
            }
            poly.points.forEach((pt, idx) => {
              pt.x = startPoints[idx].x + dx;
              pt.y = startPoints[idx].y + dy;
            });
            drawPolygonsRealTime();
            updateLabelRealTime(poly);
          }
        };
        
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          dragStartPos = null;
          
          if (hasDragged) {
            saveCustomPolygons();
            renderTree();
            updateTransform();
          } else {
            // It was a simple click!
            if (selectedPolygonId !== poly.id) {
              selectedPolygonId = poly.id;
              selectedLineKey = null;
              selectedJunctionId = null;
              renderTree();
              updateTransform();
              openStyleEditorPanel();
              setTimeout(() => {
                document.getElementById('area-editor-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            } else {
              // Already selected, try to insert a vertex
              const rect = treeBoard.getBoundingClientRect();
              const clickX = (e.clientX - rect.left) / currentScale;
              const clickY = (e.clientY - rect.top) / currentScale;
              insertVertexOnClosestSegment(poly, clickX, clickY);
            }
          }
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    } else {
      // Clicks pass through in user mode, so no click listener on the polygon shape itself.
      polyEl.style.cursor = 'default';
    }
    
    // Find top-left-most point for placing the HTML label
    let labelPt = poly.points[0];
    poly.points.forEach(pt => {
      if (pt.y < labelPt.y || (pt.y === labelPt.y && pt.x < labelPt.x)) {
        labelPt = pt;
      }
    });
    
    // Create HTML text label on board
    const label = document.createElement('div');
    label.className = `family-group-label ${baseGroup} ${filterClass}`;
    label.id = `label-poly-${poly.id}`;
    const offX = poly.labelOffsetX || 0;
    const offY = poly.labelOffsetY || 0;
    label.style.left = `${(labelPt.x + offX) * currentScale}px`; // set panned coordinates
    label.style.top = `${(labelPt.y - 12 + offY) * currentScale}px`;
    label.style.color = poly.color;
    label.style.borderColor = poly.color + '40'; // add opacity to border
    label.textContent = getPolygonLabel(poly);
    label.style.display = isLayerVisible ? '' : 'none';
    
    if (isAdminMode) {
      label.style.cursor = isSelected ? 'move' : 'pointer';
      
      // Select polygon on label click
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedPolygonId = poly.id;
        selectedLineKey = null;
        selectedJunctionId = null;
        renderTree();
        updateTransform();
        openStyleEditorPanel();
        setTimeout(() => {
          document.getElementById('area-editor-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });

      // Drag label to adjust title position
      label.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // only left click
        e.stopPropagation();
        e.preventDefault();
        
        pushHistoryState();
        const dragStartX = e.clientX;
        const dragStartY = e.clientY;
        const startOffsetX = poly.labelOffsetX || 0;
        const startOffsetY = poly.labelOffsetY || 0;
        
        if (selectedPolygonId !== poly.id) {
          selectedPolygonId = poly.id;
          selectedLineKey = null;
          selectedJunctionId = null;
          renderTree();
          updateTransform();
        }
        
        const onMouseMove = (moveEvt) => {
          const dx = (moveEvt.clientX - dragStartX) / currentScale;
          const dy = (moveEvt.clientY - dragStartY) / currentScale;
          poly.labelOffsetX = startOffsetX + dx;
          poly.labelOffsetY = startOffsetY + dy;
          
          label.style.left = `${(labelPt.x + poly.labelOffsetX) * currentScale}px`;
          label.style.top = `${(labelPt.y - 12 + poly.labelOffsetY) * currentScale}px`;
        };
        
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          saveCustomPolygons();
          renderTree();
          updateTransform();
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
      
      // Double click to rename
      label.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const newName = prompt("영역 이름을 변경하시겠습니까?", poly.label);
        if (newName !== null) {
          pushHistoryState();
          poly.label = newName;
          saveCustomPolygons();
          renderTree();
          updateTransform();
        }
      });
      
      // Right click to delete
      label.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`"${poly.label}" 영역을 삭제하시겠습니까?`)) {
          pushHistoryState();
          customPolygons = customPolygons.filter(p => p.id !== poly.id);
          saveCustomPolygons();
          if (selectedPolygonId === poly.id) selectedPolygonId = null;
          renderTree();
          updateTransform();
        }
      });
    } else {
      label.style.cursor = 'pointer';
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        openLayerDetails(poly, 'polygon');
        highlightRelatedElements(poly.id, 'polygon');
      });
    }
    
    treeBoard.appendChild(label);
    
    // Render vertex handles if selected in Admin Mode
    if (isAdminMode && isSelected) {
      poly.points.forEach((pt, idx) => {
        const handle = document.createElement('div');
        handle.className = 'poly-vertex-handle';
        handle.dataset.polyId = poly.id;
        handle.dataset.index = idx;
        handle.style.left = `${pt.x * currentScale}px`;
        handle.style.top = `${pt.y * currentScale}px`;
        handle.title = "드래그하여 정점 이동, 더블클릭 또는 우클릭하여 삭제";
        handle.style.display = isLayerVisible ? '' : 'none';
        
        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          pushHistoryState();
          
          const dragStartX = e.clientX;
          const dragStartY = e.clientY;
          const originalX = pt.x;
          const originalY = pt.y;
          
          const onMouseMove = (moveEvt) => {
            let dx = (moveEvt.clientX - dragStartX) / currentScale;
            let dy = (moveEvt.clientY - dragStartY) / currentScale;
            
            if (moveEvt && moveEvt.shiftKey) {
              const dist = Math.hypot(dx, dy);
              if (dist > 0) {
                const angleRad = Math.atan2(dy, dx);
                let angleDeg = angleRad * (180 / Math.PI);
                if (angleDeg < 0) angleDeg += 360;
                const quadrant = Math.floor(angleDeg / 90);
                const relativeAngle = angleDeg % 90;
                
                // Snap to 0, 30, 45, 70, 90
                const allowedBaseAngles = [0, 30, 45, 70, 90];
                let closestBase = 0;
                let minDiff = Infinity;
                for (const base of allowedBaseAngles) {
                  const diff = Math.abs(relativeAngle - base);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closestBase = base;
                  }
                }
                const constrainedDeg = (quadrant * 90) + closestBase;
                const constrainedRad = constrainedDeg * (Math.PI / 180);
                dx = dist * Math.cos(constrainedRad);
                dy = dist * Math.sin(constrainedRad);
              }
            }
            
            let targetX = originalX + dx;
            let targetY = originalY + dy;
            
            if (isGridSnapActive) {
              targetX = Math.round(targetX / 10) * 10;
              targetY = Math.round(targetY / 10) * 10;
            }
            
            pt.x = targetX;
            pt.y = targetY;
            handle.style.left = `${pt.x * currentScale}px`;
            handle.style.top = `${pt.y * currentScale}px`;
            
            // Real-time boundary update
            drawPolygonsRealTime();
            
            // Real-time label position update
            updateLabelRealTime(poly);
          };
          
          const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            saveCustomPolygons();
            renderTree();
            updateTransform();
          };
          
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });
        
        const deleteVertex = () => {
          pushHistoryState();
          poly.points.splice(idx, 1);
          if (poly.points.length < 3) {
            customPolygons = customPolygons.filter(p => p.id !== poly.id);
            selectedPolygonId = null;
            showToast("다각형의 정점이 3개 미만이 되어 영역이 삭제되었습니다.");
          } else {
            showToast("정점이 삭제되었습니다.");
          }
          saveCustomPolygons();
          renderTree();
          updateTransform();
        };
        
        handle.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          deleteVertex();
        });
        handle.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteVertex();
        });
        
        treeBoard.appendChild(handle);
      });
    }
  });
}

function updateLabelRealTime(poly) {
  const label = document.getElementById(`label-poly-${poly.id}`);
  if (label && poly.points.length > 0) {
    let labelPt = poly.points[0];
    poly.points.forEach(pt => {
      if (pt.y < labelPt.y || (pt.y === labelPt.y && pt.x < labelPt.x)) {
        labelPt = pt;
      }
    });
    label.style.left = `${labelPt.x * currentScale}px`;
    label.style.top = `${(labelPt.y - 12) * currentScale}px`;
  }
}

function drawPolygonsRealTime() {
  customPolygons.forEach(poly => {
    const el = document.getElementById(`svg-poly-${poly.id}`);
    if (el) {
      el.setAttribute('d', getPathDFromPoints(poly.points, 7));
    }
  });
}

function insertVertexOnClosestSegment(poly, clickX, clickY) {
  let bestDist = Infinity;
  let insertIndex = -1;
  
  const len = poly.points.length;
  for (let i = 0; i < len; i++) {
    const p1 = poly.points[i];
    const p2 = poly.points[(i + 1) % len];
    
    const pt = projectPointOnSegment(clickX, clickY, p1.x, p1.y, p2.x, p2.y);
    if (pt) {
      const dist = Math.hypot(clickX - pt.x, clickY - pt.y);
      if (dist < bestDist) {
        bestDist = dist;
        insertIndex = i + 1; // Insert after index i
      }
    }
  }
  
  if (insertIndex !== -1 && bestDist < 20) { // 20px threshold
    pushHistoryState();
    poly.points.splice(insertIndex, 0, {x: clickX, y: clickY});
    saveCustomPolygons();
    renderTree();
    updateTransform();
    showToast("새 정점이 추가되었습니다.");
    return true;
  }
  return false;
}

function renderCustomVisualLines(svgNS, recreateClickListeners, pathsToDraw) {
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
    
    let filterClass = "";
    if (isFilterModeActive()) {
      const fromFilter = getElementFilterClass(line.from);
      const toFilter = getElementFilterClass(line.to);
      if (fromFilter === "filter-inactive" || toFilter === "filter-inactive") {
        filterClass = "filter-inactive";
      }
    }
    
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    const lineStyleClass = line.style === 'main' ? 'line-main' : line.style === 'spouse' ? 'line-spouse' : 'line-normal';
    path.setAttribute("class", `connector-line custom-visual-line ${lineStyleClass} ${selectedLineKey === key ? 'line-highlight' : ''} ${filterClass}`);
    path.setAttribute("data-link-id", line.id);
    path.style.pointerEvents = 'none'; // Visible path doesn't capture clicks
    if (!pathsToDraw) {
      svgLayer.appendChild(path);
    }
    
    // Transparent thick helper path for easy selection
    const helperPath = document.createElementNS(svgNS, "path");
    helperPath.setAttribute("d", pathD);
    helperPath.setAttribute("fill", "none");
    helperPath.setAttribute("stroke", "transparent");
    helperPath.setAttribute("stroke-width", "14");
    helperPath.setAttribute("class", `custom-visual-line-helper ${filterClass}`);
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
    
    if (pathsToDraw) {
      pathsToDraw.push({
        key: key,
        elements: [path, helperPath],
        zIndex: lineZIndices[key] || 0
      });
    } else {
      svgLayer.appendChild(helperPath);
    }
    
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
  
  // Track global mouse position for centering zoom anchoring
  let globalMouseX = window.innerWidth / 2;
  let globalMouseY = window.innerHeight / 2;
  window.addEventListener('mousemove', (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });

  // Helper to determine if wheel/gesture target is inside a scrollable modal/panel
  function isScrollableOverlay(target) {
    if (!target) return false;
    return target.closest('#landing-page') ||
           target.closest('#study-panel') || 
           target.closest('.layer-control-panel') || 
           target.closest('#search-panel') || 
           target.closest('.modal-content') || 
           target.closest('#style-editor-panel') ||
           target.closest('#help-guide-modal') ||
           target.closest('#install-guide-modal') ||
           target.closest('#desktop-license-modal') ||
           target.closest('#admin-dashboard-modal') ||
           target.closest('#bottom-spawner-panel');
  }

  function shouldIgnoreDrag(target) {
    if (!target) return false;
    return !!(
      target.closest('.person-card') ||
      target.closest('header') ||
      target.closest('#control-panel') ||
      target.closest('#search-panel') ||
      target.closest('#admin-actions-bar') ||
      target.closest('.modal-content') ||
      target.closest('#style-editor-panel') ||
      target.closest('.canvas-annotation') ||
      target.closest('.layer-marker') ||
      target.closest('#bottom-spawner-panel') ||
      target.closest('#spawner-panel-toggle-btn') ||
      target.closest('.layer-control-panel')
    );
  }

  // Intercept wheel events globally on window (ignoring scrollable panels) to prevent dead-zones
  window.addEventListener('wheel', (e) => {
    if (isScrollableOverlay(e.target)) {
      return;
    }
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey || e.altKey) {
      // High-precision smooth zoom with delta clamping for perfect trackpad pinch & mouse wheel feel
      const maxDelta = 30;
      const clampedDelta = Math.min(maxDelta, Math.max(-maxDelta, e.deltaY));
      let nextScale = targetScale * Math.exp(-clampedDelta * 0.005);
      nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      
      if (nextScale === targetScale) return;
      
      const rect = viewerContainer.getBoundingClientRect();
      const mouseX = globalMouseX - rect.left;
      const mouseY = globalMouseY - rect.top;
      
      const worldX = (mouseX - targetPanX) / targetScale;
      const worldY = (mouseY - targetPanY) / targetScale;
      
      // If we are starting a new zoom gesture, record the start scale
      if (!isZoomAnimating) {
        scaleAtAnimationStart = currentScale;
      }
      
      targetScale = nextScale;
      targetPanX = mouseX - worldX * targetScale;
      targetPanY = mouseY - worldY * targetScale;
      
      startZoomAnimation();
    } else {
      // Trackpad Swipe/Mouse Scroll panning
      panX -= e.deltaX;
      panY -= e.deltaY;
      targetPanX = panX;
      targetPanY = panY;
      updateTransform(true);
    }
  }, { passive: false });

  // Native macOS WebKit gesture events for extremely smooth 100% reliable trackpad pinch-to-zoom
  let gestureStartScale = 1.0;
  let gestureStartPanX = 0;
  let gestureStartPanY = 0;

  window.addEventListener('gesturestart', (e) => {
    if (isScrollableOverlay(e.target)) {
      return;
    }
    e.preventDefault();
    gestureStartScale = currentScale;
    gestureStartPanX = panX;
    gestureStartPanY = panY;
    scaleAtAnimationStart = currentScale; // Set baseline for updateTransformLightweight calculations
    isZoomAnimating = false; // stop animation during active gesture tracking
    if (viewerContainer) viewerContainer.classList.add('zooming');
  });

  window.addEventListener('gesturechange', (e) => {
    if (isScrollableOverlay(e.target)) {
      return;
    }
    e.preventDefault();
    const factor = e.scale;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, gestureStartScale * factor));
    
    const rect = viewerContainer.getBoundingClientRect();
    const mouseX = globalMouseX - rect.left;
    const mouseY = globalMouseY - rect.top;
    
    const worldX = (mouseX - gestureStartPanX) / gestureStartScale;
    const worldY = (mouseY - gestureStartPanY) / gestureStartScale;
    
    currentScale = nextScale;
    zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
    
    panX = mouseX - worldX * currentScale;
    panY = mouseY - worldY * currentScale;
    
    targetScale = currentScale;
    targetPanX = panX;
    targetPanY = panY;
    
    updateTransformLightweight();
  });

  window.addEventListener('gestureend', (e) => {
    if (isScrollableOverlay(e.target)) {
      return;
    }
    e.preventDefault();
    updateTransform();
    setTimeout(() => {
      if (!isZoomAnimating && !isTouchZooming) {
        if (viewerContainer) viewerContainer.classList.remove('zooming');
      }
    }, 50);
  });
  
  let startClickX = 0;
  let startClickY = 0;
  viewerContainer.addEventListener('mousedown', (e) => {
    if (shouldIgnoreDrag(e.target)) return;
    
    // Prevent native selection/drag on background
    e.preventDefault();
    isZoomAnimating = false; // Stop any ongoing zoom animation when dragging starts
    
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
      
      // Final redraw of lines and ports to ensure perfect sync
      drawConnections();
      renderJunctions();
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
  
  // Prevent Chrome native drag/select interference (except inside input/editable controls)
  viewerContainer.addEventListener('dragstart', (e) => {
    const targetEl = e.target.nodeType === 3 ? e.target.parentElement : e.target;
    if (!targetEl) return;
    if (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (targetEl.closest && targetEl.closest('[contenteditable="true"]'))) return;
    e.preventDefault();
  });
  viewerContainer.addEventListener('selectstart', (e) => {
    const targetEl = e.target.nodeType === 3 ? e.target.parentElement : e.target;
    if (!targetEl) return;
    if (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (targetEl.closest && targetEl.closest('[contenteditable="true"]'))) return;
    e.preventDefault();
  });
  
  viewerContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    viewerContainer.style.cursor = 'grab';
    
    if (activeAnnotationId) {
      activeAnnotationId = null;
      saveAnnotations();
      
      // Final redraw of lines and ports to ensure perfect sync
      drawConnections();
      renderJunctions();
    }
  });
  
  viewerContainer.addEventListener('mousemove', (e) => {
    if (isAddPolygonModeActive && tempPolygonPoints.length > 0) {
      const rect = treeBoard.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / currentScale;
      const clickY = (e.clientY - rect.top) / currentScale;
      
      let finalX = clickX;
      let finalY = clickY;
      
      if (e.shiftKey) {
        const lastPt = tempPolygonPoints[tempPolygonPoints.length - 1];
        const dx = clickX - lastPt.x;
        const dy = clickY - lastPt.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          const angleRad = Math.atan2(dy, dx);
          let angleDeg = angleRad * (180 / Math.PI);
          if (angleDeg < 0) angleDeg += 360;
          
          const quadrant = Math.floor(angleDeg / 90);
          const relativeAngle = angleDeg % 90;
          
          const allowedBaseAngles = [0, 30, 45, 75, 90];
          let closestBase = 0;
          let minDiff = Infinity;
          for (const base of allowedBaseAngles) {
            const diff = Math.abs(relativeAngle - base);
            if (diff < minDiff) {
              minDiff = diff;
              closestBase = base;
            }
          }
          
          const constrainedDeg = (quadrant * 90) + closestBase;
          const constrainedRad = constrainedDeg * (Math.PI / 180);
          finalX = lastPt.x + dist * Math.cos(constrainedRad);
          finalY = lastPt.y + dist * Math.sin(constrainedRad);
        }
      }
      
      updateTempPolygonPreview({ x: finalX, y: finalY });
    }

    if (activeAnnotationId) {
      const annot = annotations.find(a => a.id === activeAnnotationId);
      if (annot) {
        const dx = (e.clientX - annotDragStartX) / currentScale;
        const dy = (e.clientY - annotDragStartY) / currentScale;
        annot.x = annotOriginalX + dx;
        annot.y = annotOriginalY + dy;
        const el = document.getElementById(`annot-${annot.id}`);
        if (el) {
          el.dataset.x = annot.x;
          el.dataset.y = annot.y;
          el.style.left = `${annot.x * currentScale}px`;
          el.style.top = `${annot.y * currentScale}px`;
        }
        // Redraw connection lines and ports in real-time
        drawConnections();
        renderJunctions();
      }
      return;
    }
    
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panX = startPanX + dx;
    panY = startPanY + dy;
    targetPanX = panX;
    targetPanY = panY;
    zoomWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
  });
  
  // Mobile Touch Support
  const onTouchMove = (e) => {
    const rect = viewerContainer.getBoundingClientRect();
    if (isTouchZooming && e.touches.length === 2) {
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / touchStartDistance;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, touchStartScale * factor));
      
      const touchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const touchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      
      const worldX = (touchCenterX - touchStartPanX) / touchStartScale;
      const worldY = (touchCenterY - touchStartPanY) / touchStartScale;
      
      currentScale = nextScale;
      zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
      
      panX = touchCenterX - worldX * currentScale;
      panY = touchCenterY - worldY * currentScale;
      
      // Keep target coordinates synced for touch zooming (no LERP needed here as fingers do physical easing)
      targetScale = currentScale;
      targetPanX = panX;
      targetPanY = panY;
      
      updateTransform();
    } else if (isDragging && e.touches.length === 1) {
      e.preventDefault(); // Stop mobile native elastic scrolling and bounce
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;
      
      panX = startPanX + dx;
      panY = startPanY + dy;
      targetPanX = panX;
      targetPanY = panY;
      zoomWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
      
      const now = Date.now();
      const dt = now - lastTouchTime;
      if (dt > 0) {
        const instantaneousVx = (currentX - lastTouchX) / dt;
        const instantaneousVy = (currentY - lastTouchY) / dt;
        velocityX = velocityX * 0.6 + instantaneousVx * 0.4;
        velocityY = velocityY * 0.6 + instantaneousVy * 0.4;
      }
      
      lastTouchX = currentX;
      lastTouchY = currentY;
      lastTouchTime = now;
    }
  };
  
  const onTouchEnd = (e) => {
    if (isDragging) {
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (speed > 0.15) {
        let lastFrameTime = Date.now();
        const runInertia = () => {
          const nowTime = Date.now();
          const elapsed = nowTime - lastFrameTime;
          lastFrameTime = nowTime;
          
          if (elapsed > 0) {
            velocityX *= Math.pow(friction, elapsed / 16.67);
            velocityY *= Math.pow(friction, elapsed / 16.67);
            
            const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            if (currentSpeed < 0.05) {
              stopInertia();
              return;
            }
            
            panX += velocityX * elapsed;
            panY += velocityY * elapsed;
            targetPanX = panX;
            targetPanY = panY;
            zoomWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
          }
          inertiaFrameId = requestAnimationFrame(runInertia);
        };
        inertiaFrameId = requestAnimationFrame(runInertia);
      }
    }
    const wasZooming = isTouchZooming;
    isTouchZooming = false;
    isDragging = false;
    
    if (wasZooming) {
      setTimeout(() => {
        if (!isZoomAnimating && !isTouchZooming) {
          if (viewerContainer) viewerContainer.classList.remove('zooming');
        }
      }, 50);
    }
    
    window.removeEventListener('touchmove', onTouchMove, { passive: false });
    window.removeEventListener('touchend', onTouchEnd, { passive: false });
    window.removeEventListener('touchcancel', onTouchEnd, { passive: false });
  };
  
  viewerContainer.addEventListener('touchstart', (e) => {
    if (shouldIgnoreDrag(e.target)) return;
    stopInertia();
    isZoomAnimating = false; // Stop any ongoing zoom animation when touch starts
    if (viewerContainer) {
      if (e.touches.length === 2) {
        viewerContainer.classList.add('zooming');
      } else {
        viewerContainer.classList.remove('zooming');
      }
    }
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
      
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      lastTouchTime = Date.now();
      velocityX = 0;
      velocityY = 0;
    }
    
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });
  }, { passive: false });

  viewerContainer.addEventListener('click', (e) => {
    // Ignore click if the user was dragging/panning the board
    const clickDist = Math.sqrt(Math.pow(e.clientX - startClickX, 2) + Math.pow(e.clientY - startClickY, 2));
    if (clickDist > 6) return;

    if (isAdminMode && activeSpawnerItem) {
      if (e.target.closest('header') || e.target.closest('#control-panel') || e.target.closest('#search-panel') || e.target.closest('#admin-actions-bar') || e.target.closest('.modal-content') || e.target.closest('#style-editor-panel') || e.target.closest('.bottom-spawner-panel')) return;
      
      const rect = treeBoard.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / currentScale;
      const clickY = (e.clientY - rect.top) / currentScale;
      
      pushHistoryState();
      
      if (activeSpawnerType === 'location') {
        const newLoc = {
          id: 'loc-' + Date.now(),
          name: activeSpawnerItem.name,
          desc: activeSpawnerItem.desc || '',
          refs: activeSpawnerItem.refs ? [...activeSpawnerItem.refs] : [],
          relatedEvents: activeSpawnerItem.relatedEvents ? [...activeSpawnerItem.relatedEvents] : [],
          relatedPeople: activeSpawnerItem.relatedPeople ? [...activeSpawnerItem.relatedPeople] : [],
          x: Math.round(clickX),
          y: Math.round(clickY)
        };
        locations.push(newLoc);
        saveLocations();
        renderLocations();
        showToast(`📍 '${activeSpawnerItem.name}' 장소가 복사되어 배치되었습니다.`);
      } else if (activeSpawnerType === 'event') {
        const newEv = {
          id: 'ev-' + Date.now(),
          name: activeSpawnerItem.name,
          desc: activeSpawnerItem.desc || '',
          refs: activeSpawnerItem.refs ? [...activeSpawnerItem.refs] : [],
          relatedLocations: activeSpawnerItem.relatedLocations ? [...activeSpawnerItem.relatedLocations] : [],
          relatedPeople: activeSpawnerItem.relatedPeople ? [...activeSpawnerItem.relatedPeople] : [],
          x: Math.round(clickX),
          y: Math.round(clickY)
        };
        events.push(newEv);
        saveEvents();
        renderEvents();
        showToast(`📜 '${activeSpawnerItem.name}' 사건이 복사되어 배치되었습니다.`);
      }
      
      cancelPlacementMode();
      autoSaveToServer();
      return;
    }

    const clickedEmptySpace = !e.target.closest('.person-card') && 
                              !e.target.closest('.layer-marker') && 
                              !e.target.closest('#study-panel') && 
                              !e.target.closest('header') && 
                              !e.target.closest('#control-panel') && 
                              !e.target.closest('#search-panel') && 
                              !e.target.closest('#admin-actions-bar') && 
                              !e.target.closest('.modal-content') && 
                              !e.target.closest('#style-editor-panel') && 
                              !e.target.closest('.canvas-annotation') && 
                              !e.target.closest('.canvas-junction-node') &&
                              !e.target.closest('.line-bend-handle') &&
                              !e.target.closest('.poly-vertex-handle') &&
                              !e.target.closest('.family-group-label') &&
                              !e.target.closest('.family-group-panel-poly') &&
                              !e.target.closest('.spouse-connector') && 
                              !e.target.closest('.connector-line');
                              
    if (clickedEmptySpace) {
      if (selectedPersonId || selectedPersonIds.size > 0 || selectedLineKey || selectedJunctionId || selectedPolygonId) {
        selectedPersonId = null;
        selectedPersonIds.clear();
        selectedLineKey = null;
        selectedJunctionId = null;
        selectedPolygonId = null;
        document.querySelectorAll('.canvas-junction-node').forEach(n => n.classList.remove('selected-junction'));
        renderTree();
      }
      closeStudyPanel();
      closeStyleEditorPanel();
      document.getElementById('filter-panel')?.classList.remove('active');
      clearAllHighlights();
    }

    if (isAddPolygonModeActive) {
      if (e.target.closest('header') || e.target.closest('#control-panel') || e.target.closest('#search-panel') || e.target.closest('#admin-actions-bar') || e.target.closest('.modal-content') || e.target.closest('#style-editor-panel')) return;
      
      const rect = treeBoard.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / currentScale;
      const clickY = (e.clientY - rect.top) / currentScale;
      
      let finalX = clickX;
      let finalY = clickY;
      
      if (e.shiftKey && tempPolygonPoints.length > 0) {
        const lastPt = tempPolygonPoints[tempPolygonPoints.length - 1];
        const dx = clickX - lastPt.x;
        const dy = clickY - lastPt.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
          const angleRad = Math.atan2(dy, dx);
          let angleDeg = angleRad * (180 / Math.PI);
          if (angleDeg < 0) angleDeg += 360;
          
          const quadrant = Math.floor(angleDeg / 90);
          const relativeAngle = angleDeg % 90;
          
          const allowedBaseAngles = [0, 30, 45, 75, 90];
          let closestBase = 0;
          let minDiff = Infinity;
          for (const base of allowedBaseAngles) {
            const diff = Math.abs(relativeAngle - base);
            if (diff < minDiff) {
              minDiff = diff;
              closestBase = base;
            }
          }
          
          const constrainedDeg = (quadrant * 90) + closestBase;
          const constrainedRad = constrainedDeg * (Math.PI / 180);
          finalX = lastPt.x + dist * Math.cos(constrainedRad);
          finalY = lastPt.y + dist * Math.sin(constrainedRad);
        }
      }
      
      if (tempPolygonPoints.length >= 3) {
        const startPt = tempPolygonPoints[0];
        const distToStartRaw = Math.hypot(clickX - startPt.x, clickY - startPt.y);
        const distToStartConstrained = Math.hypot(finalX - startPt.x, finalY - startPt.y);
        if (distToStartRaw < 15 || distToStartConstrained < 15) {
          completePolygonCreation();
          return;
        }
      }
      
      tempPolygonPoints.push({ x: finalX, y: finalY });
      showToast(`정점 ${tempPolygonPoints.length}개가 추가되었습니다. 계속 클릭하여 선을 긋고, 시작점을 다시 누르거나 Enter 키로 완료하세요.`);
      updateTempPolygonPreview();
      return;
    }
    
    if (isAddAnnotationModeActive) {
      if (e.target.closest('header') || e.target.closest('#control-panel') || e.target.closest('#search-panel') || e.target.closest('#admin-actions-bar') || e.target.closest('.modal-content') || e.target.closest('#style-editor-panel')) return;
      
      const dist = Math.hypot(e.clientX - startClickX, e.clientY - startClickY);
      if (dist > 5) return;
      
      const rect = treeBoard.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / currentScale;
      const clickY = (e.clientY - rect.top) / currentScale;
      
      pushHistoryState();
      
      const newNote = {
        id: `note-${Date.now()}`,
        text: "새 텍스트 상자\n(클릭하여 편집)",
        x: Math.round(clickX - 100),
        y: Math.round(clickY - 30),
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
      deactivateAddAnnotationMode();
      autoSaveToServer();
      showToast("📝 텍스트 상자가 성공적으로 생성되었습니다.");
      return;
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

function updateTransformLightweight() {
  const scaleFactor = currentScale / scaleAtAnimationStart;
  zoomWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scaleFactor})`;
  zoomWrapper.style.transformOrigin = '0 0';
}

function startZoomAnimation() {
  if (isZoomAnimating) return;
  isZoomAnimating = true;
  
  if (viewerContainer) viewerContainer.classList.add('zooming');
  
  function step() {
    if (!isZoomAnimating) return;
    
    const dScale = targetScale - currentScale;
    const dPanX = targetPanX - panX;
    const dPanY = targetPanY - panY;
    
    // If extremely close, snap to targets and stop
    if (Math.abs(dScale) < 0.001 && Math.abs(dPanX) < 0.1 && Math.abs(dPanY) < 0.1) {
      currentScale = targetScale;
      panX = targetPanX;
      panY = targetPanY;
      zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
      
      // Reset zoomWrapper's temporary scale factor (as updateTransform will draw elements at targetScale)
      zoomWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
      updateTransform();
      isZoomAnimating = false;
      
      setTimeout(() => {
        if (!isZoomAnimating && !isTouchZooming) {
          if (viewerContainer) viewerContainer.classList.remove('zooming');
        }
      }, 50);
      return;
    }
    
    currentScale += dScale * 0.5;
    panX += dPanX * 0.5;
    panY += dPanY * 0.5;
    
    zoomLevelText.textContent = `${Math.round(currentScale * 100)}%`;
    updateTransformLightweight();
    
    requestAnimationFrame(step);
  }
  
  requestAnimationFrame(step);
}

function applyZoom(direction) {
  let nextScale = currentScale;
  if (direction === 'in') nextScale = Math.min(MAX_SCALE, currentScale + ZOOM_STEP);
  if (direction === 'out') nextScale = Math.max(MIN_SCALE, currentScale - ZOOM_STEP);
  if (direction === 'reset') nextScale = 1.0;
  
  if (nextScale === currentScale && direction !== 'reset') return;
  
  let containerCenterX = viewerContainer.clientWidth / 2;
  let containerCenterY = viewerContainer.clientHeight / 2;
  
  if (containerCenterX === 0) {
    containerCenterX = window.innerWidth / 2;
    containerCenterY = (window.innerHeight - 80) / 2;
  }
  
  const worldX = (containerCenterX - panX) / currentScale;
  const worldY = (containerCenterY - panY) / currentScale;
  
  if (!isZoomAnimating) {
    scaleAtAnimationStart = currentScale;
  }
  targetScale = nextScale;
  
  if (direction === 'reset') {
    const coords = coordinates['adam'];
    if (coords) {
      targetPanX = containerCenterX - coords.x * targetScale;
      targetPanY = containerCenterY - coords.y * targetScale;
    } else {
      targetPanX = containerCenterX - worldX * targetScale;
      targetPanY = containerCenterY - worldY * targetScale;
    }
    initialCentered = true;
  } else {
    targetPanX = containerCenterX - worldX * targetScale;
    targetPanY = containerCenterY - worldY * targetScale;
  }
  
  startZoomAnimation();
}

function centerOnCoords(x, y) {
  let containerCenterX = viewerContainer.clientWidth / 2;
  let containerCenterY = viewerContainer.clientHeight / 2;
  
  if (containerCenterX === 0) {
    containerCenterX = window.innerWidth / 2;
    containerCenterY = (window.innerHeight - 80) / 2;
  }
  
  const targetX = containerCenterX - x * currentScale;
  const targetY = containerCenterY - y * currentScale;
  
  if (!initialCentered) {
    panX = targetX;
    panY = targetY;
    targetPanX = targetX;
    targetPanY = targetY;
    updateTransform();
  } else {
    if (!isZoomAnimating) {
      scaleAtAnimationStart = currentScale;
    }
    targetPanX = targetX;
    targetPanY = targetY;
    startZoomAnimation();
  }
}

function centerOnNode(nodeId) {
  const coords = coordinates[nodeId];
  if (!coords) return;
  centerOnCoords(coords.x, coords.y);
}

function updateTransform(onlyPan = false) {
  // Pan zoomWrapper (Using translate3d for GPU-composited, zero-lag rendering!)
  zoomWrapper.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
  zoomWrapper.style.zoom = 'normal';
  
  if (onlyPan) {
    return;
  }
  
  // Set dimensions on board and wrapper based on scale
  const scaledWidth = boardWidth * currentScale;
  const scaledHeight = boardHeight * currentScale;
  treeBoard.style.width = `${scaledWidth}px`;
  treeBoard.style.height = `${scaledHeight}px`;
  zoomWrapper.style.width = `${scaledWidth}px`;
  zoomWrapper.style.height = `${scaledHeight}px`;
  
  // Update SVG layer size and viewBox (which scales the paths automatically!)
  if (svgLayer) {
    svgLayer.style.width = `${scaledWidth}px`;
    svgLayer.style.height = `${scaledHeight}px`;
    svgLayer.setAttribute("viewBox", `0 0 ${boardWidth} ${boardHeight}`);
  }
  const polygonsLayer = document.getElementById('svg-polygons-layer');
  if (polygonsLayer) {
    polygonsLayer.style.width = `${scaledWidth}px`;
    polygonsLayer.style.height = `${scaledHeight}px`;
    polygonsLayer.setAttribute("viewBox", `0 0 ${boardWidth} ${boardHeight}`);
  }
  
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
  
  // Scale markers (Events and Locations)
  const markers = treeBoard.querySelectorAll('.layer-marker');
  markers.forEach(marker => {
    let item;
    if (marker.id.startsWith('event-')) {
      item = events.find(e => e.id === marker.id.replace('event-', ''));
    } else {
      item = locations.find(l => l.id === marker.id.replace('location-', ''));
    }
    if (item) {
      marker.style.left = `${item.x * currentScale}px`;
      marker.style.top = `${item.y * currentScale}px`;
      marker.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
      marker.style.transformOrigin = '50% 50%';
    }
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
  
  // Scale bend handles
  const handles = treeBoard.querySelectorAll('.line-bend-handle');
  if (selectedLineKey && lineBends[selectedLineKey]) {
    const points = lineBends[selectedLineKey];
    handles.forEach(handle => {
      const idx = parseInt(handle.dataset.index);
      const pt = points[idx];
      if (pt) {
        handle.style.left = `${pt.x * currentScale}px`;
        handle.style.top = `${pt.y * currentScale}px`;
      }
    });
  }
  
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

  // Scale custom polygon labels
  const polyLabels = treeBoard.querySelectorAll('.family-group-label');
  polyLabels.forEach(label => {
    const polyId = label.id.replace('label-poly-', '');
    const poly = customPolygons.find(p => p.id === polyId);
    if (poly && poly.points.length > 0) {
      let labelPt = poly.points[0];
      poly.points.forEach(pt => {
        if (pt.y < labelPt.y || (pt.y === labelPt.y && pt.x < labelPt.x)) {
          labelPt = pt;
        }
      });
      const offX = poly.labelOffsetX || 0;
      const offY = poly.labelOffsetY || 0;
      label.style.left = `${(labelPt.x + offX) * currentScale}px`;
      label.style.top = `${(labelPt.y - 12 + offY) * currentScale}px`;
      label.style.transform = `scale(${currentScale})`;
      label.style.transformOrigin = '0 100%';
    }
  });

  // Scale custom polygon vertex handles
  const polyHandles = treeBoard.querySelectorAll('.poly-vertex-handle');
  polyHandles.forEach(handle => {
    const polyId = handle.dataset.polyId;
    const idx = parseInt(handle.dataset.index);
    const poly = customPolygons.find(p => p.id === polyId);
    if (poly && poly.points[idx]) {
      const pt = poly.points[idx];
      handle.style.left = `${pt.x * currentScale}px`;
      handle.style.top = `${pt.y * currentScale}px`;
      handle.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
      handle.style.transformOrigin = '50% 50%';
    }
  });

  // Keep generation labels sticky at the left end of the browser viewport (Admin Mode only)
  if (isAdminMode) {
    const labels = treeBoard.querySelectorAll('.generation-label');
    const stickyLeft = -panX + 24;
    labels.forEach(label => {
      label.style.left = `${stickyLeft}px`;
      label.style.transform = `translateY(-50%) scale(${currentScale})`;
      label.style.transformOrigin = '0 50%';
    });
  }

  // Safari SVG filter compatibility check (now observed once during drawing)
}

// SVG glow path MutationObserver (safely duplicates highlighted lines in background for 100% Safari/WebKit compatibility)
const highlightObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const target = mutation.target;
      const isHighlighted = target.classList.contains('line-highlight');
      
      if (target.classList.contains('spouse-connector')) {
        const spouseIdsAttr = target.getAttribute('data-spouse-ids');
        if (spouseIdsAttr) {
          const ids = spouseIdsAttr.split(',');
          const circle = document.getElementById(`circle-${ids[0]}-${ids[1]}`) || 
                         document.getElementById(`circle-${ids[1]}-${ids[0]}`);
          if (circle) {
            if (isHighlighted) {
              circle.classList.add('line-highlight');
            } else {
              circle.classList.remove('line-highlight');
            }
          }
        }
      }
      
      const lineKey = target.getAttribute('data-line-key') || target.getAttribute('d') || '';
      const sanitizedKey = lineKey.replace(/[^a-zA-Z0-9-]/g, '');
      const glowId = `glow-${target.id || 'path'}-${sanitizedKey}`;
      let glowPath = document.getElementById(glowId);
      
      if (isHighlighted) {
        if (!glowPath) {
          glowPath = target.cloneNode(false);
          glowPath.id = glowId;
          glowPath.setAttribute('class', 'connector-line-glow');
          glowPath.setAttribute('stroke', '#ff7a00'); // Beautiful orange aura color
          glowPath.setAttribute('stroke-width', '11px');
          glowPath.setAttribute('opacity', '0.45');
          glowPath.setAttribute('fill', 'none');
          glowPath.setAttribute('stroke-linecap', 'round');
          glowPath.removeAttribute('filter');
          glowPath.removeAttribute('stroke-dasharray');
          glowPath.style.animation = 'none';
          
          // Insert right behind the main highlighted path so it draws underneath
          const parent = target.parentNode;
          if (parent) {
            parent.insertBefore(glowPath, target);
          }
        }
      } else {
        if (glowPath) {
          glowPath.remove();
        }
      }
    }
  }
});

function observeAllConnectorPaths() {
  document.querySelectorAll('.connector-line, .spouse-connector, .preacher-line, .custom-visual-line').forEach(el => {
    highlightObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
  });
}

// Descendants helper functions
function getDescendants(charId, set) {
  if (set.has(charId)) return;
  set.add(charId);
  db.forEach(c => {
    if (c.parents && c.parents.includes(charId)) {
      getDescendants(c.id, set);
    }
  });
}

function getDirectLineage(charId) {
  const lineage = new Set();
  getAncestors(charId, lineage);
  getDescendants(charId, lineage);
  return lineage;
}

// Relationship Highlighting Helper Functions
function clearAllHighlights() {
  document.querySelectorAll('.person-card.highlight, .layer-marker.highlight, .canvas-annotation.highlight, .canvas-junction-node.highlight').forEach(el => {
    el.classList.remove('highlight');
  });
  document.querySelectorAll('.connector-line.line-highlight, .spouse-connector.line-highlight, .spouse-node-circle.line-highlight').forEach(el => {
    el.classList.remove('line-highlight');
  });
  if (treeBoard) treeBoard.classList.remove('relationship-highlight-active');
  if (viewerContainer) viewerContainer.classList.remove('relationship-highlight-active');
}

function highlightRelatedElementsForAnnotation(annot) {
  if (isAdminMode) return;
  const toggle = document.getElementById('toggle-relationship-highlight');
  if (toggle && !toggle.checked) return;

  // 1. Clear previous highlights
  clearAllHighlights();
  if (treeBoard) treeBoard.classList.add('relationship-highlight-active');
  if (viewerContainer) viewerContainer.classList.add('relationship-highlight-active');
  
  // Highlight the annotation itself
  const annotEl = document.getElementById(`annot-${annot.id}`);
  if (annotEl) annotEl.classList.add('highlight');
  
  const text = (annot.text || '').trim();
  
  // Helper to safely clean string and match Korean names
  const safeContains = (textVal, name) => {
    if (!textVal || !name) return false;
    const cleanText = textVal.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim().toLowerCase();
    const cleanName = name.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim().toLowerCase();
    return cleanText.includes(cleanName) || cleanName.includes(cleanText);
  };
  
  // 2. Custom Northern Kingdom Kings highlights
  const isNorthernKingdomKings = 
    annot.id === 'annotation_1785465647957_2j351uc9h' ||
    text === '북왕국 이스라엘의 왕들' ||
    text === '북이스라엘의 왕들' ||
    text === '북이스라엘 왕들' ||
    text === 'Kings of Northern Israel' ||
    text === 'Kings of the Northern Kingdom' ||
    text === 'Kings of the Northern Kingdom of Israel';

  if (isNorthernKingdomKings) {
    const northernKingdomKingIds = [
      'nebat', 'zeruah_nebat',
      'jeroboam1', 'nadab_jeroboam', 'baasha', 'elah_baasha', 'zimri', 
      'omri', 'ahab', 'ahaziah_ahab', 'jehoram_ahab', 'jehu', 
      'jehoahaz_jehu', 'jehoash_jehoahaz', 'jeroboam2', 'zechariah_jeroboam2', 
      'shallum', 'menahem', 'pekahiah', 'pekah', 'hoshea'
    ];
    const highlightedIds = new Set(northernKingdomKingIds);

    // Expand highlightedIds to include all parents, spouses, and children of these kings
    northernKingdomKingIds.forEach(kingId => {
      const char = db.find(c => c.id === kingId);
      if (char) {
        if (char.parents) char.parents.forEach(pId => highlightedIds.add(pId));
        if (char.spouses) char.spouses.forEach(sId => highlightedIds.add(sId));
        
        // Find children
        db.forEach(child => {
          if (child.parents && child.parents.includes(kingId)) {
            highlightedIds.add(child.id);
          }
        });
      }
    });

    highlightedIds.forEach(id => {
      const el = document.getElementById(`card-${id}`);
      if (el) el.classList.add('highlight');
    });

    document.querySelectorAll('.connector-line').forEach(path => {
      const childId = path.getAttribute('data-child-id');
      const parentKey = path.getAttribute('data-parent-key');
      if (childId && highlightedIds.has(childId)) {
        const parentIds = parentKey ? parentKey.split(',') : [];
        const hasHighlightedParent = parentIds.some(pId => highlightedIds.has(pId));
        if (hasHighlightedParent) {
          path.classList.add('line-highlight');
        }
      }
    });

    document.querySelectorAll('.spouse-connector').forEach(path => {
      const spouseIdsAttr = path.getAttribute('data-spouse-ids');
      if (spouseIdsAttr) {
        const ids = spouseIdsAttr.split(',');
        if (ids.every(id => highlightedIds.has(id))) {
          path.classList.add('line-highlight');
        }
      }
    });

    document.querySelectorAll('.spouse-node-circle').forEach(circle => {
      const spouseIdsAttr = circle.getAttribute('data-spouse-ids');
      if (spouseIdsAttr) {
        const ids = spouseIdsAttr.split(',');
        if (ids.every(id => highlightedIds.has(id))) {
          circle.classList.add('line-highlight');
        }
      }
    });
  }

  // 3. Text-based Matching: Highlight people, events, and locations containing or contained by annotation text
  if (text) {
    db.forEach(person => {
      if (safeContains(text, person.name)) {
        const el = document.getElementById(`card-${person.id}`);
        if (el) el.classList.add('highlight');
      }
    });
    
    events.forEach(ev => {
      if (safeContains(text, ev.name)) {
        const el = document.getElementById(`event-${ev.id}`);
        if (el) el.classList.add('highlight');
      }
    });
    
    locations.forEach(loc => {
      if (safeContains(text, loc.name)) {
        const el = document.getElementById(`location-${loc.id}`);
        if (el) el.classList.add('highlight');
      }
    });
  }
  
  // 3. Connection-based Matching (lines connected to this annotation)
  customVisualLines.forEach(line => {
    const targetId = `annot-${annot.id}`;
    let connectedElId = null;
    let lineKey = null;
    
    if (line.from === targetId) {
      connectedElId = line.to;
      lineKey = `${line.from}-${line.to}`;
    } else if (line.to === targetId) {
      connectedElId = line.from;
      lineKey = `${line.from}-${line.to}`;
    }
    
    if (connectedElId) {
      let el = null;
      if (connectedElId.startsWith('card-')) {
        const charId = connectedElId.replace('card-', '');
        el = document.getElementById(`card-${charId}`);
      } else if (connectedElId.startsWith('event-')) {
        const evId = connectedElId.replace('event-', '');
        el = document.getElementById(`event-${evId}`);
      } else if (connectedElId.startsWith('location-')) {
        const locId = connectedElId.replace('location-', '');
        el = document.getElementById(`location-${locId}`);
      } else if (connectedElId.startsWith('annot-')) {
        const annotId = connectedElId.replace('annot-', '');
        el = document.getElementById(`annot-${annotId}`);
      }
      
      if (el) el.classList.add('highlight');
      
      const pathEl = document.querySelector(`path[data-line-key="${lineKey}"]`);
      if (pathEl) pathEl.classList.add('line-highlight');
    }
  });
  
  // 4. Explicit Relation Matching (selected via 🔗 button)
  if (annot.relatedPeople && Array.isArray(annot.relatedPeople)) {
    annot.relatedPeople.forEach(ref => {
      const el = document.getElementById(`card-${ref}`) || document.getElementById(`card-${db.find(p => p.name === ref)?.id}`);
      if (el) el.classList.add('highlight');
    });
  }
  
  if (annot.relatedEvents && Array.isArray(annot.relatedEvents)) {
    annot.relatedEvents.forEach(ref => {
      const el = document.getElementById(`event-${ref}`);
      if (el) el.classList.add('highlight');
    });
  }
  
  if (annot.relatedLocations && Array.isArray(annot.relatedLocations)) {
    annot.relatedLocations.forEach(ref => {
      const el = document.getElementById(`location-${ref}`);
      if (el) el.classList.add('highlight');
    });
  }
}

function highlightRelatedElements(itemId, itemType) {
  if (isAdminMode) return;
  const toggle = document.getElementById('toggle-relationship-highlight');
  if (toggle && !toggle.checked) return;

  // 1. Clear previous highlights
  clearAllHighlights();
  if (treeBoard) treeBoard.classList.add('relationship-highlight-active');
  if (viewerContainer) viewerContainer.classList.add('relationship-highlight-active');

  // 2. Find target item
  let targetItem = null;
  if (itemType === 'person') {
    targetItem = db.find(c => c.id === itemId);
  } else if (itemType === 'event') {
    targetItem = events.find(e => e.id === itemId);
  } else if (itemType === 'location') {
    targetItem = locations.find(l => l.id === itemId);
  } else if (itemType === 'polygon') {
    targetItem = customPolygons.find(p => p.id === itemId);
  }
  
  if (!targetItem) return;

  // Highlight target itself
  if (itemType === 'person') {
    const el = document.getElementById(`card-${itemId}`);
    if (el) el.classList.add('highlight');
  } else if (itemType === 'polygon') {
    const el = document.getElementById(`svg-poly-${itemId}`);
    if (el) el.classList.add('highlight');
    const labelEl = document.getElementById(`label-poly-${itemId}`);
    if (labelEl) labelEl.classList.add('highlight');
  } else {
    const el = document.getElementById(`${itemType}-${itemId}`);
    if (el) el.classList.add('highlight');
  }

  // Helper to safely clean string and match Korean names/locations
  const safeContains = (text, name) => {
    if (!text || !name) return false;
    return text.includes(name);
  };

  // Helper to check explicit array values
  const hasExplicitRelation = (arr, val1, val2) => {
    if (!arr || !Array.isArray(arr)) return false;
    return (val1 && arr.includes(val1)) || (val2 && arr.includes(val2));
  };

  // 3. Highlight based on relationship type
  if (itemType === 'event') {
    // Highlight related people
    db.forEach(person => {
      const isRelated = 
        safeContains(targetItem.name, person.name) ||
        safeContains(targetItem.desc, person.name) ||
        safeContains(person.desc, targetItem.name) ||
        (targetItem.refs && targetItem.refs.some(r => safeContains(r, person.name))) ||
        hasExplicitRelation(targetItem.relatedPeople, person.id, person.name);
      
      if (isRelated) {
        const el = document.getElementById(`card-${person.id}`);
        if (el) el.classList.add('highlight');
      }
    });

    // Highlight related locations
    locations.forEach(loc => {
      const isRelated = 
        safeContains(targetItem.name, loc.name) ||
        safeContains(targetItem.desc, loc.name) ||
        safeContains(loc.desc, targetItem.name) ||
        hasExplicitRelation(targetItem.relatedLocations, loc.id, loc.name) ||
        hasExplicitRelation(loc.relatedEvents, targetItem.id, targetItem.name);
      
      if (isRelated) {
        const el = document.getElementById(`location-${loc.id}`);
        if (el) el.classList.add('highlight');
      }
    });
  } 
  else if (itemType === 'location') {
    // Highlight related people
    db.forEach(person => {
      const isRelated = 
        safeContains(targetItem.name, person.name) ||
        safeContains(targetItem.desc, person.name) ||
        safeContains(person.desc, targetItem.name) ||
        hasExplicitRelation(targetItem.relatedPeople, person.id, person.name);
      
      if (isRelated) {
        const el = document.getElementById(`card-${person.id}`);
        if (el) el.classList.add('highlight');
      }
    });

    // Highlight related events
    events.forEach(ev => {
      const isRelated = 
        safeContains(ev.name, targetItem.name) ||
        safeContains(ev.desc, targetItem.name) ||
        safeContains(targetItem.desc, ev.name) ||
        hasExplicitRelation(targetItem.relatedEvents, ev.id, ev.name) ||
        hasExplicitRelation(ev.relatedLocations, targetItem.id, targetItem.name);
      
      if (isRelated) {
        const el = document.getElementById(`event-${ev.id}`);
        if (el) el.classList.add('highlight');
      }
    });
  }
  else if (itemType === 'person') {
    // Highlight related events
    events.forEach(ev => {
      const isRelated = 
        safeContains(ev.name, targetItem.name) ||
        safeContains(ev.desc, targetItem.name) ||
        safeContains(targetItem.desc, ev.name) ||
        (ev.refs && ev.refs.some(r => safeContains(r, targetItem.name))) ||
        hasExplicitRelation(ev.relatedPeople, targetItem.id, targetItem.name) ||
        hasExplicitRelation(targetItem.relatedEvents, ev.id, ev.name);
      
      if (isRelated) {
        const el = document.getElementById(`event-${ev.id}`);
        if (el) el.classList.add('highlight');
      }
    });

    // Highlight related locations
    locations.forEach(loc => {
      const isRelated = 
        safeContains(loc.name, targetItem.name) ||
        safeContains(loc.desc, targetItem.name) ||
        safeContains(targetItem.desc, loc.name) ||
        hasExplicitRelation(loc.relatedPeople, targetItem.id, targetItem.name) ||
        hasExplicitRelation(targetItem.relatedLocations, loc.id, loc.name);
      
      if (isRelated) {
        const el = document.getElementById(`location-${loc.id}`);
        if (el) el.classList.add('highlight');
      }
    });

    // Highlight direct lineage (ancestors and descendants)
    const lineage = getDirectLineage(itemId);
    const highlightedIds = new Set(lineage);
    
    // Add spouses, siblings, teachers, disciples of all lineage members (including clicked person)
    lineage.forEach(lineageId => {
      const char = db.find(c => c.id === lineageId);
      if (!char) return;
      
      // 1. Add spouses
      if (char.spouses && Array.isArray(char.spouses)) {
        char.spouses.forEach(sId => highlightedIds.add(sId));
      }
      

      
      // 3. Add teachers
      if (char.teachers && Array.isArray(char.teachers)) {
        char.teachers.forEach(tId => highlightedIds.add(tId));
      }
      
      // 4. Add disciples
      db.forEach(c => {
        if (c.teachers && Array.isArray(c.teachers) && c.teachers.includes(lineageId)) {
          highlightedIds.add(c.id);
        }
      });
      
      // 5. Add prophets/related prophets (if any)
      if (char.prophets && Array.isArray(char.prophets)) {
        char.prophets.forEach(pId => highlightedIds.add(pId));
      }
      db.forEach(c => {
        if (c.prophets && Array.isArray(c.prophets) && c.prophets.includes(lineageId)) {
          highlightedIds.add(c.id);
        }
      });
      
      // 6. Add explicitly related people (relatedPeople property)
      if (char.relatedPeople && Array.isArray(char.relatedPeople)) {
        char.relatedPeople.forEach(rId => highlightedIds.add(rId));
      }
      db.forEach(c => {
        if (c.relatedPeople && Array.isArray(c.relatedPeople) && c.relatedPeople.includes(lineageId)) {
          highlightedIds.add(c.id);
        }
      });
    });

    // Now add highlight class to all cards in highlightedIds
    highlightedIds.forEach(id => {
      const el = document.getElementById(`card-${id}`);
      if (el) el.classList.add('highlight');
    });

    // Highlight connection lines for direct lineage members and related members
    document.querySelectorAll('.connector-line').forEach(path => {
      const childId = path.getAttribute('data-child-id');
      if (childId && highlightedIds.has(childId)) {
        path.classList.add('line-highlight');
      }
    });
    
    document.querySelectorAll('.spouse-connector').forEach(path => {
      const spouseIdsAttr = path.getAttribute('data-spouse-ids');
      if (spouseIdsAttr) {
        const ids = spouseIdsAttr.split(',');
        if (ids.every(id => highlightedIds.has(id))) {
          path.classList.add('line-highlight');
        }
      }
    });

    document.querySelectorAll('.spouse-node-circle').forEach(circle => {
      const spouseIdsAttr = circle.getAttribute('data-spouse-ids');
      if (spouseIdsAttr) {
        const ids = spouseIdsAttr.split(',');
        if (ids.every(id => highlightedIds.has(id))) {
          circle.classList.add('line-highlight');
        }
      }
    });

    // Highlight teacher/disciple (preacher) lines if both teacher and disciple are highlighted
    document.querySelectorAll('.preacher-line').forEach(path => {
      const teacherId = path.getAttribute('data-teacher-id');
      const discipleId = path.getAttribute('data-disciple-id');
      if (teacherId && discipleId && highlightedIds.has(teacherId) && highlightedIds.has(discipleId)) {
        path.classList.add('line-highlight');
      }
    });

    // Highlight custom visual lines if both source and target are highlighted
    document.querySelectorAll('.custom-visual-line').forEach(path => {
      const linkId = path.getAttribute('data-link-id');
      if (linkId) {
        const line = customVisualLines.find(l => l.id === linkId);
        if (line) {
          const fromId = String(line.from);
          const toId = String(line.to);
          if (highlightedIds.has(fromId) && highlightedIds.has(toId)) {
            path.classList.add('line-highlight');
          }
        }
      }
    });
  }
  else if (itemType === 'polygon') {
    if (targetItem.points && targetItem.points.length >= 3) {
      const highlightedIds = new Set();

      // Highlight characters geometrically inside (applying tribe keywords)
      db.forEach(char => {
        const coords = coordinates[char.id];
        if (coords && isPointInPolygon(coords, targetItem.points)) {
          let isTribeMatch = true;
          const charTribe = getTribeId(char.id);
          if (targetItem.label) {
            for (const [kw, tId] of Object.entries(TRIBE_KEYWORDS)) {
              if (targetItem.label.includes(kw)) {
                if (charTribe && charTribe !== tId) {
                  isTribeMatch = false;
                }
                break;
              }
            }
          }
          if (isTribeMatch) {
            const isJudahRegion = targetItem.id === 'poly-custom-1785472410768';
            const isProphet = char.isProphet === true || (typeof prophetIds !== 'undefined' && prophetIds.has(char.id)) || char.id.startsWith('prophet_') || char.id === 'samuel';
            if (isJudahRegion && isProphet) {
              // Exclude prophets from highlighting when Judah region is active
            } else {
              highlightedIds.add(char.id);
              const card = document.getElementById(`card-${char.id}`);
              if (card) card.classList.add('highlight');
            }
          }
        }
      });
      
      // Highlight events geometrically inside
      events.forEach(ev => {
        if (ev.x !== undefined && ev.y !== undefined && isPointInPolygon(ev, targetItem.points)) {
          const el = document.getElementById(`event-${ev.id}`);
          if (el) el.classList.add('highlight');
        }
      });
      
      // Highlight locations geometrically inside
      locations.forEach(loc => {
        if (loc.x !== undefined && loc.y !== undefined && isPointInPolygon(loc, targetItem.points)) {
          const el = document.getElementById(`location-${loc.id}`);
          if (el) el.classList.add('highlight');
        }
      });

      // Highlight connection lines for direct lineage members inside the polygon
      document.querySelectorAll('.connector-line').forEach(path => {
        const childId = path.getAttribute('data-child-id');
        if (childId && highlightedIds.has(childId)) {
          path.classList.add('line-highlight');
        }
      });
      
      document.querySelectorAll('.spouse-connector').forEach(path => {
        const spouseIdsAttr = path.getAttribute('data-spouse-ids');
        if (spouseIdsAttr) {
          const ids = spouseIdsAttr.split(',');
          if (ids.every(id => highlightedIds.has(id))) {
            path.classList.add('line-highlight');
          }
        }
      });

      document.querySelectorAll('.spouse-node-circle').forEach(circle => {
        const spouseIdsAttr = circle.getAttribute('data-spouse-ids');
        if (spouseIdsAttr) {
          const ids = spouseIdsAttr.split(',');
          if (ids.every(id => highlightedIds.has(id))) {
            circle.classList.add('line-highlight');
          }
        }
      });

      document.querySelectorAll('.preacher-line').forEach(path => {
        const teacherId = path.getAttribute('data-teacher-id');
        const discipleId = path.getAttribute('data-disciple-id');
        if (teacherId && discipleId && highlightedIds.has(teacherId) && highlightedIds.has(discipleId)) {
          path.classList.add('line-highlight');
        }
      });

      document.querySelectorAll('.custom-visual-line').forEach(path => {
        const linkId = path.getAttribute('data-link-id');
        if (linkId) {
          const line = customVisualLines.find(l => l.id === linkId);
          if (line) {
            const fromId = String(line.from);
            const toId = String(line.to);
            if (highlightedIds.has(fromId) && highlightedIds.has(toId)) {
              path.classList.add('line-highlight');
            }
          }
        }
      });
    }
  }
}

// Setup Search
function setupSearch() {
  const searchResults = document.getElementById('search-results');
  
  let savedPanX = panX;
  let savedPanY = panY;
  let savedScale = currentScale;

  searchInput.addEventListener('focus', () => {
    savedPanX = panX;
    savedPanY = panY;
    savedScale = currentScale;
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    document.querySelectorAll('.person-card.highlight, .layer-marker.highlight, .canvas-annotation.highlight, .canvas-junction-node.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
    
    if (searchResults) {
      searchResults.innerHTML = '';
      searchResults.style.display = 'none';
    }
    
    if (!query) {
      clearAllHighlights();
      panX = savedPanX;
      panY = savedPanY;
      currentScale = savedScale;
      updateTransform();
      return;
    }
    
    // Combine data sources based on active legend layer checkboxes
    const showPeople = document.getElementById('toggle-layer-people')?.checked !== false;
    const showEvents = document.getElementById('toggle-layer-events')?.checked !== false;
    const showLocations = document.getElementById('toggle-layer-locations')?.checked !== false;
    
    const combinedData = [
      ...(showPeople ? db.map(c => ({...c, dataType: 'person'})) : []),
      ...(showEvents ? events.map(e => ({...e, dataType: 'event'})) : []),
      ...(showLocations ? locations.map(l => ({...l, dataType: 'location'})) : [])
    ];
    
    // Find the best match, prioritizing exact match -> starts-with match -> contains match
    let partialMatch = combinedData.find(item => {
      const name = (item.dataType === 'person') ? getCharName(item) : ((item.dataType === 'event') ? getEventName(item) : getLocationName(item));
      const eng = item.engName || '';
      return name.toLowerCase() === query || eng.toLowerCase() === query;
    });
    if (!partialMatch) {
      partialMatch = combinedData.find(item => {
        const name = (item.dataType === 'person') ? getCharName(item) : ((item.dataType === 'event') ? getEventName(item) : getLocationName(item));
        const eng = item.engName || '';
        return name.toLowerCase().startsWith(query) || eng.toLowerCase().startsWith(query);
      });
    }
    if (!partialMatch) {
      partialMatch = combinedData.find(item => {
        const name = (item.dataType === 'person') ? getCharName(item) : ((item.dataType === 'event') ? getEventName(item) : getLocationName(item));
        const eng = item.engName || '';
        return name.toLowerCase().includes(query) || eng.toLowerCase().includes(query);
      });
    }
    
    if (partialMatch) {
      if (partialMatch.dataType === 'person') {
        const card = document.getElementById(`card-${partialMatch.id}`);
        if (card) {
          card.classList.add('highlight');
          centerOnNode(partialMatch.id);
        }
      } else {
        const marker = document.getElementById(`${partialMatch.dataType}-${partialMatch.id}`);
        if (marker) {
          marker.classList.add('highlight');
          centerOnCoords(partialMatch.x, partialMatch.y);
        }
      }
    }

    // Next, check for EXACT namesakes to populate the dropdown
    const exactMatches = combinedData.filter(item => {
      const name = (item.dataType === 'person') ? getCharName(item) : ((item.dataType === 'event') ? getEventName(item) : getLocationName(item));
      const eng = item.engName || '';
      return name.toLowerCase() === query || eng.toLowerCase() === query;
    });
    
    // Only show dropdown if they typed a full name that has multiple identical matches
    if (exactMatches.length > 1 && searchResults) {
      searchResults.style.display = 'block';
      exactMatches.forEach(matched => {
        const li = document.createElement('li');
        li.className = 'search-result-item';
        
        let parentInfo = '';
        if (matched.dataType === 'person' && matched.parents && matched.parents.length > 0) {
          const parentId = matched.parents[0];
          const parent = db.find(p => p.id === parentId);
          if (parent) {
            const parentName = getCharName(parent);
            const textChild = currentLang === 'en' ? `Child of ${parentName}` : `${parentName}의 자녀`;
            parentInfo = `<span class="parent-info">(${textChild})</span>`;
          }
        } else if (matched.dataType === 'event') {
          const textEvent = currentLang === 'en' ? 'Event' : '사건';
          parentInfo = `<span class="parent-info">(📜 ${textEvent})</span>`;
        } else if (matched.dataType === 'location') {
          const textLoc = currentLang === 'en' ? 'Location' : '장소';
          parentInfo = `<span class="parent-info">(📍 ${textLoc})</span>`;
        }
        
        const displayName = matched.dataType === 'person' ? getCharName(matched) : cleanLayerName(matched.dataType === 'event' ? getEventName(matched) : getLocationName(matched));
        li.innerHTML = `<strong>${displayName}</strong> ${parentInfo}`;
        
        li.addEventListener('click', () => {
          const selectName = matched.dataType === 'person' ? getCharName(matched) : (matched.dataType === 'event' ? getEventName(matched) : getLocationName(matched));
          searchInput.value = selectName;
          searchResults.style.display = 'none';
          
          document.querySelectorAll('.person-card.highlight, .layer-marker.highlight').forEach(el => {
            el.classList.remove('highlight');
          });
          
          if (matched.dataType === 'person') {
            const card = document.getElementById(`card-${matched.id}`);
            if (card) {
              card.classList.add('highlight');
              centerOnNode(matched.id);
            }
          } else {
            const marker = document.getElementById(`${matched.dataType}-${matched.id}`);
            if (marker) {
              marker.classList.add('highlight');
              centerOnCoords(matched.x, matched.y);
            }
          }
        });
        
        searchResults.appendChild(li);
      });
    }
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchInput.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }

    // 1. Lineage Filter Panel (#filter-panel) auto close when clicking outside
    const filterPanel = document.getElementById('filter-panel');
    if (filterPanel && filterPanel.classList.contains('active')) {
      if (!e.target.closest('#filter-panel') && !e.target.closest('#filter-panel-toggle')) {
        filterPanel.classList.remove('active');
      }
    }

    // 2. Personal Study/Memo Panel (#study-panel) auto close when clicking outside
    const studyPanel = document.getElementById('study-panel');
    if (studyPanel && studyPanel.classList.contains('active')) {
      const isClickInsideStudyPanel = e.target.closest('#study-panel');
      const isClickOnTrigger = 
        e.target.closest('.person-card') || 
        e.target.closest('.layer-marker') || 
        e.target.closest('.canvas-annotation') ||
        e.target.closest('#control-panel') ||
        e.target.closest('#main-header') ||
        e.target.closest('#search-panel') ||
        e.target.closest('.modal-content') ||
        e.target.closest('.toast');
        
      if (!isClickInsideStudyPanel && !isClickOnTrigger) {
        closeStudyPanel();
      }
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
      userNotes[activePersonId] = noteContent;
    } else {
      delete userNotes[activePersonId];
    }
    saveUserNotes();
    // Immediately write single MD file on save button click
    writeSingleNoteMd(activePersonId, noteContent);
    
    const card = document.getElementById(`card-${activePersonId}`);
    if (card) {
      let badge = card.querySelector('.card-note-badge');
      if (noteContent) {
        if (!badge) {
          const badgeEl = document.createElement('div');
          badgeEl.className = 'card-note-badge';
          badgeEl.title = '메모 있음';
          badgeEl.textContent = '📝';
          card.appendChild(badgeEl);
        }
      } else {
        if (badge) {
          badge.remove();
        }
      }
    } else {
      const annotEl = document.getElementById(`annot-${activePersonId}`);
      if (annotEl) {
        let badge = annotEl.querySelector('.annot-note-badge');
        if (noteContent) {
          if (!badge) {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'annot-note-badge';
            badgeEl.title = '메모 있음';
            badgeEl.textContent = '📝';
            badgeEl.style.position = 'absolute';
            badgeEl.style.top = '-8px';
            badgeEl.style.right = '-8px';
            badgeEl.style.fontSize = '12px';
            badgeEl.style.zIndex = '100';
            annotEl.appendChild(badgeEl);
          }
        } else {
          if (badge) {
            badge.remove();
          }
        }
      }
    }
    
    closeStudyPanel();
  });
  
  // Auto-save note on input in real-time
  noteTextarea.addEventListener('input', () => {
    if (!activePersonId) return;
    
    const noteContent = noteTextarea.value.trim();
    if (noteContent) {
      userNotes[activePersonId] = noteContent;
    } else {
      delete userNotes[activePersonId];
    }
    saveUserNotes();
    // Also write MD immediately on every input (debounce handled inside triggerAutoBackup)
    writeSingleNoteMd(activePersonId, noteContent);
    
    // Update badge on card or annotation
    const card = document.getElementById(`card-${activePersonId}`);
    if (card) {
      let badge = card.querySelector('.card-note-badge');
      if (noteContent) {
        if (!badge) {
          const badgeEl = document.createElement('div');
          badgeEl.className = 'card-note-badge';
          badgeEl.title = '메모 있음';
          badgeEl.textContent = '📝';
          card.appendChild(badgeEl);
        }
      } else {
        if (badge) {
          badge.remove();
        }
      }
    } else {
      const annotEl = document.getElementById(`annot-${activePersonId}`);
      if (annotEl) {
        let badge = annotEl.querySelector('.annot-note-badge');
        if (noteContent) {
          if (!badge) {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'annot-note-badge';
            badgeEl.title = '메모 있음';
            badgeEl.textContent = '📝';
            badgeEl.style.position = 'absolute';
            badgeEl.style.top = '-8px';
            badgeEl.style.right = '-8px';
            badgeEl.style.fontSize = '12px';
            badgeEl.style.zIndex = '100';
            annotEl.appendChild(badgeEl);
          }
        } else {
          if (badge) {
            badge.remove();
          }
        }
      }
    }
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
  activePersonId = personId;
  activeStudyPanelType = 'person';
  const char = db.find(c => c.id === personId);
  if (!char) return;
  
  const infoTitleEl = document.getElementById('panel-info-title');
  if (infoTitleEl) {
    infoTitleEl.textContent = currentLang === 'en' ? 'Biblical Character Info' : '성경 속 인물 정보';
  }
  
  if (currentLang === 'en') {
    document.getElementById('panel-name').textContent = char.engName;
    document.getElementById('panel-eng').textContent = `${char.name} (${char.gender === 'M' ? 'Male' : 'Female'})`;
    document.getElementById('panel-desc').textContent = char.engDesc || char.desc || 'No description available.';
  } else {
    document.getElementById('panel-name').textContent = char.name;
    document.getElementById('panel-eng').textContent = `${char.engName} (${char.gender === 'M' ? '남성' : '여성'})`;
    document.getElementById('panel-desc').textContent = char.desc || '정보가 없습니다.';
  }
  
  const noteTextarea = document.getElementById('note-text');
  const savedNote = userNotes[personId] || '';
  noteTextarea.value = savedNote;
  
  const resources = JSON.parse(localStorage.getItem(`bible_tree_resources_${personId}`)) || [];
  renderResourcesList(resources);
  
  studyPanel.classList.add('active');
  highlightRelatedElements(personId, 'person');
}

function closeStudyPanel() {
  studyPanel.classList.remove('active');
  activePersonId = null;
  activeStudyPanelType = null;
  clearAllHighlights();
  
  if (wasOpenedFromFilter) {
    wasOpenedFromFilter = false;
    document.getElementById('filter-panel')?.classList.add('active');
  }
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
  if (!toggleBtn) return;
  if (theme === 'dark') {
    toggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  } else {
    toggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>`;
  }
}

function updateStats() {
  const statsSpan = document.getElementById('stats');
  const maleCount = db.filter(c => c.gender === 'M').length;
  const femaleCount = db.filter(c => c.gender === 'F').length;
  
  if (currentLang === 'en') {
    statsSpan.textContent = `Total: ${db.length} (Male: ${maleCount}, Female: ${femaleCount})`;
  } else {
    statsSpan.textContent = `전체 인물: ${db.length}명 (남: ${maleCount}, 여: ${femaleCount})`;
  }
}

// ==========================================
// Admin Mode Logic & CRUD Handlers
// ==========================================

function setupAdminMode() {
  adminLockBtn.addEventListener('click', async () => {
    if (isAdminMode) {
      exitAdminMode();
      cachedAdminPassword = '';
    } else {
      if (currentUser && currentUser.status === 'admin') {
        // If already authenticated via standard web login
        cachedAdminPassword = 'admin'; 
        enterAdminMode();
      } else {
        const pw = prompt(UI_TEXTS[currentLang].admin_mode_prompt, "");
        if (pw === null) return;
        
        try {
          const apiBase = window.API_BASE_URL || "";
          const res = await fetch(apiBase + '/api/admin/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw })
          });
          if (res.ok) {
            cachedAdminPassword = pw;
            enterAdminMode();
          } else {
            const data = await res.json();
            alert(data.error || UI_TEXTS[currentLang].admin_mode_wrong);
          }
        } catch (e) {
          alert("서버 연결 실패. 네트워크 상태를 확인하세요.");
        }
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
    if (isAddAnnotationModeActive) {
      deactivateAddAnnotationMode();
    } else {
      activateAddAnnotationMode();
    }
  });

  if (adminAddEventBtn) {
    adminAddEventBtn.addEventListener('click', () => {
      let containerCenterX = viewerContainer.clientWidth / 2;
      let containerCenterY = viewerContainer.clientHeight / 2;
      if (containerCenterX === 0) {
        containerCenterX = window.innerWidth / 2;
        containerCenterY = (window.innerHeight - 80) / 2;
      }
      const worldX = (containerCenterX - panX) / currentScale;
      const worldY = (containerCenterY - panY) / currentScale;
      newLayerItemCoords = { x: Math.round(worldX), y: Math.round(worldY) };
      
      openLayerItemAddForm('event');
    });
  }

  if (adminAddLocationBtn) {
    adminAddLocationBtn.addEventListener('click', () => {
      let containerCenterX = viewerContainer.clientWidth / 2;
      let containerCenterY = viewerContainer.clientHeight / 2;
      if (containerCenterX === 0) {
        containerCenterX = window.innerWidth / 2;
        containerCenterY = (window.innerHeight - 80) / 2;
      }
      const worldX = (containerCenterX - panX) / currentScale;
      const worldY = (containerCenterY - panY) / currentScale;
      newLayerItemCoords = { x: Math.round(worldX), y: Math.round(worldY) };
      
      openLayerItemAddForm('location');
    });
  }

  if (adminAddLinkBtn) {
    adminAddLinkBtn.addEventListener('click', () => {
      if (isAddLinkModeActive) {
        deactivateAddLinkMode();
      } else {
        activateAddLinkMode();
      }
    });
  }

  const adminAddPolygonBtn = document.getElementById('admin-add-polygon-btn');
  if (adminAddPolygonBtn) {
    adminAddPolygonBtn.addEventListener('click', () => {
      if (isAddPolygonModeActive) {
        deactivateAddPolygonMode();
      } else {
        activateAddPolygonMode();
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
      saveCustomPolygons();
      autoSaveToServer();
      showToast("💾 모든 편집 내용이 브라우저 및 서버에 안전하게 영구 저장되었습니다!");
    });
  }

  const adminUndoBtn = document.getElementById('admin-undo-btn');
  const adminRedoBtn = document.getElementById('admin-redo-btn');
  if (adminUndoBtn) {
    adminUndoBtn.addEventListener('click', performUndo);
  }
  if (adminRedoBtn) {
    adminRedoBtn.addEventListener('click', performRedo);
  }

  adminExportBtn.addEventListener('click', exportDatabaseJSON);
  
  if (adminSyncBtn) {
    adminSyncBtn.addEventListener('click', syncToServer);
  }

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
      localStorage.removeItem('bible_tree_custom_polygons');
      localStorage.removeItem('bible_tree_custom_polygons_initialized');
      localStorage.removeItem('bible_tree_last_center_x');
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
  const formEngEl = document.getElementById('form-eng');
  const formIdEl = document.getElementById('form-id');
  const prophetCheckbox = document.getElementById('form-prophet');

  function updateAutoGeneratedId() {
    if (!formIdEl || formIdEl.disabled) return;
    
    const isProphetChecked = prophetCheckbox ? prophetCheckbox.checked : false;
    let baseText = "";
    
    if (formEngEl && formEngEl.value.trim()) {
      baseText = formEngEl.value.trim();
    } else if (formNameEl && formNameEl.value.trim()) {
      const typedName = formNameEl.value.trim();
      if (BIBLE_NAMES_DICTIONARY[typedName]) {
        baseText = BIBLE_NAMES_DICTIONARY[typedName];
      } else {
        baseText = typedName;
      }
    }
    
    // Clean string for ID format
    let clean = baseText.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-]/g, '');
      
    if (!clean) {
      clean = isProphetChecked ? "prophet" : "person";
    } else if (isProphetChecked && !clean.startsWith("prophet_") && clean !== "prophet") {
      clean = "prophet_" + clean;
    }
    
    // Make sure it's unique
    let candidate = clean;
    let counter = 1;
    while (db.some(c => c.id === candidate)) {
      candidate = `${clean}_${counter}`;
      counter++;
    }
    formIdEl.value = candidate;
  }

  if (formNameEl) {
    formNameEl.addEventListener('input', (e) => {
      const typedVal = e.target.value.trim();
      if (BIBLE_NAMES_DICTIONARY[typedVal]) {
        const engName = BIBLE_NAMES_DICTIONARY[typedVal];
        if (formEngEl) {
          formEngEl.value = engName;
        }
      }
      // Update ID if it is empty or has a placeholder prefix
      if (formIdEl && !formIdEl.disabled) {
        const val = formIdEl.value.trim();
        if (!val || val.startsWith("person") || val.startsWith("prophet")) {
          updateAutoGeneratedId();
        }
      }
    });
  }

  if (formEngEl) {
    formEngEl.addEventListener('input', () => {
      if (formIdEl && !formIdEl.disabled) {
        const val = formIdEl.value.trim();
        if (!val || val.startsWith("person") || val.startsWith("prophet") || val.includes("_custom_") || val.includes("custom")) {
          updateAutoGeneratedId();
        }
      }
    });
  }

  if (prophetCheckbox) {
    prophetCheckbox.addEventListener('change', () => {
      if (formIdEl && !formIdEl.disabled) {
        let currentId = formIdEl.value.trim();
        if (prophetCheckbox.checked) {
          if (currentId && !currentId.startsWith('prophet_')) {
            formIdEl.value = 'prophet_' + currentId;
          } else if (!currentId || currentId === 'person' || currentId.startsWith('person_')) {
            updateAutoGeneratedId();
          }
        } else {
          if (currentId && currentId.startsWith('prophet_')) {
            formIdEl.value = currentId.replace('prophet_', '');
          } else if (currentId === 'prophet') {
            updateAutoGeneratedId();
          }
        }
      }
    });
  }

  // Layout Alignment Tools & Dropdown
  const alignDropdownToggle = document.getElementById('admin-align-dropdown-toggle');
  const alignDropdownMenu = document.getElementById('admin-align-dropdown-menu');
  if (alignDropdownToggle && alignDropdownMenu) {
    alignDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = alignDropdownMenu.style.display === 'flex';
      alignDropdownMenu.style.display = isVisible ? 'none' : 'flex';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!alignDropdownToggle.contains(e.target) && !alignDropdownMenu.contains(e.target)) {
        alignDropdownMenu.style.display = 'none';
      }
    });
  }

  const alignHeightBtn = document.getElementById('admin-align-height-btn');
  if (alignHeightBtn) {
    alignHeightBtn.addEventListener('click', () => {
      alignSelectedHeights();
      if (alignDropdownMenu) alignDropdownMenu.style.display = 'none';
    });
  }
  const alignColumnBtn = document.getElementById('admin-align-column-btn');
  if (alignColumnBtn) {
    alignColumnBtn.addEventListener('click', () => {
      alignSelectedColumns();
      if (alignDropdownMenu) alignDropdownMenu.style.display = 'none';
    });
  }
  const distributeWidthBtn = document.getElementById('admin-distribute-width-btn');
  if (distributeWidthBtn) {
    distributeWidthBtn.addEventListener('click', () => {
      distributeSelectedWidths();
      if (alignDropdownMenu) alignDropdownMenu.style.display = 'none';
    });
  }
  const distributeHeightBtn = document.getElementById('admin-distribute-height-btn');
  if (distributeHeightBtn) {
    distributeHeightBtn.addEventListener('click', () => {
      distributeSelectedHeights();
      if (alignDropdownMenu) alignDropdownMenu.style.display = 'none';
    });
  }

  setupAutocomplete();
}

function alignSelectedHeights() {
  if (selectedPersonIds.size < 2) {
    showToast("📐 가로를 맞출 카드를 2개 이상 선택해 주세요. (Shift 키를 누른 채 클릭)");
    return;
  }
  
  pushHistoryState();
  
  const firstId = Array.from(selectedPersonIds)[0];
  const firstChar = db.find(c => c.id === firstId);
  if (!firstChar) return;
  
  const targetGen = firstChar.generation;
  
  selectedPersonIds.forEach(id => {
    const char = db.find(c => c.id === id);
    if (char) {
      char.generation = targetGen;
      char.isManual = true;
    }
  });
  
  saveDatabase();
  initBoard();
  renderTree();
  showToast("📐 선택한 카드들의 가로선이 동일하게 맞추어졌습니다.");
}

function alignSelectedColumns() {
  if (selectedPersonIds.size < 2) {
    showToast("📏 세로 줄을 맞출 카드를 2개 이상 선택해 주세요. (Shift 키를 누른 채 클릭)");
    return;
  }
  
  pushHistoryState();
  
  const firstId = Array.from(selectedPersonIds)[0];
  const firstChar = db.find(c => c.id === firstId);
  if (!firstChar) return;
  
  const targetCol = firstChar.column;
  
  selectedPersonIds.forEach(id => {
    const char = db.find(c => c.id === id);
    if (char) {
      char.column = targetCol;
      char.isManual = true;
    }
  });
  
  saveDatabase();
  initBoard();
  renderTree();
  showToast("📏 선택한 카드들의 세로 줄이 동일하게 맞추어졌습니다.");
}

function distributeSelectedWidths() {
  if (selectedPersonIds.size < 2) {
    showToast("↔️ 간격을 맞출 카드를 2개 이상 선택해 주세요.");
    return;
  }
  
  pushHistoryState();
  
  const sortedChars = Array.from(selectedPersonIds)
    .map(id => db.find(c => c.id === id))
    .filter(Boolean)
    .sort((a, b) => a.column - b.column);
    
  if (sortedChars.length >= 3) {
    const leftCol = sortedChars[0].column;
    const rightCol = sortedChars[sortedChars.length - 1].column;
    const span = rightCol - leftCol;
    const gap = span / (sortedChars.length - 1);
    
    sortedChars.forEach((char, idx) => {
      char.column = parseFloat((leftCol + idx * gap).toFixed(3));
      char.isManual = true;
    });
    showToast("↔️ 선택한 카드들 간의 간격이 균등하게 분배되었습니다.");
  } else if (sortedChars.length === 2) {
    // Set a standard 2.0 column gap
    const leftCol = sortedChars[0].column;
    sortedChars[1].column = parseFloat((leftCol + 2.0).toFixed(3));
    sortedChars[1].isManual = true;
    showToast("↔️ 두 카드 간의 간격을 기본 크기(2열)로 정렬했습니다.");
  }
  
  saveDatabase();
  initBoard();
  renderTree();
}

function distributeSelectedHeights() {
  if (selectedPersonIds.size < 2) {
    showToast("↕️ 세로 간격을 맞출 카드를 2개 이상 선택해 주세요. (Shift 키를 누른 채 클릭)");
    return;
  }
  
  pushHistoryState();
  
  const sortedChars = Array.from(selectedPersonIds)
    .map(id => db.find(c => c.id === id))
    .filter(Boolean)
    .sort((a, b) => a.generation - b.generation);
    
  if (sortedChars.length >= 3) {
    const topGen = sortedChars[0].generation;
    const bottomGen = sortedChars[sortedChars.length - 1].generation;
    const span = bottomGen - topGen;
    const gap = span / (sortedChars.length - 1);
    
    sortedChars.forEach((char, idx) => {
      char.generation = parseFloat((topGen + idx * gap).toFixed(3));
      char.isManual = true;
    });
    showToast("↕️ 선택한 카드들 간의 세로 간격이 균등하게 분배되었습니다.");
  } else if (sortedChars.length === 2) {
    // Set a standard 1.0 generation gap
    const topGen = sortedChars[0].generation;
    sortedChars[1].generation = parseFloat((topGen + 1.0).toFixed(3));
    sortedChars[1].isManual = true;
    showToast("↕️ 두 카드 간의 세로 간격을 기본 크기(1세대)로 정렬했습니다.");
  }
  
  saveDatabase();
  initBoard();
  renderTree();
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
  
  const teachersInput = document.getElementById('form-teachers');
  const teachersSug = document.getElementById('teachers-suggestions');
  if (teachersInput && teachersSug) handleInput(teachersInput, teachersSug);

  const prophetsInput = document.getElementById('form-prophets');
  const prophetsSug = document.getElementById('prophets-suggestions');
  if (prophetsInput && prophetsSug) handleInput(prophetsInput, prophetsSug);

  // Layer Item Autocomplete
  const layerPeopleInput = document.getElementById('layer-item-people');
  const layerPeopleSug = document.getElementById('layer-item-people-suggestions');
  const layerEventsInput = document.getElementById('layer-item-events');
  const layerEventsSug = document.getElementById('layer-item-events-suggestions');
  const layerLocationsInput = document.getElementById('layer-item-locations');
  const layerLocationsSug = document.getElementById('layer-item-locations-suggestions');

  function handleLayerInput(inputEl, suggestionsEl, dataSource) {
    if (!inputEl || !suggestionsEl) return;
    inputEl.addEventListener('input', () => {
      const val = inputEl.value;
      const parts = val.split(',');
      const currentTerm = parts[parts.length - 1].trim().toLowerCase();
      
      if (currentTerm.length === 0) {
        suggestionsEl.style.display = 'none';
        return;
      }
      
      const matches = dataSource.filter(item => 
        item.id.toLowerCase().includes(currentTerm) || 
        item.name.toLowerCase().includes(currentTerm)
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

  if (layerPeopleInput && layerPeopleSug) handleLayerInput(layerPeopleInput, layerPeopleSug, db);
  if (layerEventsInput && layerEventsSug) handleLayerInput(layerEventsInput, layerEventsSug, events);
  if (layerLocationsInput && layerLocationsSug) handleLayerInput(layerLocationsInput, layerLocationsSug, locations);
}

function activateAddAnnotationMode() {
  deactivateAddPersonMode();
  deactivateAddLinkMode();
  deactivateAddPolygonMode();
  cancelPlacementMode();
  
  isAddAnnotationModeActive = true;
  adminAddNoteBtn.classList.add('active-tool');
  if (adminAddNoteBtn) {
    adminAddNoteBtn.innerHTML = '❌ 추가 취소';
    adminAddNoteBtn.classList.add('danger');
  }
  viewerContainer.style.cursor = 'crosshair';
  
  // Create a ghost outline following the cursor
  const ghost = document.createElement('div');
  ghost.id = 'note-ghost-preview';
  ghost.style.position = 'fixed';
  ghost.style.width = '200px';
  ghost.style.height = '60px';
  ghost.style.border = '2px dashed var(--text-accent)';
  ghost.style.borderRadius = '8px';
  ghost.style.background = 'rgba(168, 85, 247, 0.1)';
  ghost.style.pointerEvents = 'none';
  ghost.style.transform = 'translate(-50%, -50%)';
  ghost.style.zIndex = '9999';
  document.body.appendChild(ghost);
  
  const onMouseMove = (e) => {
    if (!isAddAnnotationModeActive) {
      document.removeEventListener('mousemove', onMouseMove);
      return;
    }
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
  };
  document.addEventListener('mousemove', onMouseMove);
  
  showToast("📝 보드 위의 원하는 위치를 클릭(터치)하면 텍스트 상자가 즉시 생성됩니다.");
}

function deactivateAddAnnotationMode() {
  isAddAnnotationModeActive = false;
  adminAddNoteBtn.classList.remove('active-tool');
  if (adminAddNoteBtn) {
    adminAddNoteBtn.innerHTML = '📝 텍스트 상자 추가';
    adminAddNoteBtn.classList.remove('danger');
  }
  viewerContainer.style.cursor = 'grab';
  
  const ghost = document.getElementById('note-ghost-preview');
  if (ghost) ghost.remove();
}

function activateAddPersonMode() {
  deactivateAddAnnotationMode();
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
  deactivateAddAnnotationMode();
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

function deactivateAddPolygonMode() {
  isAddPolygonModeActive = false;
  tempPolygonPoints = [];
  removeTempPolygonPreview();
  const btn = document.getElementById('admin-add-polygon-btn');
  if (btn) {
    btn.style.background = '#ea580c';
    btn.style.borderColor = '#ea580c';
    btn.innerHTML = '⬡ 영역(다각형) 추가';
  }
}

function activateAddPolygonMode() {
  deactivateAddAnnotationMode();
  if (isAddLinkModeActive) deactivateAddLinkMode();
  if (isAddPersonModeActive) deactivateAddPersonMode();
  
  selectedPolygonId = null;
  selectedLineKey = null;
  selectedJunctionId = null;
  
  isAddPolygonModeActive = true;
  tempPolygonPoints = [];
  const btn = document.getElementById('admin-add-polygon-btn');
  if (btn) {
    btn.style.background = '#9a3412';
    btn.style.borderColor = '#9a3412';
    btn.innerHTML = '● 추가 모드 종료 (ESC)';
  }
  showToast("⬡ 다각형 영역 추가 모드가 활성화되었습니다. 화면을 클릭하여 다각형 꼭짓점을 만드세요.");
  renderTree();
  updateTransform();
}

function completePolygonCreation() {
  if (tempPolygonPoints.length < 3) {
    showToast("⚠️ 다각형 영역을 구성하려면 최소 3개 이상의 점이 필요합니다.");
    return;
  }
  
  const name = prompt("새로운 다각형 영역의 이름을 입력하세요:", "새 영역");
  if (!name) return;
  
  pushHistoryState();
  const polyId = `poly-custom-${Date.now()}`;
  const randomColors = ['#f97316', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#eab308', '#06b6d4'];
  const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
  
  customPolygons.push({
    id: polyId,
    label: name,
    color: randomColor,
    fillOpacity: 0.03,
    points: [...tempPolygonPoints]
  });
  
  saveCustomPolygons();
  deactivateAddPolygonMode();
  
  selectedPolygonId = polyId;
  renderTree();
  updateTransform();
  openStyleEditorPanel();
  setTimeout(() => {
    document.getElementById('area-editor-section')?.scrollIntoView({ behavior: 'smooth' });
  }, 300);
  showToast(`"${name}" 영역이 추가되었습니다.`);
}

function updateTempPolygonPreview(mousePt = null) {
  const svgNS = "http://www.w3.org/2000/svg";
  let preview = document.getElementById('temp-polygon-preview');
  if (!preview) {
    preview = document.createElementNS(svgNS, 'polyline');
    preview.id = 'temp-polygon-preview';
    preview.setAttribute('stroke', '#ea580c');
    preview.setAttribute('stroke-width', '2');
    preview.setAttribute('stroke-dasharray', '5 5');
    preview.setAttribute('fill', '#ea580c');
    preview.setAttribute('fill-opacity', '0.1');
    svgLayer.appendChild(preview);
  }
  
  const pts = [...tempPolygonPoints];
  if (mousePt) {
    pts.push(mousePt);
  }
  
  if (pts.length > 0) {
    // Connect back to the first point for visual closure preview if we have at least 2 points
    if (pts.length >= 3 && mousePt) {
      preview.setAttribute('points', pts.map(pt => `${pt.x},${pt.y}`).join(' ') + ` ${pts[0].x},${pts[0].y}`);
    } else {
      preview.setAttribute('points', pts.map(pt => `${pt.x},${pt.y}`).join(' '));
    }
  } else {
    preview.removeAttribute('points');
  }
}

function removeTempPolygonPreview() {
  const preview = document.getElementById('temp-polygon-preview');
  if (preview) preview.remove();
}


function enterAdminMode() {
  isAdminMode = true;
  adminLockBtn.textContent = '🔓';
  adminLockBtn.title = UI_TEXTS[currentLang].admin_lock_title;
  adminActionsBar.style.display = 'flex';
  styleEditorToggle.style.display = 'flex';
  
  const lineSec = document.getElementById('line-editor-section');
  if (lineSec) lineSec.style.display = 'block';
  
  const toggleBtn = document.getElementById('spawner-panel-toggle-btn');
  if (toggleBtn) {
    toggleBtn.style.display = 'flex';
  }
  const spawnerPanel = document.getElementById('bottom-spawner-panel');
  if (spawnerPanel) {
    spawnerPanel.style.display = 'none';
  }
  
  treeBoard.classList.add('admin-mode-active');
  closeStudyPanel();
  closeStyleEditorPanel();
  renderTree();
  updateHistoryButtonsState();
}

function exitAdminMode() {
  isAdminMode = false;
  adminLockBtn.textContent = '🔒';
  adminLockBtn.title = UI_TEXTS[currentLang].admin_lock_title;
  adminActionsBar.style.display = 'none';
  styleEditorToggle.style.display = 'none';
  
  const lineSec = document.getElementById('line-editor-section');
  if (lineSec) lineSec.style.display = 'none';
  selectedLineKey = null;
  selectedPolygonId = null;
  
  const spawnerPanel = document.getElementById('bottom-spawner-panel');
  if (spawnerPanel) spawnerPanel.style.display = 'none';
  const toggleBtn = document.getElementById('spawner-panel-toggle-btn');
  if (toggleBtn) toggleBtn.style.display = 'none';
  cancelPlacementMode();
  
  deactivateAddPersonMode();
  deactivateAddLinkMode();
  deactivateAddPolygonMode();
  deactivateAddAnnotationMode();
  
  treeBoard.classList.remove('admin-mode-active');
  closeStyleEditorPanel();
  renderTree();
  updateHistoryButtonsState();
}

let tempRelatedPeople = [];

function renderRelatedPeopleList(searchTerm = "") {
  const container = document.getElementById('form-related-list');
  if (!container) return;
  container.innerHTML = '';
  
  const query = searchTerm.trim().toLowerCase();
  
  let candidates = [];
  if (query.length > 0) {
    candidates = db.filter(c => 
      c.id.toLowerCase().includes(query) || 
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.engName && c.engName.toLowerCase().includes(query))
    );
    candidates = candidates.slice(0, 15);
  } else {
    tempRelatedPeople.forEach(rId => {
      const match = db.find(c => c.id === rId);
      if (match) {
        candidates.push(match);
      } else {
        candidates.push({ id: rId, name: rId });
      }
    });
  }
  
  if (candidates.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.fontSize = '12px';
    emptyMsg.style.color = 'var(--text-muted)';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '8px';
    emptyMsg.textContent = query.length > 0 ? "검색 결과가 없습니다." : "선택된 관련 인물이 없습니다.";
    container.appendChild(emptyMsg);
    return;
  }
  
  candidates.forEach(match => {
    const item = document.createElement('label');
    item.className = 'related-person-checkbox-item';
    
    const isChecked = tempRelatedPeople.includes(match.id);
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isChecked;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!tempRelatedPeople.includes(match.id)) {
          tempRelatedPeople.push(match.id);
        }
      } else {
        tempRelatedPeople = tempRelatedPeople.filter(id => id !== match.id);
      }
      if (query.length === 0) {
        renderRelatedPeopleList("");
      }
    });
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = match.name;
    
    const idSpan = document.createElement('span');
    idSpan.className = 'person-id-label';
    idSpan.textContent = match.id;
    
    item.appendChild(checkbox);
    item.appendChild(nameSpan);
    item.appendChild(idSpan);
    
    container.appendChild(item);
  });
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
  
  const searchInput = document.getElementById('form-related-search');
  if (searchInput) {
    searchInput.value = '';
    searchInput.oninput = (e) => {
      renderRelatedPeopleList(e.target.value);
    };
  }
  
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
      const teachersInput = document.getElementById('form-teachers');
      if (teachersInput) teachersInput.value = char.teachers ? char.teachers.join(', ') : '';
      const prophetsInput = document.getElementById('form-prophets');
      if (prophetsInput) prophetsInput.value = char.prophets ? char.prophets.join(', ') : '';
      const descInput = document.getElementById('form-desc');
      if (descInput) descInput.value = char.desc || '';
      const engDescInput = document.getElementById('form-eng-desc');
      if (engDescInput) engDescInput.value = char.engDesc || '';
      const mainCheckbox = document.getElementById('form-main');
      if (mainCheckbox) mainCheckbox.checked = !!char.isMain;
      const prophetCheckbox = document.getElementById('form-prophet');
      if (prophetCheckbox) prophetCheckbox.checked = isProphet(char.id);
      
      tempRelatedPeople = char.relatedPeople && Array.isArray(char.relatedPeople) ? [...char.relatedPeople] : [];
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
    const teachersInput = document.getElementById('form-teachers');
    if (teachersInput) teachersInput.value = '';
    const prophetsInput = document.getElementById('form-prophets');
    if (prophetsInput) prophetsInput.value = '';
    const descInput = document.getElementById('form-desc');
    if (descInput) descInput.value = '';
    const engDescInput = document.getElementById('form-eng-desc');
    if (engDescInput) engDescInput.value = '';
    
    tempRelatedPeople = [];
  }
  
  renderRelatedPeopleList("");
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
  const generation = parseFloat(parseFloat(document.getElementById('form-gen').value).toFixed(2));
  const rawColumn = parseFloat(document.getElementById('form-col').value);
  const parentsInput = document.getElementById('form-parents').value.trim();
  const spousesInput = document.getElementById('form-spouses').value.trim();
  const desc = document.getElementById('form-desc').value.trim();
  const engDesc = document.getElementById('form-eng-desc').value.trim();
  const isMain = document.getElementById('form-main').checked;
  const isProphetVal = document.getElementById('form-prophet').checked;
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
      if (confirm(`부모 ID '${pId}'가 존재하지 않습니다. 이 ID로 새 인물을 생성하시겠습니까?`)) {
        db.push({
          id: pId,
          name: pId,
          engName: '',
          gender: 'M',
          generation: Math.max(0, generation - 1),
          column: column,
          parents: [],
          spouses: [],
          desc: "자동 생성된 부모",
          isMain: false,
          isManual: true
        });
      } else {
        return;
      }
    }
  }
  if (parents.length > 2) {
    alert("부모는 최대 2명(아버지와 어머니)까지만 등록할 수 있습니다.");
    return;
  }
  
  for (let sId of spouses) {
    if (!db.some(c => c.id === sId)) {
      if (confirm(`배우자 ID '${sId}'가 존재하지 않습니다. 이 ID로 새 인물을 생성하시겠습니까?`)) {
        db.push({
          id: sId,
          name: sId,
          engName: '',
          gender: gender === 'M' ? 'F' : 'M',
          generation: generation,
          column: column + 1.5,
          parents: [],
          spouses: [],
          desc: "자동 생성된 배우자",
          isMain: false,
          isManual: true
        });
      } else {
        return;
      }
    }
  }
  
  const teachersInput = document.getElementById('form-teachers').value.trim();
  const teachers = teachersInput ? teachersInput.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  
  for (let tId of teachers) {
    if (!db.some(c => c.id === tId)) {
      if (confirm(`전도자 ID '${tId}'가 존재하지 않습니다. 이 ID로 새 인물을 생성하시겠습니까?`)) {
        db.push({
          id: tId,
          name: tId,
          engName: '',
          gender: 'M',
          generation: Math.max(0, generation - 1),
          column: column - 1.5,
          parents: [],
          spouses: [],
          desc: "자동 생성된 전도자/스승",
          isMain: false,
          isManual: true
        });
      } else {
        return;
      }
    }
  }

  const prophetsInput = document.getElementById('form-prophets').value.trim();
  const prophets = prophetsInput ? prophetsInput.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  
  for (let pId of prophets) {
    if (!db.some(c => c.id === pId)) {
      if (confirm(`선지자 ID '${pId}'가 존재하지 않습니다. 이 ID로 새 인물을 생성하시겠습니까?`)) {
        db.push({
          id: pId,
          name: pId,
          engName: '',
          gender: 'M',
          generation: Math.max(0, generation - 1),
          column: column - 1.5,
          parents: [],
          spouses: [],
          desc: "자동 생성된 선지자",
          isMain: false,
          isProphet: true,
          isManual: true
        });
      } else {
        return;
      }
    }
  }

  pushHistoryState();
  if (editingPersonId) {
    const index = db.findIndex(c => c.id === editingPersonId);
    if (index !== -1) {
      const oldSpouses = db[index].spouses || [];
      const oldRelated = db[index].relatedPeople || [];
      
      db[index] = {
        id: editingPersonId,
        name,
        engName,
        gender,
        generation,
        column,
        parents,
        spouses,
        teachers,
        prophets,
        relatedPeople: tempRelatedPeople,
        desc,
        engDesc,
        isMain,
        isProphet: isProphetVal,
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
      
      oldRelated.forEach(oldId => {
        if (!tempRelatedPeople.includes(oldId)) {
          const rNode = db.find(c => c.id === oldId);
          if (rNode && rNode.relatedPeople) {
            rNode.relatedPeople = rNode.relatedPeople.filter(id => id !== editingPersonId);
          }
        }
      });
      
      tempRelatedPeople.forEach(newId => {
        const rNode = db.find(c => c.id === newId);
        if (rNode) {
          if (!rNode.relatedPeople) rNode.relatedPeople = [];
          if (!rNode.relatedPeople.includes(editingPersonId)) {
            rNode.relatedPeople.push(editingPersonId);
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
      teachers,
      prophets,
      relatedPeople: tempRelatedPeople,
      desc,
      engDesc,
      isMain,
      isProphet: isProphetVal,
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
    
    tempRelatedPeople.forEach(newId => {
      const rNode = db.find(c => c.id === newId);
      if (rNode) {
        if (!rNode.relatedPeople) rNode.relatedPeople = [];
        if (!rNode.relatedPeople.includes(id)) {
          rNode.relatedPeople.push(id);
        }
      }
    });
  }
  
  saveDatabase();
  applyFilters();
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
    if (char.relatedPeople) {
      char.relatedPeople = char.relatedPeople.filter(id => id !== personId);
    }
  });
  
  localStorage.removeItem(`bible_tree_note_${personId}`);
  localStorage.removeItem(`bible_tree_resources_${personId}`);
  if (userNotes && userNotes[personId]) {
    delete userNotes[personId];
    saveUserNotes();
  }
  
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
  applyFilters();
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
    lineZIndices: lineZIndices,
    customVisualLines: customVisualLines,
    canvasJunctions: canvasJunctions,
    spouseSplits: spouseSplits,
    annotations: annotations,
    styleSettings: styleSettings,
    customPolygons: customPolygons
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

async function syncToServer() {
  const adminPw = prompt("서버에 배포하기 위한 관리자 비밀번호를 입력하세요:", "");
  if (!adminPw) return;

  const btn = document.getElementById('admin-sync-btn');
  const originalText = btn.innerText;
  btn.innerText = "배포 중... ⏳";
  btn.disabled = true;

  const exportData = {
    version: "15.0",
    db: db,
    lineBends: lineBends,
    lineZIndices: lineZIndices,
    customVisualLines: customVisualLines,
    canvasJunctions: canvasJunctions,
    spouseSplits: spouseSplits,
    annotations: annotations,
    styleSettings: styleSettings,
    customPolygons: customPolygons,
    events: events,
    locations: locations
  };

  try {
    const response = await fetch(getApiUrl('/api/save'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({
        password: adminPw,
        payload: exportData
      })
    });

    const result = await response.json();
    if (result.success) {
      alert("성공적으로 서버에 배포되었습니다! 이제 다른 사용자들도 새로고침 시 변경사항을 볼 수 있습니다.");
    } else {
      alert("배포 실패: " + (result.error || "알 수 없는 오류"));
    }
  } catch (err) {
    console.error(err);
    alert("서버 연결 실패. 네트워크 상태를 확인하거나 백엔드 서버가 켜져 있는지 확인하세요.");
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

async function autoSaveToServer() {
  if (!isAdminMode || !cachedAdminPassword) return;

  const exportData = {
    version: "15.0",
    db: db,
    lineBends: lineBends,
    lineZIndices: lineZIndices,
    customVisualLines: customVisualLines,
    canvasJunctions: canvasJunctions,
    spouseSplits: spouseSplits,
    annotations: annotations,
    styleSettings: styleSettings,
    customPolygons: customPolygons,
    events: events,
    locations: locations
  };

  try {
    const response = await fetch(getApiUrl('/api/save'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({
        password: cachedAdminPassword,
        payload: exportData
      })
    });

    const result = await response.json();
    if (result.success) {
      showToast("자동 저장 완료 ✓");
    } else {
      console.error("Auto-save failed:", result.error);
      showToast("⚠️ 자동 저장 실패");
    }
  } catch (err) {
    console.error("Auto-save connection error:", err);
    showToast("⚠️ 자동 저장 서버 연결 실패");
  }
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
      let importedLineZIndices = null;
      let importedAnnotations = null;
      let importedStyleSettings = null;
      let importedCustomPolygons = null;
      
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        // Unified format
        if (!parsed.db || !Array.isArray(parsed.db)) {
          throw new Error("올바른 통합 데이터 형식이 아닙니다. db 필드가 누락되었거나 배열이 아닙니다.");
        }
        importedDb = parsed.db;
        importedLineBends = parsed.lineBends || {};
        importedLineZIndices = parsed.lineZIndices || {};
        importedCustomVisualLines = parsed.customVisualLines || [];
        importedCanvasJunctions = parsed.canvasJunctions || [];
        importedSpouseSplits = parsed.spouseSplits || {};
        importedAnnotations = parsed.annotations || [];
        importedStyleSettings = parsed.styleSettings || null;
        importedCustomPolygons = parsed.customPolygons || [];
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
      stableBoardWidth = null;
      stableBoardHeight = null;
      stableCenterX = null;
      localStorage.removeItem('bible_tree_last_center_x');
      db = importedDb;
      if (importedLineBends !== null) lineBends = importedLineBends;
      if (importedLineZIndices !== null) lineZIndices = importedLineZIndices;
      if (importedCustomVisualLines !== null) customVisualLines = importedCustomVisualLines;
      if (importedCanvasJunctions !== null) canvasJunctions = importedCanvasJunctions;
      if (importedSpouseSplits !== null) spouseSplits = importedSpouseSplits;
      if (importedAnnotations !== null) annotations = importedAnnotations;
      if (importedStyleSettings !== null) styleSettings = { ...styleSettings, ...importedStyleSettings };
      if (importedCustomPolygons !== null) {
        customPolygons = importedCustomPolygons;
        localStorage.setItem('bible_tree_custom_polygons_initialized', 'true');
      }
      
      // 2. Save everything to localStorage
      saveDatabase();
      saveLineBends();
      if (importedLineZIndices !== null) saveLineZIndices();
      saveCustomVisualLines();
      saveCanvasJunctions();
      saveSpouseSplits();
      saveAnnotations();
      if (importedStyleSettings !== null) saveStyleSettings();
      if (importedCustomPolygons !== null) saveCustomPolygons();
      
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
  // Real-time Style Controls Binding
  inputLineColor.addEventListener('input', (e) => {
    styleSettings.lineColor = e.target.value;
    document.documentElement.style.setProperty('--line-color', styleSettings.lineColor);
    saveStyleSettings();
  });
  inputLineColor.addEventListener('change', () => {
    autoSaveToServer();
  });
  
  inputMainLineColor.addEventListener('input', (e) => {
    styleSettings.mainLineColor = e.target.value;
    document.documentElement.style.setProperty('--line-main-color', styleSettings.mainLineColor);
    saveStyleSettings();
  });
  inputMainLineColor.addEventListener('change', () => {
    autoSaveToServer();
  });
  
  inputSpouseLineColor.addEventListener('input', (e) => {
    styleSettings.spouseLineColor = e.target.value;
    document.documentElement.style.setProperty('--spouse-line-color', styleSettings.spouseLineColor);
    saveStyleSettings();
  });
  inputSpouseLineColor.addEventListener('change', () => {
    autoSaveToServer();
  });

  if (inputPreacherLineColor) {
    inputPreacherLineColor.addEventListener('input', (e) => {
      styleSettings.preacherLineColor = e.target.value;
      document.documentElement.style.setProperty('--preacher-line-color', styleSettings.preacherLineColor);
      saveStyleSettings();
    });
    inputPreacherLineColor.addEventListener('change', () => {
      autoSaveToServer();
    });
  }
  
  inputLineWidth.addEventListener('input', (e) => {
    styleSettings.lineWidth = parseInt(e.target.value);
    document.documentElement.style.setProperty('--line-width', `${styleSettings.lineWidth}px`);
    labelLineWidth.textContent = `${styleSettings.lineWidth}px`;
    saveStyleSettings();
  });
  inputLineWidth.addEventListener('change', () => {
    autoSaveToServer();
  });
  
  inputCornerRadius.addEventListener('input', (e) => {
    styleSettings.cornerRadius = parseInt(e.target.value);
    labelCornerRadius.textContent = `${styleSettings.cornerRadius}px`;
    saveStyleSettings();
    
    // Curved coordinates require redrawing elements (lines paths string recalculations)
    renderTree();
  });
  inputCornerRadius.addEventListener('change', () => {
    autoSaveToServer();
  });
  
  inputSplitOffset.addEventListener('input', (e) => {
    styleSettings.splitOffset = parseInt(e.target.value);
    labelSplitOffset.textContent = `${styleSettings.splitOffset}px`;
    saveStyleSettings();
    
    // Vertical shift of split height requires line paths recalculations
    renderTree();
  });
  inputSplitOffset.addEventListener('change', () => {
    autoSaveToServer();
  });

  inputLineType.addEventListener('change', (e) => {
    styleSettings.lineType = e.target.value;
    saveStyleSettings();
    renderTree();
    autoSaveToServer();
  });
  
  if (inputSiblingGap) {
    inputSiblingGap.addEventListener('input', (e) => {
      styleSettings.siblingGap = parseInt(e.target.value);
      if (labelSiblingGap) labelSiblingGap.textContent = `${styleSettings.siblingGap}px`;
      saveStyleSettings();
      
      // Changing sibling gap changes the tree physical size and positions
      rebuildAllLayouts();
      saveDatabase();
      applyFilters();
    });
    inputSiblingGap.addEventListener('change', () => {
      autoSaveToServer();
    });
  }
  
  // Reset style values to defaults
  styleResetBtn.addEventListener('click', () => {
    if (confirm("연결선 디자인 설정을 기본값으로 되돌리시겠습니까?")) {
      styleSettings = {
        lineColor: '#94a3b8',
        mainLineColor: '#ff7800',
        spouseLineColor: '#ef4444',
        preacherLineColor: '#ff7800',
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
      applyFilters();
      autoSaveToServer();
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

  const bringFrontBtn = document.getElementById('style-line-bring-front-btn');
  if (bringFrontBtn) {
    bringFrontBtn.addEventListener('click', () => {
      if (!selectedLineKey) return;
      pushHistoryState();
      let maxZ = 0;
      Object.keys(lineZIndices).forEach(k => {
        if (lineZIndices[k] > maxZ) maxZ = lineZIndices[k];
      });
      lineZIndices[selectedLineKey] = maxZ + 1;
      saveLineZIndices();
      drawConnections();
      autoSaveToServer();
      showToast("선택한 선이 맨 앞으로 이동되었습니다.");
    });
  }

  const sendBackBtn = document.getElementById('style-line-send-back-btn');
  if (sendBackBtn) {
    sendBackBtn.addEventListener('click', () => {
      if (!selectedLineKey) return;
      pushHistoryState();
      let minZ = 0;
      Object.keys(lineZIndices).forEach(k => {
        if (lineZIndices[k] < minZ) minZ = lineZIndices[k];
      });
      lineZIndices[selectedLineKey] = minZ - 1;
      saveLineZIndices();
      drawConnections();
      autoSaveToServer();
      showToast("선택한 선이 맨 뒤로 이동되었습니다.");
    });
  }

  const areaNameInput = document.getElementById('style-area-name');
  if (areaNameInput) {
    areaNameInput.addEventListener('input', (e) => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly) {
          pushHistoryState();
          poly.label = e.target.value;
          saveCustomPolygons();
          const label = document.getElementById(`label-poly-${poly.id}`);
          if (label) label.textContent = poly.label;
        }
      }
    });
  }

  const areaColorInput = document.getElementById('style-area-color');
  if (areaColorInput) {
    areaColorInput.addEventListener('input', (e) => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly) {
          poly.color = e.target.value;
          const el = document.getElementById(`svg-poly-${poly.id}`);
          if (el) {
            el.setAttribute('fill', poly.color);
            el.setAttribute('stroke', poly.color);
          }
          const label = document.getElementById(`label-poly-${poly.id}`);
          if (label) {
            label.style.color = poly.color;
            label.style.borderColor = poly.color + '40';
          }
          treeBoard.querySelectorAll('.poly-vertex-handle').forEach(handle => {
            if (handle.dataset.polyId === poly.id) {
              handle.style.backgroundColor = poly.color;
            }
          });
        }
      }
    });
    areaColorInput.addEventListener('change', () => {
      pushHistoryState();
      saveCustomPolygons();
      renderTree();
      updateTransform();
    });
  }

  const areaOpacityInput = document.getElementById('style-area-opacity');
  if (areaOpacityInput) {
    areaOpacityInput.addEventListener('input', (e) => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly) {
          poly.fillOpacity = parseFloat(e.target.value);
          const opacityLabel = document.getElementById('label-area-opacity');
          if (opacityLabel) opacityLabel.textContent = poly.fillOpacity;
          const el = document.getElementById(`svg-poly-${poly.id}`);
          if (el) {
            el.setAttribute('fill-opacity', poly.fillOpacity);
          }
        }
      }
    });
    areaOpacityInput.addEventListener('change', () => {
      pushHistoryState();
      saveCustomPolygons();
    });
  }

  const areaBorderSelect = document.getElementById('style-area-border');
  if (areaBorderSelect) {
    areaBorderSelect.addEventListener('change', (e) => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly) {
          pushHistoryState();
          poly.borderStyle = e.target.value;
          saveCustomPolygons();
          renderTree();
          updateTransform();
        }
      }
    });
  }

  const areaStrokeWidthInput = document.getElementById('style-area-stroke-width');
  if (areaStrokeWidthInput) {
    areaStrokeWidthInput.addEventListener('input', (e) => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly) {
          poly.strokeWidth = parseInt(e.target.value);
          const strokeWidthLabel = document.getElementById('label-area-stroke-width');
          if (strokeWidthLabel) strokeWidthLabel.textContent = `${poly.strokeWidth}px`;
          
          const el = document.getElementById(`svg-poly-${poly.id}`);
          if (el) {
            el.setAttribute('stroke-width', poly.strokeWidth + 2);
          }
        }
      }
    });
    areaStrokeWidthInput.addEventListener('change', () => {
      pushHistoryState();
      saveCustomPolygons();
      renderTree();
      updateTransform();
    });
  }

  const resetAreaLabelBtn = document.getElementById('style-reset-area-label-btn');
  if (resetAreaLabelBtn) {
    resetAreaLabelBtn.addEventListener('click', () => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly) {
          pushHistoryState();
          poly.labelOffsetX = 0;
          poly.labelOffsetY = 0;
          saveCustomPolygons();
          renderTree();
          updateTransform();
          showToast("제목 위치가 초기화되었습니다.");
        }
      }
    });
  }

  const deleteAreaBtn = document.getElementById('style-delete-area-btn');
  if (deleteAreaBtn) {
    deleteAreaBtn.addEventListener('click', () => {
      if (selectedPolygonId) {
        const poly = customPolygons.find(p => p.id === selectedPolygonId);
        if (poly && confirm(`선택한 영역 "${poly.label}"을(를) 정말 삭제하시겠습니까?`)) {
          pushHistoryState();
          customPolygons = customPolygons.filter(p => p.id !== selectedPolygonId);
          selectedPolygonId = null;
          saveCustomPolygons();
          renderTree();
          updateTransform();
          showToast("영역이 삭제되었습니다.");
        }
      }
    });
  }
}

function updateAreaEditorPanel() {
  const section = document.getElementById('area-editor-section');
  if (!section) return;
  
  if (selectedPolygonId) {
    const poly = customPolygons.find(p => p.id === selectedPolygonId);
    if (poly) {
      section.style.display = 'block';
      const nameInput = document.getElementById('style-area-name');
      const colorInput = document.getElementById('style-area-color');
      const opacityInput = document.getElementById('style-area-opacity');
      const opacityLabel = document.getElementById('label-area-opacity');
      const strokeWidthInput = document.getElementById('style-area-stroke-width');
      const strokeWidthLabel = document.getElementById('label-area-stroke-width');
      const borderSelect = document.getElementById('style-area-border');
      
      if (nameInput) nameInput.value = poly.label || '';
      if (colorInput) colorInput.value = poly.color || '#f97316';
      
      const opacity = poly.fillOpacity !== undefined ? poly.fillOpacity : 0.03;
      if (opacityInput) opacityInput.value = opacity;
      if (opacityLabel) opacityLabel.textContent = opacity;
      
      const strokeWidth = poly.strokeWidth !== undefined ? poly.strokeWidth : 2;
      if (strokeWidthInput) strokeWidthInput.value = strokeWidth;
      if (strokeWidthLabel) strokeWidthLabel.textContent = `${strokeWidth}px`;
      
      if (borderSelect) borderSelect.value = poly.borderStyle || 'dashed';
      
      openStyleEditorPanel();
    } else {
      section.style.display = 'none';
    }
  } else {
    section.style.display = 'none';
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

function getApiUrl(path) {
  const baseUrl = window.API_BASE_URL || '';
  if (baseUrl) {
    return baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  }
  return path;
}

// ==========================================
// Authentication & User Notes Logic
// ==========================================

let currentUser = null;
let userToken = localStorage.getItem('bible_tree_token') || null;
let userNotes = {}; // { characterId: "text" }

const authModal = document.getElementById('auth-modal');
const authUsername = document.getElementById('auth-username');
const authPassword = document.getElementById('auth-password');
const authLoginBtn = document.getElementById('auth-login-btn');
const authRegisterBtn = document.getElementById('auth-register-btn');
const authMessage = document.getElementById('auth-message');

const adminDashboardModal = document.getElementById('admin-dashboard-modal');
const adminDashboardCloseBtn = document.getElementById('admin-dashboard-close-btn');
const adminUserList = document.getElementById('admin-user-list');

function hideAdminLockControls() {
  const divider = document.getElementById('admin-divider');
  const lockBtn = document.getElementById('admin-lock-btn');
  if (divider) divider.style.display = 'none';
  if (lockBtn) lockBtn.style.display = 'none';
}

function updateAdminLockVisibility() {
  const divider = document.getElementById('admin-divider');
  const lockBtn = document.getElementById('admin-lock-btn');
  if (currentUser && currentUser.status === 'admin') {
    if (divider) divider.style.display = 'block';
    if (lockBtn) lockBtn.style.display = 'flex';
  } else {
    hideAdminLockControls();
  }
}

async function validateSession() {
  if (!userToken) {
    hideAdminLockControls();
    return showAuthModal();
  }
  try {
    const res = await fetch(getApiUrl('/api/me'), { headers: { 'Authorization': 'Bearer ' + userToken } });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        userToken = null;
        localStorage.removeItem('bible_tree_token');
        hideAdminLockControls();
        showAuthModal();
      }
      return;
    }
    currentUser = await res.json();
    await fetchUserNotes();
    hideAuthModal();
    updateAdminLockVisibility();
    const landing = document.getElementById('landing-page');
    if (landing) landing.style.display = 'none';
  } catch (e) {
    console.warn("Connection to auth server failed, using local offline session:", e);
    try {
      const decoded = atob(userToken);
      const username = decoded.split(':')[0];
      currentUser = { username: username || 'offline_user', status: 'approved' };
    } catch (err) {
      currentUser = { username: 'offline_user', status: 'approved' };
    }
    hideAuthModal();
    updateAdminLockVisibility();
    const landing = document.getElementById('landing-page');
    if (landing) landing.style.display = 'none';
  }
}

function showAuthModal() {
  if (authModal) authModal.style.display = 'flex';
}
function hideAuthModal() {
  const isCapacitor = !!window.Capacitor || window.location.protocol.startsWith('capacitor');
  const isDesktop = window.location.protocol.startsWith('tauri') || 
                    window.location.protocol.startsWith('asset') || 
                    window.location.protocol.startsWith('file') || 
                    isCapacitor ||
                    (window.API_BASE_URL && window.API_BASE_URL.length > 0);
  const landing = document.getElementById('landing-page');
  const isLandingVisible = landing && landing.style.display !== 'none';
  if (!userToken && !isDesktop && !isLandingVisible) {
    alert('이 서비스는 회원 로그인 후 이용하실 수 있습니다.');
    return;
  }
  if (authModal) authModal.style.display = 'none';
}

async function handleLogin() {
  const username = authUsername.value.trim();
  const password = authPassword.value;
  if (!username || !password) return (authMessage.innerText = '아이디와 비밀번호를 입력하세요.');
  
  authMessage.innerText = '로그인 중...';
  try {
    const res = await fetch(getApiUrl('/api/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      authMessage.innerText = data.error || '로그인 실패';
      return;
    }
    userToken = data.token;
    localStorage.setItem('bible_tree_token', userToken);
    await validateSession();
  } catch (e) {
    authMessage.innerText = '서버 연결 실패';
  }
}

async function handleRegister() {
  const username = authUsername.value.trim();
  const password = authPassword.value;
  if (!username || !password) return (authMessage.innerText = '아이디와 비밀번호를 입력하세요.');
  
  authMessage.innerText = '가입 중...';
  try {
    const res = await fetch(getApiUrl('/api/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      authMessage.innerText = data.error || '가입 실패';
      return;
    }
    if (data.status === 'admin') {
      authMessage.innerText = '최고 관리자로 가입되었습니다! 로그인 중...';
      setTimeout(() => { handleLogin(); }, 1500);
    } else {
      authMessage.innerText = '가입이 완료되었습니다! 로그인 중...';
      setTimeout(() => { handleLogin(); }, 1500);
    }
  } catch (e) {
    authMessage.innerText = '서버 연결 실패';
  }
}

if (authLoginBtn) authLoginBtn.addEventListener('click', handleLogin);
if (authRegisterBtn) authRegisterBtn.addEventListener('click', handleRegister);

const handleAuthEnter = (e) => {
  if (e.key === 'Enter') {
    handleLogin();
  }
};
if (authUsername) authUsername.addEventListener('keydown', handleAuthEnter);
if (authPassword) authPassword.addEventListener('keydown', handleAuthEnter);

const authCloseBtn = document.getElementById('auth-close-btn');
if (authCloseBtn) authCloseBtn.addEventListener('click', hideAuthModal);

if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      hideAuthModal();
    }
  });
}

function handleLogout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    localStorage.removeItem('bible_tree_token');
    window.location.reload();
  }
}

const userLogoutBtn = document.getElementById('user-logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
if (userLogoutBtn) userLogoutBtn.addEventListener('click', handleLogout);
if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);

// Security Enhancements
document.addEventListener('contextmenu', e => {
  const targetEl = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
  if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (typeof targetEl.closest === 'function' && targetEl.closest('[contenteditable="true"]')))) return;
  e.preventDefault();
});
document.addEventListener('selectstart', e => {
  const targetEl = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
  if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (typeof targetEl.closest === 'function' && targetEl.closest('[contenteditable="true"]')))) return;
  e.preventDefault();
});
document.addEventListener('dragstart', e => {
  const targetEl = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
  if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (typeof targetEl.closest === 'function' && targetEl.closest('[contenteditable="true"]')))) return;
  e.preventDefault();
});
document.addEventListener('keydown', e => {
  if (e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or J
      (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
      (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) || // Cmd+Option+I or J (Mac)
      (e.metaKey && e.keyCode === 85)) { // Cmd+U (Mac)
    e.preventDefault();
  }
});
if (adminDashboardCloseBtn) {
  adminDashboardCloseBtn.addEventListener('click', () => {
    adminDashboardModal.style.display = 'none';
  });
}

function renderAdminDashboard(users) {
  adminUserList.innerHTML = '';
  if (users.length === 0) {
    adminUserList.innerHTML = '<p>가입한 사용자가 없습니다.</p>';
    return;
  }
  users.forEach(u => {
    const div = document.createElement('div');
    div.style.padding = '12px 10px';
    div.style.borderBottom = '1px solid #eee';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.style.gap = '15px';
    
    let buttons = '';
    if (u.status === 'pending') {
      buttons += `<button onclick="approveUser('${u.username}')" style="background:#27ae60; color:white; border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:4px;">승인</button>`;
    }
    // Password reset button is available for all accounts
    buttons += `<button onclick="resetPasswordUser('${u.username}')" style="background:#8e44ad; color:white; border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:4px;">비번 변경</button>`;
    
    if (u.status !== 'admin') {
      buttons += `<button onclick="deleteUser('${u.username}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:4px;">삭제</button>`;
    }

    let expiryHtml = '';
    if (u.status !== 'admin') {
      const expiryVal = u.expiryDate || '';
      expiryHtml = `
        <div style="display:flex; align-items:center; gap:5px; font-size:12px;">
          <label style="color:#666; font-weight:bold;">만료일:</label>
          <input type="date" id="expiry-date-${u.username}" value="${expiryVal}" style="padding:4px; border:1px solid #ccc; border-radius:3px; outline:none;">
          <button onclick="setExpiryUser('${u.username}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:3px; font-weight:bold;">설정</button>
        </div>
      `;
    }

    div.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; gap:3px;">
        <div style="font-size:14px;"><strong>${u.username}</strong> <span style="color:#888; font-size:11px; padding:2px 6px; background:#f1f5f9; border-radius:12px; margin-left:5px;">${u.status}</span></div>
        <div style="color:#64748b; font-size:12px;">작성한 노트: <span style="color:#0f172a; font-weight:bold;">${u.noteCount || 0}</span>개</div>
      </div>
      ${expiryHtml}
      <div style="display:flex; gap:5px;">${buttons}</div>
    `;
    adminUserList.appendChild(div);
  });
}

window.openAdminDashboard = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/users'), { headers: { 'Authorization': 'Bearer ' + userToken } });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '권한이 없습니다.');
        if (res.status === 401 || res.status === 403) {
          userToken = null;
          localStorage.removeItem('bible_tree_token');
          currentUser = null;
          hideAdminLockControls();
          showAuthModal();
        }
        return;
      }
      
      renderAdminDashboard(data.users);
      adminDashboardModal.style.display = 'flex';
    } catch (e) {
      alert('서버 오류');
    }
  };

window.resetPasswordUser = async function(username) {
  const newPassword = prompt(`'${username}' 사용자의 새 비밀번호를 입력하세요:`, "");
  if (newPassword === null) return;
  if (newPassword.trim() === "") return alert("비밀번호를 입력해야 합니다.");

  try {
    const res = await fetch(getApiUrl('/api/admin/users/reset-password'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ username, password: newPassword.trim() })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || '비밀번호 재설정 실패');
    alert('비밀번호가 성공적으로 재설정되었습니다.');
  } catch (e) {
    alert('서버 오류');
  }
};

window.setExpiryUser = async function(username) {
  const dateInput = document.getElementById(`expiry-date-${username}`);
  if (!dateInput) return;
  const expiryDate = dateInput.value;

  try {
    const res = await fetch(getApiUrl('/api/admin/users/expiry'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + userToken },
      body: JSON.stringify({ username, expiryDate })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || '오류가 발생했습니다.');
    alert('기간 설정이 완료되었습니다.');
  } catch (e) {
    alert('서버 오류');
  }
}
window.approveUser = async function(username) {
  try {
    const res = await fetch(getApiUrl('/api/admin/approve'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + userToken },
      body: JSON.stringify({ username })
    });
    if (res.ok) {
      alert('승인되었습니다.');
      window.openAdminDashboard(); // refresh list
    }
  } catch(e) {}
};

window.deleteUser = async function(username) {
  if (!confirm(`정말로 '${username}' 사용자의 가입을 취소하고 계정을 삭제하시겠습니까? (작성된 메모도 모두 삭제됩니다)`)) return;
  try {
    const res = await fetch(getApiUrl('/api/admin/users'), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + userToken },
      body: JSON.stringify({ username })
    });
    if (res.ok) {
      alert('삭제되었습니다.');
      window.openAdminDashboard();
    }
  } catch(e) {}
};

// Update all cards and annotations with note badge indicators based on current userNotes
function updateAllNoteBadges() {
  // 1. Remove all existing card note badges
  document.querySelectorAll('.card-note-badge').forEach(el => el.remove());
  document.querySelectorAll('.annot-note-badge').forEach(el => el.remove());
  
  // 2. Add badges for active notes
  Object.keys(userNotes).forEach(personId => {
    const noteContent = userNotes[personId];
    if (!noteContent) return;
    
    const card = document.getElementById(`card-${personId}`);
    if (card) {
      let badge = card.querySelector('.card-note-badge');
      if (!badge) {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'card-note-badge';
        badgeEl.title = '메모 있음';
        badgeEl.textContent = '📝';
        card.appendChild(badgeEl);
      }
    } else {
      const annotEl = document.getElementById(`annot-${personId}`);
      if (annotEl) {
        let badge = annotEl.querySelector('.annot-note-badge');
        if (!badge) {
          const badgeEl = document.createElement('div');
          badgeEl.className = 'annot-note-badge';
          badgeEl.title = '메모 있음';
          badgeEl.textContent = '📝';
          badgeEl.style.position = 'absolute';
          badgeEl.style.top = '-8px';
          badgeEl.style.right = '-8px';
          badgeEl.style.fontSize = '12px';
          badgeEl.style.zIndex = '100';
          annotEl.appendChild(badgeEl);
        }
      }
    }
  });
}

// Load user notes
async function fetchUserNotes() {
  try {
    // 1. Load from Local Storage first
    const localNotes = localStorage.getItem('bible_tree_user_notes');
    if (localNotes) {
      userNotes = JSON.parse(localNotes) || {};
    }

    // 2. Load and merge from local Backup JSON (in case local storage was cleared)
    if (window.__TAURI__ && window.__TAURI__.fs && window.__TAURI__.path) {
      try {
        const docDir = await window.__TAURI__.path.documentDir();
        const backupPath = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes_autobackup.json');
        
        const backupJsonText = await window.__TAURI__.fs.readTextFile(backupPath);
        const backupNotes = JSON.parse(backupJsonText);
        if (backupNotes) {
          // Merge backup notes into userNotes safely
          for (const id of Object.keys(backupNotes)) {
            if (!userNotes[id] || userNotes[id].trim() === '') {
              userNotes[id] = backupNotes[id];
            }
          }
          console.log("[동기화] 로컬 백업 JSON 데이터를 병합했습니다.");
        }
      } catch (err) {
        console.log("No backup JSON found or skipped: ", err);
      }
    }

    updateAllNoteBadges();

    // 3. Sync with Server (if license key exists)
    const licenseKey = localStorage.getItem('bible_genealogy_license_key');
    if (userToken || licenseKey) {
      try {
        const authHeader = userToken ? ('Bearer ' + userToken) : ('License ' + licenseKey);
        const res = await fetch(getApiUrl('/api/notes'), { headers: { 'Authorization': authHeader } });
        if (res.ok) {
          const data = await res.json();
          const serverNotes = data.notes || {};
          
          // Merge server notes safely (never overwrite local notes that have content)
          let mergedCount = 0;
          for (const id of Object.keys(serverNotes)) {
            if (!userNotes[id] || userNotes[id].trim() === '') {
              userNotes[id] = serverNotes[id];
              mergedCount++;
            }
          }
          if (mergedCount > 0) {
            localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
            updateAllNoteBadges();
            console.log(`[서버 동기화] ${mergedCount}개의 새로운 메모를 서버에서 가져왔습니다.`);
          }
        }
      } catch (e) {
        console.error("Server sync failed: ", e);
      }
    }

    // 4. Import from Obsidian Markdown files (Obsidian edits win)
    setTimeout(async () => {
      await importNotesFromMdFiles();
      
      // 5. Save the final merged notes and trigger backup
      localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
      triggerAutoBackup();
      
      // Upload the final merged notes to the server
      if (userToken || licenseKey) {
        try {
          const authHeader = userToken ? ('Bearer ' + userToken) : ('License ' + licenseKey);
          await fetch(getApiUrl('/api/notes'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            body: JSON.stringify({ notes: userNotes })
          });
          console.log("[동기화] 최종 병합된 메모를 서버에 업로드했습니다.");
        } catch (e) {}
      }
    }, 1000);

  } catch (e) {
    console.error("Failed in fetchUserNotes: ", e);
  }
}

// Bidirectional sync: Scan folders and import updated markdown files back into userNotes
async function importNotesFromMdFiles() {
  if (!window.__TAURI__ || !window.__TAURI__.fs || !window.__TAURI__.path) return;
  
  // Check if MD Sync is disabled by settings
  const isMdSyncEnabled = localStorage.getItem('bible_tree_md_sync') !== 'false';
  if (!isMdSyncEnabled) {
    console.log("Obsidian MD Sync is disabled. Skipping MD file import.");
    return;
  }
  try {
    const docDir = await window.__TAURI__.path.documentDir();
    const backupFolder = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes');
    
    const folders = ['인물', '선지자', '사건', '장소', '영역', '텍스트상자', '기타'];
    let hasChanges = false;
    
    for (const folderName of folders) {
      try {
        const folderPath = await window.__TAURI__.path.join(backupFolder, folderName);
        const entries = await window.__TAURI__.fs.readDir(folderPath);
        for (const entry of entries) {
          if (entry.name && entry.name.endsWith('.md')) {
            const fileText = await window.__TAURI__.fs.readTextFile(entry.path);
            
            // Parse Obsidian Frontmatter
            const parts = fileText.split('---');
            if (parts.length >= 3) {
              const yaml = parts[1];
              const idMatch = yaml.match(/id:\s*"([^"]+)"/) || yaml.match(/id:\s*([^\n]+)/);
              if (idMatch) {
                const id = idMatch[1].trim();
                let body = parts.slice(2).join('---').trim();
                
                // Strip the header "# Title" at the start of the body
                const titleMatch = yaml.match(/title:\s*"([^"]+)"/) || yaml.match(/title:\s*([^\n]+)/);
                if (titleMatch) {
                  const titleVal = titleMatch[1].replace(/"/g, '').trim();
                  const escapedTitle = titleVal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                  const headerRegex = new RegExp('^#\\s+' + escapedTitle + '\\s*\\r?\\n?');
                  body = body.replace(headerRegex, '').trim();
                }
                
                // If it differs, Obsidian is the source of truth for the change
                if (userNotes[id] !== body) {
                  userNotes[id] = body;
                  hasChanges = true;
                  console.log(`[MD 가져오기 성공] 업데이트된 키: ${id}`);
                }
              }
            }
          }
        }
      } catch (err) {
        // Folder doesn't exist yet or permission error, proceed
      }
    }
    
    if (hasChanges) {
      localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
      updateAllNoteBadges();
    }
  } catch (e) {
    console.error("Failed to run bidirectional sync from MD files:", e);
  }
}

let backupTimeout = null;
let isBackupRunning = false;
let backupPending = false;

// Trigger automatic background backup in the Documents folder when running inside Tauri (with 800ms debounce)
function triggerAutoBackup() {
  // Only run inside real Tauri environment (must have __TAURI__ API)
  if (!window.__TAURI__ || !window.__TAURI__.fs || !window.__TAURI__.path) return;

  if (backupTimeout) {
    clearTimeout(backupTimeout);
  }

  backupTimeout = setTimeout(() => {
    backupTimeout = null;
    runBackupActual();
  }, 800); // 800ms debounce - responsive but avoids write conflicts
}

// Helper to get unique filename for a node to prevent collisions
function getUniqueBackupFileName(key) {
  let name = key;
  let type = '기타';
  let person = null, ev = null, loc = null, poly = null;

  person = (typeof db !== 'undefined') ? db.find(p => p.id === key) : null;
  if (person) {
    name = person.name;
    const isProphetChar = person.isProphet === true || 
                          (typeof prophetIds !== 'undefined' && prophetIds.has(person.id)) || 
                          person.id.startsWith('prophet_') || 
                          person.id === 'samuel';
    type = isProphetChar ? '선지자' : '인물';

    // Duplicate name resolution (Option A)
    const sameNameCount = db.filter(p => p.name === person.name).length;
    if (sameNameCount > 1) {
      let suffix = '';
      if (person.parents && person.parents.length > 0) {
        const parentId = person.parents[0];
        const parent = db.find(p => p.id === parentId);
        if (parent) {
          const relationship = person.gender === 'F' ? '딸' : '아들';
          suffix = `${parent.name}의 ${relationship}`;
        }
      }
      if (!suffix) {
        suffix = person.id;
      }
      name = `${person.name} (${suffix})`;
    }
  } else {
    ev = (typeof events !== 'undefined') ? events.find(e => e.id === key) : null;
    if (ev) {
      name = ev.name;
      type = '사건';
    } else {
      loc = (typeof locations !== 'undefined') ? locations.find(l => l.id === key) : null;
      if (loc) {
        name = loc.name;
        type = '장소';
      } else {
        poly = (typeof customPolygons !== 'undefined') ? customPolygons.find(p => p.id === key) : null;
        if (poly) {
          name = poly.label || poly.id;
          type = '영역';
        } else if (key.startsWith('note-') || key.startsWith('annotation_')) {
          name = key;
          type = '텍스트상자';
        }
      }
    }
  }

  const cleanName = name.replace(/[\/\\:\*\?"<>\|]/g, '_').trim();
  return { cleanName, type, person, ev, loc, poly };
}

async function runBackupActual() {
  if (!window.__TAURI__ || !window.__TAURI__.fs || !window.__TAURI__.path) return;

  if (isBackupRunning) {
    backupPending = true;
    return;
  }

  isBackupRunning = true;
  backupPending = false;

  try {
    const docDir = await window.__TAURI__.path.documentDir();
    
    // 1. Save the main JSON backup
    const backupPath = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes_autobackup.json');
    await window.__TAURI__.fs.writeTextFile(backupPath, JSON.stringify(userNotes, null, 2));
    console.log("Auto-backup JSON saved:", backupPath);

    // Check if MD Sync is disabled by settings
    const isMdSyncEnabled = localStorage.getItem('bible_tree_md_sync') !== 'false';
    if (!isMdSyncEnabled) {
      console.log("Obsidian MD Sync is disabled. Skipping MD file exports.");
      return;
    }

    // 2. Export individual Markdown files into sub-folders (Obsidian-friendly)
    const backupFolder = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes');
    await window.__TAURI__.fs.createDir(backupFolder, { recursive: true });
    
    const folders = ['인물', '선지자', '사건', '장소', '영역', '텍스트상자', '기타'];
    for (const f of folders) {
      const subPath = await window.__TAURI__.path.join(backupFolder, f);
      await window.__TAURI__.fs.createDir(subPath, { recursive: true });
    }

    const expectedFiles = new Set(); // Track files we explicitly generate to clean up others (Method 1)

    for (const key of Object.keys(userNotes)) {
      const content = userNotes[key];
      if (!content || !content.trim()) continue;

      const { cleanName, type, person, ev, loc, poly } = getUniqueBackupFileName(key);
      const mdFilePath = await window.__TAURI__.path.join(backupFolder, type, cleanName + '.md');
      expectedFiles.add(mdFilePath);

      let title = cleanName;
      if (person) title = `${person.name}${person.engName ? ' (' + person.engName + ')' : ''}`;
      else if (ev) title = ev.name;
      else if (loc) title = loc.name;
      else if (poly) title = poly.label || poly.id;

      const mdText = `---\ntitle: "${title}"\nid: "${key}"\ntype: "${type}"\ntags:\n  - 성경족보메모\n  - ${type}\n---\n\n# ${title}\n\n${content}\n`;
      await window.__TAURI__.fs.writeTextFile(mdFilePath, mdText);
      console.log(`MD 생성: ${type}/${cleanName}.md`);
    }

    // Method 1: Scan folders and delete unexpected/conflicting/obsolete .md files (e.g. "압살롬 2.md" or old duplicates)
    // Safety guard: Only clean up if we actually have some valid loaded userNotes (avoids deletion during race conditions)
    if (expectedFiles.size > 0) {
      for (const folderName of folders) {
        try {
          const folderPath = await window.__TAURI__.path.join(backupFolder, folderName);
          const entries = await window.__TAURI__.fs.readDir(folderPath);
          for (const entry of entries) {
            if (entry.name && entry.name.endsWith('.md')) {
              const entryFullPath = entry.path;
              if (!expectedFiles.has(entryFullPath)) {
                console.log("Cleanup obsolete/duplicate file:", entryFullPath);
                try {
                  await window.__TAURI__.fs.removeFile(entryFullPath);
                } catch (e) {
                  console.error("Cleanup failed for:", entryFullPath, e);
                }
              }
            }
          }
        } catch (err) {
          console.error(`Folder cleanup failed for ${folderName}:`, err);
        }
      }
    }

    console.log("Auto-backup MD 파일 내보내기 완료:", backupFolder);
  } catch (err) {
    console.error("Auto-backup 실패:", err);
  } finally {
    isBackupRunning = false;
    if (backupPending) {
      backupPending = false;
      setTimeout(runBackupActual, 300);
    }
  }
}

async function saveUserNotes() {
  try {
    localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
  } catch(e) {}

  // Run automatic background backup locally (Tauri only)
  triggerAutoBackup();

  const licenseKey = localStorage.getItem('bible_genealogy_license_key');
  if (!userToken && !licenseKey) return;
  try {
    const authHeader = userToken ? ('Bearer ' + userToken) : ('License ' + licenseKey);
    await fetch(getApiUrl('/api/notes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ notes: userNotes })
    });
  } catch(e) {}
}

// Write a single note's MD file immediately (called right after save button click)
async function writeSingleNoteMd(key, content) {
  if (!window.__TAURI__ || !window.__TAURI__.fs || !window.__TAURI__.path) return;
  const isMdSyncEnabled = localStorage.getItem('bible_tree_md_sync') !== 'false';
  if (!isMdSyncEnabled) return;
  try {
    const docDir = await window.__TAURI__.path.documentDir();
    const backupFolder = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes');

    const { cleanName, type, person, ev, loc, poly } = getUniqueBackupFileName(key);
    const folderPath = await window.__TAURI__.path.join(backupFolder, type);
    await window.__TAURI__.fs.createDir(folderPath, { recursive: true });
    const mdFilePath = await window.__TAURI__.path.join(folderPath, cleanName + '.md');

    if (!content || !content.trim()) {
      try { await window.__TAURI__.fs.removeFile(mdFilePath); } catch (_) {}
      return;
    }

    let title = cleanName;
    if (person) title = `${person.name}${person.engName ? ' (' + person.engName + ')' : ''}`;
    else if (ev) title = ev.name;
    else if (loc) title = loc.name;
    else if (poly) title = poly.label || poly.id;

    const mdText = `---\ntitle: "${title}"\nid: "${key}"\ntype: "${type}"\ntags:\n  - 성경족보메모\n  - ${type}\n---\n\n# ${title}\n\n${content}\n`;
    await window.__TAURI__.fs.writeTextFile(mdFilePath, mdText);
    console.log(`[MD 즉시 저장] ${type}/${cleanName}.md`);
  } catch (err) {
    console.error('[MD 즉시 저장 실패]', key, err);
  }
}

// Bottom Control Panel Notes Export & Import handlers
const bottomBackupBtn = document.getElementById('bottom-backup-btn');
const bottomRestoreBtn = document.getElementById('bottom-restore-btn');
const userNotesFileInput = document.getElementById('user-notes-file-input');

if (bottomBackupBtn) {
  bottomBackupBtn.addEventListener('click', async () => {
    const isTauri = window.location.protocol.startsWith('tauri') || 
                    window.location.hostname === 'tauri.localhost' || 
                    window.location.protocol.startsWith('file') ||
                    window.location.protocol.startsWith('asset') ||
                    (window.__TAURI__ && window.__TAURI__.fs);
    const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();

    if (isCapacitor) {
      try {
        const { Filesystem } = window.Capacitor.Plugins;
        const { Share } = window.Capacitor.Plugins;
        
        if (!Filesystem || !Share) {
          throw new Error("Capacitor plugins not loaded");
        }
        
        const fileName = 'bible_genealogy_notes_backup.json';
        const fileContent = JSON.stringify(userNotes, null, 2);
        
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: fileContent,
          directory: 'CACHE',
          encoding: 'utf8'
        });
        
        await Share.share({
          title: '열린족보이야기 메모 백업',
          url: writeResult.uri
        });
      } catch (err) {
        alert('모바일 메모 백업 중 오류가 발생했습니다: ' + err.message);
      }
    } else if (isTauri && window.__TAURI__ && window.__TAURI__.fs && window.__TAURI__.path) {
      try {
        const docDir = await window.__TAURI__.path.documentDir();
        const backupPath = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes_autobackup.json');
        await window.__TAURI__.fs.writeTextFile(backupPath, JSON.stringify(userNotes, null, 2));
        alert('내 문서(Documents) 폴더에 전체 메모 백업 파일이 저장되었습니다.\n파일명: bible_genealogy_notes_autobackup.json');
      } catch (err) {
        alert('자동 저장 중 오류가 발생했습니다: ' + err.message);
      }
    } else {
      // Browser fallback: download file
      try {
        const dataStr = JSON.stringify(userNotes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'bible_genealogy_notes_backup.json');
        linkElement.click();
      } catch (e) {
        alert('메모 백업 중 오류가 발생했습니다: ' + e.message);
      }
    }
  });
}

if (bottomRestoreBtn && userNotesFileInput) {
  bottomRestoreBtn.addEventListener('click', async () => {
    const isTauri = window.location.protocol.startsWith('tauri') || 
                    window.location.hostname === 'tauri.localhost' || 
                    window.location.protocol.startsWith('file') ||
                    window.location.protocol.startsWith('asset') ||
                    (window.__TAURI__ && window.__TAURI__.fs);
    
    if (isTauri && window.__TAURI__ && window.__TAURI__.fs && window.__TAURI__.path) {
      try {
        const docDir = await window.__TAURI__.path.documentDir();
        const backupPath = await window.__TAURI__.path.join(docDir, 'bible_genealogy_notes_autobackup.json');
        
        let contents;
        try {
          contents = await window.__TAURI__.fs.readTextFile(backupPath);
        } catch (readErr) {
          // File not found / read error fallback
          if (confirm('자동저장된 백업 파일을 찾을 수 없습니다.\n수동 백업 파일(.json)을 직접 선택하여 복원하시겠습니까?')) {
            userNotesFileInput.click();
          }
          return;
        }

        const imported = JSON.parse(contents);
        if (typeof imported !== 'object' || imported === null) {
          throw new Error('파일 형식이 올바르지 않습니다.');
        }
        
        if (confirm('내 문서 폴더에 자동저장된 백업 파일(bible_genealogy_notes_autobackup.json)을 발견했습니다.\n이 파일에서 모든 메모를 복원하시겠습니까?\n(현재 기기의 메모와 서버 데이터가 복원된 내용으로 즉시 갱신됩니다.)')) {
          userNotes = imported;
          localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
          
          const noteTextarea = document.getElementById('note-text');
          if (noteTextarea && activePersonId) {
            noteTextarea.value = userNotes[activePersonId] || '';
          }
          
          await saveUserNotes();
          updateAllNoteBadges();
          alert('자동저장된 백업 파일에서 모든 메모를 성공적으로 복원했습니다.');
        } else {
          // Cancelled automatic, ask if they want manual instead
          if (confirm('다른 수동 백업 파일(.json)을 직접 선택하여 복원하시겠습니까?')) {
            userNotesFileInput.click();
          }
        }
      } catch (err) {
        alert('자동 백업 파일 복원 실패: ' + err.message + '\n수동 백업 파일 선택으로 전환합니다.');
        userNotesFileInput.click();
      }
    } else {
      // Web browser: trigger file picker directly
      userNotesFileInput.click();
    }
  });

  userNotesFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (typeof imported !== 'object' || imported === null) {
          throw new Error('올바른 백업 파일 형식이 아닙니다.');
        }
        
        if (confirm('가져온 백업 파일로 현재 메모를 덮어쓰시겠습니까? (기존 메모는 유실될 수 있습니다.)')) {
          userNotes = imported;
          localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
          
          const noteTextarea = document.getElementById('note-text');
          if (noteTextarea && activePersonId) {
            noteTextarea.value = userNotes[activePersonId] || '';
          }
          
          await saveUserNotes();
          updateAllNoteBadges();
          alert('수동 백업 파일에서 모든 메모를 성공적으로 복원했습니다.');
        }
      } catch (err) {
        alert('백업 파일을 가져오지 못했습니다: ' + err.message);
      }
      userNotesFileInput.value = '';
    };
    reader.readAsText(file);
  });
}

// User Dashboard
const adminUsersBtn = document.getElementById('admin-users-btn');
if (adminUsersBtn) {
  adminUsersBtn.addEventListener('click', () => {
    window.openAdminDashboard();
  });
}

// --- Layer Functions ---
function renderEvents() {
  const layer = document.getElementById('layer-events');
  if (!layer) return;
  layer.innerHTML = '';
  
  events.forEach(ev => {
    const el = document.createElement('div');
    const filterClass = getEventFilterClass(ev);
    el.className = `layer-marker marker-event ${filterClass}`;
    el.style.left = `${ev.x * currentScale}px`;
    el.style.top = `${ev.y * currentScale}px`;
    el.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
    el.style.transformOrigin = '50% 50%';
    el.id = `event-${ev.id}`;
    
    el.innerHTML = `
      <div class="marker-icon">📜</div>
      <div class="marker-label">${cleanLayerName(getEventName(ev))}</div>
    `;
    
    makeLayerDraggable(el, ev, 'event');
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.isDraggingFinished) {
        el.isDraggingFinished = false;
        return;
      }
      openLayerDetails(ev, 'event');
      highlightRelatedElements(ev.id, 'event');
    });
    
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (isAdminMode) {
        editLayerItem(ev, 'event');
      }
    });
    
    layer.appendChild(el);
  });
}

function renderLocations() {
  const layer = document.getElementById('layer-locations');
  if (!layer) return;
  layer.innerHTML = '';
  
  locations.forEach(loc => {
    const el = document.createElement('div');
    const filterClass = getLocationFilterClass(loc);
    el.className = `layer-marker marker-location ${filterClass}`;
    el.style.left = `${loc.x * currentScale}px`;
    el.style.top = `${loc.y * currentScale}px`;
    el.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
    el.style.transformOrigin = '50% 50%';
    el.id = `location-${loc.id}`;
    
    el.innerHTML = `
      <div class="marker-icon">📍</div>
      <div class="marker-label">${cleanLayerName(getLocationName(loc))}</div>
    `;
    
    makeLayerDraggable(el, loc, 'location');
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (el.isDraggingFinished) {
        el.isDraggingFinished = false;
        return;
      }
      openLayerDetails(loc, 'location');
      highlightRelatedElements(loc.id, 'location');
    });
    
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (isAdminMode) {
        editLayerItem(loc, 'location');
      }
    });
    
    layer.appendChild(el);
  });
}

function makeLayerDraggable(el, item, type) {
  el.addEventListener('mousedown', (e) => {
    if (!isAdminMode) return;
    e.stopPropagation();
    
    let isDragging = false;
    let startX = e.clientX;
    let startY = e.clientY;
    let originalX = item.x;
    let originalY = item.y;
    
    el.style.zIndex = 30;
    
    const onMouseMove = (moveEvent) => {
      const dx_pixels = moveEvent.clientX - startX;
      const dy_pixels = moveEvent.clientY - startY;
      
      if (Math.abs(dx_pixels) > 4 || Math.abs(dy_pixels) > 4) {
        if (!isDragging) {
          pushHistoryState();
          isDragging = true;
        }
      }
      
      if (isDragging) {
        const dx = dx_pixels / currentScale;
        const dy = dy_pixels / currentScale;
        item.x = Math.round(originalX + dx);
        item.y = Math.round(originalY + dy);
        
        el.style.left = `${item.x * currentScale}px`;
        el.style.top = `${item.y * currentScale}px`;
      }
    };
    
    const onMouseUp = (endEvent) => {
      endEvent.stopPropagation();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      el.style.zIndex = '';
      
      if (isDragging) {
        if (type === 'event') saveEvents();
        else saveLocations();
        autoSaveToServer();
        el.isDraggingFinished = true;
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}

function openLayerDetails(data, type) {
  const studyPanel = document.getElementById('study-panel');
  if (!studyPanel) return;
  
  activePersonId = data.id; // 노트와 리소스를 이 ID에 연동
  activeStudyPanelType = type;
  
  const infoTitleEl = document.getElementById('panel-info-title');
  const titleEl = document.getElementById('panel-name');
  const engEl = document.getElementById('panel-eng');
  const descEl = document.getElementById('panel-desc');
  
  const texts = UI_TEXTS[currentLang];
  
  if (type === 'annotation') {
    if (infoTitleEl) infoTitleEl.textContent = texts.study_panel_title_annotation;
    const localizedText = getLocalizedAnnotationText(data.text);
    if (titleEl) titleEl.innerHTML = `<span style="font-size: 0.8em; color: #888;">${texts.label_annotation}</span><br>${localizedText}`;
    if (engEl) engEl.textContent = 'Text Box';
    if (descEl) descEl.innerHTML = texts.desc_annotation;
  } else if (type === 'polygon') {
    if (infoTitleEl) infoTitleEl.textContent = texts.study_panel_title_polygon;
    if (titleEl) titleEl.innerHTML = `<span style="font-size: 0.8em; color: #888;">${texts.label_polygon}</span><br>${getPolygonLabel(data) || ''}`;
    if (engEl) engEl.textContent = 'Custom Area';
    if (descEl) descEl.innerHTML = texts.desc_polygon;
  } else {
    const isEvent = (type === 'event');
    if (infoTitleEl) {
      infoTitleEl.textContent = isEvent ? texts.study_panel_title_event : texts.study_panel_title_location;
    }
    const localizedName = isEvent ? getEventName(data) : getLocationName(data);
    const secondaryName = currentLang === 'en' ? data.name : (data.engName || '');
    
    if (titleEl) titleEl.innerHTML = `<span style="font-size: 0.8em; color: #888;">${isEvent ? texts.label_event : texts.label_location}</span><br>${cleanLayerName(localizedName)}`;
    if (engEl) engEl.textContent = secondaryName || (isEvent ? 'Event' : 'Location');
    
    const localizedDesc = isEvent ? getEventDesc(data) : getLocationDesc(data);
    let descHtml = (localizedDesc || texts.desc_no_detail).replace(/\n/g, '<br>');
    if (data.refs && data.refs.length > 0) {
      descHtml += `<br><br><strong>${texts.related_verses}</strong><ul>`;
      data.refs.forEach(r => descHtml += `<li>${r}</li>`);
      descHtml += `</ul>`;
    }
    if (descEl) descEl.innerHTML = descHtml;
  }
  
  const noteTextarea = document.getElementById('note-text');
  if (noteTextarea) {
    const savedNote = userNotes[data.id] || '';
    noteTextarea.value = savedNote;
  }
  
  const resources = JSON.parse(localStorage.getItem(`bible_tree_resources_${data.id}`)) || [];
  renderResourcesList(resources);
  
  studyPanel.classList.add('active');
}

function editLayerItem(data, type) {
  isLayerItemAddMode = false;
  activeLayerItem = data;
  activeLayerType = type;
  
  // Clear search inputs
  const peopleSearch = document.getElementById('layer-item-people-search');
  const eventsSearch = document.getElementById('layer-item-events-search');
  const locationsSearch = document.getElementById('layer-item-locations-search');
  if (peopleSearch) peopleSearch.value = '';
  if (eventsSearch) eventsSearch.value = '';
  if (locationsSearch) locationsSearch.value = '';
  
  const nameInput = document.getElementById('layer-item-name');
  const nameGroup = nameInput ? nameInput.closest('.form-group') : null;
  const descGroup = document.getElementById('layer-item-desc') ? document.getElementById('layer-item-desc').closest('.form-group') : null;
  const refsGroup = document.getElementById('layer-item-refs') ? document.getElementById('layer-item-refs').closest('.form-group') : null;
  
  if (type === 'annotation') {
    layerItemModalTitle.textContent = "텍스트 상자 관계 설정";
    if (nameGroup) nameGroup.style.display = 'none';
    if (descGroup) descGroup.style.display = 'none';
    if (refsGroup) refsGroup.style.display = 'none';
    if (nameInput) {
      nameInput.value = '';
      nameInput.removeAttribute('required');
    }
    document.getElementById('layer-item-desc').value = '';
    document.getElementById('layer-item-refs').value = '';
    document.getElementById('layer-item-events-group').style.display = '';
    document.getElementById('layer-item-locations-group').style.display = '';
    if (layerItemDeleteBtn) {
      layerItemDeleteBtn.style.display = 'none';
    }
  } else {
    if (nameGroup) nameGroup.style.display = '';
    if (descGroup) descGroup.style.display = '';
    if (refsGroup) refsGroup.style.display = '';
    if (nameInput) nameInput.setAttribute('required', 'required');
    
    if (type === 'event') {
      layerItemModalTitle.textContent = "사건 정보 수정";
      document.getElementById('layer-item-name-label').textContent = "사건 이름*";
      document.getElementById('layer-item-events-group').style.display = 'none';
      document.getElementById('layer-item-locations-group').style.display = '';
      if (nameInput) nameInput.placeholder = "예: 선악과 사건";
    } else {
      layerItemModalTitle.textContent = "장소 정보 수정";
      document.getElementById('layer-item-name-label').textContent = "장소 이름*";
      document.getElementById('layer-item-events-group').style.display = '';
      document.getElementById('layer-item-locations-group').style.display = 'none';
      if (nameInput) nameInput.placeholder = "예: 에덴 동산";
    }
    
    if (layerItemDeleteBtn) {
      layerItemDeleteBtn.style.display = '';
    }
  }
  
  if (type !== 'annotation') {
    if (nameInput) nameInput.value = data.name;
    document.getElementById('layer-item-desc').value = data.desc || "";
    document.getElementById('layer-item-refs').value = data.refs ? data.refs.join(', ') : "";
  }
  
  populateRelationChecklists(data.id, type);
  updateSelectedTags('people');
  updateSelectedTags('events');
  updateSelectedTags('locations');
  
  layerItemModal.style.display = 'flex';
}

function openLayerItemAddForm(type) {
  isLayerItemAddMode = true;
  activeLayerItem = null;
  activeLayerType = type;
  
  // Clear search inputs
  const peopleSearch = document.getElementById('layer-item-people-search');
  const eventsSearch = document.getElementById('layer-item-events-search');
  const locationsSearch = document.getElementById('layer-item-locations-search');
  if (peopleSearch) peopleSearch.value = '';
  if (eventsSearch) eventsSearch.value = '';
  if (locationsSearch) locationsSearch.value = '';
  
  const nameInput = document.getElementById('layer-item-name');
  if (nameInput) nameInput.setAttribute('required', 'required');
  const nameGroup = nameInput ? nameInput.closest('.form-group') : null;
  const descGroup = document.getElementById('layer-item-desc') ? document.getElementById('layer-item-desc').closest('.form-group') : null;
  const refsGroup = document.getElementById('layer-item-refs') ? document.getElementById('layer-item-refs').closest('.form-group') : null;
  
  if (nameGroup) nameGroup.style.display = '';
  if (descGroup) descGroup.style.display = '';
  if (refsGroup) refsGroup.style.display = '';
  
  if (type === 'event') {
    layerItemModalTitle.textContent = "새 사건 추가";
    document.getElementById('layer-item-name-label').textContent = "사건 이름*";
    document.getElementById('layer-item-events-group').style.display = 'none';
    document.getElementById('layer-item-locations-group').style.display = '';
    if (nameInput) nameInput.placeholder = "예: 선악과 사건";
  } else {
    layerItemModalTitle.textContent = "새 장소 추가";
    document.getElementById('layer-item-name-label').textContent = "장소 이름*";
    document.getElementById('layer-item-events-group').style.display = '';
    document.getElementById('layer-item-locations-group').style.display = 'none';
    if (nameInput) nameInput.placeholder = "예: 에덴 동산";
  }
  
  if (nameInput) nameInput.value = '';
  document.getElementById('layer-item-desc').value = '';
  document.getElementById('layer-item-refs').value = '';
  
  if (layerItemDeleteBtn) {
    layerItemDeleteBtn.style.display = 'none';
  }
  
  populateRelationChecklists(null, type);
  updateSelectedTags('people');
  updateSelectedTags('events');
  updateSelectedTags('locations');
  
  layerItemModal.style.display = 'flex';
}

function populateRelationChecklists(currentItemId, currentItemType) {
  const peopleList = document.getElementById('layer-item-people-list');
  const eventsList = document.getElementById('layer-item-events-list');
  const locationsList = document.getElementById('layer-item-locations-list');
  
  if (peopleList) {
    peopleList.innerHTML = '';
    
    // Sort checked items to the top
    const checkedPeople = [];
    const uncheckedPeople = [];
    
    db.forEach(person => {
      const isChecked = activeLayerItem && activeLayerItem.relatedPeople && 
        (activeLayerItem.relatedPeople.includes(person.id) || activeLayerItem.relatedPeople.includes(person.name));
      if (isChecked) {
        checkedPeople.push(person);
      } else {
        uncheckedPeople.push(person);
      }
    });
    
    checkedPeople.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    uncheckedPeople.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
    const combined = [...checkedPeople, ...uncheckedPeople];
    combined.forEach(person => {
      const isChecked = checkedPeople.includes(person);
      
      const itemEl = document.createElement('label');
      itemEl.className = `relation-item ${isChecked ? 'checked' : ''}`;
      itemEl.dataset.id = person.id;
      itemEl.dataset.name = person.name;
      
      itemEl.innerHTML = `
        <input type="checkbox" value="${person.id}" ${isChecked ? 'checked' : ''}>
        <span>${person.name} (${person.id})</span>
      `;
      
      itemEl.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) itemEl.classList.add('checked');
        else itemEl.classList.remove('checked');
        updateSelectedTags('people');
      });
      
      peopleList.appendChild(itemEl);
    });

    // Populate any arbitrary/custom related people not in standard database
    if (activeLayerItem && activeLayerItem.relatedPeople) {
      activeLayerItem.relatedPeople.forEach(ref => {
        const exists = db.some(p => p.id === ref || p.name === ref);
        if (!exists) {
          const itemEl = document.createElement('label');
          itemEl.className = `relation-item checked custom-relation-item`;
          itemEl.dataset.id = ref;
          itemEl.dataset.name = ref;
          
          itemEl.innerHTML = `
            <input type="checkbox" value="${ref}" checked>
            <span>${ref} (임의)</span>
          `;
          
          itemEl.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) itemEl.classList.add('checked');
            else itemEl.classList.remove('checked');
            updateSelectedTags('people');
          });
          peopleList.appendChild(itemEl);
        }
      });
    }
  }
  
  if (eventsList) {
    eventsList.innerHTML = '';
    
    const checkedEvents = [];
    const uncheckedEvents = [];
    
    events.forEach(ev => {
      if (currentItemType === 'event' && activeLayerItem && activeLayerItem.id === ev.id) return;
      
      const isChecked = activeLayerItem && activeLayerItem.relatedEvents && activeLayerItem.relatedEvents.includes(ev.id);
      if (isChecked) {
        checkedEvents.push(ev);
      } else {
        uncheckedEvents.push(ev);
      }
    });
    
    checkedEvents.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    uncheckedEvents.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
    const combined = [...checkedEvents, ...uncheckedEvents];
    combined.forEach(ev => {
      const isChecked = checkedEvents.includes(ev);
      
      const itemEl = document.createElement('label');
      itemEl.className = `relation-item ${isChecked ? 'checked' : ''}`;
      itemEl.dataset.id = ev.id;
      itemEl.dataset.name = ev.name;
      
      itemEl.innerHTML = `
        <input type="checkbox" value="${ev.id}" ${isChecked ? 'checked' : ''}>
        <span>${ev.name}</span>
      `;
      
      itemEl.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) itemEl.classList.add('checked');
        else itemEl.classList.remove('checked');
        updateSelectedTags('events');
      });
      
      eventsList.appendChild(itemEl);
    });

    // Populate any arbitrary/custom related events not in standard list
    if (activeLayerItem && activeLayerItem.relatedEvents) {
      activeLayerItem.relatedEvents.forEach(ref => {
        const exists = events.some(e => e.id === ref || e.name === ref);
        if (!exists) {
          const itemEl = document.createElement('label');
          itemEl.className = `relation-item checked custom-relation-item`;
          itemEl.dataset.id = ref;
          itemEl.dataset.name = ref;
          
          itemEl.innerHTML = `
            <input type="checkbox" value="${ref}" checked>
            <span>${ref} (임의)</span>
          `;
          
          itemEl.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) itemEl.classList.add('checked');
            else itemEl.classList.remove('checked');
            updateSelectedTags('events');
          });
          eventsList.appendChild(itemEl);
        }
      });
    }
  }
  
  if (locationsList) {
    locationsList.innerHTML = '';
    
    const checkedLocations = [];
    const uncheckedLocations = [];
    
    locations.forEach(loc => {
      if (currentItemType === 'location' && activeLayerItem && activeLayerItem.id === loc.id) return;
      
      const isChecked = activeLayerItem && activeLayerItem.relatedLocations && activeLayerItem.relatedLocations.includes(loc.id);
      if (isChecked) {
        checkedLocations.push(loc);
      } else {
        uncheckedLocations.push(loc);
      }
    });
    
    checkedLocations.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    uncheckedLocations.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
    const combined = [...checkedLocations, ...uncheckedLocations];
    combined.forEach(loc => {
      const isChecked = checkedLocations.includes(loc);
      
      const itemEl = document.createElement('label');
      itemEl.className = `relation-item ${isChecked ? 'checked' : ''}`;
      itemEl.dataset.id = loc.id;
      itemEl.dataset.name = loc.name;
      
      itemEl.innerHTML = `
        <input type="checkbox" value="${loc.id}" ${isChecked ? 'checked' : ''}>
        <span>${loc.name}</span>
      `;
      
      itemEl.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) itemEl.classList.add('checked');
        else itemEl.classList.remove('checked');
        updateSelectedTags('locations');
      });
      
      locationsList.appendChild(itemEl);
    });

    // Populate any arbitrary/custom related locations not in standard list
    if (activeLayerItem && activeLayerItem.relatedLocations) {
      activeLayerItem.relatedLocations.forEach(ref => {
        const exists = locations.some(l => l.id === ref || l.name === ref);
        if (!exists) {
          const itemEl = document.createElement('label');
          itemEl.className = `relation-item checked custom-relation-item`;
          itemEl.dataset.id = ref;
          itemEl.dataset.name = ref;
          
          itemEl.innerHTML = `
            <input type="checkbox" value="${ref}" checked>
            <span>${ref} (임의)</span>
          `;
          
          itemEl.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) itemEl.classList.add('checked');
            else itemEl.classList.remove('checked');
            updateSelectedTags('locations');
          });
          locationsList.appendChild(itemEl);
        }
      });
    }
  }
}

function updateSelectedTags(type) {
  const listContainer = document.getElementById(`layer-item-${type}-list`);
  const tagsContainer = document.getElementById(`layer-item-${type}-tags`);
  if (!listContainer || !tagsContainer) return;
  
  tagsContainer.innerHTML = '';
  
  const checkedCheckboxes = listContainer.querySelectorAll('input[type="checkbox"]:checked');
  checkedCheckboxes.forEach(cb => {
    const parent = cb.closest('.relation-item');
    const name = parent ? parent.dataset.name : cb.value;
    const val = cb.value;
    
    const tag = document.createElement('span');
    tag.className = 'relation-tag';
    tag.innerHTML = `
      <span>${name}</span>
      <span class="relation-tag-remove" data-val="${val}">&times;</span>
    `;
    
    tag.querySelector('.relation-tag-remove').addEventListener('click', (e) => {
      const valueToUncheck = e.target.dataset.val;
      const checkbox = listContainer.querySelector(`input[type="checkbox"][value="${valueToUncheck}"]`);
      if (checkbox) {
        checkbox.checked = false;
        const event = new Event('change');
        checkbox.dispatchEvent(event);
      }
    });
    
    tagsContainer.appendChild(tag);
  });
}

function setupLayerItemModalEvents() {
  if (layerItemModalClose) {
    layerItemModalClose.addEventListener('click', () => {
      layerItemModal.style.display = 'none';
    });
  }
  if (layerItemModalCancel) {
    layerItemModalCancel.addEventListener('click', () => {
      layerItemModal.style.display = 'none';
    });
  }
  
  // Setup searches
  const peopleSearch = document.getElementById('layer-item-people-search');
  const eventsSearch = document.getElementById('layer-item-events-search');
  const locationsSearch = document.getElementById('layer-item-locations-search');
  
  peopleSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll('#layer-item-people-list .relation-item');
    items.forEach(item => {
      const name = item.dataset.name.toLowerCase();
      const id = item.dataset.id.toLowerCase();
      if (name.includes(query) || id.includes(query)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
  peopleSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (!val) return;
      
      const list = document.getElementById('layer-item-people-list');
      let checkbox = list.querySelector(`input[type="checkbox"][value="${val}"]`);
      if (!checkbox) {
        const itemEl = document.createElement('label');
        itemEl.className = `relation-item checked custom-relation-item`;
        itemEl.dataset.id = val;
        itemEl.dataset.name = val;
        itemEl.innerHTML = `
          <input type="checkbox" value="${val}" checked>
          <span>${val} (임의)</span>
        `;
        itemEl.querySelector('input').addEventListener('change', (ev) => {
          if (ev.target.checked) itemEl.classList.add('checked');
          else itemEl.classList.remove('checked');
          updateSelectedTags('people');
        });
        list.appendChild(itemEl);
        checkbox = itemEl.querySelector('input');
      } else {
        checkbox.checked = true;
        checkbox.closest('.relation-item').classList.add('checked');
      }
      updateSelectedTags('people');
      e.target.value = '';
      list.querySelectorAll('.relation-item').forEach(item => item.style.display = '');
    }
  });
  
  eventsSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll('#layer-item-events-list .relation-item');
    items.forEach(item => {
      const name = item.dataset.name.toLowerCase();
      const id = item.dataset.id.toLowerCase();
      if (name.includes(query) || id.includes(query)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
  eventsSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (!val) return;
      
      const list = document.getElementById('layer-item-events-list');
      let checkbox = list.querySelector(`input[type="checkbox"][value="${val}"]`);
      if (!checkbox) {
        const itemEl = document.createElement('label');
        itemEl.className = `relation-item checked custom-relation-item`;
        itemEl.dataset.id = val;
        itemEl.dataset.name = val;
        itemEl.innerHTML = `
          <input type="checkbox" value="${val}" checked>
          <span>${val} (임의)</span>
        `;
        itemEl.querySelector('input').addEventListener('change', (ev) => {
          if (ev.target.checked) itemEl.classList.add('checked');
          else itemEl.classList.remove('checked');
          updateSelectedTags('events');
        });
        list.appendChild(itemEl);
        checkbox = itemEl.querySelector('input');
      } else {
        checkbox.checked = true;
        checkbox.closest('.relation-item').classList.add('checked');
      }
      updateSelectedTags('events');
      e.target.value = '';
      list.querySelectorAll('.relation-item').forEach(item => item.style.display = '');
    }
  });
  
  locationsSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll('#layer-item-locations-list .relation-item');
    items.forEach(item => {
      const name = item.dataset.name.toLowerCase();
      const id = item.dataset.id.toLowerCase();
      if (name.includes(query) || id.includes(query)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
  locationsSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (!val) return;
      
      const list = document.getElementById('layer-item-locations-list');
      let checkbox = list.querySelector(`input[type="checkbox"][value="${val}"]`);
      if (!checkbox) {
        const itemEl = document.createElement('label');
        itemEl.className = `relation-item checked custom-relation-item`;
        itemEl.dataset.id = val;
        itemEl.dataset.name = val;
        itemEl.innerHTML = `
          <input type="checkbox" value="${val}" checked>
          <span>${val} (임의)</span>
        `;
        itemEl.querySelector('input').addEventListener('change', (ev) => {
          if (ev.target.checked) itemEl.classList.add('checked');
          else itemEl.classList.remove('checked');
          updateSelectedTags('locations');
        });
        list.appendChild(itemEl);
        checkbox = itemEl.querySelector('input');
      } else {
        checkbox.checked = true;
        checkbox.closest('.relation-item').classList.add('checked');
      }
      updateSelectedTags('locations');
      e.target.value = '';
      list.querySelectorAll('.relation-item').forEach(item => item.style.display = '');
    }
  });

  if (layerItemDeleteBtn) {
    layerItemDeleteBtn.addEventListener('click', () => {
      if (!activeLayerItem || !activeLayerType) return;
      if (!confirm(`정말 이 ${activeLayerType === 'event' ? '사건' : '장소'}을 삭제하시겠습니까?`)) return;
      
      pushHistoryState();
      if (activeLayerType === 'event') {
        events = events.filter(e => e.id !== activeLayerItem.id);
        saveEvents();
        renderEvents();
      } else {
        locations = locations.filter(l => l.id !== activeLayerItem.id);
        saveLocations();
        renderLocations();
      }
      autoSaveToServer();
      layerItemModal.style.display = 'none';
      activeLayerItem = null;
      activeLayerType = null;
      showToast("삭제되었습니다.");
    });
  }
  if (layerItemForm) {
    layerItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeLayerType) return;
      
      const nameVal = document.getElementById('layer-item-name').value.trim();
      const descVal = document.getElementById('layer-item-desc').value.trim();
      const refsVal = document.getElementById('layer-item-refs').value.trim();
      
      const refsArray = refsVal.split(',').map(r => r.trim()).filter(r => r.length > 0);
      
      // Get checkboxes checked
      let checkedPeople = Array.from(document.querySelectorAll('#layer-item-people-list input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      let checkedEvents = Array.from(document.querySelectorAll('#layer-item-events-list input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      let checkedLocations = Array.from(document.querySelectorAll('#layer-item-locations-list input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      
      let dbChanged = false;
      checkedPeople = checkedPeople.map(val => {
        const matched = db.find(p => p.id === val || p.name === val);
        if (matched) return matched.id;
        
        const newId = 'person-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        const newPerson = {
          id: newId,
          name: val,
          engName: '',
          gender: 'M',
          generation: activeLayerItem && activeLayerItem.generation ? activeLayerItem.generation : 20,
          column: activeLayerItem && activeLayerItem.column ? activeLayerItem.column : 0,
          parents: [],
          spouses: [],
          desc: "자동 생성된 인물",
          isMain: false,
          isManual: true
        };
        db.push(newPerson);
        dbChanged = true;
        return newId;
      });
      if (dbChanged) {
        saveDatabase();
      }

      let eventsChanged = false;
      checkedEvents = checkedEvents.map(val => {
        const matched = events.find(e => e.id === val || e.name === val);
        if (matched) return matched.id;
        
        const newId = 'ev-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        const newEvent = {
          id: newId,
          name: val,
          desc: "자동 생성된 사건",
          refs: [],
          relatedPeople: [],
          x: 5000,
          y: 5000
        };
        events.push(newEvent);
        eventsChanged = true;
        return newId;
      });
      if (eventsChanged) {
        saveEvents();
      }

      let locationsChanged = false;
      checkedLocations = checkedLocations.map(val => {
        const matched = locations.find(l => l.id === val || l.name === val);
        if (matched) return matched.id;
        
        const newId = 'loc-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        const newLocation = {
          id: newId,
          name: val,
          desc: "자동 생성된 장소",
          refs: [],
          relatedPeople: [],
          x: 5000,
          y: 5000
        };
        locations.push(newLocation);
        locationsChanged = true;
        return newId;
      });
      if (locationsChanged) {
        saveLocations();
      }
      
      pushHistoryState();
      
      if (isLayerItemAddMode) {
        const newId = (activeLayerType === 'event' ? 'ev-' : 'loc-') + Date.now();
        const newItem = {
          id: newId,
          name: nameVal,
          desc: descVal,
          refs: refsArray,
          relatedPeople: checkedPeople,
          x: Math.round(newLayerItemCoords.x),
          y: Math.round(newLayerItemCoords.y)
        };
        
        if (activeLayerType === 'event') {
          newItem.relatedLocations = checkedLocations;
          events.push(newItem);
          saveEvents();
          
          // Auto toggle events layer on
          const toggleLayer = document.getElementById('toggle-layer-events');
          if (toggleLayer && !toggleLayer.checked) {
            toggleLayer.checked = true;
            const layer = document.getElementById('layer-events');
            if (layer) layer.style.display = '';
          }
          
          renderEvents();
          showToast("📜 새 사건이 추가되었습니다.");
        } else {
          newItem.relatedEvents = checkedEvents;
          locations.push(newItem);
          saveLocations();
          
          // Auto toggle locations layer on
          const toggleLayer = document.getElementById('toggle-layer-locations');
          if (toggleLayer && !toggleLayer.checked) {
            toggleLayer.checked = true;
            const layer = document.getElementById('layer-locations');
            if (layer) layer.style.display = '';
          }
          
          renderLocations();
          showToast("📍 새 장소가 추가되었습니다.");
        }
      } else {
        // Edit Mode
        if (!activeLayerItem) return;
        
        if (activeLayerType === 'annotation') {
          activeLayerItem.relatedPeople = checkedPeople;
          activeLayerItem.relatedEvents = checkedEvents;
          activeLayerItem.relatedLocations = checkedLocations;
          saveAnnotations();
          showToast("텍스트 상자 관계가 저장되었습니다.");
        } else {
          activeLayerItem.name = nameVal;
          activeLayerItem.desc = descVal;
          activeLayerItem.refs = refsArray;
          activeLayerItem.relatedPeople = checkedPeople;
          
          if (activeLayerType === 'event') {
            activeLayerItem.relatedLocations = checkedLocations;
            saveEvents();
            renderEvents();
          } else {
            activeLayerItem.relatedEvents = checkedEvents;
            saveLocations();
            renderLocations();
          }
          showToast("수정되었습니다.");
        }
      }
      
      updateTransform();
      if (dbChanged) {
        renderTree();
      }
      layerItemModal.style.display = 'none';
      activeLayerItem = null;
      activeLayerType = null;
      isLayerItemAddMode = false;
      autoSaveToServer();
    });
  }
}

// Layer Toggle Listeners
document.getElementById('toggle-layer-people')?.addEventListener('change', () => {
  applyFilters();
});
document.getElementById('toggle-layer-events')?.addEventListener('change', () => {
  applyFilters();
});
document.getElementById('toggle-layer-locations')?.addEventListener('change', () => {
  applyFilters();
});
document.getElementById('toggle-layer-polygons')?.addEventListener('change', () => {
  applyFilters();
});

document.getElementById('toggle-layer-prophets')?.addEventListener('change', () => {
  applyFilters();
});

document.getElementById('toggle-relationship-highlight')?.addEventListener('change', (e) => {
  if (!e.target.checked) {
    clearAllHighlights();
  }
});

// ==========================================
// Desktop App Licensing (DRM) Logic
// ==========================================

function getOrCreateMachineId() {
  let machineId = localStorage.getItem('bible_genealogy_machine_id');
  if (!machineId) {
    machineId = 'device-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    localStorage.setItem('bible_genealogy_machine_id', machineId);
  }
  return machineId;
}

async function checkLicenseAndInit() {
  const isCapacitor = !!window.Capacitor || window.location.protocol.startsWith('capacitor');
  const isDesktopApp = window.location.protocol.startsWith('tauri') || 
                       window.location.protocol.startsWith('asset') || 
                       window.location.protocol.startsWith('file') || 
                       (window.API_BASE_URL && window.API_BASE_URL.length > 0);
                       
  if (isCapacitor) {
    return true; // Skip license check on mobile apps
  }
  if (!isDesktopApp) {
    return true; // Not running in desktop mode, bypass
  }

  const machineId = getOrCreateMachineId();
  const licenseKey = localStorage.getItem('bible_genealogy_license_key');

  if (!licenseKey) {
    showLicenseLock("프로그램 인증이 필요합니다. 발급받으신 라이선스 키를 입력해 주세요.");
    return false;
  }

  if (licenseKey === 'KEY-OPEN-BIBLE-TREE') {
    document.getElementById('desktop-license-modal').style.display = 'none';
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.display = 'flex';
    return true;
  }

  try {
    const apiBase = window.API_BASE_URL || "";
    const res = await fetch(apiBase + '/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, machineId })
    });
    if (res.ok) {
      document.getElementById('desktop-license-modal').style.display = 'none';
      const appContainer = document.getElementById('app-container');
      if (appContainer) appContainer.style.display = 'flex';
      return true;
    } else {
      const data = await res.json();
      localStorage.removeItem('bible_genealogy_license_key');
      showLicenseLock(data.error || "라이선스가 유효하지 않거나 한도를 초과했습니다.");
      return false;
    }
  } catch (e) {
    // Offline fallback if license key exists in local storage
    console.warn("Network error during license check, running offline.", e);
    document.getElementById('desktop-license-modal').style.display = 'none';
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.display = 'flex';
    return true;
  }
}

function showLicenseLock(message) {
  document.getElementById('desktop-license-modal').style.display = 'flex';
  document.getElementById('license-message').innerText = message || "";
  
  if (authModal) authModal.style.display = 'none';
  const appContainer = document.getElementById('app-container');
  if (appContainer) appContainer.style.display = 'none';
}

// Bind Submit License Key Click
document.getElementById('license-submit-btn')?.addEventListener('click', async () => {
  const input = document.getElementById('license-key-input');
  const licenseKey = input.value.trim().toUpperCase();
  const messageEl = document.getElementById('license-message');
  
  if (!licenseKey) {
    messageEl.innerText = "라이선스 키를 입력해 주세요.";
    return;
  }

  if (licenseKey === 'KEY-OPEN-BIBLE-TREE') {
    localStorage.setItem('bible_genealogy_license_key', licenseKey);
    messageEl.innerText = "인증에 성공했습니다! 프로그램을 로딩합니다.";
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return;
  }

  messageEl.innerText = "인증 중...";
  const machineId = getOrCreateMachineId();

  try {
    const apiBase = window.API_BASE_URL || "";
    const res = await fetch(apiBase + '/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, machineId })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('bible_genealogy_license_key', licenseKey);
      messageEl.innerText = "인증에 성공했습니다! 프로그램을 로딩합니다.";
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      messageEl.innerText = data.error || "인증 실패";
    }
  } catch (e) {
    messageEl.innerText = "서버 연결 실패. 네트워크 상태를 확인하세요.";
  }
});

// ==========================================
// Admin License Panel Tab Logic
// ==========================================

const adminTabUsers = document.getElementById('admin-tab-users');
const adminTabLicenses = document.getElementById('admin-tab-licenses');
const adminUsersTabContent = document.getElementById('admin-users-tab-content');
const adminLicensesTabContent = document.getElementById('admin-licenses-tab-content');

if (adminTabUsers) {
  adminTabUsers.addEventListener('click', () => {
    adminTabUsers.style.background = '#3b82f6';
    adminTabLicenses.style.background = '#64748b';
    adminUsersTabContent.style.display = 'block';
    adminLicensesTabContent.style.display = 'none';
  });
}

if (adminTabLicenses) {
  adminTabLicenses.addEventListener('click', () => {
    adminTabLicenses.style.background = '#ef4444';
    adminTabUsers.style.background = '#64748b';
    adminUsersTabContent.style.display = 'none';
    adminLicensesTabContent.style.display = 'block';
    loadAdminLicenses();
  });
}

async function loadAdminLicenses() {
  if (!userToken) return;
  const listBody = document.getElementById('admin-license-list-body');
  listBody.innerHTML = '<tr><td colspan="5" style="padding:10px; text-align:center;">로딩 중...</td></tr>';
  
  try {
    const apiBase = window.API_BASE_URL || "";
    const res = await fetch(apiBase + '/api/admin/licenses', { headers: { 'Authorization': 'Bearer ' + userToken } });
    const data = await res.json();
    if (!res.ok) {
      listBody.innerHTML = `<tr><td colspan="5" style="padding:10px; text-align:center; color:#ef4444;">${data.error || '목록을 불러오지 못했습니다.'}</td></tr>`;
      return;
    }
    
    listBody.innerHTML = '';
    const keys = Object.keys(data.licenses);
    if (keys.length === 0) {
      listBody.innerHTML = '<tr><td colspan="5" style="padding:10px; text-align:center;">발급된 라이선스가 없습니다.</td></tr>';
      return;
    }
    
    keys.forEach(key => {
      const lic = data.licenses[key];
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e2e8f0';
      
      const devCount = lic.registeredDevices.length;
      const maxDev = lic.maxDevices || 2;
      
      tr.innerHTML = `
        <td style="padding:10px; font-weight:bold; font-family:monospace; display:flex; align-items:center; gap:8px;">
          <span>${key}</span>
          <button onclick="copyToClipboard('${key}')" style="background:#cbd5e1; color:#1e293b; border:none; padding:2px 6px; cursor:pointer; font-weight:600; border-radius:4px; font-size:10px;" onmouseover="this.style.background='#94a3b8'" onmouseout="this.style.background='#cbd5e1'">복사</button>
        </td>
        <td style="padding:10px;">${lic.owner}</td>
        <td style="padding:10px;">${lic.expiryDate ? lic.expiryDate : '무제한'}</td>
        <td style="padding:10px;">${devCount} / ${maxDev} 대</td>
        <td style="padding:10px; display:flex; gap:5px;">
          <button onclick="resetLicenseKey('${key}')" style="background:#e67e22; color:white; border:none; padding:4px 8px; cursor:pointer; font-weight:bold; border-radius:4px; font-size:12px;">기기 리셋</button>
          <button onclick="deleteLicenseKey('${key}')" style="background:#ef4444; color:white; border:none; padding:4px 8px; cursor:pointer; font-weight:bold; border-radius:4px; font-size:12px;">삭제</button>
        </td>
      `;
      listBody.appendChild(tr);
    });
  } catch (e) {
    listBody.innerHTML = '<tr><td colspan="5" style="padding:10px; text-align:center; color:#ef4444;">서버 연결 오류</td></tr>';
  }
}

// Generate New License Key Click
document.getElementById('new-license-btn')?.addEventListener('click', async () => {
  const ownerInput = document.getElementById('new-license-owner');
  const devInput = document.getElementById('new-license-devices');
  const expiryInput = document.getElementById('new-license-expiry');
  const owner = ownerInput.value.trim();
  const maxDevices = devInput.value;
  const expiryDate = expiryInput ? expiryInput.value : '';
  
  if (!owner) {
    alert("소유자 이름을 입력해 주세요.");
    return;
  }
  
  try {
    const apiBase = window.API_BASE_URL || "";
    const res = await fetch(apiBase + '/api/admin/licenses/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ owner, maxDevices, expiryDate })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`새 라이선스가 발급되었습니다!\n키: ${data.licenseKey}`);
      ownerInput.value = '';
      if (expiryInput) expiryInput.value = '';
      loadAdminLicenses();
    } else {
      alert(data.error || "발급 실패");
    }
  } catch (e) {
    alert("서버 연결 실패");
  }
});

window.resetLicenseKey = async function(licenseKey) {
  if (!confirm(`이 라이선스 키(${licenseKey})에 인증 등록된 모든 기기들을 리셋하시겠습니까?\n이후 기존 기기를 포함한 새로운 2대에서 재등록할 수 있습니다.`)) return;
  try {
    const apiBase = window.API_BASE_URL || "";
    const res = await fetch(apiBase + '/api/admin/licenses/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ licenseKey })
    });
    if (res.ok) {
      alert("등록 기기 초기화 완료!");
      loadAdminLicenses();
    } else {
      const data = await res.json();
      alert(data.error || "리셋 실패");
    }
  } catch (e) {
    alert("서버 연결 실패");
  }
};

window.deleteLicenseKey = async function(licenseKey) {
  if (!confirm(`이 라이선스 키(${licenseKey})를 영구히 삭제하시겠습니까?\n이 키로 설치된 기존 프로그램들은 더 이상 인증되지 않고 잠기게 됩니다.`)) return;
  try {
    const apiBase = window.API_BASE_URL || "";
    const res = await fetch(apiBase + '/api/admin/licenses', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ licenseKey })
    });
    if (res.ok) {
      alert("라이선스 삭제 완료!");
      loadAdminLicenses();
    } else {
      const data = await res.json();
      alert(data.error || "삭제 실패");
    }
  } catch (e) {
    alert("서버 연결 실패");
  }
};

function applyLocalization() {
  const langToggleText = document.getElementById('lang-toggle-text');
  if (langToggleText) {
    langToggleText.textContent = currentLang.toUpperCase();
  }

  const texts = UI_TEXTS[currentLang];
  document.title = texts.app_title || "열린족보이야기";

  const elementsToTranslate = {
    'searchInput': { attr: 'placeholder', key: 'search_placeholder' },
    'zoom-in': { attr: 'title', key: 'zoom_in_title' },
    'zoom-out': { attr: 'title', key: 'zoom_out_title' },
    'zoom-reset': { attr: 'title', key: 'zoom_reset_title' },
    'theme-toggle': { attr: 'title', key: 'theme_toggle_title' },
    'filter-panel-toggle': { attr: 'title', key: 'filter_panel_title' },
    'help-guide-btn': { attr: 'title', key: 'help_guide_title' },
    'bottom-backup-btn': { attr: 'title', key: 'backup_title' },
    'bottom-restore-btn': { attr: 'title', key: 'restore_title' },
    'admin-lock-btn': { attr: 'title', key: 'admin_lock_title' },
    'user-logout-btn': { attr: 'title', key: 'logout_title' },
    'note-text': { attr: 'placeholder', key: 'notes_placeholder' },
    'resource-title': { attr: 'placeholder', key: 'resource_desc_placeholder' },
    'resource-url': { attr: 'placeholder', key: 'resource_url_placeholder' },
    'resource-add-btn': { attr: 'textContent', key: 'resource_add_btn' },
    'notes-panel-title': { attr: 'textContent', key: 'notes_title' },
    'landing-title': { attr: 'textContent', key: 'app_title' },
    'auth-title': { attr: 'textContent', key: 'app_title' },
    'app-main-title': { attr: 'textContent', key: 'app_title' },
    'layer-panel-title': { attr: 'textContent', key: 'layer_panel_title' },
    'text-layer-people': { attr: 'textContent', key: 'layer_people' },
    'text-layer-events': { attr: 'textContent', key: 'layer_events' },
    'text-layer-locations': { attr: 'textContent', key: 'layer_locations' },
    'text-layer-polygons': { attr: 'textContent', key: 'layer_polygons' },
    'text-layer-prophets': { attr: 'textContent', key: 'layer_prophets' },
  };

  for (const [id, config] of Object.entries(elementsToTranslate)) {
    const el = document.getElementById(id);
    if (el && texts[config.key]) {
      if (config.attr === 'textContent') {
        el.textContent = texts[config.key];
      } else {
        el.setAttribute(config.attr, texts[config.key]);
      }
    }
  }

  // Update statistics dynamically to refresh text on language toggle
  if (typeof updateStats === 'function') {
    updateStats();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const isLicensed = await checkLicenseAndInit();
  if (!isLicensed) return;

  applyLocalization();

  const langToggleBtn = document.getElementById('lang-toggle');
  langToggleBtn?.addEventListener('click', () => {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    localStorage.setItem('bible_genealogy_lang', currentLang);
    applyLocalization();
    renderTree(); // Redraw the SVG tree with localized names/labels
  });

  const isCapacitor = !!window.Capacitor || window.location.protocol.startsWith('capacitor');
  const isDesktop = window.location.protocol.startsWith('tauri') || 
                    window.location.protocol.startsWith('asset') || 
                    window.location.protocol.startsWith('file') || 
                    isCapacitor ||
                    (window.API_BASE_URL && window.API_BASE_URL.length > 0);

  const landing = document.getElementById('landing-page');
  if (isDesktop) {
    if (landing) landing.style.display = 'none';
    if (userToken) {
      validateSession();
    } else {
      showAuthModal();
    }
  } else {
    // Web version: show landing page, hide auth modal
    if (landing) landing.style.display = 'flex';
    if (authModal) authModal.style.display = 'none';
    
    // If they already have a userToken (logged in on web), they can bypass the landing page
    if (userToken) {
      if (landing) landing.style.display = 'none';
      validateSession();
    }
  }
  
  // Make left panels draggable
  const layerPanel = document.querySelector('.layer-control-panel');
  if (layerPanel) makeElementDraggable(layerPanel, '.layer-bar-drag-handle');
  
  const adminPanel = document.getElementById('admin-actions-bar');
  if (adminPanel) makeElementDraggable(adminPanel, '.admin-bar-drag-handle');

  if (isAdminMode) {
    const toggleBtn = document.getElementById('spawner-panel-toggle-btn');
    if (toggleBtn) {
      toggleBtn.style.display = 'flex';
    }
  }

  // Spawner panel toggle and close logic
  const spawnerToggleBtn = document.getElementById('spawner-panel-toggle-btn');
  const spawnerPanel = document.getElementById('bottom-spawner-panel');
  const spawnerCloseBtn = document.getElementById('spawner-panel-close-btn');

  spawnerToggleBtn?.addEventListener('click', () => {
    spawnerToggleBtn.style.display = 'none';
    if (spawnerPanel) {
      spawnerPanel.style.display = 'flex';
      renderSpawnerPanel();
    }
  });

  spawnerCloseBtn?.addEventListener('click', () => {
    if (spawnerPanel) {
      spawnerPanel.style.display = 'none';
    }
    if (spawnerToggleBtn) {
      spawnerToggleBtn.style.display = 'flex';
    }
  });
  
  // Wire up mouse wheel horizontal scrolling for spawner containers
  document.querySelectorAll('.spawner-chips-container').forEach(container => {
    container.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  });
  
  // Wire up spawner search controls
  const searchInput = document.getElementById('spawner-search-input');
  const typeSelect = document.getElementById('spawner-custom-type');
  
  searchInput?.addEventListener('input', (e) => {
    renderSpawnerPanel(e.target.value);
  });
  
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (!val) return;
      
      const selectedVal = typeSelect ? typeSelect.value : 'location';
      let matchedItem = null;
      let matchedType = selectedVal;
      
      const cleanLocs = locations.map(l => ({ ...l, cleanName: l.name.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim() }));
      const cleanEvs = events.map(e => ({ ...e, cleanName: e.name.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim() }));
      
      if (selectedVal === 'event') {
        // Search events first
        const foundEv = cleanEvs.find(ev => ev.cleanName.toLowerCase() === val.toLowerCase());
        if (foundEv) {
          matchedItem = foundEv;
          matchedType = 'event';
        } else {
          const foundLoc = cleanLocs.find(l => l.cleanName.toLowerCase() === val.toLowerCase());
          if (foundLoc) {
            matchedItem = foundLoc;
            matchedType = 'location';
          }
        }
      } else {
        // Search locations first
        const foundLoc = cleanLocs.find(l => l.cleanName.toLowerCase() === val.toLowerCase());
        if (foundLoc) {
          matchedItem = foundLoc;
          matchedType = 'location';
        } else {
          const foundEv = cleanEvs.find(ev => ev.cleanName.toLowerCase() === val.toLowerCase());
          if (foundEv) {
            matchedItem = foundEv;
            matchedType = 'event';
          }
        }
      }
      
      if (!matchedItem) {
        // If not found in search, create a new custom item directly with the typed text!
        matchedItem = {
          name: val,
          desc: '',
          refs: [],
          relatedPeople: [],
          relatedEvents: [],
          relatedLocations: []
        };
        matchedType = selectedVal;
        showToast(`🛠️ '${val}' (${matchedType === 'event' ? '사건' : '장소'}) 직접 입력을 배치합니다.`);
      } else {
        // Prepare template from matched item
        matchedItem = { ...matchedItem, name: matchedItem.cleanName };
      }
      
      startPlacementMode(matchedItem, matchedType, searchInput);
    }
  });
});

function cancelPlacementMode() {
  activeSpawnerItem = null;
  activeSpawnerType = null;
  
  // Remove crosshair styling
  viewerContainer.classList.remove('placement-mode-active');
  
  // Remove active styling from chips
  document.querySelectorAll('.spawner-chip.active-tool').forEach(c => c.classList.remove('active-tool'));
  
  // Remove ghost cursor if exists
  const ghost = document.getElementById('spawner-ghost-marker');
  if (ghost) ghost.remove();
}

function startPlacementMode(item, type, element) {
  cancelPlacementMode(); // reset first
  
  activeSpawnerItem = item;
  activeSpawnerType = type;
  
  // Mark element as active tool
  if (element && element.classList) {
    element.classList.add('active-tool');
  }
  
  // Change cursor
  viewerContainer.classList.add('placement-mode-active');
  
  // Create ghost marker that follows cursor
  const ghost = document.createElement('div');
  ghost.id = 'spawner-ghost-marker';
  ghost.className = 'layer-marker ghost-marker';
  ghost.style.position = 'fixed';
  ghost.style.pointerEvents = 'none';
  ghost.style.zIndex = '9999';
  ghost.style.transform = 'translate(-50%, -50%)';
  
  const icon = type === 'event' ? '📜' : '📍';
  ghost.innerHTML = `
    <div class="marker-icon" style="background: #f59e0b; animation: none;">${icon}</div>
    <div class="marker-label" style="background: rgba(245, 158, 11, 0.95); color: #000; font-weight: bold; border-color: #f59e0b;">${item.name}</div>
  `;
  document.body.appendChild(ghost);
  
  const moveHandler = (e) => {
    if (!activeSpawnerItem) {
      document.removeEventListener('mousemove', moveHandler);
      return;
    }
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
  };
  document.addEventListener('mousemove', moveHandler);
  
  showToast("🛠️ 보드 위의 원하는 빈 공간을 클릭하면 장소/사건이 복사 배치됩니다.");
}

function renderSpawnerPanel(filterQuery = '') {
  const eventsList = document.getElementById('spawner-events-list');
  const locationsList = document.getElementById('spawner-locations-list');
  const query = (filterQuery || '').toLowerCase().trim();
  
  if (eventsList) {
    eventsList.innerHTML = '';
    
    // De-duplicate events by clean Korean name
    const uniqueEvents = [];
    const eventNames = new Set();
    DEFAULT_EVENTS.forEach(e => {
      const cleanName = e.name.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim();
      if (!eventNames.has(cleanName)) {
        eventNames.add(cleanName);
        uniqueEvents.push({ original: e, cleanName: cleanName });
      }
    });
    
    // Sort unique events by clean name
    uniqueEvents.sort((a, b) => a.cleanName.localeCompare(b.cleanName, 'ko'));
    
    uniqueEvents.forEach(item => {
      if (query && !item.cleanName.toLowerCase().includes(query)) return;
      
      const chip = document.createElement('div');
      chip.className = 'spawner-chip';
      chip.innerHTML = `<span>📜</span> <span>${item.cleanName}</span>`;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chip.classList.contains('active-tool')) {
          cancelPlacementMode();
        } else {
          const spawnTemplate = { ...item.original, name: item.cleanName };
          startPlacementMode(spawnTemplate, 'event', chip);
        }
      });
      eventsList.appendChild(chip);
    });
  }
  
  if (locationsList) {
    locationsList.innerHTML = '';
    
    // De-duplicate locations by clean Korean name
    const uniqueLocations = [];
    const locationNames = new Set();
    DEFAULT_LOCATIONS.forEach(l => {
      const cleanName = l.name.replace(/\s*\([A-Za-z0-9\s,\.'"-]+\)/g, '').trim();
      if (!locationNames.has(cleanName)) {
        locationNames.add(cleanName);
        uniqueLocations.push({ original: l, cleanName: cleanName });
      }
    });
    
    // Sort unique locations by clean name
    uniqueLocations.sort((a, b) => a.cleanName.localeCompare(b.cleanName, 'ko'));
    
    uniqueLocations.forEach(item => {
      if (query && !item.cleanName.toLowerCase().includes(query)) return;
      
      const chip = document.createElement('div');
      chip.className = 'spawner-chip';
      chip.innerHTML = `<span>📍</span> <span>${item.cleanName}</span>`;
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chip.classList.contains('active-tool')) {
          cancelPlacementMode();
        } else {
          const spawnTemplate = { ...item.original, name: item.cleanName };
          startPlacementMode(spawnTemplate, 'location', chip);
        }
      });
      locationsList.appendChild(chip);
    });
  }
}

// ==========================================
// DevTools Protection & Source Security
// ==========================================
(function() {
  let devToolsProtectionEnabled = true;

  // 1. Disable Right Click (except inside inputs)
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) {
      return;
    }
    e.preventDefault();
  });

  // 2. Disable Keyboard Shortcuts (F12, Source, Print, DevTools shortcuts, Copy/Cut/SelectAll on canvas)
  window.addEventListener('keydown', (e) => {
    const isMetaOrCtrl = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;
    
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.target.closest('[contenteditable="true"]');
    
    // F12 key
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // View Source: Ctrl+U / Cmd+Alt+U
    if (isMetaOrCtrl && (e.key === 'u' || e.key === 'U' || (isAlt && (e.key === 'u' || e.key === 'U')))) {
      e.preventDefault();
      return false;
    }
    
    // DevTools: Ctrl+Shift+I, J, C / Cmd+Alt+I, J, C
    if (isMetaOrCtrl && isShift && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      return false;
    }
    if (isMetaOrCtrl && isAlt && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      return false;
    }
    
    // Save Page: Ctrl+S / Cmd+S
    if (isMetaOrCtrl && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }

    // Print: Ctrl+P / Cmd+P
    if (isMetaOrCtrl && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      return false;
    }

    // Canvas Selection/Copy Blocks: Ctrl+C, Ctrl+X, Ctrl+A
    if (!isInput && isMetaOrCtrl && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      return false;
    }
  }, true);

  // 3. Disable Drag, Select, and Copy on non-inputs
  document.addEventListener('selectstart', (e) => {
    const targetEl = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
    if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (typeof targetEl.closest === 'function' && targetEl.closest('[contenteditable="true"]')))) return;
    e.preventDefault();
  });
  
  document.addEventListener('copy', (e) => {
    const targetEl = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
    if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (typeof targetEl.closest === 'function' && targetEl.closest('[contenteditable="true"]')))) return;
    e.preventDefault();
  });

  document.addEventListener('dragstart', (e) => {
    const targetEl = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
    if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.isContentEditable || (typeof targetEl.closest === 'function' && targetEl.closest('[contenteditable="true"]')))) return;
    e.preventDefault();
  });

  // 4. Print & Save as PDF Block
  window.addEventListener('beforeprint', (e) => {
    if (devToolsProtectionEnabled) {
      e.preventDefault();
      alert('보안 정책에 따라 인쇄 및 PDF 저장을 하실 수 없습니다.');
    }
  });

  // 5. Iframe Embedding prevention (Clickjacking)
  if (window.self !== window.top) {
    try {
      window.top.location = window.self.location;
    } catch (e) {
      window.self.location = 'about:blank';
    }
  }


  
  // 7. DevTools Debugger Loop (Freezes page execution if DevTools is open)
  function startDebuggerLoop() {
    function debug() {
      if (!devToolsProtectionEnabled) return;
      try {
        (function anonymous(one) {
          one = "debugger";
          return one;
        }(function() {}).constructor("debugger")());
      } catch (err) {}
      setTimeout(debug, 50);
    }
    debug();
  }
  startDebuggerLoop();
  
  // 8. Secret developer unlock code ("unlockdev")
  let inputBuffer = "";
  window.addEventListener('keydown', (e) => {
    if (e && e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      inputBuffer += e.key.toLowerCase();
      if (inputBuffer.length > 20) {
        inputBuffer = inputBuffer.substring(inputBuffer.length - 20);
      }
      
      if (inputBuffer.endsWith("unlockdev")) {
        devToolsProtectionEnabled = false;
        showToast("🔓 개발자용 보안 잠금이 해제되었습니다.");
        inputBuffer = "";
      }
    }
  });

  // 9. Warning message in console
  console.log(
    "%c🛑 경고: 저작권 보호 구역 %c\n이 웹사이트의 소스 코드와 데이터베이스는 저작권법의 보호를 받습니다. 무단 복제, 배포 및 수집(Scraping)은 법적 처벌을 받을 수 있습니다.",
    "color: red; font-size: 24px; font-weight: bold;",
    "color: inherit; font-size: 14px;"
  );
})();

function makeElementDraggable(el, handleSelector) {
  const handle = el.querySelector(handleSelector) || el;
  let isDragging = false;
  let startX, startY, startLeft, startTop;
  
  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
    
    e.stopPropagation(); // Stop event bubbling to prevent background board panning
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    startLeft = el.offsetLeft;
    startTop = el.offsetTop;
    
    el.style.position = 'absolute';
    el.style.left = `${startLeft}px`;
    el.style.top = `${startTop}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'none';
    
    e.preventDefault();
    
    const onMouseMove = (moveEvt) => {
      if (!isDragging) return;
      const dx = moveEvt.clientX - startX;
      const dy = moveEvt.clientY - startY;
      
      el.style.left = `${startLeft + dx}px`;
      el.style.top = `${startTop + dy}px`;
    };
    
    const onMouseUp = () => {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("라이선스 키가 클립보드에 복사되었습니다:\n" + text);
  }).catch(err => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("라이선스 키가 클립보드에 복사되었습니다:\n" + text);
    } catch (e) {
      alert("복사 실패 (직접 복사해 주세요): " + text);
    }
    document.body.removeChild(textArea);
  });
};

window.demoFeature = function(type) {
  // Hide landing page overlay
  const landing = document.getElementById('landing-page');
  if (landing) landing.style.display = 'none';
  
  // Set zoom scale
  currentScale = 0.8;
  
  // Setup 5-minute timer (300 seconds)
  if (window.demoTimeLeft === undefined) {
    window.demoTimeLeft = 300;
  }
  
  const updateTimerDisplay = () => {
    const min = Math.floor(window.demoTimeLeft / 60);
    const sec = String(window.demoTimeLeft % 60).padStart(2, '0');
    const timerSpan = document.getElementById('demo-timer-span');
    if (timerSpan) {
      timerSpan.innerText = ` (남은 시간: ${min}:${sec})`;
    }
  };

  // Inject demo banner if it doesn't exist
  let banner = document.getElementById('demo-mode-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'demo-mode-banner';
    banner.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 30px; z-index: 10000; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-family: sans-serif; font-size: 14px; color: #e2e8f0; display: flex; align-items: center; gap: 12px;';
    banner.innerHTML = `
      <span>💡 데모 체험 모드 실행 중<span id="demo-timer-span"></span></span>
      <button onclick="window.location.reload()" style="background: #0284c7; color: white; border: none; padding: 6px 14px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0284c7'">
        🏠 메인 화면으로
      </button>
    `;
    document.body.appendChild(banner);
  }

  updateTimerDisplay();

  if (!window.demoInterval) {
    window.demoInterval = setInterval(() => {
      window.demoTimeLeft--;
      updateTimerDisplay();
      if (window.demoTimeLeft <= 0) {
        clearInterval(window.demoInterval);
        window.demoInterval = null;
        alert("5분 데모 체험이 종료되었습니다. 계속 사용하시려면 데스크톱 앱을 다운로드하여 설치해 주세요.");
        window.location.reload();
      }
    }, 1000);
  }
  
  if (type === 'messiah') {
    // 1. Highlight Messiah line (Aura on Jesus)
    selectedPersonId = 'jesus';
    openStudyPanel('jesus');
    centerOnNode('jesus');
  } else if (type === 'memo') {
    // 2. Study Panel Memo demo (Open Abraham study panel and center)
    selectedPersonId = 'abraham';
    openStudyPanel('abraham');
    centerOnNode('abraham');
  } else if (type === 'filter') {
    // 3. Custom Tribe Filter demo (Enable Cain lineage filter, others are dimmed)
    activeFilters = { cain: true };
    localStorage.setItem('bible_tree_filters', JSON.stringify(activeFilters));
    applyFilters();
    centerOnNode('cain');
  }
};

function startPeriodicSync() {
  setInterval(async () => {
    const licenseKey = localStorage.getItem('bible_genealogy_license_key');
    if (!userToken && !licenseKey) return;
    
    try {
      const authHeader = userToken ? ('Bearer ' + userToken) : ('License ' + licenseKey);
      const res = await fetch(getApiUrl('/api/notes'), { headers: { 'Authorization': authHeader } });
      if (res.ok) {
        const data = await res.json();
        const serverNotes = data.notes || {};
        
        const serverNotesStr = JSON.stringify(serverNotes);
        const localNotesStr = JSON.stringify(userNotes);
        
        if (serverNotesStr !== localNotesStr) {
          const noteTextarea = document.getElementById('note-text');
          const isTextareaFocused = noteTextarea && (document.activeElement === noteTextarea);
          
          userNotes = serverNotes;
          localStorage.setItem('bible_tree_user_notes', JSON.stringify(userNotes));
          updateAllNoteBadges();
          triggerAutoBackup();
          
          if (noteTextarea && activePersonId && !isTextareaFocused) {
            noteTextarea.value = userNotes[activePersonId] || '';
          }
        }
      }
    } catch (e) {
      console.log("Periodic notes sync failed:", e);
    }
  }, 10000);
}

// Android Back Button Navigation for Capacitor
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    startPeriodicSync();
    setupAutoTranslationListeners();
    setupSettingsListeners();
    
    const App = window.Capacitor?.Plugins?.App;
    if (App) {
      App.addListener('backButton', () => {
        const studyPanel = document.getElementById('study-panel');
        const filterPanel = document.getElementById('filter-panel');
        
        if (studyPanel && studyPanel.classList.contains('active')) {
          closeStudyPanel();
        } else if (filterPanel && filterPanel.classList.contains('active')) {
          filterPanel.classList.remove('active');
        } else {
          App.exitApp();
        }
      });
    }
    
    // Prevent native iOS Safari/WKWebView viewport pinch-zoom gestures
    document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
    
    // Enable immediate :active pseudo-classes on iOS Safari/WKWebView
    document.addEventListener('touchstart', () => {}, { passive: true });
  });
}

async function translateKoToEnClient(text) {
  if (!text) return "";
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('').trim();
    }
  } catch (e) {
    console.error("Auto-translate error:", e);
  }
  return "";
}

function setupAutoTranslationListeners() {
  const formName = document.getElementById('form-name');
  const formEng = document.getElementById('form-eng');
  if (formName && formEng) {
    formName.addEventListener('blur', async () => {
      const val = formName.value.trim();
      const engVal = formEng.value.trim();
      if (val && !engVal) {
        const translated = await translateKoToEnClient(val);
        if (translated) formEng.value = translated;
      }
    });
  }

  const formDesc = document.getElementById('form-desc');
  const formEngDesc = document.getElementById('form-eng-desc');
  if (formDesc && formEngDesc) {
    formDesc.addEventListener('blur', async () => {
      const val = formDesc.value.trim();
      const engVal = formEngDesc.value.trim();
      if (val && !engVal) {
        const translated = await translateKoToEnClient(val);
        if (translated) formEngDesc.value = translated;
      }
    });
  }
}

function setupSettingsListeners() {
  const bottomSettingsBtn = document.getElementById('bottom-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingMdSync = document.getElementById('setting-md-sync');

  if (bottomSettingsBtn && settingsModal && settingsCloseBtn && settingMdSync) {
    // Load initial setting
    const isMdSyncEnabled = localStorage.getItem('bible_tree_md_sync') !== 'false';
    settingMdSync.checked = isMdSyncEnabled;

    bottomSettingsBtn.addEventListener('click', () => {
      // Refresh state on open
      settingMdSync.checked = localStorage.getItem('bible_tree_md_sync') !== 'false';
      settingsModal.style.display = 'flex';
    });

    settingsCloseBtn.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });

    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });

    settingMdSync.addEventListener('change', () => {
      const isChecked = settingMdSync.checked;
      localStorage.setItem('bible_tree_md_sync', isChecked ? 'true' : 'false');
      console.log("[환경설정] 마크다운 연동 변경됨:", isChecked);

      if (isChecked) {
        // Export notes immediately if switched back on
        triggerAutoBackup();
      }
    });
  }
}
