# 성경 인물 족보 연결선 아우라(Glow) 복구 완료 및 배포 검증

인물 관계 연결선(`connector-line`, `spouse-connector`)에서 아우라 효과(Glow)가 렌더링되지 않던 버그를 완전히 수정하여 Oracle Cloud 실서버에 배포 완료했습니다.

---

## 1. 문제 원인 분석

기존에는 관계선 하이라이트 활성화 시 아우라 효과를 구현하기 위해 `<svg id="svg-layer">` 내부에 SVG 네이티브 필터인 `<filter id="line-glow-filter">`를 정의하여 사용했습니다.
그러나 Javascript(`app_v16_v2.js`) 내의 `drawConnections()` 함수가 관계선을 다시 그릴 때마다 다음 코드를 실행하고 있었습니다:

```javascript
function drawConnections() {
  svgLayer.innerHTML = "";
  ...
}
```

이 과정에서 `#svg-layer` 내부에 정의되어 있던 `<defs>`와 `<filter>` 태그까지 통째로 지워져 버려, 브라우저가 CSS 내의 `filter: url(#line-glow-filter)`를 해석할 필터 정의를 찾지 못해 아우라(Glow)가 화면에 표시되지 않는 현상이 발생했습니다.

또한, `filterUnits="userSpaceOnUse"`의 좌표 범위(`x="-50%" y="-50%" width="200%" height="200%"`)가 SVG viewport(화면 크기) 기준으로 제한되어 있어, 족보를 넓게 탐색하거나 드래그할 때 아우라 효과가 짤리거나 렌더링되지 않는 부차적인 문제도 발견되었습니다.

---

## 2. 해결 및 조치 사항

### 1) 독립 필터 컨테이너 구축 (`index.html`)
- `svgLayer.innerHTML = ""`에 영향을 받지 않도록, 필터 정의(`<defs>`)를 `#svg-layer` 외부의 독립된 보이지 않는 SVG 요소인 `#svg-filters`로 분리하여 영구히 보존했습니다.
- 족보를 줌인/줌아웃하거나 드래그하여 전역 범위를 탐색할 때에도 아우라가 잘리지 않도록 필터 영역을 충분히 덮는 절대 픽셀 크기(`x="-10000" y="-10000" width="20000" height="20000"`)로 조절했습니다.

```diff
       <div id="zoom-wrapper">
         <div id="tree-board">
-          <svg id="svg-layer" xmlns="http://www.w3.org/2000/svg">
+          <!-- 독립된 SVG 필터 정의 컨테이너 (svgLayer.innerHTML = ""에 의해 삭제되는 것을 방지) -->
+          <svg id="svg-filters" xmlns="http://www.w3.org/2000/svg" style="position: absolute; width: 0; height: 0; pointer-events: none;">
             <defs>
-              <filter id="line-glow-filter" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
+              <filter id="line-glow-filter" filterUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
                 <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                 <feMerge>
                   <feMergeNode in="coloredBlur"/>
@@ -119,6 +119,7 @@
               </filter>
             </defs>
           </svg>
+          <svg id="svg-layer" xmlns="http://www.w3.org/2000/svg"></svg>
```

### 2) CSS 스타일 적용 검증 (`style_v16_v2.css`)
- 하이라이트 활성화 스타일이 URL 필터를 올바르게 지목하고 있는지 다시 검토하고 최종 유지했습니다:
```css
.connector-line.line-highlight,
.spouse-connector.line-highlight {
  stroke: var(--text-accent) !important;
  stroke-width: 4.5px !important;
  filter: url(#line-glow-filter) !important; /* 복구된 전역 필터 적용 */
  stroke-dasharray: 8 4;
  animation: line-pulse-dash 1.2s linear infinite;
  z-index: 100;
  opacity: 1 !important;
}
```

---

## 3. 실서버 배포 및 동작 확인

1. **배포**: SCP를 통하여 Oracle Cloud 원격 서버의 `/var/www/f.jubilee.or.kr/index.html`에 패치를 반영했습니다.
2. **PM2 재기동**: 혹시 모를 캐싱을 방지하기 위해 실서버의 PM2 프로세스를 재기동했습니다.
3. **HTTP API 확인**: `https://f.jubilee.or.kr/index.html` 및 `https://f.jubilee.or.kr/style_v16_v2.css`로 접속하여 수정 사항이 정상적으로 반영되었음을 확인했습니다.

> [!IMPORTANT]
> **사용자 확인 요청:**
> 웹 브라우저에서 `https://f.jubilee.or.kr/` 페이지를 여신 후, **강력 새로고침 (Chrome 기준 `Cmd + Shift + R` 또는 `Ctrl + F5`)**을 하시고 인물 카드를 클릭하여 족보 연결선에 주황색/파란색 아우라(Glow)가 점선 애니메이션과 함께 정상적으로 나타나는지 확인해 주시기 바랍니다.
