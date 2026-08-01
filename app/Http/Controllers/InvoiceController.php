<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\ShopSetting;
use App\Models\TaxRate;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoices)
    {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $user = $request->user();

        $invoices = Invoice::query()
            ->with(['customer:id,name', 'creator:id,name'])
            ->when($user->isSalesStaff(), fn ($q) => $q->where('created_by', $user->id))
            ->when($request->query('search'), fn ($q, $search) => $q
                ->where('invoice_number', 'like', "%{$search}%"))
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('payment_status'), fn ($q, $status) => $q->where('payment_status', $status))
            ->when($request->query('customer'), fn ($q, $id) => $q->where('customer_id', $id))
            ->when($request->query('from'), fn ($q, $from) => $q->whereDate('issue_date', '>=', $from))
            ->when($request->query('to'), fn ($q, $to) => $q->whereDate('issue_date', '<=', $to))
            ->orderByDesc('issue_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
                'payment_status' => $request->query('payment_status'),
                'customer' => $request->query('customer'),
                'from' => $request->query('from'),
                'to' => $request->query('to'),
            ],
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name']),
            'canManage' => $user->isAdmin() || $user->isAccountant(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Invoice::class);

        return Inertia::render('Invoices/Create', [
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name']),
            'currencies' => Currency::query()->active()->get(['code', 'name', 'symbol', 'is_base']),
            'materials' => $this->materialOptions($request->user()),
            'taxRates' => TaxRate::query()->active()->get(['id', 'name', 'rate', 'is_default']),
            'canCreateCustomer' => $request->user()->can('create', Customer::class),
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $this->authorize('store', Invoice::class);

        // The inline customer and the invoice are created in one transaction so
        // a failure never leaves an orphaned customer behind.
        $invoice = DB::transaction(function () use ($request) {
            return $this->invoices->create(
                [
                    ...$request->safe()->only(['issue_date', 'due_date', 'currency_code', 'discount_type', 'discount_value', 'notes']),
                    'customer_id' => $this->resolveCustomerId($request),
                ],
                $request->validated('items'),
                $request->user(),
            );
        });

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice draft created successfully.');
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load([
            'customer',
            'creator:id,name',
            'items.material:id,name_en,name_ar,sku',
            'payments' => fn ($q) => $q->with('recorder:id,name')->orderByDesc('paid_at'),
        ]);

        $this->hideCostSnapshots($invoice);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'canEdit' => $invoice->status->isEditable()
                && (auth()->user()->isAdmin() || auth()->user()->isAccountant()
                    || (auth()->user()->isSalesStaff() && auth()->id() === $invoice->created_by)),
            'canManage' => auth()->user()->isAdmin() || auth()->user()->isAccountant(),
            'canRecordPayment' => auth()->user()->isAdmin() || auth()->user()->isAccountant(),
            'baseCurrency' => $invoice->base_currency_code,
        ]);
    }

    public function edit(Request $request, Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        $invoice->load('items');

        $this->hideCostSnapshots($invoice);

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name']),
            'materials' => $this->materialOptions(auth()->user()),
            'taxRates' => TaxRate::query()->active()->get(['id', 'name', 'rate', 'is_default']),
            'canCreateCustomer' => $request->user()->can('create', Customer::class),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        // The inline customer and the invoice update happen in one transaction so
        // a failure never leaves an orphaned customer behind.
        $invoice = DB::transaction(function () use ($request, $invoice) {
            return $this->invoices->update(
                $invoice,
                [
                    ...$request->safe()->only(['issue_date', 'due_date', 'discount_type', 'discount_value', 'notes']),
                    'customer_id' => $this->resolveCustomerId($request),
                ],
                $request->validated('items'),
                $request->user(),
            );
        });

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice draft updated successfully.');
    }

    /**
     * Resolve the invoice's customer: reuse the submitted customer_id, or — when
     * an inline "quick add" customer payload is present — create that customer
     * and return its id. Authorization for customer creation is enforced here,
     * before any write, so a forbidden request never persists a record.
     */
    private function resolveCustomerId(Request $request): int
    {
        $customerId = $request->validated('customer_id');

        if ($request->validated('customer') !== null) {
            $this->authorize('create', Customer::class);

            $customer = Customer::create([
                ...$request->validated('customer'),
                'created_by' => $request->user()->id,
            ]);

            $customerId = $customer->id;
        }

        return (int) $customerId;
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        try {
            $this->invoices->deleteDraft($invoice, auth()->user());
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('invoices.index')
            ->with('success', 'Invoice draft deleted.');
    }

    public function issue(Invoice $invoice): RedirectResponse
    {
        $this->authorize('issue', $invoice);

        try {
            $this->invoices->issue($invoice, auth()->user());
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice issued.');
    }

    public function complete(Invoice $invoice): RedirectResponse
    {
        $this->authorize('complete', $invoice);

        try {
            $this->invoices->complete($invoice, auth()->user());
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice completed.');
    }

    public function cancel(Invoice $invoice): RedirectResponse
    {
        $this->authorize('cancel', $invoice);

        try {
            $this->invoices->cancel($invoice, auth()->user());
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice cancelled.');
    }

    public function print(Invoice $invoice): Response
    {
        $this->authorize('print', $invoice);

        $invoice->load(['customer', 'creator:id,name', 'items.material:id,name_en,name_ar,sku']);

        $this->hideCostSnapshots($invoice);

        $settings = ShopSetting::instance();

        return Inertia::render('Invoices/Print', [
            'invoice' => $invoice,
            'baseCurrency' => $invoice->base_currency_code,
            'settings' => [
                'name' => $settings->shop_name,
                'tagline' => $settings->tagline,
                'logo_url' => $settings->logoUrl(),
                'phone' => $settings->phone,
                'email' => $settings->email,
                'address' => $settings->address,
                'city' => $settings->city,
                'tax_number' => $settings->tax_number,
                'commercial_registration' => $settings->commercial_registration,
                'template' => $settings->invoice_template,
                'accent' => $settings->invoice_accent,
                'footer_note' => $settings->invoice_footer_note,
                'thank_you' => $settings->invoice_thank_you,
            ],
        ]);
    }

    /**
     * Supplier cost snapshots are sensitive — hide them from non-finance roles
     * so they never reach the browser payload.
     */
    protected function hideCostSnapshots(Invoice $invoice): void
    {
        if (! auth()->user()->role->canManageCosts()) {
            $invoice->items->each->makeHidden(['unit_cost', 'base_unit_cost', 'base_line_total']);
        }
    }

    /**
     * Materials available for invoice line items, scoped for sales staff so
     * supplier cost data is never exposed.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Material>
     */
    protected function materialOptions(\Illuminate\Contracts\Auth\Authenticatable $user)
    {
        $query = Material::query()
            ->active()
            ->with([
                'supplier:id,name',
                'classification:id,name_en,name_ar',
            ])
            ->orderBy('name_en');

        // Sales staff must not see supplier costs.
        if (! $user->role->canManageCosts()) {
            $query->select('id', 'name_en', 'name_ar', 'sku', 'unit', 'selling_price', 'currency_code', 'supplier_id', 'classification_id');
        }

        return $query->get();
    }
}
