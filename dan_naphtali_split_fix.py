import json

# Load database
with open('database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

spouse_splits = data.get('spouseSplits', {})

# Shift ratio of bilhah+jacob from 0.95 to 0.955 (approx +97 pixels to the right)
if 'bilhah+jacob' in spouse_splits:
    old_ratio = spouse_splits['bilhah+jacob']
    new_ratio = 0.95516 # Shifting exactly +100px: 100 / (80.698 * 240) = 0.00516
    spouse_splits['bilhah+jacob'] = new_ratio
    print(f"Shifted bilhah+jacob spouse split ratio: {old_ratio} -> {new_ratio}")

# Save database
data['spouseSplits'] = spouse_splits
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nDatabase successfully updated!")
