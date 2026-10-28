import * as migration_20261028_202051_initial from './20261028_202051_initial';

export const migrations = [
  {
    up: migration_20261028_202051_initial.up,
    down: migration_20261028_202051_initial.down,
    name: '20261028_202051_initial'
  },
];
