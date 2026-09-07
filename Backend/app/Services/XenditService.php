<?php

namespace App\Services;

use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;

/**
 * XenditService
 *
 * Wrapper tipis di atas Xendit PHP SDK.
 * Tujuannya: memungkinkan dependency injection sehingga bisa di-mock saat testing.
 *
 * Cara pakai di controller:
 *   public function __construct(private XenditService $xendit) {}
 *   $invoice = $this->xendit->getInvoice($xenditInvoiceId);
 *
 * Cara mock di test:
 *   $this->app->instance(XenditService::class, $mockXendit);
 */
class XenditService
{
    private InvoiceApi $invoiceApi;

    public function __construct()
    {
        Configuration::setXenditKey(config('services.xendit.secret_key') ?? env('XENDIT_SECRET_KEY'));
        $this->invoiceApi = new InvoiceApi();
    }

    /**
     * Ambil status invoice dari Xendit berdasarkan invoice ID.
     *
     * @param  string $invoiceId  Xendit invoice ID (bukan order_id)
     * @return object             Invoice object dari Xendit SDK
     */
    public function getInvoice(string $invoiceId): object
    {
        return $this->invoiceApi->getInvoiceById($invoiceId);
    }

    /**
     * Buat invoice baru di Xendit.
     *
     * @param  array $params  Parameter sesuai CreateInvoiceRequest schema
     * @return object         Invoice object yang baru dibuat
     */
    public function createInvoice(array $params): object
    {
        $createInvoiceRequest = new \Xendit\Invoice\CreateInvoiceRequest($params);
        return $this->invoiceApi->createInvoice($createInvoiceRequest);
    }
}
