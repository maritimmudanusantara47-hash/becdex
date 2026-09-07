<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'indicator_id'  => $this->indicator_id,
            'indicator'     => $this->whenLoaded('indicator', fn () => $this->indicator->name),
            'file_url'      => $this->file_url,
            'original_name' => $this->original_name,
            'mime_type'     => $this->mime_type,
            'file_size'     => $this->file_size,
            'upload_phase'  => $this->upload_phase ?? 1,
            'uploaded_at'   => $this->created_at->toISOString(),
        ];
    }
}
