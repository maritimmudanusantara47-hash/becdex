<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return response()->json([
            'data' => $user->notifications()->take(20)->get(),
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }

    public function markAsRead(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($request->has('id')) {
            $notification = $user->notifications()->find($request->id);
            if ($notification) {
                $notification->markAsRead();
            }
        } else {
            $user->unreadNotifications->markAsRead();
        }
        
        return response()->json(['message' => 'Notifications marked as read']);
    }
}
