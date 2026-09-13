<?php

use App\Http\Controllers\Admin\CertificateAdminController;
use App\Http\Controllers\CertificateTemplateController;
use App\Http\Controllers\Admin\FrameworkAdminController;
use App\Http\Controllers\Admin\PaymentAdminController;
use App\Http\Controllers\Admin\SettingAdminController;
use App\Http\Controllers\Admin\SubmissionAdminController;
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Submission\AnswerController;
use App\Http\Controllers\Submission\DocumentController;
use App\Http\Controllers\Submission\PaymentController;
use App\Http\Controllers\Submission\SubmissionController;
use App\Http\Controllers\Admin\HelpAdminController;
use App\Http\Controllers\Admin\DownloadAdminController;
use App\Http\Controllers\Submission\AssessorController;
use App\Http\Controllers\Submission\ActivityLogController;
use App\Http\Controllers\Submission\FieldSurveyController;
use App\Http\Controllers\IndicatorCommentController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BECdex API Routes
|--------------------------------------------------------------------------
|
| Prefix: /api
|
*/

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware(env('APP_ENV') === 'local' ? 'throttle:60,1' : 'throttle:10,1');
    // Rate limiting: max 5 login attempts per minute per IP (brute-force protection)
    Route::post('login', [AuthController::class, 'login'])->middleware(env('APP_ENV') === 'local' ? 'throttle:100,1' : 'throttle:5,1');
    
    // Password Reset Routes
    Route::post('forgot-password', [\App\Http\Controllers\Auth\NewPasswordController::class, 'forgotPassword'])
        ->middleware('throttle:3,1')
        ->name('password.email');
    Route::post('reset-password', [\App\Http\Controllers\Auth\NewPasswordController::class, 'resetPassword'])
        ->name('password.update');
    // Email Verification Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('email/verify/{id}/{hash}', [\App\Http\Controllers\Auth\VerifyEmailController::class, 'verify'])
            ->name('verification.verify');
        Route::post('email/verification-notification', [\App\Http\Controllers\Auth\VerifyEmailController::class, 'resend'])
            ->middleware('throttle:6,1')
            ->name('verification.send');
    });
});

// Public informational endpoints
Route::prefix('public')->group(function () {
    Route::get('verified-companies', [PublicController::class, 'verifiedCompanies'])->middleware('throttle:60,1');
    Route::get('indicators',         [PublicController::class, 'catalogIndicators'])->middleware('throttle:30,1');
    Route::get('downloads',          [PublicController::class, 'downloads'])->middleware('throttle:60,1');
    Route::post('help',              [PublicController::class, 'sendHelp'])->middleware('throttle:5,1');
    Route::get('lookups',            [PublicController::class, 'lookups'])->middleware('throttle:60,1');
    Route::get('/cms', [App\Http\Controllers\Public\CmsController::class, 'index'])->middleware('throttle:60,1');
    Route::get('submissions/{id}/certificate/download', [SubmissionController::class, 'downloadCertificate']);
});

// Midtrans webhook (must be public, no auth)
Route::post('payment/webhook', [PaymentController::class, 'webhook']);

