-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 11, 2026 at 09:15 AM
-- Server version: 10.1.37-MariaDB
-- PHP Version: 5.6.39

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shop_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `ten_danh_muc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `ten_danh_muc`) VALUES
(1, 'Áo/Trang phục'),
(2, 'Móc khóa/Huy hiệu'),
(3, 'Standee/Poster'),
(4, 'Gối ôm/Plushie'),
(5, 'Sticker/Khác');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `ten_san_pham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia` decimal(15,2) NOT NULL DEFAULT '0.00',
  `so_luong` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `con_hang` tinyint(1) NOT NULL DEFAULT '1',
  `da_mua` tinyint(1) NOT NULL DEFAULT '1',
  `hinh_san_pham` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten_nhan_vat` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shop_ban` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoi_mua` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_mua` date DEFAULT NULL,
  `ngay_them` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `ten_san_pham`, `gia`, `so_luong`, `con_hang`, `da_mua`, `hinh_san_pham`, `ten_nhan_vat`, `shop_ban`, `nguoi_mua`, `ngay_mua`, `ngay_them`) VALUES
(6, 1, 'Áo hoodie Honkai', '1250000.00', 1, 1, 1, 'images/hoodie.jpg', 'March 7th', 'Shop Mihoyo', 'Khoa', '2025-03-07', '2026-05-11 09:54:09'),
(7, 2, 'Móc khóa March 7th', '85000.00', 5, 1, 0, 'images/keychain.jpg', 'March 7th', 'Shop Anime VN', 'Khoa', '2025-03-07', '2026-05-11 09:54:09'),
(8, 3, 'Poster Stelle', '120000.00', 3, 1, 0, 'images/poster.jpg', 'Stelle', 'Shop HSR', 'Shino', '2025-04-15', '2026-05-11 09:54:09'),
(9, 4, 'Gối ôm Bronya', '3550000.00', 1, 1, 1, 'images/pillow.jpg', 'Bronya', 'Shop Mihoyo', 'Ai đó ngoài Bắc', '2025-05-01', '2026-05-11 09:54:09'),
(10, 5, 'Sticker Firefly', '45000.00', 20, 1, 0, 'images/sticker.jpg', 'Firefly', 'Shop Anime VN', 'Lumi', NULL, '2026-05-11 09:54:09'),
(11, 5, 'Sticker March 7th', '70000.00', 10, 1, 0, 'images/1778469181_sticker2.jpg', 'March 7th', 'Shop Mihoyo', 'Khoa', NULL, '2026-05-11 10:12:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
