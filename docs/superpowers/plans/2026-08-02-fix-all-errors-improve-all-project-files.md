# Fix All Errors and Improve All Project Files Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically fix code style issues, potential bugs, security vulnerabilities, and performance improvements across the entire DecoreApp Laravel/React codebase.

**Architecture:** We will run a series of automated tools (PHP Pint, PHPStan, ESLint, Prettier, composer audit, npm audit) in sequence, applying auto-fixes where available and creating issues for manual review where needed. After each major step we will run the test suite to ensure regressions are not introduced.

**Tech Stack:** PHP (Laravel), Pint, PHPStan, JavaScript/TypeScript, ESLint, Prettier, Composer, npm/Vite.

## Global Constraints

- PHP code must comply with PSR12 (enforced via Pint)
- PHP static analysis must pass at PHPStan level max
- JS/TS code must comply with ESLint recommended rules
- Tailwind CSS class order should be optimized (via Prettier plugin)
- No known vulnerabilities in Composer or npm dependencies (per audit)
- All existing PHPUnit tests must continue to pass
- Vite production build must succeed
- Laravel optimization commands (config:cache, route:cache, view:cache) may be applied in production context only

---
### Task 1: PHP Code Style Fixes with Pint

**Files:**
- Modify: `app/**/*.php` (all PHP files under app)
- Create: (none)
- Test: `php artisan test` (or `vendor/bin/phpunit`)

**Interfaces:**
- Consumes: (none)
- Produces: PSR12‑compliant PHP files

- [ ] **Step 1: Run Pint in dry‑run mode to see changes**

Run: `vendor/bin/pint --test -v`
Expected: List of files that would be fixed

- [ ] **Step 2: Apply Pint fixes**

Run: `vendor/bin/pint`
Expected: Files modified in‑place

- [ ] **Step 3: Run PHPUnit to ensure nothing broke**

Run: `vendor/bin/phpunit`
Expected: All tests pass (211 tests)

- [ ] **Step 4: Commit changes**

Run: 
```
git add app/**/*.php
git commit -m "chore: apply PSR12 fixes via Pint"
```

### Task 2: PHP Static Analysis with PHPStan (Level Max)

**Files:**
- Modify: `app/**/*.php` (where PHPStan suggests type additions, null fixes, etc.)
- Create: (none)
- Test: `php artisan test`

**Interfaces:**
- Consumes: PSR12‑compliant PHP files
- Produces: PHPStan‑clean code (level max)

- [ ] **Step 1: Run PHPStan level max to generate report**

Run: `vendor/bin/phpstan analyse -l max app/`
Expected: Report of errors (if any)

- [ ] **Step 2: Apply auto‑fixable PHPStan recommendations**  
  (We will use PHPStan's `--generate-baseline` and then manually fix? Actually PHPStan does not auto‑fix; we will address the errors by adding missing types, null checks, etc. We'll create a script or do manually. For the plan we note we will fix critical and high issues.)

- [ ] **Step 3: For each error, decide if it can be fixed safely (e.g., add missing typehint, add null check). Implement fixes.**

Run: (manual edits guided by PHPStan output)
Expected: Error count reduced

- [ ] **Step 4: Re‑run PHPStan to confirm improvements**

Run: `vendor/bin/phpstan analyse -l max app/`
Expected: Fewer errors; aim for zero level‑max errors

- [ ] **Step 5: Run PHPUnit to ensure nothing broke**

Run: `vendor/bin/phpunit`
Expected: All tests pass

- [ ] **Step 6: Commit changes**

Run: 
```
git add app/**/*.php
git commit -m "chore: apply PHPStan level max fixes (type safety, null safety)"
```

### Task 3: JavaScript/TypeScript Linting and Auto‑Fix with ESLint

**Files:**
- Modify: `resources/js/**/*.{js,ts,tsx}` (adjust if frontend source elsewhere)
- Create: (none)
- Test: `npm run types` (tsc --noEmit) and `npm run dev` build check

**Interfaces:**
- Consumes: Existing JS/TS source
- Produces: ESLint‑compliant JS/TS

- [ ] **Step 1: Check if ESLint config exists; if not, create a basic one**  
  (We can use `npm init @eslint/config` or copy from Laravel Breeze.)

Run: `ls -la | grep -E "\.eslintrc"`  
If missing, create `.eslintrc.js` with:
```js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // optional: override any overly strict rules
  },
};
```

- [ ] **Step 2: Run ESLint with --fix**

Run: `npx eslint resources/js/**/*.{js,ts,tsx} --fix`
Expected: Auto‑fixable issues resolved

- [ ] **Step 3: Run TypeScript type check**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 4: Run Vite dev build to ensure nothing broken**

Run: `npm run dev` (short‑ lived, we can run `npm run build` and check for errors)
Expected: Build succeeds

- [ ] **Step 5: Commit changes**

Run: 
```
git add resources/js/**/*.{js,ts,tsx}
git commit -m "chore: apply ESLint fixes and ensure TypeScript clean"
```

### Task 4: Tailwind CSS Class Order Optimization with Prettier

**Files:**
- Modify: `resources/js/**/*.{js,ts,tsx}` (where Tailwind classes are used), `postcss.config.mjs`, `tailwind.config.cjs` (if any)
- Create: (none)
- Test: `npm run dev` build

**Interfaces:**
- Consumes: JS/TS files with Tailwind classes
- Produces: Consistent Tailwind class ordering

- [ ] **Step 1: Install Prettier and Tailwind CSS Prettier plugin if not present**

Run: `npm install --save-dev prettier prettier-plugin-tailwindcss`

