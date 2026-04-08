# 팀 화이트보드 Dashboard

사무실 8인 팀을 위한 협업 화이트보드. Next.js 14 App Router + Firebase Realtime Database.

## Run

```bash
npm install
npm run dev
```

앱은 `http://localhost:3000` 에서 실행됩니다.

## Screens

- `/` — 사무실 대형 사이니지용 메인 대시보드 (팀 목표 + 4열 팀별 노트)
- `/u/[slug]` — 개인용 노트 작성 화면

## Member URLs

| Slug | Name   | Role | URL          |
| ---- | ------ | ---- | ------------ |
| yjy  | 유재영 | 임원 | `/u/yjy`  |
| kjy  | 김주연 | 임원 | `/u/kjy`  |
| ysh  | 유선화 | 임원 | `/u/ysh`  |
| ldj  | 이동주 | 임원 | `/u/ldj`  |
| kjy2 | 김정연 | 직원 | `/u/kjy2` |
| rdh  | 류다혜 | 직원 | `/u/rdh`  |
| kjh  | 김주희 | 직원 | `/u/kjh`  |
| kje  | 김제연 | 직원 | `/u/kje`  |

## Firebase Notes

- **Realtime Database** (NOT Firestore). Region: `asia-southeast1`.
- Config is hardcoded in `lib/firebase.ts` (public web config — safe to commit).
- Analytics is intentionally NOT initialized to keep SSR working.
- Data paths:
  - `/notes/{pushId}` — Note objects
  - `/goals` — single Goals object (`overall`, `monthly`, `weekly`)

## Architecture

- `lib/firebase.ts` — app + db singleton (hot-reload safe)
- `lib/members.ts` — hardcoded 8 members
- `lib/types.ts` — domain types (`Note`, `Goals`, `TeamKey`, `TEAMS`)
- `lib/notes.ts` — RTDB CRUD + subscriptions
- `lib/tts.ts` — Korean Web Speech API with queue
- `app/` — App Router pages (no `pages/` directory)

## Fonts

Pretendard Variable via jsDelivr CDN. Generic fonts (Inter / Roboto / Arial) are intentionally avoided.
