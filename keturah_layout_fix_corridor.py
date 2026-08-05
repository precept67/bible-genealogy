import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# 1. Update columns for Keturah's family to fit in the -13.0 to -9.0 corridor
column_updates = {
    "keturah": -11.0,
    "zimran": -12.8,
    "jokshan": -12.1,
    "medan": -11.4,
    "midian": -10.7,
    "ishbak": -10.0,
    "shuah": -9.3,
    "sheba_keturah": -12.4,
    "dedan_keturah": -11.8,
    "asshurim": -12.4,
    "letushim": -11.8,
    "leummim": -11.2,
    "ephah": -10.9,
    "epher_midian": -10.5,
    "hanoch_midian": -10.1,
    "abida": -9.7,
    "eldaah": -9.3
}

for c_id, col in column_updates.items():
    if c_id in char_map:
        old_col = char_map[c_id].get('column', 0)
        char_map[c_id]['column'] = col
        print(f"Compressed {char_map[c_id]['name']} ({c_id}) column: {old_col} -> {col}")

# 2. Delete custom line bends for Keturah's spouse/relationship lines
line_bends = data.get('lineBends', {})
keys_to_delete = ['rel-abraham+keturah', 'spouse-abraham+keturah']
for key in keys_to_delete:
    if key in line_bends:
        del line_bends[key]
        print(f"Deleted custom line bend: {key}")

# 3. Update poly-keturah coordinates to match the corridor
custom_polygons = data.get('customPolygons', [])
for poly in custom_polygons:
    if poly['id'] == 'poly-keturah':
        poly['points'] = [
            {'x': 12630, 'y': 3050},
            {'x': 13590, 'y': 3050},
            {'x': 13590, 'y': 3550},
            {'x': 12630, 'y': 3550}
        ]
        print("Updated poly-keturah coordinates to align with new compressed corridor.")

# Save database
data['db'] = db
data['lineBends'] = line_bends
data['customPolygons'] = custom_polygons

with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nKeturah's family compressed corridor layout successfully saved!")
