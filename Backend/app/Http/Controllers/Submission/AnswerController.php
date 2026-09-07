<?php

namespace App\Http\Controllers\Submission;

use App\Http\Controllers\Controller;
use App\Http\Requests\Submission\BulkAnswerRequest;
use App\Http\Resources\ScoreResource;
use App\Models\Answer;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    /**
     * PUT /api/submissions/{id}/answers
     * Update jawaban kuesioner secara bulk
     */
    public function bulkUpdate(BulkAnswerRequest $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->whereIn('submission_status_id', [2, 4]) // Hanya bisa edit di status document submission
            ->findOrFail($id);

        foreach ($request->answers as $answerData) {
            Answer::updateOrCreate(
                ['submission_id' => $submission->id, 'question_id' => $answerData['question_id']],
                ['value' => $answerData['value']]
            );
        }

        // Recalculate dan simpan initial_score
        $initialScore = $submission->calculateInitialScore();
        $submission->update(['initial_score' => $initialScore]);

        return response()->json([
            'message' => 'Answers updated successfully.',
            'data'    => new ScoreResource($submission->load('documents')),
        ]);
    }

    /**
     * GET /api/submissions/{id}/answers
     * Ambil semua jawaban untuk satu submission
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $submission = $request->user()
            ->submissions()
            ->findOrFail($id);

        $answers = $submission->answers()
            ->with(['question.indicator'])
            ->get()
            ->groupBy('question.indicator_id')
            ->map(fn ($group) => [
                'indicator_id'   => $group->first()->question->indicator_id,
                'indicator_name' => $group->first()->question?->indicator?->name,
                'questions'      => $group->map(fn ($a) => [
                    'answer_id'   => $a->id,
                    'question_id' => $a->question_id,
                    'question'    => $a->question->text,
                    'value'       => $a->value,
                ])->values(),
            ])->values();

        return response()->json(['data' => $answers]);
    }
}
