CREATE TABLE IF NOT EXISTS album (
  album_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO album (album_id, name) VALUES (
  1,
  'My first album'
);

/* Put all existing photos into this album and establish foreign key */
ALTER TABLE photo ADD album_id INT DEFAULT 1;
ALTER TABLE photo ADD CONSTRAINT photo_album_fk FOREIGN KEY (album_id) REFERENCES album (album_id);
