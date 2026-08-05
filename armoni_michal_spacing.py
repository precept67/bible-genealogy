import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# Spacing calculations:
# Michal to Armoni: 10px gap -> 162px center-to-center -> 162/240 = 0.675 columns
# Armoni to Mephibosheth: 10px gap -> 162px center-to-center -> 162/240 = 0.675 columns

michal_id = "michal_daughter"
armoni_id = "armoni"
mephi_id = "mephibosheth_saul"

if michal_id in char_map and armoni_id in char_map and mephi_id in char_map:
    michal_col = char_map[michal_id].get('column', 0)
    
    # Calculate new columns
    new_armoni_col = round(michal_col + 0.675, 4)
    new_mephi_col = round(new_armoni_col + 0.675, 4)
    
    char_map[armoni_id]['column'] = new_armoni_col
    char_map[mephi_id]['column'] = new_mephi_col
    
    print(f"Michal column: {michal_col}")
    print(f"Armoni column updated: {new_armoni_col} (Gap from Michal: 10px)")
    print(f"Mephibosheth column updated: {new_mephi_col} (Gap from Armoni: 10px)")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
