import { useState, useRef, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Layout from '@/Root';
import RatingBadge from '@/components/RatingBadge';

// ── Minimal CSS — only what inline styles cannot achieve ─────────────────────
// scrollbar-width and ::-webkit-scrollbar require a stylesheet rule.
// Everything else in the carousel is handled via inline styles.

const CAROUSEL_CSS = `
.carousel-track {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.carousel-track::-webkit-scrollbar { display: none; }
.carousel-item { flex: 0 0 auto; width: 12rem; }
`;

// ── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest',  label: 'Lowest Rated'  },
    { value: 'alpha',   label: 'Alphabetical'  },
    { value: 'votes',   label: 'Most Votes'    },
];

// ── Carousel ──────────────────────────────────────────────────────────────────

function Carousel({ items }) {
    const trackRef = useRef(null);

    function scroll(dir) {
        trackRef.current?.scrollBy({ left: dir * 250, behavior: 'smooth' });
    }

    if (! items?.length) {
        return <p>Nothing rated this week yet.</p>;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
                className="button b-primary nomargin"
                style={{ flexShrink: 0 }}
                onClick={() => scroll(-1)}
                aria-label="Previous"
            >
                ◀
            </button>

            <div ref={trackRef} className="carousel-track" style={{ flex: 1 }}>
                {items.map((horse) => (
                    <div
                        key={horse.id}
                        className="horse-card carousel-item"
                        onClick={() => router.visit(`/horses/${horse.slug}`)}
                    >
                        {horse.image_path && (
                            <img
                                src={horse.image_path}
                                alt={horse.name}
                                style={{
                                    width:        '100%',
                                    objectFit:    'cover',
                                    borderRadius: '0.25rem',
                                    marginBottom: '0.4rem',
                                }}
                            />
                        )}

                        <strong style={{ fontSize: '0.875rem', lineHeight: 1.3 }}>
                            {horse.name}
                        </strong>

                        {horse.episode !== null && (
                            <small style={{ display: 'block', marginTop: '0.15rem' }}>
                                Ep. {horse.episode}
                            </small>
                        )}

                        <div style={{ marginTop: '0.4rem' }}>
                            <RatingBadge
                                value={horse.avg_rating}
                                isAvg
                                avgTier={horse.tier}
                            />
                        </div>

                        <small style={{ display: 'block', marginTop: '0.2rem' }}>
                            {horse.ratings_count} vote
                            {horse.ratings_count !== 1 ? 's' : ''}
                        </small>
                    </div>
                ))}
            </div>

            <button
                className="button b-primary nomargin"
                style={{ flexShrink: 0 }}
                onClick={() => scroll(1)}
                aria-label="Next"
            >
                ▶
            </button>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HorsesIndex({ horses, topThisWeek, lowestThisWeek }) {
    const [sort, setSort] = useState('highest');

    const sorted = useMemo(() => {
        const arr = [...horses];
        switch (sort) {
            case 'highest':
                return arr.sort(
                    (a, b) => (b.avg_rating ?? -Infinity) - (a.avg_rating ?? -Infinity),
                );
            case 'lowest':
                return arr.sort(
                    (a, b) => (a.avg_rating ?? Infinity) - (b.avg_rating ?? Infinity),
                );
            case 'alpha':
                return arr.sort((a, b) => a.name.localeCompare(b.name));
            case 'votes':
                return arr.sort((a, b) => b.ratings_count - a.ratings_count);
            default:
                return arr;
        }
    }, [horses, sort]);

    const hasWeekly = topThisWeek?.length > 0 || lowestThisWeek?.length > 0;

    return (
        <Layout>
            <Head title="CaseOh's Ranch" />

            {/* Inject minimal carousel CSS */}
            <style>{CAROUSEL_CSS}</style>

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%' }}>
                    <h1>CaseOh's Ranch</h1>
                    <p className="restrained-text">
                        Community ratings and commentary on every horse from
                        CaseOh's Horsey Game series.
                    </p>

                    {/* ── Weekly carousels ── */}
                    {hasWeekly && (
                        <div style={{ marginTop: '2rem' }}>

                            {topThisWeek?.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h2>🏆 Top Rated This Week</h2>
                                    <Carousel items={topThisWeek} />
                                </div>
                            )}

                            {lowestThisWeek?.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h2>📉 Lowest Rated This Week</h2>
                                    <Carousel items={lowestThisWeek} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── All horses ── */}
                    <div style={{ marginTop: hasWeekly ? '1rem' : '2rem' }}>
                        <h2>All Horses</h2>

                        {/* Sort controls */}
                        <div
                            style={{
                                display:      'flex',
                                gap:          '0.4rem',
                                flexWrap:     'wrap',
                                marginBottom: '1rem',
                            }}
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`button nomargin ${
                                        sort === opt.value ? 'b-warning' : 'b-primary'
                                    }`}
                                    onClick={() => setSort(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Horse list — row-wrap override on existing .horse-grid */}
                        <div
                            className="horse-grid"
                            style={{ flexDirection: 'row', padding: '0' }}
                        >
                            {sorted.map((horse) => (
                                <div
                                    key={horse.id}
                                    className="horse-card"
                                    onClick={() =>
                                        router.visit(`/horses/${horse.slug}`)
                                    }
                                >
                                    {horse.image_path && (
                                        <img
                                            className="place-image"
                                            src={horse.image_path}
                                            alt={horse.name}
                                            style={{ width: '100%', objectFit: 'cover' }}
                                        />
                                    )}

                                    <h2 style={{ marginBottom: '0.2rem' }}>
                                        {horse.name}
                                    </h2>

                                    {horse.episode !== null && (
                                        <small>Episode {horse.episode}</small>
                                    )}

                                    {horse.weight_lbs && (
                                        <small>{horse.weight_lbs} lbs</small>
                                    )}

                                    <div style={{ marginTop: '0.5rem' }}>
                                        {horse.avg_rating !== null ? (
                                            <>
                                                <RatingBadge
                                                    value={horse.avg_rating}
                                                    isAvg
                                                    avgTier={horse.tier}
                                                />
                                                <small
                                                    style={{
                                                        display:   'block',
                                                        marginTop: '0.2rem',
                                                    }}
                                                >
                                                    {horse.ratings_count} vote
                                                    {horse.ratings_count !== 1
                                                        ? 's'
                                                        : ''}
                                                </small>
                                            </>
                                        ) : (
                                            <small>No ratings yet</small>
                                        )}
                                    </div>

                                    {horse.is_locked && (
                                        <small
                                            style={{ display: 'block', marginTop: '0.3rem' }}
                                        >
                                            <strong>[Locked]</strong>
                                        </small>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
