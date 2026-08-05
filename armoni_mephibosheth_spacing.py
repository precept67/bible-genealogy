import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# Spacing calculation:
# Card width = 152px, target gap = 10px -> Center-to-center = 162px.
# 162px / 240px (COL_WIDTH) = 0.675 columns

armoni_id = "armoni"
mephi_id = "mephibosheth_saul"

if armoni_id in char_map and mephi_id in char_map:
    armoni_col = char_map[armoni_id].get('column', 0)
    new_mephi_col = round(armoni_col + 0.675, 4)
    char_map[mephi_id]['column'] = new_mephi_col
    print(f"Armoni column: {armoni_col}")
    print(f"Mephibosheth (Saul's son) column updated: {new_mephi_col} (Gap: 10px)")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
