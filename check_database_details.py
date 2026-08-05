import json

with open('/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db_list = data.get('db', [])
prophet_chars = [c for c in db_list if c['id'].startswith('prophet_')]
print(f"Total custom prophets in database.json: {len(prophet_chars)}")

# Print fields for a couple of prophets
for c in prophet_chars[:3]:
    print(json.dumps(c, ensure_ascii=False, indent=2))

# Check if coordinates exist for these prophets in database.json or app_v16_v2.js
# Wait, where are coordinates stored? They are stored in database.json or data_v16_v2.js or a separate key?
# Let's check if the database.json has a "coordinates" or "coordinates" exists in the JSON.
print("Keys in database.json:", list(data.keys()))
if 'coordinates' in data:
    print("Found coordinates in database.json!")
