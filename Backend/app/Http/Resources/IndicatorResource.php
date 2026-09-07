<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IndicatorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'name'                    => $this->name,
            'name_id'                 => $this->name_id,
            'description'             => $this->description,
            'description_en'          => $this->description_en,
            'evidence'                => $this->evidence,
            'evidence_en'             => $this->evidence_en,
            'verification_method'     => $this->verification_method,
            'verification_method_en'  => $this->verification_method_en,
            'regulation'              => $this->regulation,
            'regulation_en'           => $this->regulation_en,
            'sort_order'              => $this->sort_order,
            'principle'   => $this->whenLoaded('principle', fn () => [
                'id'      => $this->principle->id,
                'name'    => $this->principle->name,
                'name_id' => $this->principle->name_id,
                'outcome' => $this->principle->whenLoaded('outcome', fn () => [
                    'id'      => $this->principle->outcome->id,
                    'name'    => $this->principle->outcome->name,
                    'name_id' => $this->principle->outcome->name_id,
                    'aspect'  => $this->principle->outcome->whenLoaded('aspect', fn () => [
                        'id'      => $this->principle->outcome->aspect->id,
                        'name'    => $this->principle->outcome->aspect->name,
                        'name_id' => $this->principle->outcome->aspect->name_id,
                    ]),
                ]),
            ]),
            'questions'   => $this->whenLoaded('questions', fn () =>
                $this->questions->map(fn ($q) => [
                    'id'      => $q->id,
                    'text'    => $q->text,
                    'text_en' => $q->text_en,
                ])
            ),
        ];
    }
}
