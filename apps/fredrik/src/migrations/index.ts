import * as migration_20260806_205349_initial_sqlite from './20260806_205349_initial_sqlite';

export const migrations = [
  {
    up: migration_20260806_205349_initial_sqlite.up,
    down: migration_20260806_205349_initial_sqlite.down,
    name: '20260806_205349_initial_sqlite'
  },
];
