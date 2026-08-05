import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# List of Becher's children in order
children_ids = [
    "zemirah",
    "joash_becher",
    "eliezer",
    "elioenai",
    "omri_becher",
    "jerimoth_becher",
    "abijah_becher",
    "anathoth",
    "alemeth"
]

# Spacing calculation:
# Card width = 152px, target gap = 10px -> Center-to-center = 162px.
# 162px / 240px (COL_WIDTH) = 0.675 columns
spacing = 0.675
start_col = 62.5475

for i, c_id in enumerate(children_ids):
    if c_id in char_map:
        new_col = round(start_col + i * spacing, 4)
        old_col = char_map[c_id].get('column', 0)
        char_map[c_id]['column'] = new_col
        print(f"Spaced {char_map[c_id]['name']} ({c_id}) column: {old_col} -> {new_col}")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nBecher's children columns successfully updated in database.json!")
