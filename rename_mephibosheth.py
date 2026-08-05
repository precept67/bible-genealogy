import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

target_id = "mephibosheth_saul"
if target_id in char_map:
    old_name = char_map[target_id]['name']
    char_map[target_id]['name'] = "므비보셋"
    print(f"Renamed {old_name} ({target_id}) -> 므비보셋")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
