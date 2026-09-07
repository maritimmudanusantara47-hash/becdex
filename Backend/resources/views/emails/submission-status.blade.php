<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pembaruan Status Pengajuan - BECdex</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #0f172a; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { margin-top: 0; color: #0f172a; font-size: 20px; }
        .message-box { background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BECdex System</h1>
        </div>
        <div class="content">
            <h2>Halo, {{ $submission->user->name }}!</h2>
            <p>Terdapat pembaruan status pada pengajuan sertifikasi Anda di BECdex.</p>
            
            <div class="message-box">
                <strong>Status/Pesan Terbaru:</strong><br>
                {{ $messageText }}
            </div>
            
            <p>Silakan login ke dashboard BECdex untuk melihat detail selengkapnya dan mengambil tindakan yang diperlukan.</p>
            
            <center>
                <a href="{{ url(config('app.url') . '/login') }}" class="btn">Login ke Dashboard</a>
            </center>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} BECdex (Blue Economy Company Index). All rights reserved.<br>
            Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.
        </div>
    </div>
</body>
</html>
