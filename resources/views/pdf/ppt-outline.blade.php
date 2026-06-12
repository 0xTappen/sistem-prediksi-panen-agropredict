<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Outline Presentasi - Sistem Prediksi Panen</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            background: #F7F8EF;
            color: #1F2A1F;
            margin: 0;
            padding: 0;
            font-size: 12px;
        }
        .wrapper {
            padding: 24px;
        }
        .header {
            background: #2F6B3F;
            color: #FFFFFF;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 14px;
        }
        .header h1 {
            margin: 0 0 6px;
            font-size: 20px;
        }
        .header p {
            margin: 0;
            font-size: 11px;
            opacity: .95;
        }
        .section {
            background: #FFFFFF;
            border: 1px solid #D8E2C3;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        .section h2 {
            margin: 0 0 8px;
            color: #2F6B3F;
            font-size: 14px;
        }
        ul {
            margin: 0;
            padding-left: 18px;
        }
        li {
            margin: 3px 0;
            line-height: 1.45;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            border: 1px solid #D8E2C3;
            background: #EEF3E3;
            font-size: 10px;
            margin-right: 6px;
        }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Sistem Prediksi Panen & Rekomendasi</h1>
        <p>Dokumen Outline Presentasi | Dibuat: {{ now()->translatedFormat('d F Y H:i') }}</p>
    </div>

    <div class="section">
        <h2>1. Latar Belakang</h2>
        <ul>
            <li>Prediksi panen masih sering berbasis perkiraan, belum berbasis data terstruktur.</li>
            <li>Data lahan, cuaca, dan pemupukan belum terdokumentasi rapi dari musim ke musim.</li>
            <li>Keputusan perawatan sering terlambat karena minim analisis kondisi aktual.</li>
            <li>Dibutuhkan sistem terintegrasi untuk input data, prediksi, rekomendasi, dan arsip laporan.</li>
        </ul>
    </div>

    <div class="section">
        <h2>2. Deskripsi Web</h2>
        <ul>
            <li>Aplikasi full-stack berbasis Laravel + Inertia + React untuk manajemen data pertanian.</li>
            <li>User dapat membuat proyek lahan, input variabel agronomi, lalu memproses prediksi hasil panen.</li>
            <li>Hasil prediksi dilengkapi skor kecocokan, confidence model, faktor dominan, dan simulasi perbaikan.</li>
            <li>Semua hasil dapat disimpan ke riwayat dan diekspor ke PDF.</li>
        </ul>
    </div>

    <div class="section">
        <h2>3. Tujuan Sistem</h2>
        <ul>
            <li>Membantu petani memprediksi hasil panen secara lebih terukur.</li>
            <li>Mendukung keputusan pemupukan/perawatan berdasarkan data aktual.</li>
            <li>Menyediakan riwayat prediksi untuk evaluasi musim tanam.</li>
            <li>Mempermudah pembuatan laporan hasil dalam format PDF.</li>
        </ul>
    </div>

    <div class="section">
        <h2>4. Alur Penggunaan</h2>
        <ul>
            <li>Register/Login ke sistem.</li>
            <li>Tambah proyek lahan (tanaman, luas, lokasi).</li>
            <li>Input data pupuk, tanah, air, cuaca (API/fallback manual).</li>
            <li>Jalankan prediksi hasil panen.</li>
            <li>Lihat hasil + rekomendasi, simpan ke riwayat, dan export PDF.</li>
        </ul>
    </div>

    <div class="section">
        <h2>5. Fitur Utama</h2>
        <p>
            <span class="badge">Auth</span>
            <span class="badge">Dashboard</span>
            <span class="badge">CRUD Proyek</span>
            <span class="badge">Input Data</span>
            <span class="badge">Prediksi</span>
            <span class="badge">Rekomendasi</span>
            <span class="badge">Riwayat</span>
            <span class="badge">Export PDF</span>
            <span class="badge">Chatbot AI</span>
        </p>
        <ul>
            <li>Autentikasi user + proteksi route internal.</li>
            <li>Integrasi cuaca otomatis dan fallback manual.</li>
            <li>Prediksi estimasi panen (ton), skor, status, dan faktor dominan.</li>
            <li>Evaluasi model internal: MAE, RMSE, dan perbandingan terhadap baseline rule-based.</li>
            <li>Rekomendasi perawatan berbasis kondisi input dan insight AI yang bisa dijelaskan.</li>
            <li>Riwayat prediksi dengan detail dan export laporan PDF.</li>
        </ul>
    </div>

    <div class="section">
        <h2>6. Teknologi</h2>
        <ul>
            <li>Backend: Laravel 13, Eloquent ORM, Form Request, Service Layer, Policy.</li>
            <li>Frontend: Inertia.js, React 19, TypeScript, Tailwind CSS, shadcn/ui.</li>
            <li>Visualisasi: Recharts.</li>
            <li>Engine AI: KNN agronomi berbasis benchmark internal + explainable scoring.</li>
            <li>AI Assistant: LLM provider (Groq/Gemini) yang digrounding ke konteks akun pengguna.</li>
            <li>Laporan: DomPDF.</li>
            <li>Testing: Pest.</li>
            <li>Database dev: SQLite.</li>
        </ul>
    </div>

    <div class="section">
        <h2>7. Keunggulan Sistem</h2>
        <ul>
            <li>UI modern, responsif, dan mudah digunakan.</li>
            <li>Data tersimpan terstruktur dan bisa dilacak ulang.</li>
            <li>Pengambilan keputusan lebih objektif berbasis benchmark agronomi dan evaluasi model.</li>
            <li>Prediksi dapat dijelaskan lewat confidence, faktor dominan, kasus benchmark terdekat, dan simulasi perbaikan.</li>
            <li>Chatbot AI tidak generik, tetapi mempertimbangkan proyek dan riwayat prediksi user.</li>
        </ul>
    </div>

    <div class="section">
        <h2>8. Rencana Pengembangan</h2>
        <ul>
            <li>Perluasan benchmark internal menjadi dataset lapangan nyata multi-musim dan multi-wilayah.</li>
            <li>Eksperimen model lanjutan (gradient boosting / ensemble) di atas benchmark yang sama.</li>
            <li>Integrasi IoT sensor lahan (kelembapan/suhu) real-time.</li>
            <li>Notifikasi otomatis risiko cuaca dan rekomendasi tindakan.</li>
            <li>Analitik tren lintas musim tanam.</li>
        </ul>
    </div>

    <div class="section">
        <h2>9. Penutup</h2>
        <ul>
            <li>Sistem membantu digitalisasi proses pertanian secara praktis.</li>
            <li>Prediksi + rekomendasi + explainable AI mempercepat pengambilan keputusan lapangan.</li>
            <li>Riwayat dan PDF mendukung dokumentasi serta evaluasi berkelanjutan.</li>
        </ul>
    </div>
</div>
</body>
</html>
