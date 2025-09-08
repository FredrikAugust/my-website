-- Create views table for storing hostname view counts
CREATE TABLE IF NOT EXISTS views (
    hostname VARCHAR(255) PRIMARY KEY,
    views INTEGER DEFAULT 1 NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW()
);