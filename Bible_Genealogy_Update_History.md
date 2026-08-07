# 📖 Bible Genealogy Update History & Obsidian Integration Guide
#성경족보 #업데이트기록 #옵시디언 #Tauri

성경 인물 족보 보드 프로그램의 주요 패치 및 기능 개선 사항에 대한 상세 업데이트 히스토리 문서입니다. 이 문서는 **옵시디언(Obsidian)**의 마크다운 서식 및 내부 링크와 호환되도록 구성되었습니다.

---

## 🛠️ 주요 업데이트 사항 요약

> [!info] **1. 미세 조정(Nudge) 단축키 추가**
> * **목적**: 인물 카드 배치 시 마우스 드래그보다 정교한 미세 조정을 위한 단축키 구현.
> * **단축키**:
>   * `Alt` (Option) + `방향키`: `0.01` 단위 미세 조정
>   * `Ctrl` 또는 `Cmd` + `방향키`: `0.001` 단위 초미세 조정

> [!tip] **2. 자동 로그인 & 세션 유지 기능 (`localStorage`)**
> * **목적**: 기존 `sessionStorage` 저장 방식으로 인해 프로그램을 완전히 껐다 켤 때마다 매번 로그인해야 했던 불편함 해결.
> * **수정**: 인증 토큰 저장소를 `localStorage`로 마이그레이션하여 **최초 1회 로그인 성공 시 프로그램 재시작 후에도 로그인 세션이 자동으로 계속 유지**되도록 수정.

> [!warning] **3. 한-영 자동 번역 엔진 구축 (Auto-Translation)**
> * **목적**: 한국어로 새 오브젝트를 올렸을 때 영어 버전에서도 자연스럽게 영문화되어 서비스되도록 지원.
> * **클라이언트 (입력창)**: 
>   * 인물 상세 정보 입력 시 한글 이름/설명을 작성하고 포커스를 해제(Blur)하면, 영문 이름/설명 칸이 비어 있을 때 **구글 번역 API가 실시간 번역하여 자동 기입**.
>   * 인물 정보 입력창에 **'인물 설명 (영어)'** 기입란 추가.
> * **백엔드 (서버 저장 직전)**:
>   * 사건, 장소, 영역(Polygon) 등록 시 영어 입력란이 없어 번역이 누락되는 문제를 해결하기 위해, 서버가 데이터를 디스크에 저장하기 직전 영문 데이터가 빈칸인 대상을 찾아 자동 번역 및 필드 보완.

> [!note] **4. 툴킷바 드래그 전파 버그 수정**
> * **목적**: 왼쪽 레이어 설정 패널 및 하단 사건/장소 배치 툴킷 바 내부에서 마우스를 조작(클릭, 스크롤, 드래그)할 때 뒷배경인 족보판 전체가 흔들리거나 움직이던 에러 해결.
> * **수정**: 해당 오버레이 UI들의 드래그 이벤트가 족보 캔버스로 전파되는 현상을 완전 차단.

> [!info] **5. 영역(Areas / Family Groups) 레이블 시인성 향상**
> * **수정**: 지도 상의 영역 제목 이름표(`.family-group-label`) 크기를 기존 `11px`에서 **`15px`로 4px 확대**하여 시인성 확보.

---

## 🌎 주요 한-영 번역 업데이트 목록

영어 모드(`currentLang === 'en'`)일 때 한글 문장이 나타나거나 깨지던 데이터 및 UI 요소들을 대대적으로 영문화했습니다.

### 1. 인물 데이터 (Characters)
* **에스라 (`ezra`)**: 영어 모드에서 한글 설명 병기를 완전히 제거하고 영문 단독 표기로 수정.
* **하가랴 (`Hacaliah`)**: `"Father of Nehemiah (Nehemiah 1:1)"`
* **하나니 (`hanani`)**: `"A brother who informed Nehemiah of the desolation of Jerusalem..."`
* **느헤미야 (`nehemiah`)**: `"Appointed governor of Judah by the Persian king..."`
* 기타 기존 1000여 명의 인물 정보 다국어 출력 검증 완료.

### 2. 사건 데이터 (Events)
* **홍해 사건 (`ev-1786031894789`)**: 
  * 이름: `Parting of the Red Sea and Annihilation of the Egyptian Army`
  * 설명: `The miracle of liberation where Moses parted the Red Sea...`
* **선악과 사건 (`ev-1786037573263`)**:
  * 이름: `The Forbidden Fruit and the Fall of Mankind`
  * 설명: `The incident where Adam and Eve, tempted by the serpent, ate the forbidden fruit...`
* **느헤미야 성벽 완공 (`ev-1786029213751`)**:
  * 이름: `Nehemiah's Rebuilding and Completion of the Jerusalem Walls`

### 3. UI 및 레이어 설정
* 좌측 레이어 체크박스의 한글 이름(인물 족보, 주요 사건 등)을 영어 버전 선택 시 **`Genealogy`, `Events`, `Locations`, `Areas`, `Prophets`**로 유연하게 영문 스왑 처리.

---

## 🗂️ 옵시디언(Obsidian) 연동 가이드

이 업데이트 로그 문서를 옵시디언 보관소(Vault)에 연동하여 성경 연구 노트와 연결해서 사용하는 방법입니다.

### 1. 옵시디언 보관소에 파일 추가하기
* 본 마크다운 파일(`Bible_Genealogy_Update_History.md`)을 사용하시는 옵시디언 보관소 폴더로 그대로 드래그하여 붙여넣으세요.

### 2. 마크다운 내부 링크 연결하기
* 다른 성경 연구 노트에서 본 문서를 인용하거나 참조할 때 아래 서식을 활용해 보세요.
  * `[[Bible_Genealogy_Update_History|성경 족보 업데이트 기록]]`을 입력하면 이 문서와 직접 연결되는 링크가 생성됩니다.
  * `[[Bible_Genealogy_Update_History#1. 미세 조정(Nudge) 단축키 추가]]`와 같이 특정 섹션으로 직접 링크를 지정할 수도 있습니다.

### 3. 태그(Tag) 관리
* 본 문서 상단에 지정된 `#성경족보`, `#업데이트기록`, `#옵시디언` 태그를 활용해 옵시디언 그래프 뷰에서 연관 노트를 탐색해 보세요.
