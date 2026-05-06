<?php

use App\Models\PredictionHistory;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('user dapat login', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
});

it('user dapat membuat proyek', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/projects', [
        'nama_tanaman' => 'Padi Ciherang',
        'jenis_tanaman' => 'Padi',
        'luas_lahan' => 2.4,
        'lokasi' => 'Karawang',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'nama_tanaman' => 'Padi Ciherang',
    ]);
});

it('validasi proyek gagal jika data kosong', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/projects', []);

    $response->assertSessionHasErrors([
        'nama_tanaman',
        'jenis_tanaman',
        'luas_lahan',
        'lokasi',
    ]);
});

it('user dapat input data pertanian', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post('/inputs', [
        'project_id' => $project->id,
        'nitrogen' => 60,
        'phosphorus' => 55,
        'potassium' => 58,
        'ph_tanah' => 6.5,
        'kelembapan_tanah' => 68,
        'jumlah_air' => 65,
        'suhu' => 29,
        'kelembapan_udara' => 75,
        'curah_hujan' => 120,
        'sumber_cuaca' => 'manual',
        'catatan' => 'Input test',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('input_logs', [
        'user_id' => $user->id,
        'project_id' => $project->id,
        'catatan' => 'Input test',
    ]);
});

it('user tidak bisa melihat data user lain', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->get("/projects/{$project->id}")
        ->assertForbidden();
});

it('export PDF route dapat diakses user pemilik data', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id, 'lokasi' => 'Subang']);

    $inputLogId = \DB::table('input_logs')->insertGetId([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'nitrogen' => 60,
        'phosphorus' => 60,
        'potassium' => 60,
        'ph_tanah' => 6.8,
        'kelembapan_tanah' => 70,
        'jumlah_air' => 70,
        'suhu' => 28,
        'kelembapan_udara' => 74,
        'curah_hujan' => 115,
        'sumber_cuaca' => 'manual',
        'catatan' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $history = PredictionHistory::query()->create([
        'user_id' => $user->id,
        'project_id' => $project->id,
        'input_log_id' => $inputLogId,
        'estimasi_panen_ton' => 10.5,
        'skor_kecocokan' => 82,
        'status' => 'tinggi',
        'faktor_dominan' => 'pH Tanah',
        'rekomendasi_json' => [
            'pupuk_disarankan' => 'NPK',
            'waktu_tanam_terbaik' => 'Minggu ini',
            'waktu_panen_prediksi' => now()->addDays(100)->translatedFormat('d F Y'),
            'tips_perawatan' => ['Monitoring rutin'],
            'pengendalian_hama' => 'Inspeksi hama',
            'catatan_risiko' => 'Rendah',
            'ringkasan_status' => 'Baik',
        ],
        'lokasi' => 'Subang',
        'tanggal_prediksi' => now()->toDateString(),
    ]);

    $response = $this->actingAs($user)
        ->get("/histories/{$history->id}/export-pdf");

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

it('user dapat melihat riwayat miliknya sendiri', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id, 'lokasi' => 'Subang']);

    $inputLogId = \DB::table('input_logs')->insertGetId([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'nitrogen' => 60,
        'phosphorus' => 60,
        'potassium' => 60,
        'ph_tanah' => 6.8,
        'kelembapan_tanah' => 70,
        'jumlah_air' => 70,
        'suhu' => 28,
        'kelembapan_udara' => 74,
        'curah_hujan' => 115,
        'sumber_cuaca' => 'manual',
        'catatan' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $history = PredictionHistory::query()->create([
        'user_id' => $user->id,
        'project_id' => $project->id,
        'input_log_id' => $inputLogId,
        'estimasi_panen_ton' => 10.5,
        'skor_kecocokan' => 82,
        'status' => 'tinggi',
        'faktor_dominan' => 'pH Tanah',
        'rekomendasi_json' => [
            'pupuk_disarankan' => 'NPK',
            'waktu_tanam_terbaik' => 'Minggu ini',
            'waktu_panen_prediksi' => now()->addDays(100)->translatedFormat('d F Y'),
            'tips_perawatan' => ['Monitoring rutin'],
            'pengendalian_hama' => 'Inspeksi hama',
            'catatan_risiko' => 'Rendah',
            'ringkasan_status' => 'Baik',
        ],
        'lokasi' => 'Subang',
        'tanggal_prediksi' => now()->toDateString(),
    ]);

    $this->actingAs($user)->get("/histories/{$history->id}")->assertOk();
});

it('user tidak bisa export PDF milik user lain', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id, 'lokasi' => 'Subang']);

    $inputLogId = \DB::table('input_logs')->insertGetId([
        'project_id' => $project->id,
        'user_id' => $owner->id,
        'nitrogen' => 60,
        'phosphorus' => 60,
        'potassium' => 60,
        'ph_tanah' => 6.8,
        'kelembapan_tanah' => 70,
        'jumlah_air' => 70,
        'suhu' => 28,
        'kelembapan_udara' => 74,
        'curah_hujan' => 115,
        'sumber_cuaca' => 'manual',
        'catatan' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $history = PredictionHistory::query()->create([
        'user_id' => $owner->id,
        'project_id' => $project->id,
        'input_log_id' => $inputLogId,
        'estimasi_panen_ton' => 10.5,
        'skor_kecocokan' => 82,
        'status' => 'tinggi',
        'faktor_dominan' => 'pH Tanah',
        'rekomendasi_json' => [
            'pupuk_disarankan' => 'NPK',
            'waktu_tanam_terbaik' => 'Minggu ini',
            'waktu_panen_prediksi' => now()->addDays(100)->translatedFormat('d F Y'),
            'tips_perawatan' => ['Monitoring rutin'],
            'pengendalian_hama' => 'Inspeksi hama',
            'catatan_risiko' => 'Rendah',
            'ringkasan_status' => 'Baik',
        ],
        'lokasi' => 'Subang',
        'tanggal_prediksi' => now()->toDateString(),
    ]);

    $this->actingAs($other)
        ->get("/histories/{$history->id}/export-pdf")
        ->assertForbidden();
});
