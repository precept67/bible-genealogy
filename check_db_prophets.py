import json
import re

# Read data_v16_v2.js to find isProphet references or BIBLE_CHARACTERS
with open('/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/data_v16_v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

# BIBLE_CHARACTERS is defined as JSON-like structure. Let's parse it if possible, or just regex find isProphet.
is_prophet_matches = re.findall(r'"isProphet"\s*:\s*(true|false)', content)
print(f"data_v16_v2.js: total matches of 'isProphet' = {len(is_prophet_matches)}")

# Now print the 29 prophets in database.json
with open('/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)

db_list = db_data.get('db', [])
prophets = []
for char in db_list:
    if char.get('isProphet') is True:
        prophets.append((char['id'], char['name']))

print(f"database.json prophets ({len(prophets)}):")
for pid, pname in prophets:
    print(f" - {pid}: {pname}")
