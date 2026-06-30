import * as migration_20260630_140133 from './20260630_140133';

export const migrations = [
  {
    up: migration_20260630_140133.up,
    down: migration_20260630_140133.down,
    name: '20260630_140133'
  },
];