// ── AUTHENTICATED ROUTES ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::delete('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',        [AuthController::class, 'me']);
    Route::put('auth/profile',       [AuthController::class, 'updateProfile']);
    Route::put('auth/password',      [AuthController::class, 'updatePassword']);
    Route::post('auth/profile/photo', [AuthController::class, 'uploadPhoto']);
    Route::post('auth/profile/documents', [AuthController::class, 'uploadDocuments']);
    Route::get('auth/sessions', [AuthController::class, 'getSessions']);
    Route::delete('auth/sessions/{id}', [AuthController::class, 'revokeSession']);

    // Submissions (Company User) - Must be verified
    Route::middleware('verified')->prefix('submissions')->group(function () {
        Route::get('/',    [SubmissionController::class, 'index']);
        Route::post('/',   [SubmissionController::class, 'store']);
        Route::get('/{id}', [SubmissionController::class, 'show']);
        Route::delete('/{id}', [SubmissionController::class, 'destroy']);
        Route::post('/{id}/submit', [SubmissionController::class, 'submitForVerification']);

        // Answers
        Route::get('/{id}/answers',  [AnswerController::class, 'index']);
        Route::put('/{id}/answers',  [AnswerController::class, 'bulkUpdate']);

        // Documents
        Route::get('/{id}/documents',            [DocumentController::class, 'index']);
        Route::post('/{id}/documents',            [DocumentController::class, 'upload']);
        Route::delete('/{id}/documents/{docId}',  [DocumentController::class, 'destroy']);

        // Activity Logs
        Route::get('/{id}/activity-logs',  [ActivityLogController::class, 'index']);

        // Score & Payment
        Route::get('/{id}/score',          [PaymentController::class, 'score']);
        Route::post('/{id}/payment',       [PaymentController::class, 'initiate']);
        Route::get('/{id}/payment/check',  [PaymentController::class, 'checkPayment']); // Bug #7: poll Xendit status
        
        // Assessors
        Route::get('/{id}/assessors', [AssessorController::class, 'index']);
        
        // Indicator Comments
        Route::get('/{id}/indicators/{indicator_id}/comments', [IndicatorCommentController::class, 'index']);
        Route::post('/{id}/indicators/{indicator_id}/comments', [IndicatorCommentController::class, 'store']);
        Route::put('/{id}/indicators/{indicator_id}/comments/{comment_id}', [IndicatorCommentController::class, 'update']);
    });

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/mark-read', [NotificationController::class, 'markAsRead']);

    // Payment history for company user
    Route::get('payments',      [PaymentController::class, 'userIndex']);
    Route::get('payments/{id}', [PaymentController::class, 'userShow']);

    // ── ADMIN ROUTES ──────────────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {

        // ── SHARED: Semua role admin bisa akses dashboard stats ──────────
        Route::get('dashboard/stats', [SubmissionAdminController::class, 'stats']);

        // ── ASSESSMENT: Super Admin + QC Admin + Assessment Admin ─────────
        Route::middleware('assessment_admin')->group(function () {

            // ── READ SUBMISSIONS: juga diakses Certificate Admin (submission_reader handled separately below)
            // Aksi verifikasi — hanya assessment role
            Route::get('submissions/export/csv',            [SubmissionController::class, 'exportCsv']);
            Route::put('submissions/{id}/indicators/{ind}', [SubmissionAdminController::class, 'updateIndicator']);
            Route::post('submissions/{id}/survey',          [SubmissionAdminController::class, 'addSurvey']);
            Route::post('submissions/{id}/start',           [SubmissionAdminController::class, 'startVerification']);
            Route::post('submissions/{id}/approve',         [SubmissionAdminController::class, 'approve']);
            Route::post('submissions/{id}/reject',          [SubmissionAdminController::class, 'reject']);
            Route::post('submissions/{id}/return',          [SubmissionAdminController::class, 'returnToUser']);

            // Assessors Assignment
            Route::get('assessors/available',               [AssessorController::class, 'availableAssessors']);
            Route::get('submissions/{id}/assessors',        [AssessorController::class, 'getAssigned']);
            Route::post('submissions/{id}/assessors',       [AssessorController::class, 'assign']);

            // Indicator Comments for Admin
            Route::get('submissions/{id}/indicators/{indicator_id}/comments',  [IndicatorCommentController::class, 'index']);
            Route::post('submissions/{id}/indicators/{indicator_id}/comments', [IndicatorCommentController::class, 'store']);
            Route::put('submissions/{id}/indicators/{indicator_id}/comments/{comment_id}', [IndicatorCommentController::class, 'update']);

            // Activity Logs
            Route::get('submissions/{id}/activity-logs', [ActivityLogController::class, 'index']);

            // Field Surveys
            Route::get('submissions/{id}/surveys',  [FieldSurveyController::class, 'index']);
            Route::post('submissions/{id}/surveys', [FieldSurveyController::class, 'store']);
            Route::put('surveys/{id}',              [FieldSurveyController::class, 'update']);
            Route::post('surveys/{id}/upload',      [FieldSurveyController::class, 'uploadFile']);

            // Framework CRUD
            Route::get('framework/aspects',          [FrameworkAdminController::class, 'indexAspects']);
            Route::post('framework/aspects',         [FrameworkAdminController::class, 'storeAspect']);
            Route::put('framework/aspects/{id}',     [FrameworkAdminController::class, 'updateAspect']);
            Route::delete('framework/aspects/{id}',  [FrameworkAdminController::class, 'destroyAspect']);

            Route::get('framework/outcomes',         [FrameworkAdminController::class, 'indexOutcomes']);
            Route::post('framework/outcomes',        [FrameworkAdminController::class, 'storeOutcome']);
            Route::put('framework/outcomes/{id}',    [FrameworkAdminController::class, 'updateOutcome']);
            Route::delete('framework/outcomes/{id}', [FrameworkAdminController::class, 'destroyOutcome']);

            Route::get('framework/principles',         [FrameworkAdminController::class, 'indexPrinciples']);
            Route::post('framework/principles',        [FrameworkAdminController::class, 'storePrinciple']);
            Route::put('framework/principles/{id}',    [FrameworkAdminController::class, 'updatePrinciple']);
            Route::delete('framework/principles/{id}', [FrameworkAdminController::class, 'destroyPrinciple']);

            Route::get('framework/indicators',         [FrameworkAdminController::class, 'indexIndicators']);
            Route::post('framework/indicators',        [FrameworkAdminController::class, 'storeIndicator']);
            Route::put('framework/indicators/{id}',    [FrameworkAdminController::class, 'updateIndicator']);
            Route::delete('framework/indicators/{id}', [FrameworkAdminController::class, 'destroyIndicator']);

            Route::get('framework/questions',         [FrameworkAdminController::class, 'indexQuestions']);
            Route::post('framework/questions',        [FrameworkAdminController::class, 'storeQuestion']);
            Route::put('framework/questions/{id}',    [FrameworkAdminController::class, 'updateQuestion']);
            Route::delete('framework/questions/{id}', [FrameworkAdminController::class, 'destroyQuestion']);

            // Master Data CRUD
            Route::get('master/company-fields',          [FrameworkAdminController::class, 'indexCompanyFields']);
            Route::post('master/company-fields',         [FrameworkAdminController::class, 'storeCompanyField']);
            Route::put('master/company-fields/{id}',     [FrameworkAdminController::class, 'updateCompanyField']);
            Route::delete('master/company-fields/{id}',  [FrameworkAdminController::class, 'destroyCompanyField']);

            Route::get('master/countries',         [FrameworkAdminController::class, 'indexCountries']);
            Route::post('master/countries',        [FrameworkAdminController::class, 'storeCountry']);
            Route::put('master/countries/{id}',    [FrameworkAdminController::class, 'updateCountry']);
            Route::delete('master/countries/{id}', [FrameworkAdminController::class, 'destroyCountry']);

            // Help Messages
            Route::get('help',           [HelpAdminController::class, 'index']);
            Route::put('help/{id}/read', [HelpAdminController::class, 'markAsRead']);
            Route::delete('help/{id}',   [HelpAdminController::class, 'destroy']);

            // Downloads Management
            Route::get('downloads',          [DownloadAdminController::class, 'index']);
            Route::post('downloads',         [DownloadAdminController::class, 'store']);
            Route::delete('downloads/{id}',  [DownloadAdminController::class, 'destroy']);

            // CMS Management
            Route::get('cms',              [App\Http\Controllers\Admin\CmsController::class, 'index']);
            Route::put('cms',              [App\Http\Controllers\Admin\CmsController::class, 'update']);
            Route::post('cms/{id}/image',  [App\Http\Controllers\Admin\CmsController::class, 'uploadImage']);
        });

        // ── SUBMISSION READ: Super Admin + QC Admin + Assessment Admin + Certificate Admin ──
        // Certificate Admin perlu READ submission untuk bisa menerbitkan sertifikat
        Route::middleware('submission_reader')->group(function () {
            Route::get('submissions',      [SubmissionAdminController::class, 'index']);
            Route::get('submissions/{id}', [SubmissionAdminController::class, 'show']);
        });

        // ── CERTIFICATE: Super Admin + Certificate Admin ──────────────────
        Route::middleware('cert_admin')->group(function () {
            Route::post('submissions/{id}/certificate', [SubmissionAdminController::class, 'issueCertificate']);

            // Certificate Templates
            Route::get('certificate-templates',                    [CertificateTemplateController::class, 'index']);
            Route::post('certificate-templates',                   [CertificateTemplateController::class, 'store']);
            Route::get('certificate-templates/{id}',               [CertificateTemplateController::class, 'show']);
            Route::put('certificate-templates/{id}',               [CertificateTemplateController::class, 'update']);
            Route::delete('certificate-templates/{id}',            [CertificateTemplateController::class, 'destroy']);
            Route::post('certificate-templates/{id}/active',       [CertificateTemplateController::class, 'setActive']);
            Route::get('certificate-templates/{id}/preview',       [CertificateTemplateController::class, 'preview']);
        });

        // ── FINANCE: Super Admin + Finance Admin + QC Admin ───────────────
        Route::middleware('finance_admin')->group(function () {
            Route::get('payments',      [PaymentAdminController::class, 'index']);
            Route::get('payments/{id}', [PaymentAdminController::class, 'show']);
        });

        // ── CERTIFICATES (list & view): semua admin bisa lihat ────────────
        Route::get('certificates',               [CertificateAdminController::class, 'index']);
        Route::get('certificates/{id}',          [CertificateAdminController::class, 'show']);
        Route::get('certificates/{id}/download', [CertificateAdminController::class, 'download']);

        // ── SUPER ADMIN ONLY ─────────────────────────────────────────────
        Route::middleware('super_admin')->group(function () {
            // Users Management
            Route::get('users',               [UserAdminController::class, 'index']);
            Route::post('users',              [UserAdminController::class, 'store']);
            Route::put('users/{id}',          [UserAdminController::class, 'update']);
            Route::delete('users/{id}',       [UserAdminController::class, 'destroy']);
            Route::post('users/{id}/verify',  [UserAdminController::class, 'verifyManual']);
            Route::put('users/{id}/status',   [UserAdminController::class, 'updateStatus']);

            // Submissions Management (Super Admin Actions)
            Route::delete('submissions/{id}', [SubmissionAdminController::class, 'destroy']);

            // Settings
            Route::get('settings', [SettingAdminController::class, 'index']);
            Route::put('settings', [SettingAdminController::class, 'update']);

            // Approve Certificate (2-step workflow)
            Route::post('certificates/{id}/approve', [CertificateAdminController::class, 'approve']);
        });
    });

});
