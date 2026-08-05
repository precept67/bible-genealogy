import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data.get('db', [])
char_map = {c['id']: c for c in db}

# Spacing definitions:
# Merab to Adriel: 60px gap -> 212px center-to-center -> 212/240 = 0.8833 columns
# Adriel to Michal: 10px gap -> 162px center-to-center -> 162/240 = 0.675 columns

merab_id = "merab_saul"
adriel_id = "adriel"
michal_id = "michal_daughter"

if merab_id in char_map and adriel_id in char_map and michal_id in char_map:
    merab_col = char_map[merab_id].get('column', 0)
    
    # Calculate new columns
    new_adriel_col = round(merab_col + (212.0 / 240.0), 4)
    new_michal_col = round(new_adriel_col + 0.675, 4)
    
    char_map[adriel_id]['column'] = new_adriel_col
    char_map[michal_id]['column'] = new_michal_col
    
    print(f"Merab column: {merab_col}")
    print(f"Adriel column updated: {new_adriel_col} (Gap: 60px)")
    print(f"Michal column updated: {new_michal_col} (Gap: 10px)")

# Save database
data['db'] = db
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
