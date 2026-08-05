import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# Shift: 300px to the left -> 300 / 240 = 1.25 columns left (subtract)
shift_amount = 1.25

ids_to_shift = ["armoni", "mephibosheth_saul"]

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
