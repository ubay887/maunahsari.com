import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const items = process.argv.slice(2);

if (items.length === 0) {
    console.error(
        'Usage: npm run reui -- @reui/<item> [@reui/<item> ...] [shadcn flags]',
    );
    process.exit(1);
}

try {
    execFileSync('npx', ['shadcn@latest', 'add', ...items, '--yes'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
} catch (error) {
    process.exit(error.status ?? 1);
}

// ReUI registry items declare bare targets such as components/reui/frame.tsx.
// The shadcn CLI resolves those against the project root, while this Laravel
// app keeps its UI under resources/js. Merge whatever landed in ./components
// into resources/js/components so imports resolve through the @/ alias.
const projectRoot = process.cwd();
const source = join(projectRoot, 'components');
const target = join(projectRoot, 'resources', 'js', 'components');

if (!existsSync(source) || !statSync(source).isDirectory()) {
    process.exit(0);
}

cpSync(source, target, { recursive: true, force: true });

for (const entry of readdirSync(source)) {
    rmSync(join(source, entry), { recursive: true, force: true });
}

rmSync(source, { recursive: true, force: true });

console.log('\nMoved registry files: components/ -> resources/js/components/');
