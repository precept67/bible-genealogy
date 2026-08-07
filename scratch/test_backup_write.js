const fs = require('fs');
const path = require('path');

const backupPath = '/Users/sanghyunkim/Documents/bible_genealogy_notes_autobackup.json';
const dbPath = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json';
const docDir = '/Users/sanghyunkim/Documents';
const backupFolder = path.join(docDir, 'bible_genealogy_notes');

try {
  const userNotes = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const db = dbData.db || [];
  const events = dbData.events || [];
  const locations = dbData.locations || [];
  const customPolygons = dbData.customPolygons || [];
  
  // Simulated prophetIds
  const prophetIds = new Set();
  
  for (const key of Object.keys(userNotes)) {
    const content = userNotes[key];
    
    let name = key;
    let type = '기타';
    
    const person = db.find(p => p.id === key);
    if (person) {
      name = person.name;
      const isProphetChar = person.isProphet === true || 
                            (typeof prophetIds !== 'undefined' && prophetIds.has(person.id)) || 
                            person.id.startsWith('prophet_') || 
                            person.id === 'samuel';
      type = isProphetChar ? '선지자' : '인물';
    } else {
      const ev = events.find(e => e.id === key);
      if (ev) {
        name = ev.name;
        type = '사건';
      } else {
        const loc = locations.find(l => l.id === key);
        if (loc) {
          name = loc.name;
          type = '장소';
        } else {
          const poly = customPolygons.find(p => p.id === key);
          if (poly) {
            name = poly.label || poly.id;
            type = '영역';
          } else if (key.startsWith('note-') || key.startsWith('annotation_')) {
            name = key;
            type = '텍스트상자';
          }
        }
      }
    }
    
    const cleanName = name.replace(/[\/\\:\*\?"<>\|]/g, '_').trim();
    const mdFilePath = path.join(backupFolder, type, cleanName + '.md');
    
    console.log(`Writing file for key: ${key}, type: ${type}, cleanName: ${cleanName}`);
    console.log(`Path: ${mdFilePath}`);
    
    if (!content || !content.trim()) {
      console.log(`Content is empty, would delete: ${mdFilePath}`);
    } else {
      let title = cleanName;
      if (person) title = `${person.name} (${person.engName || ''})`;
      else if (ev) title = `${ev.name}`;
      else if (loc) title = `${loc.name}`;
      else if (poly) title = `${poly.label || poly.id}`;

      const mdText = `---
title: "${title}"
id: "${key}"
type: "${type}"
tags:
  - 성경족보메모
  - ${type}
---

# ${title}

${content}
`;
      fs.writeFileSync(mdFilePath, mdText, 'utf8');
      console.log(`Successfully wrote ${mdFilePath}`);
    }
  }
} catch (e) {
  console.error("Error in simulation:", e);
}
