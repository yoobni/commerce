-- ============================================================
-- RAVI Commerce — Seed Data
-- 다국어(ko/en/ja/de) 카테고리·사이즈·상품 초기 데이터
-- ============================================================
-- Usage: supabase db reset (runs migrations + this seed)
--        or: psql $DATABASE_URL < supabase/seed.sql
-- ============================================================
-- UUID 생성 전략: uuid5(DNS_NAMESPACE, '<original-key>')
-- python3 -c "import uuid; print(uuid.uuid5(uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8'), '<key>'))"
-- 모든 UUID는 결정론적으로 재현 가능합니다.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Admins (개발용 초기 관리자 계정)
-- ─────────────────────────────────────────────────────────────
-- ⚠ DEV ONLY — 운영 환경에서는 반드시 교체할 것
-- email   : admin@ravidog.com
-- password: ravi1234  (bcrypt 10 rounds)
-- UUID key: uuid5(DNS_NAMESPACE, 'admin:super@ravidog.com')
-- ─────────────────────────────────────────────────────────────
INSERT INTO admins (id, email, password_hash, name, role, status, created_at, updated_at)
VALUES (
  '476f493e-bacf-5a60-89a4-69c5ebd7b5eb',
  'admin@ravidog.com',
  '$2a$10$y1agnTlANY.N5DQwqcwhROKMJ1tLnKkEavLH3lbzmcUy0VQsh8R1G',
  'Super Admin',
  'SUPER_ADMIN',
  'ACTIVE',
  '2026-01-01T00:00:00Z',
  '2026-01-01T00:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 1. Sizes (사이즈 기준표)
-- ─────────────────────────────────────────────────────────────
INSERT INTO sizes (id, label, chest_cm_min, chest_cm_max, back_length_cm_min, back_length_cm_max, neck_cm_min, neck_cm_max, weight_kg_min, weight_kg_max, breed_examples, sort_order, created_at)
VALUES
  ('cdfc081c-1972-5b0b-81e1-429f1b26913a', 'S',   50, 58,  38, 44,  30, 36,  15, 22, '["보더콜리","시바이누","비글"]',                             1, '2026-01-01T00:00:00Z'),
  ('a26e8cc8-cadd-50b5-8981-976e28c1bcbe', 'M',   58, 68,  44, 52,  36, 44,  22, 32, '["허스키","달마시안","사모예드"]',                           2, '2026-01-01T00:00:00Z'),
  ('36252ef7-d454-59b9-92af-4b6deec37a73', 'L',   68, 78,  52, 60,  44, 52,  32, 42, '["골든리트리버","래브라도리트리버","아키타"]',               3, '2026-01-01T00:00:00Z'),
  ('242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', 'XL',  78, 90,  60, 70,  52, 60,  42, 55, '["저먼셰퍼드","로트와일러","도베르만"]',                     4, '2026-01-01T00:00:00Z'),
  ('36c6a84b-1cde-55c5-912c-0f7d657116e5', '2XL', 90, 104, 70, 82,  60, 70,  55, 70, '["세인트버나드","버니즈마운틴독","뉴펀들랜드"]',             5, '2026-01-01T00:00:00Z'),
  ('96b471bb-d146-5f20-8087-d3618868592a', '3XL', 104,120, 82, 96,  70, 82,  70, 90, '["그레이트데인","레오베르거"]',                              6, '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. Categories (카테고리 — 다국어)
-- ─────────────────────────────────────────────────────────────
INSERT INTO categories (id, parent_id, slug, name_ko, name_en, name_ja, name_de, sort_order, is_active, created_at)
VALUES
  ('d3c419e9-c0dc-528f-9903-1db011bfdaec', NULL, 'outer',       '아우터',     'Outerwear',  'アウター',         'Oberbekleidung', 1, TRUE, '2026-01-01T00:00:00Z'),
  ('aca034da-11b3-5250-b76f-d71a6866fab2', NULL, 'tops',        '상의',       'Tops',       'トップス',          'Oberteile',      2, TRUE, '2026-01-01T00:00:00Z'),
  ('c7920edf-0c06-58d8-9c5a-a616da04bd8b', NULL, 'onepiece',    '올인원',     'One-piece',  'オールインワン',    'Overall',        3, TRUE, '2026-01-01T00:00:00Z'),
  ('a9f99a69-d18a-5810-88fc-f04641a4714e', NULL, 'raincoat',    '레인코트',   'Raincoat',   'レインコート',      'Regenmantel',    4, TRUE, '2026-01-01T00:00:00Z'),
  ('96d2a0a1-e0fc-5c4d-9697-63999198f356', NULL, 'accessories', '액세서리',   'Accessories','アクセサリー',      'Zubehör',        5, TRUE, '2026-01-01T00:00:00Z'),
  -- L1 신규 — 기능성 (안전·보호·수영·쿨링)
  ('64e6ad9a-ab43-5522-96c7-5724ae7c43ce', NULL, 'functional',  '기능성',     'Functional', '機能性',            'Funktional',     6, TRUE, '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. Products (상품 — 다국어 이름 + 설명)
-- ─────────────────────────────────────────────────────────────
INSERT INTO products (
  id, category_id, slug,
  name_ko, name_en, name_ja, name_de,
  description_ko, description_en, description_ja, description_de,
  base_price_krw, base_price_usd, base_price_jpy, base_price_eur,
  material, care_instruction, weight_g,
  thumbnail_url, images,
  status, is_featured, view_count, review_count, review_avg_rating,
  published_at, created_at, updated_at
)
VALUES
  -- ── 아우터 ──────────────────────────────────────────────────
  (
    '3126f906-588b-574c-b020-38ad8798aa75', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'large-dog-padded-coat',
    '라지 독 패딩 코트', 'Large Dog Padded Coat', 'ラージドッグパデッドコート', 'Großhund-Steppmantel',
    '대형견을 위해 특별 설계된 따뜻한 패딩 코트. 방수 외피와 극세사 충전재로 한겨울에도 따뜻하게.',
    'Warmly padded coat specially designed for large dogs. Water-resistant outer shell with microfiber filling for warmth in winter.',
    '大型犬向けに特別設計されたウォームパデッドコート。撥水アウターシェルとマイクロファイバー充填材で冬でも暖かく。',
    'Warmer Steppmantel, speziell für große Hunde entwickelt. Wasserabweisende Außenhülle mit Mikrofaserfüllung für Wärme im Winter.',
    89000, 68.00, 9800, 62.00,
    '아우터: 폴리에스터 100% / 충전재: 폴리에스터 극세사', '30도 이하 손세탁 권장, 건조기 사용 금지', 420,
    'https://placedog.net/400/400?id=1',
    '["https://placedog.net/800/800?id=1","https://placedog.net/800/600?id=51","https://placedog.net/600/800?id=71"]',
    'ACTIVE', TRUE, 1240, 38, 4.7,
    '2026-01-15T00:00:00Z', '2026-01-10T00:00:00Z', '2026-03-01T00:00:00Z'
  ),
  (
    '5b604cf4-1501-5fd5-8f01-6eae06b36fef', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'lightweight-windbreaker',
    '라이트웨이트 윈드브레이커', 'Lightweight Windbreaker', 'ライトウェイトウィンドブレーカー', 'Leichter Windbreaker',
    '가벼운 소재의 바람막이. 봄·가을 야외 활동에 최적화된 접이식 디자인.',
    'Lightweight windbreaker for outdoor activities. Packable design, ideal for spring and autumn.',
    '軽量素材のウィンドブレーカー。春・秋のアウトドア活動に最適なパッカブルデザイン。',
    'Leichter Windbreaker für Outdoor-Aktivitäten. Packbares Design, ideal für Frühling und Herbst.',
    55000, 42.00, 6000, 38.00,
    '나일론 100%', '손세탁 또는 30도 이하 세탁기 약세탁', 180,
    'https://placedog.net/400/400?id=2',
    '["https://placedog.net/800/800?id=2","https://placedog.net/800/600?id=52"]',
    'ACTIVE', FALSE, 430, 9, 4.4,
    '2026-03-01T00:00:00Z', '2026-02-20T00:00:00Z', '2026-03-15T00:00:00Z'
  ),
  -- ── 상의 ────────────────────────────────────────────────────
  (
    '0e21d901-8144-50d2-94d2-8f737dc85967', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'cozy-fleece-hoodie',
    '코지 플리스 후디', 'Cozy Fleece Hoodie', 'コージーフリースフーディー', 'Gemütlicher Fleece-Hoodie',
    '부드러운 플리스 소재의 편안한 후디. 활동적인 대형견의 움직임을 방해하지 않는 넉넉한 핏.',
    'Comfortable hoodie made from soft fleece. Roomy fit that doesn''t restrict the movement of active large dogs.',
    '柔らかいフリース素材の快適なフーディー。活動的な大型犬の動きを妨げない余裕のあるフィット。',
    'Bequemer Hoodie aus weichem Fleece. Geräumige Passform, die die Bewegungsfreiheit aktiver großer Hunde nicht einschränkt.',
    59000, 45.00, 6500, 41.00,
    '폴리에스터 80% / 면 20%', '40도 이하 세탁, 뒤집어서 세탁 권장', 280,
    'https://placedog.net/400/400?id=3',
    '["https://placedog.net/800/800?id=3","https://placedog.net/800/600?id=53"]',
    'ACTIVE', TRUE, 890, 24, 4.5,
    '2026-01-20T00:00:00Z', '2026-01-15T00:00:00Z', '2026-02-20T00:00:00Z'
  ),
  (
    'fa943045-1857-521e-80ab-bff58fa352d2', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'sporty-stripe-tshirt',
    '스포티 스트라이프 티셔츠', 'Sporty Stripe T-shirt', 'スポーティーストライプTシャツ', 'Sportliches Streifen-T-Shirt',
    '여름 산책용 스트라이프 티셔츠. 땀 흡수와 빠른 건조가 가능한 쿨링 소재.',
    'Stripe T-shirt for summer walks. Cooling fabric with moisture wicking and quick-dry properties.',
    '夏の散歩用ストライプTシャツ。汗を吸収しすぐに乾くクーリング素材。',
    'Streifen-T-Shirt für Sommerspaziergänge. Kühlstoff mit Feuchtigkeitsaufnahme und Schnelltrocknungseigenschaften.',
    38000, 29.00, 4100, 26.00,
    '폴리에스터 90% / 스판덱스 10%', '30도 이하 세탁기 세탁', 150,
    'https://placedog.net/400/400?id=4',
    '["https://placedog.net/800/800?id=4","https://placedog.net/800/600?id=54"]',
    'ACTIVE', FALSE, 320, 7, 4.3,
    '2026-03-15T00:00:00Z', '2026-03-10T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  -- ── 올인원 ───────────────────────────────────────────────────
  (
    'd30f9e7e-d828-5b3d-8bfd-e663b92b2007', 'c7920edf-0c06-58d8-9c5a-a616da04bd8b', 'classic-knit-onepiece',
    '클래식 니트 올인원', 'Classic Knit One-piece', 'クラシックニットオールインワン', 'Klassischer Strick-Overall',
    '부드러운 니트 소재의 올인원. 착용과 탈의가 쉬운 등부분 지퍼 설계.',
    'One-piece in soft knit fabric. Back zipper design for easy on and off.',
    '柔らかいニット素材のオールインワン。着脱しやすい背面ジッパーデザイン。',
    'Overall aus weichem Strickstoff. Rückenreißverschluss-Design für einfaches An- und Ausziehen.',
    65000, 50.00, 7100, 46.00,
    '아크릴 60% / 울 30% / 스판덱스 10%', '30도 이하 울 코스 세탁', 260,
    'https://placedog.net/400/400?id=5',
    '["https://placedog.net/800/800?id=5","https://placedog.net/800/600?id=55"]',
    'ACTIVE', TRUE, 540, 12, 4.6,
    '2026-02-10T00:00:00Z', '2026-02-05T00:00:00Z', '2026-03-05T00:00:00Z'
  ),
  -- ── 레인코트 ─────────────────────────────────────────────────
  (
    '590dd0aa-4719-5e00-9cb8-6747c5b36531', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'waterproof-adventure-raincoat',
    '어드벤처 방수 레인코트', 'Adventure Waterproof Raincoat', 'アドベンチャー防水レインコート', 'Adventure Wasserdichter Regenmantel',
    '완전 방수 처리된 레인코트. 후드 일체형 설계로 머리부터 꼬리까지 완벽한 보호.',
    'Fully waterproof raincoat. Integrated hood design for complete protection from head to tail.',
    '完全防水仕様のレインコート。フード一体型デザインで頭からしっぽまで完全保護。',
    'Vollständig wasserdichter Regenmantel. Integriertes Kapuzendesign für vollständigen Schutz von Kopf bis Schwanz.',
    72000, 55.00, 7900, 50.00,
    'PU 코팅 폴리에스터 100%', '스폰지로 닦아서 세척, 세탁기 사용 금지', 310,
    'https://placedog.net/400/400?id=6',
    '["https://placedog.net/800/800?id=6","https://placedog.net/800/600?id=56","https://placedog.net/600/800?id=76","https://placedog.net/800/800?id=86"]',
    'ACTIVE', FALSE, 620, 15, 4.8,
    '2026-02-01T00:00:00Z', '2026-01-25T00:00:00Z', '2026-03-10T00:00:00Z'
  ),
  -- ── 액세서리 ─────────────────────────────────────────────────
  (
    '4b22e14e-8349-5574-9d47-e575a0285040', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'classic-cotton-bandana',
    '클래식 코튼 반다나', 'Classic Cotton Bandana', 'クラシックコットンバンダナ', 'Klassisches Baumwoll-Bandana',
    '100% 면 소재의 부드러운 반다나. 다양한 패턴으로 일상 스타일링에 포인트를.',
    '100% cotton soft bandana. Variety of patterns to add style to everyday looks.',
    '100%コットン素材の柔らかいバンダナ。さまざまなパターンで日常スタイリングにアクセントを。',
    '100 % Baumwoll-Bandana. Verschiedene Muster für den täglichen Styling-Akzent.',
    18000, 14.00, 1900, 13.00,
    '면 100%', '40도 이하 세탁기 세탁 가능', 40,
    'https://placedog.net/400/400?id=7',
    '["https://placedog.net/800/800?id=7","https://placedog.net/800/600?id=57"]',
    'ACTIVE', FALSE, 780, 31, 4.9,
    '2026-02-15T00:00:00Z', '2026-02-10T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    '7f29375a-c0ea-5c91-8819-95ff8728ae51', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'padded-harness-cover',
    '패딩 하네스 커버', 'Padded Harness Cover', 'パデッドハーネスカバー', 'Gepolsterte Geschirrabdeckung',
    '하네스 위에 착용하는 패딩 커버. 마찰을 줄이고 체온을 유지합니다.',
    'Padded cover worn over harness. Reduces friction and retains body warmth.',
    'ハーネスの上に着用するパデッドカバー。摩擦を軽減し体温を保持します。',
    'Gepolsterte Abdeckung, die über das Geschirr getragen wird. Reduziert Reibung und hält die Körperwärme.',
    32000, 24.00, 3500, 22.00,
    '폴리에스터 100% (충전재: 극세사)', '30도 이하 손세탁', 120,
    'https://placedog.net/400/400?id=8',
    '["https://placedog.net/800/800?id=8","https://placedog.net/800/600?id=58"]',
    'ACTIVE', TRUE, 260, 5, 4.6,
    '2026-03-01T00:00:00Z', '2026-02-25T00:00:00Z', '2026-03-25T00:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3-B. Additional Products (대형견 특화 신규 상품 22개)
-- ─────────────────────────────────────────────────────────────
INSERT INTO products (
  id, category_id, slug,
  name_ko, name_en, name_ja, name_de,
  description_ko, description_en, description_ja, description_de,
  base_price_krw, base_price_usd, base_price_jpy, base_price_eur,
  material, care_instruction, weight_g,
  thumbnail_url, images,
  status, is_featured, view_count, review_count, review_avg_rating,
  published_at, created_at, updated_at
)
VALUES
  -- ── 아우터 추가 (4개) ─────────────────────────────────────
  (
    '5e5b8a1f-b1f3-579b-aaeb-f5be63c77a84', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'reversible-fleece-jacket',
    '리버서블 플리스 자켓', 'Reversible Fleece Jacket', 'リバーシブルフリースジャケット', 'Wendejacke Fleece',
    '양면으로 입을 수 있는 대형견 전용 플리스 자켓. 골든리트리버·래브라도의 넓은 흉부를 고려한 와이드 체스트 패턴. 200D 폴리 외피 + 극세사 플리스 안감.',
    'Reversible fleece jacket engineered for large breeds. Wide-chest pattern built for the deep barrel chests of Labradors and Goldens. 200D poly outer with microfleece lining.',
    '大型犬専用リバーシブルフリースジャケット。ラブラドールやゴールデンの広い胸囲に対応したワイドチェストパターン。200Dポリエステルアウター＋マイクロフリース裏地。',
    'Wendejacke für große Hunde. Breites Brust-Pattern für die tiefen Fässer von Labradors und Goldens. 200D Poly-Außenstoff mit Microfleece-Futter.',
    79000, 60.00, 8600, 54.00,
    '외피: 폴리에스터 200D / 안감: 폴리에스터 마이크로 플리스', '30도 이하 뒤집어서 세탁, 건조기 저온', 350,
    '/mock/products/reversible-fleece-01-thumb.jpg',
    '["/mock/products/reversible-fleece-01-1.jpg","/mock/products/reversible-fleece-01-2.jpg","/mock/products/reversible-fleece-01-3.jpg"]',
    'ACTIVE', TRUE, 960, 22, 4.6,
    '2026-02-01T00:00:00Z', '2026-01-28T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    '6cc5996e-4588-5e9d-a811-0748a59a3041', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'sherpa-down-vest',
    '쉐르파 다운 베스트', 'Sherpa Down Vest', 'シェルパダウンベスト', 'Sherpa-Daunenweste',
    '쉐르파 안감의 단열 베스트. 앞다리 동작을 방해하지 않는 슬리브리스 디자인으로 움직임이 많은 저먼 셰퍼드·허스키에게 적합.',
    'Insulating vest with sherpa fleece lining. Sleeveless design preserves full leg range of motion — ideal for active German Shepherds and Huskies.',
    'シェルパフリース裏地の断熱ベスト。スリーブレスデザインで前脚の動きを妨げず、活発なジャーマンシェパードやハスキーに最適。',
    'Isolierende Weste mit Sherpa-Fleece-Futter. Ärmellos für volle Bewegungsfreiheit — ideal für aktive Deutsche Schäferhunde und Huskies.',
    69000, 53.00, 7500, 48.00,
    '외피: 나일론 100% / 충전재: 오리털 70/30 / 안감: 폴리에스터 쉐르파', '30도 이하 손세탁, 건조기 저온', 380,
    '/mock/products/sherpa-vest-01-thumb.jpg',
    '["/mock/products/sherpa-vest-01-1.jpg","/mock/products/sherpa-vest-01-2.jpg"]',
    'ACTIVE', TRUE, 740, 18, 4.7,
    '2026-01-20T00:00:00Z', '2026-01-18T00:00:00Z', '2026-03-10T00:00:00Z'
  ),
  (
    '72a0814a-3a05-503a-88c3-45439e825ebb', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'reflective-night-outer',
    '리플렉티브 나이트 아우터', 'Reflective Night Outer', 'リフレクティブナイトアウター', 'Reflektor-Nachtjacke',
    '야간 산책 필수템. 360도 리플렉티브 파이핑으로 어둠 속에서도 선명하게. 로트와일러·그레이트데인 등 대형 비짱견을 위한 더블 스냅 버클.',
    'Built for night walks. 360° reflective piping stays visible in the dark. Double snap buckle designed for stocky large breeds like Rottweilers and Great Danes.',
    '夜の散歩の必需品。360°リフレクティブパイピングで暗闇でも目立つ。ロットワイラーやグレートデインなど体格の大きな犬のためのダブルスナップバックル。',
    'Für Nachtspaziergänge. 360°-Reflektorstreifen für maximale Sichtbarkeit im Dunkeln. Doppelter Schnappverschluss für kompakte Rassen wie Rottweiler und Deutsche Dogge.',
    85000, 65.00, 9200, 59.00,
    '폴리에스터 100% (리플렉티브 파이핑 봉제)', '30도 이하 세탁기 약세탁', 290,
    '/mock/products/reflective-night-01-thumb.jpg',
    '["/mock/products/reflective-night-01-1.jpg","/mock/products/reflective-night-01-2.jpg"]',
    'ACTIVE', FALSE, 580, 14, 4.8,
    '2026-02-10T00:00:00Z', '2026-02-08T00:00:00Z', '2026-03-15T00:00:00Z'
  ),
  (
    'cddad2c9-5e30-5431-9c72-cec2c058b412', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'military-outdoor-jacket',
    '밀리터리 아웃도어 재킷', 'Military Outdoor Jacket', 'ミリタリーアウトドアジャケット', 'Militär-Outdoor-Jacke',
    '험지 산행에서 검증된 내구성. 500D 코듀라 폴리 원단 + 4방향 스트레치 패널. 그레이트데인·아이리시 울프하운드의 긴 다리를 고려한 딥 겨드랑이 거셋.',
    'Trail-tested durability. 500D Cordura poly shell with 4-way stretch panels. Deep armhole gussets for long-limbed breeds like Great Danes and Irish Wolfhounds.',
    'トレイルで証明された耐久性。500Dコーデュラポリシェル＋4方向ストレッチパネル。グレートデインやアイリッシュウルフハウンドなど足の長い犬のためのディープアームホールガセット。',
    'Geländetauglich und langlebig. 500D Cordura-Polyschale mit 4-Wege-Stretchpaneelen. Tiefe Achselgussets für langluftige Rassen wie Deutsche Dogge und Irish Wolfhound.',
    98000, 75.00, 10700, 68.00,
    '외피: 나일론 코듀라 500D / 스트레치 패널: 폴리에스터 4-way', '30도 이하 손세탁', 460,
    '/mock/products/military-jacket-01-thumb.jpg',
    '["/mock/products/military-jacket-01-1.jpg","/mock/products/military-jacket-01-2.jpg","/mock/products/military-jacket-01-3.jpg"]',
    'ACTIVE', TRUE, 1100, 27, 4.9,
    '2026-02-15T00:00:00Z', '2026-02-12T00:00:00Z', '2026-03-25T00:00:00Z'
  ),
  -- ── 상의 추가 (4개) ──────────────────────────────────────
  (
    '43860da9-22a8-576c-b871-632d3e10cf68', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'daily-cotton-sweater',
    '데일리 코튼 스웨터', 'Daily Cotton Sweater', 'デイリーコットンスウェーター', 'Täglicher Baumwollpulli',
    '일상 착용에 최적화된 유기농 코튼 스웨터. 골든리트리버·래브라도의 두꺼운 목을 고려한 넉넉한 넥라인. 착용/탈의가 쉬운 등부분 스냅.',
    'Everyday organic cotton sweater with a generous neckline for the thick necks of Goldens and Labs. Easy on/off with back snaps.',
    '日常使いに最適なオーガニックコットンスウェーター。ゴールデンやラブラドールの太い首に対応した余裕のあるネックライン。背面スナップで着脱簡単。',
    'Alltags-Bio-Baumwollpulli mit großzügigem Halsausschnitt für die kräftigen Hälse von Goldens und Labs. Rückensnaps für einfaches An- und Ausziehen.',
    52000, 40.00, 5700, 36.00,
    '유기농 코튼 100%', '30도 이하 세탁기 약세탁', 220,
    '/mock/products/cotton-sweater-01-thumb.jpg',
    '["/mock/products/cotton-sweater-01-1.jpg","/mock/products/cotton-sweater-01-2.jpg"]',
    'ACTIVE', FALSE, 460, 11, 4.4,
    '2026-03-01T00:00:00Z', '2026-02-26T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    'e63e6a80-cab2-5e86-9b0e-36483435fcd8', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'hiking-dryfit-top',
    '하이킹 드라이핏 탑', 'Hiking Dry-Fit Top', 'ハイキングドライフィットトップ', 'Wander-Dry-Fit-Top',
    '장거리 하이킹을 위한 기능성 드라이핏 탑. 그래핀 원사 블렌드로 체온 조절 및 빠른 땀 배출. 보더콜리·오스트레일리안 셰퍼드 등 활동량 많은 대형견용.',
    'Technical dry-fit top for long hikes. Graphene-blend yarn for temperature regulation and rapid moisture wicking — for high-energy breeds like Border Collies and Aussies.',
    '長距離ハイキング用テクニカルドライフィットトップ。グラフェン混紡糸で体温調節と素早い汗の排出。ボーダーコリーやオーストラリアンシェパードなど運動量の多い大型犬向け。',
    'Technisches Dry-Fit-Top für lange Wanderungen. Graphen-Mischgarn für Temperaturregulierung — für energiereiche Rassen wie Border Collies und Aussies.',
    49000, 37.00, 5300, 34.00,
    '폴리에스터 90% + 그래핀 원사 10%', '30도 이하 세탁기 약세탁, 세탁망 사용', 160,
    '/mock/products/dryfit-top-01-thumb.jpg',
    '["/mock/products/dryfit-top-01-1.jpg","/mock/products/dryfit-top-01-2.jpg"]',
    'ACTIVE', FALSE, 340, 8, 4.5,
    '2026-03-10T00:00:00Z', '2026-03-08T00:00:00Z', '2026-03-28T00:00:00Z'
  ),
  (
    'e4d10307-00f5-5d2f-b785-3c059d469cf2', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'wool-blend-turtleneck',
    '울 블렌드 터틀넥', 'Wool Blend Turtleneck', 'ウールブレンドタートルネック', 'Wollmix-Rollkragenpullover',
    '머리노 울 30% 블렌드 터틀넥. 두꺼운 목을 가진 세인트버나드·버니즈마운틴독을 위한 와이드 폴드 넥. 정전기 방지 처리.',
    'Merino wool 30% blend turtleneck. Wide-fold neck for thick-necked breeds like Saint Bernards and Berners. Anti-static treatment.',
    'メリノウール30%混紡タートルネック。セントバーナードやバーニーズマウンテンドッグなど太い首の犬のためのワイドフォールドネック。帯電防止加工。',
    'Merinowolle 30% Blend-Rollkragenpullover. Breiter Umlegekragen für Rassen wie Berner Sennenhunde und Bernhardiner. Antistatische Behandlung.',
    62000, 47.00, 6800, 43.00,
    '울 30% / 아크릴 60% / 스판덱스 10%', '30도 이하 울 코스 손세탁', 240,
    '/mock/products/turtleneck-01-thumb.jpg',
    '["/mock/products/turtleneck-01-1.jpg","/mock/products/turtleneck-01-2.jpg"]',
    'ACTIVE', FALSE, 390, 10, 4.6,
    '2026-01-25T00:00:00Z', '2026-01-22T00:00:00Z', '2026-03-05T00:00:00Z'
  ),
  (
    '03b6b392-09dd-507c-b3e8-21f03b7e37cc', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'cooling-uv-top',
    '쿨링 UV 탑', 'Cooling UV Top', 'クーリングUVトップ', 'Kühl-UV-Top',
    '여름 야외 활동을 위한 UPF 50+ 쿨링 탑. 아이스터치 원단으로 대형견의 과열을 방지. 래브라도·골든리트리버·허스키 여름 필수템.',
    'UPF 50+ cooling top for summer outdoor activities. Ice-touch fabric prevents overheating in large breeds. Essential summer gear for Labs, Goldens, and Huskies.',
    '夏のアウトドアアクティビティ用UPF50+クーリングトップ。アイスタッチ素材で大型犬の過熱を防ぐ。ラブラドール・ゴールデン・ハスキーの夏の必需品。',
    'UPF 50+ Kühlshirt für sommerliche Outdoor-Aktivitäten. Ice-Touch-Stoff verhindert Überhitzung bei großen Hunden. Sommer-Must-have für Labs, Goldens und Huskies.',
    45000, 34.00, 4900, 31.00,
    '폴리에스터 85% + 아이스터치 기능사 15%', '30도 이하 세탁기 약세탁', 140,
    '/mock/products/cooling-uv-top-01-thumb.jpg',
    '["/mock/products/cooling-uv-top-01-1.jpg","/mock/products/cooling-uv-top-01-2.jpg"]',
    'ACTIVE', TRUE, 820, 19, 4.7,
    '2026-03-20T00:00:00Z', '2026-03-18T00:00:00Z', '2026-04-01T00:00:00Z'
  ),
  -- ── 올인원 추가 (2개) ─────────────────────────────────────
  (
    '030e2862-e8e6-5029-ad40-d61fd3f112dd', 'c7920edf-0c06-58d8-9c5a-a616da04bd8b', 'sport-stretch-onepiece',
    '스포츠 스트레치 올인원', 'Sport Stretch One-piece', 'スポーツストレッチオールインワン', 'Sport-Stretch-Overall',
    '운동에 최적화된 4-way 스트레치 올인원. 허스키·말라뮤트의 활발한 달리기 동작을 전혀 방해하지 않는다. 등부분 하네스 홀 내장.',
    '4-way stretch performance one-piece. Never restricts a Husky or Malamute mid-sprint. Built-in back harness slot.',
    '運動に最適化された4ウェイストレッチオールインワン。ハスキーやマラミュートの活発な走り動作を全く妨げない。背面ハーネスホール内蔵。',
    'Leistungsorientierter 4-Wege-Stretch-Overall. Schränkt weder Husky noch Malamute beim Sprinten ein. Eingebauter Rücken-Geschirr-Schlitz.',
    72000, 55.00, 7900, 50.00,
    '폴리에스터 / 스판덱스 4-way 스트레치 원단', '40도 이하 세탁기 세탁', 230,
    '/mock/products/sport-onepiece-01-thumb.jpg',
    '["/mock/products/sport-onepiece-01-1.jpg","/mock/products/sport-onepiece-01-2.jpg"]',
    'ACTIVE', TRUE, 670, 16, 4.8,
    '2026-02-20T00:00:00Z', '2026-02-18T00:00:00Z', '2026-03-22T00:00:00Z'
  ),
  (
    'ed3df9b1-4077-54bb-a9f2-a3e6121e8ce2', 'c7920edf-0c06-58d8-9c5a-a616da04bd8b', 'check-pattern-onepiece',
    '체크 패턴 올인원', 'Check Pattern One-piece', 'チェックパターンオールインワン', 'Schottenkaro-Overall',
    '클래식 타탄 체크 패턴 올인원. 영국산 모직 블렌드 원단. 도베르만·리도백의 우아한 실루엣을 살리는 슬림핏.',
    'Classic tartan check one-piece in British wool-blend. Slim-fit silhouette that flatters the elegant lines of Dobermanns and Ridgebacks.',
    'クラシックタータンチェックパターンのオールインワン。英国産ウール混紡生地。ドーベルマンやリッジバックの優雅なシルエットを活かすスリムフィット。',
    'Klassischer Schottenkaro-Overall aus britischem Wollmix. Slim-Fit-Silhouette für elegante Rassen wie Dobermänner und Ridgebacks.',
    68000, 52.00, 7400, 47.00,
    '울 25% / 아크릴 65% / 스판덱스 10%', '30도 이하 울 코스 세탁', 260,
    '/mock/products/check-onepiece-01-thumb.jpg',
    '["/mock/products/check-onepiece-01-1.jpg","/mock/products/check-onepiece-01-2.jpg"]',
    'ACTIVE', FALSE, 430, 9, 4.5,
    '2026-02-25T00:00:00Z', '2026-02-22T00:00:00Z', '2026-03-15T00:00:00Z'
  ),
  -- ── 레인코트 추가 (3개) ──────────────────────────────────
  (
    'a33f6d13-f3f7-5a1e-824a-1f016fb2f9c7', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'lightweight-spot-raincoat',
    '경량 스팟 레인코트', 'Lightweight Spot Raincoat', '軽量スポットレインコート', 'Leichter Spot-Regenmantel',
    '갑작스러운 소나기에 대비한 120g 초경량 레인코트. 하네스 위에 5초 만에 착용 가능. 파우치 포켓에 콤팩트하게 수납.',
    '120g ultralight raincoat ready for sudden showers. Slips on over a harness in 5 seconds. Folds into its own pocket for compact carry.',
    '突然の雨に備えた120g超軽量レインコート。ハーネスの上に5秒で着用可能。自分のポケットにコンパクトに収納。',
    '120g ultraleichter Regenmantel für plötzliche Schauer. In 5 Sekunden über das Geschirr zu streifen. Faltet sich in die eigene Tasche.',
    48000, 37.00, 5200, 33.00,
    '20D 나일론 립스톱 (발수 DWR 가공)', '손세탁 또는 세탁망 사용, 건조기 금지', 120,
    '/mock/products/spot-raincoat-01-thumb.jpg',
    '["/mock/products/spot-raincoat-01-1.jpg","/mock/products/spot-raincoat-01-2.jpg"]',
    'ACTIVE', FALSE, 520, 13, 4.6,
    '2026-03-05T00:00:00Z', '2026-03-03T00:00:00Z', '2026-03-25T00:00:00Z'
  ),
  (
    '7b5b9e8f-b11e-5a1c-a473-3e72363332e7', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'foldable-reflective-raincoat',
    '폴더블 리플렉티브 레인코트', 'Foldable Reflective Raincoat', 'フォルダブルリフレクティブレインコート', 'Faltbarer Reflektor-Regenmantel',
    '접어서 소지 가능한 리플렉티브 레인코트. 리플렉티브 파이핑으로 야간 산책에도 안심. TPU 코팅으로 완전 방수.',
    'Foldable raincoat with reflective piping for safe night walks. TPU coating for full waterproofing.',
    '折りたたんで持ち運び可能なリフレクティブレインコート。リフレクティブパイピングで夜の散歩も安心。TPUコーティングで完全防水。',
    'Faltbarer Regenmantel mit Reflektorstreifen für Nachtspaziergänge. TPU-Beschichtung für volle Wasserdichtigkeit.',
    65000, 50.00, 7100, 45.00,
    'TPU 코팅 폴리에스터 + 리플렉티브 파이핑', '스폰지 닦기, 세탁기 사용 금지', 200,
    '/mock/products/foldable-raincoat-01-thumb.jpg',
    '["/mock/products/foldable-raincoat-01-1.jpg","/mock/products/foldable-raincoat-01-2.jpg"]',
    'ACTIVE', FALSE, 410, 10, 4.7,
    '2026-03-01T00:00:00Z', '2026-02-28T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    'ab007f6c-878e-53be-9b8c-f0e9b0aac621', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'detachable-hood-raincoat',
    '분리형 후드 레인코트', 'Detachable Hood Raincoat', '着脱式フードレインコート', 'Regenmantel mit abnehmbarer Kapuze',
    '후드 탈부착이 가능한 2-in-1 레인코트. 비 오는 날은 후드 부착, 흐린 날은 후드 분리. 대형견 머리 사이즈를 고려한 넉넉한 후드 개구부.',
    '2-in-1 raincoat with detachable hood. Rain day: hood on. Overcast day: hood off. Generous hood opening sized for large breed heads.',
    'フード着脱可能な2-in-1レインコート。雨の日はフード装着、曇りの日はフードなし。大型犬の頭のサイズを考慮した余裕のあるフード開口部。',
    '2-in-1-Regenmantel mit abnehmbarer Kapuze. Regentag: drauf. Bewölkter Tag: ab. Großzügige Kapuzenöffnung für große Hundeköpfe.',
    78000, 60.00, 8500, 54.00,
    'PU 코팅 폴리에스터 100% (후드 자석식 탈부착)', '스폰지 닦기, 세탁기 사용 금지', 340,
    '/mock/products/detachable-raincoat-01-thumb.jpg',
    '["/mock/products/detachable-raincoat-01-1.jpg","/mock/products/detachable-raincoat-01-2.jpg","/mock/products/detachable-raincoat-01-3.jpg"]',
    'ACTIVE', TRUE, 680, 17, 4.8,
    '2026-02-05T00:00:00Z', '2026-02-03T00:00:00Z', '2026-03-18T00:00:00Z'
  ),
  -- ── 기능성 (신규 카테고리, 5개) ──────────────────────────
  (
    'ae8b3fff-974d-5efe-9500-5751ae6df161', '64e6ad9a-ab43-5522-96c7-5724ae7c43ce', 'reflective-safety-vest',
    '리플렉티브 세이프티 조끼', 'Reflective Safety Vest', 'リフレクティブセーフティベスト', 'Reflektor-Sicherheitsweste',
    '교통사고 예방을 위한 형광 세이프티 조끼. EN ISO 20471 규격 리플렉티브 소재. 야간 산책·등산 시 차량에서 최소 300m 전방에서 식별 가능. 하네스 홀 내장.',
    'Hi-vis safety vest certified to EN ISO 20471 reflective standards. Visible from 300m in vehicle headlights during night walks. Built-in harness slot.',
    '交通事故防止のための蛍光セーフティベスト。EN ISO 20471規格反射素材。夜の散歩・登山時に車から最小300m前方で識別可能。ハーネスホール内蔵。',
    'Leuchtschutzweste nach EN ISO 20471 Reflexnorm. Im Fahrzeugscheinwerfer auf 300m sichtbar. Eingebauter Geschirr-Schlitz.',
    42000, 32.00, 4600, 29.00,
    '폴리에스터 100% (EN ISO 20471 리플렉티브 테이프)', '30도 이하 세탁기 세탁', 110,
    '/mock/products/safety-vest-01-thumb.jpg',
    '["/mock/products/safety-vest-01-1.jpg","/mock/products/safety-vest-01-2.jpg"]',
    'ACTIVE', FALSE, 490, 12, 4.9,
    '2026-03-01T00:00:00Z', '2026-02-28T00:00:00Z', '2026-03-22T00:00:00Z'
  ),
  (
    '817302fe-f7d3-5e3d-a90f-25c7323385c8', '64e6ad9a-ab43-5522-96c7-5724ae7c43ce', 'buoyancy-swim-vest',
    '부력 수영 조끼', 'Buoyancy Swim Vest', '浮力スイムベスト', 'Auftriebsschwimmweste',
    '수영을 좋아하는 대형견을 위한 부력 조끼. 래브라도·골든리트리버의 강한 발차기를 방해하지 않는 전방 부력 폼 배치. 구조용 손잡이 내장.',
    'Buoyancy vest for water-loving large breeds. Front-weighted foam placement won''t interfere with the powerful kick of Labs and Goldens. Built-in rescue handle.',
    '泳ぎが好きな大型犬のための浮力ベスト。ラブラドールやゴールデンの強い足けりを妨げないフロント重心の浮力フォーム配置。レスキューハンドル内蔵。',
    'Auftriebsweste für wasserliebende Großhunde. Vorne gewichtete Schaumstoffanordnung. Eingebauter Rettungsgriff.',
    95000, 73.00, 10400, 66.00,
    '나일론 + EVA 부력 폼 / 안감: 메쉬', '30도 이하 손세탁, 응달 건조', 480,
    '/mock/products/swim-vest-01-thumb.jpg',
    '["/mock/products/swim-vest-01-1.jpg","/mock/products/swim-vest-01-2.jpg","/mock/products/swim-vest-01-3.jpg"]',
    'ACTIVE', TRUE, 720, 20, 4.8,
    '2026-03-15T00:00:00Z', '2026-03-13T00:00:00Z', '2026-04-01T00:00:00Z'
  ),
  (
    'c1e97534-1bc5-55a7-af8c-92587d41755e', '64e6ad9a-ab43-5522-96c7-5724ae7c43ce', 'uv-cooling-sport-vest',
    'UV 쿨링 스포츠 조끼', 'UV Cooling Sport Vest', 'UVクーリングスポーツベスト', 'UV-Kühlsportweste',
    '여름 운동을 위한 UPF 50+ 쿨링 스포츠 조끼. 오픈 배 디자인으로 복부 과열 방지. 보더콜리·오스트레일리안 캐틀독 등 고운동 견종 전용.',
    'UPF 50+ cooling sport vest for summer workouts. Open belly design prevents abdominal overheating. For high-drive breeds like Border Collies and Australian Cattle Dogs.',
    '夏のエクササイズ用UPF50+クーリングスポーツベスト。オープンベリーデザインで腹部の過熱を防ぐ。ボーダーコリーやオーストラリアンキャトルドッグなど高運動犬種専用。',
    'UPF 50+ Kühlsportweste für sommerliche Bewegung. Offenes Bauchdesign verhindert Überhitzung. Für hochaktive Rassen wie Border Collies.',
    48000, 37.00, 5200, 33.00,
    '폴리에스터 90% + 쿨링 기능사 10% (오픈 메쉬 복부 패널)', '30도 이하 세탁기 약세탁', 130,
    '/mock/products/uv-sport-vest-01-thumb.jpg',
    '["/mock/products/uv-sport-vest-01-1.jpg","/mock/products/uv-sport-vest-01-2.jpg"]',
    'ACTIVE', FALSE, 380, 9, 4.6,
    '2026-03-18T00:00:00Z', '2026-03-16T00:00:00Z', '2026-04-02T00:00:00Z'
  ),
  (
    'a0aaad7e-cead-5618-8506-c87a87a11b4c', '64e6ad9a-ab43-5522-96c7-5724ae7c43ce', 'joint-protect-jacket',
    '관절 보호 재킷', 'Joint Protect Jacket', '関節保護ジャケット', 'Gelenk-Schutzjacke',
    '관절염·고관절 이형성증이 있는 시니어 대형견을 위한 보호 재킷. 세라믹 인프라레드 원사로 관절 부위 혈액 순환 촉진. 수의사 추천 제품.',
    'Supportive jacket for senior large dogs with arthritis or hip dysplasia. Ceramic infrared yarn promotes circulation around joint areas. Veterinarian-recommended.',
    '関節炎や股関節形成不全のあるシニア大型犬のためのサポートジャケット。セラミック赤外線糸で関節周辺の血行を促進。獣医師推薦。',
    'Stützjacke für ältere Großhunde mit Arthritis oder Hüftdysplasie. Keramik-Infrarot-Garn fördert die Durchblutung im Gelenkbereich. Von Tierärzten empfohlen.',
    115000, 88.00, 12600, 80.00,
    '세라믹 인프라레드 기능사 40% / 울 30% / 스판덱스 30%', '30도 이하 울 코스 손세탁', 320,
    '/mock/products/joint-jacket-01-thumb.jpg',
    '["/mock/products/joint-jacket-01-1.jpg","/mock/products/joint-jacket-01-2.jpg"]',
    'ACTIVE', TRUE, 850, 23, 4.9,
    '2026-02-10T00:00:00Z', '2026-02-08T00:00:00Z', '2026-03-28T00:00:00Z'
  ),
  (
    '04e507e4-de01-56bb-9669-72f72522cf3c', '64e6ad9a-ab43-5522-96c7-5724ae7c43ce', 'cooling-mat-vest',
    '쿨링 매트 조끼', 'Cooling Mat Vest', 'クーリングマットベスト', 'Kühlmattenweste',
    '물에 적신 후 입히는 쿨링 매트 조끼. 증발 냉각 원리로 체온을 2~3도 낮춰줌. 더운 지역 대형견 필수템. 래브라도·셰퍼드·골든 모두 OK.',
    'Wet-and-wear cooling mat vest. Evaporative cooling lowers core temperature by 2-3°C. A must-have in warm climates for Labs, Shepherds, and Goldens alike.',
    '水に浸して着せるクーリングマットベスト。蒸発冷却原理で体温を2〜3度下げる。暑い地域の大型犬の必需品。ラブラドール・シェパード・ゴールデン全て対応。',
    'Nass-anlegen-Kühlweste. Verdunstungskühlung senkt die Körperkerntemperatur um 2-3°C. In warmen Klimazonen unverzichtbar.',
    52000, 40.00, 5700, 36.00,
    'PVA 쿨링 소재 + 메쉬 패널', '세탁 금지, 물에 5분 담근 후 착용', 180,
    '/mock/products/cooling-mat-vest-01-thumb.jpg',
    '["/mock/products/cooling-mat-vest-01-1.jpg","/mock/products/cooling-mat-vest-01-2.jpg"]',
    'ACTIVE', FALSE, 560, 15, 4.7,
    '2026-03-20T00:00:00Z', '2026-03-18T00:00:00Z', '2026-04-05T00:00:00Z'
  ),
  -- ── 액세서리 추가 (4개) ──────────────────────────────────
  (
    'ae1f9451-94b0-5bf0-b92e-7bc7c656caf1', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'knit-neckwarmer',
    '니트 넥워머', 'Knit Neck Warmer', 'ニットネックウォーマー', 'Strick-Halswärmer',
    '목 부위를 따뜻하게 감싸는 대형견용 니트 넥워머. 신축성 있는 리브 니트로 어떤 목 사이즈에도 편안하게 착용. 단독 또는 아우터와 레이어드.',
    'Knit neck warmer for large breeds. Stretchy rib knit for a comfortable fit on any neck size. Wear solo or layer under outerwear.',
    '大型犬の首周りを温めるニットネックウォーマー。伸縮性のあるリブニットでどんな首のサイズにも快適に着用。単体でもアウターとのレイヤードでも。',
    'Strick-Halswärmer für große Hunde. Dehnbarer Rippenstrick für jede Halsbreite. Solo oder als Layer unter Oberbekleidung.',
    22000, 17.00, 2400, 15.00,
    '아크릴 80% / 울 20% 리브 니트', '30도 이하 울 코스 세탁', 80,
    '/mock/products/neckwarmer-01-thumb.jpg',
    '["/mock/products/neckwarmer-01-1.jpg","/mock/products/neckwarmer-01-2.jpg"]',
    'ACTIVE', FALSE, 340, 8, 4.7,
    '2026-01-25T00:00:00Z', '2026-01-22T00:00:00Z', '2026-03-10T00:00:00Z'
  ),
  (
    '1f4902ff-100b-55eb-91a5-1bb14c327c48', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'waterproof-boots-set',
    '방수 부츠 4개 세트', 'Waterproof Boots Set (4pcs)', '防水ブーツ4個セット', 'Wasserdichte Stiefel 4er-Set',
    '대형견 발 사이즈를 위한 방수 부츠 4개 세트. 반사 스트랩으로 야간 안전성 확보. 그레이트데인·세인트버나드의 넓은 발 폭을 고려한 와이드 베이스.',
    'Waterproof boots set of 4 for large breed paw sizes. Reflective straps for night visibility. Wide base fits the broad paws of Great Danes and Saint Bernards.',
    '大型犬の足サイズ対応防水ブーツ4個セット。反射ストラップで夜間安全性を確保。グレートデインやセントバーナードの広い足幅に対応したワイドベース。',
    'Wasserdichte Stiefel 4er-Set für große Hundepfoten. Reflektierende Riemen für Nachtsichtbarkeit. Breite Sohle für Deutsche Doggen und Bernhardiner.',
    68000, 52.00, 7400, 47.00,
    '천연고무 밑창 + 방수 나일론 상단 (반사 스트랩)', '물로 세척, 건조 보관', 520,
    '/mock/products/boots-set-01-thumb.jpg',
    '["/mock/products/boots-set-01-1.jpg","/mock/products/boots-set-01-2.jpg"]',
    'ACTIVE', FALSE, 290, 7, 4.5,
    '2026-03-10T00:00:00Z', '2026-03-08T00:00:00Z', '2026-03-28T00:00:00Z'
  ),
  (
    'fb2710d1-4473-5162-b9f4-bbb3e9f64116', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'large-dog-scarf',
    '대형견 스카프', 'Large Dog Scarf', '大型犬スカーフ', 'Schal für große Hunde',
    '캐시미어 블렌드 대형견 스카프. 목 사이즈 54~70cm를 커버하는 넉넉한 길이. 매는 방식에 따라 다양한 스타일 연출 가능.',
    'Cashmere-blend large dog scarf. Generous length covers neck sizes 54-70cm. Style multiple ways depending on how you tie it.',
    'カシミヤ混紡大型犬スカーフ。首サイズ54〜70cmをカバーする余裕の長さ。結び方次第でさまざまなスタイルが楽しめる。',
    'Kaschmir-Mischstoff-Schal für große Hunde. Großzügige Länge für Halsgrößen 54-70cm. Verschiedene Stile je nach Knüpfart.',
    28000, 21.00, 3000, 19.00,
    '캐시미어 20% / 울 30% / 아크릴 50%', '30도 이하 울 코스 손세탁', 60,
    '/mock/products/scarf-01-thumb.jpg',
    '["/mock/products/scarf-01-1.jpg","/mock/products/scarf-01-2.jpg"]',
    'ACTIVE', FALSE, 260, 6, 4.6,
    '2026-02-01T00:00:00Z', '2026-01-30T00:00:00Z', '2026-03-05T00:00:00Z'
  ),
  (
    '6567a9a6-3e16-52e5-bba7-a74904373d78', '64e6ad9a-ab43-5522-96c7-5724ae7c43ce', 'belly-wrap-support',
    '배 받침 서포트', 'Belly Wrap Support', 'ベリーラップサポート', 'Bauchwickel-Stütze',
    '복부 수술 후 회복 중인 대형견을 위한 복대형 서포트. 의료용 나일론 메쉬 소재로 통기성 우수. 벨크로 조절로 배 사이즈에 맞게 핏 조정.',
    'Belly wrap support for large dogs recovering from abdominal surgery. Medical-grade nylon mesh for breathability. Velcro adjustment for a precise belly fit.',
    '腹部手術から回復中の大型犬のためのベルトタイプサポート。医療用ナイロンメッシュ素材で通気性優秀。ベルクロ調整でお腹のサイズに合わせてフィット調整。',
    'Bauchstütze für große Hunde nach Bauchoperationen. Medizinisches Nylongeflecht für Atmungsaktivität. Klettverschluss für präzise Passform.',
    55000, 42.00, 6000, 38.00,
    '의료용 나일론 메쉬 + 벨크로 스트랩', '30도 이하 손세탁', 140,
    '/mock/products/belly-wrap-01-thumb.jpg',
    '["/mock/products/belly-wrap-01-1.jpg","/mock/products/belly-wrap-01-2.jpg"]',
    'ACTIVE', FALSE, 180, 4, 4.8,
    '2026-03-25T00:00:00Z', '2026-03-23T00:00:00Z', '2026-04-05T00:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 4. Product Options (상품 옵션 — 사이즈 × 색상 × 재고)
-- ─────────────────────────────────────────────────────────────
INSERT INTO product_options (
  id, product_id, size_id,
  color, color_hex, sku,
  additional_price_krw, additional_price_usd, additional_price_jpy, additional_price_eur,
  stock, low_stock_threshold, is_active, created_at, updated_at
)
VALUES
  -- 패딩 코트 (브라운)
  ('f0d99354-be5f-54c6-9362-142462d378e1', '3126f906-588b-574c-b020-38ad8798aa75', '36252ef7-d454-59b9-92af-4b6deec37a73', '브라운', '#8B6347', 'PC01-L-BRN',  0,     0,   0,   0,   12, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  ('e97a3b7b-82ff-5677-8acf-3bc44955a964', '3126f906-588b-574c-b020-38ad8798aa75', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '브라운', '#8B6347', 'PC01-XL-BRN', 5000,  4,   550, 3.5,  8, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  ('f0b58929-9acf-5577-ab4c-93553b91e88d', '3126f906-588b-574c-b020-38ad8798aa75', '36c6a84b-1cde-55c5-912c-0f7d657116e5', '브라운', '#8B6347', 'PC01-2XL-BRN',10000, 8,   1100,7,    4, 3, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  -- 패딩 코트 (네이비)
  ('45805525-0d11-5f5e-be45-d3728755e24b', '3126f906-588b-574c-b020-38ad8798aa75', '36252ef7-d454-59b9-92af-4b6deec37a73', '네이비', '#1B2A4A', 'PC01-L-NVY',  0,     0,   0,   0,   15, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  ('05158890-d966-5e72-a724-6d45dca99755', '3126f906-588b-574c-b020-38ad8798aa75', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '네이비', '#1B2A4A', 'PC01-XL-NVY', 5000,  4,   550, 3.5, 10, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  -- 윈드브레이커 (블랙)
  ('22aa60d3-a23f-50a1-ab54-3cba079da32d', '5b604cf4-1501-5fd5-8f01-6eae06b36fef', '36252ef7-d454-59b9-92af-4b6deec37a73', '블랙',   '#1A1A1A', 'WB01-L-BLK',  0,     0,   0,   0,   10, 5, TRUE, '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z'),
  ('de0e339f-296c-5d6a-bf17-6f4b763858a5', '5b604cf4-1501-5fd5-8f01-6eae06b36fef', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '블랙',   '#1A1A1A', 'WB01-XL-BLK', 3000,  2.5, 350, 2,    8, 3, TRUE, '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z'),
  ('6b35abc9-672d-556d-a3cd-f065695123e1', '5b604cf4-1501-5fd5-8f01-6eae06b36fef', '36252ef7-d454-59b9-92af-4b6deec37a73', '올리브', '#6B7C45', 'WB01-L-OLV',  0,     0,   0,   0,    7, 3, TRUE, '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z'),
  -- 플리스 후디 (라이트그레이)
  ('ecb5dfae-def3-5569-be2f-02efc9c61d24', '0e21d901-8144-50d2-94d2-8f737dc85967', '36252ef7-d454-59b9-92af-4b6deec37a73', '라이트그레이', '#D3D3D3', 'FH01-L-LGR',  0,    0,   0,   0,   20, 5, TRUE, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('3ef8c543-9f87-596f-891b-0a5a21c29547', '0e21d901-8144-50d2-94d2-8f737dc85967', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '라이트그레이', '#D3D3D3', 'FH01-XL-LGR', 3000, 2.5, 350, 2,   14, 5, TRUE, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('ca97dcca-b62e-5f6e-9a11-677b553051f0', '0e21d901-8144-50d2-94d2-8f737dc85967', '36c6a84b-1cde-55c5-912c-0f7d657116e5', '라이트그레이', '#D3D3D3', 'FH01-2XL-LGR',7000, 5.5, 750, 5,    6, 3, TRUE, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  -- 스트라이프 티셔츠
  ('07d2ddaa-1d92-5ed1-b6fd-717d192a9b58', 'fa943045-1857-521e-80ab-bff58fa352d2', '36252ef7-d454-59b9-92af-4b6deec37a73', '화이트', '#FFFFFF', 'ST01-L-WHT',  0,    0,   0,   0,   15, 5, TRUE, '2026-03-10T00:00:00Z', '2026-03-10T00:00:00Z'),
  ('ced3b280-034f-53bc-82ff-0b2c9e0892bc', 'fa943045-1857-521e-80ab-bff58fa352d2', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '화이트', '#FFFFFF', 'ST01-XL-WHT', 2000, 1.5, 250, 1.5, 10, 5, TRUE, '2026-03-10T00:00:00Z', '2026-03-10T00:00:00Z'),
  -- 클래식 니트 올인원
  ('11178a8e-ed75-5af2-8917-876dd8225597', 'd30f9e7e-d828-5b3d-8bfd-e663b92b2007', '36252ef7-d454-59b9-92af-4b6deec37a73', '크림',   '#FFF5E1', 'OP01-L-CRM',  0,    0,   0,   0,   16, 5, TRUE, '2026-02-05T00:00:00Z', '2026-02-05T00:00:00Z'),
  ('1f240f10-aa81-5baa-9a4f-197d547d9c58', 'd30f9e7e-d828-5b3d-8bfd-e663b92b2007', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '크림',   '#FFF5E1', 'OP01-XL-CRM', 4000, 3,   450, 2.5,  8, 5, TRUE, '2026-02-05T00:00:00Z', '2026-02-05T00:00:00Z'),
  -- 레인코트 (옐로우)
  ('6ad99b57-3c02-5341-bb4f-cb661875c47e', '590dd0aa-4719-5e00-9cb8-6747c5b36531', '36252ef7-d454-59b9-92af-4b6deec37a73', '옐로우', '#FFD700', 'RC01-L-YLW',  0,    0,   0,   0,   18, 5, TRUE, '2026-01-25T00:00:00Z', '2026-01-25T00:00:00Z'),
  ('65006dfd-3c77-5e52-bf9b-970b90afde5e', '590dd0aa-4719-5e00-9cb8-6747c5b36531', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '옐로우', '#FFD700', 'RC01-XL-YLW', 5000, 4,   550, 3.5,  9, 5, TRUE, '2026-01-25T00:00:00Z', '2026-01-25T00:00:00Z'),
  ('fa192068-7a4c-5563-b6e3-5fa53778d6c0', '590dd0aa-4719-5e00-9cb8-6747c5b36531', '36252ef7-d454-59b9-92af-4b6deec37a73', '투명',   '#E8F4F8', 'RC01-L-CLR',  0,    0,   0,   0,   12, 5, TRUE, '2026-01-25T00:00:00Z', '2026-01-25T00:00:00Z'),
  -- 반다나 (다양한 색상 — 사이즈 없음, size-l 기준)
  ('c611fd6d-5613-5e06-be13-d9884948f8c0', '4b22e14e-8349-5574-9d47-e575a0285040', '36252ef7-d454-59b9-92af-4b6deec37a73', '레드 체크',      '#CC2222', 'BD01-OS-RED', 0, 0, 0, 0, 30, 10, TRUE, '2026-02-10T00:00:00Z', '2026-02-10T00:00:00Z'),
  ('daa454c5-0660-5624-9a7e-ced6817320e5', '4b22e14e-8349-5574-9d47-e575a0285040', '36252ef7-d454-59b9-92af-4b6deec37a73', '블루 스트라이프', '#2255CC', 'BD01-OS-BLU', 0, 0, 0, 0, 25, 10, TRUE, '2026-02-10T00:00:00Z', '2026-02-10T00:00:00Z'),
  -- 하네스 커버
  ('35860af7-c173-51c6-9b3d-634e097e61e7', '7f29375a-c0ea-5c91-8819-95ff8728ae51', '36252ef7-d454-59b9-92af-4b6deec37a73', '블랙', '#1A1A1A', 'HC01-L-BLK', 0,    0,   0,   0,   8, 3, TRUE, '2026-02-25T00:00:00Z', '2026-02-25T00:00:00Z'),
  ('522a62d7-22d7-5e5a-a775-c03613b33ffb', '7f29375a-c0ea-5c91-8819-95ff8728ae51', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '블랙', '#1A1A1A', 'HC01-XL-BLK',3000, 2.5, 350, 2,   5, 3, TRUE, '2026-02-25T00:00:00Z', '2026-02-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;
