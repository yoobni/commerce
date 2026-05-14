-- ============================================================
-- 이미지 샘플 데이터 — 기존 8개 URL 교체 + 22개 신규 상품 추가
-- placedog.net: 대형견 도메인 특화 placeholder 서비스
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. 기존 8개 상품 이미지 URL 교체 (/mock/... → placedog.net)
-- ─────────────────────────────────────────────────────────────
UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=1',
  images = '["https://placedog.net/800/800?id=1","https://placedog.net/800/600?id=51","https://placedog.net/600/800?id=71"]'
WHERE slug = 'large-dog-padded-coat';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=2',
  images = '["https://placedog.net/800/800?id=2","https://placedog.net/800/600?id=52"]'
WHERE slug = 'lightweight-windbreaker';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=3',
  images = '["https://placedog.net/800/800?id=3","https://placedog.net/800/600?id=53"]'
WHERE slug = 'cozy-fleece-hoodie';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=4',
  images = '["https://placedog.net/800/800?id=4","https://placedog.net/800/600?id=54"]'
WHERE slug = 'sporty-stripe-tshirt';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=5',
  images = '["https://placedog.net/800/800?id=5","https://placedog.net/800/600?id=55"]'
WHERE slug = 'classic-knit-onepiece';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=6',
  images = '["https://placedog.net/800/800?id=6","https://placedog.net/800/600?id=56","https://placedog.net/600/800?id=76","https://placedog.net/800/800?id=86"]'
WHERE slug = 'waterproof-adventure-raincoat';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=7',
  images = '["https://placedog.net/800/800?id=7","https://placedog.net/800/600?id=57"]'
WHERE slug = 'classic-cotton-bandana';

UPDATE products SET
  thumbnail_url = 'https://placedog.net/400/400?id=8',
  images = '["https://placedog.net/800/800?id=8","https://placedog.net/800/600?id=58"]'
WHERE slug = 'padded-harness-cover';

