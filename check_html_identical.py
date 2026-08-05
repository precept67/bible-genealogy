import os

f_root = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/index.html'
f_deploy = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/bible-genealogy-deploy/index.html'
f_dist = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/dist/index.html'
f_ios = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/ios/App/App/public/index.html'
f_android = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/android/app/src/main/assets/public/index.html'

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
