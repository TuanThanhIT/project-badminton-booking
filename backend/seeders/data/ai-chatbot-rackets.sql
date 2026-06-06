-- ============================================================
-- Dữ liệu mẫu VỢT CẦU LÔNG để test chatbot B-Hub
-- Chạy: mysql -u root -p ten_database < backend/seeders/data/ai-chatbot-rackets.sql
--
-- Yêu cầu: đã có ít nhất 1 chi nhánh (Branches.id = 1)
-- ID dùng dải 901+ để tránh trùng dữ liệu cũ
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- Danh mục ----------
INSERT INTO `Categories` (`id`, `cateName`, `menuGroup`, `createdAt`, `updatedAt`) VALUES
(901, 'Vợt cầu lông Yonex',   'Vợt cầu lông', NOW(), NOW()),
(902, 'Vợt cầu lông Victor',  'Vợt cầu lông', NOW(), NOW()),
(903, 'Vợt cầu lông Lining',  'Vợt cầu lông', NOW(), NOW()),
(904, 'Vợt cầu lông Mizuno',  'Vợt cầu lông', NOW(), NOW()) AS new
ON DUPLICATE KEY UPDATE
  `cateName` = new.cateName,
  `menuGroup` = new.menuGroup,
  `updatedAt` = NOW();

