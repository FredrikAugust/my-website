import * as migration_20260806_205357_initial_sqlite from './20260806_205357_initial_sqlite';
import * as migration_20260806_212742 from './20260806_212742';
import * as migration_20260815_213421_add_pi_playback from './20260815_213421_add_pi_playback';
import * as migration_20260815_215043_add_per_pi_videos from './20260815_215043_add_per_pi_videos';

export const migrations = [
  {
    up: migration_20260806_205357_initial_sqlite.up,
    down: migration_20260806_205357_initial_sqlite.down,
    name: '20260806_205357_initial_sqlite',
  },
  {
    up: migration_20260806_212742.up,
    down: migration_20260806_212742.down,
    name: '20260806_212742',
  },
  {
    up: migration_20260815_213421_add_pi_playback.up,
    down: migration_20260815_213421_add_pi_playback.down,
    name: '20260815_213421_add_pi_playback',
  },
  {
    up: migration_20260815_215043_add_per_pi_videos.up,
    down: migration_20260815_215043_add_per_pi_videos.down,
    name: '20260815_215043_add_per_pi_videos'
  },
];
