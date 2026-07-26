/**
 * Bible Genealogy Dataset (Revised Korean Version Standard - 개역개정 기준)
 * 
 * Sibling birth-order layout from left to right.
 * Layout coordinates adjusted to place Japheth (eldest) -> Ham (second) -> Shem (third):
 * - japheth at -9.0, ham at -4.0, shem at 0.0.
 * - Sibling branches adjusted cleanly with no overlaps.
 */
const LAYOUT_VERSION = "13.0";

const BIBLE_CHARACTERS = [
  // Generation 0
  { id: "adam", name: "아담", engName: "Adam", gender: "M", generation: 0, column: 0, parents: [], spouses: ["eve"], desc: "하나님이 흙으로 창조하신 인류의 첫 조상.", isMain: true },
  { id: "eve", name: "하와", engName: "Eve", gender: "F", generation: 0, column: 1.2, parents: [], spouses: ["adam"], desc: "아담의 갈빗대로 지음 받은 모든 산 자의 어머니.", isMain: true },

  // Generation 1
  { id: "seth", name: "셋", engName: "Seth", gender: "M", generation: 1, column: 0, parents: ["adam", "eve"], spouses: [], desc: "아벨 대신 주신 아들. 예배와 언약 계승의 시작.", isMain: true },
  { id: "cain", name: "가인", engName: "Cain", gender: "M", generation: 1, column: -3.5, parents: ["adam", "eve"], spouses: [], desc: "인류 최초의 살인자. 농경 문명의 시작.", isMain: false },
  { id: "abel", name: "아벨", engName: "Abel", gender: "M", generation: 1, column: -1.2, parents: ["adam", "eve"], spouses: [], desc: "가인에게 죽임 당한 의로운 목자.", isMain: false },

  // Generation 2 (Cain's Line)
  { id: "enoch_cain", name: "에녹(가인계)", engName: "Enoch", gender: "M", generation: 2, column: -3.5, parents: ["cain"], spouses: [], desc: "가인이 성을 쌓고 아들의 이름을 딴 성.", isMain: false },
  // Generation 2 (Seth's Line)
  { id: "enosh", name: "에노스", engName: "Enosh", gender: "M", generation: 2, column: 0, parents: ["seth"], spouses: [], desc: "셋의 아들. 이때부터 여호와의 이름을 부르기 시작함.", isMain: true },

  // Generation 3 (Cain's Line)
  { id: "irad", name: "이라드", engName: "Irad", gender: "M", generation: 3, column: -3.5, parents: ["enoch_cain"], spouses: [], desc: "에녹의 아들. 가인 계열 성읍 문명 지도자.", isMain: false },
  // Generation 3 (Seth's Line)
  { id: "kenan", name: "게난", engName: "Kenan", gender: "M", generation: 3, column: 0, parents: ["enosh"], spouses: [], desc: "에노스의 아들. 경건한 조상들의 반열.", isMain: true },

  // Generation 4 (Cain's Line)
  { id: "mehujael", name: "므후야엘", engName: "Mehujael", gender: "M", generation: 4, column: -3.5, parents: ["irad"], spouses: [], desc: "이라드의 아들.", isMain: false },
  // Generation 4 (Seth's Line)
  { id: "mahalalel", name: "마할랄렐", engName: "Mahalalel", gender: "M", generation: 4, column: 0, parents: ["kenan"], spouses: [], desc: "게난의 아들. '하나님을 찬양하는 자'라는 뜻.", isMain: true },

  // Generation 5 (Cain's Line)
  { id: "methushael", name: "므드사엘", engName: "Methushael", gender: "M", generation: 5, column: -3.5, parents: ["mehujael"], spouses: [], desc: "므후야엘의 아들.", isMain: false },
  // Generation 5 (Seth's Line)
  { id: "jared", name: "야렛", engName: "Jared", gender: "M", generation: 5, column: 0, parents: ["mahalalel"], spouses: [], desc: "마할랄렐의 아들.", isMain: true },

  // Generation 6 (Cain's Line)
  { id: "lamech_cain", name: "라멕(가인계)", engName: "Lamech", gender: "M", generation: 6, column: -3.5, parents: ["methushael"], spouses: ["adah_cain", "zillah_cain"], desc: "최초로 두 아내를 취한 자. 살인을 노래하는 검가 작가.", isMain: false },
  { id: "adah_cain", name: "아다", engName: "Adah", gender: "F", generation: 6, column: -4.7, parents: [], spouses: ["lamech_cain"], desc: "라멕의 첫 번째 아내.", isMain: false },
  { id: "zillah_cain", name: "씰라", engName: "Zillah", gender: "F", generation: 6, column: -2.3, parents: [], spouses: ["lamech_cain"], desc: "라멕의 두 번째 아내.", isMain: false },
  // Generation 6 (Seth's Line)
  { id: "enoch", name: "에녹", engName: "Enoch", gender: "M", generation: 6, column: 0, parents: ["jared"], spouses: [], desc: "300년간 하나님과 동행한 후 죽음을 보지 않고 승천함.", isMain: true },

  // Generation 7 (Cain's Line descendants)
  { id: "jabal", name: "야발", engName: "Jabal", gender: "M", generation: 7, column: -5.3, parents: ["lamech_cain", "adah_cain"], spouses: [], desc: "가축을 치는 장막 거주자의 조상.", isMain: false },
  { id: "jubal", name: "유발", engName: "Jubal", gender: "M", generation: 7, column: -4.1, parents: ["lamech_cain", "adah_cain"], spouses: [], desc: "수금과 퉁소를 잡는 모든 자의 조상.", isMain: false },
  { id: "tubalcain", name: "두발가인", engName: "Tubal-cain", gender: "M", generation: 7, column: -2.9, parents: ["lamech_cain", "zillah_cain"], spouses: [], desc: "구리와 쇠로 여러 가지 기구를 만드는 자의 조상.", isMain: false },
  { id: "naamah", name: "나아마", engName: "Naamah", gender: "F", generation: 7, column: -1.7, parents: ["lamech_cain", "zillah_cain"], spouses: [], desc: "가인 계열의 딸. '아름답다'는 뜻.", isMain: false },

  // Generation 7 (Seth's Line)
  { id: "methuselah", name: "므두셀라", engName: "Methuselah", gender: "M", generation: 7, column: 0, parents: ["enoch"], spouses: [], desc: "성경 인물 중 가장 장수한 인물 (969세 사망).", isMain: true },

  // Generation 8
  { id: "lamech", name: "라멕", engName: "Lamech", gender: "M", generation: 8, column: 0, parents: ["methuselah"], spouses: [], desc: "므두셀라의 아들. 노아의 아버지.", isMain: true },

  // Generation 9
  { id: "noah", name: "노아", engName: "Noah", gender: "M", generation: 9, column: 0, parents: ["lamech"], spouses: [], desc: "방주를 예비하여 온 세상의 대홍수 심판에서 인류의 명맥을 보존함.", isMain: true },

  // Generation 10 (Japheth -> Ham -> Shem birth order left-to-right)
  { id: "japheth", name: "야벳", engName: "Japheth", gender: "M", generation: 10, column: -10.8, parents: ["noah"], spouses: [], desc: "창대하여 유럽과 아시아 여러 민족의 조상이 됨. 노아의 장자.", isMain: false },
  { id: "ham", name: "함", engName: "Ham", gender: "M", generation: 10, column: -4.0, parents: ["noah"], spouses: [], desc: "가나안, 구스, 미스라임의 조상. 노아의 차남.", isMain: false },
  { id: "shem", name: "셈", engName: "Shem", gender: "M", generation: 10, column: 0, parents: ["noah"], spouses: [], desc: "노아의 삼남. 아브라함과 다윗, 예수의 조상이 됨.", isMain: true },

  // Generation 11 (Japheth's branch shifted to the right, Ham's to the left, Shem's stays at 0.0)
  { id: "gomer", name: "고멜", engName: "Gomer", gender: "M", generation: 11, column: -14.4, parents: ["japheth"], spouses: [], desc: "야벳의 맏아들.", isMain: false },
  { id: "magog", name: "마곡", engName: "Magog", gender: "M", generation: 11, column: -13.2, parents: ["japheth"], spouses: [], desc: "유라시아 북부 민족의 조상.", isMain: false },
  { id: "madai", name: "마대", engName: "Madai", gender: "M", generation: 11, column: -12.0, parents: ["japheth"], spouses: [], desc: "메대 민족(페르시아 서부)의 조상.", isMain: false },
  { id: "javan", name: "야완", engName: "Javan", gender: "M", generation: 11, column: -10.8, parents: ["japheth"], spouses: [], desc: "그리스 및 이오니아 민족의 조상.", isMain: false },
  { id: "tubal", name: "두발", engName: "Tubal", gender: "M", generation: 11, column: -9.6, parents: ["japheth"], spouses: [], desc: "야벳의 다섯째 아들. 소아시아 지역 종족의 조상.", isMain: false },
  { id: "meshech", name: "메섹", engName: "Meshech", gender: "M", generation: 11, column: -8.4, parents: ["japheth"], spouses: [], desc: "야벳의 여섯째 아들. 흑해 북부 종족의 조상.", isMain: false },
  { id: "tiras", name: "디라스", engName: "Tiras", gender: "M", generation: 11, column: -7.2, parents: ["japheth"], spouses: [], desc: "야벳의 일곱째 아들. 에게해 주변 및 트라키아 종족의 조상.", isMain: false },
  
  { id: "cush", name: "구스", engName: "Cush", gender: "M", generation: 11, column: -5.4, parents: ["ham"], spouses: [], desc: "함의 첫째 아들. 에티오피아 및 아프리카계 조상.", isMain: false },
  { id: "mizraim", name: "미스라임", engName: "Mizraim", gender: "M", generation: 11, column: -4.2, parents: ["ham"], spouses: [], desc: "이집트 민족의 조상.", isMain: false },
  { id: "put", name: "붓", engName: "Put", gender: "M", generation: 11, column: -3.0, parents: ["ham"], spouses: [], desc: "리비아 지역 민족의 조상.", isMain: false },
  { id: "canaan", name: "가나안", engName: "Canaan", gender: "M", generation: 11, column: -1.8, parents: ["ham"], spouses: [], desc: "가나안 족속의 조상. 노아로부터 저주를 받음.", isMain: false },

  { id: "arpachshad", name: "아르박삿", engName: "Arpachshad", gender: "M", generation: 11, column: 0, parents: ["shem"], spouses: [], desc: "대홍수 2년 후에 태어난 셈의 아들.", isMain: true },

  // Generation 12 (Nimrod aligned w Cush, Japheth grandkids on the right)
  { id: "ashkenaz", name: "아스그나스", engName: "Ashkenaz", gender: "M", generation: 12, column: -15.6, parents: ["gomer"], spouses: [], desc: "고멜의 첫째 아들. 흑해 북쪽 아스케나즈 종족의 조상.", isMain: false },
  { id: "riphath", name: "리밧", engName: "Riphath", gender: "M", generation: 12, column: -14.4, parents: ["gomer"], spouses: [], desc: "고멜의 둘째 아들.", isMain: false },
  { id: "togarmah", name: "도갈마", engName: "Togarmah", gender: "M", generation: 12, column: -13.2, parents: ["gomer"], spouses: [], desc: "고멜의 셋째 아들. 아르메니아 및 소아시아 동부 종족의 조상.", isMain: false },
  
  { id: "elishah", name: "엘리사", engName: "Elishah", gender: "M", generation: 12, column: -12.6, parents: ["javan"], spouses: [], desc: "야완의 첫째 아들. 그리스 해안 지대 종족의 조상.", isMain: false },
  { id: "tarshish", name: "달시스", engName: "Tarshish", gender: "M", generation: 12, column: -11.4, parents: ["javan"], spouses: [], desc: "야완의 둘째 아들. 스페인 타르테소스 또는 지중해 서부 종족의 조상.", isMain: false },
  { id: "kittim", name: "깃딤", engName: "Kittim", gender: "M", generation: 12, column: -10.2, parents: ["javan"], spouses: [], desc: "야완의 셋째 아들. 키프로스섬 및 지중해 동부 종족의 조상.", isMain: false },
  { id: "dodanim", name: "도다님", engName: "Dodanim", gender: "M", generation: 12, column: -9.0, parents: ["javan"], spouses: [], desc: "야완의 넷째 아들. 로도스섬 주변 종족의 조상.", isMain: false },

  { id: "nimrod", name: "니므롯", engName: "Nimrod", gender: "M", generation: 12, column: -5.4, parents: ["cush"], spouses: [], desc: "세상의 첫 용사요, 여호와 앞의 특이한 사냥꾼. 바벨탑 주도자.", isMain: false },
  { id: "shelah", name: "셀라", engName: "Shelah", gender: "M", generation: 12, column: 0, parents: ["arpachshad"], spouses: [], desc: "아르박삿의 아들.", isMain: true },

  // Generation 13
  { id: "eber", name: "에벨", engName: "Eber", gender: "M", generation: 13, column: 0, parents: ["shelah"], spouses: [], desc: "히브리(Hebrew) 민족이라는 명칭의 유래가 된 조상.", isMain: true },

  // Generation 14
  { id: "peleg", name: "벨렉", engName: "Peleg", gender: "M", generation: 14, column: 0, parents: ["eber"], spouses: [], desc: "그 시대에 바벨탑 사건으로 세상 민족들이 나뉘었음.", isMain: true },
  { id: "joktan", name: "욕단", engName: "Joktan", gender: "M", generation: 14, column: -9.2, parents: ["eber"], spouses: [], desc: "벨렉의 형제. 아라비아 민족들의 조상이 됨.", isMain: false, isManual: true },

  // Generation 15 (Joktan's 12 sons aligned horizontally with a 10px gap, Uzal deleted)
  { id: "almodad", name: "알모닷", engName: "Almodad", gender: "M", generation: 15, column: -12.9125, parents: ["joktan"], spouses: [], desc: "욕단의 첫째 아들.", isMain: false, isManual: true },
  { id: "sheleph", name: "셀렙", engName: "Sheleph", gender: "M", generation: 15, column: -12.2375, parents: ["joktan"], spouses: [], desc: "욕단의 둘째 아들.", isMain: false, isManual: true },
  { id: "hazarmaveth", name: "하살마웹", engName: "Hazarmaveth", gender: "M", generation: 15, column: -11.5625, parents: ["joktan"], spouses: [], desc: "욕단의 셋째 아들.", isMain: false, isManual: true },
  { id: "jerah", name: "예라", engName: "Jerah", gender: "M", generation: 15, column: -10.8875, parents: ["joktan"], spouses: [], desc: "욕단의 넷째 아들.", isMain: false, isManual: true },
  { id: "hadoram", name: "하도람", engName: "Hadoram", gender: "M", generation: 15, column: -10.2125, parents: ["joktan"], spouses: [], desc: "욕단의 다섯째 아들.", isMain: false, isManual: true },
  { id: "diklah", name: "디글라", engName: "Diklah", gender: "M", generation: 15, column: -9.5375, parents: ["joktan"], spouses: [], desc: "욕단의 여섯째 아들.", isMain: false, isManual: true },
  { id: "obal", name: "오발", engName: "Obal", gender: "M", generation: 15, column: -8.8625, parents: ["joktan"], spouses: [], desc: "욕단의 일곱째 아들.", isMain: false, isManual: true },
  { id: "abimael", name: "아비마엘", engName: "Abimael", gender: "M", generation: 15, column: -8.1875, parents: ["joktan"], spouses: [], desc: "욕단의 여덟째 아들.", isMain: false, isManual: true },
  { id: "sheba_joktan", name: "스바(욕단)", engName: "Sheba", gender: "M", generation: 15, column: -7.5125, parents: ["joktan"], spouses: [], desc: "욕단의 아홉째 아들.", isMain: false, isManual: true },
  { id: "ophir", name: "오빌", engName: "Ophir", gender: "M", generation: 15, column: -6.8375, parents: ["joktan"], spouses: [], desc: "욕단의 열째 아들.", isMain: false, isManual: true },
  { id: "havilah_joktan", name: "하윌라(욕단)", engName: "Havilah", gender: "M", generation: 15, column: -6.1625, parents: ["joktan"], spouses: [], desc: "욕단의 열한째 아들.", isMain: false, isManual: true },
  { id: "jobab", name: "요밥", engName: "Jobab", gender: "M", generation: 15, column: -5.4875, parents: ["joktan"], spouses: [], desc: "욕단의 열두째 아들.", isMain: false, isManual: true },

  // Generation 15
  { id: "reu", name: "르우", engName: "Reu", gender: "M", generation: 15, column: 0, parents: ["peleg"], spouses: [], desc: "벨렉의 아들.", isMain: true },

  // Generation 16
  { id: "serug", name: "스룩", engName: "Serug", gender: "M", generation: 16, column: 0, parents: ["reu"], spouses: [], desc: "르우의 아들. 우상 숭배가 본격화된 시대의 조상.", isMain: true },

  // Generation 17
  { id: "nahor_ancestor", name: "나홀(조상)", engName: "Nahor", gender: "M", generation: 17, column: 0, parents: ["serug"], spouses: [], desc: "스룩의 아들. 아브라함의 할아버지.", isMain: true },

  // Generation 18
  { id: "terah", name: "데라", engName: "Terah", gender: "M", generation: 18, column: 0, parents: ["nahor_ancestor"], spouses: [], desc: "갈대아 우르에서 바벨론 우상을 만들던 아버지. 하란에서 사망.", isMain: true },

  // Generation 19
  { id: "abraham", name: "아브라함", engName: "Abraham", gender: "M", generation: 19, column: 0, parents: ["terah"], spouses: ["sarah", "hagar", "keturah"], desc: "믿음의 조상. 갈대아 우르를 떠나 가나안으로 향한 언약의 사람.", isMain: true },
  { id: "sarah", name: "사라", engName: "Sarah", gender: "F", generation: 19, column: 1.2, parents: [], spouses: ["abraham"], desc: "열국의 어머니. 90세에 하나님의 약속대로 이삭을 출산함.", isMain: true },
  { id: "hagar", name: "하갈", engName: "Hagar", gender: "F", generation: 19, column: -3.5, parents: [], spouses: ["abraham"], desc: "사라의 여종. 아브라함의 서자 이스마엘을 낳음.", isMain: false },
  { id: "keturah", name: "그두라", engName: "Keturah", gender: "F", generation: 19, column: -5.5, parents: [], spouses: ["abraham"], desc: "사라 사후 아브라함이 맞이한 후처. 미디안을 포함한 여섯 아들을 낳음.", isMain: false },
  
  { id: "nahor", name: "나홀(형제)", engName: "Nahor", gender: "M", generation: 19, column: 2.5, parents: ["terah"], spouses: ["milcah"], desc: "아브라함의 형제. 하란에 잔류함.", isMain: false },
  { id: "milcah", name: "밀가", engName: "Milcah", gender: "F", generation: 19, column: 3.7, parents: [], spouses: ["nahor"], desc: "나홀의 아내. 하란의 딸.", isMain: false },
  { id: "haran", name: "하란", engName: "Haran", gender: "M", generation: 19, column: -5.0, parents: ["terah"], spouses: [], desc: "갈대아 우르에서 먼저 죽은 아브라함의 형제. 롯의 아버지.", isMain: false },

  // Generation 20
  { id: "isaac", name: "이삭", engName: "Isaac", gender: "M", generation: 20, column: 0, parents: ["abraham", "sarah"], spouses: ["rebekah"], desc: "약속의 독자. 모리아 산에서 번제물로 드려졌던 자.", isMain: true },
  { id: "rebekah", name: "리브가", engName: "Rebekah", gender: "F", generation: 20, column: 1.2, parents: [], spouses: ["isaac"], desc: "이삭의 아내. 브두엘의 딸.", isMain: true },
  
  { id: "ishmael", name: "이스마엘", engName: "Ishmael", gender: "M", generation: 20, column: -3.5, parents: ["abraham", "hagar"], spouses: [], desc: "아브라함의 장자였으나 육신을 따라 태어나 약속의 상속에서 제외됨.", isMain: false },
  { id: "zimran", name: "시므란", engName: "Zimran", gender: "M", generation: 21, column: -5.5, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  { id: "jokshan", name: "욕산", engName: "Jokshan", gender: "M", generation: 22, column: -5.5, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들. 스바와 드단의 아버지.", isMain: false },
  { id: "medan", name: "므단", engName: "Medan", gender: "M", generation: 23, column: -5.5, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  { id: "midian", name: "미디안", engName: "Midian", gender: "M", generation: 24, column: -5.5, parents: ["abraham", "keturah"], spouses: [], desc: "미디안 족속의 조상.", isMain: false },
  { id: "ishbak", name: "이스박", engName: "Ishbak", gender: "M", generation: 25, column: -5.5, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  { id: "shuah", name: "수아", engName: "Shuah", gender: "M", generation: 26, column: -5.5, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  
  { id: "lot", name: "롯", engName: "Lot", gender: "M", generation: 20, column: -7.5, parents: ["haran"], spouses: ["lot_wife"], desc: "아브라함의 조카. 소돔과 고모라 멸망 때 구출됨.", isMain: false },
  { id: "lot_wife", name: "롯의 아내", engName: "Lot's Wife", gender: "F", generation: 20, column: -8.7, parents: [], spouses: ["lot"], desc: "뒤를 돌아보아 소금 기둥이 됨.", isMain: false },
  { id: "milcah_daughter", name: "밀가", engName: "Milcah", gender: "F", generation: 20, column: -9.9, parents: ["haran"], spouses: [], desc: "하란의 딸. 나홀의 아내가 됨.", isMain: false },
  
  { id: "bethuel", name: "브두엘", engName: "Bethuel", gender: "M", generation: 20, column: 2.5, parents: ["nahor", "milcah"], spouses: [], desc: "나홀 and 밀가의 아들. 리브가와 라반의 아버지.", isMain: false },

  // Generation 21
  { id: "jacob", name: "야곱", engName: "Jacob", gender: "M", generation: 21, column: 0, parents: ["isaac", "rebekah"], spouses: ["leah", "rachel", "bilhah", "zilpah"], desc: "이스라엘이라 이름을 바꾼 언약의 후손. 12지파의 아버지.", isMain: true },
  { id: "leah", name: "레아", engName: "Leah", gender: "F", generation: 21, column: 1.2, parents: [], spouses: ["jacob"], desc: "야곱의 아내. 라반의 딸.", isMain: true },
  { id: "rachel", name: "라헬", engName: "Rachel", gender: "F", generation: 21, column: 2.4, parents: [], spouses: ["jacob"], desc: "야곱의 아내. 라반의 딸.", isMain: false },
  { id: "bilhah", name: "빌하", engName: "Bilhah", gender: "F", generation: 21, column: -1.2, parents: [], spouses: ["jacob"], desc: "라헬의 몸종이자 야곱의 첩. 단과 납탈리를 낳음.", isMain: false },
  { id: "zilpah", name: "실바", engName: "Zilpah", gender: "F", generation: 21, column: -2.4, parents: [], spouses: ["jacob"], desc: "레아의 몸종이자 야곱의 첩. 갓과 아셀을 낳음.", isMain: false },
  
  { id: "esau", name: "에돔(에서)", engName: "Esau", gender: "M", generation: 21, column: 5.0, parents: ["isaac", "rebekah"], spouses: ["adah_esau", "basemath_esau", "oholibamah"], desc: "이삭의 장자. 팥죽 한 그릇에 장자권을 팔고 에돔 민족의 조상이 됨.", isMain: false },
  { id: "adah_esau", name: "아다(에서처)", engName: "Adah", gender: "F", generation: 21, column: 6.2, parents: [], spouses: ["esau"], desc: "에서의 아내. 엘론의 딸.", isMain: false },
  { id: "basemath_esau", name: "바스맛", engName: "Basemath", gender: "F", generation: 21, column: 7.4, parents: [], spouses: ["esau"], desc: "에서의 아내. 이스마엘의 딸.", isMain: false },
  { id: "oholibamah", name: "오홀리바마", engName: "Oholibamah", gender: "F", generation: 21, column: 8.6, parents: [], spouses: ["esau"], desc: "에서의 아내. 아나의 딸.", isMain: false },

  { id: "laban", name: "라반", engName: "Laban", gender: "M", generation: 21, column: 11.0, parents: ["bethuel"], spouses: [], desc: "리브가의 오라버니이자 레아와 라헬의 아버지. 야곱의 외삼촌.", isMain: false, isManual: true },
  { id: "rebekah_daughter", name: "리브가", engName: "Rebekah", gender: "F", generation: 21, column: 4.7, parents: ["bethuel"], spouses: [], desc: "브두엘의 딸. 이삭의 아내가 됨.", isMain: true, isManual: true },
  
  { id: "moab", name: "모압", engName: "Moab", gender: "M", generation: 21, column: -14.0, parents: ["lot"], spouses: [], desc: "롯의 큰딸에게서 태어난 모압 족속의 조상.", isMain: false },
  { id: "benammi", name: "벤암미", engName: "Ben-Ammi", gender: "M", generation: 21, column: -13.0, parents: ["lot"], spouses: [], desc: "롯의 작은딸에게서 태어난 암몬 족속의 조상.", isMain: false },

  // Jokshan's & Midian's children (Gen 21 Keturah branch)
  { id: "sheba_keturah", name: "스바(그두라계)", engName: "Sheba", gender: "M", generation: 23, column: -6.7, parents: ["jokshan"], spouses: [], desc: "욕산의 아들.", isMain: false },
  { id: "dedan_keturah", name: "드단", engName: "Dedan", gender: "M", generation: 24, column: -6.7, parents: ["jokshan"], spouses: [], desc: "욕산의 아들.", isMain: false },
  { id: "ephah", name: "에바", engName: "Ephah", gender: "M", generation: 25, column: -6.7, parents: ["midian"], spouses: [], desc: "미디안의 첫째 아들.", isMain: false },
  { id: "epher_midian", name: "에벨(미디안)", engName: "Epher", gender: "M", generation: 26, column: -6.7, parents: ["midian"], spouses: [], desc: "미디안의 둘째 아들.", isMain: false },
  { id: "hanoch_midian", name: "하녹(미디안)", engName: "Hanoch", gender: "M", generation: 27, column: -6.7, parents: ["midian"], spouses: [], desc: "미디안의 셋째 아들.", isMain: false },
  { id: "abida", name: "아비다", engName: "Abida", gender: "M", generation: 28, column: -6.7, parents: ["midian"], spouses: [], desc: "미디안의 넷째 아들.", isMain: false },
  { id: "eldaah", name: "엘다아", engName: "Eldaah", gender: "M", generation: 29, column: -6.7, parents: ["midian"], spouses: [], desc: "미디안의 다섯째 아들.", isMain: false },

  // Ishmael's 12 sons (Gen 21 stacked vertically on the left)
  { id: "nebaioth", name: "느바욧", engName: "Nebaioth", gender: "M", generation: 21, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 첫째 아들. 유목민 느바욧 부족의 조상.", isMain: false },
  { id: "kedar", name: "게달", engName: "Kedar", gender: "M", generation: 22, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 둘째 아들. 유목 성향의 강력한 게달 부족의 조상.", isMain: false },
  { id: "adbeel", name: "아드벱", engName: "Adbeel", gender: "M", generation: 23, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 셋째 아들.", isMain: false },
  { id: "mibsam", name: "밉삼", engName: "Mibsam", gender: "M", generation: 24, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 넷째 아들.", isMain: false },
  { id: "mishma", name: "미스마", engName: "Mishma", gender: "M", generation: 25, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 다섯째 아들.", isMain: false },
  { id: "dumah", name: "두마", engName: "Dumah", gender: "M", generation: 26, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 여섯째 아들.", isMain: false },
  { id: "massa", name: "맛사", engName: "Massa", gender: "M", generation: 27, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 일곱째 아들.", isMain: false },
  { id: "hadad", name: "하닷", engName: "Hadad", gender: "M", generation: 28, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 여덟째 아들.", isMain: false },
  { id: "tema", name: "데마", engName: "Tema", gender: "M", generation: 29, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 아홉째 아들.", isMain: false },
  { id: "jetur", name: "여둘", engName: "Jetur", gender: "M", generation: 30, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 열째 아들.", isMain: false },
  { id: "naphish", name: "나비스", engName: "Naphish", gender: "M", generation: 31, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 열한째 아들.", isMain: false },
  { id: "kedemah", name: "게드마", engName: "Kedemah", gender: "M", generation: 32, column: -3.5, parents: ["ishmael"], spouses: [], desc: "이스마엘의 열두째 아들.", isMain: false },

  // Generation 22
  { id: "reuben", name: "르우벤", engName: "Reuben", gender: "M", generation: 22, column: -4.6, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 장자. 서모 빌하와의 죄로 장자권을 상실함.", isMain: false },
  { id: "simeon", name: "시므온", engName: "Simeon", gender: "M", generation: 22, column: -3.4, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 둘째 아들. 레위와 함께 세겜 학살을 주도함.", isMain: false },
  { id: "levi", name: "레위", engName: "Levi", gender: "M", generation: 22, column: -2.2, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 셋째 아들. 제사장 지파의 조상이 됨.", isMain: false },
  { id: "judah", name: "유다", engName: "Judah", gender: "M", generation: 22, column: 0, parents: ["jacob", "leah"], spouses: ["tamar"], desc: "넷째 아들. 형제들의 중보자이자 다윗과 예수 그리스도의 왕권 지파.", isMain: true },
  { id: "tamar", name: "다말", engName: "Tamar", gender: "F", generation: 22, column: 1.2, parents: [], spouses: ["judah"], desc: "유다의 며느리였으나 대를 잇기 위해 시아버지 유다에게서 쌍둥이를 낳음.", isMain: true },
  
  { id: "dan", name: "단", engName: "Dan", gender: "M", generation: 22, column: -7.0, parents: ["jacob", "bilhah"], spouses: [], desc: "단 지파의 조상. 훗날 우상 숭배의 중심지가 됨.", isMain: false },
  { id: "naphtali", name: "납달리", engName: "Naphtali", gender: "M", generation: 22, column: -5.8, parents: ["jacob", "bilhah"], spouses: [], desc: "납달리 지파의 조상. 아름다운 소리를 발하는 자.", isMain: false },
  { id: "gad", name: "갓", engName: "Gad", gender: "M", generation: 22, column: -9.6, parents: ["jacob", "zilpah"], spouses: [], desc: "갓 지파의 조상.", isMain: false },
  { id: "asher", name: "아셀", engName: "Aser", gender: "M", generation: 22, column: -8.4, parents: ["jacob", "zilpah"], spouses: [], desc: "아셀 지파의 조상. 기름진 음식을 낼 자.", isMain: false },
  
  { id: "issachar", name: "잇사갈", engName: "Issachar", gender: "M", generation: 22, column: 1.2, parents: ["jacob", "leah"], spouses: [], desc: "잇사갈 지파의 조상.", isMain: false },
  { id: "zebulun", name: "스불론", engName: "Zebulun", gender: "M", generation: 22, column: 2.4, parents: ["jacob", "leah"], spouses: [], desc: "스불론 지파의 조상. 해변에 거주하며 배를 대는 자.", isMain: false },
  { id: "dinah", name: "디나", engName: "Dinah", gender: "F", generation: 22, column: 3.6, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 유일한 딸. 세겜 추장 사건으로 시므온 and 레위가 분노함.", isMain: false },
  { id: "joseph", name: "요셉", engName: "Joseph", gender: "M", generation: 22, column: 4.8, parents: ["jacob", "rachel"], spouses: ["asenath"], desc: "꿈의 사람. 형제들에 의해 이집트에 팔렸으나 국무총리가 되어 가문을 구함.", isMain: false },
  { id: "asenath", name: "아스낫", engName: "Asenath", gender: "F", generation: 22, column: 6.0, parents: [], spouses: ["joseph"], desc: "이집트 온의 제사장 보디베라의 딸이자 요셉의 아내.", isMain: false },
  { id: "benjamin", name: "베냐민", engName: "Benjamin", gender: "M", generation: 22, column: 7.2, parents: ["jacob", "rachel"], spouses: [], desc: "야곱의 막내 아들. 오른손의 아들이라는 뜻.", isMain: false },
  
  { id: "leah_daughter", name: "레아", engName: "Leah", gender: "F", generation: 22, column: 11.0, parents: ["laban"], spouses: [], desc: "라반의 첫째 딸. 야곱의 아내가 됨.", isMain: true, isManual: true },
  { id: "rachel_daughter", name: "라헬", engName: "Rachel", gender: "F", generation: 22, column: 11.7, parents: ["laban"], spouses: [], desc: "라반의 둘째 딸. 야곱의 아내가 됨.", isMain: false, isManual: true },

  // Esau's sons (Gen 22 Edom branch)
  { id: "eliphaz", name: "엘리바스", engName: "Eliphaz", gender: "M", generation: 22, column: 5.0, parents: ["esau", "adah_esau"], spouses: ["timna"], desc: "에서의 첫째 아들.", isMain: false },
  { id: "reuel", name: "르우엘", engName: "Reuel", gender: "M", generation: 22, column: 6.2, parents: ["esau", "basemath_esau"], spouses: [], desc: "에서의 둘째 아들.", isMain: false },
  { id: "jeush", name: "여우스", engName: "Jeush", gender: "M", generation: 22, column: 7.4, parents: ["esau", "oholibamah"], spouses: [], desc: "에서의 셋째 아들.", isMain: false },
  { id: "jalam", name: "야알람", engName: "Jalam", gender: "M", generation: 22, column: 8.6, parents: ["esau", "oholibamah"], spouses: [], desc: "에서의 넷째 아들.", isMain: false },
  { id: "korah_edom", name: "고라(에돔)", engName: "Korah", gender: "M", generation: 22, column: 9.8, parents: ["esau", "oholibamah"], spouses: [], desc: "에서의 다섯째 아들.", isMain: false },
  { id: "timna", name: "딤나", engName: "Timna", gender: "F", generation: 22, column: 4.0, parents: [], spouses: ["eliphaz"], desc: "엘리바스의 첩.", isMain: false },

  // Generation 23
  { id: "kohath", name: "고핫", engName: "Kohath", gender: "M", generation: 23, column: -2.2, parents: ["levi"], spouses: [], desc: "레위의 둘째 아들. 모세와 아론의 할아버지.", isMain: false },
  { id: "perez", name: "베레스", engName: "Perez", gender: "M", generation: 23, column: 0, parents: ["judah", "tamar"], spouses: [], desc: "유다와 다말의 아들. 터치고 나왔다는 의미의 이름.", isMain: true },
  { id: "zerah", name: "세라", engName: "Zerah", gender: "M", generation: 23, column: 1.5, parents: ["judah", "tamar"], spouses: [], desc: "베레스의 쌍둥이 형제. 홍색 실을 손에 맸던 자.", isMain: false },
  
  { id: "manasseh", name: "므나쎄", engName: "Manasseh", gender: "M", generation: 23, column: 4.8, parents: ["joseph", "asenath"], spouses: [], desc: "요셉의 장남. 하나님이 내 고난을 잊게 하셨다는 뜻.", isMain: false },
  { id: "ephraim", name: "에브라임", engName: "Ephraim", gender: "M", generation: 23, column: 6.0, parents: ["joseph", "asenath"], spouses: [], desc: "요셉의 차남. 야곱에게 장자의 축복을 우선 받음.", isMain: false },

  // Esau's grandsons (Gen 23 Edom branch)
  { id: "teman", name: "데만", engName: "Teman", gender: "M", generation: 23, column: 3.5, parents: ["eliphaz"], spouses: [], desc: "엘리바스의 첫째 아들. 에돔의 족장.", isMain: false },
  { id: "omar", name: "오말", engName: "Omar", gender: "M", generation: 23, column: 4.3, parents: ["eliphaz"], spouses: [], desc: "엘리바스의 둘째 아들.", isMain: false },
  { id: "zepho", name: "스보", engName: "Zepho", gender: "M", generation: 23, column: 5.1, parents: ["eliphaz"], spouses: [], desc: "엘리바스의 셋째 아들.", isMain: false },
  { id: "gatam", name: "가담", engName: "Gatam", gender: "M", generation: 23, column: 5.9, parents: ["eliphaz"], spouses: [], desc: "엘리바스의 넷째 아들.", isMain: false },
  { id: "kenaz", name: "그나스", engName: "Kenaz", gender: "M", generation: 23, column: 6.7, parents: ["eliphaz"], spouses: [], desc: "엘리바스의 다섯째 아들.", isMain: false },
  { id: "amalek", name: "아말렉", engName: "Amalek", gender: "M", generation: 23, column: 2.7, parents: ["eliphaz", "timna"], spouses: [], desc: "아말렉 족속의 조상.", isMain: false },
  { id: "nahath", name: "나핫", engName: "Nahath", gender: "M", generation: 23, column: 7.5, parents: ["reuel"], spouses: [], desc: "르우엘의 첫째 아들.", isMain: false },
  { id: "zerah_edom", name: "세라(에돔)", engName: "Zerah", gender: "M", generation: 23, column: 8.3, parents: ["reuel"], spouses: [], desc: "르우엘의 둘째 아들.", isMain: false },
  { id: "shammah", name: "삼마", engName: "Shammah", gender: "M", generation: 23, column: 9.1, parents: ["reuel"], spouses: [], desc: "르우엘의 셋째 아들.", isMain: false },
  { id: "mizzah", name: "미사", engName: "Mizzah", gender: "M", generation: 23, column: 9.9, parents: ["reuel"], spouses: [], desc: "르우엘의 넷째 아들.", isMain: false },

  // Generation 24
  { id: "amram", name: "아므람", engName: "Amram", gender: "M", generation: 24, column: 3.0, parents: ["kohath"], spouses: ["jochebed"], desc: "고핫의 아들이자 모세, 아론의 아버지.", isMain: false, isManual: true },
  { id: "jochebed", name: "요게벳", engName: "Jochebed", gender: "F", generation: 24, column: 1.8, parents: [], spouses: ["amram"], desc: "모세의 어머니. 갈상자에 모세를 담아 나일강에 띄운 여인.", isMain: false, isManual: true },
  { id: "izhar", name: "이스할", engName: "Izhar", gender: "M", generation: 24, column: -1.0, parents: ["kohath"], spouses: [], desc: "고핫의 아들. 아므람의 형제.", isMain: false },
  { id: "hezron", name: "헤스론", engName: "Hezron", gender: "M", generation: 24, column: 0, parents: ["perez"], spouses: [], desc: "베레스의 아들.", isMain: true },

  // Generation 25
  { id: "aaron", name: "아론", engName: "Aaron", gender: "M", generation: 25, column: 3.0, parents: ["amram", "jochebed"], spouses: ["elisheba"], desc: "이스라엘 초대 대제사장. 모세의 대언자요 형.", isMain: false, isManual: true },
  { id: "elisheba", name: "엘리세바", engName: "Elisheba", gender: "F", generation: 25, column: 1.8, parents: [], spouses: ["aaron"], desc: "아론의 아내. 아민아답의 딸.", isMain: false, isManual: true },
  { id: "moses", name: "모세", engName: "Moses", gender: "M", generation: 25, column: 4.8, parents: ["amram", "jochebed"], spouses: ["zipporah"], desc: "출애굽의 영도자요 율법 수여자. 시내산 언약의 중보자.", isMain: false, isManual: true },
  { id: "zipporah", name: "십보라", engName: "Zipporah", gender: "F", generation: 25, column: 6.0, parents: [], spouses: ["moses"], desc: "미디안 제사장 이드로의 딸이자 모세의 아내.", isMain: false, isManual: true },
  { id: "miriam", name: "미리암", engName: "Miriam", gender: "F", generation: 25, column: 0.6, parents: ["amram", "jochebed"], spouses: [], desc: "여선지자. 모세와 아론의 누이.", isMain: false, isManual: true },
  { id: "korah", name: "고라", engName: "Korah", gender: "M", generation: 25, column: -1.0, parents: ["izhar"], spouses: [], desc: "모세와 아론에게 반역하다 땅이 갈라져 삼킴을 당함.", isMain: false },
  { id: "ram", name: "람", engName: "Ram", gender: "M", generation: 25, column: 0, parents: ["hezron"], spouses: [], desc: "헤스론의 아들.", isMain: true },

  // Generation 26
  { id: "nadab", name: "나답", engName: "Nadab", gender: "M", generation: 26, column: 1.2, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 장남. 여호와께서 명하지 않은 다른 불을 드리다 심판 받아 사망.", isMain: false, isManual: true },
  { id: "abihu", name: "아비후", engName: "Abihu", gender: "M", generation: 26, column: 2.4, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 차남. 형 나답과 함께 다른 불을 드려 사망.", isMain: false, isManual: true },
  { id: "eleazar_priest", name: "엘르아살", engName: "Eleazar", gender: "M", generation: 26, column: 3.6, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 삼남. 아론 사후 2대 대제사장이 됨.", isMain: false, isManual: true },
  { id: "ithamar", name: "이다말", engName: "Ithamar", gender: "M", generation: 26, column: 4.8, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 막내 아들. 성막 물품을 계수하고 관리함.", isMain: false, isManual: true },
  { id: "gershom", name: "게르솜", engName: "Gershom", gender: "M", generation: 26, column: 6.0, parents: ["moses", "zipporah"], spouses: [], desc: "모세의 첫째 아들. '내가 이방에서 객이 되었다'는 뜻.", isMain: false, isManual: true },
  { id: "eliezer_moses", name: "엘리에셀", engName: "Eliezer", gender: "M", generation: 26, column: 7.2, parents: ["moses", "zipporah"], spouses: [], desc: "모세의 둘째 아들. '하나님이 나를 도우사 바로의 칼에서 구하셨다'는 뜻.", isMain: false, isManual: true },
  { id: "amminadab", name: "암미나답", engName: "Amminadab", gender: "M", generation: 26, column: 0, parents: ["ram"], spouses: [], desc: "광야 행진 시 유다 지파 지도자 아론의 장인.", isMain: true },

  // Generation 27
  { id: "nahshon", name: "나손", engName: "Nahshon", gender: "M", generation: 27, column: 0, parents: ["amminadab"], spouses: [], desc: "유다 지파의 방백. 광야 여정에서 첫째로 헌물을 드림.", isMain: true },

  // Generation 28
  { id: "salmon", name: "살몬", engName: "Salmon", gender: "M", generation: 28, column: 0, parents: ["nahshon"], spouses: ["rahab"], desc: "가나안 정복의 지도자 중 하나. 여리고 기생 라합과 결혼함.", isMain: true },
  { id: "rahab", name: "라합", engName: "Rahab", gender: "F", generation: 28, column: 1.2, parents: [], spouses: ["salmon"], desc: "여리고 기생. 이스라엘 정탐꾼을 숨겨주어 구원을 얻고 예수 조상이 됨.", isMain: true },

  // Generation 29
  { id: "boaz", name: "보아스", engName: "Boaz", gender: "M", generation: 29, column: 0, parents: ["salmon", "rahab"], spouses: ["ruth"], desc: "유력한 자. 이방 여인 룻의 기업 무를 자(Goel)가 됨.", isMain: true },
  { id: "ruth", name: "룻", engName: "Ruth", gender: "F", generation: 29, column: 1.2, parents: [], spouses: ["boaz"], desc: "모압 여인. 나오미를 따라 이스라엘로 와 다윗 왕의 증조모가 됨.", isMain: true },

  // Generation 30
  { id: "obed", name: "오벳", engName: "Obed", gender: "M", generation: 30, column: 0, parents: ["boaz", "ruth"], spouses: [], desc: "보아스와 룻의 아들. 다윗의 할아버지.", isMain: true },
  { id: "kish", name: "기스", engName: "Kish", gender: "M", generation: 30, column: 5.6, parents: ["benjamin"], spouses: [], desc: "베냐민 사람 아비엘의 아들. 초대 왕 사울의 아버지.", isMain: false },

  // Generation 31
  { id: "jesse", name: "이새", engName: "Jesse", gender: "M", generation: 31, column: 0, parents: ["obed"], spouses: [], desc: "베들레헴 주민. 다윗을 비롯한 여덟 아들의 아버지.", isMain: true },
  { id: "saul", name: "사울 왕", engName: "Saul", gender: "M", generation: 31, column: 5.6, parents: ["kish"], spouses: [], desc: "이스라엘의 초대 왕. 교만함으로 여호와께 버림받음.", isMain: false },
  { id: "zeruiah", name: "스루야", engName: "Zeruiah", gender: "F", generation: 31, column: -1.2, parents: ["jesse"], spouses: [], desc: "다윗의 누이. 요압, 아비새, 아사헬 삼형제의 어머니.", isMain: false },

  // Generation 32
  { id: "david", name: "다윗 왕", engName: "David", gender: "M", generation: 32, column: 0, parents: ["jesse"], spouses: ["bathsheba", "michal"], desc: "이스라엘 제2대 성왕. 하나님 마음에 합한 자. 메시아 언약 수여자.", isMain: true },
  { id: "bathsheba", name: "밧세바", engName: "Bathsheba", gender: "F", generation: 32, column: 1.2, parents: [], spouses: ["david"], desc: "우리야의 아내였으나 다윗과의 비극 후 솔로몬을 낳아 왕위를 계승시킴.", isMain: true },
  { id: "michal", name: "미갈", engName: "Michal", gender: "F", generation: 32, column: 2.4, parents: [], spouses: ["david"], desc: "다윗 왕의 아내. 사울 왕의 딸.", isMain: false },
  { id: "jonathan", name: "요나단", engName: "Jonathan", gender: "M", generation: 32, column: 4.4, parents: ["saul"], spouses: [], desc: "사울의 아들. 다윗의 가장 진실한 친구이자 조력자.", isMain: false },
  { id: "ishbosheth", name: "이스보셋 왕", engName: "Ish-bosheth", gender: "M", generation: 32, column: 5.6, parents: ["saul"], spouses: [], desc: "사울 사후 마하나임에서 2년간 북이스라엘을 통치한 왕.", isMain: false },
  { id: "michal_daughter", name: "미갈", engName: "Michal", gender: "F", generation: 32, column: 6.8, parents: ["saul"], spouses: [], desc: "사울 왕의 딸. 다윗 왕의 첫 번째 아내가 됨.", isMain: false },
  
  { id: "abishai", name: "아비새", engName: "Abishai", gender: "M", generation: 32, column: -3.6, parents: ["zeruiah"], spouses: [], desc: "다윗의 용사. 요압의 아우로 에돔인들을 격파함.", isMain: false },
  { id: "joab", name: "요압", engName: "Joab", gender: "M", generation: 32, column: -2.4, parents: ["zeruiah"], spouses: [], desc: "다윗 왕의 군대장관. 정략적이고 용맹한 군장.", isMain: false },
  { id: "asahel", name: "아사헬", engName: "Asahel", gender: "M", generation: 32, column: -1.2, parents: ["zeruiah"], spouses: [], desc: "들노루 같이 빠른 다윗의 용사. 아브넬에게 살해됨.", isMain: false },

  // Generation 33
  { id: "solomon", name: "솔로몬 왕", engName: "Solomon", gender: "M", generation: 33, column: 0, parents: ["david", "bathsheba"], spouses: ["naamah_ammon"], desc: "지혜의 왕. 예루살렘 성전을 건축함. 말년에 우상 숭배의 죄를 범함.", isMain: true },
  { id: "naamah_ammon", name: "나아마(암몬녀)", engName: "Naamah", gender: "F", generation: 33, column: 1.2, parents: [], spouses: ["solomon"], desc: "암몬 여인. 르호보암 왕의 어머니.", isMain: true },
  { id: "nathan", name: "나단(다윗아들)", engName: "Nathan", gender: "M", generation: 33, column: -2.5, parents: ["david", "bathsheba"], spouses: [], desc: "다윗과 밧세바의 아들. 누가복음 3장에 수록된 예수의 모계 조상.", isMain: false },
  { id: "mephibosheth", name: "므비보셋", engName: "Mephibosheth", gender: "M", generation: 33, column: 4.4, parents: ["jonathan"], spouses: [], desc: "요나단의 아들. 두 발을 다 절며 다윗 왕의 상에서 먹음.", isMain: false },

  // Generation 34
  { id: "rehoboam", name: "르호보암 왕", engName: "Rehoboam", gender: "M", generation: 34, column: 0, parents: ["solomon", "naamah_ammon"], spouses: ["maacah"], desc: "솔로몬의 아들. 어리석은 통치로 나라가 이스라엘과 유다로 분열됨.", isMain: true },
  { id: "maacah", name: "마아가", engName: "Maacah", gender: "F", generation: 34, column: 1.2, parents: [], spouses: ["rehoboam"], desc: "압살롬의 손녀이자 르호보암의 아내. 아비야의 어머니.", isMain: true },

  // Generation 35
  { id: "abijah", name: "아비야 왕", engName: "Abijah", gender: "M", generation: 35, column: 0, parents: ["rehoboam", "maacah"], spouses: [], desc: "르호보암의 아들. 북이스라엘 여로보암과의 전쟁에서 여호와를 의지해 승리함.", isMain: true },

  // Generation 36
  { id: "asa", name: "아사 왕", engName: "Asa", gender: "M", generation: 36, column: 0, parents: ["abijah"], spouses: ["azubah"], desc: "유다의 선한 왕. 종교 개혁을 단행하고 태후 마아가의 위를 폐함.", isMain: true },
  { id: "azubah", name: "아수바", engName: "Azubah", gender: "F", generation: 36, column: 1.2, parents: [], spouses: ["asa"], desc: "아사 왕의 아내. 여호사밧 왕의 어머니.", isMain: true },

  // Generation 37
  { id: "jehoshaphat", name: "여호사밧 왕", engName: "Jehoshaphat", gender: "M", generation: 37, column: 0, parents: ["asa", "azubah"], spouses: [], desc: "종교 및 사법 개혁을 단행한 경건한 왕. 북이스라엘 아합 가문과 사돈을 맺음.", isMain: true },

  // Generation 38
  { id: "jehoram", name: "여호람 왕", engName: "Jehoram", gender: "M", generation: 38, column: 0, parents: ["jehoshaphat"], spouses: ["athaliah"], desc: "여호사밧의 아들. 아합의 딸 아달랴와 결혼해 유다에 우상 숭배를 들여옴.", isMain: true },
  { id: "athaliah", name: "아달랴", engName: "Athaliah", gender: "F", generation: 38, column: 1.2, parents: ["ahab", "jezebel"], spouses: ["jehoram"], desc: "아합 and 이세벨의 딸. 남편 사후 왕실 씨를 말리고 왕위를 찬탈했던 여인.", isMain: false },

  // Generation 39
  { id: "ahaziah", name: "아하시야 왕", engName: "Ahaziah", gender: "M", generation: 39, column: 0, parents: ["jehoram", "athaliah"], spouses: ["zibiah"], desc: "북이스라엘 예후의 혁명 때 예후에게 살해당한 유다 왕.", isMain: true },
  { id: "zibiah", name: "시비야", engName: "Zibiah", gender: "F", generation: 39, column: 1.2, parents: [], spouses: ["ahaziah"], desc: "브엘세바 출신. 요아스 왕의 어머니.", isMain: true },

  // Generation 40
  { id: "joash", name: "요아스 왕", engName: "Joash", gender: "M", generation: 40, column: 0, parents: ["ahaziah", "zibiah"], spouses: ["jehoaddan"], desc: "고모 여호세바가 아달랴의 살육에서 성전에 숨겨 키운 유일한 왕손.", isMain: true },
  { id: "jehoaddan", name: "여호앗단", engName: "Jehoaddan", gender: "F", generation: 40, column: 1.2, parents: [], spouses: ["joash"], desc: "예루살렘 출신 요아스의 아내. 아마샤의 어머니.", isMain: true },

  // Generation 41
  { id: "amaziah", name: "아마샤 왕", engName: "Amaziah", gender: "M", generation: 41, column: 0, parents: ["joash", "jehoaddan"], spouses: ["jecholiah"], desc: "에돔 전쟁에서 승리했으나 에돔 우상을 가져와 음란히 섬김.", isMain: true },
  { id: "jecholiah", name: "여골리야", engName: "Jecholiah", gender: "F", generation: 41, column: 1.2, parents: [], spouses: ["amaziah"], desc: "아마샤 왕의 아내. 웃시야 왕의 어머니.", isMain: true },

  // Generation 42
  { id: "uzziah", name: "웃시야 왕", engName: "Uzziah", gender: "M", generation: 42, column: 0, parents: ["amaziah", "jecholiah"], spouses: ["jerusha"], desc: "아사랴라고도 함. 나라를 부강케 했으나 교만하여 제사하려다 문둥병에 걸림.", isMain: true },
  { id: "jerusha", name: "여루사", engName: "Jerusha", gender: "F", generation: 42, column: 1.2, parents: [], spouses: ["uzziah"], desc: "사독의 딸이자 웃시야 왕의 아내.", isMain: true },

  // Generation 43
  { id: "jotham", name: "요담 왕", engName: "Jotham", gender: "M", generation: 43, column: 0, parents: ["uzziah", "jerusha"], spouses: [], desc: "웃시야의 아들. 성전 윗문을 건축하고 정직히 행함.", isMain: true },

  // Generation 44
  { id: "ahaz", name: "아하스 왕", engName: "Ahaz", gender: "M", generation: 44, column: 0, parents: ["jotham"], spouses: ["abijah_queen"], desc: "유다 최악의 우상 숭배 왕. 아들을 불 가운데로 지나가게 함.", isMain: true },
  { id: "abijah_queen", name: "아비야(아하스아내)", engName: "Abijah", gender: "F", generation: 44, column: 1.2, parents: [], spouses: ["ahaz"], desc: "스가랴의 딸. 히스기야 왕의 어머니.", isMain: true },

  // Generation 45
  { id: "hezekiah", name: "히스기야 왕", engName: "Hezekiah", gender: "M", generation: 45, column: 0, parents: ["ahaz", "abijah_queen"], spouses: ["hephzibah"], desc: "위대한 신앙 개혁가. 앗수르 군대 18만 5천을 물리치고 수명 15년 연장 응답 받음.", isMain: true },
  { id: "hephzibah", name: "헾시바", engName: "Hephzibah", gender: "F", generation: 45, column: 1.2, parents: [], spouses: ["hezekiah"], desc: "히스기야 왕의 아내. 므낫세 왕의 어머니.", isMain: true },

  // Generation 46
  { id: "manasseh_king", name: "므낫세 왕", engName: "Manasseh", gender: "M", generation: 46, column: 0, parents: ["hezekiah", "hephzibah"], spouses: ["meshullemeth"], desc: "유다 중 가장 오래 통치(55년)했으나 가증한 우상을 섬겨 멸망을 자초함. 훗날 포로 중 회개함.", isMain: true },
  { id: "meshullemeth", name: "므술레멧", engName: "Meshullemeth", gender: "F", generation: 46, column: 1.2, parents: [], spouses: ["manasseh_king"], desc: "하루스의 딸. 아몬 왕의 어머니.", isMain: true },

  // Generation 47
  { id: "amon", name: "아몬 왕", engName: "Amon", gender: "M", generation: 47, column: 0, parents: ["manasseh_king", "meshullemeth"], spouses: ["jedidah"], desc: "므낫세의 아들. 아비의 행위를 본받아 악을 행하다 부하들에게 시해당함.", isMain: true },
  { id: "jedidah", name: "여디다", engName: "Jedidah", gender: "F", generation: 47, column: 1.2, parents: [], spouses: ["amon"], desc: "아다야의 딸. 요시야 왕의 어머니.", isMain: true },

  // Generation 48
  { id: "josiah", name: "요시야 왕", engName: "Josiah", gender: "M", generation: 48, column: 0, parents: ["amon", "jedidah"], spouses: ["hamutal", "zebidah"], desc: "유다의 마지막 등불. 성전 수리 중 율법책을 발견하여 신앙 개혁을 단행함.", isMain: true },
  { id: "hamutal", name: "하무달", engName: "Hamutal", gender: "F", generation: 48, column: -1.2, parents: [], spouses: ["josiah"], desc: "요시야의 아내. 여호아하스와 시드기야의 어머니.", isMain: false },
  { id: "zebidah", name: "스비다", engName: "Zebidah", gender: "F", generation: 48, column: 1.2, parents: [], spouses: ["josiah"], desc: "요시야의 아내. 여호야김의 어머니.", isMain: true },

  // Generation 49
  { id: "jehoahaz", name: "여호아하스 왕", engName: "Jehoahaz", gender: "M", generation: 49, column: -3.5, parents: ["josiah", "hamutal"], spouses: [], desc: "요시야의 아들. 3달간 통치 후 이집트로 끌려가 사망.", isMain: false },
  { id: "jehoiakim", name: "여호야김 왕", engName: "Jehoiakim", gender: "M", generation: 49, column: 0, parents: ["josiah", "zebidah"], spouses: ["nehushta"], desc: "본명은 엘리아김. 바벨론의 침공으로 쇠사슬에 묶여 끌려감.", isMain: true },
  { id: "nehushta", name: "느후스다", engName: "Nehushta", gender: "F", generation: 49, column: 1.2, parents: [], spouses: ["jehoiakim"], desc: "여호야김의 아내. 여고냐(여호야긴)의 어머니.", isMain: true },
  { id: "zedekiah", name: "시드기야 왕", engName: "Zedekiah", gender: "M", generation: 49, column: -2, parents: ["josiah", "hamutal"], spouses: [], desc: "유다 마지막 왕. 바벨론 군대에 두 눈이 뽑힌 채 포로로 잡혀감.", isMain: false },

  // Generation 50
  { id: "jeconiah", name: "여고냐(여호야긴)", engName: "Jeconiah", gender: "M", generation: 50, column: 0, parents: ["jehoiakim", "nehushta"], spouses: [], desc: "바벨론에 끌려가 감옥에서 37년 후 석방되어 왕의 대접을 받음. 포로기 계승자.", isMain: true },

  // Generation 51
  { id: "shealtiel", name: "스알디엘", engName: "Shealtiel", gender: "M", generation: 51, column: 0, parents: ["jeconiah", "neri"], spouses: [], desc: "여고냐의 아들. 포로 생활 중 메시아 계보 계승.", isMain: true },

  // Generation 52
  { id: "zerubbabel", name: "스룹바벨", engName: "Zerubbabel", gender: "M", generation: 52, column: 0, parents: ["shealtiel"], spouses: [], desc: "바벨론 포로에서 귀환한 총독. 예루살렘 제2성전을 재건함.", isMain: true },

  // Generation 53
  { id: "abiud", name: "아비훗", engName: "Abiud", gender: "M", generation: 53, column: 0, parents: ["zerubbabel"], spouses: [], desc: "스룹바벨의 아들.", isMain: true },

  // Generation 54
  { id: "eliakim", name: "엘리아김", engName: "Eliakim", gender: "M", generation: 54, column: 0, parents: ["abiud"], spouses: [], desc: "아비훗의 아들.", isMain: true },

  // Generation 55
  { id: "azor", name: "아소르", engName: "Azor", gender: "M", generation: 55, column: 0, parents: ["eliakim"], spouses: [], desc: "엘리아김의 아들.", isMain: true },

  // Generation 56
  { id: "zadok_gen56", name: "사독(예수조상)", engName: "Zadok", gender: "M", generation: 56, column: 0, parents: ["azor"], spouses: [], desc: "아소르의 아들.", isMain: true },

  // Generation 57
  { id: "achim", name: "아킴", engName: "Achim", gender: "M", generation: 57, column: 0, parents: ["zadok_gen56"], spouses: [], desc: "사독의 아들.", isMain: true },

  // Generation 58
  { id: "eliud", name: "엘리웃", engName: "Eliud", gender: "M", generation: 58, column: 0, parents: ["achim"], spouses: [], desc: "아킴의 아들.", isMain: true },

  // Generation 59
  { id: "eleazar", name: "엘르아살(예수조상)", engName: "Eleazar", gender: "M", generation: 59, column: 0, parents: ["eliud"], spouses: [], desc: "엘리웃의 아들.", isMain: true },

  // Generation 60
  { id: "matthan", name: "맛단", engName: "Matthan", gender: "M", generation: 60, column: 0, parents: ["eleazar"], spouses: [], desc: "요셉의 할아버지. 야곱의 아들.", isMain: true },

  // Generation 61
  { id: "jacob_joseph", name: "야겁(요셉아버지)", engName: "Jacob", gender: "M", generation: 61, column: 0, parents: ["matthan"], spouses: [], desc: "맛단의 아들. 마리아의 남편 요셉의 아버지.", isMain: true },
  { id: "heli", name: "헬리", engName: "Heli", gender: "M", generation: 61, column: -2.5, parents: ["matthat_luke2"], spouses: [], desc: "마리아의 친아버지. 누가복음 예수 족보의 마지막 조상.", isMain: false },

  // Generation 62
  { id: "joseph_mary", name: "요셉", engName: "Joseph", gender: "M", generation: 62, column: 0, parents: ["jacob_joseph"], spouses: ["mary"], desc: "목수. 마리아의 남편이자 예수님의 법적 아버지.", isMain: true },
  { id: "mary", name: "마리아", engName: "Mary", gender: "F", generation: 62, column: -2.5, parents: ["heli"], spouses: ["joseph_mary"], desc: "동정녀 성령으로 예수를 잉태하여 순종함으로 하나님의 뜻을 이룬 복된 여인.", isMain: true },

  // Generation 63
  { id: "jesus", name: "예수 그리스도", engName: "Jesus Christ", gender: "M", generation: 63, column: 0, parents: ["joseph_mary", "mary"], spouses: [], desc: "구주, 그리스도, 살아계신 하나님의 아들. 율법의 마침이자 성경의 주인공.", isMain: true },

  // ==========================================
  // MARY'S GENEALOGY (Luke 3 - Nathan Lineage)
  // ==========================================
  { id: "mattatha", name: "맛다다", engName: "Mattatha", gender: "M", generation: 33.9, column: -2.5, parents: ["nathan"], spouses: [], desc: "나단의 아들.", isMain: false },
  { id: "menna", name: "멘나", engName: "Menna", gender: "M", generation: 34.8, column: -2.5, parents: ["mattatha"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "melea", name: "멜레아", engName: "Melea", gender: "M", generation: 35.7, column: -2.5, parents: ["menna"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "eliakim_luke", name: "엘리아김(눅)", engName: "Eliakim", gender: "M", generation: 36.6, column: -2.5, parents: ["melea"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "jonam", name: "요남", engName: "Jonam", gender: "M", generation: 37.5, column: -2.5, parents: ["eliakim_luke"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "joseph_luke1", name: "요셉(눅1)", engName: "Joseph", gender: "M", generation: 38.4, column: -2.5, parents: ["jonam"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "judah_luke1", name: "유다(눅1)", engName: "Judah", gender: "M", generation: 39.3, column: -2.5, parents: ["joseph_luke1"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "simeon_luke", name: "시므온(눅)", engName: "Simeon", gender: "M", generation: 40.2, column: -2.5, parents: ["judah_luke1"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "levi_luke1", name: "레위(눅1)", engName: "Levi", gender: "M", generation: 41.1, column: -2.5, parents: ["simeon_luke"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "matthat_luke1", name: "맛닷(눅1)", engName: "Matthat", gender: "M", generation: 42.0, column: -2.5, parents: ["levi_luke1"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "jorim", name: "요림", engName: "Jorim", gender: "M", generation: 42.9, column: -2.5, parents: ["matthat_luke1"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "eliezer_luke", name: "엘리에셀(눅)", engName: "Eliezer", gender: "M", generation: 43.8, column: -2.5, parents: ["jorim"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "joshua_luke", name: "예수(눅조상)", engName: "Joshua", gender: "M", generation: 44.7, column: -2.5, parents: ["eliezer_luke"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "er_luke", name: "에르", engName: "Er", gender: "M", generation: 45.6, column: -2.5, parents: ["joshua_luke"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "elmadam", name: "엘마담", engName: "Elmadam", gender: "M", generation: 46.5, column: -2.5, parents: ["er_luke"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "cosam", name: "코삼", engName: "Cosam", gender: "M", generation: 47.4, column: -2.5, parents: ["elmadam"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "addi", name: "아디", engName: "Addi", gender: "M", generation: 48.3, column: -2.5, parents: ["cosam"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "melchi_luke1", name: "멜기(눅1)", engName: "Melchi", gender: "M", generation: 49.2, column: -2.5, parents: ["addi"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "neri", name: "네리", engName: "Neri", gender: "M", generation: 50.1, column: -2.5, parents: ["melchi_luke1"], spouses: [], desc: "스알디엘의 눅 계열 친부.", isMain: false },
  
  { id: "rhesa", name: "레사", engName: "Rhesa", gender: "M", generation: 52.5, column: -2.5, parents: ["zerubbabel"], spouses: [], desc: "스룹바벨의 아들.", isMain: false },
  { id: "joanan", name: "요아난", engName: "Joanan", gender: "M", generation: 53.0, column: -2.5, parents: ["rhesa"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "joda", name: "요다", engName: "Joda", gender: "M", generation: 53.5, column: -2.5, parents: ["joanan"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "josech", name: "요섹", engName: "Josech", gender: "M", generation: 54.0, column: -2.5, parents: ["joda"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "semein", name: "서머인", engName: "Semein", gender: "M", generation: 54.5, column: -2.5, parents: ["josech"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "mattathias_luke1", name: "맛다디아(눅1)", engName: "Mattathias", gender: "M", generation: 55.0, column: -2.5, parents: ["semein"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "maath", name: "마앗", engName: "Maath", gender: "M", generation: 55.5, column: -2.5, parents: ["mattathias_luke1"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "naggai", name: "낙개", engName: "Naggai", gender: "M", generation: 56.0, column: -2.5, parents: ["maath"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "esli", name: "에슬리", engName: "Esli", gender: "M", generation: 56.5, column: -2.5, parents: ["naggai"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "nahum", name: "나훔", engName: "Nahum", gender: "M", generation: 57.0, column: -2.5, parents: ["esli"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "amos", name: "아모스", engName: "Amos", gender: "M", generation: 57.5, column: -2.5, parents: ["nahum"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "mattathias_luke2", name: "맛다디아(눅2)", engName: "Mattathias", gender: "M", generation: 58.0, column: -2.5, parents: ["amos"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "joseph_luke2", name: "요셉(눅2)", engName: "Joseph", gender: "M", generation: 58.5, column: -2.5, parents: ["mattathias_luke2"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "jannai", name: "얀나", engName: "Jannai", gender: "M", generation: 59.0, column: -2.5, parents: ["joseph_luke2"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "melchi_luke2", name: "멜기(눅2)", engName: "Melchi", gender: "M", generation: 59.5, column: -2.5, parents: ["jannai"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "levi_luke2", name: "레위(눅2)", engName: "Levi", gender: "M", generation: 60.0, column: -2.5, parents: ["melchi_luke2"], spouses: [], desc: "누가복음 3장에 기록된 예수의 조상.", isMain: false },
  { id: "matthat_luke2", name: "맛닷(눅2)", engName: "Matthat", gender: "M", generation: 60.5, column: -2.5, parents: ["levi_luke2"], spouses: [], desc: "헬리의 아버지. 누가복음 3장에 기록된 예수의 조상.", isMain: false }
];