- [ ] **Step 2: Create Prettier config if missing**  
  (`.prettierrc` with tailwind plugin)

Run: `echo '{"plugins": ["prettier-plugin-tailwindcss"]}' > .prettierrc`

- [ ] **Step 3: Run Prettier --write on JS/TS files**

Run: `npx prettier --write resources/js/**/*.{js,ts,tsx}`
Expected: Tailwind classes reordered

- [ ] **Step 4: Run ESLint again to ensure no conflicts**

Run: `npx eslint resources/js/**/*.{js,ts,tsx} --fix`
Expected: No new lint errors

- [ ] **Step 5: Run TypeScript check and Vite build**

Run: `npx tsc --noEmit && npm run build`
Expected: Success

- [ ] **Step 6: Commit changes**

Run: 
```
git add resources/js/**/*.{js,ts,tsx} .prettierrc
git commit -m "chore: optimize Tailwind class order with Prettier"
```

### Task 5: Dependency Security Audits and Updates

**Files:**
- Modify: `composer.json`, `composer.lock`, `package.json`, `package-lock.json`
- Create: (none)
- Test: `composer install && npm install && php artisan test && npm run build`

**Interfaces:**
- Consumes: Current lockfiles
- Produces: Updated dependencies with no known vulnerabilities

- [ ] **Step 1: Run Composer audit**

Run: `composer audit`
Expected: List of known vulnerabilities (if any)

- [ ] **Step 2: Update Composer dependencies to resolve vulnerabilities**

Run: `composer update --lock` (or update specific packages)
Expected: `composer audit` shows no vulnerabilities

- [ ] **Step 3: Run npm audit**

Run: `npm audit`
Expected: List of known vulnerabilities (if any)

- [ ] **Step 4: Update npm dependencies to resolve vulnerabilities**

Run: `npm audit fix` (or `npm install` with specific versions)
Expected: `npm audit` shows no vulnerabilities

- [ ] **Step 5: Re‑install lockfiles**

Run: `composer install && npm install`

- [ ] **Step 6: Run PHPUnit to ensure nothing broke**

Run: `vendor/bin/phpunit`
Expected: All tests pass

- [ ] **Step 7: Run Vite production build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 8: Commit changes**

Run: 
```
git add composer.json composer.lock package.json package-lock.json
git commit -m "chore: fix known vulnerabilities via composer audit and npm audit"
```

### Task 6: Laravel Optimization (Configuration, Route, View Caching)

**Files:**
- Modify: (none – these commands generate cached files in `bootstrap/cache/`)
- Create: (cache files under `bootstrap/cache/`)
- Test: `php artisan test` (ensure caching doesn't break env‑specific logic)

**Interfaces:**
- Consumes: Application configuration, routes, views
- Produces: Cached configuration, routes, views for performance

- [ ] **Step 1: Cache configuration**

Run: `php artisan config:cache`
Expected: Success message

- [ ] **Step 2: Cache routes**

Run: `php artisan route:cache`
Expected: Success message

- [ ] **Step 3: Cache views**

Run: `php artisan view:cache`
Expected: Success message

- [ ] **Step 4: Run PHPUnit to ensure cached app works**

Run: `vendor/bin/phpunit`
Expected: All tests pass (note: some tests may need to clear cache; we can clear after if needed)

- [ ] **Step 5: Commit changes (cache files are usually ignored; if not, add them)**

Run: 
```
git add bootstrap/cache/*.php
git commit -m "chore: cache Laravel config, routes, views for performance"
```
> **Note:** In local development you may want to avoid committing caches; adjust `.gitignore` if needed.

### Task 7: Final Verification – Test Suite and Production Build

**Files:**
- Modify: (none)
- Create: (none)
- Test: Full test suite and production build

**Interfaces:**
- Consumes: All previous fixes
- Produces: Confirmed clean state

- [ ] **Step 1: Clear Laravel caches (if we want a clean dev environment)**

Run: `php artisan config:clear && php artisan route:clear && php artisan view:clear`

- [ ] **Step 2: Run PHPUnit**

Run: `vendor/bin/phpunit`
Expected: All tests pass (211 tests)

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run ESLint (no --fix, just check)**

Run: `npx eslint resources/js/**/*.{js,ts,tsx}`
Expected: No errors

- [ ] **Step 5: Run Pint test (dry‑run)**

Run: `vendor/bin/pint --test`
Expected: No files would be changed

- [ ] **Step 6: Run PHPStan level max (final check)**

Run: `vendor/bin/phpstan analyse -l max app/`
Expected: Zero errors

- [ ] **Step 7: Run Prettier check**

Run: `npx prettier --check resources/js/**/*.{js,ts,tsx}`
Expected: All files already formatted

- [ ] **Step 8: Run Composer audit and npm audit (final check)**

Run: `composer audit && npm audit`
Expected: No known vulnerabilities

- [ ] **Step 9: Run Vite production build**

Run: `npm run build`
Expected: Build succeeds, assets produced in `public/build/`

- [ ] **Step 10: Commit final state**

Run: 
```
git add -u
git commit -m "chore: final verification – all code quality checks pass"
```

## Summary

By completing these tasks we will have:
- PSR12‑compliant PHP code
- PHPStan level max clean
- ESLint‑compliant JS/TS with Prettier‑formatted Tailwind classes
- No known Composer/npm vulnerabilities
- Laravel optimization cache applied
- All existing tests passing
- Successful production build

Each task is designed to be self‑contained and independently verifiable, allowing for easy rollback or manual inspection if needed.