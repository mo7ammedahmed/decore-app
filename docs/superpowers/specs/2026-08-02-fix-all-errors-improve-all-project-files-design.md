# Fix All Errors and Improve All Project Files Design

**Goal:** Automatically fix code style issues, potential bugs, security vulnerabilities, and performance improvements across the entire DecoreApp Laravel/React codebase.

**Approach:** Use automated tooling (PHP Pint, PHPStan, Laravel Pint, ESLint, Tailwind Prettier, etc.) to identify and fix issues where safe, and create issues for manual review where automatic fixes are not safe.

**Tools to be used:**
- PHP Pint (PSR12) for PHP code style
- PHPStan (level max) for static analysis and potential bugs
- Laravel Pint (already configured) for Laravel-specific fixes
- ESLint with plugin:import/@typescript-eslint for JS/TS
- Prettier for Tailwind CSS class ordering (via tailwindcss prettier plugin)
- Laravel Sanctum/Security checker? We'll use Laravel Security Checker (symfony/security-checker) or Laravel Scout? Actually we can run `composer audit` for known vulnerabilities.
- Laravel Scout? Not needed. We'll use `composer audit` and `npm audit` for known vulnerabilities.
- Performance: Use Laravel debugbar? We'll just run query analysis via Laravel Debugbar? We'll create a task to run `php artisan optimize` and check for N+1 queries via Laravel Debugbar if installed, else we can add a note.
- Bundle size: Use `vite build --mode production` and analyze bundle via `rollup-plugin-visualizer`? We'll just run production build and note size.

**Process:**
1. Run PHP Pint in dry-run to see what would change, then apply.
2. Run PHPStan level max, generate report, fix critical and high issues automatically where possible (e.g., adding missing types, null checks).
3. Run ESLint --fix on JS/TS files.
4. Run Prettier on tailwind config and CSS files.
5. Run `composer audit` and `npm audit` to identify known vulnerabilities; upgrade dependencies where possible.
6. Run Laravel optimization: `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache` (but careful in dev).
7. Run PHPUnit to ensure tests still pass after changes.
8. Run Vite build to ensure no build errors.
9. Create a summary report of changes made and any remaining issues requiring manual attention.

**Expected Outcome:** Codebase adheres to PSR12, ES2022+ with strict typing, no known security vulnerabilities, optimized autoload, and all tests pass.

**Files to be touched:**
- All PHP files under `app/` (excluding vendor)
- All JS/TS files under `resources/js/` (or wherever frontend source is)
- Tailwind config (`tailwind.config.cjs` or `postcss.config.mjs`)
- `composer.json` and `package.json` (for dependency updates)
- Configuration files (`.phpstan.yaml`, `.eslintrc.js`, `postcss.config.mjs`, etc.) if adjustments needed.

**Safety Measures:**
- Run each tool in dry‑mode first, review diffs.
- Commit changes after each major step to allow rollback.
- Run full test suite after each major step.
- If any automated fix breaks tests, revert that specific file and flag for manual review.