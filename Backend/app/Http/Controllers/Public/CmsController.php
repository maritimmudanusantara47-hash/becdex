<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Http\JsonResponse;
use App\Models\CmsContent;

class CmsController extends Controller
{
    public function index(): JsonResponse
    {
        $contents = CmsContent::all();
        
        $en = [];
        $id = [];

        foreach ($contents as $content) {
            $en[$content->key] = $content->value_en;
            $id[$content->key] = $content->value_id;
        }

        return response()->json([
            'en' => $en,
            'id' => $id,
        ]);
    }
}
