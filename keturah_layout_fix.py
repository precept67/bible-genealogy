import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# 1. Update columns for Keturah's family
column_updates = {
    "keturah": -19.0,
    "zimran": -24.0,
    "jokshan": -22.0,
    "medan": -20.0,
    "midian": -17.5,
    "ishbak": -15.0,
    "shuah": -13.5,
    "sheba_keturah": -23.0,
    "dedan_keturah": -21.0,
    "asshurim": -22.0,
    "letushim": -21.0,
    "leummim": -20.0,
    "ephah": -19.0,
    "epher_midian": -18.0,
    "hanoch_midian": -17.0,
    "abida": -16.0,
    "eldaah": -15.0
}

for c_id, col in column_updates.items():
    if c_id in char_map:
        old_col = char_map[c_id].get('column', 0)
        char_map[c_id]['column'] = col
        print(f"Shifted {char_map[c_id]['name']} ({c_id}) column: {old_col} -> {col}")

# 2. Delete custom line bends for Keturah's spouse/relationship lines
line_bends = data.get('lineBends', {})
keys_to_delete = ['rel-abraham+keturah', 'spouse-abraham+keturah']
for key in keys_to_delete:
    if key in line_bends:
        del line_bends[key]
        print(f"Deleted custom line bend: {key}")

# 3. Update poly-keturah coordinates
custom_polygons = data.get('customPolygons', [])
for poly in custom_polygons:
    if poly['id'] == 'poly-keturah':
        poly['points'] = [
            {'x': 9870, 'y': 3050},
            {'x': 12630, 'y': 3050},
            {'x': 12630, 'y': 3550},
            {'x': 9870, 'y': 3550}
        ]
        print("Updated poly-keturah coordinates to align with new columns.")

# Save database
data['db'] = db
data['lineBends'] = line_bends
data['customPolygons'] = custom_polygons

with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nKeturah's family layout successfully reorganized and saved!")
