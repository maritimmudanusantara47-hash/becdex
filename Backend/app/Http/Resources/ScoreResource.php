<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'submission_id'          => $this->id,
            'initial_score'          => (float) $this->initial_score,
            'valid_score'            => (float) $this->valid_score,
            'survey_score'           => (float) $this->survey_score,
            'documents_uploaded'     => $this->documents()->count(),
            'can_proceed_to_payment' => $this->canProceedToPayment(),
            'has_successful_payment' => $this->hasSuccessfulPayment(),
            'requirements' => [
                'min_initial_score'  => 70,
                'min_documents'      => 35,
                'score_met'          => $this->initial_score >= 70,
                'documents_met'      => $this->documents()->count() >= 35,
            ],
        ];
    }
}
