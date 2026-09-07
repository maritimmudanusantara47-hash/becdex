<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'status'                 => [
                'id'    => $this->submission_status_id,
                'name'  => $this->status?->name,
                'color' => $this->status?->color,
            ],
            'initial_score'          => (float) $this->initial_score,
            'valid_score'            => (float) $this->valid_score,
            'survey_score'           => (float) $this->survey_score,
            'can_proceed_to_payment'   => $this->canProceedToPayment(),
            'has_successful_payment'   => $this->hasSuccessfulPayment(),
            'is_post_survey_revision'  => $this->isPostSurveyRevision(),
            'requires_payment'         => $this->requiresPayment(),
            'documents_uploaded'       => $this->documents_count ?? ($this->relationLoaded('documents') ? $this->documents->count() : 0),
            'reason'                 => $this->reason,
            'revision_count'         => (int) $this->revision_count,
            'current_upload_phase'   => (int) ($this->current_upload_phase ?? 1),
            'created_at'             => $this->created_at->toISOString(),
            'updated_at'             => $this->updated_at->toISOString(),
            'radar_data'             => $this->getRadarChartData(),

            // Relasi opsional (dimuat via with())
            'user'         => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'payment'      => $this->whenLoaded('latestPayment', fn () =>
                $this->latestPayment ? new PaymentResource($this->latestPayment) : null
            ),
            'certificate'  => $this->whenLoaded('certificateUser', fn () =>
                $this->certificateUser ? new CertificateResource($this->certificateUser) : null
            ),
            'survey'       => $this->whenLoaded('survey', fn () =>
                $this->survey ? [
                    'scheduled_at'  => $this->survey->scheduled_at?->toISOString(),
                    'location_link' => $this->survey->location_link,
                    'notes'         => $this->survey->notes,
                ] : null
            ),

            // Relasi untuk halaman detail submission
            'answers'        => $this->whenLoaded('answers', fn () => $this->answers->map(fn ($ans) => [
                'id'            => $ans->id,
                'submission_id' => $ans->submission_id,
                'question_id'   => $ans->question_id,
                'value'         => $ans->value === null ? null : (float)$ans->value,
                'valid_value'   => $ans->valid_value === null ? null : (float)$ans->valid_value,
                'question'      => $ans->relationLoaded('question') && $ans->question ? [
                    'id'           => $ans->question->id,
                    'indicator_id' => $ans->question->indicator_id,
                    'text'         => $ans->question->text,
                    'text_en'      => $ans->question->text_en,
                ] : null,
            ])),

            'per_indicators' => $this->whenLoaded('perIndicators', fn () => $this->perIndicators->map(fn ($pi) => [
                'id'            => $pi->id,
                'submission_id' => $pi->submission_id,
                'indicator_id'  => $pi->indicator_id,
                'status'        => [
                    'id'    => $pi->per_indicator_status_id,
                    'name'  => $pi->status?->name,
                    'color' => $pi->status?->color,
                ],
                'comment'       => $pi->comment,
                'indicator'     => $pi->relationLoaded('indicator') && $pi->indicator ? [
                    'id'                      => $pi->indicator->id,
                    'name'                    => $pi->indicator->name,
                    'name_id'                 => $pi->indicator->name_id,
                    'description'             => $pi->indicator->description,
                    'description_en'          => $pi->indicator->description_en,
                    'evidence'                => $pi->indicator->evidence,
                    'evidence_en'             => $pi->indicator->evidence_en,
                    'verification_method'     => $pi->indicator->verification_method,
                    'verification_method_en'  => $pi->indicator->verification_method_en,
                    'regulation'              => $pi->indicator->regulation,
                    'regulation_en'           => $pi->indicator->regulation_en,
                    'is_mandatory'            => (bool) $pi->indicator->is_mandatory,
                    'principle'   => $pi->indicator->relationLoaded('principle') && $pi->indicator->principle ? [
                        'id'      => $pi->indicator->principle->id,
                        'name'    => $pi->indicator->principle->name,
                        'name_id' => $pi->indicator->principle->name_id,
                        'outcome' => $pi->indicator->principle->relationLoaded('outcome') && $pi->indicator->principle->outcome ? [
                            'id'      => $pi->indicator->principle->outcome->id,
                            'name'    => $pi->indicator->principle->outcome->name,
                            'name_id' => $pi->indicator->principle->outcome->name_id,
                            'aspect'  => $pi->indicator->principle->outcome->relationLoaded('aspect') && $pi->indicator->principle->outcome->aspect ? [
                                'id'      => $pi->indicator->principle->outcome->aspect->id,
                                'name'    => $pi->indicator->principle->outcome->aspect->name,
                                'name_id' => $pi->indicator->principle->outcome->aspect->name_id,
                            ] : null,
                        ] : null,
                    ] : null,
                    'questions'   => $pi->indicator->relationLoaded('questions') ? $pi->indicator->questions->map(fn ($q) => [
                        'id'           => $q->id,
                        'indicator_id' => $q->indicator_id,
                        'text'         => $q->text,
                        'text_en'      => $q->text_en,
                        'is_mandatory' => (bool) $q->is_mandatory,
                    ]) : [],
                ] : null,
            ])),

            'documents'      => $this->whenLoaded('documents', fn () => DocumentResource::collection($this->documents)),
        ];
    }
}