-- ─────────────────────────────────────────────────────────────
-- 2. 신규 상품 22개 INSERT (아우터 +4, 상의 +4, 올인원 +3, 레인코트 +3, 액세서리 +8)
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
  -- ── 아우터 +4 ────────────────────────────────────────────────
  (
    'a1000001-0000-4000-a000-000000000001', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'heavy-winter-coat',
    '헤비 윈터 코트', 'Heavy Winter Coat', 'ヘビーウィンターコート', 'Schwerer Wintermantel',
    '극한 한파에도 견디는 초고밀도 충전재 코트. 허스키·말라뮤트 등 북방견에게도 최적.',
    'Ultra-dense filled coat for extreme cold. Ideal for northern breeds like Huskies and Malamutes.',
    '極寒にも耐える超高密度充填コート。ハスキーやマラミュートなどの北方犬にも最適。',
    'Mantel mit ultradichter Füllung für extreme Kälte. Ideal für Nordländische Rassen.',
    105000, 80.00, 11500, 73.00,
    '아우터: 나일론 100% / 충전재: 구스다운 80%·페더 20%', '드라이클리닝 권장', 560,
    'https://placedog.net/400/400?id=9',
    '["https://placedog.net/800/800?id=9","https://placedog.net/800/600?id=59"]',
    'ACTIVE', TRUE, 320, 6, 4.8,
    '2026-02-01T00:00:00Z', '2026-01-28T00:00:00Z', '2026-03-15T00:00:00Z'
  ),
  (
    'a1000002-0000-4000-a000-000000000002', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'quilted-puffer-vest',
    '퀄팅 패딩 베스트', 'Quilted Puffer Vest', 'キルティングパファーベスト', 'Gesteppte Steppweste',
    '앞다리를 자유롭게 두는 조끼형 패딩. 실내외 겸용, 다른 옷 위에 레이어링 가능.',
    'Vest-style padding that keeps front legs free. Layerable over other clothing, indoor/outdoor use.',
    '前脚を自由にするベスト型パディング。他の服の上にレイヤリング可能、室内外兼用。',
    'Westenstil-Polsterung für freie Vorderbeine. Über anderen Kleidungsstücken tragbar.',
    62000, 47.00, 6800, 43.00,
    '폴리에스터 100%', '30도 이하 세탁기 약세탁', 240,
    'https://placedog.net/400/400?id=10',
    '["https://placedog.net/800/800?id=10","https://placedog.net/800/600?id=60"]',
    'ACTIVE', FALSE, 180, 3, 4.3,
    '2026-03-10T00:00:00Z', '2026-03-05T00:00:00Z', '2026-04-01T00:00:00Z'
  ),
  (
    'a1000003-0000-4000-a000-000000000003', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'casual-bomber-jacket',
    '캐주얼 봄버 재킷', 'Casual Bomber Jacket', 'カジュアルボンバージャケット', 'Lässige Bomberjacke',
    '스트리트 감성의 봄버 재킷. 립 밴드 마감으로 체온 유지, 도시 산책에 최적.',
    'Street-style bomber jacket with rib band finish for warmth. Perfect for urban walks.',
    'ストリートスタイルのボンバージャケット。リブバンド仕上げで体温維持、都市の散歩に最適。',
    'Streetstyle-Bomberjacke mit Rippenband-Abschluss. Ideal für Stadtspaziergänge.',
    72000, 55.00, 7900, 50.00,
    '나일론 60% / 폴리에스터 40%', '30도 이하 세탁기 세탁', 280,
    'https://placedog.net/400/400?id=11',
    '["https://placedog.net/800/800?id=11","https://placedog.net/800/600?id=61"]',
    'ACTIVE', TRUE, 420, 11, 4.5,
    '2026-02-15T00:00:00Z', '2026-02-10T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    'a1000004-0000-4000-a000-000000000004', 'd3c419e9-c0dc-528f-9903-1db011bfdaec', 'fleece-lined-trench-coat',
    '플리스 라이닝 트렌치', 'Fleece-Lined Trench Coat', 'フリースライニングトレンチコート', 'Fleece-gefütterter Trenchcoat',
    '클래식 트렌치 실루엣에 안감 플리스를 더한 프리미엄 코트. 우천·추위 동시 대응.',
    'Premium coat with classic trench silhouette and fleece lining. Handles both rain and cold.',
    'クラシックトレンチシルエットにフリースライニングを加えたプレミアムコート。雨・寒さ両方に対応。',
    'Premium-Mantel mit klassischem Trench-Silhouette und Fleece-Futter.',
    98000, 75.00, 10800, 68.00,
    '아우터: 폴리에스터 100% / 안감: 폴리에스터 플리스', '드라이클리닝 권장', 480,
    'https://placedog.net/400/400?id=12',
    '["https://placedog.net/800/800?id=12","https://placedog.net/800/600?id=62","https://placedog.net/600/800?id=72"]',
    'ACTIVE', FALSE, 150, 2, 4.5,
    '2026-04-01T00:00:00Z', '2026-03-25T00:00:00Z', '2026-04-10T00:00:00Z'
  ),

  -- ── 상의 +4 ─────────────────────────────────────────────────
  (
    'a1000005-0000-4000-a000-000000000005', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'classic-polo-shirt',
    '클래식 폴로 셔츠', 'Classic Polo Shirt', 'クラシックポロシャツ', 'Klassisches Poloshirt',
    '단정한 카라 포인트의 폴로 셔츠. 공원 산책부터 반려동물 카페까지 어디서나 어울리는 스타일.',
    'Polo shirt with a neat collar. Versatile style from park walks to pet cafés.',
    '清潔感のあるカラーポイントのポロシャツ。公園の散歩からペットカフェまで.',
    'Poloshirt mit sauberem Kragenpunkt. Vielseitiger Stil.',
    45000, 34.00, 4900, 31.00,
    '면 100%', '40도 이하 세탁기 세탁', 160,
    'https://placedog.net/400/400?id=13',
    '["https://placedog.net/800/800?id=13","https://placedog.net/800/600?id=63"]',
    'ACTIVE', FALSE, 290, 8, 4.4,
    '2026-03-20T00:00:00Z', '2026-03-15T00:00:00Z', '2026-04-05T00:00:00Z'
  ),
  (
    'a1000006-0000-4000-a000-000000000006', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'chunky-knit-sweater',
    '청키 니트 스웨터', 'Chunky Knit Sweater', 'チャンキーニットセーター', 'Grob gestrickter Pullover',
    '두꺼운 케이블 니트 조직의 프리미엄 스웨터. 사진 찍기 좋은 포토제닉 텍스처.',
    'Premium sweater in thick cable knit. Photogenic texture that looks great in photos.',
    '厚みのあるケーブルニット組織のプレミアムセーター。フォトジェニックなテクスチャー。',
    'Premium-Pullover in dickem Kabelstrick. Fotogene Textur.',
    68000, 52.00, 7500, 47.00,
    '아크릴 55% / 울 35% / 나일론 10%', '30도 이하 울 코스 세탁', 300,
    'https://placedog.net/400/400?id=14',
    '["https://placedog.net/800/800?id=14","https://placedog.net/800/600?id=64"]',
    'ACTIVE', TRUE, 510, 14, 4.7,
    '2026-01-25T00:00:00Z', '2026-01-20T00:00:00Z', '2026-02-28T00:00:00Z'
  ),
  (
    'a1000007-0000-4000-a000-000000000007', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'athletic-tank-top',
    '애슬레틱 탱크탑', 'Athletic Tank Top', 'アスレチックタンクトップ', 'Sportliches Tanktop',
    '여름 운동·수영 후 착용에 최적인 메쉬 탱크탑. 신속 건조, 통기성 우수.',
    'Mesh tank top ideal for summer exercise and post-swim wear. Quick-dry and breathable.',
    '夏の運動・水泳後の着用に最適なメッシュタンクトップ。速乾・通気性抜群。',
    'Mesh-Tanktop ideal für Sommer-Sport. Schnelltrocknend und atmungsaktiv.',
    29000, 22.00, 3200, 20.00,
    '폴리에스터 90% / 스판덱스 10%', '30도 이하 세탁기 세탁', 100,
    'https://placedog.net/400/400?id=15',
    '["https://placedog.net/800/800?id=15","https://placedog.net/800/600?id=65"]',
    'ACTIVE', FALSE, 220, 5, 4.2,
    '2026-04-10T00:00:00Z', '2026-04-05T00:00:00Z', '2026-04-20T00:00:00Z'
  ),
  (
    'a1000008-0000-4000-a000-000000000008', 'aca034da-11b3-5250-b76f-d71a6866fab2', 'graphic-print-sweatshirt',
    '그래픽 프린트 맨투맨', 'Graphic Print Sweatshirt', 'グラフィックプリントスウェット', 'Grafik-Print-Sweatshirt',
    'RAVI DOG 시그니처 그래픽이 담긴 맨투맨. 대형견 실루엣 아트워크로 강아지 애호가 감성.',
    'Sweatshirt featuring RAVI DOG signature graphic. Large dog silhouette artwork for dog lovers.',
    'RAVI DOGシグネチャーグラフィック入りスウェット。大型犬シルエットアートワーク。',
    'Sweatshirt mit RAVI DOG Signatur-Grafik. Großhund-Silhouette für Hundeliebhaber.',
    52000, 40.00, 5700, 36.00,
    '면 80% / 폴리에스터 20%', '30도 이하 뒤집어서 세탁', 220,
    'https://placedog.net/400/400?id=16',
    '["https://placedog.net/800/800?id=16","https://placedog.net/800/600?id=66"]',
    'ACTIVE', TRUE, 680, 19, 4.6,
    '2026-02-20T00:00:00Z', '2026-02-15T00:00:00Z', '2026-03-25T00:00:00Z'
  ),

  -- ── 올인원 +3 ────────────────────────────────────────────────
  (
    'a1000009-0000-4000-a000-000000000009', 'c7920edf-0c06-58d8-9c5a-a616da04bd8b', 'denim-overall-onepiece',
    '데님 오버롤 올인원', 'Denim Overall One-piece', 'デニムオーバーオール', 'Denim-Overall',
    '스트레치 데님 소재의 사랑스러운 멜빵 올인원. 단추 탈착으로 화장실 이용 편리.',
    'Adorable dungaree one-piece in stretch denim. Button-release for easy bathroom access.',
    'ストレッチデニム素材の可愛いサロペットオールインワン。ボタン着脱でトイレも便利。',
    'Süßer Latzhosen-Overall aus Stretch-Denim. Knopfverschluss für bequeme Toilettengänge.',
    75000, 57.00, 8200, 52.00,
    '코튼 65% / 폴리에스터 33% / 스판덱스 2%', '30도 이하 세탁기 세탁, 뒤집어서', 290,
    'https://placedog.net/400/400?id=17',
    '["https://placedog.net/800/800?id=17","https://placedog.net/800/600?id=67"]',
    'ACTIVE', TRUE, 390, 10, 4.5,
    '2026-03-05T00:00:00Z', '2026-03-01T00:00:00Z', '2026-04-05T00:00:00Z'
  ),
  (
    'a1000010-0000-4000-a000-000000000010', 'c7920edf-0c06-58d8-9c5a-a616da04bd8b', 'floral-print-romper',
    '플로럴 프린트 롬퍼', 'Floral Print Romper', 'フローラルプリントロンパー', 'Blumendruck-Romper',
    '봄·여름 한정 꽃무늬 롬퍼. 가볍고 시원한 소재로 더운 날씨에도 쾌적.',
    'Spring/summer limited floral romper. Lightweight cool fabric for hot weather comfort.',
    '春夏限定の花柄ロンパー。軽くて涼しい素材で暑い日でも快適。',
    'Frühjahr/Sommer limitierter Blumendruck-Romper. Leichter kühler Stoff.',
    48000, 37.00, 5300, 33.00,
    '면 100%', '30도 이하 손세탁', 160,
    'https://placedog.net/400/400?id=18',
    '["https://placedog.net/800/800?id=18","https://placedog.net/800/600?id=68"]',
    'ACTIVE', FALSE, 230, 4, 4.4,
    '2026-04-15T00:00:00Z', '2026-04-10T00:00:00Z', '2026-04-25T00:00:00Z'
  ),
  (
    'a1000011-0000-4000-a000-000000000011', 'c7920edf-0c06-58d8-9c5a-a616da04bd8b', 'utility-cargo-jumpsuit',
    '유틸리티 카고 점프수트', 'Utility Cargo Jumpsuit', 'ユーティリティカーゴジャンプスーツ', 'Utility-Cargo-Jumpsuit',
    '카고 주머니 디테일의 활동적인 점프수트. 등산·캠핑 등 야외 활동에 특화.',
    'Active jumpsuit with cargo pocket details. Specialized for hiking and camping outdoors.',
    'カーゴポケットディテールのアクティブなジャンプスーツ。登山・キャンプなど野外活動に特化。',
    'Aktiver Jumpsuit mit Cargo-Taschen-Details. Für Wandern und Camping.',
    82000, 63.00, 9000, 57.00,
    '나일론 70% / 폴리에스터 30%', '30도 이하 세탁기 세탁', 320,
    'https://placedog.net/400/400?id=19',
    '["https://placedog.net/800/800?id=19","https://placedog.net/800/600?id=69"]',
    'ACTIVE', FALSE, 170, 3, 4.6,
    '2026-04-01T00:00:00Z', '2026-03-28T00:00:00Z', '2026-04-15T00:00:00Z'
  ),

  -- ── 레인코트 +3 ──────────────────────────────────────────────
  (
    'a1000012-0000-4000-a000-000000000012', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'poncho-style-raincoat',
    '판초형 레인코트', 'Poncho-Style Raincoat', 'ポンチョスタイルレインコート', 'Poncho-Regenmantel',
    '입히기 가장 쉬운 판초형 디자인. 벨크로 한 번으로 착용 완료, 강아지 스트레스 최소화.',
    'Easiest-to-wear poncho design. One velcro step to put on, minimizing stress for dogs.',
    '着せやすいポンチョデザイン。マジックテープ一つで着用完了、犬のストレス最小化。',
    'Einfachstes Poncho-Design. Ein Klettverschluss zum Anziehen, minimaler Stress für den Hund.',
    58000, 44.00, 6400, 40.00,
    'TPU 코팅 나일론', '스폰지로 닦아서 세척', 220,
    'https://placedog.net/400/400?id=20',
    '["https://placedog.net/800/800?id=20","https://placedog.net/800/600?id=70"]',
    'ACTIVE', TRUE, 480, 16, 4.7,
    '2026-03-01T00:00:00Z', '2026-02-25T00:00:00Z', '2026-03-20T00:00:00Z'
  ),
  (
    'a1000013-0000-4000-a000-000000000013', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'clear-transparent-raincoat',
    '클리어 투명 레인코트', 'Clear Transparent Raincoat', 'クリア透明レインコート', 'Klarer transparenter Regenmantel',
    '투명 소재로 강아지 패션을 가리지 않는 레인코트. 야간 산책 시 반사 테이프 부착.',
    'Transparent raincoat that doesn''t hide your dog''s outfit. Reflective tape for night walks.',
    '透明素材で犬のファッションを隠さないレインコート。夜間の散歩に反射テープ付き。',
    'Transparenter Regenmantel, der das Outfit des Hundes nicht verbirgt. Reflektierendes Band.',
    65000, 50.00, 7100, 45.00,
    '투명 PVC', '스폰지로 닦아서 세척, 직사광선 보관 금지', 260,
    'https://placedog.net/400/400?id=21',
    '["https://placedog.net/800/800?id=21","https://placedog.net/800/600?id=71"]',
    'ACTIVE', FALSE, 310, 8, 4.5,
    '2026-03-15T00:00:00Z', '2026-03-10T00:00:00Z', '2026-04-01T00:00:00Z'
  ),
  (
    'a1000014-0000-4000-a000-000000000014', 'a9f99a69-d18a-5810-88fc-f04641a4714e', 'fleece-lined-rain-jacket',
    '플리스 라이닝 레인 재킷', 'Fleece-Lined Rain Jacket', 'フリースライニングレインジャケット', 'Fleece-gefütterte Regenjacke',
    '비와 추위를 동시에 막는 플리스 안감 레인 재킷. 3계절(봄·가을·겨울 초입) 대응.',
    'Fleece-lined rain jacket that blocks both rain and cold. Suitable for 3 seasons.',
    '雨と寒さを同時に防ぐフリースライニングレインジャケット。3シーズン(春·秋·冬初め)対応。',
    'Fleece-gefütterte Regenjacke für Regen und Kälte. Geeignet für 3 Jahreszeiten.',
    85000, 65.00, 9300, 59.00,
    '아우터: PU 코팅 폴리에스터 / 안감: 폴리에스터 플리스', '드라이클리닝 또는 스폰지 세척', 400,
    'https://placedog.net/400/400?id=22',
    '["https://placedog.net/800/800?id=22","https://placedog.net/800/600?id=72","https://placedog.net/600/800?id=82"]',
    'ACTIVE', TRUE, 260, 7, 4.6,
    '2026-02-10T00:00:00Z', '2026-02-05T00:00:00Z', '2026-03-05T00:00:00Z'
  ),

  -- ── 액세서리 +8 ──────────────────────────────────────────────
  (
    'a1000015-0000-4000-a000-000000000015', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'knit-dog-beanie',
    '니트 도그 비니', 'Knit Dog Beanie', 'ニットドッグビーニー', 'Hunde-Strickmütze',
    '귀를 따뜻하게 감싸는 니트 비니. 귀 구멍 위치 조절 가능, 대형견 두상 맞춤.',
    'Knit beanie that warms the ears. Adjustable ear hole position, fitted for large dog heads.',
    '耳を温かく包むニットビーニー。耳穴位置調整可能、大型犬の頭に合わせたフィット。',
    'Strickmütze die die Ohren wärmt. Verstellbare Ohrlochlage für große Hundeköpfe.',
    22000, 17.00, 2400, 15.00,
    '아크릴 70% / 울 30%', '30도 이하 손세탁', 60,
    'https://placedog.net/400/400?id=23',
    '["https://placedog.net/800/800?id=23","https://placedog.net/800/600?id=73"]',
    'ACTIVE', FALSE, 340, 12, 4.8,
    '2026-01-15T00:00:00Z', '2026-01-10T00:00:00Z', '2026-02-20T00:00:00Z'
  ),
  (
    'a1000016-0000-4000-a000-000000000016', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'plaid-dog-scarf',
    '플레이드 도그 스카프', 'Plaid Dog Scarf', 'プレイドドッグスカーフ', 'Karierter Hundeschal',
    '클래식 타탄 체크 스카프. 목에 느슨하게 걸어주는 스타일링으로 포토제닉.',
    'Classic tartan check scarf. Loosely draped around the neck for a photogenic look.',
    'クラシックタータンチェックスカーフ。首にゆるくかけるスタイリングでフォトジェニック。',
    'Klassischer Tattersall-Schal. Locker um den Hals drapiert für ein fotogenes Aussehen.',
    25000, 19.00, 2700, 17.00,
    '울 50% / 아크릴 50%', '30도 이하 손세탁', 80,
    'https://placedog.net/400/400?id=24',
    '["https://placedog.net/800/800?id=24","https://placedog.net/800/600?id=74"]',
    'ACTIVE', FALSE, 460, 18, 4.9,
    '2026-01-20T00:00:00Z', '2026-01-15T00:00:00Z', '2026-02-25T00:00:00Z'
  ),
  (
    'a1000017-0000-4000-a000-000000000017', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'cooling-summer-vest',
    '쿨링 여름 베스트', 'Cooling Summer Vest', 'クーリングサマーベスト', 'Kühlweste Sommer',
    '물에 적셔 착용하는 쿨링 베스트. 기화열로 체온을 낮춰 여름 산책·야외 이벤트에 필수.',
    'Cooling vest worn after soaking in water. Evaporative cooling lowers body temperature for summer.',
    '水に浸して着用するクーリングベスト。気化熱で体温を下げ夏の散歩・野外イベントに必須。',
    'Kühlweste nach dem Einweichen. Verdunstungskühlung senkt die Körpertemperatur im Sommer.',
    42000, 32.00, 4600, 29.00,
    'PVA 쿨링 소재', '물로 세척, 그늘에서 건조', 180,
    'https://placedog.net/400/400?id=25',
    '["https://placedog.net/800/800?id=25","https://placedog.net/800/600?id=75"]',
    'ACTIVE', TRUE, 580, 22, 4.7,
    '2026-04-20T00:00:00Z', '2026-04-15T00:00:00Z', '2026-05-01T00:00:00Z'
  ),
  (
    'a1000018-0000-4000-a000-000000000018', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'reflective-safety-vest',
    '반사 안전 베스트', 'Reflective Safety Vest', 'リフレクティブセーフティベスト', 'Reflektierendes Sicherheitsweste',
    '야간 산책 안전을 위한 360도 반사 베스트. 자동차 라이트에 강하게 반응.',
    'All-around reflective vest for safe night walks. Strongly reactive to car headlights.',
    '夜間の散歩を安全にする360度反射ベスト。自動車のライトに強く反応。',
    'Rundum-Reflexweste für sichere Nachtspaziergänge. Stark reaktiv auf Autoscheinwerfer.',
    35000, 27.00, 3800, 24.00,
    '폴리에스터 100% + 반사 테이프', '30도 이하 손세탁', 140,
    'https://placedog.net/400/400?id=26',
    '["https://placedog.net/800/800?id=26","https://placedog.net/800/600?id=76"]',
    'ACTIVE', FALSE, 270, 9, 4.6,
    '2026-02-05T00:00:00Z', '2026-02-01T00:00:00Z', '2026-03-01T00:00:00Z'
  ),
  (
    'a1000019-0000-4000-a000-000000000019', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'bow-tie-collar-set',
    '보우타이 칼라 세트', 'Bow Tie Collar Set', 'ボウタイカラーセット', 'Fliegen-Halsband-Set',
    '탈부착 가능한 보우타이가 포함된 칼라 세트. 파티·포토세션 등 특별한 날을 위한 드레스업.',
    'Collar set with detachable bow tie. Dress up for parties, photo sessions and special occasions.',
    '着脱可能なボウタイ付きカラーセット。パーティーやフォトセッションなど特別な日のドレスアップ。',
    'Halsband-Set mit abnehmbarer Fliege. Festliche Aufmachung für besondere Anlässe.',
    28000, 21.00, 3100, 19.00,
    '면 100% (보우타이) + 나일론 웨빙 (칼라)', '30도 이하 손세탁', 50,
    'https://placedog.net/400/400?id=27',
    '["https://placedog.net/800/800?id=27","https://placedog.net/800/600?id=77"]',
    'ACTIVE', TRUE, 390, 15, 4.9,
    '2026-02-14T00:00:00Z', '2026-02-10T00:00:00Z', '2026-03-10T00:00:00Z'
  ),
  (
    'a1000020-0000-4000-a000-000000000020', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'cable-knit-leg-warmers',
    '케이블 니트 레그워머', 'Cable Knit Leg Warmers', 'ケーブルニットレッグウォーマー', 'Kabel-Strick-Beinstulpen',
    '앞뒷다리 4개를 모두 감싸는 레그워머 4팩. 관절이 좋지 않은 시니어 대형견에게 특히 추천.',
    '4-pack leg warmers covering all four legs. Especially recommended for senior large dogs with joint issues.',
    '前後ろ4本の脚を包むレッグウォーマー4枚セット。関節が弱いシニア大型犬に特におすすめ。',
    '4er-Pack Beinstulpen für alle vier Beine. Besonders für ältere Großhunde mit Gelenkproblemen.',
    32000, 24.00, 3500, 22.00,
    '아크릴 80% / 울 20%', '30도 이하 손세탁', 120,
    'https://placedog.net/400/400?id=28',
    '["https://placedog.net/800/800?id=28","https://placedog.net/800/600?id=78"]',
    'ACTIVE', FALSE, 210, 7, 4.5,
    '2026-01-10T00:00:00Z', '2026-01-05T00:00:00Z', '2026-02-10T00:00:00Z'
  ),
  (
    'a1000021-0000-4000-a000-000000000021', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'rain-boots-set',
    '레인 부츠 세트 (4개입)', 'Rain Boots Set (4 pcs)', 'レインブーツセット（4個入り）', 'Gummistiefel-Set (4 Stück)',
    '발을 완전히 감싸는 방수 고무 부츠 4개 세트. 미끄럼 방지 밑창, 쉬운 탈착.',
    'Waterproof rubber boots set of 4 that fully cover paws. Non-slip sole, easy on/off.',
    '足を完全に包む防水ゴムブーツ4個セット。滑り止めソール、着脱簡単。',
    'Wasserdichte Gummistiefel-Set 4 Stück. Rutschfeste Sohle, einfaches An/Ausziehen.',
    48000, 37.00, 5300, 33.00,
    '천연 고무', '물로 세척, 그늘에서 건조', 300,
    'https://placedog.net/400/400?id=29',
    '["https://placedog.net/800/800?id=29","https://placedog.net/800/600?id=79"]',
    'ACTIVE', FALSE, 310, 11, 4.4,
    '2026-02-20T00:00:00Z', '2026-02-15T00:00:00Z', '2026-03-15T00:00:00Z'
  ),
  (
    'a1000022-0000-4000-a000-000000000022', '96d2a0a1-e0fc-5c4d-9697-63999198f356', 'winter-neck-warmer',
    '겨울 넥워머', 'Winter Neck Warmer', 'ウィンターネックウォーマー', 'Winter-Halswärmer',
    '목과 가슴 상부를 보온하는 튜브형 넥워머. 코트나 점퍼 안에 받쳐 입기 좋음.',
    'Tube-type neck warmer for neck and upper chest. Great to wear under coats and jackets.',
    '首と胸上部を保温するチューブ型ネックウォーマー。コートやジャンパーの下に着用しやすい。',
    'Schlauchförmiger Halswärmer für Hals und obere Brust. Gut unter Mänteln zu tragen.',
    19000, 15.00, 2100, 13.00,
    '폴리에스터 플리스 100%', '40도 이하 세탁기 세탁', 70,
    'https://placedog.net/400/400?id=30',
    '["https://placedog.net/800/800?id=30","https://placedog.net/800/600?id=80"]',
    'ACTIVE', FALSE, 190, 6, 4.6,
    '2026-01-15T00:00:00Z', '2026-01-10T00:00:00Z', '2026-02-15T00:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. 신규 상품 옵션 (각 상품에 L·XL 사이즈 기본 추가)
-- ─────────────────────────────────────────────────────────────
INSERT INTO product_options (
  id, product_id, size_id,
  color, color_hex, sku,
  additional_price_krw, additional_price_usd, additional_price_jpy, additional_price_eur,
  stock, low_stock_threshold, is_active, created_at, updated_at
)
VALUES
  -- heavy-winter-coat
  ('b1000001-0001-4000-b000-000000000001', 'a1000001-0000-4000-a000-000000000001', '36252ef7-d454-59b9-92af-4b6deec37a73', '차콜', '#333333', 'HWC01-L-CHR',  0,    0,   0,   0,   10, 5, TRUE, NOW(), NOW()),
  ('b1000001-0002-4000-b000-000000000001', 'a1000001-0000-4000-a000-000000000001', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '차콜', '#333333', 'HWC01-XL-CHR', 8000, 6,   880, 5.5,  6, 3, TRUE, NOW(), NOW()),
  -- quilted-puffer-vest
  ('b1000002-0001-4000-b000-000000000002', 'a1000002-0000-4000-a000-000000000002', '36252ef7-d454-59b9-92af-4b6deec37a73', '카키',  '#6B6B3A', 'QPV01-L-KHK',  0,    0,   0,   0,   15, 5, TRUE, NOW(), NOW()),
  ('b1000002-0002-4000-b000-000000000002', 'a1000002-0000-4000-a000-000000000002', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '카키',  '#6B6B3A', 'QPV01-XL-KHK', 3000, 2.5, 350, 2,   10, 5, TRUE, NOW(), NOW()),
  -- casual-bomber-jacket
  ('b1000003-0001-4000-b000-000000000003', 'a1000003-0000-4000-a000-000000000003', '36252ef7-d454-59b9-92af-4b6deec37a73', '블랙',  '#1A1A1A', 'CBJ01-L-BLK',  0,    0,   0,   0,   12, 5, TRUE, NOW(), NOW()),
  ('b1000003-0002-4000-b000-000000000003', 'a1000003-0000-4000-a000-000000000003', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '블랙',  '#1A1A1A', 'CBJ01-XL-BLK', 5000, 4,   550, 3.5,  8, 3, TRUE, NOW(), NOW()),
  -- fleece-lined-trench-coat
  ('b1000004-0001-4000-b000-000000000004', 'a1000004-0000-4000-a000-000000000004', '36252ef7-d454-59b9-92af-4b6deec37a73', '베이지', '#C8B89A', 'FLT01-L-BGE',  0,    0,   0,   0,    8, 3, TRUE, NOW(), NOW()),
  ('b1000004-0002-4000-b000-000000000004', 'a1000004-0000-4000-a000-000000000004', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '베이지', '#C8B89A', 'FLT01-XL-BGE', 7000, 5.5, 750, 5,    5, 3, TRUE, NOW(), NOW()),
  -- classic-polo-shirt
  ('b1000005-0001-4000-b000-000000000005', 'a1000005-0000-4000-a000-000000000005', '36252ef7-d454-59b9-92af-4b6deec37a73', '화이트', '#FFFFFF', 'CPS01-L-WHT',  0,    0,   0,   0,   20, 5, TRUE, NOW(), NOW()),
  ('b1000005-0002-4000-b000-000000000005', 'a1000005-0000-4000-a000-000000000005', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '화이트', '#FFFFFF', 'CPS01-XL-WHT', 2000, 1.5, 250, 1.5, 15, 5, TRUE, NOW(), NOW()),
  -- chunky-knit-sweater
  ('b1000006-0001-4000-b000-000000000006', 'a1000006-0000-4000-a000-000000000006', '36252ef7-d454-59b9-92af-4b6deec37a73', '아이보리', '#F5F0E8', 'CKS01-L-IVR',  0,    0,   0,   0,   14, 5, TRUE, NOW(), NOW()),
  ('b1000006-0002-4000-b000-000000000006', 'a1000006-0000-4000-a000-000000000006', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '아이보리', '#F5F0E8', 'CKS01-XL-IVR', 4000, 3,   450, 2.5, 10, 5, TRUE, NOW(), NOW()),
  -- athletic-tank-top
  ('b1000007-0001-4000-b000-000000000007', 'a1000007-0000-4000-a000-000000000007', '36252ef7-d454-59b9-92af-4b6deec37a73', '블루',   '#3399CC', 'ATT01-L-BLU',  0,    0,   0,   0,   18, 5, TRUE, NOW(), NOW()),
  ('b1000007-0002-4000-b000-000000000007', 'a1000007-0000-4000-a000-000000000007', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '블루',   '#3399CC', 'ATT01-XL-BLU', 1500, 1,   200, 1,   12, 5, TRUE, NOW(), NOW()),
  -- graphic-print-sweatshirt
  ('b1000008-0001-4000-b000-000000000008', 'a1000008-0000-4000-a000-000000000008', '36252ef7-d454-59b9-92af-4b6deec37a73', '블랙',   '#1A1A1A', 'GPS01-L-BLK',  0,    0,   0,   0,   16, 5, TRUE, NOW(), NOW()),
  ('b1000008-0002-4000-b000-000000000008', 'a1000008-0000-4000-a000-000000000008', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '블랙',   '#1A1A1A', 'GPS01-XL-BLK', 3000, 2.5, 350, 2,   10, 5, TRUE, NOW(), NOW()),
  -- denim-overall-onepiece
  ('b1000009-0001-4000-b000-000000000009', 'a1000009-0000-4000-a000-000000000009', '36252ef7-d454-59b9-92af-4b6deec37a73', '인디고', '#3A5F8A', 'DOO01-L-IND',  0,    0,   0,   0,   12, 5, TRUE, NOW(), NOW()),
  ('b1000009-0002-4000-b000-000000000009', 'a1000009-0000-4000-a000-000000000009', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '인디고', '#3A5F8A', 'DOO01-XL-IND', 4000, 3,   450, 2.5,  8, 5, TRUE, NOW(), NOW()),
  -- floral-print-romper
  ('b1000010-0001-4000-b000-000000000010', 'a1000010-0000-4000-a000-000000000010', '36252ef7-d454-59b9-92af-4b6deec37a73', '핑크',   '#FFB6C1', 'FPR01-L-PNK',  0,    0,   0,   0,   15, 5, TRUE, NOW(), NOW()),
  ('b1000010-0002-4000-b000-000000000010', 'a1000010-0000-4000-a000-000000000010', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '핑크',   '#FFB6C1', 'FPR01-XL-PNK', 2500, 2,   275, 1.5, 10, 5, TRUE, NOW(), NOW()),
  -- utility-cargo-jumpsuit
  ('b1000011-0001-4000-b000-000000000011', 'a1000011-0000-4000-a000-000000000011', '36252ef7-d454-59b9-92af-4b6deec37a73', '올리브', '#6B7C45', 'UCJ01-L-OLV',  0,    0,   0,   0,    9, 3, TRUE, NOW(), NOW()),
  ('b1000011-0002-4000-b000-000000000011', 'a1000011-0000-4000-a000-000000000011', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '올리브', '#6B7C45', 'UCJ01-XL-OLV', 5000, 4,   550, 3.5,  6, 3, TRUE, NOW(), NOW()),
  -- poncho-style-raincoat
  ('b1000012-0001-4000-b000-000000000012', 'a1000012-0000-4000-a000-000000000012', '36252ef7-d454-59b9-92af-4b6deec37a73', '레드',   '#CC2222', 'PSR01-L-RED',  0,    0,   0,   0,   14, 5, TRUE, NOW(), NOW()),
  ('b1000012-0002-4000-b000-000000000012', 'a1000012-0000-4000-a000-000000000012', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '레드',   '#CC2222', 'PSR01-XL-RED', 4000, 3,   450, 2.5,  9, 5, TRUE, NOW(), NOW()),
  -- clear-transparent-raincoat
  ('b1000013-0001-4000-b000-000000000013', 'a1000013-0000-4000-a000-000000000013', '36252ef7-d454-59b9-92af-4b6deec37a73', '투명',   '#E8F4F8', 'CTR01-L-CLR',  0,    0,   0,   0,   12, 5, TRUE, NOW(), NOW()),
  ('b1000013-0002-4000-b000-000000000013', 'a1000013-0000-4000-a000-000000000013', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '투명',   '#E8F4F8', 'CTR01-XL-CLR', 4500, 3.5, 500, 3,    8, 3, TRUE, NOW(), NOW()),
  -- fleece-lined-rain-jacket
  ('b1000014-0001-4000-b000-000000000014', 'a1000014-0000-4000-a000-000000000014', '36252ef7-d454-59b9-92af-4b6deec37a73', '네이비', '#1B2A4A', 'FLR01-L-NVY',  0,    0,   0,   0,   10, 5, TRUE, NOW(), NOW()),
  ('b1000014-0002-4000-b000-000000000014', 'a1000014-0000-4000-a000-000000000014', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '네이비', '#1B2A4A', 'FLR01-XL-NVY', 6000, 4.5, 660, 4,    6, 3, TRUE, NOW(), NOW()),
  -- knit-dog-beanie (size-free, size-l 기준)
  ('b1000015-0001-4000-b000-000000000015', 'a1000015-0000-4000-a000-000000000015', '36252ef7-d454-59b9-92af-4b6deec37a73', '그레이', '#888888', 'KDB01-OS-GRY', 0, 0, 0, 0, 30, 10, TRUE, NOW(), NOW()),
  -- plaid-dog-scarf
  ('b1000016-0001-4000-b000-000000000016', 'a1000016-0000-4000-a000-000000000016', '36252ef7-d454-59b9-92af-4b6deec37a73', '그린 타탄', '#2D5A27', 'PDS01-OS-GRN', 0, 0, 0, 0, 25, 10, TRUE, NOW(), NOW()),
  -- cooling-summer-vest
  ('b1000017-0001-4000-b000-000000000017', 'a1000017-0000-4000-a000-000000000017', '36252ef7-d454-59b9-92af-4b6deec37a73', '라이트블루', '#ADD8E6', 'CSV01-L-LBL',  0,    0,   0,   0,   18, 5, TRUE, NOW(), NOW()),
  ('b1000017-0002-4000-b000-000000000017', 'a1000017-0000-4000-a000-000000000017', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '라이트블루', '#ADD8E6', 'CSV01-XL-LBL', 2000, 1.5, 220, 1.5, 12, 5, TRUE, NOW(), NOW()),
  -- reflective-safety-vest
  ('b1000018-0001-4000-b000-000000000018', 'a1000018-0000-4000-a000-000000000018', '36252ef7-d454-59b9-92af-4b6deec37a73', '형광옐로우', '#FFFF00', 'RSV01-L-FYL',  0,    0,   0,   0,   15, 5, TRUE, NOW(), NOW()),
  ('b1000018-0002-4000-b000-000000000018', 'a1000018-0000-4000-a000-000000000018', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '형광옐로우', '#FFFF00', 'RSV01-XL-FYL', 2500, 2,   275, 1.5, 10, 5, TRUE, NOW(), NOW()),
  -- bow-tie-collar-set (size-free)
  ('b1000019-0001-4000-b000-000000000019', 'a1000019-0000-4000-a000-000000000019', '36252ef7-d454-59b9-92af-4b6deec37a73', '버건디', '#800020', 'BTC01-OS-BRG', 0, 0, 0, 0, 20, 10, TRUE, NOW(), NOW()),
  -- cable-knit-leg-warmers
  ('b1000020-0001-4000-b000-000000000020', 'a1000020-0000-4000-a000-000000000020', '36252ef7-d454-59b9-92af-4b6deec37a73', '카멜',   '#C19A6B', 'CKL01-L-CML',  0,    0,   0,   0,   14, 5, TRUE, NOW(), NOW()),
  ('b1000020-0002-4000-b000-000000000020', 'a1000020-0000-4000-a000-000000000020', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '카멜',   '#C19A6B', 'CKL01-XL-CML', 2000, 1.5, 220, 1.5, 10, 5, TRUE, NOW(), NOW()),
  -- rain-boots-set
  ('b1000021-0001-4000-b000-000000000021', 'a1000021-0000-4000-a000-000000000021', '36252ef7-d454-59b9-92af-4b6deec37a73', '옐로우', '#FFD700', 'RBS01-L-YLW',  0,    0,   0,   0,   12, 5, TRUE, NOW(), NOW()),
  ('b1000021-0002-4000-b000-000000000021', 'a1000021-0000-4000-a000-000000000021', '242e2964-e8b8-5686-a8e1-8dc07ae9f7a7', '옐로우', '#FFD700', 'RBS01-XL-YLW', 3000, 2.5, 350, 2,    8, 3, TRUE, NOW(), NOW()),
  -- winter-neck-warmer (size-free)
  ('b1000022-0001-4000-b000-000000000022', 'a1000022-0000-4000-a000-000000000022', '36252ef7-d454-59b9-92af-4b6deec37a73', '와인레드', '#722F37', 'WNW01-OS-WIN', 0, 0, 0, 0, 25, 10, TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
