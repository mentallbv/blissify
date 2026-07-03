import * as migration_20260630_140133 from './20260630_140133';
import * as migration_20260703_120000 from './20260703_120000';

export const migrations = [
  {
    up: migration_20260630_140133.up,
    down: migration_20260630_140133.down,
    name: '20260630_140133'
  },
  {
    up: migration_20260703_120000.up,
    down: migration_20260703_120000.down,
    name: '20260703_120000'
  },
];
