import json
import re

ids = [
    'nathan', 'mattatha', 'menna', 'melea', 'eliakim_luke', 'jonam', 'joseph_luke1', 
    'judah_luke1', 'simeon_luke', 'levi_luke1', 'matthat_luke1', 'jorim', 'eliezer_luke', 
    'joshua_luke', 'er_luke', 'elmadam', 'cosam', 'addi', 'melchi_luke1', 'neri', 
    'shealtiel_luke', 'zerubbabel_luke', 'rhesa', 'joanan', 'joda', 'josech', 'semein', 
    'mattathias_luke1', 'maath', 'naggai', 'esli', 'nahum', 'amos', 'mattathias_luke2', 
    'joseph_luke2', 'jannai', 'melchi_luke2', 'levi_luke2', 'matthat_luke2', 'heli', 'mary'
]

# Calculate new generations
new_gens = {}
for i, cid in enumerate(ids):
    new_gens[cid] = round(33.0 + i * 0.72, 2)

print("Target generation values:")
for cid in ids:
    print(f"{cid}: {new_gens[cid]}")

# 1. Update database.json
print("\nUpdating database.json...")
with open('database.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)

updated_count_db = 0
for char in db_data.get('db', []):
    cid = char.get('id')
    if cid in new_gens:
        old_val = char.get('generation')
        char['generation'] = new_gens[cid]
        print(f"  {cid}: {old_val} -> {new_gens[cid]}")
        updated_count_db += 1

with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(db_data, f, indent=2, ensure_ascii=False)
print(f"database.json updated! ({updated_count_db} records changed)")

# 2. Update data_v16_v2.js
print("\nUpdating data_v16_v2.js...")
with open('data_v16_v2.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

updated_count_js = 0
for cid in ids:
    new_val = new_gens[cid]
    # Find the object block starting with "id": "cid"
    # and find the "generation": <number> line within the block.
    # We can search for the "id": "cid" pattern, then find the "generation" match.
    pattern = r'(\"id\"\s*:\s*\"' + re.escape(cid) + r'\",.*?\"generation\"\s*:\s*)([0-9\.]+)'
    
    # We need re.DOTALL so . matches newline, but we only want to search within the block
    # Let's search and replace
    match = re.search(pattern, js_content, re.DOTALL)
    if match:
        old_val = match.group(2)
        # Verify it's within the block (doesn't cross to next ID block)
        # If it doesn't cross, we replace
        block_part = match.group(1)
        if '"id"' not in block_part[10:]: # Make sure we didn't match across objects
            js_content = js_content.replace(match.group(0), block_part + str(new_val), 1)
            print(f"  {cid}: {old_val} -> {new_val}")
            updated_count_js += 1
        else:
            print(f"  Warning: match for {cid} crossed object boundary!")
    else:
        print(f"  Warning: could not find match for {cid} in JS!")

with open('data_v16_v2.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print(f"data_v16_v2.js updated! ({updated_count_js} records changed)")
