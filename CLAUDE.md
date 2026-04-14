# CLAUDE.md — Commerce Project

## 프로젝트 개요
대형견 의류 중심 글로벌 커머스 + 커뮤니티 + 어드민 모노레포

## 구조
- `apps/commerce` — 커머스 프론트 (Next.js 15, port 3000)
- `apps/admin` — 어드민 프론트 (Next.js 15, port 3001)
- `packages/shared` — 공통 유틸리티
- `packages/types` — 공통 타입 정의
- `docs/` — 기획/정책 문서

## 기술 스택
- Next.js 15 + React 19 + Tailwind CSS 4
- Supabase (DB + Auth + Storage)
- next-intl (다국어)
- TypeScript strict mode

## 개발 명령
- 커머스: `npm -w apps/commerce run dev`
- 어드민: `npm -w apps/admin run dev`
- 타입체크: `npm run typecheck`
- 빌드: `npm run build:commerce` / `npm run build:admin`

## 코드 규칙
- 영어 코드, 다국어 UI (ko 기본, en/ja/de 지원)
- `npx tsc --noEmit` 0에러 후 커밋
- .env / node_modules / dist / .next 커밋 금지
- optional 필드는 null 기본값

## Git
- 브랜치: develop (기본), main (배포)
- origin: https://github.com/yoobni/commerce

## 행동 규칙
- 불명확하면 물어봐라
- 병목 생기면 보고하고 멈춰라
- 요청받지 않은 파일 생성 금지
- 부분 완료 ≠ 완료
