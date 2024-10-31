/** @odoo-module */

export const CURRENT_VERSION = 2.0;
export const migrations = [];

export function migrate(localState) {
    if (localState?.version < CURRENT_VERSION) {
        for (const migration of migrations) {
            if (localState.version === migration.fromVersion) {
                migration.apply(localState);
                localState.version = migration.toVersion
            }
        }
        localState.version = CURRENT_VERSION;

    console.log(localState);
    }
    return localState;
    
}