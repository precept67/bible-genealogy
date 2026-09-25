import json, re

custom_locations = [
  {
    "id": "loc-1784790667582",
    "name": "홍해",
    "desc": "뒤쫓아오는 애굽 군대 앞에서 모세가 지팡이를 내밀어 밤새 동풍으로 바다를 가르고 마른 땅처럼 건넌 기적의 바다.",
    "refs": [
      "출애굽기 14:21",
      "출애굽기 14:22"
    ],
    "relatedEvents": [
      "ev-crossing_red_sea"
    ],
    "relatedPeople": [
      "moses",
      "aaron"
    ],
    "x": 10401,
    "y": 4554,
    "type": "water",
    "category": "water"
  },
  {
    "id": "loc-1784790981421",
    "name": "에덴동산",
    "desc": "인류 최초의 거처이자 생명나무와 선악을 알게 하는 나무가 있던 낙원.",
    "refs": [
      "창세기 2:8",
      "창세기 2:15"
    ],
    "relatedEvents": [
      "ev-eden_sin"
    ],
    "relatedPeople": [
      "adam",
      "eve"
    ],
    "x": 16128,
    "y": 75,
    "type": "region",
    "category": "region"
  },
  {
    "id": "loc-1784792563461",
    "name": "시날 평지",
    "desc": "노아의 후손들이 모여 바벨탑을 쌓으며 하나님께 대적했던 평원.",
    "refs": [
      "창세기 11:2"
    ],
    "relatedEvents": [
      "ev-babel_tower"
    ],
    "relatedPeople": [
      "noah"
    ],
    "x": 16558,
    "y": 2661,
    "type": "region",
    "category": "region"
  },
  {
    "id": "loc-1784792669341",
    "name": "하란",
    "desc": "아브라함의 아버지 데라가 머물다 죽은 곳이자 아브라함이 소명을 받고 떠난 땅.",
    "refs": [
      "창세기 11:31",
      "창세기 12:4"
    ],
    "relatedEvents": [
      "ev-abraham_haran"
    ],
    "relatedPeople": [
      "terah",
      "abraham",
      "sarah"
    ],
    "x": 16664,
    "y": 3406,
    "type": "city",
    "category": "city"
  },
  {
    "id": "loc-1784793488527",
    "name": "모리아산",
    "desc": "아브라함이 독자 이삭을 번제로 바치려 했던 산이자 훗날 솔로몬 성전이 건축된 장소.",
    "refs": [
      "창세기 22:2"
    ],
    "relatedEvents": [
      "ev-isaac_offering"
    ],
    "relatedPeople": [
      "abraham",
      "isaac"
    ],
    "x": 16446,
    "y": 3680,
    "type": "mountain",
    "category": "mountain"
  },
  {
    "id": "loc-1786029363695",
    "name": "예루살렘 성벽",
    "desc": "느헤미야 총독의 헌신과 이스라엘 백성들의 일치단결로 방해자들의 위협 속에서도 52일 만에 중건한 예루살렘 성벽 성곽.",
    "refs": [
      "느헤미야 2:17",
      "느헤미야 6:15"
    ],
    "relatedEvents": [
      "ev-walls_rebuild"
    ],
    "relatedPeople": [
      "zerubbabel"
    ],
    "x": 22077,
    "y": 7772,
    "type": "city",
    "category": "city"
  },
  {
    "id": "loc-1786033012492",
    "name": "애굽 고센 땅",
    "desc": "가나안 기근 때 요셉의 초청으로 입성한 야곱의 가족들이 정착하여 번성한 비옥한 목초지.",
    "refs": [
      "창세기 47:6"
    ],
    "relatedEvents": [
      "ev-goshen_migration"
    ],
    "relatedPeople": [
      "jacob",
      "joseph"
    ],
    "x": 16580,
    "y": 3940,
    "type": "region",
    "category": "region"
  }
]

loc_json = json.dumps(custom_locations, ensure_ascii=False)

