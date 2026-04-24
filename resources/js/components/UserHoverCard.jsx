import { useRef, useState } from 'react';
import RatingBadge from '@/components/RatingBadge';

// Module-level cache — persists for the page session, avoids re-fetching on
// every hover across all comment instances.
const statsCache = {};

const CARD_CSS = `
.uhc-card {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  min-width: 13rem;
  max-width: 18rem;
  pointer-events: none;
  font-size: 0.82rem;
  line-height: 1.5;
  transition: opacity 0.1s ease;
}
`;

let cardStyleInjected = false;
function injectCardStyle() {
    if (cardStyleInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = CARD_CSS;
    document.head.appendChild(el);
    cardStyleInjected = true;
}

function CriticBadge() {
    return (
        <span
            style={{
                display:         'inline-flex',
                alignItems:      'center',
                backgroundColor: '#c0392b',
                color:           '#fff',
                borderRadius:    '0.13rem',
                padding:         '0.08rem 0.45rem',
                fontSize:        '0.68rem',
                fontWeight:      700,
                letterSpacing:   '0.04em',
                whiteSpace:      'nowrap',
            }}
        >
            Critic
        </span>
    );
}

function HoverCard({ data, x, y }) {
    const hasRatings = data.avg !== null;

    return (
        <div
            className="uhc-card"
            style={{ top: y, left: x }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {data.is_critic && <CriticBadge />}
                <small style={{ color: '#888' }}>
                    {data.ratings_count} rating{data.ratings_count !== 1 ? 's' : ''}
                    &nbsp;·&nbsp;
                    {data.comments_count} comment{data.comments_count !== 1 ? 's' : ''}
                </small>
            </div>

            {hasRatings ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '5rem', color: '#555' }}>Avg rating</span>
                        <RatingBadge value={data.avg} isAvg avgTier={tierFromAvg(data.avg)} size="sm" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '5rem', color: '#555' }}>Highest</span>
                        <RatingBadge value={data.highest.value} intensity={data.highest.intensity} size="sm" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '5rem', color: '#555' }}>Lowest</span>
                        <RatingBadge value={data.lowest.value} intensity={data.lowest.intensity} size="sm" />
                    </div>
                </div>
            ) : (
                <small style={{ color: '#aaa' }}>No ratings submitted yet.</small>
            )}
        </div>
    );
}

function tierFromAvg(avg) {
    if (avg === null) return null;
    if (avg < 3.7)  return 'bad';
    if (avg <= 5.7) return 'mediocre';
    return 'good';
}

/**
 * UserHoverCard
 *
 * Wraps any content (typically a username element) with hover behavior.
 * After a short delay, fetches the user's review stats and displays a card.
 *
 * Props:
 *   userId   {number} — the user's ID (for API fetch)
 *   children {node}   — the wrapped content (username text, badge, etc.)
 */
export default function UserHoverCard({ userId, children }) {
    injectCardStyle();

    const [card, setCard]     = useState(null);   // { data, x, y }
    const timerRef            = useRef(null);
    const containerRef        = useRef(null);

    function handleMouseEnter(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x    = Math.min(rect.left, window.innerWidth - 300);
        const y    = rect.bottom + 6;

        timerRef.current = setTimeout(async () => {
            if (!statsCache[userId]) {
                try {
                    const res = await fetch(`/api/users/${userId}/stats`);
                    statsCache[userId] = await res.json();
                } catch {
                    return; // silently fail — hover card is non-critical
                }
            }
            setCard({ data: statsCache[userId], x, y });
        }, 350);
    }

    function handleMouseLeave() {
        clearTimeout(timerRef.current);
        setCard(null);
    }

    return (
        <span
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'default', display: 'inline' }}
        >
            {children}
            {card && <HoverCard data={card.data} x={card.x} y={card.y} />}
        </span>
    );
}
