# 배송 추적 외부 API 연동 계획서

> **상태**: 미구현 (계획서만 수립)  
> **작성**: Politis (developer) / 2026-04-27  
> **관련 파일**: 섹션 5 "구현 대상 파일" 참고

---

## 1. 배경 및 목표

현재 배송 상태는 어드민이 수동으로 업데이트하는 방식이다.  
외부 배송 추적 API를 연동하면:
- 운송장 입력 → 외부 Tracker 자동 생성
- Webhook / Polling으로 실시간 상태 동기화
- 유저 주문 상세에서 실제 배송 추적 버튼 활성화
- 어드민 수동 조작 부담 감소

---

## 2. 사용 API 후보 분석

### 2-A. 국내 전용 — SweetTracker

| 항목 | 내용 |
|------|------|
| URL | https://tracking.sweettracker.co.kr |
| 지원 택배사 | CJ대한통운, 한진택배, 로젠택배, 우체국 등 국내 전체 |
| 호출 방식 | REST GET (운송장 번호 + 택배사 코드) |
| Webhook | 지원 (상태 변경 시 POST) |
| 월 무료 호출 | 500건 (이후 유료) |
| 한계 | 국내 전용 — 해외 배송은 별도 API 필요 |

```
GET https://info.sweettracker.co.kr/api/v1/trackingInfo
  ?t_key={API_KEY}&t_code={carrier_code}&t_invoice={tracking_number}
```

### 2-B. 해외 전용 — EasyPost

| 항목 | 내용 |
|------|------|
| URL | https://www.easypost.com |
| 지원 택배사 | DHL, FedEx, UPS, USPS, EMS, YAMATO, SAGAWA 등 100+ |
| 호출 방식 | REST POST /v2/trackers (Tracker 객체 생성) |
| Webhook | 지원 (tracker.updated 이벤트) |
| 과금 | Tracker 생성 건당 과금 |
| 한계 | 국내 택배 미지원 |

```
POST https://api.easypost.com/v2/trackers
Authorization: Basic {API_KEY}
{ "tracker": { "tracking_code": "...", "carrier": "FedEx" } }
```

### 2-C. 통합 단일 API — Aftership ★ 권장

| 항목 | 내용 |
|------|------|
| URL | https://www.aftership.com |
| 지원 택배사 | 국내 + 해외 900+ 캐리어 통합 |
| 호출 방식 | REST POST /trackings (운송장 등록) |
| Webhook | 지원 (상태 변경 시 POST) |
| 월 무료 | 100건 (이후 $9~/월) |
| 장점 | 국내/해외 단일 API, 한국어 메시지 지원 |

```
POST https://api.aftership.com/v4/trackings
x-aftership-api-key: {API_KEY}
{ "tracking": { "tracking_number": "...", "slug": "cj-logistics" } }
```

### 결정 기준 (나중에 확인 필요)

- **국내 전용 서비스** → SweetTracker (정확도 높음)
- **해외 비중 높음 or 운영 단순화 선호** → Aftership 단일 통합 ★
- **해외 물량 많고 비용 절감 필요** → SweetTracker(국내) + EasyPost(해외) 혼용

> **REQUEST_USER: 배송API선택: SweetTracker(국내전용) vs Aftership(통합) vs SweetTracker+EasyPost(혼용) 중 어느 방향으로 가실지 확인 필요합니다.**

---

## 3. 현재 데이터 모델

### 기존 `shipments` 테이블 (변경 없음)

```sql
id                    UUID PRIMARY KEY
order_id              UUID UNIQUE  -- 1주문 1배송
carrier               Carrier      -- CJ | HANJIN | LOGEN | EMS | DHL | FEDEX | UPS | USPS | YAMATO | SAGAWA
tracking_number       TEXT         -- 운송장 번호
country               TEXT
status                ShipmentStatus
shipped_at            TIMESTAMPTZ
delivered_at          TIMESTAMPTZ
estimated_delivery_at TIMESTAMPTZ
return_tracking_number TEXT
created_at / updated_at
```

### 추가 필요 컬럼 (연동 시 migration 작성)

