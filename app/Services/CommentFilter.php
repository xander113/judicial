<?php
namespace App\Services;

use App\Models\BlacklistWord;
use Illuminate\Support\Facades\Cache;

class CommentFilter
{
    /**
     * Replaces every blacklisted word in $text with asterisks, case-insensitively.
     */
    public function filter(string $text): string
    {
        $words = $this->getBlacklist();
        if (empty($words)) return $text;

        foreach ($words as $word) {
            $replacement = str_repeat('*', mb_strlen($word));
            $text = preg_replace('/' . preg_quote($word, '/') . '/iu', $replacement, $text);
        }

        return $text;
    }

    /** @return string[] */
    private function getBlacklist(): array
    {
        return Cache::remember('blacklist_words', 60, function () {
            return BlacklistWord::pluck('word')->toArray();
        });
    }

    public static function clearCache(): void
    {
        Cache::forget('blacklist_words');
    }
}