<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboard)
    {
    }

    public function index(Request $request): Response
    {
        $period = $request->query('period', 'month');
        $bounds = $this->dashboard->periodBounds(
            $period,
            $request->query('from'),
            $request->query('to'),
        );

        return Inertia::render('Dashboard', [
            'metrics' => $this->dashboard->index($request->user(), $bounds),
            'period' => $period,
            'periodBounds' => $bounds,
            'baseCurrency' => app(\App\Services\CurrencyService::class)->baseCode(),
        ]);
    }
}
