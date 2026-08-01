<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Supplier;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('supplier:id,name')
            ->when($request->query('search'), fn ($q, $search) => $q
                ->where(fn ($inner) => $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
            ->when($request->query('role'), fn ($q, $role) => $q->where('role', $role))
            ->orderBy('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->query('search'),
                'role' => $request->query('role'),
            ],
            'roleOptions' => UserRole::options(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Users/Create', [
            'roleOptions' => UserRole::options(),
            'suppliers' => Supplier::query()->active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('store', User::class);

        $user = User::create($request->validated());

        AuditService::log('user.created', $user, null, [
            'name' => $user->name,
            'role' => $user->role->value,
        ]);

        return redirect()
            ->route('users.show', $user)
            ->with('success', 'User created successfully.');
    }

    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        return Inertia::render('Users/Show', [
            'user' => $user->load(['supplier:id,name', 'invoices' => fn ($q) => $q->latest('issue_date')->limit(10)]),
            'roleOptions' => UserRole::options(),
        ]);
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roleOptions' => UserRole::options(),
            'suppliers' => Supplier::query()->active()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $oldRole = $user->role->value;
        $oldSupplier = $user->supplier_id;

        $data = $request->validated();

        if (! $request->filled('password')) {
            unset($data['password']);
        }

        $user->update($data);

        AuditService::log('user.updated', $user, [
            'role' => $oldRole,
            'supplier_id' => $oldSupplier,
        ], [
            'role' => $user->role->value,
            'supplier_id' => $user->supplier_id,
        ]);

        return redirect()
            ->route('users.show', $user)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Toggle account activation.
     */
    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        if ($user->id === $request->user()?->id) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        AuditService::log('user.active_toggled', $user, ['is_active' => ! $user->is_active], ['is_active' => $user->is_active]);

        return back()->with('success', 'Account status updated.');
    }
}
