<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingRequest;
use App\Models\UserSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request): Response
    {
        $setting = UserSetting::query()->firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'theme' => 'light',
                'notification_enabled' => true,
                'temperature_unit' => 'celsius',
                'rainfall_unit' => 'mm',
                'yield_unit' => 'ton',
                'backup_enabled' => false,
            ],
        );

        return Inertia::render('settings/index', [
            'setting' => $setting,
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        UserSetting::query()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->validated(),
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Pengaturan aplikasi berhasil diperbarui.']);
    }
}
