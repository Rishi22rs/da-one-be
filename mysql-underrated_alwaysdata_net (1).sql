-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql-underrated.alwaysdata.net
-- Generation Time: Jun 23, 2025 at 01:36 PM
-- Server version: 10.11.13-MariaDB
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `underrated_la`
--
CREATE DATABASE IF NOT EXISTS `underrated_la` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `underrated_la`;

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` varchar(200) NOT NULL,
  `from_id` varchar(200) NOT NULL,
  `to_id` varchar(200) NOT NULL,
  `message` varchar(500) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `from_id`, `to_id`, `message`, `timestamp`) VALUES
('04f5a985-56ad-4801-91b1-aa9c6f6fe2a7', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', '??', '2025-06-06 07:24:52'),
('0885495c-1ec2-4e62-9299-2fe4e5fb1f9d', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Heyyy', '2025-06-06 07:24:39'),
('0b2321ed-286d-48b8-a928-657adb618827', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Chup kyu ho', '2025-06-05 11:04:29'),
('1becfd68-2342-489a-94ed-b56b65fd0f63', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'How are you ', '2025-06-06 07:24:50'),
('1c6822ba-5a47-468e-8ca8-e8e5c74393c0', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Hshdhdud', '2025-06-06 07:25:34'),
('203d8d06-5afd-48f9-a96d-08838978233f', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Heidi\'s', '2025-06-09 19:10:17'),
('2d9f2e7a-61f9-4689-8c50-41708a4d9808', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Hello', '2025-06-09 19:10:44'),
('2fb64392-3d0e-4e14-a8aa-06e68a43a4ef', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Hello', '2025-06-05 21:47:57'),
('3041f746-c564-4d49-881a-4e06f9cf8b2d', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Hey', '2025-06-05 11:04:12'),
('323d9d5a-33ab-469a-b885-1e7be4e60d67', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Good afternoon ', '2025-06-05 11:04:40'),
('39a9603a-ceac-411a-958d-8b3441f31b09', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Heyy', '2025-06-05 10:29:10'),
('3b682913-cf2c-498e-9418-0daecedc31da', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Sharam aa gayi ', '2025-06-05 11:04:34'),
('43857d99-d52a-4fde-b5bd-ea61ad356df1', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Coffee??', '2025-06-06 07:25:41'),
('45a7f2a0-fbb2-40d4-8474-288d098daf25', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Good evening', '2025-06-06 11:51:52'),
('46db6630-fb90-4f27-8925-d3a50428e261', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Darr Gaya ??', '2025-06-06 10:54:43'),
('4b798d50-342c-4ba3-ac8b-69822f97fdf2', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Messga kro ', '2025-06-05 11:04:20'),
('4c03cbd7-af18-4090-b430-1aee21034d88', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Heyy', '2025-06-06 19:17:31'),
('500bae2d-03b0-42e1-be46-1775a17e5eec', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Hello', '2025-06-05 11:02:28'),
('51b643cb-9508-4253-8d98-7aeb51b66b0d', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Heyy', '2025-06-06 07:24:34'),
('54d5f74b-e93d-41c1-ad0d-3738431ccbe7', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Vellore', '2025-06-07 15:15:26'),
('5722450c-6d8f-40f2-9cca-b120784249c3', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Nahi', '2025-06-06 12:39:56'),
('57fa5f13-171c-43d5-b2d0-e4feef7eaf75', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'How are yoy', '2025-06-09 19:10:03'),
('66123943-d6a0-4a70-abd9-c87d59331390', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'what??', '2025-06-07 15:15:41'),
('69d9bd82-7e5f-4a48-93f4-e522561844ff', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'I can\'t', '2025-06-06 07:28:04'),
('6da0c178-5095-4f50-8a3e-4fd904489ba8', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Itna hi thaaa', '2025-06-06 10:54:49'),
('72f1f032-5d6a-4ea3-ad59-6951ef227aeb', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', '????????', '2025-06-06 07:29:13'),
('741a8c4b-b59b-47fc-b612-327a627c7d29', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Hhhh', '2025-06-07 15:16:23'),
('75fdcf43-65ab-4d69-ac11-47c64954a10c', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', '250 rs give get coffee', '2025-06-06 07:28:32'),
('7ef7ae64-e388-4e6d-9e7e-84b68d50eee2', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Crucifixion Brijesh jennifer red', '2025-06-06 09:28:42'),
('84013fd0-ba2e-4d56-b093-72439005b763', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '8803c61c-c602-4c9c-b2a5-5b94e45dc76a', 'Heyy', '2025-06-05 10:30:37'),
('97231d04-ddde-45b5-b04f-01ae2143baa9', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'What\'s up ', '2025-06-06 07:24:44'),
('aad3b394-cc46-4244-b18d-8914232e8124', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Hdhh', '2025-06-06 07:24:55'),
('b161a724-7203-4603-a27c-db70c56024be', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Afternoon ', '2025-06-05 11:13:22'),
('b8a595e7-af6e-491f-b95b-458e94d52551', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Heyy', '2025-06-06 07:25:35'),
('b9fbfa10-4694-4d44-9c6d-a4157b998e9e', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Hii', '2025-06-09 19:09:42'),
('bb718703-7e3c-4dc7-bfbe-31405e2fc7af', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Kal aana', '2025-06-06 07:28:46'),
('bc05f38b-1910-4750-bac4-048186abf8b1', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Whats up', '2025-06-05 11:02:39'),
('c080611b-c56a-4578-ad70-32b42cc3b746', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Go work', '2025-06-06 07:24:57'),
('c3aabe26-6ea6-4dee-8852-e672b252a0f6', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'No', '2025-06-06 07:27:59'),
('c460820f-b20a-4ef1-be36-bc60b0c41b31', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Bolo', '2025-06-05 11:04:25'),
('c4e2a195-9a21-4a2a-911c-c3bae80fdbd4', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', '????????????', '2025-06-06 07:29:32'),
('ce31a9b4-eeaf-4533-a1de-5754d1691c8b', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Kya h', '2025-06-07 15:16:38'),
('da3ef52c-131d-4cf9-8932-12ed29c4b77f', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', '(⁠☞⁠ ⁠ಠ⁠_⁠ಠ⁠)⁠☞', '2025-06-06 07:29:54'),
('dea01274-bf90-4b9b-bcdc-4a8616f18345', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Jchvhcufugigigugugjvjvjgjvuvuvjvuvjvjvuvjgjv', '2025-06-06 09:28:28'),
('df0575aa-a491-4296-aca2-8b35c6e31d8d', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Zom j', '2025-06-06 09:28:44'),
('ecec34f3-e794-4a4e-8e29-140ca6a391f5', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'vjbvj', '2025-06-07 15:15:57'),
('f1077171-58f1-4725-91aa-878c1d574d1b', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'hfgffu', '2025-06-07 15:15:52'),
('f9df56a8-40f0-4c19-b0cb-78d89c77362f', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', 'Harry Potter boyy', '2025-06-05 11:04:50'),
('ff73333f-8cfe-445d-a4b2-ebcc2331dec6', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 'Coffee', '2025-06-06 07:25:45');

-- --------------------------------------------------------

--
-- Table structure for table `like_and_dislikes`
--

CREATE TABLE `like_and_dislikes` (
  `id` varchar(200) NOT NULL,
  `user_id` varchar(200) NOT NULL,
  `other_user_id` varchar(200) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `like_and_dislikes`
--

INSERT INTO `like_and_dislikes` (`id`, `user_id`, `other_user_id`, `timestamp`) VALUES
('16a1d1e3-392b-4694-b48e-8f79bb6ef1ac', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '149e42ba-e373-4735-8f05-569b4e8e5d61', '2025-06-05 11:02:04');

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` varchar(200) NOT NULL,
  `user_id` varchar(200) NOT NULL,
  `other_user_id` varchar(200) NOT NULL,
  `unmatched` int(11) NOT NULL DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`id`, `user_id`, `other_user_id`, `unmatched`, `timestamp`) VALUES
