<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class IndicatorAuditDataSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            1 => [
                'name'                    => 'Conformity to Marine Spatial Plans',
                'name_id'                 => 'Kesesuaian dengan Rencana Tata Ruang Laut',
                'description'             => 'Perusahaan memiliki bukti bahwa lokasi dan kegiatan usahanya telah sesuai dengan rencana tata ruang dan/atau pemanfaatan ruang laut yang berlaku serta memiliki seluruh persetujuan dan perizinan yang dipersyaratkan sebelum kegiatan operasional dilaksanakan.',
                'description_en'          => 'The company possesses evidence that its location and business activities comply with applicable spatial planning and/or marine spatial utilization plans, and holds all required approvals and permits prior to commencing operational activities.',
                'evidence'                => 'KKPR/PKKPR atau persetujuan kesesuaian ruang, NIB, izin berusaha, peta lokasi, dokumen perizinan',
                'evidence_en'             => 'KKPR/PKKPR or spatial conformity approval, NIB (Business Identification Number), business license, location map, licensing documents',
                'verification_method'     => 'Review dokumen, wawancara, observasi lokasi',
                'verification_method_en'  => 'Document review, interviews, site observation',
                'regulation'              => "• UU No. 32 Tahun 2014 tentang Kelautan — mengatur pengelolaan wilayah laut, pembangunan dan pengelolaan kelautan, pemanfaatan ruang laut, serta perlindungan lingkungan laut.
• PP No. 21 Tahun 2021 tentang Penyelenggaraan Penataan Ruang — mengatur penyelenggaraan penataan ruang, termasuk perencanaan, pemanfaatan, dan pengendalian pemanfaatan ruang.
• PP No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko — mengatur perizinan berusaha berdasarkan tingkat risiko kegiatan usaha.",
                'regulation_en'           => 'Law No. 32 of 2014 on Marine Affairs, Government Regulation No. 21 of 2021 on Spatial Planning, Government Regulation No. 5 of 2021 on Risk-Based Business Licensing',
            ],
            2 => [
                'name'                    => 'Marine Ecosystem Restoration/ Protection',
                'name_id'                 => 'Restorasi/Perlindungan Ekosistem Laut',
                'description'             => 'Perusahaan memiliki program perlindungan dan/atau restorasi ekosistem laut yang direncanakan, dilaksanakan, dipantau, dan dievaluasi secara berkala. Program mencakup tujuan, lokasi, jadwal, indikator keberhasilan, serta hasil pelaksanaan yang terdokumentasi.',
                'description_en'          => 'The company has a marine ecosystem protection and/or restoration program that is planned, implemented, monitored, and periodically evaluated. The program includes objectives, locations, schedules, success indicators, and documented implementation results.',
                'evidence'                => 'Program kerja, laporan kegiatan, foto sebelum-sesudah, koordinat lokasi, daftar peserta, hasil monitoring',
                'evidence_en'             => 'Work programs, activity reports, before-and-after photos, location coordinates, participant lists, monitoring results',
                'verification_method'     => 'Review dokumen, observasi lapangan, wawancara',
                'verification_method_en'  => 'Document review, field observation, interviews',
                'regulation'              => "• UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur perlindungan lingkungan hidup, pencegahan pencemaran dan kerusakan lingkungan, serta pemulihan lingkungan.
• UU No. 32 Tahun 2014 tentang Kelautan — mengatur perlindungan dan pengelolaan lingkungan laut serta pemanfaatan sumber daya kelautan secara berkelanjutan.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur perlindungan mutu lingkungan, pengendalian kerusakan, pemulihan lingkungan, serta pengawasan kegiatan usaha.",
                'regulation_en'           => 'Law No. 32 of 2009 on Environmental Protection and Management, Law No. 32 of 2014 on Marine Affairs, Government Regulation No. 22 of 2021',
            ],
            3 => [
                'name'                    => 'Prohibition of Destructive Practices',
                'name_id'                 => 'Larangan Praktik Merusak',
                'description'             => 'Perusahaan membuktikan bahwa seluruh kegiatan operasional tidak menggunakan praktik yang merusak ekosistem laut atau perairan serta memiliki prosedur pengendalian untuk mencegah kegiatan yang berpotensi menimbulkan kerusakan lingkungan.',
                'description_en'          => 'The company demonstrates that all operational activities do not employ practices that damage marine or aquatic ecosystems, and has control procedures to prevent activities that may cause environmental damage.',
                'evidence'                => 'AMDAL/UKL-UPL, SOP operasional, inspeksi lapangan, laporan pengawasan, berita acara',
                'evidence_en'             => 'Environmental Impact Assessment (AMDAL/UKL-UPL), operational SOPs, field inspections, monitoring reports, official records',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pencegahan pencemaran dan kerusakan lingkungan serta kewajiban pelaku usaha menjaga kelestarian lingkungan.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengendalian pencemaran, kerusakan lingkungan, persetujuan lingkungan, dan pengawasan kegiatan usaha.",
                'regulation_en'           => 'Law No. 32 of 2009 on Environmental Protection and Management, Government Regulation No. 22 of 2021',
            ],
            4 => [
                'name'                    => 'Water-related Ecosystem Restoration/ Protection',
                'name_id'                 => 'Restorasi/Perlindungan Ekosistem Perairan',
                'description'             => 'Perusahaan memiliki program perlindungan dan/atau restorasi ekosistem perairan (sungai, danau, waduk, estuari atau kawasan pesisir) yang dilaksanakan secara berkala dan dievaluasi efektivitasnya berdasarkan indikator yang terukur.',
                'description_en'          => 'The company has a protection and/or restoration program for aquatic ecosystems (rivers, lakes, reservoirs, estuaries, or coastal areas) that is periodically implemented and evaluated for effectiveness based on measurable indicators.',
                'evidence'                => 'Program konservasi, laporan kegiatan, foto, hasil monitoring kualitas lingkungan',
                'evidence_en'             => 'Conservation programs, activity reports, photos, environmental quality monitoring results',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• UU No. 17 Tahun 2019 tentang Sumber Daya Air — mengatur pengelolaan, perlindungan, pemanfaatan, dan konservasi sumber daya air.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur perlindungan mutu air dan pengendalian pencemaran air.",
                'regulation_en'           => 'Law No. 17 of 2019 on Water Resources, Government Regulation No. 22 of 2021',
            ],
            5 => [
                'name'                    => 'Clean Water System',
                'name_id'                 => 'Sistem Air Bersih',
                'description'             => 'Perusahaan memiliki sistem penyediaan air bersih yang memenuhi kebutuhan operasional, dilakukan pengujian kualitas air secara berkala oleh laboratorium yang kompeten, serta memenuhi baku mutu sesuai peruntukannya.',
                'description_en'          => 'The company has a clean water supply system that meets operational needs, conducts periodic water quality testing by a competent laboratory, and meets applicable quality standards for its intended use.',
                'evidence'                => 'Diagram sistem air bersih, hasil uji laboratorium, SOP, logbook inspeksi',
                'evidence_en'             => 'Clean water system diagram, laboratory test results, SOPs, inspection logbooks',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• Permenkes No. 2 Tahun 2023 tentang Peraturan Pelaksanaan Peraturan Pemerintah No. 66 Tahun 2014 tentang Kesehatan Lingkungan — mengatur persyaratan dan standar kesehatan lingkungan, termasuk kualitas air untuk kebutuhan masyarakat.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur perlindungan dan pengelolaan mutu air serta pengendalian pencemaran air.",
                'regulation_en'           => 'Minister of Health Regulation No. 2 of 2023, Government Regulation No. 22 of 2021',
            ],
            6 => [
                'name'                    => 'Wastewater Management',
                'name_id'                 => 'Pengelolaan Air Limbah',
                'description'             => 'Perusahaan memiliki sistem pengelolaan air limbah yang mencakup pengumpulan, pengolahan, pemantauan kualitas efluen, pemeliharaan instalasi, dan pembuangan sesuai baku mutu yang berlaku.',
                'description_en'          => 'The company has a wastewater management system covering collection, treatment, effluent quality monitoring, facility maintenance, and discharge in accordance with applicable quality standards.',
                'evidence'                => 'SOP IPAL, layout IPAL, hasil uji efluen, logbook operasi, izin pembuangan',
                'evidence_en'             => 'Wastewater Treatment Plant (WWTP) SOPs, WWTP layout, effluent test results, operation logbooks, discharge permits',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengelolaan mutu air, pengendalian pencemaran, baku mutu air limbah, serta kewajiban pemantauan dan pengelolaan air limbah.",
                'regulation_en'           => 'Government Regulation No. 22 of 2021 on Environmental Protection and Management',
            ],
            7 => [
                'name'                    => 'Waste Disposal',
                'name_id'                 => 'Pembuangan Limbah',
                'description'             => 'Perusahaan menyediakan fasilitas penyimpanan limbah yang sesuai dengan jenis dan kapasitas limbah, dilengkapi identifikasi, pengamanan, serta prosedur pengangkutan dan penyerahan kepada pihak yang berizin apabila dipersyaratkan.',
                'description_en'          => 'The company provides waste storage facilities appropriate to the type and capacity of waste, equipped with identification, safeguarding, and procedures for transporting and transferring waste to licensed parties when required.',
                'evidence'                => 'Layout TPS Limbah, foto fasilitas, manifest limbah, kontrak pengangkut limbah',
                'evidence_en'             => 'Waste temporary storage facility layout, facility photos, waste manifests, waste transporter contracts',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengelolaan limbah B3 dan non-B3, termasuk penyimpanan, pengangkutan, pemanfaatan, pengolahan, dan pembuangan limbah.",
                'regulation_en'           => 'Government Regulation No. 22 of 2021 on Environmental Protection and Management',
            ],
            8 => [
                'name'                    => 'Waste Management Plan',
                'name_id'                 => 'Rencana Pengelolaan Limbah',
                'description'             => 'Perusahaan memiliki rencana pengelolaan limbah yang terdokumentasi, mencakup pengurangan, pemilahan, penyimpanan, pemanfaatan kembali, daur ulang, pengangkutan, dan pembuangan akhir sesuai karakteristik limbah. Rencana dievaluasi secara berkala.',
                'description_en'          => 'The company has a documented waste management plan covering reduction, sorting, storage, reuse, recycling, transportation, and final disposal according to waste characteristics. The plan is periodically evaluated.',
                'evidence'                => 'Waste Management Plan, SOP, laporan realisasi, catatan volume limbah',
                'evidence_en'             => 'Waste Management Plan, SOPs, implementation reports, waste volume records',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• UU No. 18 Tahun 2008 tentang Pengelolaan Sampah — mengatur pengurangan dan penanganan sampah, termasuk pemilahan, pengumpulan, pengangkutan, pengolahan, dan pemrosesan akhir sampah.
• PP No. 27 Tahun 2020 tentang Pengelolaan Sampah Spesifik — mengatur pengelolaan sampah yang memiliki karakteristik khusus dan memerlukan penanganan tertentu.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengelolaan limbah dan pengendalian pencemaran lingkungan.",
                'regulation_en'           => 'Law No. 18 of 2008 on Waste Management, Government Regulation No. 27 of 2020, Government Regulation No. 22 of 2021',
            ],
            9 => [
                'name'                    => 'Greenhouse Gas Accounting',
                'name_id'                 => 'Inventarisasi Gas Rumah Kaca',
                'description'             => 'Perusahaan melakukan inventarisasi emisi gas rumah kaca menggunakan metodologi yang terdokumentasi, menetapkan batas inventarisasi, menghitung emisi secara berkala, serta menyimpan data pendukung perhitungan.',
                'description_en'          => 'The company conducts greenhouse gas emission inventories using documented methodologies, establishes inventory boundaries, calculates emissions periodically, and retains supporting calculation data.',
                'evidence'                => 'Laporan inventarisasi GRK, data konsumsi energi, faktor emisi, spreadsheet perhitungan',
                'evidence_en'             => 'GHG inventory report, energy consumption data, emission factors, calculation spreadsheets',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• Perpres No. 98 Tahun 2021 tentang Nilai Ekonomi Karbon untuk Pencapaian Target Kontribusi yang Ditetapkan Secara Nasional dan Pengendalian Emisi Gas Rumah Kaca dalam Pembangunan Nasional — mengatur mekanisme pengendalian emisi GRK dan nilai ekonomi karbon.
• Permen LHK terkait Inventarisasi GRK — mengatur tata cara inventarisasi dan pelaporan emisi gas rumah kaca.",
                'regulation_en'           => 'Presidential Regulation No. 98 of 2021 on Carbon Economic Value, Ministry of Environment and Forestry Regulation on GHG Inventory',
            ],
            10 => [
                'name'                    => 'Greenhouse Gas Reduction',
                'name_id'                 => 'Pengurangan Gas Rumah Kaca',
                'description'             => 'Perusahaan memiliki kebijakan, target, dan program pengurangan emisi gas rumah kaca (GRK), melaksanakan upaya mitigasi sesuai kegiatan usahanya, serta melakukan pemantauan dan evaluasi capaian secara berkala.',
                'description_en'          => 'The company has policies, targets, and programs for greenhouse gas (GHG) emission reduction, implements mitigation measures according to its business activities, and periodically monitors and evaluates achievements.',
                'evidence'                => 'Kebijakan pengurangan emisi, inventarisasi GRK, target dan program penurunan emisi, data konsumsi energi/bahan bakar, laporan pengurangan emisi',
                'evidence_en'             => 'Emission reduction policy, GHG inventory, reduction targets and programs, energy/fuel consumption data, emission reduction reports',
                'verification_method'     => 'Review dokumen, wawancara, observasi',
                'verification_method_en'  => 'Document review, interviews, observation',
                'regulation'              => "• UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pencegahan pencemaran dan kerusakan lingkungan serta pengendalian dampak kegiatan usaha.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengendalian pencemaran dan kerusakan lingkungan.
• Perpres No. 98 Tahun 2021 tentang Nilai Ekonomi Karbon untuk Pencapaian Target Kontribusi yang Ditetapkan Secara Nasional dan Pengendalian Emisi Gas Rumah Kaca dalam Pembangunan Nasional — mengatur pengendalian emisi GRK dan mekanisme nilai ekonomi karbon.
• Permen LHK No. 21 Tahun 2022 tentang Penerapan Nilai Ekonomi Karbon — mengatur penerapan nilai ekonomi karbon sebagai bagian dari pengendalian emisi GRK.",
                'regulation_en'           => 'Law No. 32 of 2009; Government Regulation No. 22 of 2021; Presidential Regulation No. 98 of 2021; Ministry of Environment Regulation No. 21 of 2022',
            ],
            11 => [
                'name'                    => 'Single-Use Plastic Reduction',
                'name_id'                 => 'Pengurangan Plastik Sekali Pakai',
                'description'             => 'Perusahaan memiliki kebijakan dan program untuk mengurangi penggunaan plastik sekali pakai pada seluruh kegiatan operasional. Program mencakup target pengurangan, implementasi alternatif ramah lingkungan, pemantauan, dan evaluasi berkala terhadap pencapaian target.',
                'description_en'          => 'The company has policies and programs to reduce the use of single-use plastics in all operational activities. The program includes reduction targets, implementation of environmentally friendly alternatives, monitoring, and periodic evaluation of target achievement.',
                'evidence'                => 'Kebijakan pengurangan plastik, program kerja, data penggunaan plastik, laporan realisasi, dokumentasi implementasi',
                'evidence_en'             => 'Plastic reduction policy, work programs, plastic usage data, implementation reports, implementation documentation',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 18 Tahun 2008 tentang Pengelolaan Sampah — mengatur pengurangan dan penanganan sampah, termasuk upaya mengurangi timbulan sampah.
• PP No. 81 Tahun 2012 tentang Pengelolaan Sampah Rumah Tangga dan Sampah Sejenis Sampah Rumah Tangga — mengatur pengurangan dan pengelolaan sampah sejak sumbernya.
• Permen LHK No. P.75/MENLHK/SETJEN/KUM.1/10/2019 tentang Peta Jalan Pengurangan Sampah oleh Produsen — mengatur upaya produsen mengurangi sampah dari produk dan kemasan.",
                'regulation_en'           => 'Law No. 18 of 2008; Government Regulation No. 81 of 2012; Ministry of Environment Regulation No. P75/2019; regional policies on single-use plastic reduction',
            ],
            12 => [
                'name'                    => 'Water-use Management Plan',
                'name_id'                 => 'Rencana Pengelolaan Penggunaan Air',
                'description'             => 'Perusahaan memiliki rencana pengelolaan penggunaan air yang terdokumentasi, meliputi identifikasi sumber air, target efisiensi, pengukuran konsumsi, pengendalian kehilangan air, penggunaan kembali (reuse/recycle) apabila memungkinkan, serta evaluasi berkala.',
                'description_en'          => 'The company has a documented water use management plan covering water source identification, efficiency targets, consumption measurement, water loss control, reuse/recycle opportunities where applicable, and periodic evaluation.',
                'evidence'                => 'Water Management Plan, neraca air, data konsumsi air, laporan evaluasi, SOP',
                'evidence_en'             => 'Water Management Plan, water balance records, water consumption data, evaluation reports, SOPs',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• UU No. 17 Tahun 2019 tentang Sumber Daya Air — mengatur konservasi, pendayagunaan, pengendalian daya rusak, dan pengelolaan sumber daya air.
• PP No. 30 Tahun 2024 tentang Pengelolaan Sumber Daya Air — mengatur penyelenggaraan pengelolaan sumber daya air secara terpadu dan berkelanjutan.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur perlindungan mutu air dan pengendalian pencemaran air.",
                'regulation_en'           => 'Law No. 17 of 2019 on Water Resources; Government Regulation No. 30 of 2024 on Water Resources Management; Government Regulation No. 22 of 2021',
            ],
            13 => [
                'name'                    => 'Energy-use Management',
                'name_id'                 => 'Manajemen Penggunaan Energi',
                'description'             => 'Perusahaan menerapkan sistem manajemen energi yang mencakup identifikasi penggunaan energi, penetapan indikator kinerja energi (EnPI), pemantauan konsumsi energi, pemeliharaan peralatan, serta evaluasi berkala untuk meningkatkan efisiensi energi.',
                'description_en'          => 'The company implements an energy management system covering energy use identification, energy performance indicators (EnPI), energy consumption monitoring, equipment maintenance, and periodic evaluation to improve energy efficiency.',
                'evidence'                => 'Energy Management Plan, data konsumsi energi, KPI energi, SOP, laporan monitoring',
                'evidence_en'             => 'Energy Management Plan, energy consumption data, energy KPIs, SOPs, monitoring reports',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• PP No. 33 Tahun 2023 tentang Konservasi Energi — mengatur konservasi energi melalui pengelolaan dan efisiensi penggunaan energi.
• Permen ESDM tentang Manajemen Energi — mengatur penerapan sistem manajemen energi untuk meningkatkan efisiensi penggunaan energi.",
                'regulation_en'           => 'Government Regulation No. 33 of 2023 on Energy Conservation; Ministry of Energy and Mineral Resources Regulation on Energy Management',
            ],
            14 => [
                'name'                    => 'Energy-use Reduction',
                'name_id'                 => 'Pengurangan Penggunaan Energi',
                'description'             => 'Perusahaan menetapkan target penurunan konsumsi energi, melaksanakan program efisiensi energi, mengevaluasi capaian secara berkala, dan mendokumentasikan hasil penghematan energi yang dicapai.',
                'description_en'          => 'The company establishes energy consumption reduction targets, implements energy efficiency programs, periodically evaluates achievements, and documents energy savings realized.',
                'evidence'                => 'Target pengurangan energi, laporan efisiensi, data konsumsi sebelum dan sesudah, hasil evaluasi',
                'evidence_en'             => 'Energy reduction targets, efficiency reports, before-and-after consumption data, evaluation results',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• PP No. 33 Tahun 2023 tentang Konservasi Energi — mengatur upaya penghematan dan efisiensi energi serta penerapan konservasi energi.
• Perpres No. 22 Tahun 2017 tentang Rencana Umum Energi Nasional (RUEN) — mengatur arah dan kebijakan pengelolaan energi nasional, termasuk peningkatan efisiensi energi.",
                'regulation_en'           => 'Government Regulation No. 33 of 2023; Presidential Regulation No. 22 of 2017 (National Energy General Plan)',
            ],
            15 => [
                'name'                    => 'Renewable and Clean Energy Utilization',
                'name_id'                 => 'Pemanfaatan Energi Terbarukan dan Bersih',
                'description'             => 'Perusahaan memiliki program pemanfaatan energi baru dan terbarukan atau energi rendah emisi sesuai karakteristik usahanya, termasuk perencanaan, implementasi, pemantauan kinerja, dan evaluasi manfaat lingkungan maupun ekonomi.',
                'description_en'          => 'The company has a program for utilizing new and renewable energy or low-emission energy appropriate to its business characteristics, including planning, implementation, performance monitoring, and evaluation of environmental and economic benefits.',
                'evidence'                => 'Dokumen investasi EBT, data produksi/pemakaian energi terbarukan, laporan operasional, foto instalasi',
                'evidence_en'             => 'Renewable energy investment documents, renewable energy production/usage data, operational reports, installation photos',
                'verification_method'     => 'Review dokumen, observasi lapangan',
                'verification_method_en'  => 'Document review, field observation',
                'regulation'              => "• UU No. 30 Tahun 2007 tentang Energi — mengatur pengelolaan energi nasional, termasuk pengembangan energi baru dan terbarukan.
• Perpres No. 112 Tahun 2022 tentang Percepatan Pengembangan Energi Terbarukan untuk Penyediaan Tenaga Listrik — mengatur percepatan pemanfaatan energi terbarukan dalam penyediaan tenaga listrik.",
                'regulation_en'           => 'Law No. 30 of 2007 on Energy; Presidential Regulation No. 112 of 2022; National Energy General Plan (RUEN)',
            ],
            16 => [
                'name'                    => 'Access to Residence and Sanitary Amenities at Work',
                'name_id'                 => 'Akses Tempat Tinggal dan Fasilitas Sanitasi di Tempat Kerja',
                'description'             => 'Apabila perusahaan menyediakan fasilitas tempat tinggal, perusahaan memastikan fasilitas tersebut memenuhi persyaratan kesehatan, sanitasi, keselamatan, akses air bersih, ventilasi, dan kelayakan sesuai ketentuan yang berlaku.',
                'description_en'          => 'Where the company provides accommodation facilities, it ensures that such facilities meet health, sanitation, safety, clean water access, ventilation, and habitability requirements as stipulated by applicable regulations.',
                'evidence'                => 'SOP pengelolaan mess, hasil inspeksi, foto fasilitas, daftar pemeliharaan',
                'evidence_en'             => 'Dormitory management SOPs, inspection results, facility photos, maintenance checklists',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• UU No. 1 Tahun 1970 tentang Keselamatan Kerja — mengatur keselamatan dan kesehatan di tempat kerja serta persyaratan lingkungan kerja yang aman dan sehat.
• PP No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja — mengatur penerapan sistem manajemen K3 di perusahaan.
• Permenkes terkait sanitasi tempat kerja — mengatur persyaratan kesehatan dan sanitasi lingkungan kerja.",
                'regulation_en'           => 'Law No. 1 of 1970 on Occupational Safety; Government Regulation No. 50 of 2012; Ministry of Health Regulation on Workplace Sanitation',
            ],
            17 => [
                'name'                    => 'Access to Safe Food and Drinking Water at Work',
                'name_id'                 => 'Akses Makanan Aman dan Air Minum di Tempat Kerja',
                'description'             => 'Perusahaan menyediakan makanan (apabila disediakan) dan air minum yang aman, higienis, memenuhi persyaratan kesehatan, tersedia dalam jumlah yang memadai, serta dilakukan pengawasan kualitas secara berkala.',
                'description_en'          => 'The company provides food (where provided) and drinking water that is safe, hygienic, meets health requirements, is available in adequate quantities, and is subject to periodic quality monitoring.',
                'evidence'                => 'Hasil uji kualitas air, kontrak katering (bila ada), SOP higiene, hasil inspeksi',
                'evidence_en'             => 'Water quality test results, catering contracts (if any), hygiene SOPs, inspection results',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• UU No. 17 Tahun 2023 tentang Kesehatan — mengatur penyelenggaraan kesehatan, termasuk upaya kesehatan lingkungan dan perlindungan kesehatan masyarakat.
• Permenkes No. 2 Tahun 2023 tentang Peraturan Pelaksanaan Peraturan Pemerintah No. 66 Tahun 2014 tentang Kesehatan Lingkungan — mengatur standar kesehatan lingkungan, termasuk kualitas air.
• PP No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja — mengatur penerapan sistem K3 di lingkungan kerja.",
                'regulation_en'           => 'Law No. 17 of 2023 on Health; Ministry of Health Regulation No. 2 of 2023; Government Regulation No. 50 of 2012',
            ],
            18 => [
                'name'                    => 'Access to Medical Care and Insurance at Work',
                'name_id'                 => 'Akses Pelayanan Kesehatan dan Asuransi di Tempat Kerja',
                'description'             => 'Seluruh pekerja memperoleh akses terhadap pelayanan kesehatan kerja dan kepesertaan program jaminan sosial sesuai ketentuan peraturan perundang-undangan. Perusahaan memiliki prosedur penanganan keadaan darurat medis dan pencatatan pelayanan kesehatan kerja.',
                'description_en'          => 'All workers have access to occupational health services and social security program membership in accordance with statutory requirements. The company has emergency medical response procedures and occupational health service records.',
                'evidence'                => 'Bukti kepesertaan BPJS Kesehatan dan BPJS Ketenagakerjaan, SOP P3K, daftar petugas P3K, rekam medis kerja, laporan kecelakaan',
                'evidence_en'             => 'BPJS Health and BPJS Employment membership certificates, first aid SOPs, first aid personnel lists, occupational medical records, accident reports',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 24 Tahun 2011 tentang Badan Penyelenggara Jaminan Sosial — mengatur penyelenggaraan program jaminan sosial melalui BPJS.
• PP No. 44 Tahun 2015 tentang Penyelenggaraan Program Jaminan Kecelakaan Kerja dan Jaminan Kematian — mengatur perlindungan pekerja melalui program JKK dan JKM.
• PP No. 82 Tahun 2019 tentang Perubahan atas PP No. 44 Tahun 2015 — mengatur perubahan ketentuan penyelenggaraan Jaminan Kecelakaan Kerja dan Jaminan Kematian.
• UU No. 1 Tahun 1970 tentang Keselamatan Kerja — mengatur perlindungan keselamatan dan kesehatan pekerja.",
                'regulation_en'           => 'Law No. 24 of 2011 on Social Security Agency (BPJS); Government Regulation No. 44 of 2015; Government Regulation No. 82 of 2019; Law No. 1 of 1970',
            ],
            19 => [
                'name'                    => 'Safety Working Conditions',
                'name_id'                 => 'Kondisi Kerja yang Aman',
                'description'             => 'Perusahaan menerapkan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) atau sistem sejenis yang mencakup identifikasi bahaya, penilaian risiko, pengendalian risiko, penyediaan APD, pelatihan K3, pelaporan insiden, investigasi kecelakaan, audit internal, dan tindakan perbaikan berkelanjutan.',
                'description_en'          => 'The company implements an Occupational Safety and Health Management System (SMK3) or equivalent system covering hazard identification, risk assessment, risk controls, PPE provision, safety training, incident reporting, accident investigation, internal audits, and continuous corrective actions.',
                'evidence'                => 'Manual SMK3, HIRADC/JSA, SOP K3, daftar APD, laporan inspeksi, laporan kecelakaan, pelatihan K3',
                'evidence_en'             => 'OHS Management System manual, HIRADC/JSA, OHS SOPs, PPE lists, inspection reports, accident reports, OHS training records',
                'verification_method'     => 'Review dokumen, observasi lapangan, wawancara',
                'verification_method_en'  => 'Document review, field observation, interviews',
                'regulation'              => "• UU No. 1 Tahun 1970 tentang Keselamatan Kerja — mengatur syarat keselamatan kerja dan perlindungan tenaga kerja dari risiko kecelakaan.
• PP No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja — mengatur penerapan SMK3 di perusahaan.
• Permenaker No. 5 Tahun 2018 tentang Keselamatan dan Kesehatan Kerja Lingkungan Kerja — mengatur standar dan pengendalian faktor bahaya di lingkungan kerja.",
                'regulation_en'           => 'Law No. 1 of 1970 on Occupational Safety; Government Regulation No. 50 of 2012 on OHS Management System; Ministry of Manpower Regulation No. 5 of 2018',
            ],
            20 => [
                'name'                    => 'Healthy Working Conditions',
                'name_id'                 => 'Kondisi Kerja yang Sehat',
                'description'             => 'Perusahaan menyediakan lingkungan kerja yang bersih, sehat, aman, dan nyaman melalui pengendalian faktor bahaya fisik, kimia, biologi, ergonomi, dan psikososial. Perusahaan melakukan pemantauan kondisi lingkungan kerja dan kesehatan pekerja secara berkala serta menindaklanjuti hasil pemantauan sebagai bagian dari perbaikan berkelanjutan.',
                'description_en'          => 'The company provides a clean, healthy, safe, and comfortable working environment by controlling physical, chemical, biological, ergonomic, and psychosocial hazard factors. The company periodically monitors workplace conditions and worker health, and follows up on monitoring results as part of continuous improvement.',
                'evidence'                => 'Hasil pengukuran lingkungan kerja, laporan pemeriksaan kesehatan berkala, SOP higiene industri, laporan inspeksi, dokumentasi fasilitas kerja',
                'evidence_en'             => 'Workplace environment measurement results, periodic health examination reports, industrial hygiene SOPs, inspection reports, work facility documentation',
                'verification_method'     => 'Review dokumen, observasi lapangan, wawancara',
                'verification_method_en'  => 'Document review, field observation, interviews',
                'regulation'              => "• UU No. 1 Tahun 1970 tentang Keselamatan Kerja — mengatur keselamatan dan kesehatan pekerja serta kondisi tempat kerja.
• UU No. 17 Tahun 2023 tentang Kesehatan — mengatur penyelenggaraan kesehatan, termasuk kesehatan lingkungan dan kesehatan kerja.
• PP No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja — mengatur penerapan sistem manajemen K3.
• Permenaker No. 5 Tahun 2018 tentang Keselamatan dan Kesehatan Kerja Lingkungan Kerja — mengatur pengendalian faktor fisik, kimia, biologi, ergonomi, dan faktor lainnya di tempat kerja.",
                'regulation_en'           => 'Law No. 1 of 1970; Law No. 17 of 2023 on Health; Government Regulation No. 50 of 2012; Ministry of Manpower Regulation No. 5 of 2018',
            ],
            21 => [
                'name'                    => 'Access to Education',
                'name_id'                 => 'Akses Pendidikan',
                'description'             => 'Perusahaan menyediakan akses pendidikan, pelatihan, atau pengembangan kompetensi bagi pekerja secara adil sesuai kebutuhan jabatan serta mendokumentasikan pelaksanaan dan evaluasi efektivitasnya.',
                'description_en'          => 'The company provides access to education, training, or competency development for workers equitably according to job requirements, and documents the implementation and evaluation of its effectiveness.',
                'evidence'                => 'Program pelatihan, matriks kompetensi, sertifikat, daftar hadir, evaluasi pelatihan',
                'evidence_en'             => 'Training programs, competency matrices, certificates, attendance lists, training evaluations',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan ketenagakerjaan, termasuk pengembangan kompetensi tenaga kerja.
• PP No. 31 Tahun 2006 tentang Sistem Pelatihan Kerja Nasional — mengatur penyelenggaraan pelatihan kerja dan peningkatan kompetensi tenaga kerja.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Government Regulation No. 31 of 2006 on National Vocational Training System',
            ],
            22 => [
                'name'                    => 'Community Consultation',
                'name_id'                 => 'Konsultasi Masyarakat',
                'description'             => 'Perusahaan memiliki mekanisme konsultasi, komunikasi, dan pelibatan masyarakat serta pemangku kepentingan yang terdampak kegiatan usaha. Masukan masyarakat didokumentasikan, dianalisis, dan menjadi pertimbangan dalam pengambilan keputusan serta ditindaklanjuti secara transparan.',
                'description_en'          => 'The company has mechanisms for consultation, communication, and engagement with communities and stakeholders affected by its business activities. Community input is documented, analyzed, considered in decision-making, and followed up transparently.',
                'evidence'                => 'Stakeholder Engagement Plan, notulen konsultasi publik, daftar hadir, berita acara, daftar keluhan dan tindak lanjut',
                'evidence_en'             => 'Stakeholder Engagement Plan, public consultation minutes, attendance lists, official records, complaint and follow-up lists',
                'verification_method'     => 'Review dokumen, wawancara, observasi',
                'verification_method_en'  => 'Document review, interviews, observation',
                'regulation'              => "• UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur partisipasi masyarakat dalam perlindungan dan pengelolaan lingkungan hidup.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur persetujuan lingkungan, pelibatan masyarakat, pengawasan, dan pengendalian dampak lingkungan.",
                'regulation_en'           => 'Law No. 32 of 2009 on Environmental Protection and Management; Government Regulation No. 22 of 2021',
            ],
            23 => [
                'name'                    => 'Local Hiring',
                'name_id'                 => 'Perekrutan Tenaga Kerja Lokal',
                'description'             => 'Perusahaan menerapkan kebijakan rekrutmen yang memberikan kesempatan kerja kepada masyarakat lokal sesuai kebutuhan kompetensi, tanpa mengurangi prinsip merit dan non-diskriminasi. Perusahaan memantau kontribusi tenaga kerja lokal secara berkala.',
                'description_en'          => 'The company implements a recruitment policy that provides employment opportunities to local communities based on competency requirements, without compromising the principles of merit and non-discrimination. The company periodically monitors local workforce contributions.',
                'evidence'                => 'SOP rekrutmen, data tenaga kerja lokal, laporan ketenagakerjaan, program peningkatan kompetensi',
                'evidence_en'             => 'Recruitment SOPs, local workforce data, employment reports, competency development programs',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan kerja, kesempatan kerja, dan perlindungan tenaga kerja.
• PP No. 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja — mengatur hubungan kerja dan ketentuan penggunaan tenaga kerja.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Government Regulation No. 35 of 2021',
            ],
            24 => [
                'name'                    => 'Local Culture and Product Promotion',
                'name_id'                 => 'Promosi Budaya dan Produk Lokal',
                'description'             => 'Perusahaan mendukung pelestarian budaya lokal serta mempromosikan penggunaan produk lokal melalui program pemberdayaan masyarakat, kemitraan dengan UMKM, atau pengadaan barang dan jasa yang mempertimbangkan potensi lokal sesuai ketentuan yang berlaku.',
                'description_en'          => 'The company supports the preservation of local culture and promotes the use of local products through community empowerment programs, SME partnerships, or procurement of goods and services that consider local potential in accordance with applicable regulations.',
                'evidence'                => 'Program CSR, MOU dengan UMKM, laporan kegiatan, dokumentasi promosi budaya, kontrak pengadaan lokal',
                'evidence_en'             => 'CSR programs, MOUs with SMEs, activity reports, cultural promotion documentation, local procurement contracts',
                'verification_method'     => 'Review dokumen, observasi',
                'verification_method_en'  => 'Document review, observation',
                'regulation'              => "• UU No. 5 Tahun 2017 tentang Pemajuan Kebudayaan — mengatur perlindungan, pengembangan, pemanfaatan, dan pembinaan kebudayaan Indonesia.
• UU No. 20 Tahun 2008 tentang Usaha Mikro, Kecil, dan Menengah — mengatur pemberdayaan dan pengembangan UMKM serta penguatan usaha masyarakat.",
                'regulation_en'           => 'Law No. 5 of 2017 on Cultural Advancement; Law No. 20 of 2008 on Micro, Small, and Medium Enterprises',
            ],
            25 => [
                'name'                    => 'Access to Natural Resources',
                'name_id'                 => 'Akses terhadap Sumber Daya Alam',
                'description'             => 'Perusahaan memastikan kegiatan usahanya tidak membatasi akses masyarakat terhadap sumber daya alam yang sah serta menerapkan mekanisme penyelesaian konflik apabila terjadi sengketa pemanfaatan sumber daya. Pengelolaan dilakukan dengan memperhatikan prinsip keberlanjutan dan daya dukung lingkungan.',
                'description_en'          => 'The company ensures its business activities do not restrict community access to legally recognized natural resources and implements conflict resolution mechanisms in the event of resource utilization disputes. Management is conducted with attention to sustainability principles and environmental carrying capacity.',
                'evidence'                => 'Dokumen AMDAL/UKL-UPL, peta wilayah, mekanisme pengaduan, berita acara konsultasi masyarakat, laporan pengelolaan lingkungan',
                'evidence_en'             => 'AMDAL/UKL-UPL documents, area maps, complaint mechanisms, community consultation records, environmental management reports',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pemanfaatan sumber daya alam secara berkelanjutan dan perlindungan lingkungan.
• UU No. 32 Tahun 2014 tentang Kelautan — mengatur pengelolaan dan pemanfaatan sumber daya kelautan secara berkelanjutan.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengendalian dampak lingkungan dan perlindungan lingkungan.",
                'regulation_en'           => 'Law No. 32 of 2009; Law No. 32 of 2014 on Marine Affairs; Government Regulation No. 22 of 2021',
            ],
            26 => [
                'name'                    => 'Freedom of Association',
                'name_id'                 => 'Kebebasan Berserikat',
                'description'             => 'Perusahaan menghormati hak pekerja untuk membentuk, bergabung, atau tidak bergabung dalam serikat pekerja serta menjamin tidak adanya intimidasi, diskriminasi, atau tindakan yang menghambat kebebasan berserikat sesuai ketentuan peraturan perundang-undangan.',
                'description_en'          => 'The company respects workers\' rights to form, join, or not join trade unions and ensures the absence of intimidation, discrimination, or actions that restrict freedom of association in accordance with applicable statutory regulations.',
                'evidence'                => 'Peraturan Perusahaan/PKB, bukti keberadaan serikat pekerja, notulen pertemuan bipartit, mekanisme penyelesaian perselisihan',
                'evidence_en'             => 'Company Regulations/Collective Labor Agreements (CLA), evidence of trade union existence, bipartite meeting minutes, dispute resolution mechanisms',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 21 Tahun 2000 tentang Serikat Pekerja/Serikat Buruh — mengatur hak pekerja untuk membentuk dan menjadi anggota serikat pekerja serta perlindungan terhadap kebebasan berserikat.
• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan industrial dan hak-hak pekerja.",
                'regulation_en'           => 'Law No. 21 of 2000 on Trade Unions; Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023',
            ],
            27 => [
                'name'                    => 'Non-Discrimination',
                'name_id'                 => 'Non-Diskriminasi',
                'description'             => 'Perusahaan menerapkan kebijakan anti-diskriminasi dalam seluruh proses ketenagakerjaan, termasuk rekrutmen, pengupahan, promosi, pelatihan, penilaian kinerja, dan pemutusan hubungan kerja, tanpa membedakan suku, agama, ras, jenis kelamin, usia, disabilitas, atau latar belakang lainnya.',
                'description_en'          => 'The company implements anti-discrimination policies in all employment processes, including recruitment, remuneration, promotion, training, performance appraisal, and termination, without distinction of ethnicity, religion, race, gender, age, disability, or other backgrounds.',
                'evidence'                => 'Kebijakan anti-diskriminasi, SOP SDM, data promosi, mekanisme pengaduan, laporan penyelesaian kasus',
                'evidence_en'             => 'Anti-discrimination policy, HR SOPs, promotion data, complaint mechanisms, case resolution reports',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 39 Tahun 1999 tentang Hak Asasi Manusia — mengatur penghormatan, perlindungan, dan pemenuhan hak asasi manusia tanpa diskriminasi.
• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur perlakuan yang adil dan perlindungan hak pekerja dalam hubungan kerja.",
                'regulation_en'           => 'Law No. 39 of 1999 on Human Rights; Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023',
            ],
            28 => [
                'name'                    => 'Collective Bargaining',
                'name_id'                 => 'Perundingan Bersama',
                'description'             => 'Perusahaan memfasilitasi perundingan bersama dengan pekerja atau serikat pekerja dalam penyusunan Perjanjian Kerja Bersama (PKB) atau bentuk kesepakatan lainnya. Proses dilakukan secara transparan, terdokumentasi, dan sesuai ketentuan hukum yang berlaku.',
                'description_en'          => 'The company facilitates collective bargaining with workers or trade unions in drafting Collective Labor Agreements (CLA) or other forms of agreement. The process is conducted transparently, documented, and in accordance with applicable law.',
                'evidence'                => 'PKB, berita acara perundingan, daftar hadir, notulen rapat, dokumen hasil kesepakatan',
                'evidence_en'             => 'Collective Labor Agreements (CLA), bargaining minutes, attendance lists, meeting minutes, agreement result documents',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan industrial, serikat pekerja, dan perundingan bersama.
• Permenaker terkait Perjanjian Kerja Bersama (PKB) — mengatur tata cara dan ketentuan penyusunan serta pendaftaran PKB.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Ministry of Manpower Regulation on Collective Labor Agreements',
            ],
            29 => [
                'name'                    => 'Womens Labor Rights',
                'name_id'                 => 'Hak Tenaga Kerja Perempuan',
                'description'             => 'Perusahaan menjamin pemenuhan hak pekerja perempuan sesuai peraturan perundang-undangan, termasuk perlindungan terhadap diskriminasi, kesempatan yang setara, cuti melahirkan, cuti keguguran, perlindungan bagi pekerja hamil, perlindungan dari pelecehan dan kekerasan di tempat kerja, serta fasilitas yang diwajibkan oleh peraturan.',
                'description_en'          => 'The company ensures fulfillment of female workers\' rights in accordance with statutory regulations, including protection against discrimination, equal opportunities, maternity leave, miscarriage leave, protection for pregnant workers, protection from workplace harassment and violence, and facilities mandated by regulations.',
                'evidence'                => 'Kebijakan perlindungan pekerja perempuan, SOP, data cuti, fasilitas laktasi (apabila diwajibkan), mekanisme pengaduan, dokumentasi sosialisasi',
                'evidence_en'             => 'Female worker protection policies, SOPs, leave data, lactation facilities (where required), complaint mechanisms, socialization documentation',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur perlindungan pekerja perempuan, termasuk hak cuti dan perlindungan dalam hubungan kerja.
• UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual — mengatur pencegahan, penanganan, perlindungan, dan pemulihan korban kekerasan seksual.
• Permenaker terkait pekerja perempuan — mengatur perlindungan dan kondisi kerja khusus bagi pekerja perempuan.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Law No. 12 of 2022 on Sexual Violence Crime; Ministry of Manpower Regulation on Female Workers',
            ],
            30 => [
                'name'                    => 'Youth Employment',
                'name_id'                 => 'Ketenagakerjaan Pemuda',
                'description'             => 'Perusahaan mematuhi ketentuan mengenai usia minimum bekerja, tidak mempekerjakan anak di bawah batas usia yang ditetapkan, serta menyediakan program pembinaan, pelatihan, dan pengembangan kompetensi bagi pekerja muda (16-30 tahun) sesuai dengan ketentuan peraturan perundang-undangan.',
                'description_en'          => 'The company complies with minimum age of employment requirements, does not employ children below the established minimum age, and provides development, training, and competency-building programs for young workers (aged 16–30) in accordance with applicable statutory regulations.',
                'evidence'                => 'Data identitas pekerja, SOP rekrutmen, program pelatihan, laporan pengembangan kompetensi, hasil verifikasi usia',
                'evidence_en'             => 'Worker identity documents, recruitment SOPs, training programs, competency development reports, age verification results',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur ketentuan usia kerja, perlindungan pekerja muda, dan larangan mempekerjakan anak dalam kondisi tertentu.
• Konvensi ILO No. 138 tentang Usia Minimum untuk Diperbolehkan Bekerja — menetapkan standar usia minimum untuk bekerja.
• Konvensi ILO No. 182 tentang Pelarangan dan Tindakan Segera untuk Penghapusan Bentuk-Bentuk Pekerjaan Terburuk untuk Anak — mengatur penghapusan bentuk pekerjaan terburuk bagi anak.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; ILO Convention No. 138 and No. 182 (ratified by Indonesia)',
            ],
            31 => [
                'name'                    => 'Employment of Persons with Disabilities',
                'name_id'                 => 'Ketenagakerjaan Penyandang Disabilitas',
                'description'             => 'Perusahaan memberikan kesempatan kerja yang setara kepada penyandang disabilitas sesuai kompetensi dan kebutuhan jabatan, serta menyediakan akomodasi yang layak (reasonable accommodation) apabila diperlukan. Rekrutmen, pengembangan karier, dan lingkungan kerja dilaksanakan tanpa diskriminasi.',
                'description_en'          => 'The company provides equal employment opportunities for persons with disabilities based on competency and job requirements, and provides reasonable accommodation where necessary. Recruitment, career development, and work environment are implemented without discrimination.',
                'evidence'                => 'Kebijakan ketenagakerjaan, data pekerja penyandang disabilitas, SOP rekrutmen, dokumentasi fasilitas aksesibilitas, program pelatihan',
                'evidence_en'             => 'Employment policies, disability worker data, recruitment SOPs, accessibility facility documentation, training programs',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 8 Tahun 2016 tentang Penyandang Disabilitas — mengatur hak penyandang disabilitas, termasuk hak memperoleh pekerjaan yang layak dan perlakuan tanpa diskriminasi.
• PP No. 60 Tahun 2020 tentang Unit Layanan Disabilitas Bidang Ketenagakerjaan — mengatur penyediaan layanan ketenagakerjaan bagi penyandang disabilitas.",
                'regulation_en'           => 'Law No. 8 of 2016 on Persons with Disabilities; Government Regulation No. 60 of 2020',
            ],
            32 => [
                'name'                    => 'No Forced Labor',
                'name_id'                 => 'Tidak Ada Kerja Paksa',
                'description'             => 'Perusahaan menjamin bahwa seluruh hubungan kerja dilakukan secara sukarela tanpa adanya kerja paksa, ancaman, intimidasi, penyitaan dokumen pribadi, atau bentuk pemaksaan lainnya. Lembur hanya dilakukan berdasarkan persetujuan pekerja dan diberikan kompensasi sesuai ketentuan yang berlaku.',
                'description_en'          => 'The company ensures that all employment relationships are conducted voluntarily without forced labor, threats, intimidation, confiscation of personal documents, or other forms of coercion. Overtime is conducted only based on worker consent and compensated in accordance with applicable regulations.',
                'evidence'                => 'Perjanjian kerja, kebijakan ketenagakerjaan, data lembur, slip pembayaran lembur, mekanisme pengaduan',
                'evidence_en'             => 'Employment agreements, employment policies, overtime data, overtime payment slips, complaint mechanisms',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan kerja dan perlindungan hak pekerja.
• Konvensi ILO No. 29 tentang Kerja Paksa — mengatur penghapusan kerja paksa dalam segala bentuk.
• Konvensi ILO No. 105 tentang Penghapusan Kerja Paksa — mengatur penghapusan kerja paksa sebagai sarana pemaksaan atau hukuman.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; ILO Convention No. 29 and No. 105 on Forced Labour',
            ],
            33 => [
                'name'                    => 'Minimum Age and No Child Labor',
                'name_id'                 => 'Usia Minimum dan Tidak Ada Pekerja Anak',
                'description'             => 'Perusahaan tidak mempekerjakan pekerja di bawah usia minimum yang ditetapkan dalam peraturan perundang-undangan serta menerapkan prosedur verifikasi usia pada proses rekrutmen. Perusahaan juga melakukan pengawasan untuk mencegah pekerja anak dalam kegiatan operasional yang berada di bawah kendalinya.',
                'description_en'          => 'The company does not employ workers below the minimum age established by statutory regulations and applies age verification procedures in the recruitment process. The company also conducts oversight to prevent child labor in operational activities under its control.',
                'evidence'                => 'Dokumen identitas pekerja, SOP rekrutmen, hasil verifikasi usia, daftar karyawan',
                'evidence_en'             => 'Worker identity documents, recruitment SOPs, age verification results, employee lists',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur batas usia kerja dan perlindungan anak dari pekerjaan yang membahayakan.
• Konvensi ILO No. 138 tentang Usia Minimum untuk Diperbolehkan Bekerja — menetapkan usia minimum untuk bekerja.
• Konvensi ILO No. 182 tentang Pelarangan dan Tindakan Segera untuk Penghapusan Bentuk-Bentuk Pekerjaan Terburuk untuk Anak — mengatur penghapusan pekerjaan terburuk bagi anak.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; ILO Convention No. 138 and No. 182 (Minimum Age and Worst Forms of Child Labour)',
            ],
            34 => [
                'name'                    => 'Equal Remuneration',
                'name_id'                 => 'Remunerasi yang Setara',
                'description'             => 'Perusahaan menerapkan sistem remunerasi yang adil berdasarkan jabatan, kompetensi, tanggung jawab, dan kinerja tanpa diskriminasi. Upah, lembur, insentif, dan tunjangan diberikan sesuai ketentuan peraturan perundang-undangan dan terdokumentasi dengan baik.',
                'description_en'          => 'The company implements a fair remuneration system based on position, competency, responsibility, and performance without discrimination. Wages, overtime, incentives, and allowances are provided in accordance with statutory regulations and well-documented.',
                'evidence'                => 'Struktur dan skala upah, slip gaji, kebijakan remunerasi, bukti pembayaran lembur, hasil evaluasi jabatan',
                'evidence_en'             => 'Wage structure and scale, payslips, remuneration policies, overtime payment evidence, job evaluation results',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• PP No. 36 Tahun 2021 tentang Pengupahan — mengatur kebijakan pengupahan, struktur dan skala upah, upah minimum, perlindungan upah, dan pembayaran upah.
• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hak pekerja atas pengupahan dan perlindungan dalam hubungan kerja.",
                'regulation_en'           => 'Government Regulation No. 36 of 2021 on Wages; Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023',
            ],
            35 => [
                'name'                    => 'Seasonal and Part-time Workers Employment',
                'name_id'                 => 'Ketenagakerjaan Pekerja Musiman dan Paruh Waktu',
                'description'             => 'Perusahaan memperlakukan pekerja musiman, pekerja paruh waktu, pekerja kontrak, maupun peserta magang sesuai dengan ketentuan peraturan perundang-undangan, termasuk hak atas upah, keselamatan kerja, pelatihan, dan perlindungan sosial apabila dipersyaratkan.',
                'description_en'          => 'The company treats seasonal, part-time, contract workers, and interns in accordance with statutory regulations, including rights to wages, occupational safety, training, and social protection where required. Internship programs or seasonal worker recruitment are conducted transparently and documented.',
                'evidence'                => 'Perjanjian kerja PKWT/part-time, data pekerja musiman, program magang, bukti pembayaran upah, laporan pelatihan',
                'evidence_en'             => 'Fixed-term (PKWT)/part-time employment agreements, seasonal worker data, internship programs, wage payment evidence, training reports',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan kerja dan perlindungan hak pekerja.
• PP No. 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja — mengatur PKWT, alih daya, waktu kerja, waktu istirahat, lembur, dan PHK.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Government Regulation No. 35 of 2021 on Fixed-Term Employment Agreements',
            ],
            36 => [
                'name'                    => 'Fair Contract for Employees',
                'name_id'                 => 'Kontrak yang Adil bagi Karyawan',
                'description'             => 'Seluruh pekerja memiliki perjanjian kerja tertulis yang memuat hak dan kewajiban para pihak secara jelas, sesuai dengan ketentuan peraturan perundang-undangan, ditandatangani sebelum hubungan kerja dimulai, serta mudah dipahami oleh pekerja.',
                'description_en'          => 'All workers have written employment agreements that clearly specify the rights and obligations of both parties, comply with statutory regulations, are signed before the employment relationship begins, and are easily understood by workers.',
                'evidence'                => 'PKWT/PKWTT, Peraturan Perusahaan atau PKB, SOP SDM, bukti penandatanganan kontrak',
                'evidence_en'             => 'Fixed-term (PKWT)/permanent (PKWTT) employment agreements, Company Regulations or CLA, HR SOPs, contract signing evidence',
                'verification_method'     => 'Review dokumen',
                'verification_method_en'  => 'Document review',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hubungan kerja dan ketentuan perjanjian kerja antara pekerja dan pengusaha.
• PP No. 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja — mengatur ketentuan PKWT dan hubungan kerja.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Government Regulation No. 35 of 2021',
            ],
            37 => [
                'name'                    => 'On Time Payment of Wages',
                'name_id'                 => 'Pembayaran Upah Tepat Waktu',
                'description'             => 'Perusahaan membayarkan upah, tunjangan, dan hak finansial lainnya secara tepat waktu sesuai perjanjian kerja dan ketentuan peraturan perundang-undangan. Perusahaan memiliki sistem penggajian yang terdokumentasi serta mekanisme penanganan apabila terjadi keterlambatan pembayaran.',
                'description_en'          => 'The company pays wages, allowances, and other financial entitlements in a timely manner in accordance with employment agreements and statutory regulations. The company has a documented payroll system and a mechanism for handling payment delays.',
                'evidence'                => 'Slip gaji, bukti transfer bank, daftar pengupahan, laporan pembayaran gaji, SOP payroll',
                'evidence_en'             => 'Payslips, bank transfer evidence, payroll lists, payroll payment reports, payroll SOPs',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• PP No. 36 Tahun 2021 tentang Pengupahan — mengatur pembayaran upah, struktur dan skala upah, perlindungan upah, serta ketentuan pembayaran upah.
• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hak pekerja atas upah dan perlindungan pengupahan.",
                'regulation_en'           => 'Government Regulation No. 36 of 2021 on Wages; Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023',
            ],
            38 => [
                'name'                    => 'Legal Working Hours',
                'name_id'                 => 'Jam Kerja yang Sesuai Hukum',
                'description'             => 'Perusahaan menerapkan jam kerja, waktu istirahat, hari kerja, hari libur, dan kerja lembur sesuai dengan ketentuan peraturan perundang-undangan yang berlaku. Perusahaan memiliki sistem pencatatan jam kerja yang akurat, memastikan lembur dilakukan berdasarkan persetujuan pekerja apabila dipersyaratkan, memberikan kompensasi lembur sesuai ketentuan, serta melakukan evaluasi secara berkala terhadap kepatuhan jam kerja.',
                'description_en'          => 'The company implements working hours, rest periods, working days, holidays, and overtime in accordance with applicable statutory regulations. The company has an accurate working hours recording system, ensures overtime is conducted with worker consent where required, provides overtime compensation in accordance with regulations, and periodically evaluates working hours compliance.',
                'evidence'                => 'Peraturan Perusahaan/PKB, jadwal kerja, daftar hadir (manual/digital), timesheet, rekap lembur, formulir persetujuan lembur, slip pembayaran lembur, laporan audit internal',
                'evidence_en'             => 'Company Regulations/CLA, work schedules, attendance records (manual/digital), timesheets, overtime summaries, overtime consent forms, overtime payment slips, internal audit reports',
                'verification_method'     => 'Review dokumen, wawancara pekerja, observasi sistem absensi',
                'verification_method_en'  => 'Document review, worker interviews, attendance system observation',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur waktu kerja, waktu istirahat, kerja lembur, dan hak pekerja.
• PP No. 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja — mengatur waktu kerja, waktu istirahat, kerja lembur, dan upah lembur.
• Kepmenaker No. 102/MEN/VI/2004 tentang Waktu Kerja Lembur dan Upah Kerja Lembur — mengatur ketentuan pelaksanaan kerja lembur dan pembayaran upah lembur.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Government Regulation No. 35 of 2021; Ministerial Decree No. 102/MEN/VI/2004 on Overtime (insofar as still applicable)',
            ],
            39 => [
                'name'                    => 'Paid Pregnancy, Parental and Sick Leave',
                'name_id'                 => 'Cuti Berbayar untuk Kehamilan, Orang Tua, dan Sakit',
                'description'             => 'Perusahaan memberikan hak cuti melahirkan, cuti keguguran, cuti ayah (apabila diatur dalam peraturan perusahaan/PKB), cuti sakit, serta hak cuti lainnya sesuai ketentuan peraturan perundang-undangan. Prosedur pengajuan cuti terdokumentasi, tidak mengurangi hak normatif pekerja, dan tidak menjadi dasar diskriminasi dalam penilaian kinerja, promosi, maupun hubungan kerja.',
                'description_en'          => 'The company grants maternity leave, miscarriage leave, paternity leave (where stipulated in company regulations/CLA), sick leave, and other leave entitlements in accordance with statutory regulations. Leave procedures are documented, do not reduce workers\' normative rights, and are not used as a basis for discrimination in performance appraisal, promotion, or employment relationships.',
                'evidence'                => 'Peraturan Perusahaan/PKB, SOP cuti, data pengajuan dan persetujuan cuti, daftar cuti pekerja, rekam medis (apabila dipersyaratkan), slip pembayaran selama masa cuti',
                'evidence_en'             => 'Company Regulations/CLA, leave SOPs, leave application and approval data, worker leave records, medical records (where required), payment slips during leave period',
                'verification_method'     => 'Review dokumen, wawancara pekerja dan HR, verifikasi sampel data cuti',
                'verification_method_en'  => 'Document review, interviews with workers and HR, sample leave data verification',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hak pekerja atas cuti dan perlindungan pekerja perempuan.
• UU No. 17 Tahun 2023 tentang Kesehatan — mengatur penyelenggaraan kesehatan, termasuk perlindungan kesehatan ibu dan anak.
• PP No. 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja — mengatur waktu kerja dan waktu istirahat pekerja.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Law No. 17 of 2023 on Health; Government Regulation No. 35 of 2021',
            ],
            40 => [
                'name'                    => 'Retirement Benefits',
                'name_id'                 => 'Manfaat Pensiun',
                'description'             => 'Perusahaan memiliki kebijakan mengenai manfaat pensiun atau manfaat setelah berakhirnya hubungan kerja sesuai dengan ketentuan peraturan perundang-undangan, termasuk kepesertaan pekerja dalam program jaminan pensiun dan jaminan hari tua yang diwajibkan. Perusahaan memastikan seluruh hak pekerja yang memasuki masa pensiun dipenuhi secara tepat waktu, terdokumentasi, dan dikomunikasikan secara transparan kepada pekerja.',
                'description_en'          => 'The company has policies on pension benefits or post-employment benefits in accordance with statutory regulations, including worker enrollment in mandatory pension security and old-age security programs. The company ensures all retiring workers\' entitlements are fulfilled in a timely manner, documented, and communicated transparently to workers.',
                'evidence'                => 'Kebijakan pensiun, bukti kepesertaan BPJS Ketenagakerjaan (JHT dan JP), daftar pekerja pensiun, bukti pembayaran manfaat pensiun/pesangon, SOP pensiun',
                'evidence_en'             => 'Pension policies, BPJS Employment (Old-Age Security/JHT and Pension Security/JP) membership evidence, retired worker lists, pension benefit/severance payment evidence, pension SOPs',
                'verification_method'     => 'Review dokumen, wawancara HR, verifikasi sampel dokumen pensiun',
                'verification_method_en'  => 'Document review, HR interviews, sample pension document verification',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hak pekerja ketika hubungan kerja berakhir, termasuk hak terkait masa kerja dan pensiun.
• UU No. 24 Tahun 2011 tentang Badan Penyelenggara Jaminan Sosial — mengatur penyelenggaraan jaminan sosial bagi pekerja.
• PP No. 45 Tahun 2015 tentang Penyelenggaraan Program Jaminan Pensiun — mengatur penyelenggaraan program jaminan pensiun bagi pekerja.
• PP No. 46 Tahun 2015 tentang Penyelenggaraan Program Jaminan Hari Tua — mengatur penyelenggaraan program jaminan hari tua.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Law No. 24 of 2011 on BPJS; Government Regulation No. 45 of 2015 on Pension Insurance Program; Government Regulation No. 46 of 2015 on Old-Age Security',
            ],
            41 => [
                'name'                    => 'Minimum Wage',
                'name_id'                 => 'Upah Minimum',
                'description'             => 'Perusahaan membayarkan upah kepada seluruh pekerja sekurang-kurangnya sebesar Upah Minimum yang berlaku sesuai lokasi usaha dan ketentuan peraturan perundang-undangan. Perusahaan memiliki struktur dan skala upah yang terdokumentasi serta melakukan evaluasi apabila terjadi perubahan ketentuan Upah Minimum.',
                'description_en'          => 'The company pays all workers at least the applicable Minimum Wage according to the business location and statutory regulations. The company has a documented wage structure and scale, and conducts evaluations when there are changes in Minimum Wage provisions.',
                'evidence'                => 'Struktur dan skala upah, slip gaji, bukti transfer, daftar pengupahan, Peraturan Perusahaan/PKB',
                'evidence_en'             => 'Wage structure and scale, payslips, bank transfers, payroll lists, Company Regulations/CLA',
                'verification_method'     => 'Review dokumen, wawancara pekerja',
                'verification_method_en'  => 'Document review, worker interviews',
                'regulation'              => "• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hak pekerja atas pengupahan dan perlindungan tenaga kerja.
• PP No. 36 Tahun 2021 tentang Pengupahan — mengatur upah minimum, struktur dan skala upah, serta perlindungan upah.",
                'regulation_en'           => 'Law No. 13 of 2003 on Manpower as amended by Law No. 6 of 2023; Government Regulation No. 36 of 2021 on Wages',
            ],
            42 => [
                'name'                    => 'Living Wage',
                'name_id'                 => 'Upah Layak',
                'description'             => 'Perusahaan berupaya meningkatkan kesejahteraan pekerja melalui kebijakan remunerasi dan fasilitas kesejahteraan yang mempertimbangkan kebutuhan hidup layak, produktivitas, kemampuan perusahaan, dan keberlanjutan usaha.',
                'description_en'          => 'The company strives to improve worker welfare through remuneration policies and welfare facilities that consider the cost of decent living, productivity, company capability, and business sustainability. Where the company establishes an internal living wage standard, its implementation is documented and periodically evaluated.',
                'evidence'                => 'Kebijakan remunerasi, struktur kompensasi, fasilitas kesejahteraan, hasil survei kesejahteraan, laporan evaluasi',
                'evidence_en'             => 'Remuneration policies, compensation structure, welfare facilities, welfare survey results, evaluation reports',
                'verification_method'     => 'Review dokumen, wawancara manajemen dan pekerja',
                'verification_method_en'  => 'Document review, management and worker interviews',
                'regulation'              => "• PP No. 36 Tahun 2021 tentang Pengupahan — mengatur kebijakan pengupahan, struktur dan skala upah, upah minimum, dan perlindungan upah.
• UU No. 13 Tahun 2003 tentang Ketenagakerjaan sebagaimana telah diubah dengan UU No. 6 Tahun 2023 — mengatur hak pekerja atas penghasilan yang memenuhi kebutuhan hidup yang layak.",
                'regulation_en'           => 'Government Regulation No. 36 of 2021; Law No. 13 of 2003 as amended by Law No. 6 of 2023; ILO best practices on Living Wage',
            ],
            43 => [
                'name'                    => 'Premiums',
                'name_id'                 => 'Premi Asuransi',
                'description'             => 'Perusahaan menyediakan perlindungan asuransi bagi pekerja melalui pembayaran premi asuransi kesehatan, ketenagakerjaan, jiwa, atau jenis asuransi lainnya yang relevan guna meningkatkan kesejahteraan, keamanan finansial, dan perlindungan sosial tenaga kerja.',
                'description_en'          => 'The company provides insurance protection for workers through payment of health insurance premiums, employment insurance, life insurance, or other relevant types of insurance to improve workforce welfare, financial security, and social protection.',
                'evidence'                => 'Polis asuransi, bukti pembayaran premi, bukti kepesertaan BPJS atau asuransi, daftar peserta yang diasuransikan, kebijakan perusahaan terkait asuransi',
                'evidence_en'             => 'Insurance policies, premium payment evidence, BPJS or insurance membership evidence, lists of insured workers, company insurance policies',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 40 Tahun 2004 tentang Sistem Jaminan Sosial Nasional — mengatur penyelenggaraan sistem jaminan sosial nasional bagi masyarakat dan pekerja.
• UU No. 24 Tahun 2011 tentang Badan Penyelenggara Jaminan Sosial — mengatur pembentukan dan penyelenggaraan BPJS.
• PP No. 44 Tahun 2015 tentang Penyelenggaraan Program Jaminan Kecelakaan Kerja dan Jaminan Kematian — mengatur perlindungan pekerja melalui program JKK dan JKM.
• PP No. 45 Tahun 2015 tentang Penyelenggaraan Program Jaminan Pensiun — mengatur program jaminan pensiun pekerja.
• PP No. 46 Tahun 2015 tentang Penyelenggaraan Program Jaminan Hari Tua — mengatur program jaminan hari tua pekerja.
• PP No. 37 Tahun 2021 tentang Penyelenggaraan Program Jaminan Kehilangan Pekerjaan — mengatur perlindungan bagi pekerja yang mengalami kehilangan pekerjaan.",
                'regulation_en'           => 'Law No. 40 of 2004 on National Social Security System; Law No. 24 of 2011 on BPJS; Government Regulation No. 44 of 2015 as amended by No. 49 of 2023; Government Regulation No. 45 of 2015; Government Regulation No. 46 of 2015; Government Regulation No. 37 of 2021 as amended by No. 6 of 2025',
            ],
            44 => [
                'name'                    => 'Tax Compliance',
                'name_id'                 => 'Kepatuhan Pajak',
                'description'             => 'Perusahaan memenuhi seluruh kewajiban perpajakan sesuai ketentuan peraturan perundang-undangan, termasuk pendaftaran NPWP, pelaporan Surat Pemberitahuan (SPT), pembayaran pajak, pemotongan/pemungutan pajak apabila diwajibkan, serta menyimpan dokumen perpajakan secara tertib dan dapat ditelusuri.',
                'description_en'          => 'The company fulfills all tax obligations in accordance with statutory regulations, including NPWP (Taxpayer Identification Number) registration, tax return (SPT) filing, tax payments, tax withholding/collection where required, and maintains orderly and traceable tax documentation.',
                'evidence'                => 'NPWP, Bukti Penerimaan Elektronik (BPE), SPT Tahunan/Masa, bukti pembayaran pajak, laporan audit',
                'evidence_en'             => 'NPWP (Taxpayer ID), Electronic Receipt (BPE), Annual/Monthly Tax Returns (SPT), tax payment evidence, audit reports',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• UU No. 6 Tahun 1983 tentang Ketentuan Umum dan Tata Cara Perpajakan sebagaimana telah beberapa kali diubah, terakhir dengan UU No. 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan — mengatur ketentuan umum perpajakan, pendaftaran wajib pajak, pelaporan SPT, pembayaran, serta administrasi perpajakan.",
                'regulation_en'           => 'Law No. 6 of 1983 on General Taxation Provisions as last amended by the Tax Regulations Harmonization Law (Law No. 7 of 2021)',
            ],
            45 => [
                'name'                    => 'Retribution Payment',
                'name_id'                 => 'Pembayaran Retribusi',
                'description'             => 'Perusahaan memenuhi kewajiban pembayaran retribusi daerah, Penerimaan Negara Bukan Pajak (PNBP), atau pungutan resmi lainnya yang berkaitan dengan kegiatan usahanya sesuai dengan ketentuan peraturan perundang-undangan. Seluruh pembayaran terdokumentasi dan dapat ditelusuri.',
                'description_en'          => 'The company fulfills its obligations for regional retribution payments, Non-Tax State Revenue (PNBP), or other official levies related to its business activities in accordance with statutory regulations. All payments are documented and traceable.',
                'evidence'                => 'Bukti pembayaran retribusi, bukti pembayaran PNBP, izin usaha, laporan keuangan, kuitansi resmi',
                'evidence_en'             => 'Retribution payment evidence, PNBP payment evidence, business licenses, financial reports, official receipts',
                'verification_method'     => 'Review dokumen',
                'verification_method_en'  => 'Document review',
                'regulation'              => "• UU No. 1 Tahun 2022 tentang Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah — mengatur hubungan keuangan pusat dan daerah, termasuk pajak daerah dan retribusi daerah serta pengelolaan pendapatan daerah.",
                'regulation_en'           => 'Law No. 1 of 2022 on Financial Relations between Central and Regional Governments; relevant regional regulations',
            ],
            46 => [
                'name'                    => 'Agreement With Trader/ Costumers',
                'name_id'                 => 'Perjanjian dengan Pedagang/Pelanggan',
                'description'             => 'Perusahaan memiliki perjanjian tertulis dengan pedagang, pembeli, pelanggan, atau mitra usaha yang memuat hak dan kewajiban para pihak, spesifikasi produk atau jasa, mekanisme pembayaran, penyelesaian sengketa, dan ketentuan lain yang relevan. Perjanjian ditinjau secara berkala dan dipatuhi oleh para pihak.',
                'description_en'          => 'The company has written agreements with traders, buyers, customers, or business partners specifying the rights and obligations of both parties, product or service specifications, payment mechanisms, dispute resolution, and other relevant provisions. Agreements are periodically reviewed and complied with by all parties.',
                'evidence'                => 'Kontrak/MoU, Purchase Order, Sales Agreement, SOP pengelolaan kontrak, dokumentasi evaluasi kontrak',
                'evidence_en'             => 'Contracts/MoUs, Purchase Orders, Sales Agreements, contract management SOPs, contract evaluation documentation',
                'verification_method'     => 'Review dokumen, wawancara',
                'verification_method_en'  => 'Document review, interviews',
                'regulation'              => "• KUH Perdata — mengatur hubungan hukum perdata, termasuk perjanjian, hak dan kewajiban para pihak, serta akibat hukum dari suatu perjanjian.
• UU No. 8 Tahun 1999 tentang Perlindungan Konsumen — mengatur hak dan kewajiban konsumen serta pelaku usaha dan perlindungan konsumen.
• UU No. 7 Tahun 2014 tentang Perdagangan — mengatur kegiatan perdagangan, hubungan pelaku usaha, serta ketentuan perdagangan barang dan jasa.",
                'regulation_en'           => 'Indonesian Civil Code; Law No. 8 of 1999 on Consumer Protection; Law No. 7 of 2014 on Trade',
            ],
            47 => [
                'name'                    => 'Product Recycling and Reuse',
                'name_id'                 => 'Daur Ulang dan Penggunaan Kembali Produk',
                'description'             => 'Perusahaan menerapkan program penggunaan kembali (reuse), daur ulang (recycling), atau pemanfaatan kembali produk, kemasan, bahan baku, maupun limbah yang masih memiliki nilai guna. Program memiliki target, indikator kinerja, pelaksanaan, pemantauan, dan evaluasi berkala untuk mendukung ekonomi sirkular.',
                'description_en'          => 'The company implements programs for reuse, recycling, or recovery of products, packaging, raw materials, and waste that still have value. The program has targets, performance indicators, implementation, monitoring, and periodic evaluation to support a circular economy.',
                'evidence'                => 'Circular Economy Plan, data volume reuse/recycling, SOP, laporan capaian, dokumentasi implementasi',
                'evidence_en'             => 'Circular Economy Plan, reuse/recycling volume data, SOPs, achievement reports, implementation documentation',
                'verification_method'     => 'Review dokumen, observasi lapangan',
                'verification_method_en'  => 'Document review, field observation',
                'regulation'              => "• UU No. 18 Tahun 2008 tentang Pengelolaan Sampah — mengatur pengurangan dan penanganan sampah, termasuk pemanfaatan kembali dan daur ulang.
• PP No. 27 Tahun 2020 tentang Pengelolaan Sampah Spesifik — mengatur pengelolaan sampah yang memiliki karakteristik khusus.
• PP No. 22 Tahun 2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup — mengatur pengelolaan limbah dan pengendalian dampak lingkungan.",
                'regulation_en'           => 'Law No. 18 of 2008 on Waste Management; Government Regulation No. 27 of 2020; Government Regulation No. 22 of 2021',
            ],
            48 => [
                'name'                    => 'Innovation and Technological Intervention',
                'name_id'                 => 'Inovasi dan Intervensi Teknologi',
                'description'             => 'Perusahaan mengembangkan dan/atau menerapkan inovasi teknologi untuk meningkatkan efisiensi operasional, produktivitas, keselamatan kerja, perlindungan lingkungan, atau keberlanjutan usaha. Inovasi direncanakan, diuji, didokumentasikan, dievaluasi efektivitasnya, dan ditingkatkan secara berkelanjutan.',
                'description_en'          => 'The company develops and/or implements technological innovations to improve operational efficiency, productivity, workplace safety, environmental protection, or business sustainability. Innovations are planned, tested, documented, evaluated for effectiveness, and continuously improved.',
                'evidence'                => 'Roadmap inovasi, laporan R&D, paten/HKI (apabila ada), SOP teknologi, laporan implementasi, indikator kinerja',
                'evidence_en'             => 'Innovation roadmap, R&D reports, patents/intellectual property (if any), technology SOPs, implementation reports, performance indicators',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 11 Tahun 2019 tentang Sistem Nasional Ilmu Pengetahuan dan Teknologi — mengatur penyelenggaraan ilmu pengetahuan dan teknologi, penelitian, pengembangan, inovasi, serta pemanfaatan hasil teknologi untuk pembangunan.",
                'regulation_en'           => 'Law No. 11 of 2019 on the National Science and Technology System',
            ],
            49 => [
                'name'                    => 'Local Micro-, Small-, and Medium Sized Enterprises Development',
                'name_id'                 => 'Pengembangan UMKM Lokal',
                'description'             => 'Perusahaan melaksanakan program pengembangan UMKM lokal melalui kemitraan, pelatihan, pendampingan, akses pasar, penguatan kapasitas usaha, atau dukungan pembiayaan sesuai dengan karakteristik kegiatan usahanya. Program dievaluasi secara berkala berdasarkan indikator yang terukur.',
                'description_en'          => 'The company implements local MSME development programs through partnerships, training, mentoring, market access, capacity building, or financing support in accordance with its business characteristics. The program is periodically evaluated based on measurable indicators.',
                'evidence'                => 'Program kemitraan UMKM, daftar UMKM binaan, laporan pelatihan, MoU, laporan evaluasi, dokumentasi kegiatan',
                'evidence_en'             => 'MSME partnership programs, coached MSME lists, training reports, MoUs, evaluation reports, activity documentation',
                'verification_method'     => 'Review dokumen, wawancara, observasi',
                'verification_method_en'  => 'Document review, interviews, observation',
                'regulation'              => "• UU No. 20 Tahun 2008 tentang Usaha Mikro, Kecil, dan Menengah — mengatur pemberdayaan, pengembangan, perlindungan, dan kemitraan UMKM.
• PP No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan Koperasi dan Usaha Mikro, Kecil, dan Menengah — mengatur kemudahan berusaha, perlindungan, pemberdayaan, pembinaan, serta pengembangan UMKM.",
                'regulation_en'           => 'Law No. 20 of 2008 on Micro, Small, and Medium Enterprises; Government Regulation No. 7 of 2021',
            ],
            50 => [
                'name'                    => 'Digital Transformation',
                'name_id'                 => 'Transformasi Digital',
                'description'             => 'Perusahaan memiliki strategi transformasi digital untuk meningkatkan efektivitas tata kelola, operasional, pelayanan, pengelolaan data, dan pengambilan keputusan. Implementasi mencakup pemanfaatan teknologi informasi yang sesuai dengan kebutuhan organisasi, pengamanan data, peningkatan kompetensi SDM, serta evaluasi berkala terhadap efektivitas sistem digital yang digunakan.',
                'description_en'          => 'The company has a digital transformation strategy to improve governance effectiveness, operations, services, data management, and decision-making. Implementation includes utilization of information technology appropriate to organizational needs, data security, HR competency development, and periodic evaluation of the effectiveness of digital systems used.',
                'evidence'                => 'Roadmap transformasi digital, kebijakan TI, SOP keamanan informasi, laporan implementasi sistem, pelatihan pengguna, hasil evaluasi',
                'evidence_en'             => 'Digital transformation roadmap, IT policies, information security SOPs, system implementation reports, user training records, digital system effectiveness evaluation results',
                'verification_method'     => 'Review dokumen, observasi, wawancara',
                'verification_method_en'  => 'Document review, observation, interviews',
                'regulation'              => "• UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi — mengatur pelindungan data pribadi, hak subjek data, kewajiban pengendali/pemroses data, serta keamanan dan pemrosesan data pribadi.
• UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik sebagaimana telah diubah dengan UU No. 1 Tahun 2024 — mengatur informasi elektronik, transaksi elektronik, sistem elektronik, serta aspek hukum pemanfaatan teknologi informasi.
• PP No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik — mengatur penyelenggaraan sistem elektronik, kewajiban penyelenggara sistem elektronik, keamanan sistem, dan transaksi elektronik.",
                'regulation_en'           => 'Law No. 27 of 2022 on Personal Data Protection; Law No. 11 of 2008 as amended by Law No. 1 of 2024 on Electronic Information and Transactions; Government Regulation No. 71 of 2019',
            ],
        ];

        foreach ($data as $id => $row) {
            $principleId = (int) ceil($id / 5);

            $indicator = \App\Models\Indicator::updateOrCreate(
                ['id' => $id],
                [
                    'principle_id'            => $principleId,
                    'name'                    => $row['name'],
                    'name_id'                 => $row['name_id'],
                    'description'             => $row['description'],
                    'description_en'          => $row['description_en'],
                    'evidence'                => $row['evidence'],
                    'evidence_en'             => $row['evidence_en'],
                    'verification_method'     => $row['verification_method'],
                    'verification_method_en'  => $row['verification_method_en'],
                    'regulation'              => $row['regulation'],
                    'regulation_en'           => $row['regulation_en'],
                    'sort_order'              => $id,
                ]
            );

            // Indonesian question text
            $textId  = 'Apakah perusahaan memenuhi kriteria ' . $row['name_id'] . '? (' . \Illuminate\Support\Str::limit($row['description'], 150) . ')';
            // English question text
            $textEn  = 'Does the company meet the criteria of ' . $row['name'] . '? (' . \Illuminate\Support\Str::limit($row['description_en'], 150) . ')';

            \App\Models\Question::updateOrCreate(
                ['indicator_id' => $indicator->id],
                [
                    'text'       => $textId,
                    'text_en'    => $textEn,
                    'sort_order' => $id,
                ]
            );
        }

        $this->command->info('IndicatorAuditDataSeeder: Successfully seeded ' . count($data) . ' indicators & questions with full bilingual (ID/EN) audit metadata.');
    }
}
