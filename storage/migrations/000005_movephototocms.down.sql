CREATE TABLE IF NOT EXISTS album (
  album_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS photo (
  photo_id SERIAL PRIMARY KEY,
  url VARCHAR(250) NOT NULL,
  album_id INT,
  CONSTRAINT photo_album_fk FOREIGN KEY (album_id) REFERENCES album (album_id)
);
