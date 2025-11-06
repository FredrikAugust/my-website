import * as migration_20251106_085636 from './20251106_085636';
import * as migration_20251106_103138 from './20251106_103138';

export const migrations = [
  {
    up: migration_20251106_085636.up,
    down: migration_20251106_085636.down,
    name: '20251106_085636',
  },
  {
    up: migration_20251106_103138.up,
    down: migration_20251106_103138.down,
    name: '20251106_103138'
  },
];