-- ---------- Sản phẩm ----------
INSERT INTO `Products` (`id`, `productName`, `brand`, `description`, `thumbnailUrl`, `categoryId`, `createdAt`, `updatedAt`) VALUES
(901, 'Yonex Astrox 99 Pro', 'Yonex',
 'Vợt tấn công đầu nặng, lực smash mạnh. Phù hợp người chơi trung-cao cấp, lối đánh tấn công.',
 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400', 901, NOW(), NOW()),

(902, 'Yonex Nanoflare 700', 'Yonex',
 'Vợt đầu nhẹ, tốc độ vung cao, phòng thủ và phản công nhanh. Phù hợp người chơi đôi và singles tốc độ.',
 'https://images.unsplash.com/photo-1622167732998-1ea32a8418a3?w=400', 901, NOW(), NOW()),

(903, 'Yonex Arcsaber 11 Pro', 'Yonex',
 'Vợt cân bằng, kiểm soát cầu tốt, cảm giác chắc tay. Phù hợp người mới đến trung cấp.',
 'https://images.unsplash.com/photo-1609710228159-0fa9bd7ac787?w=400', 901, NOW(), NOW()),

(904, 'Victor Auraspeed 90K', 'Victor',
 'Vợt tốc độ cao, khung aero, linh hoạt. Dành cho người chơi thích lối tấn công nhanh.',
 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400', 902, NOW(), NOW()),

(905, 'Victor Thruster K 9900', 'Victor',
 'Vợt cân bằng hơi nặng đầu, lực đánh ổn định. Phù hợp tập luyện và thi đấu phong trào.',
 'https://images.unsplash.com/photo-1519864605775-7d292ff08536?w=400', 902, NOW(), NOW()),

(906, 'Victor DriveX 9X B', 'Victor',
 'Vợt kiểm soát, dễ điều cầu, giá tầm trung. Gợi ý cho người mới chơi.',
 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=400', 902, NOW(), NOW()),

(907, 'Lining Aeronaut 9000', 'Lining',
 'Vợt cao cấp, công nghệ wing stabilizer, lực đánh và kiểm soát tốt.',
 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400', 903, NOW(), NOW()),

(908, 'Lining Windstorm 72', 'Lining',
 'Vợt siêu nhẹ 6U, tốc độ vung nhanh. Phù hợp nữ và người chơi thích phòng thủ.',
 'https://images.unsplash.com/photo-1622167732998-1ea32a8418a3?w=400', 903, NOW(), NOW()),

(909, 'Lining Turbo Charging 75', 'Lining',
 'Vợt tấn công giá tốt, dễ làm quen. Phù hợp người mới và chơi giải trí.',
 'https://images.unsplash.com/photo-1609710228159-0fa9bd7ac787?w=400', 903, NOW(), NOW()),

(910, 'Mizuno Fortius 10', 'Mizuno',
 'Vợt Nhật Bản, cân bằng, độ bền cao. Phù hợp tập luyện thường xuyên.',
 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400', 904, NOW(), NOW()) AS new
ON DUPLICATE KEY UPDATE
  `productName` = new.productName,
  `brand` = new.brand,
  `description` = new.description,
  `thumbnailUrl` = new.thumbnailUrl,
  `categoryId` = new.categoryId,
  `updatedAt` = NOW();

-- ---------- Biến thể (giá / màu / độ cứng) ----------
INSERT INTO `ProductVariants` (`id`, `sku`, `price`, `discount`, `color`, `size`, `material`, `weight`, `productId`) VALUES
-- Yonex Astrox 99 Pro
(901, 'YX-AX99P-4U', 4590000, 5,  'Đỏ',   '4U', 'Graphite', 0.83, 901),
(902, 'YX-AX99P-3U', 4790000, 0,  'Đen',  '3U', 'Graphite', 0.88, 901),
-- Yonex Nanoflare 700
(903, 'YX-NF700-5U', 3890000, 8,  'Xanh', '5U', 'Graphite', 0.78, 902),
(904, 'YX-NF700-4U', 3990000, 5,  'Champagne', '4U', 'Graphite', 0.83, 902),
-- Yonex Arcsaber 11 Pro
(905, 'YX-AB11P-4U', 3290000, 10, 'Xám',  '4U', 'Graphite', 0.83, 903),
-- Victor Auraspeed 90K
(906, 'VT-AS90K-4U', 4190000, 5,  'Xanh', '4U', 'Graphite', 0.83, 904),
(907, 'VT-AS90K-3U', 4390000, 0,  'Đen',  '3U', 'Graphite', 0.88, 904),
-- Victor Thruster K 9900
(908, 'VT-TK9900-4U', 2890000, 5,  'Đỏ',   '4U', 'Graphite', 0.85, 905),
-- Victor DriveX 9X B
(909, 'VT-DX9XB-5U', 1590000, 0,  'Xanh', '5U', 'Graphite', 0.78, 906),
(910, 'VT-DX9XB-4U', 1690000, 5,  'Đen',  '4U', 'Graphite', 0.83, 906),
-- Lining Aeronaut 9000
(911, 'LN-A9000-4U', 3990000, 8,  'Vàng', '4U', 'Graphite', 0.84, 907),
-- Lining Windstorm 72
(912, 'LN-WS72-6U',  2190000, 5,  'Hồng', '6U', 'Graphite', 0.72, 908),
(913, 'LN-WS72-5U',  2290000, 0,  'Tím',  '5U', 'Graphite', 0.78, 908),
-- Lining Turbo Charging 75
(914, 'LN-TC75-5U',  1290000, 10, 'Cam',  '5U', 'Graphite', 0.78, 909),
-- Mizuno Fortius 10
(915, 'MZ-FT10-4U',  2490000, 5,  'Đen',  '4U', 'Graphite', 0.85, 910) AS new
ON DUPLICATE KEY UPDATE
  `sku` = new.sku,
  `price` = new.price,
  `discount` = new.discount,
  `color` = new.color,
  `size` = new.size,
  `material` = new.material,
  `weight` = new.weight,
  `productId` = new.productId;

-- ---------- Tồn kho chi nhánh 1 ----------
INSERT INTO `VariantStocks` (`id`, `stock`, `variantId`, `branchId`) VALUES
(901, 15, 901, 1), (902, 8,  902, 1), (903, 12, 903, 1), (904, 10, 904, 1),
(905, 20, 905, 1), (906, 6,  906, 1), (907, 9,  907, 1), (908, 14, 908, 1),
(909, 25, 909, 1), (910, 18, 910, 1), (911, 7,  911, 1), (912, 16, 912, 1),
(913, 11, 913, 1), (914, 30, 914, 1), (915, 13, 915, 1) AS new
ON DUPLICATE KEY UPDATE
  `stock` = new.stock,
  `variantId` = new.variantId,
  `branchId` = new.branchId;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Gợi ý test chatbot (chế độ Mua sắm):
--   "Vợt nào phù hợp người mới chơi?"
--   "Gợi ý vợt Yonex tầm 3–4 triệu"
--   "So sánh Victor Auraspeed và Lining Windstorm"
--   "Vợt nhẹ cho nữ chơi đôi"
-- ============================================================
