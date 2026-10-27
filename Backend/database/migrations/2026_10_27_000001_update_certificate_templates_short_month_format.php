<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\CertificateTemplate;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $templates = CertificateTemplate::all();
        foreach ($templates as $template) {
            $config = $template->config;
            if (!empty($config) && is_array($config)) {
                $updated = false;

                if (isset($config['published_date_1']['text'])) {
                    $config['published_date_1']['text'] = '29 Agu 2026';
                    $updated = true;
                }
                if (isset($config['published_date_2']['text'])) {
                    $config['published_date_2']['text'] = '29 Agu 2026';
                    $updated = true;
                }
                if (isset($config['valid_until']['text'])) {
                    $config['valid_until']['text'] = 'sampai 28 Agu 2029';
                    $updated = true;
                }
                if (isset($config['published_date_1_en']['text'])) {
                    $config['published_date_1_en']['text'] = '29 Aug 2026';
                    $updated = true;
                }
                if (isset($config['published_date_2_en']['text'])) {
                    $config['published_date_2_en']['text'] = '29 Aug 2026';
                    $updated = true;
                }
                if (isset($config['valid_until_en']['text'])) {
                    $config['valid_until_en']['text'] = 'until 28 Aug 2029';
                    $updated = true;
                }

                if ($updated) {
                    $template->config = $config;
                    $template->save();
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $templates = CertificateTemplate::all();
        foreach ($templates as $template) {
            $config = $template->config;
            if (!empty($config) && is_array($config)) {
                $updated = false;

                if (isset($config['published_date_1']['text'])) {
                    $config['published_date_1']['text'] = '29 Agustus 2026';
                    $updated = true;
                }
                if (isset($config['published_date_2']['text'])) {
                    $config['published_date_2']['text'] = '29 Agustus 2026';
                    $updated = true;
                }
                if (isset($config['valid_until']['text'])) {
                    $config['valid_until']['text'] = 'sampai 28 Agustus 2029';
                    $updated = true;
                }
                if (isset($config['published_date_1_en']['text'])) {
                    $config['published_date_1_en']['text'] = '29 August 2026';
                    $updated = true;
                }
                if (isset($config['published_date_2_en']['text'])) {
                    $config['published_date_2_en']['text'] = '29 August 2026';
                    $updated = true;
                }
                if (isset($config['valid_until_en']['text'])) {
                    $config['valid_until_en']['text'] = 'until 28 August 2029';
                    $updated = true;
                }

                if ($updated) {
                    $template->config = $config;
                    $template->save();
                }
            }
        }
    }
};
