<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Http\JsonResponse;
use App\Models\CmsContent;
use Illuminate\Support\Facades\Storage;

class CmsController extends Controller
{
    public function index(): JsonResponse
    {
        $contents = CmsContent::orderBy('group')->orderBy('key')->get();
        return response()->json($contents);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'contents' => 'required|array',
            'contents.*.id' => 'required|exists:cms_contents,id',
            'contents.*.value_en' => 'nullable',
            'contents.*.value_id' => 'nullable',
        ]);

        foreach ($request->contents as $item) {
            $content = CmsContent::find($item['id']);
            if ($content) {
                // If it's a json_array, frontend should send an array
                // The model mutator handles the json_encode
                $content->value_en = $item['value_en'] ?? null;
                $content->value_id = $item['value_id'] ?? null;
                $content->save();
            }
        }

        return response()->json(['message' => 'Content updated successfully']);
    }

    public function uploadImage(Request $request, $id): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $content = CmsContent::findOrFail($id);

        if ($content->type !== 'image') {
            return response()->json(['message' => 'Content is not an image type'], 400);
        }

        if ($request->hasFile('image')) {
            $imageName = time() . '_' . $request->image->getClientOriginalName();
            $path = $request->image->storeAs('cms', $imageName, 'public');
            
            // Delete old image if exists
            if ($content->value_en && Storage::disk('public')->exists($content->value_en)) {
                Storage::disk('public')->delete($content->value_en);
            }

            $content->value_en = $path; // Store path in value_en for images
            $content->value_id = $path; // Same path for both by default
            $content->save();

            return response()->json([
                'message' => 'Image uploaded successfully',
                'path' => $path
            ]);
        }

        return response()->json(['message' => 'Upload failed'], 500);
    }
}
