-- ORBIT Database Schema Definition
-- Target DBMS: MariaDB / MySQL 8.0+
-- Module 3 MVP Data Architecture

CREATE DATABASE IF NOT EXISTS orbit_db;
USE orbit_db;

-- --------------------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(512) DEFAULT NULL,
    role VARCHAR(100) DEFAULT 'Software Engineer & Learner',
    level VARCHAR(100) DEFAULT 'Adaptive Phase 1',
    streak INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. GOALS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    progress INT NOT NULL DEFAULT 0,
    completed_milestones INT NOT NULL DEFAULT 0,
    total_milestones INT NOT NULL DEFAULT 1,
    next_milestone VARCHAR(255) DEFAULT NULL,
    target_date DATE DEFAULT NULL,
    status ENUM('active', 'completed', 'archived') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TASKS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_id BIGINT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    estimated_minutes INT NOT NULL DEFAULT 25,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
    INDEX idx_tasks_user (user_id),
    INDEX idx_tasks_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. FOCUS_SESSIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS focus_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id BIGINT DEFAULT NULL,
    session_code VARCHAR(64) DEFAULT NULL,
    task_title VARCHAR(255) NOT NULL,
    planned_duration_minutes INT NOT NULL DEFAULT 45,
    actual_duration_minutes INT NOT NULL DEFAULT 0,
    focus_score INT NOT NULL DEFAULT 85,
    status ENUM('idle', 'running', 'paused', 'completed', 'cancelled') NOT NULL DEFAULT 'completed',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_focus_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_focus_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_focus_user (user_id),
    INDEX idx_focus_task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. OBSERVATIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS observations (
    id VARCHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'ORBIT_FRONTEND_APP',
    activity_name VARCHAR(255) NOT NULL,
    activity_category VARCHAR(100) NOT NULL DEFAULT 'General',
    activity_duration INT NOT NULL DEFAULT 0,
    route VARCHAR(255) NOT NULL DEFAULT '/dashboard',
    task_id BIGINT DEFAULT NULL,
    focus_session_id BIGINT DEFAULT NULL,
    context_json JSON DEFAULT NULL,
    metadata_json JSON DEFAULT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_obs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_obs_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    CONSTRAINT fk_obs_session FOREIGN KEY (focus_session_id) REFERENCES focus_sessions(id) ON DELETE SET NULL,
    INDEX idx_obs_user (user_id),
    INDEX idx_obs_type (type),
    INDEX idx_obs_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. RECOVERY_SESSIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS recovery_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    focus_session_id BIGINT DEFAULT NULL,
    recommended_duration_minutes INT NOT NULL DEFAULT 6,
    actual_duration_minutes INT NOT NULL DEFAULT 6,
    fatigue_level VARCHAR(50) NOT NULL DEFAULT 'Low',
    trigger_reason VARCHAR(100) NOT NULL DEFAULT 'POST_SESSION_RECOVERY',
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recovery_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_recovery_session FOREIGN KEY (focus_session_id) REFERENCES focus_sessions(id) ON DELETE SET NULL,
    INDEX idx_recovery_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. EXPERIMENTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    hypothesis TEXT DEFAULT NULL,
    variable_tested VARCHAR(100) DEFAULT NULL,
    status ENUM('planned', 'active', 'completed', 'archived') NOT NULL DEFAULT 'active',
    outcome_summary TEXT DEFAULT NULL,
    confidence_score INT NOT NULL DEFAULT 75,
    started_at TIMESTAMP NULL DEFAULT NULL,
    ended_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_experiments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_experiments_user (user_id),
    INDEX idx_experiments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. MEMORIES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS memories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('live', 'trusted', 'evidence') NOT NULL,
    content_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    confidence_rating VARCHAR(50) DEFAULT NULL,
    is_validated BOOLEAN NOT NULL DEFAULT FALSE,
    session_date DATE DEFAULT NULL,
    focus_score INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_memories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_memories_user (user_id),
    INDEX idx_memories_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. INSIGHTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS insights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence_score INT NOT NULL DEFAULT 80,
    evidence_count INT NOT NULL DEFAULT 1,
    type VARCHAR(50) NOT NULL DEFAULT 'Observation',
    is_demo_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_insights_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_insights_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
