<?php

namespace App\Services;

class RichTextSanitizer
{
    /**
     * Tags whose names are allowed through.
     * All attributes are unconditionally stripped to prevent XSS vectors
     * such as onclick, style, href on non-anchor elements, etc.
     */
    private const ALLOWED = ['strong', 'em', 'u', 's', 'p', 'br', 'ul', 'ol', 'li'];

    public function sanitize(string $html): string
    {
        if (empty(trim($html))) return '';

        // 1. Normalize browser line-break differences:
        //    Chrome/Safari insert <div> for new paragraphs; Firefox uses <br>.
        $html = preg_replace('/<div\b[^>]*>/i', '<p>', $html);
        $html = str_replace('</div>', '</p>', $html);

        // 2. Strip every tag not in the allowlist (keeps text content).
        $allowString = '<' . implode('><', self::ALLOWED) . '>';
        $html        = strip_tags($html, $allowString);

        // 3. Strip ALL attributes from remaining tags.
        //    Matches opening tags: captures tag name, discards everything else.
        $html = preg_replace('/<(\w+)\b[^>]*>/i', '<$1>', $html);

        // 4. Normalize closing tags (strip any stray attributes from </tag ...>).
        $html = preg_replace('/<\/(\w+)\b[^>]*>/i', '</$1>', $html);

        // 5. Collapse sequences of empty paragraphs left by stripping.
        $html = preg_replace('/(<p>\s*<\/p>\s*)+/', '<p></p>', $html);

        return trim($html);
    }
}
