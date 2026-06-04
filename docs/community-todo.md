# Community — Deferred Work

운영 시작 전후로 다시 들어와야 할 항목들. 본 로드맵에 포함되지 않은 이유와 함께
기록.

## F4. 어뷰징 자동 차단 시스템 (deferred)

**상태:** 설계 완료, 구현 보류.

**목표:** 사용자 작성 컨텐츠(게시글·댓글)에서 부적절 콘텐츠를 자동으로 걸러내고
필요 시 어드민 모더레이션 큐로 보낸다.

**처리 단계 (강도 순)**

1. **자동 reject** — INSERT 시점에 DB constraint/trigger가 거부, 사용자에게 작성
   실패 에러 노출. 명백한 욕설·혐오 표현.
2. **자동 hidden + 어드민 큐** — INSERT는 허용하되 `status = HIDDEN`으로 저장. 어드민
   모더레이션 페이지에 큐로 노출. 의심 케이스 (약한 매치, 타사 멘션, 외부 링크 다수).
3. **사용자 신고 누적 → 자동 숨김** — `reports.count >= N` 트리거 (#9 신고 기능과 연동).

**필요 입력**

- 차단어 사전: ko/en/ja/de 4개 언어. (외부 소스 라이센스 확인 필요 — `dictionaries/profanity/` 위치)
- 경쟁사/브랜드명 리스트: 사용자 입력 대기. 일반 패턴 (외부 쇼핑몰 URL, "타사",
  "다른 곳" 등)은 디폴트로 포함.
- 외부 링크 화이트리스트 (이미지 호스팅·자사 도메인 등).

**스키마 추가 예정**

```sql
-- 차단어 테이블
CREATE TABLE banned_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word        TEXT NOT NULL,
  language    user_locale NOT NULL,
  severity    SMALLINT NOT NULL DEFAULT 1, -- 1=hidden, 2=reject
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX banned_words_word_lang_idx ON banned_words (language, lower(word));

-- 모더레이션 큐 (게시글·댓글 공용 polymorphic)
CREATE TABLE moderation_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type  like_target_type NOT NULL, -- 재사용
  target_id    UUID NOT NULL,
  reason       TEXT NOT NULL,             -- 'auto-banned-word', 'too-many-links', etc.
  resolved_at  TIMESTAMPTZ NULL,
  resolved_by  UUID REFERENCES admins(id) NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**구현 시점:** 실 사용자 트래픽 발생 직전. 그 전에는 어드민이 수동 모더레이션 (현재
이미 게시글 숨김/삭제 기능 있음).
