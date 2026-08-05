import os

f_root = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json'
f_deploy = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/bible-genealogy-deploy/database.json'
f_dist = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/dist/database.json'
f_ios = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/ios/App/App/public/database.json'
f_android = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/android/app/src/main/assets/public/database.json'

files = [f_deploy, f_dist, f_ios, f_android]

with open(f_root, 'r', encoding='utf-8') as f:
    root_content = f.read()

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"{os.path.basename(path)} in {os.path.dirname(path)} is identical to root: {root_content == content}")
    else:
        print(f"{path} does not exist")
