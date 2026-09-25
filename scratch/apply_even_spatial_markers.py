import re

with open('bible_map_viewer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace updateMarkers and showDetail
new_marker_logic = """    // 5. 고르게 분포되는 동적 마커 렌더링 시스템 (화면 크기 반응형 & 픽셀 기반 겹침 방지)
    const markersLayer = L.layerGroup().addTo(map);
    let selectedHighlightMarker = null;
    let currentSelectedPlace = null;

    function updateMarkers() {
      markersLayer.clearLayers();
      if (!map) return;

      const size = map.getSize();
      const width = size.x || window.innerWidth;
      const height = size.y || window.innerHeight;
      const isMobile = width <= 768;

      // 화면 면적 및 기기에 따른 최적 마커 수 계산 (모바일 10개 전후, 대화면 30~40개)
      const area = width * height;
      const targetCount = isMobile 
        ? Math.max(8, Math.min(14, Math.round(area / 28000))) 
        : Math.max(20, Math.min(42, Math.round(area / 22000)));

      // 최소 픽셀 간격 설정 (가로 라벨 길이 고려하여 가로 60px, 세로 38px, 반경 50px)
      const minSpacingX = isMobile ? 65 : 55;
      const minSpacingY = isMobile ? 42 : 36;
      const minRadius = isMobile ? 52 : 44;

      const placedList = [];
      const placedScreenPts = [];

      // 1. 현재 선택된 중심 지명이 있다면 1순위로 확정 배치
      if (currentSelectedPlace && typeof currentSelectedPlace.lat === 'number' && typeof currentSelectedPlace.lng === 'number') {
        const pt = map.latLngToContainerPoint([currentSelectedPlace.lat, currentSelectedPlace.lng]);
        placedList.push(currentSelectedPlace);
        placedScreenPts.push({ x: pt.x, y: pt.y });
      }

      // 2. 현재 지도 뷰포트 내(혹은 인근) 후보 지명 수집 및 점수화
      const bounds = map.getBounds().pad(0.05); // 약간의 패딩 포함
      const center = currentSelectedPlace 
        ? L.latLng(currentSelectedPlace.lat, currentSelectedPlace.lng) 
        : map.getCenter();

      const candidates = placesData.filter(p => {
        if (currentSelectedPlace && p.id === currentSelectedPlace.id) return false;
        return bounds.contains([p.lat, p.lng]);
      });

      // 후보 지명 점수 매기기 (중요 거점 가중치 + 등장 빈도 + 중심 지점과의 적정 분산도)
      candidates.forEach(p => {
        const distToCenter = center.distanceTo(L.latLng(p.lat, p.lng)); // 미터 단위 거리
        const distKm = distToCenter / 1000;
        
        let score = (p.isMajor ? 120 : 0) + Math.min(60, (p.count || 1) * 3);
        // 중심 근처와 외곽이 고르게 나오도록 거리 패널티 완화
        score -= Math.log10(distKm + 1) * 15;
        p._renderScore = score;
      });

      // 점수순 정렬
      candidates.sort((a, b) => b._renderScore - a._renderScore);

      // 3. 픽셀 충돌 검사(Spatial Collision Check)로 화면 전체에 고르게 분산 배치
      for (const p of candidates) {
        if (placedList.length >= targetCount) break;

        const pt = map.latLngToContainerPoint([p.lat, p.lng]);

        // 화면 밖 여백(마진 20px) 벗어나면 제외
        if (pt.x < 20 || pt.x > width - 20 || pt.y < 20 || pt.y > height - 20) {
          continue;
        }

        // 이미 배치된 마커들과의 픽셀 간격 검사 (타원/박스 충돌 모델)
        let isOverlapping = false;
        for (const placedPt of placedScreenPts) {
          const dx = Math.abs(pt.x - placedPt.x);
          const dy = Math.abs(pt.y - placedPt.y);
          const dist = Math.hypot(dx, dy);

          if (dist < minRadius || (dx < minSpacingX && dy < minSpacingY)) {
            isOverlapping = true;
            break;
          }
        }

        if (!isOverlapping) {
          placedList.push(p);
          placedScreenPts.push({ x: pt.x, y: pt.y });
        }
      }

      // 4. 선별된 지명들을 지도에 렌더링
      placedList.forEach(p => {
        const isSelected = currentSelectedPlace && (currentSelectedPlace.id === p.id || currentSelectedPlace.name === p.name);
        const cfg = typeConfigs[p.type || 'city'] || typeConfigs.city;

        const iconHtml = `<div class="custom-pin ${cfg.pinClass} ${isSelected ? 'selected-pin' : ''}">${cfg.icon}</div>`;
        const icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: isSelected ? [32, 32] : [26, 26],
          iconAnchor: isSelected ? [16, 16] : [13, 13]
        });

        const marker = L.marker([p.lat, p.lng], {
          icon: icon,
          zIndexOffset: isSelected ? 3000 : (p.isMajor ? 500 : 100)
        });

        marker.bindTooltip(p.name, {
          permanent: true,
          direction: 'bottom',
          offset: [0, isSelected ? 16 : 13],
          className: isSelected ? 'marker-label selected-label' : 'marker-label'
        });

        marker.on('click', (e) => {
          if (e && e.originalEvent) e.originalEvent.stopPropagation();
          showDetail(p);
        });

        markersLayer.addLayer(marker);
      });
    }

    map.on('moveend zoomend resize', updateMarkers);
    window.addEventListener('resize', () => {
      if (map) {
        map.invalidateSize();
        updateMarkers();
      }
    });

    // 6. 지명 상세 정보 카드 표시
    window.showDetail = function(p) {
      currentSelectedPlace = p;
      const cfg = typeConfigs[p.type || 'city'] || typeConfigs.city;

      document.getElementById('detailIcon').innerText = cfg.icon;
      document.getElementById('detailName').innerText = p.name;
      document.getElementById('detailBadge').innerText = cfg.nameKo;
      document.getElementById('detailBadge').style.background = cfg.color + '1a';
      document.getElementById('detailBadge').style.color = cfg.color;
      document.getElementById('detailCoords').innerText = `${p.lat.toFixed(2)}°, ${p.lng.toFixed(2)}°`;

      const descBox = document.getElementById('detailDesc');
      descBox.innerText = p.desc || '성경 속 역사적 지명입니다.';

      const card = document.getElementById('detailCard');
      card.style.display = 'flex';

      // 펄스 하이라이트 마커
      if (selectedHighlightMarker) {
        map.removeLayer(selectedHighlightMarker);
      }
      const pulseHtml = '<div class="pulse-ring"></div>';
      const pulseIcon = L.divIcon({ className: '', html: pulseHtml, iconSize: [44, 44], iconAnchor: [14, 14] });
      selectedHighlightMarker = L.marker([p.lat, p.lng], { icon: pulseIcon, interactive: false, zIndexOffset: 2000 }).addTo(map);

      // 지정된 지명을 중심으로 화면 전체에 펼쳐지도록 부드럽게 이동
      const targetZoom = window.innerWidth <= 768 ? 9 : 10;
      map.flyTo([p.lat, p.lng], targetZoom, { duration: 0.5 });
      
      setTimeout(() => {
        updateMarkers();
      }, 550);

      // 부모 창(족보앱)에 지명 선택 이벤트 통지
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          action: 'placeSelected',
          place: p
        }, '*');
      }
    };"""

content = re.sub(r'// 5\. 고르게 분포되는 동적 마커 렌더링 시스템.*?window\.closeDetailCard = function', lambda m: new_marker_logic + "\n\n    window.closeDetailCard = function", content, flags=re.DOTALL)
content = re.sub(r'// 5\. 마커 렌더링 시스템.*?window\.closeDetailCard = function', lambda m: new_marker_logic + "\n\n    window.closeDetailCard = function", content, flags=re.DOTALL)

with open('bible_map_viewer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated bible_map_viewer.html with even spatial distribution logic')
