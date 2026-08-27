import os
import glob
from PIL import Image

# 1. 경로 정의
DESKTOP_PATH = os.path.expanduser("~/Desktop")
INPUT_DIR = os.path.join(DESKTOP_PATH, "Screenshots_Raw")
OUTPUT_DIR = os.path.join(DESKTOP_PATH, "AppStore_Screenshots")

# 타겟 규격 정의 (가로 x 세로)
TARGET_SIZES = {
    "6.7_inch": (1290, 2796),
    "5.5_inch": (1242, 2208)
}

def resize_and_crop(img, target_width, target_height):
    """
    이미지 비율을 유지하면서 타겟 크기에 맞춰 크기를 조정한 후,
    중앙을 기준으로 크롭(Center Crop)하여 정확한 규격을 맞춥니다.
    """
    original_width, original_height = img.size
    target_ratio = target_width / target_height
    original_ratio = original_width / original_height

    if original_ratio > target_ratio:
        # 원본이 타겟보다 더 뚱뚱한 경우 (세로 기준 맞춤 후 가로를 자름)
        new_height = target_height
        new_width = int(original_width * (target_height / original_height))
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 가로 중앙 크롭
        left = (new_width - target_width) // 2
        right = left + target_width
        return resized_img.crop((left, 0, right, target_height))
    else:
        # 원본이 타겟보다 더 날씬한 경우 (가로 기준 맞춤 후 세로를 자름)
        new_width = target_width
        new_height = int(original_height * (target_width / original_width))
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 세로 중앙 크롭
        top = (new_height - target_height) // 2
        bottom = top + target_height
        return resized_img.crop((0, top, target_width, bottom))

def process_screenshots():
    # 2. 인풋 폴더가 없으면 생성하고 사용자에게 안내
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"📌 바탕화면에 'Screenshots_Raw' 폴더를 생성했습니다.")
        print(f"👉 변환할 시뮬레이터 원본 캡처 이미지들을 바탕화면의 [Screenshots_Raw] 폴더 안에 넣어주세요.")
        
        # 바탕화면에 굴러다니는 Simulator Screen Shot 파일이 있는지 감지해서 자동 이동 안내
        wildcard = os.path.join(DESKTOP_PATH, "Simulator Screen Shot*.png")
        desktop_shots = glob.glob(wildcard)
        if desktop_shots:
            print(f"💡 감지됨: 바탕화면에 {len(desktop_shots)}개의 시뮬레이터 캡처 파일이 있습니다.")
            print(f"   이 파일들을 Screenshots_Raw 폴더로 이동해 주시면 더 편리합니다.")
        return

    # 3. 인풋 폴더 내의 png, jpg 이미지 검색
    image_files = []
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.PNG", "*.JPG", "*.JPEG"):
        image_files.extend(glob.glob(os.path.join(INPUT_DIR, ext)))

    if not image_files:
        print(f"❌ '{INPUT_DIR}' 폴더 안에 변환할 이미지 파일이 없습니다.")
        print(f"👉 시뮬레이터 캡처본(PNG)들을 해당 폴더에 넣고 스크립트를 다시 실행해 주세요.")
        return

    print(f"🚀 총 {len(image_files)}개의 원본 이미지를 찾았습니다. 규격 변환을 시작합니다...")

    # 4. 각 해상도별 아웃풋 폴더 준비 및 변환 진행
    for folder_name, (width, height) in TARGET_SIZES.items():
        folder_path = os.path.join(OUTPUT_DIR, folder_name)
        os.makedirs(folder_path, exist_ok=True)

        for filepath in image_files:
            filename = os.path.basename(filepath)
            output_filepath = os.path.join(folder_path, filename)
            
            try:
                with Image.open(filepath) as img:
                    # RGB 모드로 변환
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    processed_img = resize_and_crop(img, width, height)
                    processed_img.save(output_filepath, "PNG")
                    print(f"   ✅ [성공] {folder_name} 크기로 변환 완료: {filename}")
            except Exception as e:
                print(f"   ❌ [실패] {filename} 변환 중 오류 발생: {e}")

    print(f"\n🎉 변환 작업이 모두 완료되었습니다!")
    print(f"📂 결과물 저장 경로: {os.path.abspath(OUTPUT_DIR)}")
    print(f"   - 6.7인치 스토어 등록용: {os.path.join(OUTPUT_DIR, '6.7_inch')}")
    print(f"   - 5.5인치 스토어 등록용: {os.path.join(OUTPUT_DIR, '5.5_inch')}")

if __name__ == "__main__":
    process_screenshots()
