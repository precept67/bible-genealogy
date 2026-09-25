import zipfile
import xml.etree.ElementTree as ET
import json
import re

kmz_path = "my_places_backup.kmz"

with zipfile.ZipFile(kmz_path, 'r') as z:
    file_list = z.namelist()
    print("Files in KMZ:", file_list[:10], f"(Total {len(file_list)} files)")
    
    # Read doc.kml
    kml_filename = [f for f in file_list if f.endswith('.kml')][0]
    kml_bytes = z.read(kml_filename)

print(f"KML file size: {len(kml_bytes)} bytes")

# Parse KML XML
# Strip namespaces for easier parsing
kml_text = kml_bytes.decode('utf-8', errors='ignore')
kml_clean = re.sub(r' xmlns="[^"]+"', '', kml_text, count=1)
root = ET.fromstring(kml_clean)

placemarks = []

for pm in root.iter('Placemark'):
    name_el = pm.find('name')
    desc_el = pm.find('description')
    coords_el = pm.find('.//coordinates')
    
    name = name_el.text.strip() if name_el is not None and name_el.text else ""
    desc = desc_el.text.strip() if desc_el is not None and desc_el.text else ""
    coords = coords_el.text.strip() if coords_el is not None and coords_el.text else ""
    
    if name and coords:
        # coords is typically "lng,lat,alt" or multiple points
        coord_parts = coords.split()
        first_pt = coord_parts[0].split(',')
        if len(first_pt) >= 2:
            try:
                lng = float(first_pt[0])
                lat = float(first_pt[1])
                placemarks.append({
                    "name": name,
                    "desc": desc,
                    "lng": lng,
                    "lat": lat
                })
            except ValueError:
                pass

print(f"Total valid placemarks found: {len(placemarks)}")

# Check distinct names
names_map = {}
for p in placemarks:
    n = p['name']
    if n not in names_map:
        names_map[n] = []
    names_map[n].append(p)

print(f"Unique location names: {len(names_map)}")

# Print sample placemarks
print("\n--- First 20 Placemarks ---")
for i, (name, items) in enumerate(list(names_map.items())[:20]):
    first = items[0]
    print(f"{i+1}. [{name}] (Count: {len(items)}) -> lat: {first['lat']:.5f}, lng: {first['lng']:.5f} | desc: {first['desc'][:50] if first['desc'] else 'None'}")

# Check Bible locations match
sample_bible_places = ["베들레헴", "예루살렘", "하란", "홍해", "갈릴리", "헤브론", "세겜", "벧엘", "시내산", "나사렛", "고센", "여리고", "가이사랴", "다메섹", "욥바", "사마리아", "갈대아", "우르"]

print("\n--- Key Bible Places Search in KMZ ---")
for sbp in sample_bible_places:
    matches = [k for k in names_map.keys() if sbp in k]
    if matches:
        print(f"✓ Found '{sbp}': {matches[:5]}")
    else:
        print(f"✗ Not found: '{sbp}'")

