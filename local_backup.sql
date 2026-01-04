-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: school_db
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_grades`
--

DROP TABLE IF EXISTS `academic_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `level_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade_level` (`name`,`level_id`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `academic_grades_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `academic_levels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_grades`
--

LOCK TABLES `academic_grades` WRITE;
/*!40000 ALTER TABLE `academic_grades` DISABLE KEYS */;
INSERT INTO `academic_grades` VALUES (19,'1.',1),(22,'1ro.',2),(25,'1ro.',3),(31,'1ro.',4),(20,'2.',1),(23,'2do.',2),(26,'2do.',3),(32,'2do.',4),(21,'3',1),(24,'3ro.',2),(27,'3ro.',3),(33,'3ro.',4),(28,'4to.',3),(29,'5to.',3),(30,'6to.',3);
/*!40000 ALTER TABLE `academic_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_groups`
--

DROP TABLE IF EXISTS `academic_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `grade_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_group_grade` (`name`,`grade_id`),
  KEY `grade_id` (`grade_id`),
  CONSTRAINT `academic_groups_ibfk_1` FOREIGN KEY (`grade_id`) REFERENCES `academic_grades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_groups`
--

LOCK TABLES `academic_groups` WRITE;
/*!40000 ALTER TABLE `academic_groups` DISABLE KEYS */;
INSERT INTO `academic_groups` VALUES (19,'Agua',30),(18,'Aire',30),(15,'Bosque',29),(11,'Campiña',28),(2,'Estepa',27),(16,'Foresta',29),(9,'Glaciar',27),(7,'Jungla',26),(5,'Lago',25),(8,'Manglar',26),(14,'Montaña',29),(3,'Océano',25),(13,'Pradera',28),(4,'Río',25),(12,'Sabana',28),(6,'Selva',26),(17,'Tierra',30),(10,'Tundra',27);
/*!40000 ALTER TABLE `academic_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_levels`
--

DROP TABLE IF EXISTS `academic_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_levels`
--

LOCK TABLES `academic_levels` WRITE;
/*!40000 ALTER TABLE `academic_levels` DISABLE KEYS */;
INSERT INTO `academic_levels` VALUES (1,'Maternal'),(2,'Preescolar'),(3,'Primaria'),(4,'Secundaria');
/*!40000 ALTER TABLE `academic_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_areas`
--

DROP TABLE IF EXISTS `admin_areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_areas`
--

LOCK TABLES `admin_areas` WRITE;
/*!40000 ALTER TABLE `admin_areas` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_positions`
--

DROP TABLE IF EXISTS `admin_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `subarea_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_position_subarea` (`name`,`subarea_id`),
  KEY `subarea_id` (`subarea_id`),
  CONSTRAINT `admin_positions_ibfk_1` FOREIGN KEY (`subarea_id`) REFERENCES `admin_subareas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_positions`
--

LOCK TABLES `admin_positions` WRITE;
/*!40000 ALTER TABLE `admin_positions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_subareas`
--

DROP TABLE IF EXISTS `admin_subareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_subareas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `area_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_subarea_area` (`name`,`area_id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `admin_subareas_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `admin_areas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_subareas`
--

LOCK TABLES `admin_subareas` WRITE;
/*!40000 ALTER TABLE `admin_subareas` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_subareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `description` text DEFAULT NULL,
  `google_event_id` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiries`
--

DROP TABLE IF EXISTS `inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `child_name` varchar(255) NOT NULL,
  `birth_date` date NOT NULL,
  `requested_grade` varchar(100) NOT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `marketing_source` varchar(100) NOT NULL,
  `marketing_source_other` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `follow_up_status` varchar(50) DEFAULT 'Información Enviada',
  `flag_info_sent` tinyint(1) DEFAULT 0,
  `flag_scheduled` tinyint(1) DEFAULT 0,
  `flag_evaluation` tinyint(1) DEFAULT 0,
  `flag_finished` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiries`
--

LOCK TABLES `inquiries` WRITE;
/*!40000 ALTER TABLE `inquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `blood_type` varchar(10) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `medications` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `doctor_name` varchar(255) DEFAULT NULL,
  `doctor_phone` varchar(50) DEFAULT NULL,
  `insurance_company` varchar(255) DEFAULT NULL,
  `insurance_policy` varchar(255) DEFAULT NULL,
  `additional_notes` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `height` varchar(20) DEFAULT NULL,
  `weight` varchar(20) DEFAULT NULL,
  `doctor_email` varchar(100) DEFAULT NULL,
  `doctor_office` varchar(255) DEFAULT NULL,
  `has_surgeries` tinyint(1) DEFAULT 0,
  `surgeries_comments` text DEFAULT NULL,
  `has_medications` tinyint(1) DEFAULT 0,
  `has_therapy` tinyint(1) DEFAULT 0,
  `therapy_comments` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student` (`student_id`),
  CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `type` enum('INFO','WARNING','SUCCESS','ALERT') DEFAULT 'INFO',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_concepts`
--

DROP TABLE IF EXISTS `payment_concepts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_concepts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `academic_level` varchar(50) DEFAULT 'GENERAL',
  `default_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_level_unique` (`name`,`academic_level`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_concepts`
--

LOCK TABLES `payment_concepts` WRITE;
/*!40000 ALTER TABLE `payment_concepts` DISABLE KEYS */;
INSERT INTO `payment_concepts` VALUES (19,'Re-Inscripción 2025 - 2026','MATERNAL',300.00,'2025-12-09 22:20:33'),(25,'Lunch','MATERNAL',600.00,'2025-12-09 22:26:28'),(29,'Inscripcion 2025 - 2026','PREESCOLAR',9800.00,'2025-12-09 22:29:41'),(30,'Inscripcion 2025 - 2026','PRIMARIA',2800.00,'2025-12-09 22:29:53'),(31,'Inscripción 2025 - 2026','SECUNDARIA',300.00,'2025-12-09 22:30:02'),(32,'Inscripción 2025 - 2026','MATERNAL',2000.00,'2025-12-09 22:46:44'),(33,'Re-Inscripción 2025 - 2026','PREESCOLAR',6050.00,'2025-12-09 22:47:31'),(34,'Lunch','PREESCOLAR',650.00,'2025-12-09 22:47:38'),(35,'Re-Inscripción 2025 - 2026','SECUNDARIA',3300.00,'2025-12-09 22:48:34'),(36,'Lunch','SECUNDARIA',650.00,'2025-12-09 22:49:01'),(37,'Re-Inscripción 2025 - 2026','PRIMARIA',3300.00,'2025-12-09 22:49:45'),(38,'Lunch','PRIMARIA',650.00,'2025-12-09 22:49:53'),(40,'Mensualidad','PREESCOLAR',5650.00,'2025-12-09 22:51:54'),(41,'Horario Extendido, comida y taller (5 Dias)','PREESCOLAR',2860.00,'2025-12-09 22:52:55'),(42,'Horario Extendido, comida y taller (4 Dias)','PREESCOLAR',2580.00,'2025-12-09 22:53:32'),(43,'Horario Extendido, comida y taller (2 Dias)','PREESCOLAR',1650.00,'2025-12-09 22:53:43'),(44,'Horario Extendido, comida y taller (1 Dias)','PREESCOLAR',825.00,'2025-12-09 22:53:53'),(45,'Cuota Material','PREESCOLAR',4300.00,'2025-12-09 23:29:43'),(46,'Mensualidad','PRIMARIA',5030.00,'2025-12-10 00:01:41');
/*!40000 ALTER TABLE `payment_concepts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `concept` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `codi_transaction_id` varchar(100) DEFAULT NULL,
  `codi_status` enum('PENDING','COMPLETED','EXPIRED','FAILED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_info`
--

DROP TABLE IF EXISTS `school_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `school_info` (
  `id` int(11) NOT NULL DEFAULT 1,
  `name` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `director` varchar(100) DEFAULT NULL,
  `commercial_name` varchar(100) DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `exterior_number` varchar(20) DEFAULT NULL,
  `neighborhood` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_info`
--

LOCK TABLES `school_info` WRITE;
/*!40000 ALTER TABLE `school_info` DISABLE KEYS */;
INSERT INTO `school_info` VALUES (1,'Nombre de la Escuela','Dirección de la Escuela','[\"Teléfono\"]','Director','Colegio Cultural Terranova','Dirección de la Escuela','','','','','');
/*!40000 ALTER TABLE `school_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_parents`
--

DROP TABLE IF EXISTS `student_parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_parents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `type` enum('MOTHER','FATHER') NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `lastnameP` varchar(100) DEFAULT NULL,
  `lastnameM` varchar(100) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `exterior_number` varchar(20) DEFAULT NULL,
  `neighborhood` varchar(100) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `family_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_parent` (`student_id`,`type`),
  CONSTRAINT `student_parents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_parents`
--

LOCK TABLES `student_parents` WRITE;
/*!40000 ALTER TABLE `student_parents` DISABLE KEYS */;
INSERT INTO `student_parents` VALUES (189,'TRNV-43810','MOTHER','Andrea','Diaz','Carreño','1990-04-06','9988453734','lnh72@hotmail.com','Paseo de la Asunción','200','Bellavista','52172','Metepec','Estado de México','México','FAM-30X3V'),(190,'TRNV-43810','FATHER','Luis','Nachón','Hesless','1972-01-24','9985783398','luis.nachon@hotmail.com','Paseo de la Asunción','200','Bellavista','52172','Metepec','Estado de México','México','FAM-30X3V');
/*!40000 ALTER TABLE `student_parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_scores`
--

DROP TABLE IF EXISTS `student_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `period` varchar(50) DEFAULT 'General',
  `evaluation_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_scores_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_scores`
--

LOCK TABLES `student_scores` WRITE;
/*!40000 ALTER TABLE `student_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_tasks`
--

DROP TABLE IF EXISTS `student_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','LATE') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_tasks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_tasks`
--

LOCK TABLES `student_tasks` WRITE;
/*!40000 ALTER TABLE `student_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lastnameP` varchar(100) NOT NULL,
  `lastnameM` varchar(100) NOT NULL,
  `grade` varchar(50) NOT NULL,
  `subgrade` varchar(50) DEFAULT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `unique_id` varchar(12) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `curp` varchar(18) DEFAULT NULL,
  `gender` char(1) DEFAULT NULL,
  `family_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('TRNV-43810','Eva Lucia','Nachón','Diaz','Primaria','3ro.','Estepa','','2016-11-21','NADE161121MQRCZVA1','F','FAM-30X3V');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_notifications_user_date` (`user_id`,`created_at`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES (1,33,'Prueba de Sistema','Esta es una notificación de prueba para verificar el sistema.','PERSONAL',1,'2026-01-03 10:34:48'),(2,1,'Notificación Web Test','Esta notificación debe aparecer en la web aunque no tenga token.','GENERAL',0,'2026-01-03 12:58:27'),(3,19,'Notificación Web Test','Esta notificación debe aparecer en la web aunque no tenga token.','GENERAL',0,'2026-01-03 12:58:27'),(4,32,'Notificación Web Test','Esta notificación debe aparecer en la web aunque no tenga token.','GENERAL',0,'2026-01-03 12:58:27'),(5,33,'Notificación Web Test','Esta notificación debe aparecer en la web aunque no tenga token.','GENERAL',1,'2026-01-03 12:58:27'),(6,33,'Hola 2','Hola','GROUP:Estepa',1,'2026-01-03 12:59:50'),(7,33,'Hola 2','ORWÑFEUÑBVRTWIUOBVUITWRPB VUIWRTNVPNIOTRWENVUITRWNVNWRIUPNVOITRPNWIOPRTENV IOTRENIOJVIOTRNVIUTRNWIOVNVIONOITRNVOIWRT OIJJKLFDNSVOIHETIRGNOITRWJGOIEJTRWNFGIOTJWIOVNTRWOINVOITWRNVOITWENVOINWOIETNVIOHJTWEIOGJIOUREWBVIOUNTWEIONMVIOUWTEGIOVJTWIOENVOUIRTWNVNTWROINGVOITWNRVOINTWEIOVNOITWNEVOINOIWENRTVOINTWRIONVOITWRNBVOIWTNVOINTWROIGNOITRWNVOUITRENGUIBNWTIOGNTOIRNGIOITWNIOWTGNN','LEVEL:PRIMARIA',1,'2026-01-03 13:04:21'),(8,33,'Venezuela','El presidente estadounidense, Donald Trump, anunció este sábado, tras la captura de Nicolás Maduro, que Estados Unidos gobernará Venezuela hasta que haya una transición “segura” y “apropiada”, afirmó durante una conferencia de prensa en Mar-a-Lago, Florida.\n\nEn la intervención junto con el secretario de Estado, de Guerra y el director de la CIA, Trump añadió que tras la captura de Maduro y su esposa, Cilia Flores, “no podemos arriesgarnos a que alguien que no tenga el bien del pueblo venezolano en mente tome el control de Venezuela”.','GROUP:Estepa',1,'2026-01-03 13:27:25'),(9,33,'Venezuela','El presidente estadounidense, Donald Trump, anunció este sábado, tras la captura de Nicolás Maduro, que Estados Unidos gobernará Venezuela hasta que haya una transición “segura” y “apropiada”, afirmó durante una conferencia de prensa en Mar-a-Lago, Florida.\n\nEn la intervención junto con el secretario de Estado, de Guerra y el director de la CIA, Trump añadió que tras la captura de Maduro y su esposa, Cilia Flores, “no podemos arriesgarnos a que alguien que no tenga el bien del pueblo venezolano en mente tome el control de Venezuela”.','LEVEL:PRIMARIA',1,'2026-01-03 13:28:27'),(10,1,'Mensaje','El empresario Ricardo Salinas Pliego se pronunció sobre la captura de Nicolás Maduro y la intervención de Estados Unidos en Venezuela, calificando los hechos como una advertencia directa para los gobiernos que, a su juicio, llegan al poder por la vía democrática y posteriormente modifican las reglas para perpetuarse.\n\nEn el mensaje publicado en su cuenta de X, el presidente de Grupo Salinas, afirmó que este episodio envía un mensaje claro “a los personajes autoritarios de todo el mundo y de México en particular”, señalando que “abusar de la democracia constitucional usando como escudo la ‘voluntad del pueblo’ tendrá graves efectos sobre su salud y su libertad”.\n\n\nAsimismo, Salinas Pliego sostuvo que los líderes que alteran el sistema democrático para beneficiar a su grupo político deben enfrentar las consecuencias de sus actos, y consideró “ridículo” que estos gobiernos apelen a la soberanía y la autodeterminación cuando “permiten que los homicidios queden sin castigo, que exista el malgasto y el despojo a las arcas públicas, que se pierdan las libertades de los ciudadanos y que se normalice la miseria como forma de vida”.\n\n\nLee más: Otro revés a Salinas Pliego: Corte ordena a subsidiaria pagar 67 mdp por adeudos fiscales\n\nSalinas Pliego critica posición de México ante fraude en elecciones de Venezuela\nEn sus publicaciones, el empresario también aseguró que Venezuela atraviesa el posible cierre de “una larga pesadilla” ocasionada por el socialismo, sin embargo, también lamentó que el desenlace haya ocurrido mediante el uso de la fuerza militar extranjera.\n\nSalinas Pliego afirmó que la situación pudo haberse evitado “si realmente se hubiera respetado la voluntad popular en la pasada elección que se robó Maduro”.\n\nPor otro lado, criticó la postura del Gobierno de México durante ese proceso electoral, al considerar que no tuvo “valor ni congruencia” para denunciar un presunto fraude, pero que ahora sí se muestra dispuesto a condenar la intervención estadounidense.\n\nEn ese contexto, Salinas Pliego advirtió que México “debería tener más cuidado porque para seguir siendo un país libre y soberano y además, ser socio comercial de los EU, hay que cumplir con las reglas de la democracia y del estado de derecho”.\n\nTambién lee: Inversionistas y economistas reaccionan a la captura de Maduro\n\nLas declaraciones de Salinas Pliego se dan en un contexto en el que el empresario mantiene una disputa abierta con el Servicio de Administración Tributaria (SAT) por adeudos fiscales de sus empresas, principalmente Grupo Elektra, que ascienden a 51,000 millones de pesos y que serán requeridos por el fisco este mes.\n\nEl empresario ha sostenido que se trata de “cobros indebidos y de una persecución política”, mientras que el SAT afirma que los adeudos corresponden a impuestos no pagados de ejercicios anteriores.\n\nSíguenos en Google Noticias para mantenerte siempre informado\n\nMÁS COBERTURA\nAirbus A320\nAirbus publicará datos de cierre de año auditados el 12 de enero\n\nCadena de cines AMC presume éxito de ‘Stranger Things’\n\nMTV cierra canales de TV en Reino Unido, Alemania y otros países\n\nDevyani fusionará ','GENERAL',0,'2026-01-03 18:31:42'),(11,19,'Mensaje','El empresario Ricardo Salinas Pliego se pronunció sobre la captura de Nicolás Maduro y la intervención de Estados Unidos en Venezuela, calificando los hechos como una advertencia directa para los gobiernos que, a su juicio, llegan al poder por la vía democrática y posteriormente modifican las reglas para perpetuarse.\n\nEn el mensaje publicado en su cuenta de X, el presidente de Grupo Salinas, afirmó que este episodio envía un mensaje claro “a los personajes autoritarios de todo el mundo y de México en particular”, señalando que “abusar de la democracia constitucional usando como escudo la ‘voluntad del pueblo’ tendrá graves efectos sobre su salud y su libertad”.\n\n\nAsimismo, Salinas Pliego sostuvo que los líderes que alteran el sistema democrático para beneficiar a su grupo político deben enfrentar las consecuencias de sus actos, y consideró “ridículo” que estos gobiernos apelen a la soberanía y la autodeterminación cuando “permiten que los homicidios queden sin castigo, que exista el malgasto y el despojo a las arcas públicas, que se pierdan las libertades de los ciudadanos y que se normalice la miseria como forma de vida”.\n\n\nLee más: Otro revés a Salinas Pliego: Corte ordena a subsidiaria pagar 67 mdp por adeudos fiscales\n\nSalinas Pliego critica posición de México ante fraude en elecciones de Venezuela\nEn sus publicaciones, el empresario también aseguró que Venezuela atraviesa el posible cierre de “una larga pesadilla” ocasionada por el socialismo, sin embargo, también lamentó que el desenlace haya ocurrido mediante el uso de la fuerza militar extranjera.\n\nSalinas Pliego afirmó que la situación pudo haberse evitado “si realmente se hubiera respetado la voluntad popular en la pasada elección que se robó Maduro”.\n\nPor otro lado, criticó la postura del Gobierno de México durante ese proceso electoral, al considerar que no tuvo “valor ni congruencia” para denunciar un presunto fraude, pero que ahora sí se muestra dispuesto a condenar la intervención estadounidense.\n\nEn ese contexto, Salinas Pliego advirtió que México “debería tener más cuidado porque para seguir siendo un país libre y soberano y además, ser socio comercial de los EU, hay que cumplir con las reglas de la democracia y del estado de derecho”.\n\nTambién lee: Inversionistas y economistas reaccionan a la captura de Maduro\n\nLas declaraciones de Salinas Pliego se dan en un contexto en el que el empresario mantiene una disputa abierta con el Servicio de Administración Tributaria (SAT) por adeudos fiscales de sus empresas, principalmente Grupo Elektra, que ascienden a 51,000 millones de pesos y que serán requeridos por el fisco este mes.\n\nEl empresario ha sostenido que se trata de “cobros indebidos y de una persecución política”, mientras que el SAT afirma que los adeudos corresponden a impuestos no pagados de ejercicios anteriores.\n\nSíguenos en Google Noticias para mantenerte siempre informado\n\nMÁS COBERTURA\nAirbus A320\nAirbus publicará datos de cierre de año auditados el 12 de enero\n\nCadena de cines AMC presume éxito de ‘Stranger Things’\n\nMTV cierra canales de TV en Reino Unido, Alemania y otros países\n\nDevyani fusionará ','GENERAL',0,'2026-01-03 18:31:42'),(12,32,'Mensaje','El empresario Ricardo Salinas Pliego se pronunció sobre la captura de Nicolás Maduro y la intervención de Estados Unidos en Venezuela, calificando los hechos como una advertencia directa para los gobiernos que, a su juicio, llegan al poder por la vía democrática y posteriormente modifican las reglas para perpetuarse.\n\nEn el mensaje publicado en su cuenta de X, el presidente de Grupo Salinas, afirmó que este episodio envía un mensaje claro “a los personajes autoritarios de todo el mundo y de México en particular”, señalando que “abusar de la democracia constitucional usando como escudo la ‘voluntad del pueblo’ tendrá graves efectos sobre su salud y su libertad”.\n\n\nAsimismo, Salinas Pliego sostuvo que los líderes que alteran el sistema democrático para beneficiar a su grupo político deben enfrentar las consecuencias de sus actos, y consideró “ridículo” que estos gobiernos apelen a la soberanía y la autodeterminación cuando “permiten que los homicidios queden sin castigo, que exista el malgasto y el despojo a las arcas públicas, que se pierdan las libertades de los ciudadanos y que se normalice la miseria como forma de vida”.\n\n\nLee más: Otro revés a Salinas Pliego: Corte ordena a subsidiaria pagar 67 mdp por adeudos fiscales\n\nSalinas Pliego critica posición de México ante fraude en elecciones de Venezuela\nEn sus publicaciones, el empresario también aseguró que Venezuela atraviesa el posible cierre de “una larga pesadilla” ocasionada por el socialismo, sin embargo, también lamentó que el desenlace haya ocurrido mediante el uso de la fuerza militar extranjera.\n\nSalinas Pliego afirmó que la situación pudo haberse evitado “si realmente se hubiera respetado la voluntad popular en la pasada elección que se robó Maduro”.\n\nPor otro lado, criticó la postura del Gobierno de México durante ese proceso electoral, al considerar que no tuvo “valor ni congruencia” para denunciar un presunto fraude, pero que ahora sí se muestra dispuesto a condenar la intervención estadounidense.\n\nEn ese contexto, Salinas Pliego advirtió que México “debería tener más cuidado porque para seguir siendo un país libre y soberano y además, ser socio comercial de los EU, hay que cumplir con las reglas de la democracia y del estado de derecho”.\n\nTambién lee: Inversionistas y economistas reaccionan a la captura de Maduro\n\nLas declaraciones de Salinas Pliego se dan en un contexto en el que el empresario mantiene una disputa abierta con el Servicio de Administración Tributaria (SAT) por adeudos fiscales de sus empresas, principalmente Grupo Elektra, que ascienden a 51,000 millones de pesos y que serán requeridos por el fisco este mes.\n\nEl empresario ha sostenido que se trata de “cobros indebidos y de una persecución política”, mientras que el SAT afirma que los adeudos corresponden a impuestos no pagados de ejercicios anteriores.\n\nSíguenos en Google Noticias para mantenerte siempre informado\n\nMÁS COBERTURA\nAirbus A320\nAirbus publicará datos de cierre de año auditados el 12 de enero\n\nCadena de cines AMC presume éxito de ‘Stranger Things’\n\nMTV cierra canales de TV en Reino Unido, Alemania y otros países\n\nDevyani fusionará ','GENERAL',0,'2026-01-03 18:31:42'),(13,33,'Mensaje','El empresario Ricardo Salinas Pliego se pronunció sobre la captura de Nicolás Maduro y la intervención de Estados Unidos en Venezuela, calificando los hechos como una advertencia directa para los gobiernos que, a su juicio, llegan al poder por la vía democrática y posteriormente modifican las reglas para perpetuarse.\n\nEn el mensaje publicado en su cuenta de X, el presidente de Grupo Salinas, afirmó que este episodio envía un mensaje claro “a los personajes autoritarios de todo el mundo y de México en particular”, señalando que “abusar de la democracia constitucional usando como escudo la ‘voluntad del pueblo’ tendrá graves efectos sobre su salud y su libertad”.\n\n\nAsimismo, Salinas Pliego sostuvo que los líderes que alteran el sistema democrático para beneficiar a su grupo político deben enfrentar las consecuencias de sus actos, y consideró “ridículo” que estos gobiernos apelen a la soberanía y la autodeterminación cuando “permiten que los homicidios queden sin castigo, que exista el malgasto y el despojo a las arcas públicas, que se pierdan las libertades de los ciudadanos y que se normalice la miseria como forma de vida”.\n\n\nLee más: Otro revés a Salinas Pliego: Corte ordena a subsidiaria pagar 67 mdp por adeudos fiscales\n\nSalinas Pliego critica posición de México ante fraude en elecciones de Venezuela\nEn sus publicaciones, el empresario también aseguró que Venezuela atraviesa el posible cierre de “una larga pesadilla” ocasionada por el socialismo, sin embargo, también lamentó que el desenlace haya ocurrido mediante el uso de la fuerza militar extranjera.\n\nSalinas Pliego afirmó que la situación pudo haberse evitado “si realmente se hubiera respetado la voluntad popular en la pasada elección que se robó Maduro”.\n\nPor otro lado, criticó la postura del Gobierno de México durante ese proceso electoral, al considerar que no tuvo “valor ni congruencia” para denunciar un presunto fraude, pero que ahora sí se muestra dispuesto a condenar la intervención estadounidense.\n\nEn ese contexto, Salinas Pliego advirtió que México “debería tener más cuidado porque para seguir siendo un país libre y soberano y además, ser socio comercial de los EU, hay que cumplir con las reglas de la democracia y del estado de derecho”.\n\nTambién lee: Inversionistas y economistas reaccionan a la captura de Maduro\n\nLas declaraciones de Salinas Pliego se dan en un contexto en el que el empresario mantiene una disputa abierta con el Servicio de Administración Tributaria (SAT) por adeudos fiscales de sus empresas, principalmente Grupo Elektra, que ascienden a 51,000 millones de pesos y que serán requeridos por el fisco este mes.\n\nEl empresario ha sostenido que se trata de “cobros indebidos y de una persecución política”, mientras que el SAT afirma que los adeudos corresponden a impuestos no pagados de ejercicios anteriores.\n\nSíguenos en Google Noticias para mantenerte siempre informado\n\nMÁS COBERTURA\nAirbus A320\nAirbus publicará datos de cierre de año auditados el 12 de enero\n\nCadena de cines AMC presume éxito de ‘Stranger Things’\n\nMTV cierra canales de TV en Reino Unido, Alemania y otros países\n\nDevyani fusionará ','GENERAL',1,'2026-01-03 18:31:42'),(14,33,'Mensaje','El empresario Ricardo Salinas Pliego se pronunció sobre la captura de Nicolás Maduro y la intervención de Estados Unidos en Venezuela, calificando los hechos como una advertencia directa para los gobiernos que, a su juicio, llegan al poder por la vía democrática y posteriormente modifican las reglas para perpetuarse.\n\nEn el mensaje publicado en su cuenta de X, el presidente de Grupo Salinas, afirmó que este episodio envía un mensaje claro “a los personajes autoritarios de todo el mundo y de México en particular”, señalando que “abusar de la democracia constitucional usando como escudo la ‘voluntad del pueblo’ tendrá graves efectos sobre su salud y su libertad”.\n\n\nAsimismo, Salinas Pliego sostuvo que los líderes que alteran el sistema democrático para beneficiar a su grupo político deben enfrentar las consecuencias de sus actos, y consideró “ridículo” que estos gobiernos apelen a la soberanía y la autodeterminación cuando “permiten que los homicidios queden sin castigo, que exista el malgasto y el despojo a las arcas públicas, que se pierdan las libertades de los ciudadanos y que se normalice la miseria como forma de vida”.\n\n\nLee más: Otro revés a Salinas Pliego: Corte ordena a subsidiaria pagar 67 mdp por adeudos fiscales\n\nSalinas Pliego critica posición de México ante fraude en elecciones de Venezuela\nEn sus publicaciones, el empresario también aseguró que Venezuela atraviesa el posible cierre de “una larga pesadilla” ocasionada por el socialismo, sin embargo, también lamentó que el desenlace haya ocurrido mediante el uso de la fuerza militar extranjera.\n\nSalinas Pliego afirmó que la situación pudo haberse evitado “si realmente se hubiera respetado la voluntad popular en la pasada elección que se robó Maduro”.\n\nPor otro lado, criticó la postura del Gobierno de México durante ese proceso electoral, al considerar que no tuvo “valor ni congruencia” para denunciar un presunto fraude, pero que ahora sí se muestra dispuesto a condenar la intervención estadounidense.\n\nEn ese contexto, Salinas Pliego advirtió que México “debería tener más cuidado porque para seguir siendo un país libre y soberano y además, ser socio comercial de los EU, hay que cumplir con las reglas de la democracia y del estado de derecho”.\n\nTambién lee: Inversionistas y economistas reaccionan a la captura de Maduro\n\nLas declaraciones de Salinas Pliego se dan en un contexto en el que el empresario mantiene una disputa abierta con el Servicio de Administración Tributaria (SAT) por adeudos fiscales de sus empresas, principalmente Grupo Elektra, que ascienden a 51,000 millones de pesos y que serán requeridos por el fisco este mes.\n\nEl empresario ha sostenido que se trata de “cobros indebidos y de una persecución política”, mientras que el SAT afirma que los adeudos corresponden a impuestos no pagados de ejercicios anteriores.\n\n','PERSONAL',1,'2026-01-03 18:39:41');
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `profile` varchar(100) DEFAULT NULL,
  `linked_family_id` varchar(50) DEFAULT NULL,
  `push_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@example.com','admin','director','',NULL,NULL),(19,'Luis Nachón','luis@hotmail.com','12345','Administrador','',NULL,NULL),(32,'lnh72@hotmail.com','lnh72@hotmail.com','w8k0bvfg','tutor','Padre de Familia','FAM-71KK0',NULL),(33,'luis.nachon@hotmail.com','luis.nachon@hotmail.com','12345','tutor','Padre de Familia','FAM-30X3V',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-04  8:54:45