# 1. Update database.json
with open('database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)
db['locations'] = custom_locations
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)
print('1. Updated database.json with 7 custom locations')

# 2. Update data_v16_v2.js
with open('data_v16_v2.js', 'r', encoding='utf-8') as f:
    djs = f.read()

# Replace DEFAULT_LOCATIONS
djs = re.sub(r'const DEFAULT_LOCATIONS = \[.*?\];', f'const DEFAULT_LOCATIONS = {loc_json};', djs, flags=re.DOTALL)

# Replace safeSeedArray('bible_tree_locations', ...) at the bottom
djs = re.sub(r"safeSeedArray\('bible_tree_locations',\s*\[.*?\]\);", f"safeSeedArray('bible_tree_locations', {loc_json});", djs, flags=re.DOTALL)

with open('data_v16_v2.js', 'w', encoding='utf-8') as f:
    f.write(djs)
print('2. Updated data_v16_v2.js with 7 custom locations and clean safeSeedArray')

# 3. Update app_v16_v2.js loadLocations to purge excess/cached map locations from localStorage
with open('app_v16_v2.js', 'r', encoding='utf-8') as f:
    ajs = f.read()

ajs = re.sub(r'const DEFAULT_LOCATIONS = \[.*?\];', f'const DEFAULT_LOCATIONS = {loc_json};', ajs, flags=re.DOTALL)

# Update loadLocations function to actively sanitize locations
new_load_locations = """function loadLocations() {
  const saved = localStorage.getItem('bible_tree_locations');
  if (saved && saved !== '[]') {
    try {
      let parsed = JSON.parse(saved);
      // If contaminated with the 1,500+ map places, purge them and reset to custom locations
      if (!Array.isArray(parsed) || parsed.length > 50 || parsed.some(l => l && l.id && (l.id.startsWith('loc-loc_') || l.id.startsWith('loc_')))) {
        parsed = JSON.parse(JSON.stringify(DEFAULT_LOCATIONS));
        localStorage.setItem('bible_tree_locations', JSON.stringify(parsed));
      }
      locations = parsed;
    } catch (e) {
      console.error("Failed to parse locations.", e);
      locations = JSON.parse(JSON.stringify(DEFAULT_LOCATIONS));
      localStorage.setItem('bible_tree_locations', JSON.stringify(locations));
    }
  } else {
    locations = JSON.parse(JSON.stringify(DEFAULT_LOCATIONS));
    localStorage.setItem('bible_tree_locations', JSON.stringify(locations));
  }
}"""

ajs = re.sub(r'function loadLocations\(\)\s*\{.*?function saveLocations\(\)', lambda m: new_load_locations + "\n\nfunction saveLocations()", ajs, flags=re.DOTALL)

with open('app_v16_v2.js', 'w', encoding='utf-8') as f:
    f.write(ajs)
print('3. Updated app_v16_v2.js loadLocations sanitization logic')

# 4. Update bible_map_viewer.html to completely hide/clean the attribution banner
with open('bible_map_viewer.html', 'r', encoding='utf-8') as f:
    mv = f.read()

# Disable Leaflet attribution control
mv = re.sub(r"attributionControl:\s*true", "attributionControl: false", mv)
if 'attributionControl: false' not in mv:
    mv = mv.replace("zoomControl: false,", "zoomControl: false,\n      attributionControl: false,")

# CSS: completely hide leaflet-control-attribution
attrib_css = """
    .leaflet-control-attribution {
      display: none !important;
    }
"""
mv = re.sub(r'/\* 전체 저작권/Attribution 완전 표시 스타일 \*/\s*\.leaflet-control-attribution\s*\{[^}]*\}', attrib_css, mv)
mv = re.sub(r'\.leaflet-control-attribution\s*\{[^}]*\}', attrib_css, mv)

with open('bible_map_viewer.html', 'w', encoding='utf-8') as f:
    f.write(mv)
print('4. Updated bible_map_viewer.html to completely remove attribution banner')
