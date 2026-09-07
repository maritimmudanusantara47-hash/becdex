<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\CmsContent;

class CmsContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contents = [
            // HOME
            [
                'key' => 'home.hero.title',
                'group' => 'home',
                'type' => 'text',
                'value_en' => 'We measure what matters in the Blue Economy.',
                'value_id' => 'Kami mengukur hal-hal penting dalam Ekonomi Biru.',
            ],
            [
                'key' => 'home.hero.desc',
                'group' => 'home',
                'type' => 'longtext',
                'value_en' => 'Blue Economy Company Index (BECdex) is an independent standard for maritime companies with blue economy practices.',
                'value_id' => 'Indeks Perusahaan Ekonomi Biru (BECdex) adalah standar independen bagi perusahaan maritim dengan praktik ekonomi biru.',
            ],
            [
                'key' => 'home.certify.title',
                'group' => 'home',
                'type' => 'text',
                'value_en' => 'Want your company to be certified?',
                'value_id' => 'Ingin perusahaan Anda disertifikasi?',
            ],
            [
                'key' => 'home.certify.link_text',
                'group' => 'home',
                'type' => 'text',
                'value_en' => 'Click Here.',
                'value_id' => 'Klik Di Sini.',
            ],

            // ABOUT
            [
                'key' => 'about.what_is.title',
                'group' => 'about',
                'type' => 'text',
                'value_en' => 'What is BECdex?',
                'value_id' => 'Apa itu BECdex?',
            ],
            [
                'key' => 'about.what_is.p1',
                'group' => 'about',
                'label' => 'Deskripsi: Apa itu BECdex?',
                'type' => 'html',
                'value_en' => '<p>Blue Economy Company Index (BECdex) is an independent standard for maritime companies with blue economy practices. The establishment of this standard refers to 10 Blue Economy Principles and 11 Maritime Sectors evaluated under BECdex, mapping to the 17 Sustainable Development Goals (SDGs).</p>',
                'value_id' => '<p>Indeks Perusahaan Ekonomi Biru (BECdex) adalah standar independen untuk perusahaan maritim dengan praktik ekonomi biru. Pembentukan standar ini merujuk pada 10 Prinsip Ekonomi Biru dan 11 Sektor Maritim yang dievaluasi di bawah BECdex, yang dipetakan pada 17 Tujuan Pembangunan Berkelanjutan (SDGs).</p>',
            ],
            [
                'key' => 'about.how_certified.title',
                'group' => 'about',
                'type' => 'text',
                'value_en' => 'How to be certified by BECdex?',
                'value_id' => 'Bagaimana cara disertifikasi oleh BECdex?',
            ],
            [
                'key' => 'about.how_certified.desc',
                'group' => 'about',
                'label' => 'Deskripsi: Cara Sertifikasi',
                'type' => 'html',
                'value_en' => '<p>The BECdex certification procedure consists of registration, self-assessment, independent assessment by assessors, and verification by verifiers. Companies that meet the criteria will receive a Blue Economy Company e-certificate with a valid period of 2 (two) years.</p>',
                'value_id' => '<p>Prosedur sertifikasi BECdex terdiri dari pendaftaran, penilaian mandiri, penilaian independen oleh asesor, dan verifikasi oleh verifikator. Perusahaan yang memenuhi kriteria akan menerima e-sertifikat Perusahaan Ekonomi Biru dengan masa berlaku 2 (dua) tahun.</p>',
            ],
            [
                'key' => 'about.sectors',
                'group' => 'about',
                'type' => 'json_array',
                'value_en' => [
                    "Marine fisheries (capture and aquaculture)",
                    "Marine biotechnology and bioproducts",
                    "Maritime trade, shipping, and port services",
                    "Marine tourism and recreation",
                    "Marine renewable energy",
                    "Marine mineral resources extraction",
                    "Maritime manufacturing and construction",
                    "Marine research, education, and consulting",
                    "Maritime security and defense services",
                    "Marine environmental protection and conservation",
                    "Coastal and ocean management services",
                    "Marine Communication, Equipment and Instrumentation",
                ],
                'value_id' => [
                    "Perikanan laut (tangkap dan budidaya)",
                    "Bioteknologi laut dan bioproduk",
                    "Perdagangan laut, pelayaran, dan layanan pelabuhan",
                    "Wisata bahari dan rekreasi",
                    "Energi terbarukan laut",
                    "Ekstraksi sumber daya mineral laut",
                    "Manufaktur dan konstruksi maritim",
                    "Penelitian, pendidikan, dan konsultasi laut",
                    "Layanan keamanan dan pertahanan maritim",
                    "Perlindungan dan konservasi lingkungan laut",
                    "Layanan pengelolaan pesisir dan laut",
                    "Komunikasi, Peralatan, dan Instrumentasi Laut",
                ]
            ],

            // EXPLORE
            [
                'key' => 'explore.catalog.title',
                'group' => 'explore',
                'type' => 'text',
                'value_en' => 'BECdex Catalog',
                'value_id' => 'Katalog BECdex',
            ],
            [
                'key' => 'explore.catalog.desc',
                'group' => 'explore',
                'type' => 'longtext',
                'value_en' => 'The BECdex Catalog contains the list of criteria, aspects, indicators, and questions used in the BECdex assessment and verification procedure. It serves as a transparent reference for maritime companies to prepare for certification.',
                'value_id' => 'Katalog BECdex berisi daftar kriteria, aspek, indikator, dan pertanyaan yang digunakan dalam prosedur penilaian dan verifikasi BECdex. Ini berfungsi sebagai acuan transparan bagi perusahaan maritim untuk mempersiapkan sertifikasi.',
            ],
            [
                'key' => 'explore.coastal.title',
                'group' => 'explore',
                'type' => 'text',
                'value_en' => 'List of Coastal States',
                'value_id' => 'Daftar Negara Pantai',
            ],
            [
                'key' => 'explore.coastal.desc',
                'group' => 'explore',
                'label' => 'Deskripsi: Coastal States',
                'type' => 'html',
                'value_en' => '<p>Coastal state is a state with a sea-coastline. There are 153 of 193 member states of United Nations are coastal states in 2021. The length of a country\'s coastline is measured around all the coasts in the region.</p>',
                'value_id' => '<p>Negara pantai adalah negara yang memiliki garis pantai laut. Terdapat 153 dari 193 negara anggota Perserikatan Bangsa-Bangsa yang merupakan negara pantai pada tahun 2021. Panjang garis pantai sebuah negara diukur di sekitar seluruh pantai di wilayah tersebut.</p>',
            ],
            [
                'key' => 'explore.legal.title',
                'group' => 'explore',
                'type' => 'text',
                'value_en' => 'The Legal Basis and International Commitment of Blue Economy Development in Indonesia',
                'value_id' => 'Landasan Hukum dan Komitmen Internasional Pengembangan Ekonomi Biru di Indonesia',
            ],
            [
                'key' => 'explore.legal.list',
                'group' => 'explore',
                'type' => 'json_array',
                'value_en' => [
                    "The Law of the Republic of Indonesia No. 32 of 2014 on Marine Affairs",
                    "Government Regulation No. 27 of 2021 on Implementation of the Marine Affairs and Fisheries Sector",
                    "Government Regulation No. 31 of 2021 on Implementation of the Shipping Sector",
                    "Presidential Regulation No. 16 of 2017 on Indonesian Ocean Policy",
                    "Presidential Regulation No. 59 of 2017 on Implementation of the SDGs",
                    "2045 Vision of National Maritime Development",
                    "Indonesia Blue Economy Roadmap 2023–2045",
                    "Blue Economy Development Framework for Indonesia’s Economic Transformation (2021)",
                    "G20 Bali Leaders’ Declaration (2022)",
                    "Transformations for a Sustainable Ocean Economy: A Vision for Protection, Production and Prosperity – High Level Panel for a Sustainable Ocean Economy (the Ocean Panel) (2021)",
                    "Preah Sihanouk Ministerial Declaration: Advancing Our Sustainable Development Agenda: Road to 2030 for Healthy Ocean, People, and Economies – PEMSEA (2021)",
                    "ASEAN Leaders’ Declaration on Blue Economy (2021)",
                    "ASEAN Blue Economy Framework (2023)",
                    "ASEAN Outlook on the Indo-Pacific (2019)",
                    "Declaration of the Indian Ocean Rim Association on the Blue Economy in the Indian Ocean Region (2017)",
                    "Manado Joint Declaration on the Establishment of the Archipelagic and Island States Forum (2018)",
                    "Leaders’ Declaration on the Solidarity of the Archipelagic and Island States Forum (2023)",
                    "APEC High Level Policy Dialogue on Food Security and Blue Economy Plan of Action (2015)",
                    "ASEAN Blue Economy Implementation Plan for Sustainability and Prosperity 2026-2030",
                    "Joint Statement on Cooperation in the Field of Blue Economy Between Sweden and Indonesia (2021)",
                    "Australia–Indonesia Joint Statement on Cooperation on the Green Economy and Energy Transition (2021)",
                    "The 2nd Mission of the President of the Republic of Indonesia 2024–2029",
                ],
                'value_id' => [
                    "Undang-Undang Republik Indonesia Nomor 32 Tahun 2014 tentang Kelautan",
                    "Peraturan Pemerintah Nomor 27 Tahun 2021 tentang Penyelenggaraan Bidang Kelautan dan Perikanan",
                    "Peraturan Pemerintah Nomor 31 Tahun 2021 tentang Penyelenggaraan Bidang Pelayaran",
                    "Peraturan Presiden Nomor 16 Tahun 2017 tentang Kebijakan Kelautan Indonesia",
                    "Peraturan Presiden Nomor 59 Tahun 2017 tentang Pelaksanaan Pencapaian Tujuan Pembangunan Berkelanjutan (SDGs)",
                    "Visi Pembangunan Kemaritiman Nasional 2045",
                    "Peta Jalan Ekonomi Biru Indonesia 2023–2045",
                    "Kerangka Kerja Pembangunan Ekonomi Biru untuk Transformasi Ekonomi Indonesia (2021)",
                    "Deklarasi Pemimpin G20 Bali (2022)",
                    "Transformasi untuk Ekonomi Laut Berkelanjutan: Visi untuk Perlindungan, Produksi, dan Kemakmuran – Panel Tingkat Tinggi untuk Ekonomi Laut Berkelanjutan (Panel Laut) (2021)",
                    "Deklarasi Tingkat Menteri Preah Sihanouk: Memajukan Agenda Pembangunan Berkelanjutan: Jalan Menuju 2030 untuk Laut, Manusia, dan Ekonomi yang Sehat – PEMSEA (2021)",
                    "Deklarasi Pemimpin ASEAN tentang Ekonomi Biru (2021)",
                    "Kerangka Kerja Ekonomi Biru ASEAN (2023)",
                    "Pandangan ASEAN tentang Indo-Pasifik (2019)",
                    "Deklarasi Asosiasi Negara-Negara Lingkar Samudra Hindia tentang Ekonomi Biru di Wilayah Samudra Hindia (2017)",
                    "Deklarasi Bersama Manado tentang Pembentukan Forum Negara Kepulauan dan Pulau (2018)",
                    "Deklarasi Pemimpin tentang Solidaritas Forum Negara Kepulauan dan Pulau (2023)",
                    "Dialog Kebijakan Tingkat Tinggi APEC tentang Ketahanan Pangan dan Rencana Aksi Ekonomi Biru (2015)",
                    "Rencana Implementasi Ekonomi Biru ASEAN untuk Keberlanjutan dan Kemakmuran 2026-2030",
                    "Pernyataan Bersama tentang Kerja Sama di Bidang Ekonomi Biru antara Swedia dan Indonesia (2021)",
                    "Pernyataan Bersama Australia-Indonesia tentang Kerja Sama Ekonomi Hijau dan Transisi Energi (2021)",
                    "Misi ke-2 Presiden Republik Indonesia 2024–2029",
                ]
            ],

            // FOOTER
            [
                'key' => 'footer.operation',
                'group' => 'global',
                'type' => 'text',
                'value_en' => 'Mahakarya Maritim Group',
                'value_id' => 'Mahakarya Maritim Group',
            ],
            [
                'key' => 'footer.address',
                'group' => 'global',
                'type' => 'longtext',
                'value_en' => 'Indonesia Blue Economy Center (IBEC)\nCampus C STIE Indonesia Jakarta\nJalan Pratekan No. 9A, Rawamangun\nJakarta, Indonesia 13220',
                'value_id' => 'Pusat Ekonomi Biru Indonesia (IBEC)\nKampus C STIE Indonesia Jakarta\nJalan Pratekan No. 9A, Rawamangun\nJakarta, Indonesia 13220',
            ],
            // SEO Meta Tags
            [
                'key' => 'seo.home.title',
                'group' => 'seo',
                'label' => 'Meta Title Beranda',
                'type' => 'text',
                'value_en' => 'BECdex | Blue Economy Company Index',
                'value_id' => 'BECdex | Indeks Perusahaan Ekonomi Biru',
            ],
            [
                'key' => 'seo.home.desc',
                'group' => 'seo',
                'label' => 'Meta Deskripsi Beranda',
                'type' => 'longtext',
                'value_en' => 'BECdex is an independent standard for maritime companies with blue economy practices.',
                'value_id' => 'BECdex adalah standar independen bagi perusahaan maritim dengan praktik ekonomi biru.',
            ],
        ];

        foreach ($contents as $content) {
            if (!isset($content['label'])) {
                // Auto generate label if not set: e.g., 'home.hero.title' -> 'Home Hero Title'
                $content['label'] = ucwords(str_replace(['.', '_'], ' ', $content['key']));
            }

            if (is_array($content['value_en'])) {
                $content['value_en'] = json_encode($content['value_en'], JSON_UNESCAPED_UNICODE);
            }
            if (is_array($content['value_id'])) {
                $content['value_id'] = json_encode($content['value_id'], JSON_UNESCAPED_UNICODE);
            }

            $content['default_value_en'] = $content['value_en'];
            $content['default_value_id'] = $content['value_id'];

            CmsContent::updateOrCreate(
                ['key' => $content['key']],
                $content
            );
        }

    }
}
