<?php

namespace Tests\Feature\Submission;

use App\Models\Answer;
use App\Models\Aspect;
use App\Models\Indicator;
use App\Models\Outcome;
use App\Models\Principle;
use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class AnswerTest extends TestCase
{
    private function buildFramework(int $count = 4): array
    {
        $aspect    = Aspect::factory()->create();
        $outcome   = Outcome::factory()->create(['aspect_id' => $aspect->id]);
        $principle = Principle::factory()->create(['outcome_id' => $outcome->id]);
        $indicator = Indicator::factory()->create(['principle_id' => $principle->id]);
        $questions = Question::factory()->count($count)->create(['indicator_id' => $indicator->id]);
        return compact('indicator', 'questions');
    }

    // ─── B-F5-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_bulk_updates_answers_and_recalculates_initial_score()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(4);

        $answersPayload = $framework['questions']->map(fn ($q) => [
            'question_id' => $q->id,
            'value'       => 2, // all max
        ])->toArray();

        $response = $this->putJson("/api/submissions/{$submission->id}/answers", [
            'answers' => $answersPayload,
        ]);

        $response->assertStatus(200);

        // Verify initial_score was recalculated (4 questions × 2 max = 8 total, 8/8 = 100%)
        $submission->refresh();
        $this->assertEquals(100.0, $submission->initial_score);
    }

    // ─── B-F5-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_cannot_update_answers_when_submission_is_on_verification()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->onVerification()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(2);

        $response = $this->putJson("/api/submissions/{$submission->id}/answers", [
            'answers' => $framework['questions']->map(fn ($q) => [
                'question_id' => $q->id,
                'value'       => 1,
            ])->toArray(),
        ]);

        $response->assertStatus(404);
    }

    // ─── B-F5-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_answers_grouped_by_indicator()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(3);

        foreach ($framework['questions'] as $q) {
            Answer::factory()->create([
                'submission_id' => $submission->id,
                'question_id'   => $q->id,
                'value'         => 1,
            ]);
        }

        $response = $this->getJson("/api/submissions/{$submission->id}/answers");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['indicator_id', 'questions']]]);
    }

    // ─── B-F5-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_rejects_invalid_answer_value()
    {
        $user = $this->actingAsCompany();
        $submission = Submission::factory()->draft()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(1);

        $response = $this->putJson("/api/submissions/{$submission->id}/answers", [
            'answers' => [[
                'question_id' => $framework['questions']->first()->id,
                'value'       => 3, // invalid: must be 0, 0.5, 1, or 2
            ]],
        ]);

        $response->assertStatus(422);
    }
}
