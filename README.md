# aemtti.github.io

코드로 만든 게임과 작품 모음 — https://aemtti.github.io/

- 사이트에 나오는 것은 `works.json`에 적힌 작품뿐입니다. 페이지는 `node tools/build-site.mjs`로 만듭니다.
- 작품 파일은 `play/<이름>/`, 썸네일은 `thumbs/`에 있습니다.
- 올릴 때마다 GitHub Actions가 `tools/guard.mjs` 검사를 먼저 하고, 통과해야만 배포합니다.
- 다른 저장소에 `site.json`이 있으면 `tools/collect.mjs`가 매시간 그 작품을 가져와 목록에 더합니다(같은 검사를 거쳐야 배포). 형식은 `tools/collect.mjs` 머리말 참고.
