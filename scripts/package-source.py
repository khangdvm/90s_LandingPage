#!/usr/bin/env python3
"""Package source without credentials, dependencies or operational data."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', default='/tmp/90s_Homestay_CMS.zip')
args = parser.parse_args()
output = Path(args.output).resolve()
output.parent.mkdir(parents=True, exist_ok=True)
folders = {'src', 'server', 'shared', 'public', 'tests', 'docs', 'scripts'}
root_files = {'README.md', '.env.example', '.gitignore', 'index.html', 'package.json', 'package-lock.json', 'playwright.config.js', 'vite.config.js'}
excluded = {'.git', 'node_modules', 'dist', 'test-results', 'playwright-report', 'storage', 'uploads', '__pycache__', '.vite'}
files = []
for path in root.rglob('*'):
    rel = path.relative_to(root)
    if not path.is_file() or path.is_symlink() or path.resolve() == output:
        continue
    if rel.parts[0] not in folders and str(rel) not in root_files:
        continue
    if any(part in excluded for part in rel.parts):
        continue
    if path.name.startswith('.env') and path.name != '.env.example':
        continue
    if path.suffix in {'.zip', '.log', '.tmp', '.bak', '.pem', '.key', '.pyc'}:
        continue
    files.append(path)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, Path('90s_LandingPage') / path.relative_to(root))
print(f'{output}: {len(files)} files, {output.stat().st_size} bytes')
