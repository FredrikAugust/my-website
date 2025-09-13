CREATE TABLE IF NOT EXISTS guestbook (
  comment_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);
