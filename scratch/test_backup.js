const fs = require('fs');
const path = require('path');

const backupPath = '/Users/sanghyunkim/Documents/bible_genealogy_notes_autobackup.json';
const dbPath = '/Users/sanghyunkim/.gemini/antigravity/scratch/bible-genealogy/database.json';

try {
  const notes = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  console.log("Notes keys:", Object.keys(notes));
  
  const dbPeople = dbData.db || [];
  console.log("Total people in db:", dbPeople.length);
  
  const abelInDb = dbPeople.find(p => p.id === 'abel');
  console.log("Is abel in db?", abelInDb ? "Yes: " + JSON.stringify(abelInDb) : "No");
  
  Object.keys(notes).forEach(key => {
    const person = dbPeople.find(p => p.id === key);
    if (person) {
      console.log(`Key "${key}" matched person: ${person.name}`);
    } else {
      console.log(`Key "${key}" NOT matched in db`);
    }
  });
} catch (e) {
  console.error(e);
}
