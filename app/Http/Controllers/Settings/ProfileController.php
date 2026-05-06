<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill(Arr::except($validated, ['avatar', 'remove_avatar']));

        if (! empty($validated['remove_avatar'])) {
            $this->deleteOldAvatar($user->avatar);
            $user->avatar = null;
        }

        if ($request->hasFile('avatar')) {
            $this->deleteOldAvatar($user->avatar);
            $user->avatar = $this->storeAvatar($request->file('avatar'));
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    protected function storeAvatar(UploadedFile $file): string
    {
        $path = $file->store('avatars', 'public');

        return '/storage/'.$path;
    }

    protected function deleteOldAvatar(?string $avatarPath): void
    {
        if ($avatarPath === null || $avatarPath === '') {
            return;
        }

        if (! str_starts_with($avatarPath, '/storage/')) {
            return;
        }

        $storageRelativePath = ltrim(str_replace('/storage/', '', $avatarPath), '/');

        if ($storageRelativePath === '') {
            return;
        }

        Storage::disk('public')->delete($storageRelativePath);
    }
}
