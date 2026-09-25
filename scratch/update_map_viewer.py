import re

with open('bible_map_viewer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS for 30% transparency and selected styles
css_patch = """
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
      background: transparent !important;
    }
    #map {
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.65) !important;
    }
    .leaflet-tile-pane {
      opacity: 0.70 !important; /* 30% 투명도 (지도가 30% 투명하게 보여 족보와 자연스럽게 어우러짐) */
    }
    .custom-pin.selected-pin {
      transform: scale(1.32) !important;
      border: 3px solid #f59e0b !important;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.9) !important;
      z-index: 9999 !important;
    }
    .marker-label.selected-label {
      background: #f59e0b !important;
      color: #0f172a !important;
      font-weight: 800 !important;
      font-size: 12px !important;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5) !important;
      border: 1.5px solid #ffffff !important;
    }
"""

content = re.sub(r'body,\s*html\s*\{[^}]*\}', '', content)
content = re.sub(r'#map\s*\{[^}]*\}', '', content)
content = content.replace('<style>', '<style>' + css_patch)

# 2. Update updateMarkers
script_update = """    // 5. 마커 렌더링 시스템 (주변 지명 폰 10개 전후, 데스크톱 30~40개 제한 및 거리 기반 필터링)
    const markersLayer = L.layerGroup().addTo(map);
    let selectedHighlightMarker = null;
    let currentSelectedPlace = null;

    function updateMarkers() {
      markersLayer.clearLayers();
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const isMobile = window.innerWidth <= 768;
      const maxLimit = isMobile ? 12 : 36; // 폰에서는 10개 전후, 데스크톱에서는 30~40개

      let placesToShow = [];

      if (currentSelectedPlace && typeof currentSelectedPlace.lat === 'number' && typeof currentSelectedPlace.lng === 'number') {
        // 현재 선택된 지명 기준 거리순 정렬하여 주변 지명 선정
        const sortedByDist = placesData
          .filter(p => p.id !== currentSelectedPlace.id)
          .map(p => {
            const dLat = p.lat - currentSelectedPlace.lat;
            const dLng = p.lng - currentSelectedPlace.lng;
            const dist = Math.hypot(dLat, dLng);
            return { place: p, dist: dist };
          })
          .sort((a, b) => a.dist - b.dist);

        const surrounding = sortedByDist.slice(0, maxLimit - 1).map(item => item.place);
        placesToShow = [currentSelectedPlace, ...surrounding];
      } else {
        // 선택된 지명이 없을 경우 화면 내 주요 지명 우선 노출
        const inView = placesData.filter(p => bounds.contains([p.lat, p.lng]));
        const sorted = inView.sort((a, b) => {
          const scoreA = (a.isMajor ? 100 : 0) + (a.count || 1);
          const scoreB = (b.isMajor ? 100 : 0) + (b.count || 1);
          return scoreB - scoreA;
        });
        placesToShow = sorted.slice(0, maxLimit);
      }

      placesToShow.forEach(p => {
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

    map.on('moveend zoomend resize', updateMarkers);"""

content = re.sub(r'// 5\. 마커 렌더링 시스템.*?map\.on\(\'moveend zoomend resize\', updateMarkers\);', lambda m: script_update, content, flags=re.DOTALL)

# 3. Update navigateToPlace
nav_update = """    // 8. 족보앱 연동 외부 인터페이스 (API / postMessage)
    window.findBestMatchPlace = function(query) {
      if (!query) return null;
      const q = query.trim();
      const qClean = q.toLowerCase().replace(/[\\s\\(\\)\\[\\]\\,\\.\\'\\"]/g, '');

      // 1. 완전 일치
      let matched = placesData.find(p => p.name === q || p.name.toLowerCase().replace(/[\\s\\(\\)\\[\\]\\,\\.\\'\\"]/g, '') === qClean);
      if (matched) return matched;

      // 2. 성경 주요 별칭 매핑
      const aliasMap = {
        '예루살렘성벽': '예루살렘',
        '예루살렘성전산': '예루살렘',
        '애굽고센땅': '고센땅',
        '고센': '고센땅',
        '애굽': '이집트(애굽)',
        '이집트': '이집트(애굽)',
        '시날평지': '시날',
        '모리아산': '모리아산',
        '에덴동산': '에덴동산',
        '홍해': '홍해',
        '하란': '하란'
      };
      if (aliasMap[qClean]) {
        const aliasTarget = aliasMap[qClean];
        matched = placesData.find(p => p.name === aliasTarget || p.name.includes(aliasTarget));
        if (matched) return matched;
      }

      // 3. 부분 포함 일치
      matched = placesData.find(p => qClean.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(qClean));
      if (matched) return matched;

      return null;
    };

    window.navigateToPlace = function(nameOrQuery) {
      if (!nameOrQuery) return;
      const target = nameOrQuery.trim();
      const place = window.findBestMatchPlace(target);
      if (place) {
        showDetail(place);
        return true;
      } else {
        searchInput.value = target;
        executeSearch(target);
        return false;
      }
    };"""

content = re.sub(r'// 8\. 족보앱 연동 외부 인터페이스.*?window\.navigateToPlace = function\(nameOrQuery\) \{.*?return false;\s*\}\s*;\s*\}', lambda m: nav_update, content, flags=re.DOTALL)

with open('bible_map_viewer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated bible_map_viewer.html successfully')
