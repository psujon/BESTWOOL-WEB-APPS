-- ========================================================
-- GARMENTS DASHBOARD COMPLETE MYSQL DATABASE BACKUP
-- Database: garments_db
-- Created At: 8/2/2026, 4:25:40 PM
-- Total Tables Exported: 16
-- Includes: DATABASE, TABLE STRUCTURE (DDL) & DATA
-- ========================================================

CREATE DATABASE IF NOT EXISTS `garments_db` DEFAULT CHARACTER SET utf8mb4;
USE `garments_db`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------
-- Table structure & data for table `backup_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `backup_history`;
CREATE TABLE `backup_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `backup_name` varchar(255) NOT NULL,
  `backup_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) NOT NULL DEFAULT 'Success',
  `file_size` varchar(50) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `backup_history` (3 records)
INSERT INTO `backup_history` (`id`, `backup_name`, `backup_date`, `status`, `file_size`, `processed_by`, `processed_date`) VALUES (1, 'garments_db_backup_2026-07-26_17-50-57.sql', '2026-07-26 17:50:57', 'Success', '32.3 KB', 1, '2026-07-26 17:50:57');
INSERT INTO `backup_history` (`id`, `backup_name`, `backup_date`, `status`, `file_size`, `processed_by`, `processed_date`) VALUES (2, 'garments_db_backup_2026-07-26_17-52-26.sql', '2026-07-26 17:52:26', 'Success', '32.3 KB', 1, '2026-07-26 17:52:26');
INSERT INTO `backup_history` (`id`, `backup_name`, `backup_date`, `status`, `file_size`, `processed_by`, `processed_date`) VALUES (3, 'garments_db_backup_2026-08-02_10-18-37.sql', '2026-08-02 10:18:37', 'Success', '32.3 KB', 1, '2026-08-02 10:18:37');

-- --------------------------------------------------------
-- Table structure & data for table `buyer_orders`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `buyer_orders`;
CREATE TABLE `buyer_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `order_quantity` int(11) NOT NULL,
  `yarn_received` int(11) NOT NULL DEFAULT 0,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `buyer_orders_section_id_fkey` (`section_id`),
  KEY `buyer_orders_buyer_id_fkey` (`buyer_id`),
  KEY `buyer_orders_style_id_fkey` (`style_id`),
  KEY `buyer_orders_process_id_fkey` (`process_id`),
  KEY `buyer_orders_color_id_fkey` (`color_id`),
  CONSTRAINT `buyer_orders_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buyer_orders_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `buyer_orders` (1 records)
INSERT INTO `buyer_orders` (`id`, `section_id`, `buyer_id`, `style_id`, `process_id`, `color_id`, `order_quantity`, `yarn_received`, `processed_by`, `processed_date`) VALUES (1, 1, 1, 1, 1, 1, 25000, 10, NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `buyers`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `buyers`;
CREATE TABLE `buyers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `buyers` (1 records)
INSERT INTO `buyers` (`id`, `name`, `country`, `email`, `phone`, `processed_by`, `processed_date`) VALUES (1, 'BESTSELLER', 'USA', 'BS@BS.COM', '+65465465213', NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `colors`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `colors`;
CREATE TABLE `colors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_name` varchar(100) NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `colors_section_id_fkey` (`section_id`),
  KEY `colors_style_id_fkey` (`style_id`),
  KEY `colors_process_id_fkey` (`process_id`),
  CONSTRAINT `colors_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `colors_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `colors_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `colors` (1 records)
INSERT INTO `colors` (`id`, `section_id`, `style_id`, `process_id`, `color_name`, `processed_by`, `processed_date`) VALUES (1, 1, 1, 1, 'VISCOS', NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `company_profiles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `company_profiles`;
CREATE TABLE `company_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(150) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `logo_url` longtext DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `company_profiles` (1 records)
INSERT INTO `company_profiles` (`id`, `company_name`, `tagline`, `email`, `phone`, `address`, `website`, `tax_id`, `logo_url`, `processed_by`, `processed_date`) VALUES (1, 'BEST WOOL SWEATERS LTD. (EXT. & WAREHOUSE)', '100% Export Oriented Company', 'info@bestwool.com', '+880 2 9881234', 'Surabari, Kashimpur, Gazipur.', 'https://bestwoolbd.net', 'BIN-100293848123', 'data:image/jpeg;base64,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AMb4+D/vGGwpKaSe2n//2f/tD2BQaG90b3Nob3AgMy4wADhCSU0EBAAAAAAABxwCAAACAAIAOEJJTQQlAAAAAAAQRgzyiSa4VtqwnAGhsKeQdzhCSU0D7QAAAAAAEAEsAAAAAQABASwAAAABAAE4QklNBCYAAAAAAA4AAAAAAAAAAAAAP4AAADhCSU0EDQAAAAAABAAAAHg4QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0ECgAAAAAAAQAAOEJJTScQAAAAAAAKAAEAAAAAAAAAAThCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADUwAAAAYAAAAAAAAAAAAAAEkAAABlAAAADwBMAG8AZwBvACAAQgBlAHMAdAB3AG8AbwBsAC0AMgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAZQAAAEkAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAEkAAAAAUmdodGxvbmcAAABlAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZi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ZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0ndXVpZDoxMTQ1Mjc5ZC0xYzViLTExZWQtYjA3ZC1iYzZlOTZlYjU4ZWYnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSd1dWlkOjExNDUyNzlkLTFjNWItMTFlZC1iMDdkLWJjNmU5NmViNThlZicKICB4bWxuczpwaG90b3Nob3A9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8nPgogIDxwaG90b3Nob3A6SGlzdG9yeT48L3Bob3Rvc2hvcDpIaXN0b3J5PgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9J3V1aWQ6MTE0NTI3OWQtMWM1Yi0xMWVkLWIwN2QtYmM2ZTk2ZWI1OGVmJwogIHhtbG5zOnRpZmY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvJz4KICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogIDx0aWZmOlhSZXNvbHV0aW9uPjMwMC8xPC90aWZmOlhSZXNvbHV0aW9uPgogIDx0aWZmOllSZXNvbHV0aW9uPjMwMC8xPC90aWZmOllSZXNvbHV0aW9uPgogIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0ndXVpZDoxMTQ1Mjc5ZC0xYzViLTExZWQtYjA3ZC1iYzZlOTZlYjU4ZWYnCiAgeG1sbnM6eGFwPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eGFwOkNyZWF0ZURhdGU+MjAyMi0wOC0xNVQxMToyNzo0NSswNjowMDwveGFwOkNyZWF0ZURhdGU+CiAgPHhhcDpNb2RpZnlEYXRlPjIwMjItMDgtMTVUMTE6Mjg6MTcrMDY6MDA8L3hhcDpNb2RpZnlEYXRlPgogIDx4YXA6TWV0YWRhdGFEYXRlPjIwMjItMDgtMTVUMTE6Mjg6MTcrMDY6MDA8L3hhcDpNZXRhZGF0YURhdGU+CiAgPHhhcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ1MgV2luZG93czwveGFwOkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9J3V1aWQ6MTE0NTI3OWQtMWM1Yi0xMWVkLWIwN2QtYmM2ZTk2ZWI1OGVmJwogIHhtbG5zOnN0UmVmPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjJwogIHhtbG5zOnhhcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eGFwTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICA8c3RSZWY6aW5zdGFuY2VJRD51dWlkOjdjNjE0Njg4LWNjNjctMTFlMC1iNTliLTg5ZDBhMWY1NTVkNzwvc3RSZWY6aW5zdGFuY2VJRD4KICAgPHN0UmVmOmRvY3VtZW50SUQ+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjdjNjE0Njg2LWNjNjctMTFlMC1iNTliLTg5ZDBhMWY1NTVkNzwvc3RSZWY6ZG9jdW1lbnRJRD4KICA8L3hhcE1NOkRlcml2ZWRGcm9tPgogIDx4YXBNTTpEb2N1bWVudElEPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDpmNWFjOWNjYi0xYzVhLTExZWQtYjA3ZC1iYzZlOTZlYjU4ZWY8L3hhcE1NOkRvY3VtZW50SUQ+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0ndXVpZDoxMTQ1Mjc5ZC0xYzViLTExZWQtYjA3ZC1iYzZlOTZlYjU4ZWYnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9J3cnPz7/7gAOQWRvYmUAZAAAAAAC/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAQcHBw0MDRgQEBgUDg4OFBQODg4OFBEMDAwMDBERDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAAUCABJAGUEAREAAhEBAxEBBBEA/90ABAAN/8QBogAAAAcBAQEBAQAAAAAAAAAABAUDAgYBAAcICQoLAQACAgMBAQEBAQAAAAAAAAABAAIDBAUGBwgJCgsQAAIBAwMCBAIGBwMEAgYCcwECAxEEAAUhEjFBUQYTYSJxgRQykaEHFbFCI8FS0eEzFmLwJHKC8SVDNFOSorJjc8I1RCeTo7M2F1RkdMPS4ggmgwkKGBmElEVGpLRW01UoGvLj88TU5PRldYWVpbXF1eX1ZnaGlqa2xtbm9jdHV2d3h5ent8fX5/c4SFho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', 1, '2026-07-26 11:01:07');

-- --------------------------------------------------------
-- Table structure & data for table `employees`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `card_no` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `join_date` date NOT NULL,
  `section_id` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `employees_section_id_fkey` (`section_id`),
  CONSTRAINT `employees_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `employees` (8 records)
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (1, 'EMP-1001', 'Md. Abdul Karim', 'Senior Operator', '2022-01-15 00:00:00', 1, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (2, 'EMP-1002', 'Nasrin Sultana', 'Quality Inspector', '2021-06-10 00:00:00', 2, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (3, 'EMP-1003', 'Tanvir Ahmed', 'Line Supervisor', '2020-03-20 00:00:00', 1, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (4, 'EMP-1004', 'Rehana Akter', 'Mending Master', '2023-02-01 00:00:00', 3, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (5, 'EMP-1005', 'Md. Selim Hossain', 'Assistant Operator', '2023-08-12 00:00:00', 1, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (6, 'EMP-1006', 'Farhana Yeasmin', 'Trimming Specialist', '2022-11-05 00:00:00', 2, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (7, 'EMP-1007', 'Kamrul Islam', 'Senior Mender', '2021-09-18 00:00:00', 3, 'Active', NULL, '2026-07-26 12:00:20');
INSERT INTO `employees` (`id`, `card_no`, `name`, `designation`, `join_date`, `section_id`, `status`, `processed_by`, `processed_date`) VALUES (8, 'EMP-1008', 'Shahadat Hossain', 'Section In-Charge', '2019-05-14 00:00:00', 2, 'Active', NULL, '2026-07-26 12:00:20');

-- --------------------------------------------------------
-- Table structure & data for table `order_increase_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `order_increase_requests`;
CREATE TABLE `order_increase_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyer_order_id` int(11) NOT NULL,
  `increase_quantity` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `requested_by` int(11) DEFAULT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_increase_requests_buyer_order_id_fkey` (`buyer_order_id`),
  CONSTRAINT `order_increase_requests_buyer_order_id_fkey` FOREIGN KEY (`buyer_order_id`) REFERENCES `buyer_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `order_increase_requests` (1 records)
INSERT INTO `order_increase_requests` (`id`, `buyer_order_id`, `increase_quantity`, `status`, `requested_by`, `requested_at`, `approved_by`, `approved_at`) VALUES (1, 1, 5000, 'Approved', 1, '2026-07-26 17:45:00', 1, '2026-07-26 17:48:50');

-- --------------------------------------------------------
-- Table structure & data for table `permissions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `menu_key` varchar(50) NOT NULL,
  `can_view` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `permissions_user_id_fkey` (`user_id`),
  CONSTRAINT `permissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `permissions` (22 records)
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (1, 1, 'dashboard', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (2, 1, 'buyer', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (3, 1, 'style', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (4, 1, 'process', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (5, 1, 'piece_rate', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (6, 1, 'yarn_challan', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (7, 1, 'buyer_order_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (8, 1, 'production_entry', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (9, 1, 'production_show', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (10, 1, 'user', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (11, 1, 'user_permission', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (12, 1, 'database_backup', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (13, 2, 'dashboard', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (14, 2, 'production_entry', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (15, 2, 'production_show', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (16, 2, 'employee_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (17, 2, 'yarn_challan', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (18, 2, 'buyer_order_info', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (19, 2, 'style', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (20, 2, 'buyer', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (21, 2, 'process', 1);
INSERT INTO `permissions` (`id`, `user_id`, `menu_key`, `can_view`) VALUES (22, 2, 'color', 1);

-- --------------------------------------------------------
-- Table structure & data for table `piece_rates`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `piece_rates`;
CREATE TABLE `piece_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `effective_date` date NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `piece_rates_section_id_fkey` (`section_id`),
  KEY `piece_rates_style_id_fkey` (`style_id`),
  KEY `piece_rates_process_id_fkey` (`process_id`),
  KEY `piece_rates_color_id_fkey` (`color_id`),
  CONSTRAINT `piece_rates_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_rates_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_rates_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `piece_rates_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `piece_rates` (1 records)
INSERT INTO `piece_rates` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `rate`, `effective_date`, `processed_by`, `processed_date`) VALUES (1, 1, 1, 1, 1, '"15"', '2026-07-26 00:00:00', NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `processes`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `processes`;
CREATE TABLE `processes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `processes_section_id_fkey` (`section_id`),
  KEY `processes_buyer_id_fkey` (`buyer_id`),
  KEY `processes_style_id_fkey` (`style_id`),
  CONSTRAINT `processes_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `processes_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `processes_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `processes` (1 records)
INSERT INTO `processes` (`id`, `section_id`, `buyer_id`, `style_id`, `process_name`, `type`, `status`, `processed_by`, `processed_date`) VALUES (1, 1, 1, 1, 'complete', 'complete', 'Active', NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `production`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `production`;
CREATE TABLE `production` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  `card_no` varchar(100) NOT NULL,
  `color_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `production_date` date NOT NULL,
  `quantity` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `production_section_id_fkey` (`section_id`),
  KEY `production_style_id_fkey` (`style_id`),
  KEY `production_process_id_fkey` (`process_id`),
  KEY `production_color_id_fkey` (`color_id`),
  CONSTRAINT `production_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `production_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `production` (4 records)
INSERT INTO `production` (`id`, `processed_by`, `processed_date`, `card_no`, `color_id`, `process_id`, `production_date`, `quantity`, `section_id`, `style_id`) VALUES (1, 1, '2026-07-26 12:40:16', 'EMP-1006', 1, 1, '2026-07-26 00:00:00', 10, 1, 1);
INSERT INTO `production` (`id`, `processed_by`, `processed_date`, `card_no`, `color_id`, `process_id`, `production_date`, `quantity`, `section_id`, `style_id`) VALUES (2, 1, '2026-07-26 12:40:16', 'EMP-1005', 1, 1, '2026-07-26 00:00:00', 20, 1, 1);
INSERT INTO `production` (`id`, `processed_by`, `processed_date`, `card_no`, `color_id`, `process_id`, `production_date`, `quantity`, `section_id`, `style_id`) VALUES (3, 1, '2026-07-26 12:45:49', 'EMP-1005', 1, 1, '2026-07-26 00:00:00', 40, 1, 1);
INSERT INTO `production` (`id`, `processed_by`, `processed_date`, `card_no`, `color_id`, `process_id`, `production_date`, `quantity`, `section_id`, `style_id`) VALUES (4, 1, '2026-07-26 12:49:03', 'EMP-1005', 1, 1, '2026-07-26 00:00:00', 20, 1, 1);

-- --------------------------------------------------------
-- Table structure & data for table `rewinding_requests`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `rewinding_requests`;
CREATE TABLE `rewinding_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyer_order_id` int(11) NOT NULL,
  `rewinding_quantity` int(11) NOT NULL,
  `is_confirmed` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `requested_by` int(11) DEFAULT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rewinding_requests_buyer_order_id_fkey` (`buyer_order_id`),
  CONSTRAINT `rewinding_requests_buyer_order_id_fkey` FOREIGN KEY (`buyer_order_id`) REFERENCES `buyer_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `rewinding_requests` (1 records)
INSERT INTO `rewinding_requests` (`id`, `buyer_order_id`, `rewinding_quantity`, `is_confirmed`, `status`, `requested_by`, `requested_at`, `approved_by`, `approved_at`) VALUES (1, 1, 10000, 1, 'Approved', 1, '2026-07-26 17:48:24', 1, '2026-07-26 17:49:16');

-- --------------------------------------------------------
-- Table structure & data for table `sections`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `sections`;
CREATE TABLE `sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `sections` (3 records)
INSERT INTO `sections` (`id`, `name`, `code`, `status`, `processed_by`, `processed_date`) VALUES (1, 'Linking', '1001', 'Active', NULL, '2026-07-26 16:52:54');
INSERT INTO `sections` (`id`, `name`, `code`, `status`, `processed_by`, `processed_date`) VALUES (2, 'Trimming', '1002', 'Active', NULL, '2026-07-26 16:52:54');
INSERT INTO `sections` (`id`, `name`, `code`, `status`, `processed_by`, `processed_date`) VALUES (3, 'Mending', '1003', 'Active', NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `styles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `styles`;
CREATE TABLE `styles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `style_no` varchar(100) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Running',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `styles_buyer_id_fkey` (`buyer_id`),
  CONSTRAINT `styles_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `buyers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `styles` (1 records)
INSERT INTO `styles` (`id`, `style_no`, `buyer_id`, `status`, `processed_by`, `processed_date`) VALUES (1, '32165464', 1, 'Active', NULL, '2026-07-26 16:52:54');

-- --------------------------------------------------------
-- Table structure & data for table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `users` (2 records)
INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `role`, `created_at`) VALUES (1, 'System Admin', 'admin', 'admin123', 'admin@bestwool.com', 'admin', '2026-07-26 13:27:06');
INSERT INTO `users` (`id`, `name`, `username`, `password`, `email`, `role`, `created_at`) VALUES (2, 'Factory Operator', 'operator', 'operator123', 'operator@bestwool.com', 'operator', '2026-07-26 13:15:25');

-- --------------------------------------------------------
-- Table structure & data for table `yarn_challans`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `yarn_challans`;
CREATE TABLE `yarn_challans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `style_id` int(11) NOT NULL,
  `process_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `challan_no` varchar(100) NOT NULL,
  `gate_pass_no` varchar(100) NOT NULL,
  `challan_date` date NOT NULL,
  `quantity` int(11) NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` datetime(3) DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `yarn_challans_section_id_fkey` (`section_id`),
  KEY `yarn_challans_style_id_fkey` (`style_id`),
  KEY `yarn_challans_process_id_fkey` (`process_id`),
  KEY `yarn_challans_color_id_fkey` (`color_id`),
  CONSTRAINT `yarn_challans_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yarn_challans_process_id_fkey` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yarn_challans_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `yarn_challans_style_id_fkey` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `yarn_challans` (1 records)
INSERT INTO `yarn_challans` (`id`, `section_id`, `style_id`, `process_id`, `color_id`, `challan_no`, `gate_pass_no`, `challan_date`, `quantity`, `processed_by`, `processed_date`) VALUES (1, 1, 1, 1, 1, '11', '22', '2026-07-26 00:00:00', 10, NULL, '2026-07-26 16:52:54');

SET FOREIGN_KEY_CHECKS = 1;
