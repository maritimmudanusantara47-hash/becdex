<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'mmic'         => $this->mmic,
            'direktur'     => $this->direktur,
            'published_at' => $this->published_at?->format('Y-m-d'),
            'valid_until'  => $this->valid_until?->format('Y-m-d'),
            'is_valid'     => $this->isValid(),
            'is_approved'  => (bool) $this->is_approved,
            'category'     => $this->whenLoaded('certificate', fn () => [
                'name'     => $this->certificate->category,
                'file_url' => $this->certificate->file_url,
            ]),
        ];
    }
}
