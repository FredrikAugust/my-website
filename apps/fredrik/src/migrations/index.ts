import * as migration_20260806_205349_initial_sqlite from './20260806_205349_initial_sqlite';
import * as migration_20261101_115327 from './20261101_115327';

export const migrations = [
  {
    up: migration_20260806_205349_initial_sqlite.up,
    down: migration_20260806_205349_initial_sqlite.down,
    name: '20260806_205349_initial_sqlite',
  },
  {
    up: migration_20261101_115327.up,
    down: migration_20261101_115327.down,
    name: '20261101_115327'
  },
];
