<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sertifikat Kelulusan BECdex</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #334155; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #059669; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
        .content { padding: 40px 30px; line-height: 1.6; text-align: center; }
        .content h2 { margin-top: 0; color: #0f172a; font-size: 20px; }
        .medal-icon { font-size: 60px; margin: 10px 0; }
        .highlight { font-size: 18px; color: #059669; font-weight: bold; margin: 20px 0; }
        .btn { display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BECdex Certification</h1>
        </div>
        <div class="content">
            <div class="medal-icon">🏆</div>
            <h2>Selamat, {{ $submission->user->name }}!</h2>
            <p>Perusahaan Anda telah berhasil melewati serangkaian verifikasi dan dinyatakan lulus sertifikasi Ekonomi Biru oleh tim asesor BECdex.</p>
            
            <div class="highlight">
                Kami telah melampirkan Sertifikat Kelulusan resmi Anda pada email ini.
            </div>
            
            <p>Sertifikat tersebut juga dapat diunduh kapan saja melalui portal dashboard pengguna.</p>
            
            <a href="{{ url(config('app.url') . '/dashboard/submissions/' . $submission->id) }}" class="btn">Lihat Sertifikat di Dashboard</a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} BECdex (Blue Economy Company Index). All rights reserved.<br>
            Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.
        </div>
    </div>
</body>
</html>
