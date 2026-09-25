# -*- coding: utf-8 -*-
"""
Generate a beautiful, geographically accurate Korean Biblical Atlas SVG Map
Dimensions: 1200 x 800 (Clean, well-proportioned, authentic biblical atlas)
"""

svg_content = '''<svg id="canvas-bible-map-svg" viewBox="0 0 1200 800" width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Parchment & Relief Gradients -->
    <linearGradient id="parchment-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbf7ee"/>
      <stop offset="50%" stop-color="#f4ecdc"/>
      <stop offset="100%" stop-color="#e9dcbf"/>
    </linearGradient>

    <linearGradient id="sea-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4e6f1" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#b9d7ea" stop-opacity="0.95"/>
    </linearGradient>

    <linearGradient id="lake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#aed6f1"/>
      <stop offset="100%" stop-color="#85c1e9"/>
    </linearGradient>

    <filter id="soft-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#1e293b" flood-opacity="0.25"/>
    </filter>

    <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <style>
    .map-frame { fill: url(#parchment-bg); stroke: #8c6d46; stroke-width: 4; rx: 14; filter: url(#soft-shadow); }
    .map-border { fill: none; stroke: #bfa583; stroke-width: 1.5; stroke-dasharray: 6 4; rx: 10; }
    
    .sea-body { fill: url(#sea-gradient); stroke: #7fb3d5; stroke-width: 1.8; }
    .water-body { fill: url(#lake-gradient); stroke: #5dade2; stroke-width: 1.5; }
    .river-line { fill: none; stroke: #5dade2; stroke-linecap: round; stroke-linejoin: round; }
    
    .terrain-hill { fill: none; stroke: #c8ad8d; stroke-width: 1.2; opacity: 0.6; }
    .ancient-road { fill: none; stroke: #d97706; stroke-width: 1.6; stroke-dasharray: 5 4; opacity: 0.75; }
    
    /* Typography */
    .title-map { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-size: 16px; font-weight: 800; fill: #78350f; letter-spacing: 2px; }
    .sea-label { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-size: 15px; font-weight: 700; fill: #2874a6; letter-spacing: 4px; }
    .region-label { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-size: 13px; font-weight: 800; fill: #92400e; letter-spacing: 3px; opacity: 0.7; }
    .mountain-label { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-size: 11px; font-weight: 600; fill: #78350f; }
    
    .city-group { cursor: default; }
    .city-pin { fill: #b91c1c; stroke: #ffffff; stroke-width: 1.5; }
    .city-name { font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-size: 12px; font-weight: 700; fill: #1e293b; }
    .city-name-eng { font-size: 9.5px; font-weight: 500; fill: #64748b; }
    .city-name-major { font-size: 13px; font-weight: 800; fill: #991b1b; }
  </style>

  <!-- Frame & Margins -->
  <rect x="10" y="10" width="1180" height="780" class="map-frame" />
  <rect x="20" y="20" width="1160" height="760" class="map-border" />

  <!-- Header Badge -->
  <g transform="translate(40, 42)">
    <rect x="0" y="0" width="200" height="32" rx="6" fill="#78350f" fill-opacity="0.08" stroke="#78350f" stroke-opacity="0.2"/>
    <text x="100" y="21" text-anchor="middle" class="title-map">성경 지리 실측 지도</text>
  </g>

  <!-- ==================== SEAS & WATERWAYS ==================== -->
  
  <!-- Mediterranean Sea (지중해 / 대서해) -->
  <path class="sea-body" d="
    M 20,20 
    L 380,20 
    Q 360,120 340,240 
    Q 325,360 310,480 
    Q 285,580 230,640 
    Q 160,680 80,720 
    L 20,740 
    Z" />
  <text x="170" y="320" class="sea-label" text-anchor="middle">지 중 해 (대 해)</text>
  <text x="170" y="340" style="font-size: 10px; fill: #5499c7; text-anchor: middle;">Mediterranean Sea</text>

  <!-- Red Sea - Gulf of Suez (홍해 수에즈만) -->
  <path class="sea-body" d="
    M 60,760 
    Q 100,740 140,780 
    L 20,780 
    Z" />

  <!-- Red Sea - Gulf of Aqaba (홍해 아카바만) -->
  <path class="sea-body" d="
    M 420,780 
    Q 410,720 395,680 
    L 435,680 
    Q 450,730 460,780 
    Z" />
  <text x="430" y="740" style="font-size: 9.5px; font-weight:700; fill: #2874a6;" text-anchor="middle">홍해 (아카바만)</text>

  <!-- Persian Gulf (페르시아 만 - 우측 하단) -->
  <path class="sea-body" d="
    M 1050,700 
    Q 1120,680 1180,710 
    L 1180,780 
    L 1000,780 
    Z" />
  <text x="1100" y="750" class="sea-label" style="font-size: 12px;" text-anchor="middle">페르시아만</text>

  <!-- ==================== RIVERS & LAKES (CANAAN & FERTILE CRESCENT) ==================== -->
  
  <!-- Sea of Galilee (갈릴리 호수) -->
  <!-- Center approx (520, 240) -->
  <path class="water-body" d="
    M 515,220 
    C 530,220 535,235 530,255 
    C 525,270 510,275 505,260 
    C 500,245 505,220 515,220 
    Z" />
  <text x="548" y="245" style="font-size: 11px; font-weight: 800; fill: #1f618d;">갈릴리 바다</text>

  <!-- Dead Sea (사해 / 염해) -->
  <!-- Center approx (505, 470) -->
  <path class="water-body" d="
    M 502,400 
    C 515,400 520,430 518,480 
    C 516,520 512,550 498,550 
    C 490,550 488,520 492,470 
    C 495,430 492,400 502,400 
    Z" />
  <text x="532" y="475" style="font-size: 11.5px; font-weight: 800; fill: #1f618d;">사 해 (염해)</text>

  <!-- Jordan River (요단강) connecting Galilee to Dead Sea -->
  <path class="river-line" stroke-width="2.5" d="
    M 518,270 
    Q 510,310 516,340 
    Q 508,370 504,400" />
  <text x="488" y="340" style="font-size: 10px; font-weight:700; fill: #2980b9;" text-anchor="end">요단강</text>

  <!-- Upper Jordan & Lake Huleh -->
  <path class="river-line" stroke-width="1.8" d="
    M 522,170 
    Q 525,195 516,220" />

  <!-- Jabbok River (얍복강) -->
  <path class="river-line" stroke-width="1.5" d="
    M 512,345 
    Q 560,335 620,350" />
  <text x="575" y="338" style="font-size: 9px; font-weight:600; fill: #2980b9;">얍복강</text>

  <!-- Arnon River (아르논강) -->
  <path class="river-line" stroke-width="1.5" d="
    M 514,485 
    Q 560,490 610,480" />
  <text x="565" y="482" style="font-size: 9px; font-weight:600; fill: #2980b9;">아르논강</text>

  <!-- Kishon River (기손강) -->
  <path class="river-line" stroke-width="1.4" d="
    M 342,240 
    Q 420,250 470,270" />

  <!-- Nile River Delta (나일강 델타 / 애굽) -->
  <g stroke="#5dade2" stroke-width="1.8" fill="none">
    <path d="M 60,780 Q 75,700 90,660" />
    <path d="M 90,660 Q 60,630 40,620" />
    <path d="M 90,660 Q 95,620 105,610" />
    <path d="M 90,660 Q 130,630 150,625" />
  </g>
  <text x="90" y="695" style="font-size: 11px; font-weight:700; fill: #1f618d;" text-anchor="middle">나일강 (애굽)</text>

  <!-- Euphrates River (유브라데강) -->
  <path class="river-line" stroke-width="2.5" d="
    M 680,40 
    Q 760,110 820,220 
    Q 900,380 980,540 
    Q 1030,640 1080,720" />
  <text x="880" y="320" style="font-size: 11.5px; font-weight:800; fill: #2471a3; transform: rotate(38 880 320);" text-anchor="middle">유브라데 강 (Euphrates)</text>

  <!-- Tigris River (티그리스강 / 힛데겔) -->
  <path class="river-line" stroke-width="2.2" d="
    M 880,30 
    Q 950,120 1010,240 
    Q 1080,420 1120,580 
    Q 1135,660 1140,710" />
  <text x="1040" y="270" style="font-size: 11px; font-weight:800; fill: #2471a3; transform: rotate(45 1040 270);" text-anchor="middle">티그리스 강 (Tigris / 힛데겔)</text>

  <!-- ==================== REGIONAL REALMS (REGIONS) ==================== -->
  
  <text x="440" y="380" class="region-label" text-anchor="middle">가 나 안 (CANAAN)</text>
  <text x="430" y="490" class="region-label" style="fill: #78350f;" text-anchor="middle">유 다 (JUDAH)</text>
  <text x="450" y="310" class="region-label" style="fill: #78350f;" text-anchor="middle">사마리아 (SAMARIA)</text>
  <text x="470" y="200" class="region-label" style="fill: #78350f;" text-anchor="middle">갈릴리 (GALILEE)</text>
  
  <text x="610" y="320" class="region-label" text-anchor="middle">길 르 앗 (GILEAD)</text>
  <text x="630" y="390" class="region-label" text-anchor="middle">암 몬 (AMMON)</text>
  <text x="600" y="520" class="region-label" text-anchor="middle">모 압 (MOAB)</text>
  <text x="540" y="630" class="region-label" text-anchor="middle">에 돔 (EDOM)</text>

  <text x="580" y="120" class="region-label" text-anchor="middle">아 람 (수리아 / SYRIA)</text>
  <text x="760" y="160" class="region-label" text-anchor="middle">메소포타미아 (MESOPOTAMIA)</text>
  <text x="740" y="80" class="region-label" style="font-size: 11px;" text-anchor="middle">밧단아람 (Paddan-Aram)</text>
  <text x="1020" y="520" class="region-label" text-anchor="middle">바벨론 / 갈대아 (BABYLONIA)</text>

  <text x="260" y="700" class="region-label" text-anchor="middle">시 내 반 도 (SINAI)</text>
  <text x="150" y="600" class="region-label" text-anchor="middle">고 센 땅 (GOSHEN)</text>

  <!-- ==================== BIBLICAL MOUNTAINS ==================== -->
  
  <!-- Mt. Hermon (헐몬산) -->
  <g transform="translate(560, 150)">
    <polygon points="0,-8 7,5 -7,5" fill="#a8896c" stroke="#5c442e" stroke-width="1"/>
    <text x="12" y="3" class="mountain-label">헐몬산 (2,814m)</text>
  </g>

  <!-- Mt. Carmel (갈멜산) -->
  <g transform="translate(355, 235)">
    <polygon points="0,-7 6,4 -6,4" fill="#a8896c" stroke="#5c442e" stroke-width="1"/>
    <text x="-8" y="1" class="mountain-label" text-anchor="end">갈멜산</text>
  </g>

  <!-- Mt. Nebo (느보산) -->
  <g transform="translate(540, 425)">
    <polygon points="0,-7 6,4 -6,4" fill="#a8896c" stroke="#5c442e" stroke-width="1"/>
    <text x="10" y="2" class="mountain-label">느보산 (비스가)</text>
  </g>

  <!-- Mt. Sinai (시내산 / 호렙산) -->
  <g transform="translate(310, 750)">
    <polygon points="0,-8 7,5 -7,5" fill="#b45309" stroke="#78350f" stroke-width="1"/>
    <text x="0" y="18" class="mountain-label" text-anchor="middle">시내산 (호렙산)</text>
  </g>

  <!-- Mt. Ararat (아라랏산) -->
  <g transform="translate(860, 50)">
    <polygon points="0,-9 8,6 -8,6" fill="#a8896c" stroke="#5c442e" stroke-width="1"/>
    <text x="12" y="3" class="mountain-label">아라랏산 (방주 도착지)</text>
  </g>

  <!-- ==================== BIBLICAL PLACES & CITIES (WITH EXACT COORDINATES) ==================== -->

  <!-- 1. Jerusalem (예루살렘) - Center Core (465, 430) -->
  <g class="city-group" id="map-node-jerusalem">
    <circle cx="465" cy="430" r="5" class="city-pin" style="fill: #dc2626; stroke-width: 2; r: 5.5;"/>
    <text x="455" y="425" class="city-name city-name-major" text-anchor="end">예루살렘</text>
    <text x="455" y="437" class="city-name-eng" text-anchor="end">Jerusalem</text>
  </g>

  <!-- 2. Bethlehem (베들레헴) - (463, 452) -->
  <g class="city-group" id="map-node-bethlehem">
    <circle cx="463" cy="452" r="4" class="city-pin" style="fill: #ea580c;"/>
    <text x="453" y="452" class="city-name" text-anchor="end">베들레헴</text>
    <text x="453" y="462" class="city-name-eng" text-anchor="end">Bethlehem</text>
  </g>

  <!-- 3. Hebron (헤브론) - (450, 490) -->
  <g class="city-group" id="map-node-hebron">
    <circle cx="450" cy="490" r="4.2" class="city-pin"/>
    <text x="440" y="488" class="city-name" text-anchor="end">헤브론 (기럇아르바)</text>
    <text x="440" y="499" class="city-name-eng" text-anchor="end">Hebron (막벨라 굴)</text>
  </g>

  <!-- 4. Bethel (벧엘) - (468, 395) -->
  <g class="city-group" id="map-node-bethel">
    <circle cx="468" cy="395" r="3.8" class="city-pin"/>
    <text x="458" y="395" class="city-name" text-anchor="end">벧엘 (루스)</text>
    <text x="458" y="405" class="city-name-eng" text-anchor="end">Bethel</text>
  </g>

  <!-- 5. Shechem (세겜) - (472, 340) -->
  <g class="city-group" id="map-node-shechem">
    <circle cx="472" cy="340" r="4" class="city-pin"/>
    <text x="462" y="337" class="city-name" text-anchor="end">세겜 (에발/그리심산)</text>
    <text x="462" y="347" class="city-name-eng" text-anchor="end">Shechem</text>
  </g>

  <!-- 6. Jericho (여리고) - (490, 420) -->
  <g class="city-group" id="map-node-jericho">
    <circle cx="490" cy="420" r="3.8" class="city-pin"/>
    <text x="498" y="418" class="city-name">여리고</text>
    <text x="498" y="428" class="city-name-eng">Jericho</text>
  </g>

  <!-- 7. Shiloh (실로) - (475, 370) -->
  <g class="city-group" id="map-node-shiloh">
    <circle cx="475" cy="370" r="3.5" class="city-pin"/>
    <text x="483" y="369" class="city-name">실로 (회막)</text>
  </g>

  <!-- 8. Nazareth (나사렛) - (475, 245) -->
  <g class="city-group" id="map-node-nazareth">
    <circle cx="475" cy="245" r="4" class="city-pin"/>
    <text x="465" y="243" class="city-name" text-anchor="end">나사렛</text>
    <text x="465" y="253" class="city-name-eng" text-anchor="end">Nazareth</text>
  </g>

  <!-- 9. Capernaum (가버나움) - (522, 225) -->
  <g class="city-group" id="map-node-capernaum">
    <circle cx="522" cy="225" r="3.8" class="city-pin"/>
    <text x="530" y="222" class="city-name">가버나움</text>
  </g>

  <!-- 10. Dan (단) - (530, 160) -->
  <g class="city-group" id="map-node-dan">
    <circle cx="530" cy="160" r="3.8" class="city-pin"/>
    <text x="520" y="158" class="city-name" text-anchor="end">단 (라이스)</text>
  </g>

  <!-- 11. Beersheba (브엘세바) - (405, 545) -->
  <g class="city-group" id="map-node-beersheba">
    <circle cx="405" cy="545" r="4" class="city-pin"/>
    <text x="395" y="542" class="city-name" text-anchor="end">브엘세바</text>
    <text x="395" y="553" class="city-name-eng" text-anchor="end">Beersheba (단에서 브엘세바까지)</text>
  </g>

  <!-- 12. Joppa (욥바) - (335, 400) -->
  <g class="city-group" id="map-node-joppa">
    <circle cx="335" cy="400" r="3.8" class="city-pin"/>
    <text x="325" y="398" class="city-name" text-anchor="end">욥바 (항구)</text>
  </g>

  <!-- 13. Gaza (가사 / 블레셋) - (300, 520) -->
  <g class="city-group" id="map-node-gaza">
    <circle cx="300" cy="520" r="3.8" class="city-pin"/>
    <text x="290" y="518" class="city-name" text-anchor="end">가사 (블레셋)</text>
  </g>

  <!-- 14. Damascus (다메섹) - (620, 150) -->
  <g class="city-group" id="map-node-damascus">
    <circle cx="620" cy="150" r="4.5" class="city-pin"/>
    <text x="630" y="148" class="city-name city-name-major">다메섹 (다마스쿠스)</text>
    <text x="630" y="159" class="city-name-eng">Damascus</text>
  </g>

  <!-- 15. Haran (하란) - (740, 95) -->
  <g class="city-group" id="map-node-haran">
    <circle cx="740" cy="95" r="5" class="city-pin" style="fill: #d97706;"/>
    <text x="750" y="93" class="city-name city-name-major">하란 (아브라함 여정)</text>
    <text x="750" y="104" class="city-name-eng">Haran</text>
  </g>

  <!-- 16. Ur (갈대아 우르) - (1060, 680) -->
  <g class="city-group" id="map-node-ur">
    <circle cx="1060" cy="680" r="5" class="city-pin" style="fill: #d97706;"/>
    <text x="1050" y="675" class="city-name city-name-major" text-anchor="end">갈대아 우르 (아브라함 고향)</text>
    <text x="1050" y="687" class="city-name-eng" text-anchor="end">Ur of the Chaldees</text>
  </g>

  <!-- 17. Babylon (바벨론 / 시날 평지) - (980, 510) -->
  <g class="city-group" id="map-node-babylon">
    <circle cx="980" cy="510" r="5" class="city-pin"/>
    <text x="970" y="505" class="city-name city-name-major" text-anchor="end">바벨론 (시날 평지/바벨탑)</text>
    <text x="970" y="517" class="city-name-eng" text-anchor="end">Babylon</text>
  </g>

  <!-- 18. Nineveh (니느웨 / 앗수르) - (940, 180) -->
  <g class="city-group" id="map-node-nineveh">
    <circle cx="940" cy="180" r="4.5" class="city-pin"/>
    <text x="950" y="178" class="city-name city-name-major">니느웨 (앗수르 수도)</text>
    <text x="950" y="189" class="city-name-eng">Nineveh (요나 선지자)</text>
  </g>

  <!-- 19. Eden (에덴 동산 상징 위치) - (1020, 610) -->
  <g class="city-group" id="map-node-eden">
    <circle cx="1020" cy="610" r="5.5" class="city-pin" style="fill: #16a34a;"/>
    <text x="1010" y="605" class="city-name city-name-major" text-anchor="end" style="fill: #15803d;">에덴 동산 (네 근원 강)</text>
    <text x="1010" y="617" class="city-name-eng" text-anchor="end">Garden of Eden</text>
  </g>

  <!-- 20. Goshen & Rameses (고센 / 라암셋) - (130, 615) -->
  <g class="city-group" id="map-node-rameses">
    <circle cx="130" cy="615" r="4" class="city-pin"/>
    <text x="140" y="612" class="city-name">라암셋 (고센)</text>
    <text x="140" y="623" class="city-name-eng">Rameses (출애굽 출발지)</text>
  </g>

  <!-- Active Pin Beacon Template (Positioned dynamically in JS) -->
  <g id="active-map-pin-beacon" style="display: none;">
    <circle cx="0" cy="0" r="24" fill="rgba(234, 88, 12, 0.35)" stroke="#ea580c" stroke-width="2">
      <animate attributeName="r" values="8;32;8" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="0" cy="0" r="7" fill="#ea580c" stroke="#ffffff" stroke-width="2.5" filter="url(#pin-glow)"/>
    <circle cx="0" cy="0" r="2.5" fill="#ffffff"/>
  </g>

</svg>
'''

with open('bible_map_background.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Generated bible_map_background.svg successfully!")
