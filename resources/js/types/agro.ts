export type Project = {
    id: number;
    user_id: number;
    nama_tanaman: string;
    jenis_tanaman: string;
    luas_lahan: number;
    lokasi: string;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
    input_logs?: InputLog[];
    prediction_histories?: PredictionHistory[];
};

export type InputLog = {
    id: number;
    project_id: number;
    user_id: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph_tanah: number;
    kelembapan_tanah: number;
    jumlah_air: number;
    suhu: number;
    kelembapan_udara: number;
    curah_hujan: number;
    sumber_cuaca: 'api' | 'manual';
    catatan: string | null;
    created_at: string;
    updated_at: string;
    project?: Project;
};

export type Recommendation = {
    pupuk_disarankan: string;
    waktu_tanam_terbaik: string;
    waktu_panen_prediksi: string;
    tips_perawatan: string[];
    pengendalian_hama: string;
    catatan_risiko: string;
    ringkasan_status: string;
};

export type Prediction = {
    estimasi_panen_ton: number;
    skor_kecocokan: number;
    status: 'rendah' | 'sedang' | 'tinggi';
    faktor_dominan: string;
    catatan_prediksi: string;
    komponen_skor: Record<string, number>;
};

export type PredictionHistory = {
    id: number;
    user_id: number;
    project_id: number;
    input_log_id: number;
    estimasi_panen_ton: number;
    skor_kecocokan: number;
    status: 'rendah' | 'sedang' | 'tinggi';
    faktor_dominan: string;
    rekomendasi_json: Recommendation;
    lokasi: string;
    tanggal_prediksi: string;
    created_at: string;
    updated_at: string;
    project?: Project;
    input_log?: InputLog;
};

export type UserSetting = {
    id: number;
    user_id: number;
    theme: 'light' | 'dark' | 'system';
    notification_enabled: boolean;
    temperature_unit: 'celsius';
    rainfall_unit: 'mm';
    yield_unit: 'ton';
    backup_enabled: boolean;
    created_at: string;
    updated_at: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};
