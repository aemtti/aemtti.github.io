# 사이트 유지보수 도구 (배포되지 않음)

`tools/`와 `.github/`는 배포 때 빠진다. 여기 있는 것은 작품을 고치고 확인하는 도구다.

| 파일 | 용도 |
|---|---|
| `serve.mjs` | GitHub Pages와 같은 경로로 로컬 서버: `node tools/dev/serve.mjs . 8787` → `http://127.0.0.1:8787/play/<slug>/` |
| `cdp.mjs` | 헤드리스 크롬으로 폰(세로·가로)·태블릿·PC 화면 + 실제 터치 이벤트 확인, 스크린샷, 콘솔 오류 수집 (파일 머리말 참고) |
| `touch-kit.js` | 키보드·마우스 게임에 붙이는 화면 조작부(스틱·버튼·세로 안내·확대 방지). 한 파일 게임은 `<script>`로 인라인 |
| `test-kit.mjs`, `demo.html` | touch-kit 검증 예시: `node tools/dev/serve.mjs tools/dev 8789` 후 `node tools/dev/test-kit.mjs` |

## 작품을 추가하거나 고칠 때
1. 소스는 각 작품의 (비공개) 저장소에서 고친다. 모바일 기준은 아래.
2. 빌드한 실행 파일만 `play/<slug>/`에 넣는다(시작 파일 `index.html`, 상대 경로). 문서·테스트·원본 자료·개인 정보·45MB 넘는 파일은 넣지 않는다.
3. 썸네일 `thumbs/<slug>.jpg` (1280×720, 실제 플레이 화면, 조작부 없이).
4. `works.json`에 항목을 추가/수정한다. 필드: `slug`, `title`(한국어), `en`, `kind`(game·toy·art·film·music·collection), `orientation`(any·landscape·portrait), `desc`, `mobile`, `desktop`, `url`(`play/<slug>/`), `thumb`, 선택 `needs`("webgpu"). 모음은 `kind: "collection"` + `items`(슬러그 `모음/항목`, 폴더 `play/모음/항목/`).
5. `node tools/build-site.mjs` → `node tools/guard.mjs` (로컬 금지 규칙 파일 `tools/.guard.local.json`이 있으면 전체 검사).
6. `cdp.mjs`로 폰 세로·가로·PC에서 시작→조작→일시정지까지 확인하고 오류 0을 본다.
7. 커밋·푸시하면 GitHub Actions가 검사(guard)를 먼저 하고, 통과해야만 배포한다. 목록(works.json)에 없는 폴더가 `play/`에 있으면 배포되지 않는다.

## 모바일 기준 (모든 작품)
- viewport meta(`width=device-width,initial-scale=1,viewport-fit=cover`), 가로 스크롤 없음, 글자 12px 이상, 터치 대상 44px 이상, 노치 안전 영역.
- 폰 세로(390×844)·가로(844×390) 모두 화면에 맞는다. 가로 전용이면 회전 안내(닫을 수 있게).
- 키보드·마우스로 되는 모든 동작이 터치로도 된다(이동·행동·메뉴·일시정지·재시작·"아무 키나" 화면·우클릭·휠·호버 설명).
- 화면 조작부는 터치 기기에서만, 중요한 HUD를 가리지 않게. PC 조작은 그대로.
- 첫 터치에서 소리 시작. 캔버스/WebGL 픽셀 비율은 폰에서 2 이하. 3D는 터치에서 포인터 잠금 없이 왼쪽 스틱 이동 + 오른쪽 드래그 시점.
- 콘솔 오류 0. 게임 내용·밸런스·그림은 바꾸지 않는다.
