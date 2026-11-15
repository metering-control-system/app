import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';

const sourceRoot = new URL('../../../', import.meta.url);

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (!specifier.startsWith('@/')) return nextResolve(specifier, context);
        const path = new URL(specifier.slice(2), sourceRoot);
        const file = [
            path,
            new URL(`${path.href}.js`),
            new URL(`${path.href}.jsx`),
        ].find(existsSync);
        return nextResolve(file?.href ?? path.href, context);
    },
});
