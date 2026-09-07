<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HelpMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HelpAdminController extends Controller
{
    /**
     * GET /api/admin/help
     * List all help messages (paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $messages = HelpMessage::latest()->paginate(15);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
                'per_page'     => $messages->perPage(),
                'total'        => $messages->total(),
            ]
        ]);
    }

    /**
     * PUT /api/admin/help/{id}/read
     * Mark message as read
     */
    public function markAsRead(int $id): JsonResponse
    {
        $message = HelpMessage::findOrFail($id);
        $message->update(['is_read' => true]);

        return response()->json([
            'message' => 'Message marked as read successfully.',
            'data'    => $message
        ]);
    }

    /**
     * DELETE /api/admin/help/{id}
     * Delete message
     */
    public function destroy(int $id): JsonResponse
    {
        $message = HelpMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully.'
        ]);
    }
}
