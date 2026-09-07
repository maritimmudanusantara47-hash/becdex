<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
@if(isset($config) && is_array($config) && count($config) > 0)
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }
        body {
            font-family: 'Helvetica', sans-serif;
            color: #000;
            position: relative;
            margin: 0;
            padding: 0;
        }
        .dynamic-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -10;
        }
        .dynamic-element {
            position: absolute;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }
    </style>
@else
    <style>
        @page {
            size: A4 portrait;
            margin: 40px 50px;
        }
        body {
            font-family: 'Helvetica', sans-serif;
            color: #000;
            position: relative;
            margin: 0;
            padding: 0;
        }
        /* Watermark Placeholder */
        .watermark {
            position: absolute;
            top: 25%;
            left: 10%;
            width: 80%;
            opacity: 0.05;
            z-index: -1;
            text-align: center;
        }
        .watermark-circle {
            width: 500px;
            height: 500px;
            border: 15px solid #0056b3;
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            font-weight: bold;
            color: #0056b3;
            transform: rotate(-30deg);
            line-height: 500px;
        }

        /* Top Header */
        .top-banner {
            background-color: #0056b3;
            color: #fff;
            text-align: center;
            padding: 15px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            width: 75%;
            float: left;
        }
        .top-logo-placeholder {
            width: 20%;
            float: right;
            border: 2px dashed #0056b3;
            height: 60px;
            text-align: center;
            line-height: 60px;
            font-size: 10px;
            color: #0056b3;
        }
        .clear { clear: both; }

        .mmic-code {
            text-align: right;
            margin-top: 10px;
            font-size: 12px;
            font-weight: bold;
        }

        /* Company Header */
        .company-header {
            margin-top: 15px;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
        }
        .ch-logo {
            float: left;
            width: 15%;
            height: 60px;
            border: 2px dashed #cca300;
            text-align: center;
            font-size: 10px;
            line-height: 60px;
            color: #cca300;
        }
        .ch-text {
            float: left;
            width: 80%;
            padding-left: 20px;
        }
        .ch-title {
            color: #0056b3;
            font-size: 16px;
            font-weight: bold;
        }
        .ch-title span { color: #cca300; }
        .ch-subtitle {
            font-weight: bold;
            font-size: 12px;
            margin-top: 5px;
        }
        .ch-address {
            font-size: 10px;
            line-height: 1.4;
            margin-top: 3px;
        }

        /* Main Content */
        .main-content {
            margin-top: 30px;
            padding-left: 20px;
            padding-right: 20px;
        }
        .text-certify {
            font-weight: bold;
            font-size: 14px;
        }
        .text-certify i {
            font-weight: normal;
            font-size: 13px;
            display: block;
            margin-top: 3px;
        }
        
        .c-name {
            font-size: 20px;
            font-weight: bold;
            margin-top: 15px;
        }
        .c-address {
            font-size: 12px;
            margin-top: 8px;
            line-height: 1.4;
            width: 80%;
        }

        .text-qualified {
            font-weight: bold;
            font-size: 14px;
            margin-top: 25px;
        }
        .text-qualified i {
            font-weight: normal;
            font-size: 13px;
            display: block;
            margin-top: 3px;
        }

        .c-award {
            color: #0056b3;
            font-size: 24px;
            font-weight: bold;
            margin-top: 15px;
        }

        .text-because {
            font-weight: bold;
            font-size: 13px;
            margin-top: 25px;
        }
        .text-because i {
            font-weight: normal;
            font-size: 12px;
            display: block;
            margin-top: 3px;
        }
        .c-index {
            font-size: 18px;
            font-weight: bold;
            margin-top: 12px;
        }

        /* Category & Sector */
        .cat-box {
            margin-top: 30px;
        }
        .cat-left {
            float: left;
            width: 35%;
        }
        .cat-text {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .cat-text span { color: #0056b3; }
        
        .cat-badge {
            float: left;
            width: 60%;
            height: 70px;
            border: 2px dashed #0056b3;
            text-align: center;
            line-height: 70px;
            color: #0056b3;
            font-weight: bold;
            font-size: 12px;
        }

        .sector-box {
            margin-top: 30px;
            font-weight: bold;
            font-size: 14px;
        }
        .sector-box span {
            font-weight: normal;
            margin-left: 10px;
        }

        /* Footer Terms */
        .footer-terms {
            margin-top: 35px;
            font-size: 10px;
            font-weight: bold;
            text-align: justify;
            line-height: 1.4;
        }
        .footer-terms i {
            display: block;
            margin-top: 5px;
        }

        /* Signatures */
        .signatures {
            margin-top: 30px;
            width: 100%;
        }
        .sig-left {
            width: 60%;
            float: left;
        }
        .sig-right {
            width: 40%;
            float: right;
            text-align: center;
        }
        .logos-bottom {
            height: 50px;
            border: 2px dashed #999;
            width: 150px;
            text-align: center;
            line-height: 50px;
            font-size: 10px;
            color: #999;
            margin-bottom: 15px;
        }
        
        .dates-table {
            width: 100%;
            font-size: 9px;
            line-height: 1.4;
        }
        .dates-table td {
            vertical-align: top;
        }

        .dir-signature {
            height: 60px;
            position: relative;
        }
        .dir-name {
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #000;
            display: inline-block;
            padding-bottom: 3px;
            min-width: 150px;
        }
        .dir-title {
            font-size: 11px;
            margin-top: 5px;
        }
        .dir-title i {
            display: block;
        }
    </style>
@endif
</head>
<body>
@if(isset($config) && is_array($config) && count($config) > 0)
    
    @if(isset($bg_image_base64) && !empty($bg_image_base64))
        <img src="{{ $bg_image_base64 }}" class="dynamic-bg" />
    @endif

    @foreach($config as $key => $style)
        <div class="dynamic-element" style="
            left: {{ $style['x'] ?? 0 }}%;
            top: {{ $style['y'] ?? 0 }}%;
            font-size: {{ $style['fontSize'] ?? 16 }}px;
            color: {{ $style['color'] ?? '#000000' }};
            text-align: {{ $style['textAlign'] ?? 'left' }};
            font-family: {{ $style['fontFamily'] ?? 'Helvetica, sans-serif' }};
            font-weight: {{ $style['fontWeight'] ?? 'normal' }};
            width: {{ $style['width'] ?? 'auto' }};
        ">
            @if($key === 'company_name')
                {{ $company_name ?? '' }}
            @elseif($key === 'company_address')
                {{ $company_address ?? '' }}
            @elseif($key === 'mmic_code')
                {{ $mmic_code ?? '' }}
            @elseif($key === 'company_sector')
                {{ $company_sector ?? '' }}
            @elseif($key === 'company_sector_en')
                {{ $company_sector_en ?? '' }}
            @elseif($key === 'published_date_1' || $key === 'published_date_2' || $key === 'published_date')
                {{ $published_date ?? '' }}
            @elseif($key === 'published_date_1_en' || $key === 'published_date_2_en')
                {{ $published_date_en ?? '' }}
            @elseif($key === 'valid_until')
                sampai {{ $valid_until ?? '' }}
            @elseif($key === 'valid_until_en')
                until {{ $valid_until_en ?? '' }}
            @elseif($key === 'score')
                {{ $becdex_score ?? '' }}
            @elseif($key === 'qr_code')
                @if(isset($qr_base64) && !empty($qr_base64) && strlen($qr_base64) > 50)
                    <img src="{{ $qr_base64 }}" style="width: {{ $style['fontSize'] ?? 80 }}px; height: {{ $style['fontSize'] ?? 80 }}px;" />
                @else
                    <span style="display:inline-block; width: {{ $style['fontSize'] ?? 80 }}px; text-align: center;">[QR]</span>
                @endif
            @else
                {{ $style['text'] ?? '' }}
            @endif
        </div>
    @endforeach

@else
    <div class="watermark">
        <div class="watermark-circle">BLUE ECONOMY INDEX</div>
    </div>

    <!-- Header -->
    <div>
        <div class="top-banner">CERTIFICATE</div>
        <div class="top-logo-placeholder">[Logo M]</div>
        <div class="clear"></div>
    </div>
    
    <div class="mmic-code">Certificate No. MICC {{ $mmic_code ?? '' }}</div>

    <div class="company-header">
        <div class="ch-logo">[Logo ICC]</div>
        <div class="ch-text">
            <div class="ch-title">MARITIMEPRENEUR <span>INTERNATIONAL CERTIFICATION CENTER</span></div>
            <div class="ch-subtitle">PT Mahakarya Maritim Indonesia</div>
            <div class="ch-address">
                Indonesia Blue Economy Center (IBEC), Campus C STIE Indonesia<br/>
                Jl. Pratekan No. 9A, Jakarta 13220 | Phone: +62214891137, Email: info@becdex.com
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <!-- Content -->
    <div class="main-content">
        <div class="text-certify">
            Menyatakan bahwa
            <i>Certify that</i>
        </div>
        
        <div class="c-name">{{ $company_name ?? '' }}</div>
        <div class="c-address">{{ $company_address ?? '' }}</div>

        <div class="text-qualified">
            telah memenuhi syarat sebagai
            <i>has qualified as</i>
        </div>

        <div class="c-award">Blue Economy Company</div>

        <div class="text-because">
            karena menerapkan prinsip-prinsip ekonomi biru dengan memenuhi
            <i>for implementing blue economy principles that comply with</i>
        </div>

        <div class="c-index">Blue Economy Company Index (BECdex)</div>

        <div class="cat-box">
            <div class="cat-left">
                @php
                    $catId = $becdex_category_id ?? 10;
                    $catIdId = 'Baik'; $catEn = 'Good';
                    if($catId == 12) { $catIdId = 'Standar'; $catEn = 'Standard'; }
                    if($catId == 11) { $catIdId = 'Sangat Baik'; $catEn = 'Excellent'; }
                @endphp
                <div class="cat-text">Kategori : <span>{{ $catIdId }}</span></div>
                <div class="cat-text" style="font-style:italic; font-weight:normal;">Category : <span style="font-style:italic; font-weight:bold;">{{ $catEn }}</span></div>
            </div>
            <div class="cat-badge">
                [Lencana/Badge Kategori BECdex]
            </div>
            <div class="clear"></div>
        </div>

        <div class="sector-box">
            Company Sector : <span>{{ $company_sector ?? '' }}</span>
        </div>

        <div class="footer-terms">
            Sertifikat ini berlaku dengan ketentuan bahwa perusahaan selalu memenuhi prinsip dan indikator blue economy company index sebagaimana ditetapkan oleh MARITIMEPRENEUR INTERNATIONAL CERTIFICATION CENTER.
            <i>This certificate is valid provided that the company continues to meet the principles and indicators of blue economy company index as determined by MARITIMEPRENEUR INTERNATIONAL CERTIFICATION CENTER.</i>
        </div>

        <div class="signatures">
            <div class="sig-left">
                <div class="logos-bottom">[Logo KAN & IAF]</div>
                <table class="dates-table" border="0" cellspacing="0" cellpadding="2">
                    <tr>
                        <td width="30%">Sertifikat ini berlaku dari<br/><i>This certificate is valid from</i></td>
                        <td width="20%"><b>{{ $published_date ?? '' }}</b><br/><b>{{ $published_date ?? '' }}</b></td>
                        <td width="15%">sampai<br/><i>until</i></td>
                        <td width="35%"><b>{{ $valid_until ?? '' }}</b><br/><b>{{ $valid_until ?? '' }}</b></td>
                    </tr>
                    <tr>
                        <td colspan="2">Sertifikat ini diberikan pertama kali pada<br/><i>This certificate has been granted for the first time on</i></td>
                        <td colspan="2"><b>{{ $published_date ?? '' }}</b><br/><b>{{ $published_date ?? '' }}</b></td>
                    </tr>
                </table>
            </div>
            <div class="sig-right">
                <div class="dir-signature">
                    @if (isset($qr_base64) && $qr_base64)
                        <img src="{{ $qr_base64 }}" style="width: 50px; height: 50px; float: left; margin-top: 10px; margin-left: 10px;" />
                    @endif
                </div>
                <div class="dir-name">{{ $director_name ?? '' }}</div>
                <div class="dir-title">
                    Direktur
                    <i>Director</i>
                </div>
            </div>
            <div class="clear"></div>
        </div>
    </div>
@endif
</body>
</html>
