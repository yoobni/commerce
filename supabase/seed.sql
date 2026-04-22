-- ============================================================
-- RAVI Commerce — Seed Data
-- 다국어(ko/en/ja/de) 카테고리·사이즈·상품 초기 데이터
-- ============================================================
-- Usage: supabase db reset (runs migrations + this seed)
--        or: psql $DATABASE_URL < supabase/seed.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Sizes (사이즈 기준표)
-- ─────────────────────────────────────────────────────────────
INSERT INTO sizes (id, label, chest_cm_min, chest_cm_max, back_length_cm_min, back_length_cm_max, neck_cm_min, neck_cm_max, weight_kg_min, weight_kg_max, breed_examples, sort_order, created_at)
VALUES
  ('size-s',   'S',   50, 58,  38, 44,  30, 36,  15, 22, '["보더콜리","시바이누","비글"]',                             1, '2026-01-01T00:00:00Z'),
  ('size-m',   'M',   58, 68,  44, 52,  36, 44,  22, 32, '["허스키","달마시안","사모예드"]',                           2, '2026-01-01T00:00:00Z'),
  ('size-l',   'L',   68, 78,  52, 60,  44, 52,  32, 42, '["골든리트리버","래브라도리트리버","아키타"]',               3, '2026-01-01T00:00:00Z'),
  ('size-xl',  'XL',  78, 90,  60, 70,  52, 60,  42, 55, '["저먼셰퍼드","로트와일러","도베르만"]',                     4, '2026-01-01T00:00:00Z'),
  ('size-2xl', '2XL', 90, 104, 70, 82,  60, 70,  55, 70, '["세인트버나드","버니즈마운틴독","뉴펀들랜드"]',             5, '2026-01-01T00:00:00Z'),
  ('size-3xl', '3XL', 104,120, 82, 96,  70, 82,  70, 90, '["그레이트데인","레오베르거"]',                              6, '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. Categories (카테고리 — 다국어)
-- ─────────────────────────────────────────────────────────────
INSERT INTO categories (id, parent_id, slug, name_ko, name_en, name_ja, name_de, sort_order, is_active, created_at)
VALUES
  ('cat-outer',       NULL, 'outer',       '아우터',     'Outerwear',  'アウター',         'Oberbekleidung', 1, TRUE, '2026-01-01T00:00:00Z'),
  ('cat-tops',        NULL, 'tops',        '상의',       'Tops',       'トップス',          'Oberteile',      2, TRUE, '2026-01-01T00:00:00Z'),
  ('cat-onepiece',    NULL, 'onepiece',    '올인원',     'One-piece',  'オールインワン',    'Overall',        3, TRUE, '2026-01-01T00:00:00Z'),
  ('cat-raincoat',    NULL, 'raincoat',    '레인코트',   'Raincoat',   'レインコート',      'Regenmantel',    4, TRUE, '2026-01-01T00:00:00Z'),
  ('cat-accessories', NULL, 'accessories', '액세서리',   'Accessories','アクセサリー',      'Zubehör',        5, TRUE, '2026-01-01T00:00:00Z')
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
    'prod-padded-coat-01', 'cat-outer', 'large-dog-padded-coat',
    '라지 독 패딩 코트', 'Large Dog Padded Coat', 'ラージドッグパデッドコート', 'Großhund-Steppmantel',
    '대형견을 위해 특별 설계된 따뜻한 패딩 코트. 방수 외피와 극세사 충전재로 한겨울에도 따뜻하게.',
    'Warmly padded coat specially designed for large dogs. Water-resistant outer shell with microfiber filling for warmth in winter.',
    '大型犬向けに特別設計されたウォームパデッドコート。撥水アウターシェルとマイクロファイバー充填材で冬でも暖かく。',
    'Warmer Steppmantel, speziell für große Hunde entwickelt. Wasserabweisende Außenhülle mit Mikrofaserfüllung für Wärme im Winter.',
    89000, 68.00, 9800, 62.00,
    '아우터: 폴리에스터 100% / 충전재: 폴리에스터 극세사', '30도 이하 손세탁 권장, 건조기 사용 금지', 420,
    '/mock/products/padded-coat-01-thumb.jpg',
    '["/mock/products/padded-coat-01-1.jpg","/mock/products/padded-coat-01-2.jpg","/mock/products/padded-coat-01-3.jpg"]',
    'ACTIVE', TRUE, 1240, 38, 4.7,
    '2026-01-15T00:00:00Z', '2026-01-10T00:00:00Z', '2026-03-01T00:00:00Z'
  ),
  (
    'prod-windbreaker-01', 'cat-outer', 'lightweight-windbreaker',
    '라이트웨이트 윈드브레이커', 'Lightweight Windbreaker', 'ライトウェイトウィンドブレーカー', 'Leichter Windbreaker',
    '가벼운 소재의 바람막이. 봄·가을 야외 활동에 최적화된 접이식 디자인.',
    'Lightweight windbreaker for outdoor activities. Packable design, ideal for spring and autumn.',
    '軽量素材のウィンドブレーカー。春・秋のアウトドア活動に最適なパッカブルデザイン。',
    'Leichter Windbreaker für Outdoor-Aktivitäten. Packbares Design, ideal für Frühling und Herbst.',
    55000, 42.00, 6000, 38.00,
    '나일론 100%', '손세탁 또는 30도 이하 세탁기 약세탁', 180,
    '/mock/products/windbreaker-01-thumb.jpg',
    '["/mock/products/windbreaker-01-1.jpg","/mock/products/windbreaker-01-2.jpg"]',
    'ACTIVE', FALSE, 430, 9, 4.4,
    '2026-03-01T00:00:00Z', '2026-02-20T00:00:00Z', '2026-03-15T00:00:00Z'
  ),
  -- ── 상의 ────────────────────────────────────────────────────
  (
    'prod-fleece-hoodie-01', 'cat-tops', 'cozy-fleece-hoodie',
    '코지 플리스 후디', 'Cozy Fleece Hoodie', 'コージーフリースフーディー', 'Gemütlicher Fleece-Hoodie',
    '부드러운 플리스 소재의 편안한 후디. 활동적인 대형견의 움직임을 방해하지 않는 넉넉한 핏.',
    'Comfortable hoodie made from soft fleece. Roomy fit that doesn''t restrict the movement of active large dogs.',
    '柔らかいフリース素材の快適なフーディー。活動的な大型犬の動きを妨げない余裕のあるフィット。',
    'Bequemer Hoodie aus weichem Fleece. Geräumige Passform, die die Bewegungsfreiheit aktiver großer Hunde nicht einschränkt.',
    59000, 45.00, 6500, 41.00,
    '폴리에스터 80% / 면 20%', '40도 이하 세탁, 뒤집어서 세탁 권장', 280,
    '/mock/products/fleece-hoodie-01-thumb.jpg',
    '["/mock/products/fleece-hoodie-01-1.jpg","/mock/products/fleece-hoodie-01-2.jpg"]',
    'ACTIVE', TRUE, 890, 24, 4.5,
    '2026-01-20T00:00:00Z', '2026-01-15T00:00:00Z', '2026-02-20T00:00:00Z'
  ),
  (
    'prod-stripe-tshirt-01', 'cat-tops', 'sporty-stripe-tshirt',
    '스포티 스트라이프 티셔츠', 'Sporty Stripe T-shirt', 'スポーティーストライプTシャツ', 'Sportliches Streifen-T-Shirt',
    '여름 산책용 스트라이프 티셔츠. 땀 흡수와 빠른 건조가 가능한 쿨링 소재.',
    'Stripe T-shirt for summer walks. Cooling fabric with moisture wicking and quick-dry properties.',
    '夏の散歩用ストライプTシャツ。汗を吸収しすぐに乾くクーリング素材。',
    'Streifen-T-Shirt für Sommerspaziergänge. Kühlstoff mit Feuchtigkeitsaufnahme und Schnelltrocknungseigenschaften.',
    38000, 29.00, 4100, 26.00,
    '폴리에스터 90% / 스판덱스 10%', '30도 이하 세탁기 세탁', 150,
    '/mock/products/stripe-tshirt-01-thumb.jpg',
    '["/mock/products/stripe-tshirt-01-1.jpg","/mock/products/stripe-tshirt-01-2.jpg"]',
    'ACTIVE', FALSE, 320, 7, 4.3,
    '2026-03-15T00:00:00Z', '2026-03-10T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  -- ── 올인원 ───────────────────────────────────────────────────
  (
    'prod-onepiece-01', 'cat-onepiece', 'classic-knit-onepiece',
    '클래식 니트 올인원', 'Classic Knit One-piece', 'クラシックニットオールインワン', 'Klassischer Strick-Overall',
    '부드러운 니트 소재의 올인원. 착용과 탈의가 쉬운 등부분 지퍼 설계.',
    'One-piece in soft knit fabric. Back zipper design for easy on and off.',
    '柔らかいニット素材のオールインワン。着脱しやすい背面ジッパーデザイン。',
    'Overall aus weichem Strickstoff. Rückenreißverschluss-Design für einfaches An- und Ausziehen.',
    65000, 50.00, 7100, 46.00,
    '아크릴 60% / 울 30% / 스판덱스 10%', '30도 이하 울 코스 세탁', 260,
    '/mock/products/onepiece-01-thumb.jpg',
    '["/mock/products/onepiece-01-1.jpg","/mock/products/onepiece-01-2.jpg"]',
    'ACTIVE', TRUE, 540, 12, 4.6,
    '2026-02-10T00:00:00Z', '2026-02-05T00:00:00Z', '2026-03-05T00:00:00Z'
  ),
  -- ── 레인코트 ─────────────────────────────────────────────────
  (
    'prod-raincoat-01', 'cat-raincoat', 'waterproof-adventure-raincoat',
    '어드벤처 방수 레인코트', 'Adventure Waterproof Raincoat', 'アドベンチャー防水レインコート', 'Adventure Wasserdichter Regenmantel',
    '완전 방수 처리된 레인코트. 후드 일체형 설계로 머리부터 꼬리까지 완벽한 보호.',
    'Fully waterproof raincoat. Integrated hood design for complete protection from head to tail.',
    '完全防水仕様のレインコート。フード一体型デザインで頭からしっぽまで完全保護。',
    'Vollständig wasserdichter Regenmantel. Integriertes Kapuzendesign für vollständigen Schutz von Kopf bis Schwanz.',
    72000, 55.00, 7900, 50.00,
    'PU 코팅 폴리에스터 100%', '스폰지로 닦아서 세척, 세탁기 사용 금지', 310,
    '/mock/products/raincoat-01-thumb.jpg',
    '["/mock/products/raincoat-01-1.jpg","/mock/products/raincoat-01-2.jpg","/mock/products/raincoat-01-3.jpg","/mock/products/raincoat-01-4.jpg"]',
    'ACTIVE', FALSE, 620, 15, 4.8,
    '2026-02-01T00:00:00Z', '2026-01-25T00:00:00Z', '2026-03-10T00:00:00Z'
  ),
  -- ── 액세서리 ─────────────────────────────────────────────────
  (
    'prod-bandana-01', 'cat-accessories', 'classic-cotton-bandana',
    '클래식 코튼 반다나', 'Classic Cotton Bandana', 'クラシックコットンバンダナ', 'Klassisches Baumwoll-Bandana',
    '100% 면 소재의 부드러운 반다나. 다양한 패턴으로 일상 스타일링에 포인트를.',
    '100% cotton soft bandana. Variety of patterns to add style to everyday looks.',
    '100%コットン素材の柔らかいバンダナ。さまざまなパターンで日常スタイリングにアクセントを。',
    '100 % Baumwoll-Bandana. Verschiedene Muster für den täglichen Styling-Akzent.',
    18000, 14.00, 1900, 13.00,
    '면 100%', '40도 이하 세탁기 세탁 가능', 40,
    '/mock/products/bandana-01-thumb.jpg',
    '["/mock/products/bandana-01-1.jpg","/mock/products/bandana-01-2.jpg"]',
    'ACTIVE', FALSE, 780, 31, 4.9,
    '2026-02-15T00:00:00Z', '2026-02-10T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    'prod-harness-cover-01', 'cat-accessories', 'padded-harness-cover',
    '패딩 하네스 커버', 'Padded Harness Cover', 'パデッドハーネスカバー', 'Gepolsterte Geschirrabdeckung',
    '하네스 위에 착용하는 패딩 커버. 마찰을 줄이고 체온을 유지합니다.',
    'Padded cover worn over harness. Reduces friction and retains body warmth.',
    'ハーネスの上に着用するパデッドカバー。摩擦を軽減し体温を保持します。',
    'Gepolsterte Abdeckung, die über das Geschirr getragen wird. Reduziert Reibung und hält die Körperwärme.',
    32000, 24.00, 3500, 22.00,
    '폴리에스터 100% (충전재: 극세사)', '30도 이하 손세탁', 120,
    '/mock/products/harness-cover-01-thumb.jpg',
    '["/mock/products/harness-cover-01-1.jpg","/mock/products/harness-cover-01-2.jpg"]',
    'ACTIVE', TRUE, 260, 5, 4.6,
    '2026-03-01T00:00:00Z', '2026-02-25T00:00:00Z', '2026-03-25T00:00:00Z'
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
  ('opt-pc01-l-brown',  'prod-padded-coat-01', 'size-l',  '브라운', '#8B6347', 'PC01-L-BRN',  0,     0,   0,   0,   12, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  ('opt-pc01-xl-brown', 'prod-padded-coat-01', 'size-xl', '브라운', '#8B6347', 'PC01-XL-BRN', 5000,  4,   550, 3.5,  8, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  ('opt-pc01-2xl-brown','prod-padded-coat-01', 'size-2xl','브라운', '#8B6347', 'PC01-2XL-BRN',10000, 8,   1100,7,    4, 3, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  -- 패딩 코트 (네이비)
  ('opt-pc01-l-navy',   'prod-padded-coat-01', 'size-l',  '네이비', '#1B2A4A', 'PC01-L-NVY',  0,     0,   0,   0,   15, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  ('opt-pc01-xl-navy',  'prod-padded-coat-01', 'size-xl', '네이비', '#1B2A4A', 'PC01-XL-NVY', 5000,  4,   550, 3.5, 10, 5, TRUE, '2026-01-10T00:00:00Z', '2026-01-10T00:00:00Z'),
  -- 윈드브레이커 (블랙)
  ('opt-wb01-l-black',  'prod-windbreaker-01', 'size-l',  '블랙',   '#1A1A1A', 'WB01-L-BLK',  0,     0,   0,   0,   10, 5, TRUE, '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z'),
  ('opt-wb01-xl-black', 'prod-windbreaker-01', 'size-xl', '블랙',   '#1A1A1A', 'WB01-XL-BLK', 3000,  2.5, 350, 2,    8, 3, TRUE, '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z'),
  ('opt-wb01-l-olive',  'prod-windbreaker-01', 'size-l',  '올리브', '#6B7C45', 'WB01-L-OLV',  0,     0,   0,   0,    7, 3, TRUE, '2026-02-20T00:00:00Z', '2026-02-20T00:00:00Z'),
  -- 플리스 후디 (라이트그레이)
  ('opt-fh01-l-gray',   'prod-fleece-hoodie-01', 'size-l',  '라이트그레이', '#D3D3D3', 'FH01-L-LGR',  0,    0,   0,   0,   20, 5, TRUE, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('opt-fh01-xl-gray',  'prod-fleece-hoodie-01', 'size-xl', '라이트그레이', '#D3D3D3', 'FH01-XL-LGR', 3000, 2.5, 350, 2,   14, 5, TRUE, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('opt-fh01-2xl-gray', 'prod-fleece-hoodie-01', 'size-2xl','라이트그레이', '#D3D3D3', 'FH01-2XL-LGR',7000, 5.5, 750, 5,    6, 3, TRUE, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  -- 스트라이프 티셔츠
  ('opt-st01-l-wht',    'prod-stripe-tshirt-01', 'size-l',  '화이트', '#FFFFFF', 'ST01-L-WHT',  0,    0,   0,   0,   15, 5, TRUE, '2026-03-10T00:00:00Z', '2026-03-10T00:00:00Z'),
  ('opt-st01-xl-wht',   'prod-stripe-tshirt-01', 'size-xl', '화이트', '#FFFFFF', 'ST01-XL-WHT', 2000, 1.5, 250, 1.5, 10, 5, TRUE, '2026-03-10T00:00:00Z', '2026-03-10T00:00:00Z'),
  -- 클래식 니트 올인원
  ('opt-op01-l-cream',  'prod-onepiece-01', 'size-l',  '크림',   '#FFF5E1', 'OP01-L-CRM',  0,    0,   0,   0,   16, 5, TRUE, '2026-02-05T00:00:00Z', '2026-02-05T00:00:00Z'),
  ('opt-op01-xl-cream', 'prod-onepiece-01', 'size-xl', '크림',   '#FFF5E1', 'OP01-XL-CRM', 4000, 3,   450, 2.5,  8, 5, TRUE, '2026-02-05T00:00:00Z', '2026-02-05T00:00:00Z'),
  -- 레인코트 (옐로우)
  ('opt-rc01-l-yellow', 'prod-raincoat-01', 'size-l',  '옐로우', '#FFD700', 'RC01-L-YLW',  0,    0,   0,   0,   18, 5, TRUE, '2026-01-25T00:00:00Z', '2026-01-25T00:00:00Z'),
  ('opt-rc01-xl-yellow','prod-raincoat-01', 'size-xl', '옐로우', '#FFD700', 'RC01-XL-YLW', 5000, 4,   550, 3.5,  9, 5, TRUE, '2026-01-25T00:00:00Z', '2026-01-25T00:00:00Z'),
  ('opt-rc01-l-clear',  'prod-raincoat-01', 'size-l',  '투명',   '#E8F4F8', 'RC01-L-CLR',  0,    0,   0,   0,   12, 5, TRUE, '2026-01-25T00:00:00Z', '2026-01-25T00:00:00Z'),
  -- 반다나 (다양한 색상 — 사이즈 없음, size-l 기준)
  ('opt-bd01-os-red',   'prod-bandana-01', 'size-l', '레드 체크',   '#CC2222', 'BD01-OS-RED', 0, 0, 0, 0, 30, 10, TRUE, '2026-02-10T00:00:00Z', '2026-02-10T00:00:00Z'),
  ('opt-bd01-os-blue',  'prod-bandana-01', 'size-l', '블루 스트라이프','#2255CC','BD01-OS-BLU', 0, 0, 0, 0, 25, 10, TRUE, '2026-02-10T00:00:00Z', '2026-02-10T00:00:00Z'),
  -- 하네스 커버
  ('opt-hc01-l-black',  'prod-harness-cover-01', 'size-l',  '블랙', '#1A1A1A', 'HC01-L-BLK', 0,    0,   0,   0,   8, 3, TRUE, '2026-02-25T00:00:00Z', '2026-02-25T00:00:00Z'),
  ('opt-hc01-xl-black', 'prod-harness-cover-01', 'size-xl', '블랙', '#1A1A1A', 'HC01-XL-BLK',3000, 2.5, 350, 2,   5, 3, TRUE, '2026-02-25T00:00:00Z', '2026-02-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;
