import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
custom_polygons = data.get('customPolygons', [])

# 1. Move 51 characters from customPolygons to db if they are in customPolygons
characters_to_move = [c for c in custom_polygons if 'points' not in c]
remaining_polygons = [c for c in custom_polygons if 'points' in c]

if len(characters_to_move) > 0:
    print(f"Moving {len(characters_to_move)} characters from customPolygons to db.")
    db.extend(characters_to_move)
    data['db'] = db
    data['customPolygons'] = remaining_polygons
else:
    print("No characters to move from customPolygons (already moved or none present).")

char_map = {c['id']: c for c in db}

# 2. Add missing Gideon's Wife node
if 'gideon_wife' not in char_map:
    gideon_wife_node = {
        "id": "gideon_wife",
        "name": "기드온의 아내들",
        "engName": "Gideon's wives",
        "gender": "F",
        "generation": 25.5,
        "column": 44.0,
        "parents": [],
        "spouses": ["gideon_man"],
        "desc": "기드온의 많은 아내들 (사사기 8:30).",
        "isMain": False,
        "isManual": True,
        "teachers": []
    }
    db.append(gideon_wife_node)
    char_map['gideon_wife'] = gideon_wife_node
    print("Added missing node: gideon_wife (Gideon's wives)")

# 3. Fix empty English name for ID 'Son'
if 'Son' in char_map:
    char_map['Son']['engName'] = "Sons"
    print("Fixed empty engName for ID 'Son' -> 'Sons'")

# 4. Ensure mutual spouse links
for c in db:
    c_id = c['id']
    for s_id in c.get('spouses', []):
        if s_id in char_map:
            s_char = char_map[s_id]
            if c_id not in s_char.get('spouses', []):
                s_char.setdefault('spouses', []).append(c_id)
                print(f"Mutual spouse link added: {s_char['name']} ({s_id}) <-> {c['name']} ({c_id})")

# 5. Correct generation order anomalies
generation_fixes = {
    "nahor": 19.0,           # Nahor (brother of Abraham) -> Gen 19.0
    "haran": 19.0,            # Haran -> Gen 19.0
    "zimran": 20.0,          # Abraham's sons -> Gen 20.0
    "jokshan": 20.0,
    "medan": 20.0,
    "midian": 20.0,
    "ishbak": 20.0,
    "shuah": 20.0,
    "esau": 21.0,            # Esau -> Gen 21.0
    "edom": 21.0,            # Edom
    "sheba_keturah": 21.0,   # Keturah's grandchildren -> Gen 21.0
    "dedan_keturah": 21.0,
    "ephah": 21.0,
    "epher_midian": 21.0,
    "hanoch_midian": 21.0,
    "abida": 21.0,
    "eldaah": 21.0,
    "bethuel": 20.0,         # Bethuel -> Gen 20.0
    "moab": 21.0,            # Moab -> Gen 21.0
    "benammi": 21.0,         # Benammi -> Gen 21.0
    "asshurim": 22.0,        # Dedan's grandchildren -> Gen 22.0
    "letushim": 22.0,
    "leummim": 22.0,
    "eliphaz": 22.0,         # Esau's sons -> Gen 22.0
    "reuel": 22.0,
    "jeush": 22.0,
    "jalam": 22.0,
    "korah_edom": 22.0,
    "laban": 21.0,           # Laban -> Gen 21.0
    "rebekah_daughter": 21.0, # Rebekah -> Gen 21.0
    "teman": 23.0,           # Eliphaz's sons -> Gen 23.0
    "omar": 23.0,
    "zepho": 23.0,
    "gatam": 23.0,
    "kenaz": 23.0,
    "amalek": 23.0,
    "nahath": 23.0,          # Reuel's sons -> Gen 23.0
    "zerah_edom": 23.0,
    "shammah": 23.0,
    "mizzah": 23.0,
    "leah_daughter": 21.5,   # Leah -> Gen 21.5
    "rachel_daughter": 21.5  # Rachel -> Gen 21.5
}

for c_id, correct_gen in generation_fixes.items():
    if c_id in char_map:
        old_gen = char_map[c_id]['generation']
        char_map[c_id]['generation'] = correct_gen
        print(f"Corrected generation for {char_map[c_id]['name']} ({c_id}): {old_gen} -> {correct_gen}")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully cleaned and saved!")
