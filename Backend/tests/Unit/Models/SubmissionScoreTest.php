<?php

namespace Tests\Unit\Models;

use App\Models\Answer;
use App\Models\Aspect;
use App\Models\Indicator;
use App\Models\Outcome;
use App\Models\Principle;
use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class SubmissionScoreTest extends TestCase
{
    /** Helper: build a minimal framework (Aspect > Outcome > Principle > Indicator > N Questions) */
    private function buildFramework(int $questionCount = 10): array
    {
        $aspect    = Aspect::factory()->create();
        $outcome   = Outcome::factory()->create(['aspect_id' => $aspect->id]);
        $principle = Principle::factory()->create(['outcome_id' => $outcome->id]);
        $indicator = Indicator::factory()->create(['principle_id' => $principle->id]);
        $questions = Question::factory()->count($questionCount)->create(['indicator_id' => $indicator->id]);
        return compact('aspect', 'outcome', 'principle', 'indicator', 'questions');
    }

    // ─── B-U1-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_calculates_initial_score_as_100_when_all_answers_are_max()
    {
        $user       = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(10);

        foreach ($framework['questions'] as $question) {
            Answer::factory()->create([
                'submission_id' => $submission->id,
                'question_id'   => $question->id,
                'value'         => 2, // max
            ]);
        }

        $score = $submission->fresh()->calculateInitialScore();

        $this->assertEquals(100.0, $score);
    }

    // ─── B-U1-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_calculates_initial_score_as_50_when_all_answers_are_half()
    {
        $user       = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(10);

        foreach ($framework['questions'] as $question) {
            Answer::factory()->create([
                'submission_id' => $submission->id,
                'question_id'   => $question->id,
                'value'         => 1, // half of max (2)
            ]);
        }

        $score = $submission->fresh()->calculateInitialScore();

        $this->assertEquals(50.0, $score);
    }

    // ─── B-U1-03 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_zero_initial_score_when_no_answers_exist()
    {
        $user       = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);

        // No answers created
        $score = $submission->calculateInitialScore();

        $this->assertEquals(0, $score);
    }

    // ─── B-U1-04 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_calculates_valid_score_from_valid_values()
    {
        $user       = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);
        $framework  = $this->buildFramework(4);

        // 4 questions, max = 8. Valid values: 2+0+2+0 = 4 → 4/8 = 50%
        $values = [2, 0, 2, 0];
        foreach ($framework['questions'] as $i => $question) {
            Answer::factory()->create([
                'submission_id' => $submission->id,
                'question_id'   => $question->id,
                'value'         => $values[$i],
                'valid_value'   => $values[$i],
            ]);
        }

        $score = $submission->fresh()->calculateValidScore();

        $this->assertEquals(50.0, $score);
    }

    // ─── B-U1-05 ──────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_empty_radar_chart_data_when_no_answers()
    {
        $user       = User::factory()->company()->create();
        $submission = Submission::factory()->create(['user_id' => $user->id]);

        // Should not throw, return empty
        $data = $submission->getRadarChartData();

        $this->assertIsArray($data);
        $this->assertEmpty($data);
    }
}
