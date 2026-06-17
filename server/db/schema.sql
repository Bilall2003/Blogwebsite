-- Blog Website Database Schema
-- MySQL 8.x compatible

CREATE DATABASE IF NOT EXISTS blog_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE blog_website;

-- ----------------------------------------------------------------------------
-- Users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_username VARCHAR(100) NOT NULL UNIQUE,
  user_email    VARCHAR(200) NOT NULL UNIQUE,
  user_pass     VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Posts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  author_id  INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES user(user_id) ON DELETE CASCADE,
  INDEX idx_posts_author (author_id),
  INDEX idx_posts_created (created_at)
);

-- ----------------------------------------------------------------------------
-- Comments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  post_id      INT,
  user_id      INT,
  comment_text TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  INDEX idx_comments_post (post_id)
);

-- ----------------------------------------------------------------------------
-- Likes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS likes (
  like_id    INT AUTO_INCREMENT PRIMARY KEY,
  post_id    INT,
  user_id    INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (post_id, user_id)
);
