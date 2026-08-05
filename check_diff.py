import json

f1 = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json'
f2 = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/bible-genealogy-deploy/database.json'

with open(f1, 'r', encoding='utf-8') as file1, open(f2, 'r', encoding='utf-8') as file2:
    d1 = json.load(file1)
    d2 = json.load(file2)

db1 = d1.get('db', [])
db2 = d2.get('db', [])

print(f"database.json (root): total={len(db1)}")
print(f"database.json (deploy): total={len(db2)}")

ids1 = set(c['id'] for c in db1)
ids2 = set(c['id'] for c in db2)

print(f"IDs in root but not in deploy: {ids1 - ids2}")
print(f"IDs in deploy but not in root: {ids2 - ids1}")

# Compare content for overlapping IDs
diff_count = 0
for cid in ids1 & ids2:
    c1 = next(c for c in db1 if c['id'] == cid)
    c2 = next(c for c in db2 if c['id'] == cid)
    if json.dumps(c1, sort_keys=True) != json.dumps(c2, sort_keys=True):
        diff_count += 1
        if diff_count <= 3:
            print(f"Diff for {cid}:")
            print("  Root  :", c1)
            print("  Deploy:", c2)
print("Total diff characters between overlaps:", diff_count)
