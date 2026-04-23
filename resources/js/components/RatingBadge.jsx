/**
 * RatingBadge
 *
 * Renders a small pastel box displaying a rating.
 *
 * Individual rating usage:
 *   <RatingBadge value={7} intensity="strong" />   → "Strong 7"  (darker green)
 *   <RatingBadge value={5} intensity="normal" />   → "5"         (yellow)
 *   <RatingBadge value={3} intensity="light"  />   → "Light 3"   (soft red)
 *
 * Aggregate (average) usage — pass avgTier so the effective value isn't recalculated:
 *   <RatingBadge value={6.24} isAvg avgTier="good" />
 *
 * Tier thresholds (on effective value):
 *   good      > 5.7   (above light-6)
 *   mediocre  3.7–5.7 (strong-4 through light-6)
 *   bad       < 3.7   (below strong-4)
 *
 * Intensity offset used for tier calculation only:
 *   strong → +0.3  |  normal → 0  |  light → −0.3
 */

const PALETTE = {
    good:     { strong: '#8FDB8C', normal: '#C5F0C2', light: '#E1F8DF' },
    mediocre: { strong: '#D8D560', normal: '#EDEA9A', light: '#F5F3CC' },
    bad:      { strong: '#EAA090', normal: '#F6D0CB', light: '#FBECE9' },
};

function computeTier(value, intensity) {
    const eff =
        intensity === 'strong' ? value + 0.3
      : intensity === 'light'  ? value - 0.3
      : value;
    return eff > 5.7 ? 'good' : eff >= 3.7 ? 'mediocre' : 'bad';
}

function formatLabel(value, intensity, isAvg) {
    if (isAvg) return String(value);
    if (intensity === 'normal') return String(value);
    return `${intensity.charAt(0).toUpperCase() + intensity.slice(1)} ${value}`;
}

export default function RatingBadge({
    value,
    intensity = 'normal',
    isAvg     = false,
    avgTier   = null,
    size      = 'md',
}) {
    const tier = isAvg ? avgTier : computeTier(value, intensity);
    // Average badges always use the neutral (normal) shade for their tier.
    const bg   = PALETTE[tier][isAvg ? 'normal' : intensity];

    const padding  = size === 'sm' ? '0.1rem 0.45rem'  : '0.28rem 0.65rem';
    const fontSize = size === 'sm' ? '0.72rem'          : '0.875rem';

    return (
        <span
            style={{
                display:         'inline-flex',
                alignItems:      'center',
                justifyContent:  'center',
                backgroundColor: bg,
                borderRadius:    '0.13rem',
                padding,
                fontWeight:      700,
                fontSize,
                color:           '#1a1a1a',
                whiteSpace:      'nowrap',
                lineHeight:      1.4,
            }}
        >
            {formatLabel(value, intensity, isAvg)}
        </span>
    );
}
