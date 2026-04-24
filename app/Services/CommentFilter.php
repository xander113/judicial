<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\BlacklistWord;

class CommentFilter
{
    /**
     * Applies the global word blacklist to an HTML string, operating only on
     * text nodes so that HTML markup (tags, attributes) is never touched.
     *
     * Bypass detection handles:
     *   - Common leet-speak / ASCII character substitutions (4→a, 3→e, etc.)
     *   - Repeated characters ("heeelll" → matches "hell")
     *   - Zero-width Unicode characters inserted between letters
     *
     * Detection is intentionally NOT too aggressive:
     *   - Word boundaries are enforced so "class" does not match "ass"
     *   - No space-separated letter detection (h e l l) to avoid false positives
     *   - No Unicode homoglyph detection (Cyrillic look-alikes) to avoid
     *     flagging non-Latin legitimate text
     */
    public function filter(string $html): string
    {
        $words = $this->getBlacklist();

        if (empty($words) || empty(trim(strip_tags($html)))) {
            return $html;
        }

        // Parse the HTML safely, operating only on text nodes.
        $doc = new \DOMDocument('1.0', 'UTF-8');

        libxml_use_internal_errors(true);
        $doc->loadHTML(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' . $html . '</body></html>',
            LIBXML_NOERROR | LIBXML_NOWARNING
        );
        libxml_clear_errors();

        $body = $doc->getElementsByTagName('body')->item(0);

        if ($body) {
            $this->walkTextNodes($body, $words);
        }

        // Extract inner HTML of body, stripping the wrapper tags.
        $result = '';
        if ($body) {
            foreach ($body->childNodes as $child) {
                $result .= $doc->saveHTML($child);
            }
        }

        return $result ?: $html;
    }

    // ── DOMDocument traversal ─────────────────────────────────────────────────

    private function walkTextNodes(\DOMNode $node, array $words): void
    {
        if ($node->nodeType === XML_TEXT_NODE) {
            $node->nodeValue = $this->censorText($node->nodeValue, $words);
            return;
        }

        // Collect children first; modifying nodeValue in a text node is safe
        // but we avoid modifying the childNodes list while iterating.
        $children = iterator_to_array($node->childNodes);
        foreach ($children as $child) {
            $this->walkTextNodes($child, $words);
        }
    }

    private function censorText(string $text, array $words): string
    {
        foreach ($words as $word) {
            $pattern = $this->buildBypassPattern($word);
            if ($pattern === null) continue;

            $text = preg_replace_callback($pattern, function (array $match): string {
                return str_repeat('*', mb_strlen($match[0]));
            }, $text) ?? $text;
        }

        return $text;
    }

    // ── Bypass-aware pattern builder ──────────────────────────────────────────

    /**
     * Builds a regex that catches the word even with:
     *   - Leet-speak substitutions  (a→@/4, e→3, i→1/!, o→0, s→5/$, t→7, etc.)
     *   - Repeated characters       (hellll → hell)
     *   - Zero-width Unicode chars  (zero-width space, joiner, non-joiner, BOM)
     *     inserted between letters to fool naive string-matching
     */
    private function buildBypassPattern(string $word): ?string
    {
        $word = mb_strtolower(trim($word));

        if ($word === '') return null;

        // Per-character leet substitution map.
        // Values are PCRE character class bodies (without the brackets).
        $leet = [
            'a' => 'a@4',
            'b' => 'b8',
            'e' => 'e3',
            'g' => 'g9',
            'i' => 'i1!|',
            'l' => 'l1|',
            'o' => 'o0',
            's' => 's5$',
            't' => 't7+',
            'z' => 'z2',
        ];

        // Zero-width Unicode codepoints that may be invisibly inserted between letters.
        // \x{200B} = ZWSP, \x{200C} = ZWNJ, \x{200D} = ZWJ, \x{FEFF} = BOM
        $zwSep = '[\x{200B}\x{200C}\x{200D}\x{FEFF}]*';

        $chars = preg_split('//u', $word, -1, PREG_SPLIT_NO_EMPTY);
        if (empty($chars)) return null;

        $parts = [];
        foreach ($chars as $char) {
            if (isset($leet[$char])) {
                // Allow 1+ occurrences of any substitution for this character.
                $parts[] = '(?:[' . $leet[$char] . '])+';
            } else {
                // Escape for regex, allow 1+ repeats (catches "heeell" for "hell").
                $escaped = preg_quote($char, '/');
                $parts[] = '(?:' . $escaped . ')+';
            }
        }

        // Insert zero-width separator allowance between each character group.
        $inner = implode($zwSep, $parts);

        // Wrap with word boundaries so we don't match inside legitimate words.
        return '/\b' . $inner . '\b/iu';
    }

    // ── Blacklist cache ───────────────────────────────────────────────────────

    /** @return string[] */
    private function getBlacklist(): array
    {
        return Cache::remember('blacklist_words', 60, function (): array {
            return BlacklistWord::pluck('word')->toArray();
        });
    }

    public static function clearCache(): void
    {
        Cache::forget('blacklist_words');
    }
}
