import * as migration_20260630_140133 from './20260630_140133';
import * as migration_20260703_120000 from './20260703_120000';
import * as migration_20260727_143415 from './20260727_143415';
import * as migration_20260727_152413 from './20260727_152413';
import * as migration_20260728_101356 from './20260728_101356';
import * as migration_20260728_103238 from './20260728_103238';

export const migrations = [
  {
    up: migration_20260630_140133.up,
    down: migration_20260630_140133.down,
    name: '20260630_140133',
  },
  {
    up: migration_20260703_120000.up,
    down: migration_20260703_120000.down,
    name: '20260703_120000',
  },
  {
    up: migration_20260727_143415.up,
    down: migration_20260727_143415.down,
    name: '20260727_143415',
  },
  {
    up: migration_20260727_152413.up,
    down: migration_20260727_152413.down,
    name: '20260727_152413',
  },
  {
    up: migration_20260728_101356.up,
    down: migration_20260728_101356.down,
    name: '20260728_101356',
  },
  {
    up: migration_20260728_103238.up,
    down: migration_20260728_103238.down,
    name: '20260728_103238'
  },
];