```sql
-- 파일: supabase/migrations/YYYYMMDD_add_tracking_fields.sql
ALTER TABLE shipments
  ADD COLUMN external_tracker_id   TEXT,          -- Aftership/EasyPost Tracker ID
  ADD COLUMN last_synced_at        TIMESTAMPTZ,   -- 마지막 외부 API 동기화 시각
  ADD COLUMN tracking_events       JSONB DEFAULT '[]'::jsonb;  -- 원시 이벤트 이력 (선택)
```

---

## 4. 외부 상태 → 내부 ShipmentStatus 매핑

### Aftership 상태 매핑

| Aftership tag | 내부 ShipmentStatus |
|--------------|---------------------|
| `InTransit`  | `IN_TRANSIT` |
| `OutForDelivery` | `OUT_FOR_DELIVERY` |
| `Delivered`  | `DELIVERED` |
| `AttemptFail` | `OUT_FOR_DELIVERY` (재시도 중) |
| `Exception`  | `CUSTOMS_HELD` 또는 별도 처리 |
| `Expired`    | 별도 알림 처리 (status 변경 없음) |
| `Pending`    | `PENDING` |
| `InfoReceived` | `PICKED_UP` |

### EasyPost 상태 매핑

| EasyPost status | 내부 ShipmentStatus |
|----------------|---------------------|
| `pre_transit`  | `PENDING` |
| `in_transit`   | `IN_TRANSIT` |
| `out_for_delivery` | `OUT_FOR_DELIVERY` |
| `delivered`    | `DELIVERED` |
| `return_to_sender` | `RETURNED` |
| `failure`      | `CUSTOMS_HELD` |

---

## 5. 구현 대상 파일 (나중에 이 목록 순서대로 작업)

### Phase 1 — 기반 설정

| 작업 | 파일 | 내용 |
|------|------|------|
| DB 마이그레이션 | `supabase/migrations/YYYYMMDD_add_tracking_fields.sql` | `external_tracker_id`, `last_synced_at` 컬럼 추가 |
| 타입 보완 | `packages/types/src/index.ts` | `Shipment` 인터페이스에 `external_tracker_id`, `last_synced_at` 추가 |
| 환경변수 | `.env.local` (커밋 금지) | `AFTERSHIP_API_KEY` 또는 `SWEETTRACKER_API_KEY` + `EASYPOST_API_KEY` |

### Phase 2 — 추적 서비스

| 작업 | 파일 | 내용 |
|------|------|------|
| 추적 서비스 | `apps/admin/src/lib/services/tracking.ts` *(신규)* | 외부 API 호출 래퍼 (Tracker 생성, 상태 조회) |
| 상태 매핑 | `apps/admin/src/lib/services/tracking.ts` | 외부 상태 → `ShipmentStatus` 변환 |
| startShipment 연동 | `apps/admin/src/lib/actions/shipments.ts` | 운송장 입력 시 외부 Tracker 자동 생성 |

### Phase 3 — 수신 처리 (Webhook 우선, Polling 보조)

| 작업 | 파일 | 내용 |
|------|------|------|
| Webhook 엔드포인트 | `apps/commerce/src/app/api/webhooks/tracking/route.ts` *(신규)* | 외부 API 상태 변경 수신 → DB 반영 |
| Webhook 서명 검증 | 위 파일 내 | HMAC 서명 검증 (Aftership: `x-aftership-hmac-sha256`) |
| Polling 배치 | `apps/admin/src/app/api/cron/sync-shipments/route.ts` *(신규)* | IN_TRANSIT 건 주기적 조회 (Webhook 누락 보완) |

### Phase 4 — 프론트 표시

| 작업 | 파일 | 내용 |
|------|------|------|
| 어드민 이벤트 타임라인 | `apps/admin/src/app/(dashboard)/shipping/[orderId]/page.tsx` | `tracking_events` JSONB 이력 표시 |
| 유저 배송 추적 버튼 활성화 | `apps/commerce/src/app/[locale]/account/orders/[id]/page.tsx` | 현재 `disabled` 버튼을 실제 모달/팝업으로 교체 |
| 배송 상태 쿼리 추가 | `apps/commerce/src/lib/queries/orders.ts` | 주문 상세에 shipment join 추가 |

