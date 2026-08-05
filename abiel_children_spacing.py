import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# List of Abiel's children in order
children_ids = [
    "abdon_abiel",
    "zur_abiel",
    "baal_abiel",
    "ner",
    "nadab_abiel",
    "gedor_abiel",
    "ahio_abiel",
    "kish",
    "zecher_abiel",
    "mikloth_abiel",
    "shimeah_abiel"
]

# Spacing calculation:
# Card width = 152px, target gap = 20px -> Center-to-center = 172px.
# 172px / 240px (COL_WIDTH) = 0.716666...
spacing = 172.0 / 240.0 # ~0.716667
start_col = 61.0

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

print("\nAbiel's children columns successfully updated in database.json!")
