import json
import re

with open('/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/data_v16_v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

ids = re.findall(r'"id"\s*:\s*"([^"]+)"', content)
samuels = [i for i in ids if 'samuel' in i.lower()]
print("Samuel IDs in data_v16_v2.js:", samuels)

# Let's search database.json for Samuel IDs
with open('/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)

db_ids = [c['id'] for c in db_data.get('db', [])]
samuels_db = [i for i in db_ids if 'samuel' in i.lower()]
print("Samuel IDs in database.json:", samuels_db)
