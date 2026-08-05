import difflib

f_root = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/style_v16_v2.css'
f_deploy = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/bible-genealogy-deploy/style_v16_v2.css'

with open(f_root, 'r', encoding='utf-8') as f:
    root_lines = f.readlines()
with open(f_deploy, 'r', encoding='utf-8') as f:
    deploy_lines = f.readlines()

diff = difflib.unified_diff(
    deploy_lines, root_lines,
    fromfile='deploy/style_v16_v2.css',
    tofile='root/style_v16_v2.css',
    n=3
)

for line in diff:
    print(line, end='')