---

## 6. Webhook 수신 처리 흐름

```
외부 API Webhook POST /api/webhooks/tracking
  ↓
1. HMAC 서명 검증 (악용 방지)
  ↓
2. tracking_number + carrier로 shipments 조회
  ↓
3. 외부 상태 → ShipmentStatus 매핑
  ↓
4. 현재 상태와 비교 (하위 상태로 역행 방지)
  ↓
5. shipments 업데이트 (status, last_synced_at, tracking_events 추가)
  ↓
6. DELIVERED이면 orders.status = DELIVERED 동기화
  ↓
7. revalidatePath로 캐시 무효화
```

---

## 7. 운영 배치 (Polling)

Webhook은 누락 가능성이 있으므로 Polling으로 보완.

```
Vercel Cron (vercel.json)
  schedule: "0 */2 * * *"  → 2시간마다
  target: /api/cron/sync-shipments

대상: status IN ('PICKED_UP', 'IN_TRANSIT', 'CUSTOMS_HELD', 'OUT_FOR_DELIVERY')
     AND last_synced_at < NOW() - INTERVAL '2 hours'
     AND delivered_at IS NULL
```

---

## 8. 위험 포인트

| 위험 | 내용 | 대응 |
|------|------|------|
| 상태 역행 | 외부 API가 이전 상태를 재전송 | 상태 우선순위 정의, 역행 시 무시 |
| Webhook 누락 | 외부 서버 장애, 네트워크 오류 | Polling 배치로 보완 |
| 택배사 코드 불일치 | 내부 Carrier 코드 ↔ 외부 API slug 매핑 오류 | 매핑 테이블 중앙 관리 |
| API 한도 초과 | 고속 성장 시 Polling 과다 호출 | TTL 캐시, Webhook 전환 |
| CUSTOMS_HELD 장기화 | 해외 통관 지연 | 일정 기간 초과 시 운영자 알림 (Slack/이메일) |
| 반품 운송장 미입력 | RETURNED 상태에서 return_tracking_number 없음 | 어드민 경고 표시 |

---

## 9. 캐리어 코드 매핑 테이블

| 내부 Carrier | Aftership slug | EasyPost carrier | SweetTracker code |
|-------------|---------------|-----------------|-------------------|
| `CJ`        | `cj-logistics` | `CJLogistics` | `04` |
| `HANJIN`    | `hanjin` | — | `05` |
| `LOGEN`     | `logen` | — | `06` |
| `EMS`       | `ems` | `EMS` | `01` |
| `DHL`       | `dhl` | `DHL` | — |
| `FEDEX`     | `fedex` | `FedEx` | — |
| `UPS`       | `ups` | `UPS` | — |
| `USPS`      | `usps` | `USPS` | — |
| `YAMATO`    | `yamato` | `Yamato` | — |
| `SAGAWA`    | `sagawa` | `Sagawa` | — |

---

## 10. 구현 체크리스트 (나중에 작업 시 이 순서로)

- [ ] API 결정 (SweetTracker / Aftership / EasyPost — 사용자 확인 필요)
- [ ] API Key 발급 및 `.env.local` 설정
- [ ] DB 마이그레이션: `external_tracker_id`, `last_synced_at` 컬럼 추가
- [ ] `packages/types/src/index.ts`: `Shipment` 타입에 신규 필드 추가
- [ ] `apps/admin/src/lib/services/tracking.ts` 신규 작성 (API 호출 + 상태 매핑)
- [ ] `apps/admin/src/lib/actions/shipments.ts`: `startShipment()` 내 Tracker 생성 호출
- [ ] `apps/commerce/src/app/api/webhooks/tracking/route.ts` 신규 작성 (Webhook 수신)
- [ ] `apps/admin/src/app/api/cron/sync-shipments/route.ts` 신규 작성 (Polling 배치)
- [ ] `vercel.json` cron 등록
- [ ] 어드민 이벤트 타임라인 UI 보완
- [ ] 유저 주문 상세 배송 추적 버튼 활성화
- [ ] 통합 테스트 (운송장 입력 → Tracker 생성 → Webhook 수신 → 상태 반영)
