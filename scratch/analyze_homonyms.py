import json
from collections import defaultdict
import re

with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

db = data['db']

def clean_name(name):
    return re.sub(r'\s*\(.*?\)\s*', '', name).strip()

clean_groups = defaultdict(list)
for person in db:
    c_name = clean_name(person['name'])
    clean_groups[c_name].append(person)

# Filter groups with length > 1
dup_groups = {name: grp for name, grp in clean_groups.items() if len(grp) > 1}

# Sort groups by frequency desc, then name asc
sorted_groups = sorted(dup_groups.items(), key=lambda x: (-len(x[1]), x[0]))

# Create markdown content
md_lines = []
md_lines.append('# 성경 족보 동명이인(同名異人) 분석 보고서')
md_lines.append('')
md_lines.append('이 보고서는 「열린족보이야기」 데이터베이스(총 1,004명) 중 동일한 이름을 가진 인물들을 세대와 부모, 성경적 배경 설명을 바탕으로 정리한 대조 목록입니다.')
md_lines.append(f'분석 결과, 총 **{len(sorted_groups)}개 이름**에서 동명이인이 확인되었습니다.')
md_lines.append('')
md_lines.append('---')
md_lines.append('')

for i, (name, group) in enumerate(sorted_groups, 1):
    md_lines.append(f'### {i}. {name} (총 {len(group)}명)')
    md_lines.append('')
    md_lines.append('| 성경 표기명 | ID | 성별 | 세대 | 부모 | 주요 설명 |')
    md_lines.append('| :--- | :--- | :---: | :---: | :--- | :--- |')
    for p in group:
        # Find father name if parent ID exists in db
        parents_list = []
        for p_id in p.get('parents', []):
            parent_node = next((x for x in db if x['id'] == p_id), None)
            if parent_node:
                parents_list.append(f"{parent_node['name']} ({p_id})")
            else:
                parents_list.append(p_id)
        parents_str = ', '.join(parents_list) if parents_list else '기록 없음'
        
        desc = p.get('desc', '').replace('|', '\\|')
        md_lines.append(f"| {p['name']} | `{p['id']}` | {p['gender']} | {p['generation']} | {parents_str} | {desc} |")
    md_lines.append('')

# Write in workspace
with open('homonyms_analysis.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print('Successfully generated homonyms_analysis.md in workspace!')
