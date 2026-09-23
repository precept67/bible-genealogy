import zipfile
import xml.etree.ElementTree as ET
import json
import re

kmz_path = "my_places_backup.kmz"

with zipfile.ZipFile(kmz_path, 'r') as z:
    file_list = z.namelist()
    kml_filename = [f for f in file_list if f.endswith('.kml')][0]
    kml_bytes = z.read(kml_filename)

kml_text = kml_bytes.decode('utf-8', errors='ignore')
kml_clean = re.sub(r' xmlns="[^"]+"', '', kml_text, count=1)
root = ET.fromstring(kml_clean)

places = []
seen = {}

for pm in root.iter('Placemark'):
    name_el = pm.find('name')
    desc_el = pm.find('description')
    coords_el = pm.find('.//coordinates')
    
    name = name_el.text.strip() if name_el is not None and name_el.text else ""
    desc = desc_el.text.strip() if desc_el is not None and desc_el.text else ""
    coords = coords_el.text.strip() if coords_el is not None and coords_el.text else ""
    
    if name and coords:
        coord_parts = coords.split()
        first_pt = coord_parts[0].split(',')
        if len(first_pt) >= 2:
            try:
                lng = float(first_pt[0])
                lat = float(first_pt[1])
                
                # Clean html tags from desc for cleaner UI
                clean_desc = re.sub(r'<br\s*/?>', '\n', desc)
                clean_desc = re.sub(r'<[^>]+>', '', clean_desc).strip()
                
                key = f"{name}_{lat:.4f}_{lng:.4f}"
                if key not in seen:
                    seen[key] = True
                    places.append({
                        "id": f"kmz-{len(places)+1}",
                        "name": name,
                        "desc": clean_desc,
                        "lat": round(lat, 6),
                        "lng": round(lng, 6)
                    })
            except ValueError:
                pass

print(f"Extracted {len(places)} deduplicated places.")

# Save to bible_kmz_places.json
with open("bible_kmz_places.json", "w", encoding="utf-8") as f:
    json.dump(places, f, ensure_ascii=False, indent=2)

print("Saved bible_kmz_places.json successfully!")
