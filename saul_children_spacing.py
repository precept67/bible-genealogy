import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# List of Saul's children (with Ahinoam) and son-in-law (Adriel) in horizontal order
ids_to_space = [
    "jonathan",
    "malchishua_saul",
    "abinadab_saul",
    "ishbosheth",
    "eshbaal_saul",
    "merab_saul",
    "adriel",
    "michal_daughter"
]

# Spacing calculation:
# Card width = 152px, target gap = 10px -> Center-to-center = 162px.
# 162px / 240px (COL_WIDTH) = 0.675 columns
spacing = 0.675
start_col = 64.0

for i, c_id in enumerate(ids_to_space):
    if c_id in char_map:
        new_col = round(start_col + i * spacing, 4)
        old_col = char_map[c_id].get('column', 0)
        char_map[c_id]['column'] = new_col
        print(f"Spaced {char_map[c_id]['name']} ({c_id}) column: {old_col} -> {new_col}")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nSaul's family columns successfully updated in database.json!")
