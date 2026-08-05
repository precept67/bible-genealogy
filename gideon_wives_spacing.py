import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# Spacing calculation:
# Card width = 152px, target gap = 60px -> Center-to-center = 212px.
# 212px / 240px (COL_WIDTH) = 0.883333...
spacing = 212.0 / 240.0 # ~0.883333

gideon_id = "gideon_man"
wives_id = "gideon_wife"

if gideon_id in char_map and wives_id in char_map:
    gideon_col = char_map[gideon_id].get('column', 0)
    gideon_gen = char_map[gideon_id].get('generation', 0)
    
    # Calculate new column and align generation
    new_col = round(gideon_col - spacing, 4)
    char_map[wives_id]['column'] = new_col
    char_map[wives_id]['generation'] = gideon_gen
    
    print(f"Gideon column: {gideon_col} | Gen: {gideon_gen}")
    print(f"Gideon's wives updated: Column {new_col} | Gen {gideon_gen}")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
