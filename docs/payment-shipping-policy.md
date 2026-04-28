# 결제 / 배송 / 환불 / 쿠폰·포인트 — 정책 및 와꾸 설계서

> 작성: Iseria (planner)
> 최종 수정: 2026-04-28
> 상태: 1차 확정 — **외부 결제 모듈·배송사 API 연동은 제외**, 와꾸(정책·상태·DB·UI 골조)만 확정
> 관련: `docs/service-requirements.md`, `docs/domain-model.md`, `docs/shipping-tracking-plan.md`

---

## 1. 목표

결제 PG / 배송사 / 추적 API 등 **외부 시스템 연동은 본 단계에서 붙이지 않는다**.
대신 결제·배송·환불·쿠폰·포인트의 **정책 / 상태머신 / DB / 화면 와꾸**만 확정해서,
이후 외부 모듈을 끼우면 그대로 동작하도록 사전 슬롯을 준비한다.

핵심 결과물:

1. 운영자/유저 입장에서 **수동(어드민이 결제 완료 처리, 송장 입력)으로도 전체 흐름이 굴러간다**.
2. 결제·배송 외부 모듈은 어댑터 한 군데(`PaymentAdapter`, `ShippingAdapter`)만 갈아끼우면 붙는다.
3. 쿠폰·포인트는 DB만 있고 흐름이 미완성 → 본 단계에서 와꾸 마무리.

---

## 2. 포함 범위 (이번 단계)

| 영역      | 내용                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| 결제 정책 | 지원 수단 정의(국가별), 통화 정책, 결제 상태머신, 어댑터 인터페이스                               |
| 결제 와꾸 | 체크아웃 결제 단계 UI 골조, **MOCK PaymentAdapter** (관리자 수동 결제완료 처리 가능)              |
| 배송 정책 | 배송사 후보, 배송 정책(국내/해외), 송장/추적 데이터 구조, 배송 상태머신                           |
| 배송 와꾸 | 어드민 송장 입력 UI, 유저 주문상세 배송 추적 영역(외부 추적 URL placeholder)                      |
| 환불 정책 | 환불/반품/교환 사유, 가능 기간(국가별), 상태 전이, 부분환불 규칙                                  |
| 쿠폰      | 발급(어드민) → 보유(유저) → 적용(체크아웃) → 사용/만료 흐름 + 화면, 검증 규칙(중복·기간·최소금액) |
| 포인트    | 적립(구매확정/리뷰), 사용(체크아웃), 만료, 트랜잭션 화면                                          |
| 분석      | 결제·환불·쿠폰·포인트 핵심 이벤트 정의                                                            |

---

## 3. 제외 범위 (이번 단계 X — 이후 작업)

- Toss / Stripe / PayPal / Apple Pay 등 **실제 PG 연동 및 webhook 처리**
- SweetTracker / Aftership 등 **외부 배송 추적 API 연동 및 webhook 처리**
- 자동 환불(PG cancel API 호출) — 본 단계는 어드민 수동 환불 처리만
- 해외 결제 사기 방지 / 3DS / 본인인증
- 영수증 / 세금계산서 / 부가세 자동 계산
- 정산(셀러 매출분배) — 단일 셀러 운영 기준

---

## 4. 정책

### 4.1 결제 수단 정책

> 본 단계는 정의만. 코드는 모두 MOCK 어댑터 통과.

| 국가     | 1차 지원 수단                                  | 비고                                |
| -------- | ---------------------------------------------- | ----------------------------------- |
| KR (기본) | 카드, 네이버페이, 카카오페이, 토스페이, 무통장 | 추후 Toss Payments 통합으로 일원화 |
| EN/JA/DE | 카드(글로벌), PayPal                           | 추후 Stripe + PayPal                |

- 통화: 사용자 locale 기준 자동 표기, 결제 통화는 **국가별 단일 통화**(KR=KRW, JP=JPY, DE=EUR, EN=USD).
- 환율은 어드민 수동 설정값(`country_config.fx_rate`) 사용. 자동 환율 API 미사용.
- **PaymentAdapter 인터페이스**(추후 구현):
  ```
  initiate(orderId, amount, currency, method) → { paymentRef, redirectUrl? }
  confirm(paymentRef) → { status, paidAt, raw }
  cancel(paymentRef, amount?) → { refundedAt, raw }
  ```
- MOCK 어댑터: `confirm`은 어드민이 "결제완료 처리" 버튼 누를 때 즉시 PAID로 전이.

### 4.2 배송 정책

