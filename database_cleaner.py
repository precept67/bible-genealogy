import json

with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

generation_fixes = {
    "leah_daughter": 21.5,
    "rachel_daughter": 21.5
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

print("\nLeah and Rachel generation fixed!")
