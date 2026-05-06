<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dokumentasi Rumus Prediksi Panen</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1F2A1F;
            margin: 0;
            padding: 0;
            background: #F7F8EF;
        }

        .wrapper {
            padding: 24px;
        }

        .header {
            background: #2F6B3F;
            color: #FFFFFF;
            padding: 18px;
            border-radius: 12px;
        }

        .header h1 {
            margin: 0 0 4px 0;
            font-size: 19px;
        }

        .meta {
            margin: 0;
            font-size: 11px;
            opacity: 0.95;
        }

        .section {
            margin-top: 14px;
            background: #FFFFFF;
            border: 1px solid #D8E2C3;
            border-radius: 10px;
            padding: 12px;
        }

        .section h2 {
            margin: 0 0 8px 0;
            color: #2F6B3F;
            font-size: 14px;
        }

        .section p {
            margin: 0 0 8px 0;
            line-height: 1.55;
        }

        .formula {
            background: #EEF3E3;
            border: 1px solid #D8E2C3;
            border-radius: 8px;
            padding: 8px 10px;
            margin: 8px 0;
            font-size: 11px;
        }

        .note {
            font-size: 11px;
            color: #647064;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #D8E2C3;
            padding: 7px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #EEF3E3;
            width: 36%;
            color: #1F2A1F;
        }

        ul {
            margin: 0;
            padding-left: 18px;
        }

        li {
            margin: 2px 0;
            line-height: 1.45;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Dokumentasi Rumus Sistem Prediksi Panen</h1>
            <p class="meta">Sistem Prediksi Panen & Rekomendasi | Dibuat: {{ now()->translatedFormat('d F Y H:i') }}</p>
        </div>

        <div class="section">
            <h2>1) Rumus Skor Faktor (Range Ideal)</h2>
            <p>Dipakai untuk pH tanah, suhu, kelembapan tanah, curah hujan, jumlah air, dan kelembapan udara.</p>
            <div class="formula">
                Jika value berada di antara minIdeal..maxIdeal, skor = 100.
                <br>
                Jika di luar range ideal:
                <br>
                delta = jarak ke batas ideal terdekat
                <br>
                penalty = (delta / tolerance) x 100
                <br>
                skor = max(10, 100 - penalty)
            </div>
            <p class="note">Semakin jauh dari rentang ideal, skor makin turun. Batas minimum skor per faktor = 10.</p>
        </div>

        <div class="section">
            <h2>2) Rumus Skor Keseimbangan NPK</h2>
            <p>Ideal N, P, K masing-masing = 60.</p>
            <div class="formula">
                avgDelta = (|N-60| + |P-60| + |K-60|) / 3
                <br>
                npkScore = max(10, 100 - (avgDelta x 1.2))
            </div>
        </div>

        <div class="section">
            <h2>3) Rumus Skor Kecocokan Total</h2>
            <p>Skor kecocokan dihitung dari rata-rata semua komponen skor.</p>
            <div class="formula">
                skor_kecocokan = avg([
                skor_pH, skor_suhu, skor_kelembapan_tanah,
                skor_curah_hujan, skor_npk, skor_air, skor_kelembapan_udara
                ])
            </div>
            <table>
                <tr><th>Status</th><td>Tinggi jika skor >= 75</td></tr>
                <tr><th></th><td>Sedang jika skor 50 - 74</td></tr>
                <tr><th></th><td>Rendah jika skor &lt; 50</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>4) Rumus Estimasi Panen (Ton)</h2>
            <div class="formula">
                modifier = clamp(skor_kecocokan / 85, min=0.4, max=1.2)
                <br>
                estimasi_panen_ton = luas_lahan_ha x baseline_yield_per_hectare x modifier
            </div>
            <p>Baseline hasil per hektar berdasarkan jenis tanaman:</p>
            <table>
                <tr><th>Padi</th><td>5.8 ton/ha</td></tr>
                <tr><th>Jagung</th><td>6.2 ton/ha</td></tr>
                <tr><th>Kedelai</th><td>2.4 ton/ha</td></tr>
                <tr><th>Cabai</th><td>8.5 ton/ha</td></tr>
                <tr><th>Tomat</th><td>9.5 ton/ha</td></tr>
                <tr><th>Default</th><td>4.8 ton/ha</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>5) Faktor Dominan</h2>
            <p>Faktor dominan dipilih dari komponen yang skornya paling rendah, lalu dijadikan prioritas perbaikan.</p>
        </div>

        <div class="section">
            <h2>6) Aturan Rekomendasi Pintar</h2>
            <ul>
                <li>Nitrogen &lt; 45 => pupuk kaya N.</li>
                <li>Phosphorus &lt; 45 => pupuk kaya P.</li>
                <li>Potassium &lt; 45 => pupuk kaya K.</li>
                <li>pH &lt; 6.0 => kapur pertanian (dolomit).</li>
                <li>pH &gt; 7.5 => tambah bahan organik/kompos.</li>
                <li>Jumlah air &lt; 25 => jadwal penyiraman lebih rutin.</li>
                <li>Curah hujan &gt; 220 => perbaikan drainase + antisipasi jamur.</li>
                <li>Suhu &gt; 32 => mulsa/naungan parsial.</li>
                <li>Kelembapan udara/tanah &gt; 85 => pengendalian jamur/hama preventif.</li>
            </ul>
        </div>

        <div class="section">
            <h2>7) Sistem Cuaca (API & Mock)</h2>
            <p>
                Alur cuaca: BMKG (jika ada kode ADM4) -> fallback Open-Meteo -> jika gagal maka input manual.
                Pada mode mock development, nilai cuaca dihasilkan deterministik dari hash lokasi.
            </p>
            <div class="formula">
                seed = abs(crc32(lowercase(lokasi)))
                <br>
                suhu = 24 + (seed % 90) / 10
                <br>
                kelembapan_udara = 55 + (seed % 35)
                <br>
                curah_hujan = (seed % 180) / 3
            </div>
        </div>
    </div>
</body>
</html>
