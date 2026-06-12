<?php

namespace App\Http\Middleware;

use App\Models\UserSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $appearance = $request->cookie('appearance');

        if (! in_array($appearance, ['light', 'dark', 'system'], true) && $request->user()) {
            $appearance = UserSetting::query()
                ->where('user_id', $request->user()->id)
                ->value('theme');
        }

        if (! in_array($appearance, ['light', 'dark', 'system'], true)) {
            $appearance = 'dark';
        }

        View::share('appearance', $appearance);

        return $next($request);
    }
}
