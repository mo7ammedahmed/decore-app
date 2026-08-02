<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $customers = Customer::query()
            ->search($request->query('search'))
            ->withCount('invoices')
            ->when($request->query('city'), fn ($q, $city) => $q->where('city', $city))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->query('search'),
                'city' => $request->query('city'),
            ],
            'canManage' => $request->user()->isAdmin() || $request->user()->isSalesStaff(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('Customers/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $this->authorize('store', Customer::class);

        $customer = Customer::create([
            ...$request->validated(),
            'created_by' => $request->user()?->id,
        ]);

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'customer.created');
    }

    public function show(Customer $customer): Response
    {
        $this->authorize('view', $customer);

        return Inertia::render('Customers/Show', [
            'customer' => $customer->load([
                'invoices' => fn ($q) => $q->latest('issue_date')->limit(15),
                'creator:id,name',
            ]),
            'canManage' => $request->user()->can('update', $customer),
            'canCreateInvoice' => $request->user()->can('create', Invoice::class),
        ]);
    }

    public function edit(Customer $customer): Response
    {
        $this->authorize('update', $customer);

        return Inertia::render('Customers/Edit', ['customer' => $customer]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        $customer->update($request->validated());

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'customer.updated');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        if (Invoice::query()->where('customer_id', $customer->id)->exists()) {
            return back()->with('error', 'customer.delete_has_invoices');
        }

        $customer->delete();

        return redirect()
            ->route('customers.index')
            ->with('success', 'customer.archived');
    }
}