| 항목     | 정책                                                              |
| -------- | ----------------------------------------------------------------- |
| 국내     | 기본 CJ대한통운, 어드민 송장 직접 입력. 추적 URL은 placeholder.   |
| 해외     | 1차 EMS / DHL 둘 중 선택, 어드민 송장 직접 입력.                  |
| 배송비   | 국가별 정책: KR 50,000원 이상 무료 / 그 외 정액. `country_config` |
| 배송기간 | KR 1~3일, JP 5~10일, EU/US 7~21일 — 안내 문구만 노출              |
| 추적     | `tracking_number` + `carrier_code` 저장, 추적은 외부 URL 링크 이동 |
| 부재처리 | 배송사 정책 위임 (자체 부재중 처리 X)                             |

- **ShippingAdapter 인터페이스**(추후 구현):
  ```
  registerTracking(orderId, carrier, number) → { trackerId }
  getStatus(trackerId) → { status, history[] }
  ```
- MOCK 어댑터: 어드민이 송장 입력 시 status=SHIPPED로 즉시 전이, 어드민이 "배송완료 처리"로 DELIVERED 전이.

### 4.3 환불 / 반품 / 교환 정책

| 구분 | 정의                              | 가능 기간 (국가별)             |
| ---- | --------------------------------- | ------------------------------ |
| 환불 | 발송 전 주문 취소 + 결제 취소     | 발송 전까지 언제든              |
| 반품 | 배송 완료 후 상품 회수 + 환불     | KR 7일 / JP 8일 / EU 14일 / US 14일 |
| 교환 | 사이즈/색상 교체 (재배송 발생)    | 위와 동일                      |

- 사유 카테고리: `CHANGE_OF_MIND`(단순변심) / `DEFECT`(상품불량) / `WRONG_ITEM`(오배송) / `SIZE_MISMATCH`(사이즈안맞음) / `OTHER`
- 단순변심: 왕복 배송비 구매자 부담 (정책 문구만)
- 불량/오배송: 판매자 부담
- 환불 단위: **부분환불 가능** (주문 항목 단위)
- 본 단계는 어드민 "환불처리" 버튼 → 결제상태만 REFUNDED로 수동 전이 (PG 호출 X)

### 4.4 쿠폰 정책

| 항목      | 정책                                                       |
| --------- | ---------------------------------------------------------- |
| 발급 주체 | 어드민 (수동/자동 둘 다)                                   |
| 종류      | `FIXED`(정액 할인) / `PERCENT`(정률 할인) / `FREE_SHIPPING` |
| 적용 대상 | 전체 / 카테고리 / 특정 상품                                |
| 중복 사용 | 1주문당 1쿠폰만 (포인트와는 중복 가능)                     |
| 기간      | 시작/종료일 필수, 만료 시 자동 EXPIRED                     |
| 최소금액  | 쿠폰별 설정 (`min_order_amount`)                           |
| 최대할인  | PERCENT 쿠폰은 max_discount_amount 캡 가능                 |

상태머신: `ISSUED → USED | EXPIRED | REVOKED`

### 4.5 포인트 정책

| 항목     | 정책                                                         |
| -------- | ------------------------------------------------------------ |
| 적립     | 구매확정 시 결제금액의 1% (국가별 조정 가능)                 |
| 적립 시점 | 구매확정(배송완료 + N일) 이후 → 자동 트리거                  |
| 사용     | 1포인트 = 1KRW 등가, **결제금액의 50% 한도** (정책 변경 가능) |
| 만료     | 적립일로부터 365일                                           |
| 환불 시  | 사용 포인트 자동 복원, 적립 포인트는 회수                    |
| 최소사용 | 1,000원 이상부터 사용 가능                                   |

트랜잭션 종류: `EARN`(적립) / `USE`(사용) / `EXPIRE`(만료) / `REVOKE`(회수) / `ADMIN_ADJUST`(어드민 조정)

---

## 5. 상태값

### 5.1 PaymentStatus (이미 정의됨 — domain-model 참조)

```
PENDING → PAID → PARTIALLY_REFUNDED | FULLY_REFUNDED
       └→ FAILED | CANCELED
```

### 5.2 OrderStatus (재확인)

```
PLACED → PAID → PREPARING → SHIPPED → DELIVERED → CONFIRMED
                                            │
                                            └→ RETURN_REQUESTED → RETURNED → REFUNDED
PLACED/PAID 단계 → CANCEL_REQUESTED → CANCELED → REFUNDED
```

### 5.3 ShippingStatus (신규 분리)

```
NOT_SHIPPED → READY → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                    └→ FAILED (반송 등)
```

> NOT_SHIPPED/READY는 OrderStatus(PREPARING)와 함께 추적용으로만 사용.

### 5.4 CouponIssuanceStatus

```
ISSUED → USED | EXPIRED | REVOKED
```

### 5.5 PointTransactionType

```
EARN / USE / EXPIRE / REVOKE / ADMIN_ADJUST
```

---

## 6. 리스크

