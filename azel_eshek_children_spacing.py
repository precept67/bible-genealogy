import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# Spacing: 10px gap -> 162px center-to-center -> 0.675 columns

# Azel's children: 6 sons
azel_children = ["azrikam_saul", "bocheru", "ishmael_saul", "sheariah", "obadiah_saul", "hanan_saul"]
# Center Azel's children around Azel's column (64.0)
azel_center = 64.0
azel_span = (len(azel_children) - 1) * 0.675 # 5 * 0.675 = 3.375
azel_start = azel_center - (azel_span / 2) # 64.0 - 1.6875 = 62.3125

print("Azel's Children:")
for i, c_id in enumerate(azel_children):
    if c_id in char_map:
        old_col = char_map[c_id].get('column', 0)
        new_col = round(azel_start + i * 0.675, 4)
        char_map[c_id]['column'] = new_col
        print(f"  {char_map[c_id]['name']} ({c_id}): {old_col} -> {new_col}")

# Eshek's children: 3 sons
eshek_children = ["ulam_saul", "jehush_saul", "eliphelet_saul"]
# Center Eshek's children around Eshek's column (68.6)
eshek_center = 68.6
eshek_span = (len(eshek_children) - 1) * 0.675 # 2 * 0.675 = 1.35
eshek_start = eshek_center - (eshek_span / 2) # 68.6 - 0.675 = 67.925

print("\nEshek's Children:")
for i, c_id in enumerate(eshek_children):
    if c_id in char_map:
        old_col = char_map[c_id].get('column', 0)
        new_col = round(eshek_start + i * 0.675, 4)
        char_map[c_id]['column'] = new_col
        print(f"  {char_map[c_id]['name']} ({c_id}): {old_col} -> {new_col}")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
