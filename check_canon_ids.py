import json
import re

with open('/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/data_v16_v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract BIBLE_CHARACTERS list
# It is defined as: const BIBLE_CHARACTERS = [ ... ];
# We can find all ids in the file
ids = re.findall(r'"id"\s*:\s*"([^"]+)"', content)
print(f"Total IDs in data_v16_v2.js: {len(ids)}")
print(f"abraham in ids: {'abraham' in ids}")
print(f"moses in ids: {'moses' in ids}")
print(f"noah in ids: {'noah' in ids}")
print(f"enoch in ids: {'enoch' in ids}")
print(f"david in ids: {'david' in ids}")
print(f"solomon in ids: {'solomon' in ids}")
print(f"john_baptist in ids: {'john_baptist' in ids}")
print(f"John_the_Baptist in ids: {'John_the_Baptist' in ids}")

# Print list of IDs containing some substring
print("IDs with 'abraham':", [i for i in ids if 'abraham' in i.lower()])
print("IDs with 'moses':", [i for i in ids if 'moses' in i.lower()])
print("IDs with 'noah':", [i for i in ids if 'noah' in i.lower()])
print("IDs with 'enoch':", [i for i in ids if 'enoch' in i.lower()])
print("IDs with 'david':", [i for i in ids if 'david' in i.lower()])
print("IDs with 'solomon':", [i for i in ids if 'solomon' in i.lower()])
