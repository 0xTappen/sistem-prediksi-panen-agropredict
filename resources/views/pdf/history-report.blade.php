<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Prediksi Panen</title>
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
            padding: 16px 18px;
            border-radius: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
        }

        .meta {
            margin-top: 6px;
            font-size: 11px;
            opacity: 0.95;
        }

        .section {
            margin-top: 16px;
            background: #FFFFFF;
            border: 1px solid #D8E2C3;
            border-radius: 10px;
            padding: 12px;
        }

        .section h2 {
            margin: 0 0 10px;
            font-size: 13px;
            color: #2F6B3F;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #D8E2C3;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #EEF3E3;
            width: 33%;
        }

        .badge {
            display: inline-block;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 999px;
            background: #EEF3E3;
            border: 1px solid #D8E2C3;
        }

        ul {
            margin: 0;
            padding-left: 18px;
        }

        li {
            margin: 2px 0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Laporan Prediksi Panen</h1>
            <div class="meta">Dibuat: {{ now()->translatedFormat('d F Y H:i') }} | Pengguna: {{ $history->user->name }} ({{ $history->user->email }})</div>
        </div>

        <div class="section">
            <h2>Informasi Proyek</h2>
            <table>
                <tr><th>Nama Tanaman</th><td>{{ $history->project->nama_tanaman }}</td></tr>
                <tr><th>Jenis Tanaman</th><td>{{ $history->project->jenis_tanaman }}</td></tr>
                <tr><th>Luas Lahan</th><td>{{ number_format($history->project->luas_lahan, 2) }} ha</td></tr>
                <tr><th>Lokasi</th><td>{{ $history->project->lokasi }}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Data Input Pertanian</h2>
            <table>
                <tr><th>Nitrogen</th><td>{{ number_format($history->inputLog->nitrogen, 2) }}</td></tr>
                <tr><th>Phosphorus</th><td>{{ number_format($history->inputLog->phosphorus, 2) }}</td></tr>
                <tr><th>Potassium</th><td>{{ number_format($history->inputLog->potassium, 2) }}</td></tr>
                <tr><th>pH Tanah</th><td>{{ number_format($history->inputLog->ph_tanah, 2) }}</td></tr>
                <tr><th>Kelembapan Tanah</th><td>{{ number_format($history->inputLog->kelembapan_tanah, 2) }}</td></tr>
                <tr><th>Jumlah Air</th><td>{{ number_format($history->inputLog->jumlah_air, 2) }}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Data Cuaca</h2>
            <table>
                <tr><th>Suhu</th><td>{{ number_format($history->inputLog->suhu, 2) }} °C</td></tr>
                <tr><th>Kelembapan Udara</th><td>{{ number_format($history->inputLog->kelembapan_udara, 2) }} %</td></tr>
                <tr><th>Curah Hujan</th><td>{{ number_format($history->inputLog->curah_hujan, 2) }} mm</td></tr>
                <tr><th>Sumber Cuaca</th><td>{{ strtoupper($history->inputLog->sumber_cuaca) }}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Hasil Prediksi</h2>
            <table>
                <tr><th>Estimasi Panen</th><td>{{ number_format($history->estimasi_panen_ton, 2) }} ton</td></tr>
                <tr><th>Skor Kecocokan</th><td>{{ number_format($history->skor_kecocokan, 2) }}</td></tr>
                <tr><th>Status</th><td><span class="badge">{{ strtoupper($history->status) }}</span></td></tr>
                <tr><th>Faktor Dominan</th><td>{{ $history->faktor_dominan }}</td></tr>
                <tr><th>Tanggal Prediksi</th><td>{{ $history->tanggal_prediksi->translatedFormat('d F Y') }}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>Rekomendasi Pintar</h2>
            @php($r = $history->rekomendasi_json)
            <table>
                <tr><th>Pupuk Disarankan</th><td>{{ $r['pupuk_disarankan'] ?? '-' }}</td></tr>
                <tr><th>Waktu Tanam Terbaik</th><td>{{ $r['waktu_tanam_terbaik'] ?? '-' }}</td></tr>
                <tr><th>Waktu Panen Prediksi</th><td>{{ $r['waktu_panen_prediksi'] ?? '-' }}</td></tr>
                <tr><th>Pengendalian Hama</th><td>{{ $r['pengendalian_hama'] ?? '-' }}</td></tr>
                <tr><th>Catatan Risiko</th><td>{{ $r['catatan_risiko'] ?? '-' }}</td></tr>
            </table>

            @if(!empty($r['tips_perawatan']) && is_array($r['tips_perawatan']))
                <div style="margin-top:10px;">
                    <strong>Tips Perawatan:</strong>
                    <ul>
                        @foreach($r['tips_perawatan'] as $tip)
                            <li>{{ $tip }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>
    </div>
</body>
</html>
