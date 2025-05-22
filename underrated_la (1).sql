-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-underrated.alwaysdata.net
-- Generation Time: May 23, 2025 at 12:46 AM
-- Server version: 10.11.8-MariaDB
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
  `birthday` varchar(200) NOT NULL,
  `gender` varchar(200) NOT NULL,
  `orientation` varchar(200) NOT NULL,
  `passions` varchar(200) NOT NULL,
  `current_step` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `timestamp`, `phone_number`, `name`, `birthday`, `gender`, `orientation`, `passions`, `current_step`) VALUES
('2e875124-a229-49bc-a50c-c52645a0e15d', '2025-03-09 20:21:47', '7843887864', '', '', '', '', '', 0),
('466f4922-13a7-4e12-8009-d4dfa5b454d7', '2025-03-09 20:21:47', '999', '', '', '', '', '', 0),
('4ed22daa-ab83-47ae-a0c0-5068769c173f', '2025-03-22 10:57:33', '3413412412', '', '', '', '', '', 0),
('b6c78506-c6b2-413a-ade4-45cfa34e40d5', '2025-05-18 00:23:14', '9929', 'Alice', '1995-08-20', 'Woman', 'Straight', 'Music,Travel,Fitness', 5),
('cc8c9f1a-b5d9-4754-9d4b-099b7c2c79bb', '2025-05-22 20:50:26', '3213232323', '', '', '', '', '', 0),
('cdd8b08e-0ebd-4044-ac3c-71acb08ac5b0', '2025-03-22 12:13:48', '3113431431', '', '', '', '', '', 0),
('d705d5ac-bfad-40ed-83c6-a2b18616155f', '2025-03-15 22:50:04', '1234', '', '', '', '', '', 0);

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
('8be65ae6-c0f5-4fbb-add1-b808f8506224', '2025-03-16 09:53:34', '999', '4623');

--
-- Indexes for dumped tables
--

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
