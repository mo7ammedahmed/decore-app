# Decore

Decore is a bilingual (English/Arabic) decorative-material showroom and operations app. The public site presents collections, finishes, project imagery, and contact paths; the authenticated workspace manages materials, suppliers, customers, invoices, payments, reporting, content, and tracking integrations.

## Stack

- PHP 8.3 and Laravel 13
- Inertia.js 2 with React 18 and strict TypeScript
- Tailwind CSS 4 and Vite 8
- SQLite for local development; MySQL/MariaDB-compatible schema for production
- PHPUnit 12 and Laravel Pint

The application is a single Laravel/Inertia deployment. Laravel owns routing, sessions, authorization, validation, and data; React renders the page layer.

## Local setup

Prerequisites: PHP 8.3+, Composer, Node.js 22 LTS, and npm.

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate --seed
npm install
php artisan storage:link
composer dev
```

Open `http://127.0.0.1:8000`. The development seeder creates these local-only accounts, all with password `password`:

- `admin@decore.test`
- `accountant@decore.test`
- `sales@decore.test`

Never use seeded credentials in production.

## Useful commands

```powershell
# Backend tests
composer test

# PHP formatting check / fix
vendor\bin\pint --test
vendor\bin\pint

# Frontend type check and production build
npm run types
npm run build

# Dependency advisories
composer audit
npm audit
```

## Project map

- `app/Http/Controllers` — thin HTTP/Inertia orchestration
- `app/Http/Requests` — input validation and normalization
- `app/Policies` — server-side authorization
- `app/Services` — invoice, payment, image, reporting, and analytics operations
- `resources/js/Pages` — route-oriented Inertia pages
- `resources/js/Components` — shared React interface primitives
- `resources/css/tokens` — generated design tokens and component specifications
- `tests/Feature` — HTTP, authorization, data-integrity, and integration coverage

## Storage

`FILESYSTEM_DISK=s3` is safe in the example environment: when the AWS key, secret, or bucket is absent, the app resolves the default to the local `public` disk. Run `php artisan storage:link` for local uploads. Production S3 deployments must provide all required `AWS_*` values.

## Production checklist

1. Set `APP_ENV=production`, `APP_DEBUG=false`, the canonical `APP_URL`, database credentials, mail settings, and a persistent queue/cache strategy.
2. Provide a unique `APP_KEY`; do not reuse local secrets.
3. Run `composer install --no-dev --optimize-autoloader`, `npm ci`, and `npm run build`.
4. Run `php artisan migrate --force`, then cache configuration, routes, and views in the deployed environment.
5. Run a queue worker when `QUEUE_CONNECTION` is asynchronous.
6. Configure HTTPS, backups, restore testing, log retention, and uptime monitoring for `/up`.
7. Enable marketing pixels only after confirming the site's consent and privacy requirements. Pixels are intentionally scoped to public visitor pages and never execute in the staff workspace.