| 리스크                                 | 영향 | 대응                                                                              |
| -------------------------------------- | ---- | --------------------------------------------------------------------------------- |
| MOCK PaymentAdapter로 운영 시 보안 노출 | 상   | 운영 환경 토글(`PAYMENT_MODE=mock|real`), 운영 빌드는 mock 차단                    |
| 어드민 수동 결제완료 처리 휴먼에러     | 중   | AuditLog 필수, 결제완료 처리 시 어드민 비밀번호 재인증                            |
| 환불 자동 PG cancel 미연결 — 결제내역 불일치 | 중   | 환불 발생 시 어드민 메모 필수, 추후 PG 연결 시 reconciliation job 설계            |
| 쿠폰 동시사용·중복적용                 | 상   | 체크아웃 시점에 DB 트랜잭션 + status='ISSUED' lock                                 |
| 포인트 음수 잔액                       | 상   | `points.balance >= 0` CHECK + 트랜잭션 단위 잠금                                   |
| 국가별 환불 기간 차이로 분쟁           | 중   | `country_config.return_period_days` 기준으로 UI에 명시 노출                       |
| 통화/환율 수동 운영 — 가격 어긋남      | 중   | 어드민에 fx_rate 변경 시 캐시 무효화 + AuditLog                                    |

---

## 7. 다음 작업 (스택)

> 우선순위 순. **결제·배송 외부 연동은 의도적으로 후순위에 둠.**

| #   | 작업                                                              | 담당          | 의존        |
| --- | ----------------------------------------------------------------- | ------------- | ----------- |
| 1   | DB: `country_config` 결제수단/환율/배송비/반품기간 컬럼 확정      | developer     | -           |
| 2   | DB: `payments` 테이블에 `provider`, `payment_ref`, `mode`(mock/real) 추가 | developer     | 1           |
| 3   | DB: `shipments` 테이블에 `carrier_code`, `tracking_url_template` 추가 | developer     | 1           |
| 4   | DB: `coupons.discount_type`, `min_order_amount`, `max_discount_amount` 보강 | developer     | 1           |
| 5   | 어댑터 인터페이스 정의: `PaymentAdapter`, `ShippingAdapter` (TS)  | developer     | 2,3         |
| 6   | MOCK 어댑터 구현 + 환경변수 토글                                  | developer     | 5           |
| 7   | 체크아웃: 쿠폰 적용 — DB 검증/트랜잭션/실패케이스(중복·기간·최소금액) 처리 | developer     | 4           |
| 8   | 체크아웃: 포인트 사용 UI + 잔액검증 + 트랜잭션 처리               | developer     | 6           |
| 9   | 어드민: 주문상세 — "결제완료 처리" / "환불처리" / "송장입력" / "배송완료 처리" 버튼 + AuditLog | developer     | 6           |
| 10  | 어드민: 쿠폰 발급/회수/대상지정 화면                              | developer     | 4           |
| 11  | 어드민: 포인트 수동 조정(`ADMIN_ADJUST`) 화면                     | developer     | 8           |
| 12  | 유저: 마이페이지 — 보유쿠폰, 포인트 잔액/이력, 환불·반품 신청 흐름 | developer     | 7,8         |
| 13  | 분석 이벤트: `payment_initiated/succeeded/failed`, `refund_processed`, `coupon_applied/redeemed`, `point_earned/used` 정의 추가 | planner       | -           |
| 14  | 디자인: 체크아웃 가격박스(쿠폰·포인트·배송비·총액) 와꾸 시안       | designer      | 7,8         |
| 15  | 디자인: 어드민 환불/송장 모달 와꾸 시안                           | designer      | 9           |
| 16  | (이후) 실제 PG 연동: Toss / Stripe / PayPal — 어댑터 교체         | developer     | 6           |
| 17  | (이후) 배송 추적 API 연동: SweetTracker / Aftership — 어댑터 교체 | developer     | 6           |

---

## 8. 의사결정 보류 — 추후 사용자 확정 필요

> 본 단계에서는 정책·와꾸 진행에 영향 없음. 외부 모듈 붙일 때 결정.

- [ ] PG: Toss(KR) + Stripe(글로벌) vs Toss + PayPal vs 단일 Stripe
- [ ] 배송: SweetTracker / Aftership / 혼용 (`shipping-tracking-plan.md` 참조)
- [ ] 환율: 수동 → 자동 전환 시점 / 사용 API
- [ ] 포인트 적립률 1% 고정 vs 등급제

---

## 9. 변경 이력

| 일자       | 작성자  | 내용                                                       |
| ---------- | ------- | ---------------------------------------------------------- |
| 2026-04-28 | Iseria  | 1차 작성. 결제/배송 외부 연동 제외, 와꾸·쿠폰·포인트 정의. |