('32d67c30-1359-401f-b534-6f03bbc0ebd6', '149e42ba-e373-4735-8f05-569b4e8e5d61', '79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', 1, '2025-06-05 11:02:05');

-- --------------------------------------------------------

--
-- Table structure for table `orientations`
--

CREATE TABLE `orientations` (
  `id` varchar(200) NOT NULL,
  `orientation` varchar(200) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `passions`
--

CREATE TABLE `passions` (
  `id` varchar(200) NOT NULL,
  `passion` varchar(200) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(200) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone_number` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `bio` varchar(200) NOT NULL,
  `birthday` varchar(200) NOT NULL,
  `gender` varchar(200) NOT NULL,
  `orientation` varchar(200) NOT NULL,
  `passions` varchar(200) NOT NULL,
  `goals` varchar(200) NOT NULL,
  `height` varchar(200) NOT NULL,
  `languages` varchar(200) NOT NULL,
  `job` varchar(200) NOT NULL,
  `current_step` int(11) NOT NULL DEFAULT 0,
  `latitude` varchar(200) NOT NULL,
  `longitude` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `timestamp`, `phone_number`, `name`, `bio`, `birthday`, `gender`, `orientation`, `passions`, `goals`, `height`, `languages`, `job`, `current_step`, `latitude`, `longitude`) VALUES
('149e42ba-e373-4735-8f05-569b4e8e5d61', '2025-05-29 23:04:11', '7843887864', 'Cool dude', '', '1982-05-29T23:04:00.000Z', 'More', 'Asexual', 'Music,Art,Cooking', '', '', '', '', 0, '37.4220936', '-122.083922'),
('2937f437-e5e5-43b0-857e-db1595b610c9', '2025-05-30 08:20:18', '7992202687', 'Animesh', 'hey there', '2025-05-30T08:20:19.492Z', 'Man', 'Straight', 'Movies', '', '', '', '', 0, '37.7749', '-122.4194'),
('33ba069d-0730-4db1-beae-78f06bc45d5e', '2025-06-02 12:30:33', '7703919748', 'Kiki', '', '2025-06-02T12:30:35.382Z', 'Woman', 'Straight', 'Movies,Travel,Fitness,Music,Cooking,Art', '', '', '', '', 0, '37.7749', '-122.4194'),
('79e3089f-3b8b-4c2f-af92-78d53ed7f2dd', '2025-05-30 11:42:54', '1234567890', 'broo', '', '2020-03-10T11:42:00.000Z', 'Woman', 'Lesbian', 'Travel,Fitness', '', '', '', '', 0, '28.4168489', '77.1021785'),
('8803c61c-c602-4c9c-b2a5-5b94e45dc76a', '2025-05-30 14:18:23', '9871629309', 'Abhishek', '', '1998-09-09T14:18:00.000Z', 'Man', 'Straight', 'Music,Movies,Travel,Fitness,Art,Cooking', '', '', '', '', 0, '', '');

-- --------------------------------------------------------

--
-- Table structure for table `user_phone_number_mapping`
--

CREATE TABLE `user_phone_number_mapping` (
  `id` varchar(200) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone_number` varchar(200) NOT NULL,
  `otp` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_phone_number_mapping`
--

INSERT INTO `user_phone_number_mapping` (`id`, `timestamp`, `phone_number`, `otp`) VALUES
('e822ba87-d37d-4afe-ab4b-29fb708316cb', '2025-06-03 07:33:43', '6504992804', '4582');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `like_and_dislikes`
--
ALTER TABLE `like_and_dislikes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_phone_number_mapping`
--
ALTER TABLE `user_phone_number_mapping`
  ADD PRIMARY KEY (`phone_number`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
