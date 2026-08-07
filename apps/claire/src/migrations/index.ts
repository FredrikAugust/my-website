import * as migration_20260806_205357_initial_sqlite from './20260806_205357_initial_sqlite';
import * as migration_20260806_212742 from './20260806_212742';

export const migrations = [
  {
    up: migration_20260806_205357_initial_sqlite.up,
    down: migration_20260806_205357_initial_sqlite.down,
    name: '20260806_205357_initial_sqlite',
  },
  {
    up: migration_20260806_212742.up,
    down: migration_20260806_212742.down,
    name: '20260806_212742'
  },
];
