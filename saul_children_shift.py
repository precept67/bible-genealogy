import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# List of Saul & Ahinoam's children and son-in-law to shift
ids_to_shift = [
    "jonathan",
    "malchishua_saul",
    "abinadab_saul",
    "ishbosheth",
    "eshbaal_saul",
    "merab_saul",
    "adriel",
    "michal_daughter"
]

# Shift: 150px to the left -> 150 / 240 = 0.625 columns left (subtract)
shift_amount = 0.625

for c_id in ids_to_shift:
    if c_id in char_map:
        old_col = char_map[c_id].get('column', 0)
        new_col = round(old_col - shift_amount, 4)
        char_map[c_id]['column'] = new_col
        print(f"Shifted {char_map[c_id]['name']} ({c_id}): {old_col} -> {new_col}")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
