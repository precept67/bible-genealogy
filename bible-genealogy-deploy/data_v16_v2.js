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
  { id: "hagar", name: "하갈", engName: "Hagar", gender: "F", generation: 19, column: -21.0, parents: [], spouses: ["abraham"], desc: "사라의 여종. 아브라함의 서자 이스마엘을 낳음.", isMain: false },
  { id: "keturah", name: "그두라", engName: "Keturah", gender: "F", generation: 19, column: -38.5, parents: [], spouses: ["abraham"], desc: "사라 사후 아브라함이 맞이한 후처. 미디안을 포함한 여섯 아들을 낳음.", isMain: false },
  
  { id: "nahor", name: "나홀(형제)", engName: "Nahor", gender: "M", generation: 19, column: 2.5, parents: ["terah"], spouses: ["milcah"], desc: "아브라함의 형제. 하란에 잔류함.", isMain: false },
  { id: "milcah", name: "밀가", engName: "Milcah", gender: "F", generation: 19, column: 3.7, parents: [], spouses: ["nahor"], desc: "나홀의 아내. 하란의 딸.", isMain: false },
  { id: "haran", name: "하란", engName: "Haran", gender: "M", generation: 19, column: -5.0, parents: ["terah"], spouses: [], desc: "갈대아 우르에서 먼저 죽은 아브라함의 형제. 롯의 아버지.", isMain: false },

  // Generation 20
  { id: "isaac", name: "이삭", engName: "Isaac", gender: "M", generation: 20, column: 0, parents: ["abraham", "sarah"], spouses: ["rebekah"], desc: "약속의 독자. 모리아 산에서 번제물로 드려졌던 자.", isMain: true },
  { id: "rebekah", name: "리브가", engName: "Rebekah", gender: "F", generation: 20, column: 1.2, parents: [], spouses: ["isaac"], desc: "이삭의 아내. 브두엘의 딸.", isMain: true },
  
  { id: "ishmael", name: "이스마엘", engName: "Ishmael", gender: "M", generation: 20, column: -21.0, parents: ["abraham", "hagar"], spouses: [], desc: "아브라함의 장자였으나 육신을 따라 태어나 약속의 상속에서 제외됨.", isMain: false },
  { id: "zimran", name: "시므란", engName: "Zimran", gender: "M", generation: 20, column: -40.15625, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  { id: "jokshan", name: "욕산", engName: "Jokshan", gender: "M", generation: 20, column: -39.49375, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들. 스바와 드단의 아버지.", isMain: false },
  { id: "medan", name: "므단", engName: "Medan", gender: "M", generation: 20, column: -38.83125, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  { id: "midian", name: "미디안", engName: "Midian", gender: "M", generation: 20, column: -38.16875, parents: ["abraham", "keturah"], spouses: [], desc: "미디안 족속의 조상.", isMain: false },
  { id: "ishbak", name: "이스박", engName: "Ishbak", gender: "M", generation: 20, column: -37.50625, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  { id: "shuah", name: "수아", engName: "Shuah", gender: "M", generation: 20, column: -36.84375, parents: ["abraham", "keturah"], spouses: [], desc: "그두라의 아들.", isMain: false },
  
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
  
  { id: "esau", name: "에돔(에서)", engName: "Esau", gender: "M", generation: 21, column: 5.0, parents: ["isaac", "rebekah"], spouses: ["adah_esau", "basemath_esau", "oholibamah", "mahalath"], desc: "이삭의 장자. 팥죽 한 그릇에 장자권을 팔고 에돔 민족의 조상이 됨.", isMain: false },
  { id: "adah_esau", name: "아다(에서처)", engName: "Adah", gender: "F", generation: 21, column: 6.2, parents: [], spouses: ["esau"], desc: "에서의 아내. 엘론의 딸.", isMain: false },
  { id: "basemath_esau", name: "바스맛", engName: "Basemath", gender: "F", generation: 21, column: 7.4, parents: [], spouses: ["esau"], desc: "에서의 아내. 이스마엘의 딸.", isMain: false },
  { id: "oholibamah", name: "오홀리바마", engName: "Oholibamah", gender: "F", generation: 21, column: 8.6, parents: [], spouses: ["esau"], desc: "에서의 아내. 아나의 딸.", isMain: false },

  { id: "laban", name: "라반", engName: "Laban", gender: "M", generation: 21, column: 11.0, parents: ["bethuel"], spouses: [], desc: "리브가의 오라버니이자 레아와 라헬의 아버지. 야곱의 외삼촌.", isMain: false, isManual: true },
  { id: "rebekah_daughter", name: "리브가", engName: "Rebekah", gender: "F", generation: 21, column: 4.7, parents: ["bethuel"], spouses: [], desc: "브두엘의 딸. 이삭의 아내가 됨.", isMain: true, isManual: true },
  
  { id: "moab", name: "모압", engName: "Moab", gender: "M", generation: 21, column: -14.0, parents: ["lot"], spouses: [], desc: "롯의 큰딸에게서 태어난 모압 족속의 조상.", isMain: false },
  { id: "benammi", name: "벤암미", engName: "Ben-Ammi", gender: "M", generation: 21, column: -13.0, parents: ["lot"], spouses: [], desc: "롯의 작은딸에게서 태어난 암몬 족속의 조상.", isMain: false },

  // Jokshan's & Midian's children (Gen 21 Keturah branch)
  { id: "sheba_keturah", name: "스바", engName: "Sheba", gender: "M", generation: 21, column: -39.825, parents: ["jokshan"], spouses: [], desc: "욕산의 아들.", isMain: false },
  { id: "dedan_keturah", name: "드단", engName: "Dedan", gender: "M", generation: 21, column: -39.1625, parents: ["jokshan"], spouses: [], desc: "욕산의 아들. 아브라함의 손자.", isMain: false },
  { id: "ephah", name: "에바", engName: "Ephah", gender: "M", generation: 21, column: -39.49375, parents: ["midian"], spouses: [], desc: "미디안의 첫째 아들.", isMain: false },
  { id: "epher_midian", name: "에벨", engName: "Epher", gender: "M", generation: 21, column: -38.83125, parents: ["midian"], spouses: [], desc: "미디안의 둘째 아들.", isMain: false },
  { id: "hanoch_midian", name: "하녹", engName: "Hanoch", gender: "M", generation: 21, column: -38.16875, parents: ["midian"], spouses: [], desc: "미디안의 셋째 아들.", isMain: false },
  { id: "abida", name: "아비다", engName: "Abida", gender: "M", generation: 21, column: -37.50625, parents: ["midian"], spouses: [], desc: "미디안의 넷째 아들.", isMain: false },
  { id: "eldaah", name: "엘다아", engName: "Eldaah", gender: "M", generation: 21, column: -36.84375, parents: ["midian"], spouses: [], desc: "미디안의 다섯째 아들.", isMain: false },
  
  // Dedan's children (Gen 22 Keturah branch)
  { id: "asshurim", name: "앗수르 족속", engName: "Asshurim", gender: "M", generation: 22, column: -39.825, parents: ["dedan_keturah"], spouses: [], desc: "드단의 아들. 앗수르 족속의 조상.", isMain: false },
  { id: "letushim", name: "르두시 족속", engName: "Letushim", gender: "M", generation: 22, column: -39.1625, parents: ["dedan_keturah"], spouses: [], desc: "드단의 아들. 르두시 족속의 조상.", isMain: false },
  { id: "leummim", name: "르웅미 족속", engName: "Leummim", gender: "M", generation: 22, column: -38.5, parents: ["dedan_keturah"], spouses: [], desc: "드단의 아들. 르웅미 족속의 조상.", isMain: false },

  // Ishmael's 12 sons (Gen 21 stacked vertically on the left)
  { id: "mahalath", name: "마할랏", engName: "Mahalath", gender: "F", generation: 21, column: -24.975, parents: ["ishmael"], spouses: ["esau"], desc: "이스마엘의 딸이자 느바욧의 누이. 에서의 아내.", isMain: false },
  { id: "nebaioth", name: "느바욧", engName: "Nebaioth", gender: "M", generation: 21, column: -24.3125, parents: ["ishmael"], spouses: [], desc: "이스마엘의 첫째 아들. 유목민 느바욧 부족의 조상.", isMain: false },
  { id: "kedar", name: "게달", engName: "Kedar", gender: "M", generation: 21, column: -23.65, parents: ["ishmael"], spouses: [], desc: "이스마엘의 둘째 아들. 유목 성향의 강력한 게달 부족의 조상.", isMain: false },
  { id: "adbeel", name: "아드벱", engName: "Adbeel", gender: "M", generation: 21, column: -22.9875, parents: ["ishmael"], spouses: [], desc: "이스마엘의 셋째 아들.", isMain: false },
  { id: "mibsam", name: "밉삼", engName: "Mibsam", gender: "M", generation: 21, column: -22.325, parents: ["ishmael"], spouses: [], desc: "이스마엘의 넷째 아들.", isMain: false },
  { id: "mishma", name: "미스마", engName: "Mishma", gender: "M", generation: 21, column: -21.6625, parents: ["ishmael"], spouses: [], desc: "이스마엘의 다섯째 아들.", isMain: false },
  { id: "dumah", name: "두마", engName: "Dumah", gender: "M", generation: 21, column: -21.0, parents: ["ishmael"], spouses: [], desc: "이스마엘의 여섯째 아들.", isMain: false },
  { id: "massa", name: "맛사", engName: "Massa", gender: "M", generation: 21, column: -20.3375, parents: ["ishmael"], spouses: [], desc: "이스마엘의 일곱째 아들.", isMain: false },
  { id: "hadad", name: "하닷", engName: "Hadad", gender: "M", generation: 21, column: -19.675, parents: ["ishmael"], spouses: [], desc: "이스마엘의 여덟째 아들.", isMain: false },
  { id: "tema", name: "데마", engName: "Tema", gender: "M", generation: 21, column: -19.0125, parents: ["ishmael"], spouses: [], desc: "이스마엘의 아홉째 아들.", isMain: false },
  { id: "jetur", name: "여둘", engName: "Jetur", gender: "M", generation: 21, column: -18.35, parents: ["ishmael"], spouses: [], desc: "이스마엘의 열째 아들.", isMain: false },
  { id: "naphish", name: "나비스", engName: "Naphish", gender: "M", generation: 21, column: -17.6875, parents: ["ishmael"], spouses: [], desc: "이스마엘의 열한째 아들.", isMain: false },
  { id: "kedemah", name: "게드마", engName: "Kedemah", gender: "M", generation: 21, column: -17.025, parents: ["ishmael"], spouses: [], desc: "이스마엘의 열두째 아들.", isMain: false },

  // Generation 22
  { id: "reuben", name: "르우벤", engName: "Reuben", gender: "M", generation: 22, column: -4.6, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 장자. 서모 빌하와의 죄로 장자권을 상실함.", isMain: false },
  
  // Reuben's sons (Gen 46:9, Num 26:5)
  { id: "hanoch_reuben", name: "하녹", engName: "Hanoch", gender: "M", generation: 23, column: -5.59375, parents: ["reuben"], spouses: [], desc: "르우벤의 첫째 아들. 하녹 종족의 조상.", isMain: false },
  { id: "pallu_reuben", name: "발루", engName: "Pallu", gender: "M", generation: 23, column: -4.93125, parents: ["reuben"], spouses: [], desc: "르우벤의 둘째 아들. 발루 종족의 조상.", isMain: false },
  { id: "hezron_reuben", name: "헤스론", engName: "Hezron", gender: "M", generation: 23, column: -4.26875, parents: ["reuben"], spouses: [], desc: "르우벤의 셋째 아들. 헤스론 종족의 조상.", isMain: false },
  { id: "carmi_reuben", name: "갈미", engName: "Carmi", gender: "M", generation: 23, column: -3.60625, parents: ["reuben"], spouses: [], desc: "르우벤의 넷째 아들. 갈미 종족의 조상.", isMain: false },

  // Reuben's clans (Num 26:5-6)
  { id: "hanochites", name: "하녹종족", engName: "Hanochites", gender: "M", generation: 24, column: -5.59375, parents: ["hanoch_reuben"], spouses: [], desc: "르우벤의 아들 하녹에게서 나온 종족.", isMain: false },
  { id: "palluites", name: "발루종족", engName: "Palluites", gender: "M", generation: 24, column: -4.93125, parents: ["pallu_reuben"], spouses: [], desc: "르우벤의 아들 발루에게서 나온 종족.", isMain: false },
  { id: "hezronites", name: "헤스론종족", engName: "Hezronites", gender: "M", generation: 24, column: -4.26875, parents: ["hezron_reuben"], spouses: [], desc: "르우벤의 아들 헤스론에게서 나온 종족.", isMain: false },
  { id: "carmites", name: "갈미종족", engName: "Carmites", gender: "M", generation: 24, column: -3.60625, parents: ["carmi_reuben"], spouses: [], desc: "르우벤의 아들 갈미에게서 나온 종족.", isMain: false },

  // Palluites descendants (Num 26:8-9)
  { id: "eliab_reuben", name: "엘리압", engName: "Eliab", gender: "M", generation: 25, column: -4.93125, parents: ["palluites"], spouses: [], desc: "발루의 아들이자 다단과 아비람의 아버지.", isMain: false },
  
  // Eliab's sons (Num 26:8-9)
  { id: "nemuel_reuben", name: "느무엘", engName: "Nemuel", gender: "M", generation: 26, column: -5.59375, parents: ["eliab_reuben"], spouses: [], desc: "엘리압의 아들. 레위의 느무엘과 다른 인물.", isMain: false },
  { id: "dathan_reuben", name: "다단", engName: "Dathan", gender: "M", generation: 26, column: -4.93125, parents: ["eliab_reuben"], spouses: [], desc: "모세와 아론에게 반역하여 땅이 갈라져 죽임 당함.", isMain: false },
  { id: "abiram_reuben", name: "아비람", engName: "Abiram", gender: "M", generation: 26, column: -4.26875, parents: ["eliab_reuben"], spouses: [], desc: "다단과 함께 반역에 참여했다가 심판을 받아 죽임 당함.", isMain: false },
  { id: "simeon", name: "시므온", engName: "Simeon", gender: "M", generation: 22, column: -3.4, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 둘째 아들. 레위와 함께 세겜 학살을 주도함.", isMain: false },
  
  // Simeon's sons (Gen 46:10, Ex 6:15)
  { id: "jemuel_simeon", name: "여무엘", engName: "Jemuel", gender: "M", generation: 23, column: -1.74375, parents: ["simeon"], spouses: [], desc: "시므온의 첫째 아들.", isMain: false },
  { id: "jamin_simeon", name: "야민", engName: "Jamin", gender: "M", generation: 23, column: -2.40625, parents: ["simeon"], spouses: [], desc: "시므온의 둘째 아들.", isMain: false },
  { id: "ohad_simeon", name: "오핫", engName: "Ohad", gender: "M", generation: 23, column: -3.06875, parents: ["simeon"], spouses: [], desc: "시므온의 셋째 아들.", isMain: false },
  { id: "jachin_simeon", name: "야긴", engName: "Jachin", gender: "M", generation: 23, column: -3.73125, parents: ["simeon"], spouses: [], desc: "시므온의 넷째 아들.", isMain: false },
  { id: "zohar_simeon", name: "스할", engName: "Zohar", gender: "M", generation: 23, column: -4.39375, parents: ["simeon"], spouses: [], desc: "시므온의 다섯째 아들.", isMain: false },
  { id: "shaul_simeon", name: "사울", engName: "Shaul", gender: "M", generation: 23, column: -5.05625, parents: ["simeon"], spouses: [], desc: "시므온의 여섯째 아들. 가나안 여인의 소생.", isMain: false },

  // Shaul's descendants (1 Chr 4:25-27)
  { id: "shallum_simeon", name: "살룸", engName: "Shallum", gender: "M", generation: 24, column: -5.05625, parents: ["shaul_simeon"], spouses: [], desc: "사울의 아들.", isMain: false },
  { id: "mibsam_simeon", name: "밉삼", engName: "Mibsam", gender: "M", generation: 25, column: -5.05625, parents: ["shallum_simeon"], spouses: [], desc: "살룸의 아들.", isMain: false },
  { id: "mishma_simeon", name: "미스마", engName: "Mishma", gender: "M", generation: 26, column: -5.05625, parents: ["mibsam_simeon"], spouses: [], desc: "미스마의 아들.", isMain: false },
  { id: "hammuel_simeon", name: "함무엘", engName: "Hammuel", gender: "M", generation: 27, column: -5.05625, parents: ["mishma_simeon"], spouses: [], desc: "미스마의 아들. 삭굴의 아버지.", isMain: false },
  { id: "zaccur_simeon", name: "삭굴", engName: "Zaccur", gender: "M", generation: 28, column: -5.05625, parents: ["hammuel_simeon"], spouses: [], desc: "함무엘의 아들.", isMain: false },
  { id: "shimei_simeon", name: "시므이", engName: "Shimei", gender: "M", generation: 29, column: -5.05625, parents: ["zaccur_simeon"], spouses: [], desc: "삭굴의 아들. 아들 16명과 딸 6명을 둠.", isMain: false },
  { id: "desc_shimei", name: "아들 16, 딸 6", engName: "16 Sons & 6 Dtrs", gender: "M", generation: 30, column: -5.05625, parents: ["shimei_simeon"], spouses: [], desc: "시므이의 많은 자녀들.", isMain: false },

  { id: "levi", name: "레위", engName: "Levi", gender: "M", generation: 22, column: -2.2, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 셋째 아들. 제사장 지파의 조상이 됨.", isMain: false },
  
  // Gershon Branch (1 Chr 6:1, 6:20)
  { id: "gershon_levi", name: "게르손", engName: "Gershon", gender: "M", generation: 23, column: -15.0, parents: ["levi"], spouses: [], desc: "레위의 첫째 아들. 게르손 자손의 조상.", isMain: false },
  { id: "libni_gershon", name: "립니", engName: "Libni", gender: "M", generation: 24, column: -17.0, parents: ["gershon_levi"], spouses: [], desc: "게르손의 첫째 아들.", isMain: false },
  { id: "shimei_gershon", name: "시므이(게르손)", engName: "Shimei", gender: "M", generation: 24, column: -13.0, parents: ["gershon_levi"], spouses: [], desc: "게르손의 둘째 아들.", isMain: false },

  // Libni's descendants (1 Chr 6:20-21)
  { id: "yahath_libni", name: "야하스", engName: "Jahath", gender: "M", generation: 25, column: -19.98125, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "segub_libni", name: "세갑", engName: "Segub", gender: "M", generation: 25, column: -19.31875, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "ohel_libni", name: "오헬", engName: "Ohel", gender: "M", generation: 25, column: -18.65625, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "shelomith_libni", name: "솔로밋", engName: "Shelomith", gender: "M", generation: 25, column: -17.99375, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "haziel_libni", name: "라시엘", engName: "Haziel", gender: "M", generation: 25, column: -17.33125, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "haran_libni", name: "하란", engName: "Haran", gender: "M", generation: 25, column: -16.66875, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "jahath_libni2", name: "야핫", engName: "Jahath", gender: "M", generation: 25, column: -16.00625, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "zina_libni", name: "시나", engName: "Zina", gender: "M", generation: 25, column: -15.34375, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "jeush_libni", name: "여우시", engName: "Jeush", gender: "M", generation: 25, column: -14.68125, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },
  { id: "beriah_libni", name: "브리아", engName: "Beriah", gender: "M", generation: 25, column: -14.01875, parents: ["libni_gershon"], spouses: [], desc: "립니의 아들.", isMain: false },

  // Merari Branch (1 Chr 6:1, 6:29)
  { id: "merari_levi", name: "므라리", engName: "Merari", gender: "M", generation: 23, column: 10.0, parents: ["levi"], spouses: [], desc: "레위의 셋째 아들. 므라리 자손의 조상.", isMain: false },
  { id: "mahli_merari", name: "마흘리", engName: "Mahli", gender: "M", generation: 24, column: 9.66875, parents: ["merari_levi"], spouses: [], desc: "므라리의 첫째 아들.", isMain: false },
  { id: "mushi_merari", name: "무시", engName: "Mushi", gender: "M", generation: 24, column: 10.33125, parents: ["merari_levi"], spouses: [], desc: "므라리의 둘째 아들.", isMain: false },

  // Mahli's descendants (1 Chr 6:29-30)
  { id: "eleazar_mahli", name: "엘르아살(마흘리)", engName: "Eleazar", gender: "M", generation: 25, column: 9.3375, parents: ["mahli_merari"], spouses: [], desc: "마흘리의 첫째 아들. 아들이 없이 딸만 두고 죽음.", isMain: false },
  { id: "kish_mahli", name: "기스(마흘리)", engName: "Kish", gender: "M", generation: 25, column: 10.0, parents: ["mahli_merari"], spouses: [], desc: "마흘리의 둘째 아들. 여라므엘의 아버지.", isMain: false },
  { id: "jerahmeel_kish", name: "여라므엘(므라리)", engName: "Jerahmeel", gender: "M", generation: 26, column: 10.0, parents: ["kish_mahli"], spouses: [], desc: "기스의 아들.", isMain: false },

  // Mushi's descendants (1 Chr 6:30)
  { id: "mahli_mushi", name: "마흘리(무시)", engName: "Mahli", gender: "M", generation: 25, column: 9.66875, parents: ["mushi_merari"], spouses: [], desc: "무시의 첫째 아들.", isMain: false },
  { id: "eder_mushi", name: "에델", engName: "Eder", gender: "M", generation: 25, column: 10.33125, parents: ["mushi_merari"], spouses: [], desc: "무시의 둘째 아들.", isMain: false },
  { id: "jeremoth_mushi", name: "여레못(므라리)", engName: "Jeremoth", gender: "M", generation: 25, column: 10.99375, parents: ["mushi_merari"], spouses: [], desc: "무시의 셋째 아들.", isMain: false },

  { id: "judah", name: "유다", engName: "Judah", gender: "M", generation: 22, column: 0, parents: ["jacob", "leah"], spouses: ["tamar"], desc: "넷째 아들. 형제들의 중보자이자 다윗과 예수 그리스도의 왕권 지파.", isMain: true },
  { id: "tamar", name: "다말", engName: "Tamar", gender: "F", generation: 22, column: 1.2, parents: [], spouses: ["judah"], desc: "유다의 며느리였으나 대를 잇기 위해 시아버지 유다에게서 쌍둥이를 낳음.", isMain: true },
  
  { id: "dan", name: "단", engName: "Dan", gender: "M", generation: 22, column: -7.0, parents: ["jacob", "bilhah"], spouses: [], desc: "단 지파의 조상. 훗날 우상 숭배의 중심지가 됨.", isMain: false },
  { id: "naphtali", name: "납달리", engName: "Naphtali", gender: "M", generation: 22, column: -2.0, parents: ["jacob", "bilhah"], spouses: [], desc: "납달리 지파의 조상. 아름다운 소리를 발하는 자.", isMain: false },
  // Naphtali's sons (Gen 46:24, 1 Chr 7:13)
  { id: "jahzeel", name: "야스엘", engName: "Jahzeel", gender: "M", generation: 23, column: -3.5, parents: ["naphtali"], spouses: [], desc: "납달리의 첫째 아들.", isMain: false },
  { id: "guni", name: "구니", engName: "Guni", gender: "M", generation: 23, column: -2.5, parents: ["naphtali"], spouses: [], desc: "납달리의 둘째 아들.", isMain: false },
  { id: "jezer", name: "예셀", engName: "Jezer", gender: "M", generation: 23, column: -1.5, parents: ["naphtali"], spouses: [], desc: "납달리의 셋째 아들.", isMain: false },
  { id: "shillem", name: "실렘", engName: "Shillem", gender: "M", generation: 23, column: -0.5, parents: ["naphtali"], spouses: [], desc: "납달리의 넷째 아들.", isMain: false },
  { id: "gad", name: "갓", engName: "Gad", gender: "M", generation: 22, column: -14.0, parents: ["jacob", "zilpah"], spouses: [], desc: "갓 지파의 조상.", isMain: false },
  // Gad's sons (Gen 46:16, Num 26:15)
  { id: "ziphion_gad", name: "시본", engName: "Ziphion", gender: "M", generation: 23, column: -17.0, parents: ["gad"], spouses: [], desc: "갓의 첫째 아들.", isMain: false },
  { id: "haggi_gad", name: "학기", engName: "Haggi", gender: "M", generation: 23, column: -16.0, parents: ["gad"], spouses: [], desc: "갓의 둘째 아들.", isMain: false },
  { id: "shuni_gad", name: "수니", engName: "Shuni", gender: "M", generation: 23, column: -15.0, parents: ["gad"], spouses: [], desc: "갓의 셋째 아들.", isMain: false },
  { id: "ezbon_gad", name: "에스본", engName: "Ezbon", gender: "M", generation: 23, column: -14.0, parents: ["gad"], spouses: [], desc: "갓의 넷째 아들.", isMain: false },
  { id: "eri_gad", name: "에리", engName: "Eri", gender: "M", generation: 23, column: -13.0, parents: ["gad"], spouses: [], desc: "갓의 다섯째 아들.", isMain: false },
  { id: "arodi_gad", name: "아로디", engName: "Arodi", gender: "M", generation: 23, column: -12.0, parents: ["gad"], spouses: [], desc: "갓의 여섯째 아들.", isMain: false },
  { id: "areli_gad", name: "아렐리", engName: "Areli", gender: "M", generation: 23, column: -11.0, parents: ["gad"], spouses: [], desc: "갓의 일곱째 아들.", isMain: false },
  { id: "asher", name: "아셀", engName: "Aser", gender: "M", generation: 22, column: -8.0, parents: ["jacob", "zilpah"], spouses: [], desc: "아셀 지파의 조상. 기름진 음식을 낼 자.", isMain: false },
  // Asher's descendants (Gen 46:17, 1 Chr 7:30)
  { id: "imnah_asher", name: "임나", engName: "Imnah", gender: "M", generation: 23, column: -10.0, parents: ["asher"], spouses: [], desc: "아셀의 첫째 아들.", isMain: false },
  { id: "ishvah_asher", name: "이스와", engName: "Ishvah", gender: "M", generation: 23, column: -9.0, parents: ["asher"], spouses: [], desc: "아셀의 둘째 아들.", isMain: false },
  { id: "ishvi_asher", name: "이스위", engName: "Ishvi", gender: "M", generation: 23, column: -8.0, parents: ["asher"], spouses: [], desc: "아셀의 셋째 아들.", isMain: false },
  { id: "beriah_asher", name: "브리아", engName: "Beriah", gender: "M", generation: 23, column: -7.0, parents: ["asher"], spouses: [], desc: "아셀의 넷째 아들. 헤벨과 말기엘의 아버지.", isMain: false },
  { id: "serah_asher", name: "세라", engName: "Serah", gender: "F", generation: 23, column: -6.0, parents: ["asher"], spouses: [], desc: "아셀의 딸.", isMain: false },

  // Beriah's sons (1 Chr 7:31)
  { id: "heber_beriah", name: "헤벨", engName: "Heber", gender: "M", generation: 24, column: -7.5, parents: ["beriah_asher"], spouses: [], desc: "브리아의 아들.", isMain: false },
  { id: "malchiel_beriah", name: "말기엘", engName: "Malchiel", gender: "M", generation: 24, column: -6.5, parents: ["beriah_asher"], spouses: [], desc: "브리아의 아들. 비르사잇의 아버지.", isMain: false },

  // Heber's children (1 Chr 7:32)
  { id: "japhlet_heber", name: "야블렛", engName: "Japhlet", gender: "M", generation: 25, column: -9.0, parents: ["heber_beriah"], spouses: [], desc: "헤벨의 아들.", isMain: false },
  { id: "shomer_heber", name: "소멜", engName: "Shomer", gender: "M", generation: 25, column: -8.0, parents: ["heber_beriah"], spouses: [], desc: "헤벨의 아들 (세멜).", isMain: false },
  { id: "hotham_heber", name: "호담", engName: "Hotham", gender: "M", generation: 25, column: -7.0, parents: ["heber_beriah"], spouses: [], desc: "헤벨의 아들 (헬렘).", isMain: false },
  { id: "shua_heber", name: "수아", engName: "Shua", gender: "F", generation: 25, column: -6.0, parents: ["heber_beriah"], spouses: [], desc: "헤벨의 딸.", isMain: false },

  // Malchiel's sons (1 Chr 7:31)
  { id: "birzaith_malchiel", name: "비르사잇", engName: "Birzaith", gender: "M", generation: 25, column: -5.0, parents: ["malchiel_beriah"], spouses: [], desc: "말기엘의 아들.", isMain: false },

  // Japhlet's sons (1 Chr 7:33)
  { id: "pasach_japhlet", name: "바삭", engName: "Pasach", gender: "M", generation: 26, column: -10.0, parents: ["japhlet_heber"], spouses: [], desc: "야블렛의 아들.", isMain: false },
  { id: "bimhal_japhlet", name: "빔할", engName: "Bimhal", gender: "M", generation: 26, column: -9.0, parents: ["japhlet_heber"], spouses: [], desc: "야블렛의 아들.", isMain: false },
  { id: "ashvath_japhlet", name: "아스왓", engName: "Ashvath", gender: "M", generation: 26, column: -8.0, parents: ["japhlet_heber"], spouses: [], desc: "야블렛의 아들.", isMain: false },

  // Shomer's sons (1 Chr 7:34)
  { id: "ahi_shomer", name: "아히", engName: "Ahi", gender: "M", generation: 26, column: -7.5, parents: ["shomer_heber"], spouses: [], desc: "소멜의 아들.", isMain: false },
  { id: "rohgah_shomer", name: "로가", engName: "Rohgah", gender: "M", generation: 26, column: -6.7, parents: ["shomer_heber"], spouses: [], desc: "소멜의 아들.", isMain: false },
  { id: "hubbah_shomer", name: "호바", engName: "Hubbah", gender: "M", generation: 26, column: -5.9, parents: ["shomer_heber"], spouses: [], desc: "소멜의 아들.", isMain: false },
  { id: "aram_shomer", name: "아람", engName: "Aram", gender: "M", generation: 26, column: -5.1, parents: ["shomer_heber"], spouses: [], desc: "소멜의 아들.", isMain: false },

  // Hotham's sons (1 Chr 7:35)
  { id: "zophah_hotham", name: "소바", engName: "Zophah", gender: "M", generation: 26, column: -4.0, parents: ["hotham_heber"], spouses: [], desc: "호담의 아들.", isMain: false },
  { id: "imna_hotham", name: "임나", engName: "Imna", gender: "M", generation: 26, column: -3.0, parents: ["hotham_heber"], spouses: [], desc: "호담의 아들.", isMain: false },
  { id: "shelesh_hotham", name: "셀레스", engName: "Shelesh", gender: "M", generation: 26, column: -2.0, parents: ["hotham_heber"], spouses: [], desc: "호담의 아들.", isMain: false },
  { id: "amal_hotham", name: "아말", engName: "Amal", gender: "M", generation: 26, column: -1.0, parents: ["hotham_heber"], spouses: [], desc: "호담의 아들.", isMain: false },

  // Zophah's descendants (1 Chr 7:36-37)
  { id: "suah_zophah", name: "수아", engName: "Suah", gender: "M", generation: 27, column: -5.0, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "harnepher_zophah", name: "하르네벨", engName: "Harnepher", gender: "M", generation: 27, column: -4.8, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "shual_zophah", name: "수알", engName: "Shual", gender: "M", generation: 27, column: -4.6, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "beri_zophah", name: "베리", engName: "Beri", gender: "M", generation: 27, column: -4.4, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "imrah_zophah", name: "임라", engName: "Imrah", gender: "M", generation: 27, column: -4.2, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "bezer_zophah", name: "베셀", engName: "Bezer", gender: "M", generation: 27, column: -4.0, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "hod_zophah", name: "홋", engName: "Hod", gender: "M", generation: 27, column: -3.8, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "shamma_zophah", name: "사마", engName: "Shamma", gender: "M", generation: 27, column: -3.6, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "shilshah_zophah", name: "실사", engName: "Shilshah", gender: "M", generation: 27, column: -3.4, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "ithran_zophah", name: "이드란", engName: "Ithran", gender: "M", generation: 27, column: -3.2, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  { id: "beera_zophah", name: "브에라", engName: "Beera", gender: "M", generation: 27, column: -3.0, parents: ["zophah_hotham"], spouses: [], desc: "소바의 아들.", isMain: false },
  
  { id: "issachar", name: "잇사갈", engName: "Issachar", gender: "M", generation: 22, column: 1.2, parents: ["jacob", "leah"], spouses: [], desc: "잇사갈 지파의 조상. 창 30:18.", isMain: false },
  
  // Issachar's sons (Gen 46:13, 1 Chr 7:1)
  { id: "tola_issachar", name: "돌라", engName: "Tola", gender: "M", generation: 23, column: 0.20625, parents: ["issachar"], spouses: [], desc: "잇사갈의 첫째 아들. 돌라 종족의 조상.", isMain: false },
  { id: "puah_issachar", name: "부와", engName: "Puah", gender: "M", generation: 23, column: 0.86875, parents: ["issachar"], spouses: [], desc: "잇사갈의 둘째 아들.", isMain: false },
  { id: "jashub_issachar", name: "욥", engName: "Jashub", gender: "M", generation: 23, column: 1.53125, parents: ["issachar"], spouses: [], desc: "잇사갈의 셋째 아들 (야숩).", isMain: false },
  { id: "shimron_issachar", name: "시므론", engName: "Shimron", gender: "M", generation: 23, column: 2.19375, parents: ["issachar"], spouses: [], desc: "잇사갈의 넷째 아들.", isMain: false },

  // Tola's sons (1 Chr 7:2)
  { id: "uzzi_tola", name: "웃시", engName: "Uzzi", gender: "M", generation: 24, column: -1.45, parents: ["tola_issachar"], spouses: [], desc: "돌라의 첫째 아들. 용사.", isMain: false },
  { id: "rephaiah_tola", name: "르바야", engName: "Rephaiah", gender: "M", generation: 24, column: -0.7875, parents: ["tola_issachar"], spouses: [], desc: "돌라의 둘째 아들.", isMain: false },
  { id: "jeriel_tola", name: "여리엘", engName: "Jeriel", gender: "M", generation: 24, column: -0.125, parents: ["tola_issachar"], spouses: [], desc: "돌라의 셋째 아들.", isMain: false },
  { id: "jahmai_tola", name: "야매", engName: "Jahmai", gender: "M", generation: 24, column: 0.5375, parents: ["tola_issachar"], spouses: [], desc: "돌라의 넷째 아들.", isMain: false },
  { id: "ibsam_tola", name: "입삼", engName: "Ibsam", gender: "M", generation: 24, column: 1.2, parents: ["tola_issachar"], spouses: [], desc: "돌라의 다섯째 아들.", isMain: false },
  { id: "shemuel_tola", name: "스므엘", engName: "Shemuel", gender: "M", generation: 24, column: 1.8625, parents: ["tola_issachar"], spouses: [], desc: "돌라의 여섯째 아들.", isMain: false },

  // Uzzi's descendants (1 Chr 7:3)
  { id: "izrahiah_uzzi", name: "이스라히야", engName: "Izrahiah", gender: "M", generation: 25, column: -1.45, parents: ["uzzi_tola"], spouses: [], desc: "웃시의 아들이자 우두머리.", isMain: false },

  // Izrahiah's sons (1 Chr 7:3)
  { id: "michael_izrahiah", name: "미가엘", engName: "Michael", gender: "M", generation: 26, column: -2.44375, parents: ["izrahiah_uzzi"], spouses: [], desc: "이스라히야의 첫째 아들.", isMain: false },
  { id: "obadiah_izrahiah", name: "오바댜", engName: "Obadiah", gender: "M", generation: 26, column: -1.78125, parents: ["izrahiah_uzzi"], spouses: [], desc: "이스라히야의 둘째 아들.", isMain: false },
  { id: "joel_izrahiah", name: "요엘", engName: "Joel", gender: "M", generation: 26, column: -1.11875, parents: ["izrahiah_uzzi"], spouses: [], desc: "이스라히야의 셋째 아들.", isMain: false },
  { id: "isshiah_izrahiah", name: "잇시야", engName: "Isshiah", gender: "M", generation: 26, column: -0.45625, parents: ["izrahiah_uzzi"], spouses: [], desc: "이스라히야의 넷째 아들.", isMain: false },

  { id: "zebulun", name: "스불론", engName: "Zebulun", gender: "M", generation: 22, column: 2.4, parents: ["jacob", "leah"], spouses: [], desc: "스불론 지파의 조상. 창 30:20. 해변에 거주하며 배를 대는 자.", isMain: false },

  // Zebulun's sons (Gen 46:14)
  { id: "sered_zebulun", name: "세렛", engName: "Sered", gender: "M", generation: 23, column: 1.7375, parents: ["zebulun"], spouses: [], desc: "스불론의 첫째 아들. 세렛 종족의 조상.", isMain: false },
  { id: "elon_zebulun", name: "엘론", engName: "Elon", gender: "M", generation: 23, column: 2.4, parents: ["zebulun"], spouses: [], desc: "스불론의 둘째 아들. 엘론 종족의 조상.", isMain: false },
  { id: "jahleel_zebulun", name: "얄르엘", engName: "Jahleel", gender: "M", generation: 23, column: 3.0625, parents: ["zebulun"], spouses: [], desc: "스불론의 셋째 아들. 얄르엘 종족의 조상.", isMain: false },
  { id: "dinah", name: "디나", engName: "Dinah", gender: "F", generation: 22, column: 3.6, parents: ["jacob", "leah"], spouses: [], desc: "야곱의 유일한 딸. 세겜 추장 사건으로 시므온 and 레위가 분노함.", isMain: false },
  { id: "joseph", name: "요셉", engName: "Joseph", gender: "M", generation: 22, column: 4.8, parents: ["jacob", "rachel"], spouses: ["asenath"], desc: "꿈의 사람. 형제들에 의해 이집트에 팔렸으나 국무총리가 되어 가문을 구함.", isMain: false },
  { id: "asenath", name: "아스낫", engName: "Asenath", gender: "F", generation: 22, column: 6.0, parents: [], spouses: ["joseph"], desc: "이집트 온의 제사장 보디베라의 딸이자 요셉의 아내.", isMain: false },
  { id: "benjamin", name: "베냐민", engName: "Benjamin", gender: "M", generation: 22, column: 22.0, parents: ["jacob", "rachel"], spouses: [], desc: "야곱의 막내 아들. 오른손의 아들이라는 뜻.", isMain: false },
  
  // Benjamin's sons (Gen 46:21, 1 Chr 7:6)
  { id: "bela", name: "벨라", engName: "Bela", gender: "M", generation: 23, column: 14.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 맏아들.", isMain: false },
  { id: "becher", name: "베겔", engName: "Becher", gender: "M", generation: 23, column: 20.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 둘째 아들.", isMain: false },
  { id: "ashbel", name: "아스벨", engName: "Ashbel", gender: "M", generation: 23, column: 26.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 셋째 아들.", isMain: false },
  { id: "gera_benjamin", name: "게라", engName: "Gera", gender: "M", generation: 23, column: 28.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },
  { id: "naaman_benjamin", name: "나아만", engName: "Naaman", gender: "M", generation: 23, column: 29.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },
  { id: "ehi", name: "에히", engName: "Ehi", gender: "M", generation: 23, column: 30.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },
  { id: "rosh", name: "로스", engName: "Rosh", gender: "M", generation: 23, column: 31.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },
  { id: "muppim", name: "뭅빔", engName: "Muppim", gender: "M", generation: 23, column: 32.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },
  { id: "huppim", name: "훕빔", engName: "Huppim", gender: "M", generation: 23, column: 33.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },
  { id: "ard", name: "아릇", engName: "Ard", gender: "M", generation: 23, column: 34.0, parents: ["benjamin"], spouses: [], desc: "베냐민의 아들.", isMain: false },

  // Bela's sons (1 Chr 8:3-5)
  { id: "addar", name: "잇달", engName: "Addar", gender: "M", generation: 24, column: 10.0, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:3).", isMain: false },
  { id: "gera_bela1", name: "게라", engName: "Gera", gender: "M", generation: 24, column: 10.8, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:3).", isMain: false },
  { id: "abihud", name: "아비훗", engName: "Abihud", gender: "M", generation: 24, column: 11.6, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:3).", isMain: false },
  { id: "abihua", name: "아비수아", engName: "Abihua", gender: "M", generation: 24, column: 12.4, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:4).", isMain: false },
  { id: "naaman_bela", name: "나아만", engName: "Naaman", gender: "M", generation: 24, column: 13.2, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:4).", isMain: false },
  { id: "ahoah", name: "아호아", engName: "Ahoah", gender: "M", generation: 24, column: 14.0, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:4).", isMain: false },
  { id: "gera_bela2", name: "게라", engName: "Gera", gender: "M", generation: 24, column: 14.8, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:5).", isMain: false },
  { id: "shephuphan", name: "스부반", engName: "Shephuphan", gender: "M", generation: 24, column: 15.6, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:5).", isMain: false },
  { id: "huram", name: "후밤", engName: "Huram", gender: "M", generation: 24, column: 16.4, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 8:5).", isMain: false },

  // Bela's sons (1 Chr 7:7)
  { id: "ezbon", name: "에스본", engName: "Ezbon", gender: "M", generation: 24, column: 17.2, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 7:7).", isMain: false },
  { id: "uzzi", name: "우시", engName: "Uzzi", gender: "M", generation: 24, column: 18.0, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 7:7).", isMain: false },
  { id: "uzziel_bela", name: "웃시엘", engName: "Uzziel", gender: "M", generation: 24, column: 18.8, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 7:7).", isMain: false },
  { id: "jerimoth_bela", name: "여리못", engName: "Jerimoth", gender: "M", generation: 24, column: 19.6, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 7:7).", isMain: false },
  { id: "iri", name: "이리", engName: "Iri", gender: "M", generation: 24, column: 20.4, parents: ["bela"], spouses: [], desc: "벨라의 아들 (대상 7:7).", isMain: false },

  // Becher's sons (1 Chr 7:8)
  { id: "zemirah", name: "스미라", engName: "Zemirah", gender: "M", generation: 24, column: 21.2, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "joash_becher", name: "요아스", engName: "Joash", gender: "M", generation: 24, column: 22.0, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "eliezer", name: "엘리에셀", engName: "Eliezer", gender: "M", generation: 24, column: 22.8, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "elioenai", name: "엘료에내", engName: "Elioenai", gender: "M", generation: 24, column: 23.6, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "omri_becher", name: "오므리", engName: "Omri", gender: "M", generation: 24, column: 24.4, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "jerimoth_becher", name: "여레못", engName: "Jerimoth", gender: "M", generation: 24, column: 25.2, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "abijah_becher", name: "아비야", engName: "Abijah", gender: "M", generation: 24, column: 26.0, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "anathoth", name: "아나돗", engName: "Anathoth", gender: "M", generation: 24, column: 26.8, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },
  { id: "alemeth", name: "알레멧", engName: "Alemeth", gender: "M", generation: 24, column: 27.6, parents: ["becher"], spouses: [], desc: "베겔의 아들.", isMain: false },

  // Ashbel's sons
  { id: "bilhan_benjamin", name: "빌한", engName: "Bilhan", gender: "M", generation: 24, column: 28.4, parents: ["ashbel"], spouses: [], desc: "아스벨(여디아엘)의 아들.", isMain: false },

  // Bilhan's descendants (1 Chr 7:10)
  { id: "jeush_bilhan", name: "여우스", engName: "Jeush", gender: "M", generation: 25, column: 28.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 첫째 아들.", isMain: false },
  { id: "benjamin_bilhan", name: "베냐민", engName: "Benjamin", gender: "M", generation: 25, column: 29.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 둘째 아들.", isMain: false },
  { id: "ehud_bilhan", name: "에훗", engName: "Ehud", gender: "M", generation: 25, column: 30.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 셋째 아들.", isMain: false },
  { id: "chenaanah", name: "그나아나", engName: "Chenaanah", gender: "M", generation: 25, column: 31.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 넷째 아들.", isMain: false },
  { id: "zethan", name: "세단", engName: "Zethan", gender: "M", generation: 25, column: 32.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 다섯째 아들.", isMain: false },
  { id: "tharshish", name: "다시스", engName: "Tharshish", gender: "M", generation: 25, column: 33.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 여섯째 아들.", isMain: false },
  { id: "ahishahar", name: "아히사할", engName: "Ahishahar", gender: "M", generation: 25, column: 34.0, parents: ["bilhan_benjamin"], spouses: [], desc: "빌한의 일곱째 아들.", isMain: false },

  // Ehud's sons (1 Chr 8:6-7)
  { id: "naaman_ehud", name: "나아만", engName: "Naaman", gender: "M", generation: 26, column: 29.0, parents: ["ehud_bilhan"], spouses: [], desc: "에훗의 아들.", isMain: false },
  { id: "ahijah_ehud", name: "아히야", engName: "Ahijah", gender: "M", generation: 26, column: 30.0, parents: ["ehud_bilhan"], spouses: [], desc: "에훗의 아들.", isMain: false },
  { id: "gera_ehud", name: "게라", engName: "Gera", gender: "M", generation: 26, column: 31.0, parents: ["ehud_bilhan"], spouses: [], desc: "에훗의 아들. 포로로 잡혀간 집안의 지도자.", isMain: false },

  // Gera's sons (1 Chr 8:7)
  { id: "uzza_gera", name: "웃사", engName: "Uzza", gender: "M", generation: 27, column: 30.6, parents: ["gera_ehud"], spouses: [], desc: "게라의 아들.", isMain: false },
  { id: "ahihud_gera", name: "아히훗", engName: "Ahihud", gender: "M", generation: 27, column: 31.4, parents: ["gera_ehud"], spouses: [], desc: "게라의 아들.", isMain: false },
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
  { id: "zerah", name: "세라", engName: "Zerah", gender: "M", generation: 23, column: -9.6, parents: ["judah", "tamar"], spouses: [], desc: "베레스의 쌍둥이 형제. 홍색 실을 손에 맸던 자.", isMain: false },
  
  // Zerah's Descendants (1 Chr 2:6, 2:8)
  { id: "zimri_zerah", name: "시므리", engName: "Zimri", gender: "M", generation: 24, column: -12.0, parents: ["zerah"], spouses: [], desc: "세라의 아들(대상 2:6).", isMain: false },
  { id: "ethan_zerah", name: "에단", engName: "Ethan", gender: "M", generation: 24, column: -10.8, parents: ["zerah"], spouses: [], desc: "세라의 아들(대상 2:6). 지혜로운 자.", isMain: false },
  { id: "heman_zerah", name: "헤만", engName: "Heman", gender: "M", generation: 24, column: -9.6, parents: ["zerah"], spouses: [], desc: "세라의 아들(대상 2:6). 지혜로운 자.", isMain: false },
  { id: "calcol_zerah", name: "갈골", engName: "Calcol", gender: "M", generation: 24, column: -8.4, parents: ["zerah"], spouses: [], desc: "세라의 아들(대상 2:6). 지혜로운 자.", isMain: false },
  { id: "dara_zerah", name: "다라", engName: "Dara", gender: "M", generation: 24, column: -7.2, parents: ["zerah"], spouses: [], desc: "세라의 아들(대상 2:6). 지혜로운 자.", isMain: false },
  { id: "azariah_ethan", name: "아사랴", engName: "Azariah", gender: "M", generation: 25, column: -10.8, parents: ["ethan_zerah"], spouses: [], desc: "에단의 아들(대상 2:8).", isMain: false },
  
  { id: "manasseh", name: "므나쎄", engName: "Manasseh", gender: "M", generation: 23, column: 4.8, parents: ["joseph", "asenath"], spouses: ["man_wife", "man_concubine"], desc: "요셉의 장남. 하나님이 내 고난을 잊게 하셨다는 뜻.", isMain: false },
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
  // Kohath Branch Generation 24
  { id: "amram", name: "아므람", engName: "Amram", gender: "M", generation: 24, column: 3.0, parents: ["kohath"], spouses: ["jochebed"], desc: "고핫의 아들이자 모세, 아론의 아버지.", isMain: false, isManual: true },
  { id: "jochebed", name: "요게벳", engName: "Jochebed", gender: "F", generation: 24, column: 1.8, parents: [], spouses: ["amram"], desc: "모세의 어머니. 갈상자에 모세를 담아 나일강에 띄운 여인.", isMain: false, isManual: true },
  { id: "izhar", name: "이스할", engName: "Izhar", gender: "M", generation: 24, column: -1.6625, parents: ["kohath"], spouses: [], desc: "고핫의 아들. 아므람의 형제.", isMain: false },
  { id: "hebron_kohath", name: "헤브론", engName: "Hebron", gender: "M", generation: 24, column: -3.0, parents: ["kohath"], spouses: [], desc: "고핫의 셋째 아들.", isMain: false },
  { id: "uzziel_kohath", name: "웃시엘", engName: "Uzziel", gender: "M", generation: 24, column: -5.0, parents: ["kohath"], spouses: [], desc: "고핫의 넷째 아들.", isMain: false },
  { id: "hezron", name: "헤스론", engName: "Hezron", gender: "M", generation: 24, column: 0, parents: ["perez"], spouses: ["machir_daughter", "abiah_hezron", "azubah_caleb", "jerioth", "ephrath", "ephah_concubine", "maachah_concubine", "unknown_wife_caleb"], desc: "베레스의 아들.", isMain: true },
  
  // Hezron's marriage to Machir's daughter (1 Chr 2:21-22)
  { id: "machir_daughter", name: "마길의 딸", engName: "Daughter of Machir", gender: "F", generation: 24, column: -1.2, parents: [], spouses: ["hezron"], desc: "길레앗의 아버지 마길의 딸.", isMain: false },
  { id: "segub_hezron", name: "스굽", engName: "Segub", gender: "M", generation: 25, column: -1.2, parents: ["hezron", "machir_daughter"], spouses: [], desc: "헤스론과 마길의 딸의 아들.", isMain: false },
  { id: "jair_segub", name: "야일", engName: "Jair", gender: "M", generation: 26, column: -1.2, parents: ["segub_hezron"], spouses: [], desc: "스굽의 아들. 길레앗 땅에서 스물세 성읍을 가졌던 자.", isMain: false },

  // Hezron's marriage to Abiah (1 Chr 2:24)
  { id: "abiah_hezron", name: "아비야", engName: "Abiah", gender: "F", generation: 24, column: -2.4, parents: [], spouses: ["hezron"], desc: "헤스론의 아내. 아스훌의 어머니(대상 2:24).", isMain: false },
  { id: "ashhur_hezron", name: "아스훌", engName: "Ashhur", gender: "M", generation: 25, column: -7.0, parents: ["hezron", "abiah_hezron"], spouses: ["helah_ashhur", "naarah_ashhur"], desc: "헤스론과 아비야의 아들. 드고아의 조상(대상 2:24).", isMain: false },

  // Hezron's son Jerahmeel and his descendants (1 Chr 2:25-27)
  { id: "jerahmeel_hezron", name: "여라무엘", engName: "Jerahmeel", gender: "M", generation: 25, column: -30.0, parents: ["hezron"], spouses: ["atarah_jerahmeel"], desc: "헤스론의 맏아들(대상 2:9, 2:25).", isMain: false },
  { id: "atarah_jerahmeel", name: "아다라", engName: "Atarah", gender: "F", generation: 25, column: -28.8, parents: [], spouses: ["jerahmeel_hezron"], desc: "여라무엘의 다른 아내. 오남의 어머니(대상 2:26).", isMain: false },
  
  { id: "ram_jerahmeel", name: "람", engName: "Ram", gender: "M", generation: 26, column: -33.0, parents: ["jerahmeel_hezron"], spouses: [], desc: "여라무엘의 장자(대상 2:25). 헤스론의 아들 람과 동명이인.", isMain: false },
  { id: "bunah_jerahmeel", name: "브나", engName: "Bunah", gender: "M", generation: 26, column: -31.8, parents: ["jerahmeel_hezron"], spouses: [], desc: "여라무엘의 아들(대상 2:25).", isMain: false },
  { id: "oren_jerahmeel", name: "오렌", engName: "Oren", gender: "M", generation: 26, column: -30.6, parents: ["jerahmeel_hezron"], spouses: [], desc: "여라무엘의 아들(대상 2:25).", isMain: false },
  { id: "ozem_jerahmeel", name: "오셈", engName: "Ozem", gender: "M", generation: 26, column: -29.4, parents: ["jerahmeel_hezron"], spouses: [], desc: "여라무엘의 아들(대상 2:25). 이새의 아들 오셈과 동명이인.", isMain: false },
  { id: "ahijah_jerahmeel", name: "아히야", engName: "Ahijah", gender: "M", generation: 26, column: -28.2, parents: ["jerahmeel_hezron"], spouses: [], desc: "여라무엘의 아들(대상 2:25).", isMain: false },
  { id: "onam_jerahmeel", name: "오남", engName: "Onam", gender: "M", generation: 26, column: -27.0, parents: ["jerahmeel_hezron", "atarah_jerahmeel"], spouses: [], desc: "여라무엘과 그의 아내 아다라의 아들(대상 2:26).", isMain: false },
  
  { id: "maaz_ram", name: "마아스", engName: "Maaz", gender: "M", generation: 27, column: -34.2, parents: ["ram_jerahmeel"], spouses: [], desc: "여라무엘의 아들 람의 아들(대상 2:27).", isMain: false },
  { id: "jamin_ram", name: "야민", engName: "Jamin", gender: "M", generation: 27, column: -33.0, parents: ["ram_jerahmeel"], spouses: [], desc: "여라무엘의 아들 람의 아들(대상 2:27). 시므온의 아들 야민과 동명이인.", isMain: false },
  { id: "eker_ram", name: "에겔", engName: "Eker", gender: "M", generation: 27, column: -31.8, parents: ["ram_jerahmeel"], spouses: [], desc: "여라무엘의 아들 람의 아들(대상 2:27).", isMain: false },
  
  // Onam's descendants (1 Chr 2:28-41)
  { id: "shammai_onam", name: "삼매", engName: "Shammai", gender: "M", generation: 27, column: -29.0, parents: ["onam_jerahmeel"], spouses: [], desc: "오남의 아들(대상 2:28).", isMain: false },
  { id: "jada_onam", name: "야다", engName: "Jada", gender: "M", generation: 27, column: -27.0, parents: ["onam_jerahmeel"], spouses: [], desc: "오남의 아들(대상 2:28).", isMain: false },
  
  { id: "nadab_shammai", name: "나답", engName: "Nadab", gender: "M", generation: 28, column: -29.0, parents: ["shammai_onam"], spouses: [], desc: "삼매의 아들(대상 2:28).", isMain: false },
  { id: "jeder_jada", name: "예델", engName: "Jeder", gender: "M", generation: 28, column: -27.8, parents: ["jada_onam"], spouses: [], desc: "야다의 아들(대상 2:32). 아들이 없이 죽음.", isMain: false },
  { id: "jonathan_jada", name: "요나단", engName: "Jonathan", gender: "M", generation: 28, column: -26.6, parents: ["jada_onam"], spouses: [], desc: "야다의 아들(대상 2:32).", isMain: false },
  
  { id: "seled_nadab", name: "셀렛", engName: "Seled", gender: "M", generation: 29, column: -30.2, parents: ["nadab_shammai"], spouses: [], desc: "나답의 아들(대상 2:30). 아들이 없이 죽음.", isMain: false },
  { id: "appaim_nadab", name: "압바임", engName: "Appaim", gender: "M", generation: 29, column: -29.0, parents: ["nadab_shammai"], spouses: [], desc: "나답의 아들(대상 2:30).", isMain: false },
  { id: "peleth_jonathan", name: "베렛", engName: "Peleth", gender: "M", generation: 29, column: -27.8, parents: ["jonathan_jada"], spouses: [], desc: "요나단의 아들(대상 2:33).", isMain: false },
  { id: "zaza_jonathan", name: "사사", engName: "Zaza", gender: "M", generation: 29, column: -26.6, parents: ["jonathan_jada"], spouses: [], desc: "요나단의 아들(대상 2:33).", isMain: false },
  
  { id: "ishi_appaim", name: "이시", engName: "Ishi", gender: "M", generation: 30, column: -29.0, parents: ["appaim_nadab"], spouses: [], desc: "압바임의 아들(대상 2:31).", isMain: false },
  
  { id: "sheshan_ishi", name: "세산", engName: "Sheshan", gender: "M", generation: 31, column: -29.0, parents: ["ishi_appaim"], spouses: [], desc: "이시의 아들(대상 2:31). 아들이 없고 딸들만 둠.", isMain: false },
  { id: "jarha_egyptian", name: "야르하", engName: "Jarha", gender: "F", generation: 31, column: -27.8, parents: ["sheshan_ishi"], spouses: ["ahlai_sheshan"], desc: "세산의 딸(대상 2:34).", isMain: false },
  { id: "ahlai_sheshan", name: "알래", engName: "Ahlai", gender: "M", generation: 31, column: -26.6, parents: [], spouses: ["jarha_egyptian"], desc: "세산의 애굽 종(대상 2:34). 주인의 딸 야르하와 결혼함.", isMain: false },
  
  { id: "attai_jarha", name: "앗대", engName: "Attai", gender: "M", generation: 32, column: -29.0, parents: ["jarha_egyptian", "ahlai_sheshan"], spouses: [], desc: "야르하와 알래의 아들(대상 2:35).", isMain: false },
  { id: "nathan_attai", name: "나단", engName: "Nathan", gender: "M", generation: 33, column: -29.0, parents: ["attai_jarha"], spouses: [], desc: "앗대의 아들(대상 2:36).", isMain: false },
  { id: "zabad_nathan", name: "사밧", engName: "Zabad", gender: "M", generation: 34, column: -29.0, parents: ["nathan_attai"], spouses: [], desc: "나단의 아들(대상 2:37).", isMain: false },
  { id: "ephlal_zabad", name: "에블랄", engName: "Ephlal", gender: "M", generation: 35, column: -29.0, parents: ["zabad_nathan"], spouses: [], desc: "사밧의 아들(대상 2:37).", isMain: false },
  { id: "obed_ephlal", name: "오벳", engName: "Obed", gender: "M", generation: 36, column: -29.0, parents: ["ephlal_zabad"], spouses: [], desc: "에블랄의 아들(대상 2:38).", isMain: false },
  { id: "jehu_obed", name: "예후", engName: "Jehu", gender: "M", generation: 37, column: -29.0, parents: ["obed_ephlal"], spouses: [], desc: "오벳의 아들(대상 2:38). 북이스라엘 왕 예후와 동명이인.", isMain: false },
  { id: "azariah_jehu", name: "아사랴", engName: "Azariah", gender: "M", generation: 38, column: -29.0, parents: ["jehu_obed"], spouses: [], desc: "예후의 아들(대상 2:38).", isMain: false },
  { id: "helez_azariah", name: "헬레스", engName: "Helez", gender: "M", generation: 39, column: -29.0, parents: ["azariah_jehu"], spouses: [], desc: "아사랴의 아들(대상 2:39).", isMain: false },
  { id: "eleasah_helez", name: "엘르아사", engName: "Eleasah", gender: "M", generation: 40, column: -29.0, parents: ["helez_azariah"], spouses: [], desc: "헬레스의 아들(대상 2:39).", isMain: false },
  { id: "sisamai_eleasah", name: "시스매", engName: "Sisamai", gender: "M", generation: 41, column: -29.0, parents: ["eleasah_helez"], spouses: [], desc: "엘르아사의 아들(대상 2:40).", isMain: false },
  { id: "shallum_sisamai", name: "살룸", engName: "Shallum", gender: "M", generation: 42, column: -29.0, parents: ["sisamai_eleasah"], spouses: [], desc: "시스매의 아들(대상 2:40). 북이스라엘 왕 살룸과 동명이인.", isMain: false },
  { id: "jekamiah_shallum", name: "여가먀", engName: "Jekamiah", gender: "M", generation: 43, column: -29.0, parents: ["shallum_sisamai"], spouses: [], desc: "살룸의 아들(대상 2:41).", isMain: false },
  { id: "elishama_jekamiah", name: "엘리사마", engName: "Elishama", gender: "M", generation: 44, column: -29.0, parents: ["jekamiah_shallum"], spouses: [], desc: "여가먀의 아들(대상 2:41). 다윗의 아들 엘리사마와 동명이인.", isMain: false },
  
  // Ashhur's marriages and descendants (1 Chr 4:5-7)
  { id: "helah_ashhur", name: "헬라", engName: "Helah", gender: "F", generation: 25, column: -9.4, parents: [], spouses: ["ashhur_hezron"], desc: "드고아의 아버지 아스훌의 아내(대상 4:5).", isMain: false },
  { id: "naarah_ashhur", name: "나아라", engName: "Naarah", gender: "F", generation: 25, column: -8.2, parents: [], spouses: ["ashhur_hezron"], desc: "드고아의 아버지 아스훌의 아내(대상 4:5).", isMain: false },
  
  { id: "zereth_ashhur", name: "세렛", engName: "Zereth", gender: "M", generation: 26, column: -10.6, parents: ["ashhur_hezron", "helah_ashhur"], spouses: [], desc: "아스훌과 헬라의 아들(대상 4:7).", isMain: false },
  { id: "izohar_ashhur", name: "이소할", engName: "Izohar", gender: "M", generation: 26, column: -9.4, parents: ["ashhur_hezron", "helah_ashhur"], spouses: [], desc: "아스훌과 헬라의 아들(대상 4:7).", isMain: false },
  { id: "ethnan_ashhur", name: "에드난", engName: "Ethnan", gender: "M", generation: 26, column: -8.2, parents: ["ashhur_hezron", "helah_ashhur"], spouses: [], desc: "아스훌과 헬라의 아들(대상 4:7).", isMain: false },
  { id: "tekoa_ashhur", name: "드고아", engName: "Tekoa", gender: "M", generation: 26, column: -11.8, parents: ["ashhur_hezron"], spouses: [], desc: "헤스론과 아비야의 아들 아스훌의 아들. 드고아의 조상(대상 2:24).", isMain: false },
  
  { id: "ahuzzam_ashhur", name: "아훗삼", engName: "Ahuzzam", gender: "M", generation: 26, column: -7.0, parents: ["ashhur_hezron", "naarah_ashhur"], spouses: [], desc: "아스훌과 나아라의 아들(대상 4:6).", isMain: false },
  { id: "hepher_ashhur", name: "헤벨", engName: "Hepher", gender: "M", generation: 26, column: -5.8, parents: ["ashhur_hezron", "naarah_ashhur"], spouses: [], desc: "아스훌과 나아라의 아들(대상 4:6). 헤벨 종족의 조상.", isMain: false },
  { id: "temeni_ashhur", name: "데므니", engName: "Temeni", gender: "M", generation: 26, column: -4.6, parents: ["ashhur_hezron", "naarah_ashhur"], spouses: [], desc: "아스훌과 나아라의 아들(대상 4:6).", isMain: false },
  { id: "haahashtari_ashhur", name: "하아하스다리", engName: "Haahashtari", gender: "M", generation: 26, column: -3.4, parents: ["ashhur_hezron", "naarah_ashhur"], spouses: [], desc: "아스훌과 나아라의 아들(대상 4:6).", isMain: false },

  // Caleb (Chelubai) Branch (1 Chr 2:9, 2:18-20, 2:46-49)
  { id: "chelubai", name: "글루배", engName: "Chelubai", gender: "M", generation: 25, column: 12.0, parents: ["hezron"], spouses: ["azubah_caleb", "jerioth", "ephrath", "ephah_concubine", "maachah_concubine", "unknown_wife_caleb"], desc: "헤스론의 아들. 갈렙이라고도 불림.", isMain: false },
  { id: "azubah_caleb", name: "아수바", engName: "Azubah", gender: "F", generation: 25, column: 10.5, parents: [], spouses: ["chelubai"], desc: "갈렙의 아내.", isMain: false },
  { id: "jerioth", name: "여리옷", engName: "Jerioth", gender: "F", generation: 25, column: 11.5, parents: [], spouses: ["chelubai"], desc: "갈렙의 아내.", isMain: false },
  { id: "ephrath", name: "에브라다", engName: "Ephrath", gender: "F", generation: 25, column: 12.5, parents: [], spouses: ["chelubai"], desc: "갈렙의 아내. 아수바 사망 후 결혼.", isMain: false },
  { id: "ephah_concubine", name: "에바", engName: "Ephah", gender: "F", generation: 25, column: 13.5, parents: [], spouses: ["chelubai"], desc: "갈렙의 첩.", isMain: false },
  { id: "maachah_concubine", name: "마아가", engName: "Maachah", gender: "F", generation: 25, column: 14.5, parents: [], spouses: ["chelubai"], desc: "갈렙의 첩.", isMain: false },
  { id: "unknown_wife_caleb", name: "미상(아내)", engName: "Unknown Wife", gender: "F", generation: 25, column: 15.5, parents: [], spouses: ["chelubai"], desc: "갈렙의 아내 (악사의 어머니).", isMain: false },

  // Caleb & Azubah's children
  { id: "jesher_caleb", name: "예셀", engName: "Jesher", gender: "M", generation: 26, column: 9.5, parents: ["chelubai", "azubah_caleb"], spouses: [], desc: "갈렙과 아수바의 아들.", isMain: false },
  { id: "shobab_caleb", name: "소밥", engName: "Shobab", gender: "M", generation: 26, column: 10.1625, parents: ["chelubai", "azubah_caleb"], spouses: [], desc: "갈렙과 아수바의 아들.", isMain: false },
  { id: "ardon_caleb", name: "아르돈", engName: "Ardon", gender: "M", generation: 26, column: 10.825, parents: ["chelubai", "azubah_caleb"], spouses: [], desc: "갈렙과 아수바의 아들.", isMain: false },

  // Caleb & Ephrath's descendants (Hur line)
  { id: "hur_caleb", name: "훌", engName: "Hur", gender: "M", generation: 26, column: 12.5, parents: ["chelubai", "ephrath"], spouses: [], desc: "갈렙과 에브라다의 맏아들.", isMain: false },
  { id: "uri_caleb", name: "우리", engName: "Uri", gender: "M", generation: 27, column: 11.5, parents: ["hur_caleb"], spouses: [], desc: "훌의 아들.", isMain: false },
  { id: "bezalel_uri", name: "브살렐", engName: "Bezalel", gender: "M", generation: 28, column: 11.5, parents: ["uri_caleb"], spouses: [], desc: "성막을 제작한 정교한 장인.", isMain: false },

  { id: "shobal_caleb", name: "소발", engName: "Shobal", gender: "M", generation: 27, column: 12.5, parents: ["hur_caleb"], spouses: [], desc: "기럇여아림의 조상.", isMain: false },
  { id: "reaiah_shobal", name: "르아야", engName: "Reaiah", gender: "M", generation: 28, column: 11.5, parents: ["shobal_caleb"], spouses: [], desc: "소발의 아들.", isMain: false },
  { id: "jahath_reaiah", name: "야하트", engName: "Jahath", gender: "M", generation: 29, column: 11.5, parents: ["reaiah_shobal"], spouses: [], desc: "르아야의 아들.", isMain: false },
  { id: "ahumai_jahath", name: "아후매", engName: "Ahumai", gender: "M", generation: 30, column: 11.16875, parents: ["jahath_reaiah"], spouses: [], desc: "야하트의 아들.", isMain: false },
  { id: "lahad_jahath", name: "라핫", engName: "Lahad", gender: "M", generation: 30, column: 11.83125, parents: ["jahath_reaiah"], spouses: [], desc: "야하트의 아들.", isMain: false },
  { id: "zorathites", name: "소라자손", engName: "Zorathites", gender: "M", generation: 31, column: 11.5, parents: ["ahumai_jahath", "lahad_jahath"], spouses: [], desc: "소라 땅에 정착한 자손들.", isMain: false },

  { id: "kirjath_jearim_shobal", name: "기럇여아림", engName: "Kirjath-jearim", gender: "M", generation: 28, column: 12.1625, parents: ["shobal_caleb"], spouses: [], desc: "기럇여아림의 주민들.", isMain: false },
  { id: "ithrites", name: "이델 자손", engName: "Ithrites", gender: "M", generation: 29, column: 11.16875, parents: ["kirjath_jearim_shobal"], spouses: [], desc: "기럇여아림의 한 가문.", isMain: false },
  { id: "puthites", name: "붓 자손", engName: "Puthites", gender: "M", generation: 29, column: 11.83125, parents: ["kirjath_jearim_shobal"], spouses: [], desc: "기럇여아림의 한 가문.", isMain: false },
  { id: "shumathites", name: "수맛 자손", engName: "Shumathites", gender: "M", generation: 29, column: 12.49375, parents: ["kirjath_jearim_shobal"], spouses: [], desc: "기럇여아림의 한 가문.", isMain: false },
  { id: "mishraites", name: "미스라 자손", engName: "Mishraites", gender: "M", generation: 29, column: 13.15625, parents: ["kirjath_jearim_shobal"], spouses: [], desc: "기럇여아림의 한 가문.", isMain: false },

  { id: "haroeh_shobal", name: "하로에", engName: "Haroeh", gender: "M", generation: 28, column: 12.825, parents: ["shobal_caleb"], spouses: [], desc: "소발의 아들.", isMain: false },
  { id: "manaheth_shobal", name: "무느훗", engName: "Manaheth", gender: "M", generation: 28, column: 13.4875, parents: ["shobal_caleb"], spouses: [], desc: "소발의 아들.", isMain: false },

  { id: "salma_caleb", name: "살마", engName: "Salma", gender: "M", generation: 27, column: 13.5, parents: ["hur_caleb"], spouses: [], desc: "베들레헴의 조상.", isMain: false },
  { id: "bethlehem_salma", name: "베들레헴", engName: "Bethlehem", gender: "M", generation: 28, column: 12.00625, parents: ["salma_caleb"], spouses: [], desc: "베들레헴 가문.", isMain: false },
  { id: "netophathites_salma", name: "느도바 자손", engName: "Netophathites", gender: "M", generation: 28, column: 12.66875, parents: ["salma_caleb"], spouses: [], desc: "느도바 사람들의 조상.", isMain: false },
  { id: "ataroth_salma", name: "아다롯벳요압", engName: "Ataroth", gender: "M", generation: 28, column: 13.33125, parents: ["salma_caleb"], spouses: [], desc: "요압 가문과 관련된 성읍.", isMain: false },
  { id: "manahethites_salma", name: "마하낫", engName: "Manahethites", gender: "M", generation: 28, column: 13.99375, parents: ["salma_caleb"], spouses: [], desc: "마하낫 가문.", isMain: false },

  { id: "hareph_caleb", name: "하립", engName: "Hareph", gender: "M", generation: 27, column: 14.5, parents: ["hur_caleb"], spouses: [], desc: "벳가델의 조상.", isMain: false },
  { id: "bethgader_hareph", name: "벳가델", engName: "Bethgader", gender: "M", generation: 28, column: 14.5, parents: ["hareph_caleb"], spouses: [], desc: "벳가델 가문.", isMain: false },

  // Caleb & Ephah concubine descendants
  { id: "haran_ephah", name: "하란", engName: "Haran", gender: "M", generation: 26, column: 13.5, parents: ["chelubai", "ephah_concubine"], spouses: [], desc: "갈렙과 에바의 아들.", isMain: false },
  { id: "moza_ephah", name: "모사", engName: "Moza", gender: "M", generation: 26, column: 14.1625, parents: ["chelubai", "ephah_concubine"], spouses: [], desc: "갈렙과 에바의 아들.", isMain: false },
  { id: "gazez_ephah", name: "가세스", engName: "Gazez", gender: "M", generation: 26, column: 14.825, parents: ["chelubai", "ephah_concubine"], spouses: [], desc: "갈렙과 에바의 아들.", isMain: false },
  { id: "gazez_haran", name: "가세스(하란)", engName: "Gazez", gender: "M", generation: 27, column: 13.5, parents: ["haran_ephah"], spouses: [], desc: "하란의 아들.", isMain: false },

  // Caleb & Maachah concubine descendants
  { id: "sheber_maachah", name: "세벨", engName: "Sheber", gender: "M", generation: 26, column: 15.49375, parents: ["chelubai", "maachah_concubine"], spouses: [], desc: "갈렙과 마아가의 아들.", isMain: false },
  { id: "tirhanah_maachah", name: "디르하나", engName: "Tirhanah", gender: "M", generation: 26, column: 16.15625, parents: ["chelubai", "maachah_concubine"], spouses: [], desc: "갈렙과 마아가의 아들.", isMain: false },
  { id: "shaaph_maachah", name: "사압", engName: "Shaaph", gender: "M", generation: 26, column: 16.81875, parents: ["chelubai", "maachah_concubine"], spouses: [], desc: "갈렙과 마아가의 아들 (맛만나 조상).", isMain: false },
  { id: "sheva_maachah", name: "스와", engName: "Sheva", gender: "M", generation: 26, column: 17.48125, parents: ["chelubai", "maachah_concubine"], spouses: [], desc: "갈렙과 마아가의 아들 (막베나/기브아 조상).", isMain: false },
  { id: "madmannah_shaaph", name: "맛만나", engName: "Madmannah", gender: "M", generation: 27, column: 16.81875, parents: ["shaaph_maachah"], spouses: [], desc: "사압의 아들.", isMain: false },
  { id: "machbenah_sheva", name: "막베나", engName: "Machbenah", gender: "M", generation: 27, column: 17.15, parents: ["sheva_maachah"], spouses: [], desc: "스와의 아들.", isMain: false },
  { id: "gibea_sheva", name: "기브아", engName: "Gibeah", gender: "M", generation: 27, column: 17.8125, parents: ["sheva_maachah"], spouses: [], desc: "스와의 아들.", isMain: false },

  // Caleb daughter
  { id: "achsah_daughter", name: "악사", engName: "Achsah", gender: "F", generation: 26, column: 18.5, parents: ["chelubai", "unknown_wife_caleb"], spouses: [], desc: "갈렙의 딸. 온니엘과 결혼함.", isMain: false },

  // Kohath Branch Generation 25
  { id: "aaron", name: "아론", engName: "Aaron", gender: "M", generation: 25, column: 3.0, parents: ["amram", "jochebed"], spouses: ["elisheba"], desc: "이스라엘 초대 대제사장. 모세의 대언자요 형.", isMain: false, isManual: true },
  { id: "elisheba", name: "엘리세바", engName: "Elisheba", gender: "F", generation: 25, column: 1.8, parents: [], spouses: ["aaron"], desc: "아론의 아내. 아민아답의 딸.", isMain: false, isManual: true },
  { id: "moses", name: "모세", engName: "Moses", gender: "M", generation: 25, column: 4.8, parents: ["amram", "jochebed"], spouses: ["zipporah"], desc: "출애굽의 영도자요 율법 수여자. 시내산 언약의 중보자.", isMain: false, isManual: true },
  { id: "zipporah", name: "십보라", engName: "Zipporah", gender: "F", generation: 25, column: 6.0, parents: [], spouses: ["moses"], desc: "미디안 제사장 이드로의 딸이자 모세의 아내.", isMain: false, isManual: true },
  { id: "miriam", name: "미리암", engName: "Miriam", gender: "F", generation: 25, column: 0.6, parents: ["amram", "jochebed"], spouses: [], desc: "여선지자. 모세와 아론의 누이.", isMain: false, isManual: true },
  
  // Izhar's sons (Gen 25 Kohath branch)
  { id: "shelomith_izhar", name: "슬로못", engName: "Shelomith", gender: "M", generation: 25, column: -2.325, parents: ["izhar"], spouses: [], desc: "이스할의 첫째 아들.", isMain: false },
  { id: "korah", name: "고라", engName: "Korah", gender: "M", generation: 25, column: -1.6625, parents: ["izhar"], spouses: [], desc: "모세와 아론에게 반역하다 땅이 갈라져 삼킴을 당함.", isMain: false },
  { id: "nepheg_izhar", name: "네벡", engName: "Nepheg", gender: "M", generation: 25, column: -1.0, parents: ["izhar"], spouses: [], desc: "이스할의 셋째 아들.", isMain: false },
  { id: "zichri_izhar", name: "시그리", engName: "Zichri", gender: "M", generation: 25, column: -0.3375, parents: ["izhar"], spouses: [], desc: "이스할의 넷째 아들.", isMain: false },

  // Hebron's sons (Gen 25 Kohath branch)
  { id: "jeriah_hebron", name: "여리야", engName: "Jeriah", gender: "M", generation: 25, column: -3.99375, parents: ["hebron_kohath"], spouses: [], desc: "헤브론의 첫째 아들.", isMain: false },
  { id: "amariah_hebron", name: "아마랴", engName: "Amariah", gender: "M", generation: 25, column: -3.33125, parents: ["hebron_kohath"], spouses: [], desc: "헤브론의 둘째 아들.", isMain: false },
  { id: "jahaziel_hebron", name: "야하시엘", engName: "Jahaziel", gender: "M", generation: 25, column: -2.66875, parents: ["hebron_kohath"], spouses: [], desc: "헤브론의 셋째 아들.", isMain: false },
  { id: "jekameam_hebron", name: "여카므암", engName: "Jekameam", gender: "M", generation: 25, column: -2.00625, parents: ["hebron_kohath"], spouses: [], desc: "헤브론의 넷째 아들.", isMain: false },

  // Uzziel's sons (Gen 25 Kohath branch)
  { id: "micah_uzziel", name: "미가", engName: "Micah", gender: "M", generation: 25, column: -6.325, parents: ["uzziel_kohath"], spouses: [], desc: "웃시엘의 첫째 아들.", isMain: false },
  { id: "isshiah_uzziel", name: "잇시야", engName: "Isshiah", gender: "M", generation: 25, column: -5.6625, parents: ["uzziel_kohath"], spouses: [], desc: "웃시엘의 둘째 아들.", isMain: false },
  { id: "mishael_uzziel", name: "미사엘", engName: "Mishael", gender: "M", generation: 25, column: -5.0, parents: ["uzziel_kohath"], spouses: [], desc: "웃시엘의 셋째 아들.", isMain: false },
  { id: "elzaphan_uzziel", name: "엘리사반", engName: "Elzaphan", gender: "M", generation: 25, column: -4.3375, parents: ["uzziel_kohath"], spouses: [], desc: "웃시엘의 넷째 아들.", isMain: false },
  { id: "sithri_uzziel", name: "시드리", engName: "Sithri", gender: "M", generation: 25, column: -3.675, parents: ["uzziel_kohath"], spouses: [], desc: "웃시엘의 다섯째 아들.", isMain: false },

  // Kohath Branch Generation 26 (Korah's sons)
  { id: "assir_korah", name: "아실", engName: "Assir", gender: "M", generation: 26, column: -2.325, parents: ["korah"], spouses: [], desc: "고라의 첫째 아들.", isMain: false },
  { id: "elkanah_korah", name: "엘가나", engName: "Elkanah", gender: "M", generation: 26, column: -1.6625, parents: ["korah"], spouses: [], desc: "고라의 둘째 아들.", isMain: false },
  { id: "abiasaph_korah", name: "아비아삽", engName: "Abiasaph", gender: "M", generation: 26, column: -1.0, parents: ["korah"], spouses: [], desc: "고라의 셋째 아들.", isMain: false },
  { id: "ram", name: "람", engName: "Ram", gender: "M", generation: 25, column: 0, parents: ["hezron"], spouses: [], desc: "헤스론의 아들.", isMain: true },

  // Generation 26
  { id: "nadab", name: "나답", engName: "Nadab", gender: "M", generation: 26, column: 1.2, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 장남. 여호와께서 명하지 않은 다른 불을 드리다 심판 받아 사망.", isMain: false, isManual: true },
  { id: "abihu", name: "아비후", engName: "Abihu", gender: "M", generation: 26, column: 2.4, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 차남. 형 나답과 함께 다른 불을 드려 사망.", isMain: false, isManual: true },
  { id: "eleazar_priest", name: "엘르아살", engName: "Eleazar", gender: "M", generation: 26, column: 3.6, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 삼남. 아론 사후 2대 대제사장이 됨.", isMain: false, isManual: true },
  { id: "ithamar", name: "이다말", engName: "Ithamar", gender: "M", generation: 26, column: 4.8, parents: ["aaron", "elisheba"], spouses: [], desc: "아론의 막내 아들. 성막 물품을 계수하고 관리함.", isMain: false, isManual: true },
  { id: "gershom", name: "게르솜", engName: "Gershom", gender: "M", generation: 26, column: 6.0, parents: ["moses", "zipporah"], spouses: [], desc: "모세의 첫째 아들. '내가 이방에서 객이 되었다'는 뜻.", isMain: false, isManual: true },
  { id: "eliezer_moses", name: "엘리에셀", engName: "Eliezer", gender: "M", generation: 26, column: 7.2, parents: ["moses", "zipporah"], spouses: [], desc: "모세의 둘째 아들. '하나님이 나를 도우사 바로의 칼에서 구하셨다'는 뜻.", isMain: false, isManual: true },

  // Moses - Gershom line (1 Chr 23:15-16, 26:24-25)
  { id: "shebuel_gershom", name: "스바엘", engName: "Shebuel", gender: "M", generation: 27, column: 6.0, parents: ["gershom"], spouses: [], desc: "게르솜의 아들. 성전 곳간을 맡은 자 (스므엘).", isMain: false },
  { id: "rehabiah_shebuel", name: "르하뱌", engName: "Rehabiah", gender: "M", generation: 28, column: 6.0, parents: ["shebuel_gershom"], spouses: [], desc: "스바엘의 아들. 엘리에셀의 아들 르하뱌와 다른 인물.", isMain: false },
  { id: "jeshaiah_rehabiah", name: "여샤야", engName: "Jeshaiah", gender: "M", generation: 29, column: 6.0, parents: ["rehabiah_shebuel"], spouses: [], desc: "르하뱌의 아들.", isMain: false },
  { id: "joram_jeshaiah", name: "요람", engName: "Joram", gender: "M", generation: 30, column: 6.0, parents: ["jeshaiah_rehabiah"], spouses: [], desc: "여샤야의 아들.", isMain: false },
  { id: "zichri_joram", name: "시그리", engName: "Zichri", gender: "M", generation: 31, column: 6.0, parents: ["joram_jeshaiah"], spouses: [], desc: "요람의 아들.", isMain: false },
  { id: "shelomith_zichri", name: "슬로못", engName: "Shelomith", gender: "M", generation: 32, column: 6.0, parents: ["zichri_joram"], spouses: [], desc: "시그리의 아들. 다윗 왕 때 성물 곳간을 관장함.", isMain: false },

  // High Priests line from Eleazar (1 Chr 6:4-15)
  { id: "phinehas_priest", name: "비느하스", engName: "Phinehas", gender: "M", generation: 27, column: 3.6, parents: ["eleazar_priest"], spouses: [], desc: "3대 대제사장. 여호와의 질투심으로 음행 사건을 심판하여 평화의 언약을 받음.", isMain: false },
  { id: "abishua_priest", name: "아비수아", engName: "Abishua", gender: "M", generation: 28, column: 3.6, parents: ["phinehas_priest"], spouses: [], desc: "4대 대제사장.", isMain: false },
  { id: "bukki_priest", name: "북기", engName: "Bukki", gender: "M", generation: 29, column: 3.6, parents: ["abishua_priest"], spouses: [], desc: "5대 대제사장.", isMain: false },
  { id: "uzzi_priest", name: "웃시", engName: "Uzzi", gender: "M", generation: 30, column: 3.6, parents: ["bukki_priest"], spouses: [], desc: "6대 대제사장.", isMain: false },
  { id: "zerahiah_priest", name: "스라히야", engName: "Zerahiah", gender: "M", generation: 31, column: 3.6, parents: ["uzzi_priest"], spouses: [], desc: "7대 대제사장.", isMain: false },
  { id: "meraioth_priest", name: "므라욧", engName: "Meraioth", gender: "M", generation: 32, column: 3.6, parents: ["zerahiah_priest"], spouses: [], desc: "8대 대제사장.", isMain: false },
  { id: "amariah_priest1", name: "아마랴", engName: "Amariah", gender: "M", generation: 33, column: 3.6, parents: ["meraioth_priest"], spouses: [], desc: "9대 대제사장.", isMain: false },
  { id: "ahitub_priest1", name: "아히둡", engName: "Ahitub", gender: "M", generation: 34, column: 3.6, parents: ["amariah_priest1"], spouses: [], desc: "10대 대제사장.", isMain: false },
  { id: "zadok_priest1", name: "사독", engName: "Zadok", gender: "M", generation: 35, column: 4.8, parents: ["ahitub_priest1"], spouses: [], desc: "다윗 and 솔로몬 시대의 충성스러운 대제사장. 사독 계열의 시조.", isMain: false },
  { id: "ahimaaz_priest", name: "아히마아스", engName: "Ahimaaz", gender: "M", generation: 36, column: 4.8, parents: ["zadok_priest1"], spouses: [], desc: "사독의 아들. 다윗의 전령.", isMain: false },
  { id: "azariah_priest1", name: "아사랴", engName: "Azariah", gender: "M", generation: 37, column: 4.8, parents: ["ahimaaz_priest"], spouses: [], desc: "솔로몬 성전의 대제사장.", isMain: false },
  { id: "johanan_priest", name: "요하난", engName: "Johanan", gender: "M", generation: 38, column: 4.8, parents: ["azariah_priest1"], spouses: [], desc: "대제사장.", isMain: false },
  { id: "azariah_priest2", name: "아사랴(중기)", engName: "Azariah", gender: "M", generation: 39, column: 4.8, parents: ["johanan_priest"], spouses: [], desc: "솔로몬 성전에서 제사장 직분을 행한 자.", isMain: false },
  { id: "amariah_priest2", name: "아마랴(중기)", engName: "Amariah", gender: "M", generation: 40, column: 4.8, parents: ["azariah_priest2"], spouses: [], desc: "대제사장.", isMain: false },
  { id: "ahitub_priest2", name: "아히둡(중기)", engName: "Ahitub", gender: "M", generation: 41, column: 4.8, parents: ["amariah_priest2"], spouses: [], desc: "대제사장.", isMain: false },
  { id: "zadok_priest2", name: "사독(중기)", engName: "Zadok", gender: "M", generation: 42, column: 4.8, parents: ["ahitub_priest2"], spouses: [], desc: "대제사장.", isMain: false },
  { id: "shallum_priest", name: "살룸", engName: "Shallum", gender: "M", generation: 43, column: 4.8, parents: ["zadok_priest2"], spouses: [], desc: "대제사장 (살룸/므슐람).", isMain: false },
  { id: "hilkiah_priest", name: "힐기야", engName: "Hilkiah", gender: "M", generation: 44, column: 4.8, parents: ["shallum_priest"], spouses: [], desc: "요시야 왕 시절 성전 정화 중 율법책을 발견한 대제사장.", isMain: false },
  { id: "azariah_priest3", name: "아사랴(말기)", engName: "Azariah", gender: "M", generation: 45, column: 4.8, parents: ["hilkiah_priest"], spouses: [], desc: "대제사장.", isMain: false },
  { id: "seraiah_priest", name: "스라야", engName: "Seraiah", gender: "M", generation: 46, column: 4.8, parents: ["azariah_priest3"], spouses: [], desc: "예루살렘 함락 시 느부갓네살에 의해 죽임 당한 마지막 대제사장.", isMain: false },
  { id: "jehozadak_priest", name: "여호사닥", engName: "Jehozadak", gender: "M", generation: 47, column: 4.8, parents: ["seraiah_priest"], spouses: [], desc: "바벨론 포로로 잡혀간 대제사장. 학개의 동역자 여호수아의 아버지.", isMain: false },
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
  { id: "jesse", name: "이새", engName: "Jesse", gender: "M", generation: 31, column: 0, parents: ["obed"], spouses: [], desc: "베들레헴 주민. 다윗을 비롯한 여러 자녀의 아버지. 대상 2:13-15.", isMain: true },
  { id: "saul", name: "사울 왕", engName: "Saul", gender: "M", generation: 31, column: 5.6, parents: ["kish"], spouses: [], desc: "이스라엘의 초대 왕. 교만함으로 여호와께 버림받음.", isMain: false },
  
  // Jesse's children (1 Chr 2:13-16)
  { id: "eliab_jesse", name: "엘리압", engName: "Eliab", gender: "M", generation: 32, column: -4.0, parents: ["jesse"], spouses: [], desc: "이새의 장남. 용모가 뛰어남.", isMain: false },
  { id: "abinadab_jesse", name: "아비나답", engName: "Abinadab", gender: "M", generation: 32, column: -3.3375, parents: ["jesse"], spouses: [], desc: "이새의 차남.", isMain: false },
  { id: "shimea_jesse", name: "시므아", engName: "Shimea", gender: "M", generation: 32, column: -2.675, parents: ["jesse"], spouses: [], desc: "이새의 셋째 아들 (삼마).", isMain: false },
  { id: "nethaneel_jesse", name: "느다넬", engName: "Nethaneel", gender: "M", generation: 32, column: -2.0125, parents: ["jesse"], spouses: [], desc: "이새의 넷째 아들.", isMain: false },
  { id: "raddai_jesse", name: "랏대", engName: "Raddai", gender: "M", generation: 32, column: -1.35, parents: ["jesse"], spouses: [], desc: "이새의 다섯째 아들.", isMain: false },
  { id: "ozem_jesse", name: "오셈", engName: "Ozem", gender: "M", generation: 32, column: -0.6875, parents: ["jesse"], spouses: [], desc: "이새의 여섯째 아들.", isMain: false },
  { id: "david", name: "다윗 왕", engName: "David", gender: "M", generation: 32, column: 0, parents: ["jesse"], spouses: ["bathsheba", "michal", "ahinoam_david", "abigail_david", "maachah_david", "haggith_david", "abital_david", "eglah_david", "other_wives_david"], desc: "이스라엘 제2대 성왕. 하나님 마음에 합한 자. 메시아 언약 수여자.", isMain: true },
  { id: "zeruiah", name: "스루야", engName: "Zeruiah", gender: "F", generation: 32, column: -2.4, parents: ["jesse"], spouses: [], desc: "다윗의 누이. 요압, 아비새, 아사힐 삼형제의 어머니.", isMain: false },
  { id: "abigail_jesse", name: "아비가일(이새딸)", engName: "Abigail", gender: "F", generation: 32, column: -5.0, parents: ["jesse"], spouses: [], desc: "다윗의 누이.", isMain: false },

  // Jesse's grandchildren
  { id: "abihail_eliab", name: "아비하일", engName: "Abihail", gender: "F", generation: 33, column: -4.0, parents: ["eliab_jesse"], spouses: [], desc: "엘리압의 딸. 르호보암 왕의 아내가 됨.", isMain: false },
  { id: "jonadab_shimea", name: "요나답", engName: "Jonadab", gender: "M", generation: 33, column: -3.0, parents: ["shimea_jesse"], spouses: [], desc: "시므아의 아들. 심히 간교한 자.", isMain: false },
  { id: "jonathan_shimea", name: "요나단(시므아아들)", engName: "Jonathan", gender: "M", generation: 33, column: -2.3375, parents: ["shimea_jesse"], spouses: [], desc: "시므아의 아들. 다윗의 용사.", isMain: false },
  { id: "nathan_shimea", name: "나단(시므아아들)", engName: "Nathan", gender: "M", generation: 33, column: -1.675, parents: ["shimea_jesse"], spouses: [], desc: "시므아의 아들.", isMain: false },
  { id: "amasa_abigail", name: "아마사", engName: "Amasa", gender: "M", generation: 33, column: -5.0, parents: ["abigail_jesse"], spouses: [], desc: "아비가일의 아들. 압살롬 군대의 군대장관이었으나 요압에게 살해됨.", isMain: false },

  // Zeruiah's sons (already exists)
  { id: "abishai", name: "아비새", engName: "Abishai", gender: "M", generation: 33, column: -3.6, parents: ["zeruiah"], spouses: [], desc: "다윗의 용사. 요압의 아우로 에돔인들을 격파함.", isMain: false },
  { id: "joab", name: "요압", engName: "Joab", gender: "M", generation: 33, column: -2.4, parents: ["zeruiah"], spouses: [], desc: "다윗 왕의 군대장관. 정략적이고 용맹한 군장.", isMain: false },
  { id: "asahel", name: "아사헬", engName: "Asahel", gender: "M", generation: 33, column: -1.2, parents: ["zeruiah"], spouses: [], desc: "들노루 같이 빠른 다윗의 용사. 아브넬에게 살해됨.", isMain: false },

  // David's wives
  { id: "bathsheba", name: "밧세바", engName: "Bathsheba", gender: "F", generation: 32, column: 1.2, parents: [], spouses: ["david"], desc: "우리야의 아내였으나 다윗과의 비극 후 솔로몬을 낳아 왕위를 계승시킴.", isMain: true },
  { id: "michal", name: "미갈", engName: "Michal", gender: "F", generation: 32, column: 2.4, parents: [], spouses: ["david"], desc: "다윗 왕의 아내. 사울 왕의 딸.", isMain: false },
  { id: "ahinoam_david", name: "아히노암", engName: "Ahinoam", gender: "F", generation: 32, column: 3.5, parents: [], spouses: ["david"], desc: "이스르엘 여인. 다윗의 아내.", isMain: false },
  { id: "abigail_david", name: "아비가일(다윗아내)", engName: "Abigail", gender: "F", generation: 32, column: 4.5, parents: [], spouses: ["david"], desc: "갈멜 여인. 나발의 아내였으나 다윗의 아내가 됨.", isMain: false },
  { id: "maachah_david", name: "마아가(다윗아내)", engName: "Maachah", gender: "F", generation: 32, column: 5.5, parents: [], spouses: ["david"], desc: "그술 왕 달매의 딸. 다윗의 아내.", isMain: false },
  { id: "haggith_david", name: "학깃", engName: "Haggith", gender: "F", generation: 32, column: 6.5, parents: [], spouses: ["david"], desc: "다윗의 아내. 아도니야의 어머니.", isMain: false },
  { id: "abital_david", name: "아비달", engName: "Abital", gender: "F", generation: 32, column: 7.5, parents: [], spouses: ["david"], desc: "다윗의 아내. 스바댜의 어머니.", isMain: false },
  { id: "eglah_david", name: "에글라", engName: "Eglah", gender: "F", generation: 32, column: 8.5, parents: [], spouses: ["david"], desc: "다윗의 아내. 이드르암의 어머니.", isMain: false },
  { id: "other_wives_david", name: "다른 아내들", engName: "Other Wives", gender: "F", generation: 32, column: 9.5, parents: [], spouses: ["david"], desc: "다윗의 다른 아내들과 첩들.", isMain: false },

  { id: "jonathan", name: "요나단", engName: "Jonathan", gender: "M", generation: 32, column: 4.4, parents: ["saul"], spouses: [], desc: "사울의 아들. 다윗의 가장 진실한 친구이자 조력자.", isMain: false },
  { id: "ishbosheth", name: "이스보셋 왕", engName: "Ish-bosheth", gender: "M", generation: 32, column: 5.6, parents: ["saul"], spouses: [], desc: "사울 사후 마하나임에서 2년간 북이스라엘을 통치한 왕.", isMain: false },
  { id: "michal_daughter", name: "미갈(사울딸)", engName: "Michal", gender: "F", generation: 32, column: 6.8, parents: ["saul"], spouses: [], desc: "사울 왕의 딸. 다윗 왕의 첫 번째 아내가 됨.", isMain: false },

  // David's children (1 Chr 3:1-9)
  { id: "shimea_bathsheba", name: "시므아(다윗아들)", engName: "Shimea", gender: "M", generation: 33, column: -2.0, parents: ["david", "bathsheba"], spouses: [], desc: "다윗과 밧세바의 아들.", isMain: false },
  { id: "shobab_bathsheba", name: "소밥(다윗아들)", engName: "Shobab", gender: "M", generation: 33, column: -1.3375, parents: ["david", "bathsheba"], spouses: [], desc: "다윗과 밧세바의 아들.", isMain: false },
  { id: "nathan_bathsheba", name: "나단(다윗아들)", engName: "Nathan", gender: "M", generation: 33, column: -0.675, parents: ["david", "bathsheba"], spouses: [], desc: "다윗과 밧세바의 아들. 메시아 육적 계보의 조상.", isMain: false },

  { id: "amnon_david", name: "암논", engName: "Amnon", gender: "M", generation: 33, column: 3.5, parents: ["david", "ahinoam_david"], spouses: [], desc: "다윗의 장남. 다말을 범한 후 압살롬에게 살해됨.", isMain: false },
  { id: "daniel_david", name: "다니엘", engName: "Daniel", gender: "M", generation: 33, column: 4.5, parents: ["david", "abigail_david"], spouses: [], desc: "다윗의 차남 (길랍).", isMain: false },
  { id: "absalom_david", name: "압살롬", engName: "Absalom", gender: "M", generation: 33, column: 5.5, parents: ["david", "maachah_david"], spouses: [], desc: "다윗의 삼남. 반역을 꾀했으나 요압에게 죽임 당함.", isMain: false },
  { id: "tamar_david", name: "다말(다윗딸)", engName: "Tamar", gender: "F", generation: 33, column: 6.0, parents: ["david", "maachah_david"], spouses: [], desc: "압살롬의 누이. 암논에게 욕을 당함.", isMain: false },
  { id: "maachah_absalom", name: "마아가(압살롬딸)", engName: "Maachah", gender: "F", generation: 34, column: 5.5, parents: ["absalom_david"], spouses: [], desc: "압살롬의 딸. 르호보암의 아내이자 아비야의 어머니.", isMain: false },

  { id: "adonijah_david", name: "아도니야", engName: "Adonijah", gender: "M", generation: 33, column: 6.5, parents: ["david", "haggith_david"], spouses: [], desc: "다윗의 넷째 아들. 왕위를 스스로 노렸으나 솔로몬에게 처형당함.", isMain: false },
  { id: "shephatiah_david", name: "스바댜", engName: "Shephatiah", gender: "M", generation: 33, column: 7.5, parents: ["david", "abital_david"], spouses: [], desc: "다윗의 다섯째 아들.", isMain: false },
  { id: "ithream_david", name: "이드르암", engName: "Ithream", gender: "M", generation: 33, column: 8.5, parents: ["david", "eglah_david"], spouses: [], desc: "다윗의 여섯째 아들.", isMain: false },

  // David's other sons born in Jerusalem
  { id: "ibhar_david", name: "입할", engName: "Ibhar", gender: "M", generation: 33, column: 9.5, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "elishua_david", name: "엘리수아", engName: "Elishua", gender: "M", generation: 33, column: 10.1625, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "eliphelet_david1", name: "엘리벨렛(전기)", engName: "Eliphelet", gender: "M", generation: 33, column: 10.825, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "nogah_david", name: "노가", engName: "Nogah", gender: "M", generation: 33, column: 11.4875, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "nepheg_david", name: "네벡", engName: "Nepheg", gender: "M", generation: 33, column: 12.15, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "japhia_david", name: "야비야", engName: "Japhia", gender: "M", generation: 33, column: 12.8125, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "elishama_david", name: "엘리사마", engName: "Elishama", gender: "M", generation: 33, column: 13.475, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "eliada_david", name: "엘리아다", engName: "Eliada", gender: "M", generation: 33, column: 14.1375, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },
  { id: "eliphelet_david2", name: "엘리벨렛(후기)", engName: "Eliphelet", gender: "M", generation: 33, column: 14.8, parents: ["david", "other_wives_david"], spouses: [], desc: "다윗의 아들.", isMain: false },

  // Generation 33
  { id: "solomon", name: "솔로몬 왕", engName: "Solomon", gender: "M", generation: 33, column: 0, parents: ["david", "bathsheba"], spouses: ["naamah_ammon"], desc: "지혜의 왕. 예루살렘 성전을 건축함. 말년에 우상 숭배의 죄를 범함.", isMain: true },
  { id: "naamah_ammon", name: "나아마(암몬녀)", engName: "Naamah", gender: "F", generation: 33, column: 1.2, parents: [], spouses: ["solomon"], desc: "암몬 여인. 르호보암 왕의 어머니.", isMain: true },
  { id: "nathan", name: "나단(다윗아들)", engName: "Nathan", gender: "M", generation: 33, column: -2.5, parents: ["david", "bathsheba"], spouses: [], desc: "다윗과 밧세바의 아들. 누가복음 3장에 수록된 예수의 모계 조상.", isMain: false },
  { id: "mephibosheth", name: "므비보셋", engName: "Mephibosheth", gender: "M", generation: 33, column: 4.4, parents: ["jonathan"], spouses: [], desc: "요나단의 아들. 두 발을 다 절며 다윗 왕의 상에서 먹음.", isMain: false },

  // Generation 34
  { id: "rehoboam", name: "르호보암 왕", engName: "Rehoboam", gender: "M", generation: 34, column: 0, parents: ["solomon", "naamah_ammon"], spouses: ["maacah", "mahalath_rehoboam"], desc: "솔로몬의 아들. 어리석은 통치로 나라가 이스라엘과 유다로 분열됨.", isMain: true },
  { id: "maacah", name: "마아가", engName: "Maacah", gender: "F", generation: 34, column: 1.2, parents: [], spouses: ["rehoboam"], desc: "압살롬의 손녀이자 르호보암의 아내. 아비야의 어머니.", isMain: true },
  { id: "mahalath_rehoboam", name: "마할랏", engName: "Mahalath", gender: "F", generation: 34, column: -1.2, parents: [], spouses: ["rehoboam"], desc: "여리못과 아비하일의 딸(대하 11:18). 르호보암 왕의 아내.", isMain: false },
  { id: "taphath", name: "다밧", engName: "Taphath", gender: "F", generation: 34, column: -2.7, parents: ["solomon"], spouses: [], desc: "솔로몬 왕의 딸. 아비나답의 아들(벤아비나답)의 아내가 됨(왕상 4:11).", isMain: false },
  { id: "basemath", name: "바스맛", engName: "Basemath", gender: "F", generation: 34, column: -4.2, parents: ["solomon"], spouses: [], desc: "솔로몬 왕의 딸. 아히마아스의 아내가 됨(왕상 4:15).", isMain: false },

  // Generation 35
  { id: "abijah", name: "아비야 왕", engName: "Abijah", gender: "M", generation: 35, column: 0, parents: ["rehoboam", "maacah"], spouses: [], desc: "르호보암의 아들. 북이스라엘 여로보암과의 전쟁에서 여호와를 의지해 승리함.", isMain: true },
  { id: "jeush_rehoboam", name: "여우스", engName: "Jeush", gender: "M", generation: 35, column: -3.0, parents: ["rehoboam", "mahalath_rehoboam"], spouses: [], desc: "르호보암과 마할랏의 아들(대하 11:19).", isMain: false },
  { id: "shemariah_rehoboam", name: "스마랴", engName: "Shemariah", gender: "M", generation: 35, column: -2.0, parents: ["rehoboam", "mahalath_rehoboam"], spouses: [], desc: "르호보암과 마할랏의 아들(대하 11:19).", isMain: false },
  { id: "zaham_rehoboam", name: "사함", engName: "Zaham", gender: "M", generation: 35, column: -1.0, parents: ["rehoboam", "mahalath_rehoboam"], spouses: [], desc: "르호보암과 마할랏의 아들(대하 11:19).", isMain: false },
  { id: "attai_rehoboam", name: "앗대", engName: "Attai", gender: "M", generation: 35, column: 1.0, parents: ["rehoboam", "maacah"], spouses: [], desc: "르호보암과 마아가의 아들(대하 11:20).", isMain: false },
  { id: "ziza_rehoboam", name: "사사", engName: "Ziza", gender: "M", generation: 35, column: 2.0, parents: ["rehoboam", "maacah"], spouses: [], desc: "르호보암과 마아가의 아들(대하 11:20).", isMain: false },
  { id: "shelomith_rehoboam", name: "슬로밋", engName: "Shelomith", gender: "M", generation: 35, column: 3.0, parents: ["rehoboam", "maacah"], spouses: [], desc: "르호보암과 마아가의 아들(대하 11:20).", isMain: false },

  // Generation 36
  { id: "asa", name: "아사 왕", engName: "Asa", gender: "M", generation: 36, column: 0, parents: ["abijah"], spouses: ["azubah_asa"], desc: "유다의 선한 왕. 종교 개혁을 단행하고 태후 마아가의 위를 폐함.", isMain: true },
  { id: "azubah_asa", name: "아수바", engName: "Azubah", gender: "F", generation: 36, column: 1.2, parents: [], spouses: ["asa"], desc: "아사 왕의 아내. 여호사밧 왕의 어머니.", isMain: true },

  // Generation 37
  { id: "jehoshaphat", name: "여호사밧 왕", engName: "Jehoshaphat", gender: "M", generation: 37, column: 0, parents: ["asa", "azubah_asa"], spouses: [], desc: "종교 및 사법 개혁을 단행한 경건한 왕. 북이스라엘 아합 가문과 사돈을 맺음.", isMain: true },

  // Generation 38
  { id: "jehoram", name: "여호람 왕", engName: "Jehoram", gender: "M", generation: 38, column: 0, parents: ["jehoshaphat"], spouses: ["athaliah"], desc: "여호사밧의 아들. 아합의 딸 아달랴와 결혼해 유다에 우상 숭배를 들여옴.", isMain: true },
  { id: "athaliah", name: "아달랴", engName: "Athaliah", gender: "F", generation: 38, column: 1.2, parents: ["ahab", "jezebel"], spouses: ["jehoram"], desc: "아합 and 이세벨의 딸. 남편 사후 왕실 씨를 말리고 왕위를 찬탈했던 여인.", isMain: false },
  { id: "azariah1_jehoshaphat", name: "아사랴", engName: "Azariah", gender: "M", generation: 38, column: -3.6, parents: ["jehoshaphat"], spouses: [], desc: "여호사밧 왕의 아들(대하 21:2).", isMain: false },
  { id: "jehiel_jehoshaphat", name: "여히엘", engName: "Jehiel", gender: "M", generation: 38, column: -2.4, parents: ["jehoshaphat"], spouses: [], desc: "여호사밧 왕의 아들(대하 21:2).", isMain: false },
  { id: "zechariah_jehoshaphat", name: "스가랴", engName: "Zechariah", gender: "M", generation: 38, column: -1.2, parents: ["jehoshaphat"], spouses: [], desc: "여호사밧 왕의 아들(대하 21:2).", isMain: false },
  { id: "azariah2_jehoshaphat", name: "아사랴", engName: "Azariah", gender: "M", generation: 38, column: 2.2, parents: ["jehoshaphat"], spouses: [], desc: "여호사밧 왕의 아들(대하 21:2). 아사랴의 동명이인 형제.", isMain: false },
  { id: "michael_jehoshaphat", name: "미가엘", engName: "Michael", gender: "M", generation: 38, column: 5.2, parents: ["jehoshaphat"], spouses: [], desc: "여호사밧 왕의 아들(대하 21:2).", isMain: false },
  { id: "shephatiah_jehoshaphat", name: "스바냐", engName: "Shephatiah", gender: "M", generation: 38, column: 6.4, parents: ["jehoshaphat"], spouses: [], desc: "여호사밧 왕의 아들(대하 21:2). 성경에는 스바댜로 기록됨.", isMain: false },

  // Generation 39
  { id: "ahaziah", name: "아하시야 왕", engName: "Ahaziah", gender: "M", generation: 39, column: 0, parents: ["jehoram", "athaliah"], spouses: ["zibiah"], desc: "북이스라엘 예후의 혁명 때 예후에게 살해당한 유다 왕.", isMain: true },
  { id: "zibiah", name: "시비야", engName: "Zibiah", gender: "F", generation: 39, column: 1.2, parents: [], spouses: ["ahaziah"], desc: "브엘세바 출신. 요아스 왕의 어머니.", isMain: true },
  { id: "jehosheba", name: "여호세바", engName: "Jehosheba", gender: "F", generation: 39, column: -2.4, parents: [], spouses: ["jehoiada"], desc: "여호람 왕의 딸이자 아하시야의 누이. 제사장 여호야다의 아내. 요아스를 숨겨 키움(왕하 11:2).", isMain: false },
  { id: "jehoiada", name: "여호야다", engName: "Jehoiada", gender: "M", generation: 39, column: -1.2, parents: ["jehoram", "athaliah"], spouses: ["jehosheba"], desc: "남유다의 대제사장. 여호세바의 남편. 아달랴를 축출하고 요아스를 왕위로 옹립함.", isMain: false },

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
  { id: "shealtiel", name: "스알디엘", engName: "Shealtiel", gender: "M", generation: 51, column: 0, parents: ["jeconiah"], spouses: [], desc: "여고냐의 아들. 포로 생활 중 메시아 계보 계승.", isMain: true },

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
  { id: "shealtiel_luke", name: "스알디엘", engName: "Shealtiel", gender: "M", generation: 51.0, column: -2.5, parents: ["neri"], spouses: [], desc: "네리의 아들. 스룹바벨의 아버지 (눅 계열).", isMain: false },
  { id: "zerubbabel_luke", name: "스룹바벨", engName: "Zerubbabel", gender: "M", generation: 52.0, column: -2.5, parents: ["shealtiel_luke"], spouses: [], desc: "스알디엘의 아들 (눅 계열).", isMain: false },
  { id: "rhesa", name: "레사", engName: "Rhesa", gender: "M", generation: 52.5, column: -2.5, parents: ["zerubbabel_luke"], spouses: [], desc: "스룹바벨의 아들.", isMain: false },
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
  { id: "matthat_luke2", name: "맛닷(눅2)", engName: "Matthat", gender: "M", generation: 60.5, column: -2.5, parents: ["levi_luke2"], spouses: [], desc: "헬리의 아버지. 누가복음 3장에 기록된 예수의 조상.", isMain: false },

  // ==========================================
  // 11-2 Ephraim's Tribe & Descendants (민 26:35-37 / 대상 7:20-29)
  // ==========================================
  { id: "shuthelah_eph", name: "수델라", engName: "Shuthelah", gender: "M", generation: 24, column: 10.0, parents: ["ephraim"], spouses: [], desc: "에브라임의 첫째 아들. 에브라임의 주요 가계.", isMain: false },
  { id: "ezer_eph", name: "에셀", engName: "Ezer", gender: "M", generation: 24, column: 11.0, parents: ["ephraim"], spouses: [], desc: "에브라임의 아들. 가드 원주민에게 가축을 빼앗으려다 죽임을 당함.", isMain: false },
  { id: "elead_eph", name: "엘르앗", engName: "Elead", gender: "M", generation: 24, column: 12.0, parents: ["ephraim"], spouses: [], desc: "에브라임의 아들. 가드 원주민에게 가축을 빼앗으려다 죽임을 당함.", isMain: false },
  { id: "beriah_eph", name: "브라아", engName: "Beriah", gender: "M", generation: 24, column: 13.0, parents: ["ephraim"], spouses: [], desc: "에브라임의 아들. 그의 집안이 재앙(악)에 빠졌을 때 낳았다는 뜻.", isMain: false },
  { id: "sheerah_eph", name: "세에라", engName: "Sheerah", gender: "F", generation: 24, column: 14.0, parents: ["ephraim"], spouses: [], desc: "에브라임의 딸. 우, 아래 벧호론과 우센세에라를 건설함.", isMain: false },

  { id: "bered_eph", name: "베렛", engName: "Bered", gender: "M", generation: 25, column: 10.0, parents: ["shuthelah_eph"], spouses: [], desc: "수델라의 아들. 에브라임의 직계 후손.", isMain: false },
  { id: "rephah_eph", name: "레바", engName: "Rephah", gender: "M", generation: 25, column: 12.5, parents: ["beriah_eph"], spouses: [], desc: "브라아의 아들. 여호수아의 직계 조상.", isMain: false },
  { id: "resheph_eph", name: "레셉", engName: "Resheph", gender: "M", generation: 25, column: 13.5, parents: ["beriah_eph"], spouses: [], desc: "브라아의 아들. 여호수아의 직계 조상.", isMain: false },

  { id: "tahath1_eph", name: "다핫", engName: "Tahath", gender: "M", generation: 26, column: 10.0, parents: ["bered_eph"], spouses: [], desc: "베렛의 아들.", isMain: false },
  { id: "telah_eph", name: "델라", engName: "Telah", gender: "M", generation: 26, column: 13.5, parents: ["resheph_eph"], spouses: [], desc: "레셉의 아들. 여호수아의 직계 조상.", isMain: false },

  { id: "deborah_eph", name: "드보라", engName: "Deborah", gender: "F", generation: 26.5, column: 11.5, parents: [], spouses: [], desc: "4대 사사. 여선지자. 에브라임 산지 라맛과 벧엘 사이 거주하며 40년간 다스림.", isMain: false },

  { id: "eleadah_eph", name: "엘르아다", engName: "Eleadah", gender: "M", generation: 27, column: 10.0, parents: ["tahath1_eph"], spouses: [], desc: "다핫의 아들.", isMain: false },
  { id: "tahan_eph", name: "다한", engName: "Tahan", gender: "M", generation: 27, column: 13.5, parents: ["telah_eph"], spouses: [], desc: "델라의 아들. 여호수아의 직계 조상.", isMain: false },

  { id: "tahath2_eph", name: "다핫", engName: "Tahath", gender: "M", generation: 28, column: 10.0, parents: ["eleadah_eph"], spouses: [], desc: "엘르아다의 아들.", isMain: false },
  { id: "ladan_eph", name: "라단", engName: "Ladan", gender: "M", generation: 28, column: 13.5, parents: ["tahan_eph"], spouses: [], desc: "다한의 아들. 여호수아의 조부의 조부.", isMain: false },

  { id: "abdon_eph", name: "압돈", engName: "Abdon", gender: "M", generation: 28.5, column: 11.5, parents: [], spouses: [], desc: "11대 사사. 에브라임 산지 비라돈 출신. 8년간 다스림.", isMain: false },

  { id: "zabad_eph", name: "사밧", engName: "Zabad", gender: "M", generation: 29, column: 10.0, parents: ["tahath2_eph"], spouses: [], desc: "다핫의 아들.", isMain: false },
  { id: "ammihud_eph", name: "암미훗", engName: "Ammihud", gender: "M", generation: 29, column: 13.5, parents: ["ladan_eph"], spouses: [], desc: "라단의 아들. 여호수아의 증조부.", isMain: false },

  { id: "shuthelah2_eph", name: "수델라", engName: "Shuthelah", gender: "M", generation: 30, column: 10.0, parents: ["zabad_eph"], spouses: [], desc: "사밧의 아들. 수델라 가계의 완성.", isMain: false },
  { id: "elishama_eph", name: "엘리사마", engName: "Elishama", gender: "M", generation: 30, column: 13.5, parents: ["ammihud_eph"], spouses: [], desc: "암미훗의 아들. 에브라임 지파의 우두머리이자 여호수아의 조부.", isMain: false },

  { id: "nun_eph", name: "눈", engName: "Nun", gender: "M", generation: 31, column: 13.5, parents: ["elishama_eph"], spouses: [], desc: "엘리사마의 아들. 에브라임 지파 지휘관이자 여호수아의 친부.", isMain: false },
  { id: "joshua_eph", name: "여호수아", engName: "Joshua", gender: "M", generation: 32, column: 13.5, parents: ["nun_eph"], spouses: [], desc: "눈의 아들(본명 호세아). 모세의 수계자이자 가나안 정복전쟁을 이끈 위대한 지도자.", isMain: false },

  // ==========================================
  // 11-1 Manasseh's Tribe & Descendants (민 26:29-35 / 대상 7:14-19)
  // ==========================================
  { id: "man_wife", name: "아내", engName: "Wife", gender: "F", generation: 23.5, column: 15.0, parents: [], spouses: ["manasseh"], desc: "므낫세의 아내.", isMain: false },
  { id: "man_concubine", name: "아람여인", engName: "Concubine", gender: "F", generation: 23.5, column: 17.5, parents: [], spouses: ["manasseh"], desc: "므낫세의 아람 첩.", isMain: false },

  { id: "asriel_man", name: "아스리엘", engName: "Asriel", gender: "M", generation: 24, column: 15.0, parents: ["manasseh", "man_wife"], spouses: [], desc: "므낫세와 그의 아내의 아들. 아스리엘 종족의 조상.", isMain: false },
  { id: "zelophehad1_man", name: "슬로브핫(둘째아들)", engName: "Zelophehad", gender: "M", generation: 24, column: 16.0, parents: ["manasseh", "man_wife"], spouses: [], desc: "므낫세의 둘째 아들. 딸들만 낳음(대상 7:15).", isMain: false },
  { id: "machir_man", name: "마길", engName: "Machir", gender: "M", generation: 24, column: 18.0, parents: ["manasseh", "man_concubine"], spouses: ["maacah_man"], desc: "므낫세와 아람 첩의 아들. 길르앗의 아버지.", isMain: false },
  { id: "maacah_man", name: "마아가", engName: "Maacah", gender: "F", generation: 24, column: 19.2, parents: [], spouses: ["machir_man"], desc: "마길의 아내.", isMain: false },

  { id: "gilead_man", name: "길르앗", engName: "Gilead", gender: "M", generation: 25, column: 17.0, parents: ["machir_man", "maacah_man"], spouses: ["gilead_wife", "gilead_conc"], desc: "마길과 마아가의 아들. 길르앗 종족의 조상.", isMain: false },
  { id: "gilead_conc", name: "기생", engName: "Concubine", gender: "F", generation: 25, column: 13.5, parents: [], spouses: ["gilead_man"], desc: "길르앗의 첩(기생).", isMain: false },
  { id: "gilead_wife", name: "부인", engName: "Wife", gender: "F", generation: 25, column: 20.5, parents: [], spouses: ["gilead_man"], desc: "길르앗의 아내.", isMain: false },
  { id: "hammoleketh_man", name: "함몰레겟", engName: "Hammoleketh", gender: "F", generation: 25, column: 23.0, parents: ["machir_man", "maacah_man"], spouses: [], desc: "마길의 딸. 길르앗의 누이. '여왕'이라는 뜻.", isMain: false },
  { id: "peresh_man", name: "베레스", engName: "Peresh", gender: "M", generation: 25, column: 25.0, parents: ["machir_man", "maacah_man"], spouses: [], desc: "마길과 마아가의 아들.", isMain: false },
  { id: "sheresh_man", name: "세레스", engName: "Sheresh", gender: "M", generation: 25, column: 26.5, parents: ["machir_man", "maacah_man"], spouses: [], desc: "마길과 마아가의 아들.", isMain: false },

  { id: "jephthah_man", name: "입다", engName: "Jephthah", gender: "M", generation: 26, column: 12.5, parents: ["gilead_man", "gilead_conc"], spouses: [], desc: "8대 사사. 길르앗의 아들. 큰 용사였으나 기생의 몸에서 태어나 쫓겨났다가 사사가 됨.", isMain: false },
  { id: "iezer_man", name: "이에셀", engName: "Iezer", gender: "M", generation: 26, column: 14.5, parents: ["gilead_man"], spouses: [], desc: "길르앗의 아들. 아비에셀 종족의 조상.", isMain: false },
  { id: "helek_man", name: "헬렉", engName: "Helek", gender: "M", generation: 26, column: 15.5, parents: ["gilead_man"], spouses: [], desc: "길르앗의 아들. 헬렉 종족의 조상.", isMain: false },
  { id: "asriel2_man", name: "아스리엘(길르앗아들)", engName: "Asriel", gender: "M", generation: 26, column: 16.5, parents: ["gilead_man"], spouses: [], desc: "길르앗의 아들. 아스리엘 종족의 조상.", isMain: false },
  { id: "shechem_man", name: "세겜", engName: "Shechem", gender: "M", generation: 26, column: 17.5, parents: ["gilead_man"], spouses: [], desc: "길르앗의 아들. 세겜 종족의 조상.", isMain: false },
  { id: "shemida_man", name: "스미다", engName: "Shemida", gender: "M", generation: 26, column: 18.5, parents: ["gilead_man"], spouses: [], desc: "길르앗의 아들. 스미다 종족의 조상.", isMain: false },
  { id: "hepher_man", name: "헤벨", engName: "Hepher", gender: "M", generation: 26, column: 19.5, parents: ["gilead_man"], spouses: [], desc: "길르앗의 아들. 헤벨 종족의 조상.", isMain: false },
  { id: "brothers_eph", name: "아들들", engName: "Brothers", gender: "M", generation: 26, column: 21.5, parents: ["gilead_man", "gilead_wife"], spouses: [], desc: "길르앗의 적자들. 입다를 쫓아냄.", isMain: false },

  { id: "ishhod_man", name: "이스홋", engName: "Ishhod", gender: "M", generation: 26, column: 22.8, parents: ["hammoleketh_man"], spouses: [], desc: "함몰레겟의 아들. '영광의 사람'이라는 뜻.", isMain: false },
  { id: "joash_man", name: "요아스", engName: "Joash", gender: "M", generation: 26, column: 24.0, parents: ["hammoleketh_man"], spouses: [], desc: "함몰레겟의 아들. 아비에셀 사람 요아스. 기드온의 아버지.", isMain: false },
  { id: "mahlah_man", name: "말라(함몰레겟딸)", engName: "Mahlah", gender: "F", generation: 26, column: 25.0, parents: ["hammoleketh_man"], spouses: [], desc: "함몰레겟의 딸.", isMain: false },

  { id: "ulam_man", name: "울람", engName: "Ulam", gender: "M", generation: 26, column: 26.5, parents: ["sheresh_man"], spouses: [], desc: "세레스의 아들.", isMain: false },
  { id: "rakem_man", name: "라겜", engName: "Rakem", gender: "M", generation: 26, column: 27.5, parents: ["sheresh_man"], spouses: [], desc: "세레스의 아들.", isMain: false },

  { id: "jair_man", name: "야일", engName: "Jair", gender: "M", generation: 27.5, column: 12.0, parents: [], spouses: [], desc: "길르앗 사람 야일. 22년간 이스라엘을 다스린 사사.", isMain: false },

  { id: "ahian_man", name: "아히안", engName: "Ahian", gender: "M", generation: 27, column: 17.0, parents: ["shemida_man"], spouses: [], desc: "스미다의 아들.", isMain: false },
  { id: "shechem2_man", name: "세겜(스미다아들)", engName: "Shechem", gender: "M", generation: 27, column: 17.8, parents: ["shemida_man"], spouses: [], desc: "스미다의 아들.", isMain: false },
  { id: "likhi_man", name: "릭히", engName: "Likhi", gender: "M", generation: 27, column: 18.6, parents: ["shemida_man"], spouses: [], desc: "스미다의 아들.", isMain: false },
  { id: "aniam_man", name: "아니암", engName: "Aniam", gender: "M", generation: 27, column: 19.4, parents: ["shemida_man"], spouses: [], desc: "스미다의 아들.", isMain: false },

  { id: "zelophehad2_man", name: "슬로브핫", engName: "Zelophehad", gender: "M", generation: 27, column: 20.5, parents: ["hepher_man"], spouses: [], desc: "헤벨의 아들. 아들이 없이 딸들만 낳고 광야에서 죽음.", isMain: false },

  { id: "gideon_man", name: "기드온", engName: "Gideon", gender: "M", generation: 27, column: 24.0, parents: ["joash_man"], spouses: ["gideon_wife", "gideon_conc"], desc: "5대 사사(여룹바알). 미디안과의 전쟁을 승리로 이끈 위대한 사사.", isMain: false },
  { id: "gideon_wife", name: "부인", engName: "Wife", gender: "F", generation: 27.5, column: 23.5, parents: [], spouses: ["gideon_man"], desc: "기드온의 아내.", isMain: false },
  { id: "gideon_conc", name: "첩", engName: "Concubine", gender: "F", generation: 27.5, column: 24.5, parents: [], spouses: ["gideon_man"], desc: "기드온의 세겜 첩.", isMain: false },

  { id: "bedan_man", name: "브단", engName: "Bedan", gender: "M", generation: 27, column: 26.5, parents: ["ulam_man"], spouses: [], desc: "울람의 아들.", isMain: false },

  { id: "mahlah_d", name: "말라", engName: "Mahlah", gender: "M", generation: 28, column: 18.5, parents: ["zelophehad2_man"], spouses: [], desc: "슬로브핫의 첫째 아들. 상속권을 요구하여 하나님의 규례를 세움.", isMain: false },
  { id: "noah_d", name: "노아", engName: "Noah", gender: "M", generation: 28, column: 19.5, parents: ["zelophehad2_man"], spouses: [], desc: "슬로브핫의 둘째 아들.", isMain: false },
  { id: "hoglah_d", name: "호글라", engName: "Hoglah", gender: "M", generation: 28, column: 20.5, parents: ["zelophehad2_man"], spouses: [], desc: "슬로브핫의 셋째 아들.", isMain: false },
  { id: "milcah_d", name: "밀가", engName: "Milcah", gender: "M", generation: 28, column: 21.5, parents: ["zelophehad2_man"], spouses: [], desc: "슬로브핫의 넷째 아들.", isMain: false },
  { id: "tirzah_d", name: "디르사", engName: "Tirzah", gender: "M", generation: 28, column: 22.5, parents: ["zelophehad2_man"], spouses: [], desc: "슬로브핫의 다섯째 아들.", isMain: false },

  { id: "jether_man", name: "여델", engName: "Jether", gender: "M", generation: 28, column: 23.5, parents: ["gideon_man", "gideon_wife"], spouses: [], desc: "기드온의 장남. 어려서 적장을 죽이지 못하고 두려워함.", isMain: false },
  { id: "jotham_man", name: "요담", engName: "Jotham", gender: "M", generation: 28, column: 24.0, parents: ["gideon_man", "gideon_wife"], spouses: [], desc: "기드온의 막내 아들. 아비멜렉의 학살에서 유일하게 생존하여 그리심 산에서 요담의 우화를 선포함.", isMain: false },
  { id: "abimelech_man", name: "아비멜렉", engName: "Abimelech", gender: "M", generation: 28, column: 24.5, parents: ["gideon_man", "gideon_conc"], spouses: [], desc: "기드온의 첩의 아들. 형제 70명을 학살하고 스스로 왕이 된 자.", isMain: false },

  // ==========================================
  // Kings of Northern Israel (북 이스라엘 왕)
  // ==========================================
  { id: "nebat", name: "느밧", engName: "Nebat", gender: "M", generation: 33, column: -33.0, parents: [], spouses: ["zeruah_nebat"], desc: "여로보암 1세의 아버지.", isMain: false },
  { id: "zeruah_nebat", name: "스루아", engName: "Zeruah", gender: "F", generation: 33, column: -31.8, parents: [], spouses: ["nebat"], desc: "느밧의 아내. 과부.", isMain: false },
  { id: "jeroboam1", name: "여로보암 1세", engName: "Jeroboam I", gender: "M", generation: 34, column: -33.0, parents: ["nebat", "zeruah_nebat"], spouses: [], desc: "북이스라엘의 초대 왕. 금송아지 우상을 만듦.", isMain: false },
  { id: "nadab_jeroboam", name: "나답", engName: "Nadab", gender: "M", generation: 35, column: -33.0, parents: ["jeroboam1"], spouses: [], desc: "북이스라엘 2대 왕.", isMain: false },
  { id: "abijah_jeroboam", name: "아비야(여로보암아들)", engName: "Abijah", gender: "M", generation: 35, column: -31.8, parents: ["jeroboam1"], spouses: [], desc: "여로보암의 아들. 병들어 사망.", isMain: false },
  { id: "baasha", name: "바아사", engName: "Baasha", gender: "M", generation: 36, column: -33.0, parents: ["nadab_jeroboam"], spouses: [], desc: "북이스라엘 3대 왕. 나답을 죽이고 왕이 됨.", isMain: false },
  { id: "elah_baasha", name: "엘라", engName: "Elah", gender: "M", generation: 37, column: -33.0, parents: ["baasha"], spouses: [], desc: "북이스라엘 4대 왕. 시므리에게 피살됨.", isMain: false },
  { id: "zimri", name: "시므리", engName: "Zimri", gender: "M", generation: 38, column: -33.0, parents: ["elah_baasha"], spouses: [], desc: "북이스라엘 5대 왕. 7일간 통치 후 자결.", isMain: false },
  { id: "omri", name: "오므리", engName: "Omri", gender: "M", generation: 39, column: -33.0, parents: ["zimri"], spouses: [], desc: "북이스라엘 6대 왕. 사마리아를 수도로 정함.", isMain: false },
  { id: "ahab", name: "아합", engName: "Ahab", gender: "M", generation: 40, column: -33.0, parents: ["omri"], spouses: ["jezebel"], desc: "북이스라엘 7대 왕. 바알 우상 숭배의 극치를 달림.", isMain: false },
  { id: "jezebel", name: "이세벨", engName: "Jezebel", gender: "F", generation: 40, column: -31.8, parents: [], spouses: ["ahab"], desc: "아합의 아내. 시돈 왕 엣바알의 딸. 바알 숭배자.", isMain: false },
  { id: "ahaziah_ahab", name: "아하시야", engName: "Ahaziah", gender: "M", generation: 41, column: -33.0, parents: ["ahab", "jezebel"], spouses: [], desc: "북이스라엘 8대 왕.", isMain: false },
  { id: "jehoram_ahab", name: "여호람(요람)", engName: "Jehoram", gender: "M", generation: 41, column: -31.8, parents: ["ahab", "jezebel"], spouses: [], desc: "북이스라엘 9대 왕. 예후에게 죽임 당함.", isMain: false },
  { id: "jehu", name: "예후", engName: "Jehu", gender: "M", generation: 42, column: -33.0, parents: ["jehoram_ahab"], spouses: [], desc: "북이스라엘 10대 왕. 아합 가문을 심판함.", isMain: false },
  { id: "jehoahaz_jehu", name: "여호아하스", engName: "Jehoahaz", gender: "M", generation: 43, column: -33.0, parents: ["jehu"], spouses: [], desc: "북이스라엘 11대 왕.", isMain: false },
  { id: "jehoash_jehoahaz", name: "요아스(북이스라엘)", engName: "Jehoash", gender: "M", generation: 44, column: -33.0, parents: ["jehoahaz_jehu"], spouses: [], desc: "북이스라엘 12대 왕.", isMain: false },
  { id: "jeroboam2", name: "여로보암 2세", engName: "Jeroboam II", gender: "M", generation: 45, column: -33.0, parents: ["jehoash_jehoahaz"], spouses: [], desc: "북이스라엘 13대 왕. 번영기를 이끔.", isMain: false },
  { id: "zechariah_jeroboam2", name: "스가랴", engName: "Zechariah", gender: "M", generation: 46, column: -33.0, parents: ["jeroboam2"], spouses: [], desc: "북이스라엘 14대 왕. 살룸에게 피살됨.", isMain: false },
  { id: "shallum", name: "살룸", engName: "Shallum", gender: "M", generation: 47, column: -33.0, parents: ["zechariah_jeroboam2"], spouses: [], desc: "북이스라엘 15대 왕. 1개월간 통치.", isMain: false },
  { id: "menahem", name: "므나헴", engName: "Menahem", gender: "M", generation: 48, column: -33.0, parents: ["shallum"], spouses: [], desc: "북이스라엘 16대 왕.", isMain: false },
  { id: "pekahiah", name: "브가히야", engName: "Pekahiah", gender: "M", generation: 49, column: -33.0, parents: ["menahem"], spouses: [], desc: "북이스라엘 17대 왕.", isMain: false },
  { id: "pekah", name: "베가", engName: "Pekah", gender: "M", generation: 50, column: -33.0, parents: ["pekahiah"], spouses: [], desc: "북이스라엘 18대 왕.", isMain: false },
  { id: "hoshea", name: "호세아(왕)", engName: "Hoshea", gender: "M", generation: 51, column: -33.0, parents: ["pekah"], spouses: [], desc: "북이스라엘의 마지막 19대 왕.", isMain: false },

  // ==========================================
  // 1 Chr 4 Independent Lineages (대상 4장 독립 족보)
  // ==========================================
  
  // 1. 레카 사람 (People of Rechab)
  { id: "chelub_suhah", name: "글룹", engName: "Chelub", gender: "M", generation: 24, column: 26.0, parents: [], spouses: [], desc: "수하의 형. 대상 4:11.", isMain: false },
  { id: "mehir_chelub", name: "므힐", engName: "Mehir", gender: "M", generation: 25, column: 26.0, parents: ["chelub_suhah"], spouses: [], desc: "글룹의 아들. 에스돈의 아버지.", isMain: false },
  { id: "eshton_mehir", name: "에스돈", engName: "Eshton", gender: "M", generation: 26, column: 26.0, parents: ["mehir_chelub"], spouses: [], desc: "므힐의 아들.", isMain: false },
  { id: "dehinnah_eshton", name: "디힌나", engName: "Dehinnah", gender: "M", generation: 27, column: 26.0, parents: ["eshton_mehir"], spouses: [], desc: "에스돈의 아들. 레가 사람의 조상.", isMain: false },
  { id: "bethrapha_dehinnah", name: "베드라바", engName: "Beth-rapha", gender: "M", generation: 28, column: 25.0, parents: ["dehinnah_eshton"], spouses: [], desc: "디힌나의 아들.", isMain: false },
  { id: "paseah_dehinnah", name: "바세아", engName: "Paseah", gender: "M", generation: 28, column: 26.0, parents: ["dehinnah_eshton"], spouses: [], desc: "디힌나의 아들.", isMain: false },
  { id: "irnahash_dehinnah", name: "이르나하스", engName: "Ir-nahash", gender: "M", generation: 28, column: 27.0, parents: ["dehinnah_eshton"], spouses: [], desc: "디힌나의 아들. 이르나하스 성읍의 조상.", isMain: false },

  // 2. 그나스 사람 (Kenizzites)
  { id: "jephunneh", name: "여분네", engName: "Jephunneh", gender: "M", generation: 23, column: 31.0, parents: [], spouses: [], desc: "갈렙과 그나스의 아버지.", isMain: false },
  { id: "caleb_jephunneh", name: "갈렙(여분네아들)", engName: "Caleb", gender: "M", generation: 24, column: 30.0, parents: ["jephunneh"], spouses: [], desc: "여분네의 아들. 가나안 정탐꾼.", isMain: false },
  { id: "kenaz_jephunneh", name: "그나스", engName: "Kenaz", gender: "M", generation: 24, column: 32.5, parents: ["jephunneh"], spouses: [], desc: "여분네의 아들. 옷니엘과 스라야의 아버지.", isMain: false },
  { id: "iru_caleb", name: "이루", engName: "Iru", gender: "M", generation: 25, column: 28.5, parents: ["caleb_jephunneh"], spouses: [], desc: "갈렙의 아들.", isMain: false },
  { id: "elah_caleb", name: "엘라", engName: "Elah", gender: "M", generation: 25, column: 29.5, parents: ["caleb_jephunneh"], spouses: [], desc: "갈렙의 아들.", isMain: false },
  { id: "naam_caleb", name: "나암", engName: "Naam", gender: "M", generation: 25, column: 30.5, parents: ["caleb_jephunneh"], spouses: [], desc: "갈렙의 아들.", isMain: false },
  { id: "achsah_caleb", name: "악사", engName: "Achsah", gender: "F", generation: 25, column: 31.5, parents: ["caleb_jephunneh"], spouses: [], desc: "갈렙의 딸.", isMain: false },
  { id: "kenaz_elah", name: "그나스(엘라아들)", engName: "Kenaz", gender: "M", generation: 26, column: 29.5, parents: ["elah_caleb"], spouses: [], desc: "엘라의 아들.", isMain: false },
  { id: "othniel_kenaz", name: "옷니엘", engName: "Othniel", gender: "M", generation: 25, column: 32.5, parents: ["kenaz_jephunneh"], spouses: [], desc: "이스라엘의 초대 사사. 그나스의 아들.", isMain: false },
  { id: "seraiah_kenaz", name: "스라야(그나스아들)", engName: "Seraiah", gender: "M", generation: 25, column: 33.7, parents: ["kenaz_jephunneh"], spouses: [], desc: "그나스의 아들. 요압의 아버지.", isMain: false },
  { id: "hathath_othniel", name: "하닷", engName: "Hathath", gender: "M", generation: 26, column: 32.0, parents: ["othniel_kenaz"], spouses: [], desc: "옷니엘의 아들.", isMain: false },
  { id: "meonothai_othniel", name: "므오노대", engName: "Meonothai", gender: "M", generation: 26, column: 33.0, parents: ["othniel_kenaz"], spouses: [], desc: "옷니엘의 아들. 오브라의 아버지.", isMain: false },
  { id: "ophrah_meonothai", name: "오브라", engName: "Ophrah", gender: "M", generation: 27, column: 33.0, parents: ["meonothai_othniel"], spouses: [], desc: "므오노대의 아들.", isMain: false },
  { id: "joab_seraiah", name: "요압(스라야아들)", engName: "Joab", gender: "M", generation: 26, column: 34.0, parents: ["seraiah_kenaz"], spouses: [], desc: "스라야의 아들. 게하라심(장인들 골짜기)의 조상.", isMain: false },

  // 3. 여할렐렐 (Jehalelyel)
  { id: "jehalelyel", name: "여할렐렐", engName: "Jehalelyel", gender: "M", generation: 24, column: 37.0, parents: [], spouses: [], desc: "유다 지손. 대상 4:16.", isMain: false },
  { id: "ziph_jehalelyel", name: "십(여할렐렐아들)", engName: "Ziph", gender: "M", generation: 25, column: 35.5, parents: ["jehalelyel"], spouses: [], desc: "여할렐렐의 아들.", isMain: false },
  { id: "ziphah_jehalelyel", name: "시바", engName: "Ziphah", gender: "M", generation: 25, column: 36.5, parents: ["jehalelyel"], spouses: [], desc: "여할렐렐의 아들.", isMain: false },
  { id: "tiria_jehalelyel", name: "디리야", engName: "Tiria", gender: "M", generation: 25, column: 37.5, parents: ["jehalelyel"], spouses: [], desc: "여할렐렐의 아들.", isMain: false },
  { id: "asarel_jehalelyel", name: "아사헬(여할렐렐아들)", engName: "Asarel", gender: "M", generation: 25, column: 38.5, parents: ["jehalelyel"], spouses: [], desc: "여할렐렐의 아들.", isMain: false },

  // 4. 에스라 (Ezrah)
  { id: "ezrah_juda", name: "에스라", engName: "Ezrah", gender: "M", generation: 24, column: 42.5, parents: [], spouses: [], desc: "유다 자손. 대상 4:17.", isMain: false },
  { id: "jether_ezrah", name: "예델(에스라아들)", engName: "Jether", gender: "M", generation: 25, column: 40.0, parents: ["ezrah_juda"], spouses: [], desc: "에스라의 아들.", isMain: false },
  { id: "mered_ezrah", name: "메렛", engName: "Mered", gender: "M", generation: 25, column: 42.5, parents: ["ezrah_juda"], spouses: ["bithiah_mered", "jehudijah_mered"], desc: "에스라의 아들. 두 아내를 맞이함.", isMain: false },
  { id: "epher_ezrah", name: "에벨(에스라아들)", engName: "Epher", gender: "M", generation: 25, column: 44.5, parents: ["ezrah_juda"], spouses: [], desc: "에스라의 아들.", isMain: false },
  { id: "jalon_ezrah", name: "얄론", engName: "Jalon", gender: "M", generation: 25, column: 45.5, parents: ["ezrah_juda"], spouses: [], desc: "에스라의 아들.", isMain: false },
  { id: "bithiah_mered", name: "비다아(바로딸)", engName: "Bithiah", gender: "F", generation: 25, column: 41.2, parents: [], spouses: ["mered_ezrah"], desc: "바로의 딸. 메렛의 아내.", isMain: false },
  { id: "jehudijah_mered", name: "여후디야", engName: "Jehudijah", gender: "F", generation: 25, column: 43.5, parents: [], spouses: ["mered_ezrah"], desc: "유다 여인. 메렛의 아내.", isMain: false },
  { id: "miriam_mered", name: "미리암(메렛자손)", engName: "Miriam", gender: "F", generation: 26, column: 40.5, parents: ["mered_ezrah", "bithiah_mered"], spouses: [], desc: "메렛과 비다아의 딸.", isMain: false },
  { id: "shammai_mered", name: "삼매", engName: "Shammai", gender: "M", generation: 26, column: 41.5, parents: ["mered_ezrah", "bithiah_mered"], spouses: [], desc: "메렛과 비다아의 아들.", isMain: false },
  { id: "ishbah_mered", name: "이스바", engName: "Ishbah", gender: "M", generation: 26, column: 42.5, parents: ["mered_ezrah", "bithiah_mered"], spouses: [], desc: "메렛과 비다아의 아들. 에스도모아의 조상.", isMain: false },
  { id: "jered_mered", name: "예렛", engName: "Jered", gender: "M", generation: 26, column: 43.5, parents: ["mered_ezrah", "jehudijah_mered"], spouses: [], desc: "메렛과 여후디야의 아들. 그돌의 조상.", isMain: false },
  { id: "heber_mered", name: "헤벨", engName: "Heber", gender: "M", generation: 26, column: 44.5, parents: ["mered_ezrah", "jehudijah_mered"], spouses: [], desc: "메렛과 여후디야의 아들. 소고의 조상.", isMain: false },
  { id: "jekuthiel_mered", name: "여구디엘", engName: "Jekuthiel", gender: "M", generation: 26, column: 45.5, parents: ["mered_ezrah", "jehudijah_mered"], spouses: [], desc: "메렛과 여후디야의 아들. 사노아의 조상.", isMain: false },

  // 5. 호디야와 나함 (Hodiah and Naham)
  { id: "parent_hodiah_wife", name: "부모", engName: "Parent", gender: "M", generation: 24, column: 49.5, parents: [], spouses: [], desc: "비다아와 나함의 부모.", isMain: false },
  { id: "sister_nahum", name: "비다아(나함누이)", engName: "Bithiah", gender: "F", generation: 25, column: 49.0, parents: ["parent_hodiah_wife"], spouses: ["hodiah"], desc: "나함의 누이. 호디야의 아내.", isMain: false },
  { id: "naham", name: "나함", engName: "Naham", gender: "M", generation: 25, column: 50.2, parents: ["parent_hodiah_wife"], spouses: [], desc: "호디야 아내의 남동생(또는 형제).", isMain: false },
  { id: "hodiah", name: "호디야", engName: "Hodiah", gender: "M", generation: 25, column: 48.0, parents: [], spouses: ["sister_nahum"], desc: "대상 4:19.", isMain: false },
  { id: "sons_hodiah", name: "아들들", engName: "Sons", gender: "M", generation: 26, column: 48.5, parents: ["hodiah", "sister_nahum"], spouses: [], desc: "호디야와 그의 아내의 아들들.", isMain: false },
  { id: "keilah_hodiah", name: "그일라", engName: "Keilah", gender: "M", generation: 27, column: 48.0, parents: ["sons_hodiah"], spouses: [], desc: "호디야의 아들. 그일라 사람의 조상.", isMain: false },
  { id: "eshtemoa_hodiah", name: "에스드모아", engName: "Eshtemoa", gender: "M", generation: 27, column: 49.0, parents: ["sons_hodiah"], spouses: [], desc: "호디야의 아들. 마아가 사람 에스드모아의 조상.", isMain: false },

  // 6. 시몬 (Shimon)
  { id: "shimon", name: "시몬", engName: "Shimon", gender: "M", generation: 24, column: 53.5, parents: [], spouses: [], desc: "유다 자손. 대상 4:20.", isMain: false },
  { id: "amnon_shimon", name: "암논(시몬아들)", engName: "Amnon", gender: "M", generation: 25, column: 52.0, parents: ["shimon"], spouses: [], desc: "시몬의 아들.", isMain: false },
  { id: "rinnah_shimon", name: "린나", engName: "Rinnah", gender: "M", generation: 25, column: 53.0, parents: ["shimon"], spouses: [], desc: "시몬의 아들.", isMain: false },
  { id: "benhanan_shimon", name: "벤하난", engName: "Ben-hanan", gender: "M", generation: 25, column: 54.0, parents: ["shimon"], spouses: [], desc: "시몬의 아들.", isMain: false },
  { id: "tilon_shimon", name: "딜론", engName: "Tilon", gender: "M", generation: 25, column: 55.0, parents: ["shimon"], spouses: [], desc: "시몬의 아들.", isMain: false },

  // 7. 이시 (Ishi)
  { id: "ishi_1chr4", name: "이시", engName: "Ishi", gender: "M", generation: 24, column: 58.0, parents: [], spouses: [], desc: "유다 자손. 대상 4:20.", isMain: false },
  { id: "zoheth_ishi", name: "소헷", engName: "Zoheth", gender: "M", generation: 25, column: 57.5, parents: ["ishi_1chr4"], spouses: [], desc: "이시의 아들.", isMain: false },
  { id: "benzoheth_ishi", name: "벤소헷", engName: "Ben-zoheth", gender: "M", generation: 25, column: 58.5, parents: ["ishi_1chr4"], spouses: [], desc: "이시의 아들.", isMain: false },

  // ==========================================
  // Levite Priests Independent Lineages (제사장 및 레위인 독립 족보)
  // ==========================================

  // 1. 24 제사장 반열 (24 Priest Divisions - 대상 24:7-18)
  { id: "jehoiarib_div", name: "여호야립", engName: "Jehoiarib", gender: "M", generation: 24, column: -25.0, parents: [], spouses: [], desc: "1반열 제사장. 대상 24:7.", isMain: false },
  { id: "jedaiah_div", name: "여다야", engName: "Jedaiah", gender: "M", generation: 25, column: -25.0, parents: ["jehoiarib_div"], spouses: [], desc: "2반열 제사장.", isMain: false },
  { id: "harim_div", name: "하림", engName: "Harim", gender: "M", generation: 26, column: -25.0, parents: ["jedaiah_div"], spouses: [], desc: "3반열 제사장.", isMain: false },
  { id: "seorim_div", name: "스오림", engName: "Seorim", gender: "M", generation: 27, column: -25.0, parents: ["harim_div"], spouses: [], desc: "4반열 제사장.", isMain: false },
  { id: "malchijah_div", name: "말기야", engName: "Malchijah", gender: "M", generation: 28, column: -25.0, parents: ["seorim_div"], spouses: [], desc: "5반열 제사장.", isMain: false },
  { id: "mijamin_div", name: "미야민", engName: "Mijamin", gender: "M", generation: 29, column: -25.0, parents: ["malchijah_div"], spouses: [], desc: "6반열 제사장.", isMain: false },
  { id: "hakkoz_div", name: "학고스", engName: "Hakkoz", gender: "M", generation: 30, column: -25.0, parents: ["mijamin_div"], spouses: [], desc: "7반열 제사장.", isMain: false },
  { id: "abijah_div", name: "아비야(반열)", engName: "Abijah", gender: "M", generation: 31, column: -25.0, parents: ["hakkoz_div"], spouses: [], desc: "8반열 제사장. 신약 사가랴의 반열.", isMain: false },
  { id: "jeshua_div", name: "예수아(반열)", engName: "Jeshua", gender: "M", generation: 32, column: -25.0, parents: ["abijah_div"], spouses: [], desc: "9반열 제사장.", isMain: false },
  { id: "shecaniah_div", name: "스가냐", engName: "Shecaniah", gender: "M", generation: 33, column: -25.0, parents: ["jeshua_div"], spouses: [], desc: "10반열 제사장.", isMain: false },
  { id: "eliashib_div", name: "엘리아십", engName: "Eliashib", gender: "M", generation: 34, column: -25.0, parents: ["shecaniah_div"], spouses: [], desc: "11반열 제사장.", isMain: false },
  { id: "jakim_div", name: "야킴", engName: "Jakim", gender: "M", generation: 35, column: -25.0, parents: ["eliashib_div"], spouses: [], desc: "12반열 제사장.", isMain: false },
  { id: "huppah_div", name: "훕바", engName: "Huppah", gender: "M", generation: 36, column: -25.0, parents: ["jakim_div"], spouses: [], desc: "13반열 제사장.", isMain: false },
  { id: "jeshebeab_div", name: "예세브압", engName: "Jeshebeab", gender: "M", generation: 37, column: -25.0, parents: ["huppah_div"], spouses: [], desc: "14반열 제사장.", isMain: false },
  { id: "bilgah_div", name: "빌가", engName: "Bilgah", gender: "M", generation: 38, column: -25.0, parents: ["jeshebeab_div"], spouses: [], desc: "15반열 제사장.", isMain: false },
  { id: "immer_div", name: "임멜", engName: "Immer", gender: "M", generation: 39, column: -25.0, parents: ["bilgah_div"], spouses: [], desc: "16반열 제사장.", isMain: false },
  { id: "hezir_div", name: "헤실", engName: "Hezir", gender: "M", generation: 40, column: -25.0, parents: ["immer_div"], spouses: [], desc: "17반열 제사장.", isMain: false },
  { id: "happizzez_div", name: "합비세스", engName: "Happizzez", gender: "M", generation: 41, column: -25.0, parents: ["hezir_div"], spouses: [], desc: "18반열 제사장.", isMain: false },
  { id: "pethahiah_div", name: "브다히야", engName: "Pethahiah", gender: "M", generation: 42, column: -25.0, parents: ["happizzez_div"], spouses: [], desc: "19반열 제사장.", isMain: false },
  { id: "jehezkel_div", name: "여헤스겔", engName: "Jehezkel", gender: "M", generation: 43, column: -25.0, parents: ["pethahiah_div"], spouses: [], desc: "20반열 제사장.", isMain: false },
  { id: "jachin_div", name: "야긴", engName: "Jachin", gender: "M", generation: 44, column: -25.0, parents: ["jehezkel_div"], spouses: [], desc: "21반열 제사장.", isMain: false },
  { id: "gamul_div", name: "가물", engName: "Gamul", gender: "M", generation: 45, column: -25.0, parents: ["jachin_div"], spouses: [], desc: "22반열 제사장.", isMain: false },
  { id: "delaiah_div", name: "들라야", engName: "Delaiah", gender: "M", generation: 46, column: -25.0, parents: ["gamul_div"], spouses: [], desc: "23반열 제사장.", isMain: false },
  { id: "maaziah_div", name: "마아시야", engName: "Maaziah", gender: "M", generation: 47, column: -25.0, parents: ["delaiah_div"], spouses: [], desc: "24반열 제사장.", isMain: false },

  // 아비야 반열의 사가랴와 세례 요한 (눅 1:5)
  { id: "zechariah_priest_div", name: "사가랴", engName: "Zechariah", gender: "M", generation: 48, column: -23.0, parents: ["abijah_div"], spouses: ["elizabeth_priest_div"], desc: "아비야 반열의 제사장. 세례 요한의 아버지.", isMain: false },
  { id: "elizabeth_priest_div", name: "엘리사벳", engName: "Elizabeth", gender: "F", generation: 48, column: -21.8, parents: [], spouses: ["zechariah_priest_div"], desc: "아론의 자손. 사가랴의 아내.", isMain: false },
  { id: "john_baptist", name: "세례 요한", engName: "John the Baptist", gender: "M", generation: 49, column: -23.0, parents: ["zechariah_priest_div", "elizabeth_priest_div"], spouses: [], desc: "사가랴와 엘리사벳의 아들. 주의 길을 예비한 자.", isMain: false },

  // 2. 아비나답 가계 (Abinadab Family - 삼상 7:1)
  { id: "abinadab_ark", name: "아비나답", engName: "Abinadab", gender: "M", generation: 24, column: -20.0, parents: [], spouses: [], desc: "기럇여아림 사람. 법궤를 보관함.", isMain: false },
  { id: "eleazar_abinadab", name: "엘리아살", engName: "Eleazar", gender: "M", generation: 25, column: -21.2, parents: ["abinadab_ark"], spouses: [], desc: "아비나답의 아들. 법궤를 지키도록 구별됨.", isMain: false },
  { id: "uzzah_abinadab", name: "웃사", engName: "Uzzah", gender: "M", generation: 25, column: -20.0, parents: ["abinadab_ark"], spouses: [], desc: "아비나답의 아들. 법궤를 만져서 사하심.", isMain: false },
  { id: "ahio_abinadab", name: "아효", engName: "Ahio", gender: "M", generation: 25, column: -18.8, parents: ["abinadab_ark"], spouses: [], desc: "아비나답의 아들.", isMain: false },

  // 3. 엘리 제사장 가계 (Eli Priest Family - 삼상 1:3)
  { id: "eli_priest", name: "엘리", engName: "Eli", gender: "M", generation: 24, column: -15.0, parents: [], spouses: [], desc: "실로의 제사장 겸 사사.", isMain: false },
  { id: "hophni_eli", name: "홉니", engName: "Hophni", gender: "M", generation: 25, column: -16.2, parents: ["eli_priest"], spouses: [], desc: "엘리의 아들. 악행을 저지름.", isMain: false },
  { id: "phinehas_eli", name: "비느하스(엘리아들)", engName: "Phinehas", gender: "M", generation: 25, column: -13.8, parents: ["eli_priest"], spouses: ["wife_phinehas_eli"], desc: "엘리의 아들. 전쟁에서 사망.", isMain: false },
  { id: "wife_phinehas_eli", name: "부인", engName: "Wife", gender: "F", generation: 25, column: -12.6, parents: [], spouses: ["phinehas_eli"], desc: "비느하스의 아내.", isMain: false },
  { id: "ichabod_phinehas", name: "이가봇", engName: "Ichabod", gender: "M", generation: 26, column: -15.0, parents: ["phinehas_eli", "wife_phinehas_eli"], spouses: [], desc: "비느하스의 아들. '영광이 떠났다'는 뜻.", isMain: false },
  { id: "ahitub_phinehas", name: "아히둡(비느하스아들)", engName: "Ahitub", gender: "M", generation: 26, column: -13.8, parents: ["phinehas_eli", "wife_phinehas_eli"], spouses: [], desc: "비느하스의 아들. 사독과 아히야의 아버지.", isMain: false },
  { id: "zadok_ahitub_eli", name: "사독", engName: "Zadok", gender: "M", generation: 27, column: -15.0, parents: ["ahitub_phinehas"], spouses: [], desc: "아히둡의 아들. 다윗 왕 때의 대제사장.", isMain: false },
  { id: "ahijah_ahitub_eli", name: "아히야", engName: "Ahijah", gender: "M", generation: 27, column: -13.8, parents: ["ahitub_phinehas"], spouses: [], desc: "아히둡의 아들. 아비아달의 아버지.", isMain: false },
  { id: "ahimaaz_zadok_eli", name: "아히마아스(사독아들)", engName: "Ahimaaz", gender: "M", generation: 28, column: -15.0, parents: ["zadok_ahitub_eli"], spouses: [], desc: "사독의 아들. 전령.", isMain: false },
  { id: "abiathar_ahijah_eli", name: "아비아달", engName: "Abiathar", gender: "M", generation: 28, column: -13.8, parents: ["ahijah_ahitub_eli"], spouses: [], desc: "아히야의 아들. 다윗을 도운 제사장.", isMain: false },
  { id: "jonathan_abiathar", name: "요나단(아비아달아들)", engName: "Jonathan", gender: "M", generation: 29, column: -13.8, parents: ["abiathar_ahijah_eli"], spouses: [], desc: "아비아달의 아들. 다윗의 아들 아도니야에게 급보를 전함.", isMain: false },

  // ==========================================
  // Horite Chiefs (호리 족속의 족장들 - 창 36:20-30)
  // ==========================================
  
  // 1. 로단 족장 가계 (Lotan)
  { id: "lotan_chief", name: "로단 족장", engName: "Lotan", gender: "M", generation: 21, column: 11.0, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "timna_lotan", name: "딤나", engName: "Timna", gender: "F", generation: 22, column: 10.2, parents: ["lotan_chief"], spouses: [], desc: "로단의 누이. 엘리바스의 첩.", isMain: false },
  { id: "hori_lotan", name: "호리", engName: "Hori", gender: "M", generation: 22, column: 11.0, parents: ["lotan_chief"], spouses: [], desc: "로단의 아들.", isMain: false },
  { id: "hemam_lotan", name: "헤맘", engName: "Hemam", gender: "M", generation: 22, column: 11.8, parents: ["lotan_chief"], spouses: [], desc: "로단의 아들.", isMain: false },

  // 2. 소발 족장 가계 (Shobal)
  { id: "shobal_chief", name: "소발 족장", engName: "Shobal", gender: "M", generation: 21, column: 13.5, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "alvan_shobal", name: "알완", engName: "Alvan", gender: "M", generation: 22, column: 12.5, parents: ["shobal_chief"], spouses: [], desc: "소발의 아들.", isMain: false },
  { id: "manahath_shobal", name: "마나핫", engName: "Manahath", gender: "M", generation: 22, column: 13.0, parents: ["shobal_chief"], spouses: [], desc: "소발의 아들.", isMain: false },
  { id: "ebal_shobal", name: "에발", engName: "Ebal", gender: "M", generation: 22, column: 13.5, parents: ["shobal_chief"], spouses: [], desc: "소발의 아들.", isMain: false },
  { id: "shepho_shobal", name: "스보", engName: "Shepho", gender: "M", generation: 22, column: 14.0, parents: ["shobal_chief"], spouses: [], desc: "소발의 아들.", isMain: false },
  { id: "onam_shobal", name: "오남", engName: "Onam", gender: "M", generation: 22, column: 14.5, parents: ["shobal_chief"], spouses: [], desc: "소발의 아들.", isMain: false },

  // 3. 시브온 족장 가계 (Zibeon)
  { id: "zibeon_chief", name: "시브온 족장", engName: "Zibeon", gender: "M", generation: 21, column: 16.0, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "aiah_zibeon", name: "아야", engName: "Aiah", gender: "M", generation: 22, column: 15.6, parents: ["zibeon_chief"], spouses: [], desc: "시브온의 아들.", isMain: false },
  { id: "anah_zibeon", name: "아니", engName: "Anah", gender: "M", generation: 22, column: 16.4, parents: ["zibeon_chief"], spouses: [], desc: "시브온의 아들. 광야에서 온천을 발견함.", isMain: false },

  // 4. 아나 족장 가계 (Anah)
  { id: "anah_chief", name: "아나 족장", engName: "Anah", gender: "M", generation: 21, column: 18.0, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "dishon_anah", name: "디손(아나아들)", engName: "Dishon", gender: "M", generation: 22, column: 17.6, parents: ["anah_chief"], spouses: [], desc: "아나의 아들.", isMain: false },
  { id: "oholibamah_anah", name: "오홀리바마(아나딸)", engName: "Oholibamah", gender: "F", generation: 22, column: 18.4, parents: ["anah_chief"], spouses: [], desc: "아나의 딸.", isMain: false },

  // 5. 디손 족장 가계 (Dishon)
  { id: "dishon_chief", name: "디손 족장", engName: "Dishon", gender: "M", generation: 21, column: 20.0, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "hemdan_dishon", name: "헴단", engName: "Hemdan", gender: "M", generation: 22, column: 19.2, parents: ["dishon_chief"], spouses: [], desc: "디손의 아들.", isMain: false },
  { id: "eshban_dishon", name: "에스반", engName: "Eshban", gender: "M", generation: 22, column: 19.8, parents: ["dishon_chief"], spouses: [], desc: "디손의 아들.", isMain: false },
  { id: "ithran_dishon", name: "이드란", engName: "Ithran", gender: "M", generation: 22, column: 20.4, parents: ["dishon_chief"], spouses: [], desc: "디손의 아들.", isMain: false },
  { id: "cheran_dishon", name: "그란", engName: "Cheran", gender: "M", generation: 22, column: 21.0, parents: ["dishon_chief"], spouses: [], desc: "디손의 아들.", isMain: false },

  // 6. 에셀 족장 가계 (Ezer)
  { id: "ezer_chief", name: "에셀 족장", engName: "Ezer", gender: "M", generation: 21, column: 22.5, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "bilhan_ezer", name: "발한", engName: "Bilhan", gender: "M", generation: 22, column: 22.0, parents: ["ezer_chief"], spouses: [], desc: "에셀의 아들.", isMain: false },
  { id: "zaavan_ezer", name: "사아완", engName: "Zaavan", gender: "M", generation: 22, column: 22.5, parents: ["ezer_chief"], spouses: [], desc: "에셀의 아들.", isMain: false },
  { id: "akan_ezer", name: "아간(에셀아들)", engName: "Akan", gender: "M", generation: 22, column: 23.0, parents: ["ezer_chief"], spouses: [], desc: "에셀의 아들.", isMain: false },

  // 7. 디산 족장 가계 (Dishan)
  { id: "dishan_chief", name: "디산 족장", engName: "Dishan", gender: "M", generation: 21, column: 24.2, parents: [], spouses: [], desc: "호리 족장. 세일의 아들. 창 36:20.", isMain: false },
  { id: "uz_dishan", name: "우스(디산아들)", engName: "Uz", gender: "M", generation: 22, column: 23.8, parents: ["dishan_chief"], spouses: [], desc: "디산의 아들.", isMain: false },
  { id: "aran_dishan", name: "아란", engName: "Aran", gender: "M", generation: 22, column: 24.6, parents: ["dishan_chief"], spouses: [], desc: "디산의 아들.", isMain: false },

  // ==========================================
  // Reuben & Simeon Lineages (르우벤 및 시므온 독립 족보)
  // ==========================================

  // 1. 르우벤 지파 (Reubenites - 대상 5:4-6)
  { id: "joel_reuben", name: "요엘", engName: "Joel", gender: "M", generation: 24, column: -43.0, parents: [], spouses: [], desc: "르우벤 자손. 대상 5:4.", isMain: false },
  { id: "shemaiah_joel", name: "스마야(요엘아들)", engName: "Shemaiah", gender: "M", generation: 25, column: -43.0, parents: ["joel_reuben"], spouses: [], desc: "요엘의 아들.", isMain: false },
  { id: "gog_shemaiah", name: "곡", engName: "Gog", gender: "M", generation: 26, column: -43.0, parents: ["shemaiah_joel"], spouses: [], desc: "스마야의 아들.", isMain: false },
  { id: "shimei_gog", name: "시므이(곡아들)", engName: "Shimei", gender: "M", generation: 27, column: -43.0, parents: ["gog_shemaiah"], spouses: [], desc: "곡의 아들.", isMain: false },
  { id: "micah_shimei", name: "미가(시므이아들)", engName: "Micah", gender: "M", generation: 28, column: -43.0, parents: ["shimei_gog"], spouses: [], desc: "시므이의 아들.", isMain: false },
  { id: "reaiah_micah", name: "르아야(미가아들)", engName: "Reaiah", gender: "M", generation: 29, column: -43.0, parents: ["micah_shimei"], spouses: [], desc: "미가의 아들.", isMain: false },
  { id: "baal_reaiah", name: "바알", engName: "Baal", gender: "M", generation: 30, column: -43.0, parents: ["reaiah_micah"], spouses: [], desc: "르아야의 아들.", isMain: false },
  { id: "beerah_baal", name: "브에라", engName: "Beerah", gender: "M", generation: 31, column: -43.0, parents: ["baal_reaiah"], spouses: [], desc: "바알의 아들. 앗수르 왕 디글랏빌레셀에게 사로잡힘.", isMain: false },

  // 2. 시므온 지파 지도자들 (Simeonite Leaders - 대상 4:34-38)
  { id: "meshobab_simeon", name: "메소밥", engName: "Meshobab", gender: "M", generation: 24, column: -38.0, parents: [], spouses: [], desc: "시므온 지파 지도자. 대상 4:34.", isMain: false },
  { id: "jamlech_meshobab", name: "야몰렉", engName: "Jamlech", gender: "M", generation: 25, column: -38.0, parents: ["meshobab_simeon"], spouses: [], desc: "시므온 지파 지도자.", isMain: false },
  { id: "amashiah_jamlech", name: "아마시야(시므온)", engName: "Joshah's Father", gender: "M", generation: 26, column: -38.0, parents: ["jamlech_meshobab"], spouses: [], desc: "요사의 아버지.", isMain: false },
  { id: "joshah_amashiah", name: "요사", engName: "Joshah", gender: "M", generation: 27, column: -38.0, parents: ["amashiah_jamlech"], spouses: [], desc: "아마시야의 아들.", isMain: false },
  { id: "joel_joshah", name: "요엘(요사아들)", engName: "Joel", gender: "M", generation: 28, column: -38.0, parents: ["joshah_amashiah"], spouses: [], desc: "요사의 아들.", isMain: false },
  { id: "asiel_joel", name: "아시엘", engName: "Asiel", gender: "M", generation: 29, column: -38.0, parents: ["joel_joshah"], spouses: [], desc: "요엘의 아들.", isMain: false },
  { id: "seraiah_asiel", name: "스라야(아시엘아들)", engName: "Seraiah", gender: "M", generation: 30, column: -38.0, parents: ["asiel_joel"], spouses: [], desc: "아시엘의 아들. 요시비야의 아버지.", isMain: false },
  { id: "joshibiah_seraiah", name: "요시비야", engName: "Joshibiah", gender: "M", generation: 31, column: -38.0, parents: ["seraiah_asiel"], spouses: [], desc: "스라야의 아들. 예후의 아버지.", isMain: false },
  { id: "jehu_joshibiah", name: "예후(시므온)", engName: "Jehu", gender: "M", generation: 32, column: -38.0, parents: ["joshibiah_seraiah"], spouses: [], desc: "요시비야의 아들. 시므온 지파 지도자.", isMain: false },
  { id: "elioenai_jehu", name: "엘료에내", engName: "Elioenai", gender: "M", generation: 33, column: -38.0, parents: ["jehu_joshibiah"], spouses: [], desc: "예후의 아들.", isMain: false },
  { id: "jaakobah_elioenai", name: "야아고바", engName: "Jaakobah", gender: "M", generation: 34, column: -38.0, parents: ["elioenai_jehu"], spouses: [], desc: "엘료에내의 아들.", isMain: false },
  { id: "jeshohaiah_jaakobah", name: "여소하야", engName: "Jeshohaiah", gender: "M", generation: 35, column: -38.0, parents: ["jaakobah_elioenai"], spouses: [], desc: "야아고바의 아들.", isMain: false },
  { id: "asaiah_jeshohaiah", name: "아사야(시므온)", engName: "Asaiah", gender: "M", generation: 36, column: -38.0, parents: ["jeshohaiah_jaakobah"], spouses: [], desc: "여소하야의 아들.", isMain: false },
  { id: "adiel_asaiah", name: "아디엘", engName: "Adiel", gender: "M", generation: 37, column: -38.0, parents: ["asaiah_jeshohaiah"], spouses: [], desc: "아사야의 아들. 여시미엘의 아버지.", isMain: false },
  { id: "jesimiel_adiel", name: "여시미엘", engName: "Jesimiel", gender: "M", generation: 38, column: -38.0, parents: ["adiel_asaiah"], spouses: [], desc: "아디엘의 아들.", isMain: false },
  { id: "benaiah_jesimiel", name: "브나야(시므온)", engName: "Benaiah", gender: "M", generation: 39, column: -38.0, parents: ["jesimiel_adiel"], spouses: [], desc: "여시미엘의 아들. 스마야의 아버지.", isMain: false },
  { id: "shemaiah_benaiah", name: "스마야(브나야아들)", engName: "Shemaiah", gender: "M", generation: 40, column: -38.0, parents: ["benaiah_jesimiel"], spouses: [], desc: "브나야의 아들.", isMain: false },
  { id: "shimri_shemaiah", name: "시므리", engName: "Shimri", gender: "M", generation: 41, column: -38.0, parents: ["shemaiah_benaiah"], spouses: [], desc: "스마야의 아들. 여다야의 아버지.", isMain: false },
  { id: "jedaiah_shimri", name: "여다야(시므리아들)", engName: "Jedaiah", gender: "M", generation: 42, column: -38.0, parents: ["shimri_shemaiah"], spouses: [], desc: "시므리의 아들.", isMain: false },
  { id: "allon_jedaiah", name: "알론", engName: "Allon", gender: "M", generation: 43, column: -38.0, parents: ["jedaiah_shimri"], spouses: [], desc: "여다야의 아들.", isMain: false },
  { id: "shiphi_allon", name: "시비", engName: "Shiphi", gender: "M", generation: 44, column: -38.0, parents: ["allon_jedaiah"], spouses: [], desc: "알론의 아들. 시사의 아버지.", isMain: false },
  { id: "ziza_shiphi", name: "시사", engName: "Ziza", gender: "M", generation: 45, column: -38.0, parents: ["shiphi_allon"], spouses: [], desc: "시비의 아들. 시므온 지파 지도자.", isMain: false },
];
