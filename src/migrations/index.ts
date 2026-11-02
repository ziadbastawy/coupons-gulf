import * as migration_20261028_202051_initial from './20261028_202051_initial';
import * as migration_20261102_193647_add_user_permissions from './20261102_193647_add_user_permissions';

export const migrations = [
  {
    up: migration_20261028_202051_initial.up,
    down: migration_20261028_202051_initial.down,
    name: '20261028_202051_initial',
  },
  {
    up: migration_20261102_193647_add_user_permissions.up,
    down: migration_20261102_193647_add_user_permissions.down,
    name: '20261102_193647_add_user_permissions'
  },
];
