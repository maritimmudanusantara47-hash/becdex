<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Http\JsonResponse;
use App\Models\CmsContent;
use Illuminate\Support\Facades\Cache;

class CmsController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Cache::remember('public_cms_contents', 3600, function () {
            $contents = CmsContent::all();
            
            $en = [];
            $id = [];

            foreach ($contents as $content) {
                $en[$content->key] = $content->value_en;
                $id[$content->key] = $content->value_id;
            }

            return [
                'en' => $en,
                'id' => $id,
            ];
        });

        return response()->json($data);
    }
}
