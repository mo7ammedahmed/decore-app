<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        if (! in_array($request->user()->role->value, ['admin', 'accountant'], true)) {
            abort(403, 'You do not have permission to view audit logs.');
        }

        $logs = AuditLog::query()
            ->with('user:id,name')
            ->when($request->query('action'), fn ($q, $action) => $q->where('action', $action))
            ->when($request->query('from'), fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->query('to'), fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'action' => $request->query('action'),
                'from' => $request->query('from'),
                'to' => $request->query('to'),
            ],
            'actions' => AuditLog::query()->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
