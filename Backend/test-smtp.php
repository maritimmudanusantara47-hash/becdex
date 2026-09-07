<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \Illuminate\Support\Facades\Mail::raw('Test SMTP dari sistem BECdex.', function ($message) {
        $message->to('tes@example.com') // Just some dummy email
            ->subject('Test SMTP Connection');
    });
    echo "SMTP Connection Successful!\n";
} catch (\Exception $e) {
    echo "SMTP Connection Failed!\nError: " . $e->getMessage() . "\n";
}
