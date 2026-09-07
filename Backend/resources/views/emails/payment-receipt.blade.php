<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kwitansi Pembayaran BECdex</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #0D6AA8; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { margin-top: 0; color: #0f172a; font-size: 20px; text-align: center; }
        .receipt-icon { font-size: 60px; margin: 10px 0; text-align: center; }
        
        .receipt-box {
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
        }
        .receipt-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .label { font-weight: bold; color: #64748b; }
        .value { font-weight: 600; color: #0f172a; text-align: right; }
        .amount-value { font-size: 18px; color: #0D6AA8; font-weight: 800; }

        .btn { display: inline-block; background-color: #0D6AA8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; text-align: center; }
        .center-btn { text-align: center; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BECdex Payment Receipt</h1>
        </div>
        <div class="content">
            <div class="receipt-icon">🧾</div>
            <h2>Terima Kasih, {{ $transaction->user->name ?? 'Perusahaan Anda' }}!</h2>
            <p style="text-align: center;">Pembayaran Anda untuk sertifikasi Blue Economy Company Index (BECdex) telah berhasil kami terima.</p>
            
            <div class="receipt-box">
                <div class="receipt-row">
                    <span class="label">Nomor Invoice</span>
                    <span class="value">{{ $transaction->order_id }}</span>
                </div>
                <div class="receipt-row">
                    <span class="label">Tanggal Bayar</span>
                    <span class="value">{{ $transaction->paid_at ? $transaction->paid_at->format('d M Y, H:i') : now()->format('d M Y, H:i') }} WIB</span>
                </div>
                <div class="receipt-row">
                    <span class="label">Metode Pembayaran</span>
                    <span class="value">{{ strtoupper($transaction->payment_type ?? 'Xendit') }}</span>
                </div>
                <div class="receipt-row" style="margin-top: 15px; border-bottom: none;">
                    <span class="label" style="font-size: 16px;">Total Lunas</span>
                    <span class="value amount-value">Rp {{ number_format($transaction->amount, 0, ',', '.') }}</span>
                </div>
            </div>
            
            <p style="text-align: center;">Anda sekarang dapat melanjutkan proses ke tahap penilaian/survei. Semoga sukses dalam proses sertifikasi Ekonomi Biru!</p>
            
            <div class="center-btn">
                <a href="{{ url(config('app.frontend_url', 'http://localhost:3000') . '/dashboard/submissions/' . $transaction->submission_id) }}" class="btn">Lanjutkan ke Dashboard</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} BECdex (Blue Economy Company Index). All rights reserved.<br>
            Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.
        </div>
    </div>
</body>
</html>
