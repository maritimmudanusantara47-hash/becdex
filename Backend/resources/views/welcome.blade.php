<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BECdex API — Blue Economy Certification Index</title>
    <meta name="description" content="BECdex REST API documentation. Blue Economy Certification Index backend API for certification, submission, and assessment management." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg:        #0b0f1a;
            --surface:   #111827;
            --surface2:  #1a2235;
            --border:    rgba(255,255,255,0.07);
            --teal:      #14b8a6;
            --teal-dim:  #0d9488;
            --teal-glow: rgba(20,184,166,0.15);
            --blue:      #3b82f6;
            --green:     #22c55e;
            --yellow:    #eab308;
            --red:       #ef4444;
            --purple:    #a855f7;
            --orange:    #f97316;
            --text:      #e2e8f0;
            --muted:     #94a3b8;
            --code-bg:   #0f172a;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.6;
        }

        /* ── HEADER ── */
        header {
            background: linear-gradient(135deg, #0d1b2a 0%, #0b1620 50%, #071219 100%);
            border-bottom: 1px solid var(--border);
            padding: 48px 24px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        header::before {
            content: '';
            position: absolute;
            top: -120px; left: 50%;
            transform: translateX(-50%);
            width: 600px; height: 300px;
            background: radial-gradient(ellipse, rgba(20,184,166,0.18) 0%, transparent 70%);
            pointer-events: none;
        }
        .logo-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: var(--teal-glow);
            border: 1px solid rgba(20,184,166,0.35);
            border-radius: 100px;
            padding: 6px 18px 6px 10px;
            margin-bottom: 24px;
        }
        .logo-icon {
            width: 28px; height: 28px;
            background: linear-gradient(135deg, var(--teal), #0284c7);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; font-weight: 700; color: #fff;
        }
        .logo-badge span { font-size: 13px; font-weight: 600; color: var(--teal); letter-spacing: 0.5px; }
        h1 {
            font-size: clamp(28px, 5vw, 48px);
            font-weight: 700;
            background: linear-gradient(135deg, #fff 30%, var(--teal) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
        }
        .subtitle { color: var(--muted); font-size: 15px; max-width: 520px; margin: 0 auto 28px; }
        .meta-row {
            display: flex; flex-wrap: wrap; gap: 10px;
            justify-content: center; align-items: center;
        }
        .badge {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 5px 12px; border-radius: 100px;
            font-size: 12px; font-weight: 600;
            border: 1px solid;
        }
        .badge-version  { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); color: var(--blue); }
        .badge-live     { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.3);  color: var(--green); }
        .badge-rest     { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.3); color: var(--purple); }
        .badge-json     { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.3); color: var(--orange); }
        .dot-live { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── LAYOUT ── */
        .container { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }

        /* ── BASE URL BOX ── */
        .base-url-box {
            background: var(--code-bg);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 20px 24px;
            margin-bottom: 36px;
            display: flex; flex-wrap: wrap; gap: 16px;
            align-items: center;
        }
        .base-url-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
        .base-url-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px; color: var(--teal);
            background: rgba(20,184,166,0.08);
            padding: 4px 12px; border-radius: 6px;
            border: 1px solid rgba(20,184,166,0.2);
        }

        /* ── SECTION ── */
        .section-title {
            font-size: 11px; font-weight: 700;
            color: var(--muted); text-transform: uppercase;
            letter-spacing: 1.5px; margin-bottom: 12px;
            padding-left: 2px;
        }

        /* ── GROUPS ── */
        .groups { display: grid; gap: 20px; }
        .group {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            transition: border-color .2s;
        }
        .group:hover { border-color: rgba(20,184,166,0.25); }
        .group-header {
            display: flex; align-items: center; gap: 12px;
            padding: 18px 22px;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
            user-select: none;
        }
        .group-icon {
            width: 36px; height: 36px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 17px; flex-shrink: 0;
        }
        .group-name { font-size: 15px; font-weight: 600; }
        .group-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .group-count {
            margin-left: auto;
            font-size: 11px; font-weight: 600;
            color: var(--muted);
            background: var(--surface2);
            padding: 3px 10px; border-radius: 100px;
        }
        .group-chevron { color: var(--muted); font-size: 12px; transition: transform .25s; }
        .group.open .group-chevron { transform: rotate(90deg); }

        /* ── ROUTES ── */
        .routes { display: none; flex-direction: column; }
        .group.open .routes { display: flex; }
        .route {
            display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
            padding: 13px 22px;
            border-bottom: 1px solid var(--border);
            transition: background .15s;
        }
        .route:last-child { border-bottom: none; }
        .route:hover { background: rgba(255,255,255,0.025); }
        .method {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 700;
            padding: 3px 8px; border-radius: 5px;
            min-width: 52px; text-align: center;
            flex-shrink: 0;
        }
        .GET    { background:rgba(34,197,94,0.12);  color:#4ade80; border:1px solid rgba(34,197,94,0.25); }
        .POST   { background:rgba(59,130,246,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.25); }
        .PUT    { background:rgba(234,179,8,0.12);  color:#facc15; border:1px solid rgba(234,179,8,0.25); }
        .DELETE { background:rgba(239,68,68,0.12);  color:#f87171; border:1px solid rgba(239,68,68,0.25); }
        .route-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px; color: var(--text);
            flex: 1; min-width: 200px;
        }
        .route-path span { color: var(--teal); }
        .route-desc { font-size: 12px; color: var(--muted); margin-left: auto; }
        .auth-icon { font-size: 11px; color: #facc15; flex-shrink: 0; }
        .admin-icon { font-size: 11px; color: #f97316; flex-shrink: 0; }

        /* ── AUTH INFO ── */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin-bottom: 36px;
        }
        .info-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 20px;
        }
        .info-card h3 { font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--text); }
        .info-card code {
            display: block;
            background: var(--code-bg);
            border-radius: 8px;
            padding: 12px 14px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: var(--teal);
            line-height: 1.7;
            border: 1px solid var(--border);
        }
        .info-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .info-card ul { list-style: none; font-size: 13px; color: var(--muted); }
        .info-card ul li { padding: 3px 0; }
        .info-card ul li::before { content: '→ '; color: var(--teal); }

        /* ── LEGEND ── */
        .legend {
            display: flex; flex-wrap: wrap; gap: 14px;
            margin-bottom: 20px;
            font-size: 12px; color: var(--muted);
        }
        .legend span { display: flex; align-items: center; gap: 6px; }

        /* ── FOOTER ── */
        footer {
            text-align: center; padding: 24px;
            border-top: 1px solid var(--border);
            font-size: 12px; color: var(--muted);
        }
        footer a { color: var(--teal); text-decoration: none; }

        @media (max-width: 600px) {
            .route-desc { display: none; }
            header { padding: 36px 16px 28px; }
        }
    </style>
</head>
<body>

<!-- HEADER -->
<header>
    <div class="logo-badge">
        <div class="logo-icon">B</div>
        <span>BECdex API</span>
    </div>
    <h1>Blue Economy Certification API</h1>
    <p class="subtitle">REST API backend for Blue Economy certification, submission management, and assessment scoring.</p>
    <div class="meta-row">
        <div class="badge badge-live"><span class="dot-live"></span> Live</div>
        <div class="badge badge-version">v1.0</div>
        <div class="badge badge-rest">REST API</div>
        <div class="badge badge-json">JSON</div>
    </div>
</header>

<!-- MAIN -->
<div class="container">

    <!-- BASE URL -->
    <div class="base-url-box">
        <span class="base-url-label">Base URL</span>
        <span class="base-url-value">{{ url('/api') }}</span>
        <span class="base-url-label" style="margin-left:auto;">Laravel</span>
        <span class="base-url-value">v{{ app()->version() }}</span>
        <span class="base-url-label">PHP</span>
        <span class="base-url-value">v{{ PHP_MAJOR_VERSION }}.{{ PHP_MINOR_VERSION }}</span>
    </div>

    <!-- AUTH INFO -->
    <div class="info-grid">
        <div class="info-card">
            <h3>🔐 Authentication</h3>
            <code>Authorization: Bearer &lt;token&gt;<br>Content-Type: application/json<br>Accept: application/json</code>
        </div>
        <div class="info-card">
            <h3>📋 Response Format</h3>
            <code>{ "status": "success",<br>  "message": "...",<br>  "data": { ... } }</code>
        </div>
        <div class="info-card">
            <h3>🛡️ Auth Levels</h3>
            <ul>
                <li>Public — No token required</li>
                <li>🔒 User — Bearer token required</li>
                <li>🔶 Admin — Admin role required</li>
            </ul>
        </div>
    </div>

    <!-- LEGEND -->
    <div class="legend">
        <span><span class="method GET">GET</span> Read data</span>
        <span><span class="method POST">POST</span> Create</span>
        <span><span class="method PUT">PUT</span> Update</span>
        <span><span class="method DELETE">DELETE</span> Delete</span>
        <span>🔒 Auth required</span>
        <span>🔶 Admin only</span>
    </div>

    <p class="section-title">API Endpoints</p>

    <div class="groups">

        <!-- AUTH -->
        <div class="group open" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(59,130,246,0.1)">🔑</div>
                <div>
                    <div class="group-name">Authentication</div>
                    <div class="group-desc">Register, login, profile, sessions</div>
                </div>
                <span class="group-count">9 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/auth/<span>register</span></span><span class="route-desc">Register new company account</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/auth/<span>login</span></span><span class="route-desc">Login &amp; get Bearer token</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/auth/<span>forgot-password</span></span><span class="route-desc">Send password reset email</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/auth/<span>reset-password</span></span><span class="route-desc">Reset password with token</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/auth/<span>logout</span></span><span class="auth-icon">🔒</span><span class="route-desc">Logout & revoke token</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/auth/<span>me</span></span><span class="auth-icon">🔒</span><span class="route-desc">Get authenticated user</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/auth/<span>profile</span></span><span class="auth-icon">🔒</span><span class="route-desc">Update profile info</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/auth/<span>password</span></span><span class="auth-icon">🔒</span><span class="route-desc">Change password</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/auth/<span>sessions</span></span><span class="auth-icon">🔒</span><span class="route-desc">List active sessions</span></div>
            </div>
        </div>

        <!-- PUBLIC -->
        <div class="group open" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(20,184,166,0.1)">🌐</div>
                <div>
                    <div class="group-name">Public</div>
                    <div class="group-desc">No authentication required</div>
                </div>
                <span class="group-count">6 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/public/<span>verified-companies</span></span><span class="route-desc">List verified companies</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/public/<span>indicators</span></span><span class="route-desc">Catalog of 50 BEC indicators</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/public/<span>downloads</span></span><span class="route-desc">Public downloadable files</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/public/<span>lookups</span></span><span class="route-desc">Master data lookups</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/public/<span>cms</span></span><span class="route-desc">CMS content for frontend</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/public/<span>help</span></span><span class="route-desc">Send help message</span></div>
            </div>
        </div>

        <!-- SUBMISSIONS -->
        <div class="group" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(168,85,247,0.1)">📋</div>
                <div>
                    <div class="group-name">Submissions</div>
                    <div class="group-desc">Assessment submission management</div>
                </div>
                <span class="group-count">14 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions</span><span class="auth-icon">🔒</span><span class="route-desc">List my submissions</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/submissions</span><span class="auth-icon">🔒</span><span class="route-desc">Create new submission</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions/<span>{id}</span></span><span class="auth-icon">🔒</span><span class="route-desc">Get submission detail</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/submissions/<span>{id}</span></span><span class="auth-icon">🔒</span><span class="route-desc">Delete draft submission</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/submissions/<span>{id}</span>/submit</span><span class="auth-icon">🔒</span><span class="route-desc">Submit for verification</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions/<span>{id}</span>/answers</span><span class="auth-icon">🔒</span><span class="route-desc">Get assessment answers</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/submissions/<span>{id}</span>/answers</span><span class="auth-icon">🔒</span><span class="route-desc">Bulk update answers</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions/<span>{id}</span>/documents</span><span class="auth-icon">🔒</span><span class="route-desc">List uploaded documents</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/submissions/<span>{id}</span>/documents</span><span class="auth-icon">🔒</span><span class="route-desc">Upload evidence document</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/submissions/<span>{id}</span>/documents/<span>{docId}</span></span><span class="auth-icon">🔒</span><span class="route-desc">Delete document</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions/<span>{id}</span>/score</span><span class="auth-icon">🔒</span><span class="route-desc">Get score &amp; requirements</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/submissions/<span>{id}</span>/payment</span><span class="auth-icon">🔒</span><span class="route-desc">Initiate Xendit payment</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions/<span>{id}</span>/payment/check</span><span class="auth-icon">🔒</span><span class="route-desc">Check payment status</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/submissions/<span>{id}</span>/activity-logs</span><span class="auth-icon">🔒</span><span class="route-desc">Activity log history</span></div>
            </div>
        </div>

        <!-- NOTIFICATIONS & PAYMENTS -->
        <div class="group" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(234,179,8,0.1)">🔔</div>
                <div>
                    <div class="group-name">Notifications &amp; Payments</div>
                    <div class="group-desc">User notifications and payment history</div>
                </div>
                <span class="group-count">5 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/notifications</span><span class="auth-icon">🔒</span><span class="route-desc">List notifications</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/notifications/<span>mark-read</span></span><span class="auth-icon">🔒</span><span class="route-desc">Mark as read</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/payments</span><span class="auth-icon">🔒</span><span class="route-desc">Payment history</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/payments/<span>{id}</span></span><span class="auth-icon">🔒</span><span class="route-desc">Payment detail</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/payment/<span>webhook</span></span><span class="route-desc">Xendit payment webhook</span></div>
            </div>
        </div>

        <!-- ADMIN SUBMISSIONS -->
        <div class="group" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(249,115,22,0.1)">🛡️</div>
                <div>
                    <div class="group-name">Admin — Submissions</div>
                    <div class="group-desc">Review, verify, score and certify</div>
                </div>
                <span class="group-count">13 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>submissions</span></span><span class="admin-icon">🔶</span><span class="route-desc">All submissions</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/submissions/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Submission detail</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/indicators/<span>{ind}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Score indicator</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/start</span><span class="admin-icon">🔶</span><span class="route-desc">Start verification</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/approve</span><span class="admin-icon">🔶</span><span class="route-desc">Approve submission</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/reject</span><span class="admin-icon">🔶</span><span class="route-desc">Reject submission</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/return</span><span class="admin-icon">🔶</span><span class="route-desc">Return for revision</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/survey</span><span class="admin-icon">🔶</span><span class="route-desc">Schedule field survey</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/submissions/<span>{id}</span>/certificate</span><span class="admin-icon">🔶</span><span class="route-desc">Issue certificate</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>dashboard/stats</span></span><span class="admin-icon">🔶</span><span class="route-desc">Dashboard statistics</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/submissions/<span>export/csv</span></span><span class="admin-icon">🔶</span><span class="route-desc">Export submissions CSV</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>certificates</span></span><span class="admin-icon">🔶</span><span class="route-desc">All certificates</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>payments</span></span><span class="admin-icon">🔶</span><span class="route-desc">All payments</span></div>
            </div>
        </div>

        <!-- ADMIN FRAMEWORK -->
        <div class="group" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(20,184,166,0.1)">📊</div>
                <div>
                    <div class="group-name">Admin — Framework</div>
                    <div class="group-desc">Aspects, outcomes, principles, indicators, questions</div>
                </div>
                <span class="group-count">20 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/framework/<span>aspects</span></span><span class="admin-icon">🔶</span><span class="route-desc">List aspects</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/framework/<span>aspects</span></span><span class="admin-icon">🔶</span><span class="route-desc">Create aspect</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/framework/aspects/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update aspect</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/admin/framework/aspects/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Delete aspect</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/framework/<span>outcomes</span></span><span class="admin-icon">🔶</span><span class="route-desc">List outcomes</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/framework/<span>outcomes</span></span><span class="admin-icon">🔶</span><span class="route-desc">Create outcome</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/framework/outcomes/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update outcome</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/framework/<span>principles</span></span><span class="admin-icon">🔶</span><span class="route-desc">List principles</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/framework/<span>principles</span></span><span class="admin-icon">🔶</span><span class="route-desc">Create principle</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/framework/principles/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update principle</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/framework/<span>indicators</span></span><span class="admin-icon">🔶</span><span class="route-desc">List indicators</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/framework/<span>indicators</span></span><span class="admin-icon">🔶</span><span class="route-desc">Create indicator</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/framework/indicators/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update indicator</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/admin/framework/indicators/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Delete indicator</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/framework/<span>questions</span></span><span class="admin-icon">🔶</span><span class="route-desc">List questions</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/framework/<span>questions</span></span><span class="admin-icon">🔶</span><span class="route-desc">Create question</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/framework/questions/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update question</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/master/<span>countries</span></span><span class="admin-icon">🔶</span><span class="route-desc">List countries</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/master/<span>company-fields</span></span><span class="admin-icon">🔶</span><span class="route-desc">Company field types</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>settings</span></span><span class="admin-icon">🔶</span><span class="route-desc">App settings</span></div>
            </div>
        </div>

        <!-- ADMIN USERS & CMS -->
        <div class="group" onclick="this.classList.toggle('open')">
            <div class="group-header">
                <div class="group-icon" style="background:rgba(59,130,246,0.1)">👥</div>
                <div>
                    <div class="group-name">Admin — Users, CMS &amp; Downloads</div>
                    <div class="group-desc">User management, CMS content, file downloads</div>
                </div>
                <span class="group-count">11 endpoints</span>
                <span class="group-chevron">▶</span>
            </div>
            <div class="routes">
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>users</span></span><span class="admin-icon">🔶</span><span class="route-desc">List all users</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/<span>users</span></span><span class="admin-icon">🔶</span><span class="route-desc">Create user</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/users/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update user</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/admin/users/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Delete user</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/users/<span>{id}/verify</span></span><span class="admin-icon">🔶</span><span class="route-desc">Manually verify user</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>cms</span></span><span class="admin-icon">🔶</span><span class="route-desc">Get all CMS content</span></div>
                <div class="route"><span class="method PUT">PUT</span><span class="route-path">/api/admin/<span>cms</span></span><span class="admin-icon">🔶</span><span class="route-desc">Update CMS content</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>downloads</span></span><span class="admin-icon">🔶</span><span class="route-desc">List downloads</span></div>
                <div class="route"><span class="method POST">POST</span><span class="route-path">/api/admin/<span>downloads</span></span><span class="admin-icon">🔶</span><span class="route-desc">Upload public file</span></div>
                <div class="route"><span class="method DELETE">DELETE</span><span class="route-path">/api/admin/downloads/<span>{id}</span></span><span class="admin-icon">🔶</span><span class="route-desc">Delete download</span></div>
                <div class="route"><span class="method GET">GET</span><span class="route-path">/api/admin/<span>help</span></span><span class="admin-icon">🔶</span><span class="route-desc">Help messages inbox</span></div>
            </div>
        </div>

    </div><!-- /groups -->
</div><!-- /container -->

<footer>
    <p>BECdex API &copy; {{ date('Y') }} — Blue Economy Certification Index &nbsp;·&nbsp; <a href="https://becdex.co" target="_blank">becdex.co</a></p>
</footer>

</body>
</html>
