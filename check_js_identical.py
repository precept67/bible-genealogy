import difflib

f_root = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/app_v16_v2.js'
f_deploy = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/bible-genealogy-deploy/app_v16_v2.js'

with open(f_root, 'r', encoding='utf-8') as f:
    root_lines = f.readlines()
with open(f_deploy, 'r', encoding='utf-8') as f:
    deploy_lines = f.readlines()

diff = difflib.unified_diff(
    deploy_lines, root_lines,
    fromfile='deploy/app_v16_v2.js',
    tofile='root/app_v16_v2.js',
    n=3
)

for line in diff:
    print(line, end='')
