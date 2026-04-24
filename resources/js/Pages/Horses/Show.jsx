import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Layout from '@/Root';
import RatingBadge from '@/components/RatingBadge';
import RichTextInput from '@/components/RichTextInput';
import UserHoverCard from '@/components/UserHoverCard';

// ── Badge components ──────────────────────────────────────────────────────────

function StaffBadge({ role }) {
    if (!role || role === 'user') return null;
    const isAdmin = role === 'admin';
    return (
        <span style={{
            display:         'inline-flex', alignItems: 'center',
            backgroundColor: isAdmin ? '#c0392b' : '#DBF6CB',
            color:           isAdmin ? '#fff'    : '#1a1a1a',
            borderRadius: '0.13rem', padding: '0.08rem 0.4rem',
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
        }}>
            {isAdmin ? 'Admin' : 'Moderator'}
        </span>
    );
}

function CriticBadge() {
    return (
        <span style={{
            display:         'inline-flex', alignItems: 'center',
            backgroundColor: '#c0392b', color: '#fff',
            borderRadius: '0.13rem', padding: '0.08rem 0.4rem',
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
        }}>
            Critic
        </span>
    );
}

function StickyBadge() {
    return (
        <span style={{
            fontSize: '0.7rem', color: '#888', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
        }}>
            📌 Pinned
        </span>
    );
}

// ── Author line ───────────────────────────────────────────────────────────────

function AuthorLine({ user, createdAt }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <UserHoverCard userId={user.id}>
                <strong style={{ cursor: 'default' }}>{user.name}</strong>
            </UserHoverCard>
            {user.is_critic && <CriticBadge />}
            <StaffBadge role={user.role} />
            <small style={{ color: '#666' }}>{new Date(createdAt).toLocaleDateString()}</small>
        </div>
    );
}

// ── Vote buttons ──────────────────────────────────────────────────────────────

function VoteButtons({ comment, auth }) {
    if (!auth) return null;

    function cast(voteType) {
        router.post(`/comments/${comment.id}/vote`, { vote: voteType }, { preserveScroll: true });
    }

    const likeActive    = comment.user_vote === 'like';
    const dislikeActive = comment.user_vote === 'dislike';

    const btnStyle = (active) => ({
        background:   active ? '#CBF1F6' : 'transparent',
        border:       '1px solid ' + (active ? '#8cd8e0' : '#ddd'),
        borderRadius: '0.13rem',
        padding:      '0.1rem 0.5rem',
        cursor:       'pointer',
        fontSize:     '0.8rem',
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '0.2rem',
        lineHeight:   1.4,
        transition:   'background 0.15s',
    });

    return (
        <span style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
            <button style={btnStyle(likeActive)}    onClick={() => cast('like')}>
                👍 {comment.likes}
            </button>
            <button style={btnStyle(dislikeActive)} onClick={() => cast('dislike')}>
                👎 {comment.dislikes}
            </button>
        </span>
    );
}

// ── Report form ───────────────────────────────────────────────────────────────

const REPORT_REASONS = ['Spam', 'Harassment', 'Inappropriate Content', 'Other'];

function ReportForm({ commentId, onClose }) {
    const form = useForm({ reason: 'Spam' });

    function submit(e) {
        e.preventDefault();
        form.post(`/comments/${commentId}/report`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <form
            onSubmit={submit}
            style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.4rem' }}
        >
            <select
                value={form.data.reason}
                onChange={(e) => form.setData('reason', e.target.value)}
                style={{ fontSize: '0.8rem' }}
            >
                {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            <button type="submit" className="button b-danger nomargin"
                style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem' }}
                disabled={form.processing}>
                Submit
            </button>
            <button type="button" className="button b-primary nomargin"
                style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem' }}
                onClick={onClose}>
                Cancel
            </button>
            {form.errors.reason && <small style={{ color: '#c0392b' }}>{form.errors.reason}</small>}
        </form>
    );
}

// ── Reply form ────────────────────────────────────────────────────────────────

function ReplyForm({ commentId, horseSlug, onClose }) {
    const form = useForm({ body: '', parent_id: commentId });

    function submit(e) {
        e.preventDefault();
        form.post(`/horses/${horseSlug}/comments`, {
            onSuccess: () => { form.reset(); onClose(); },
        });
    }

    return (
        <form onSubmit={submit} style={{ marginTop: '0.6rem' }}>
            <RichTextInput
                value={form.data.body}
                onChange={(html) => form.setData('body', html)}
                placeholder="Write a reply..."
                minRows={2}
            />
            {form.errors.body && <div className="alert alert-danger">{form.errors.body}</div>}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <button type="submit" className="button b-primary nomargin" disabled={form.processing}>Reply</button>
                <button type="button" className="button b-danger nomargin" onClick={onClose}>Cancel</button>
            </div>
        </form>
    );
}

// ── Single reply ──────────────────────────────────────────────────────────────

function ReplyRow({ reply, isStaff, auth }) {
    const [showReport, setShowReport] = useState(false);

    return (
        <div style={{ borderLeft: '3px solid #CBF1F6', paddingLeft: '0.75rem', marginTop: '0.75rem' }}>
            <AuthorLine user={reply.user} createdAt={reply.created_at} />

            {reply.author_rating && (
                <div style={{ marginTop: '0.2rem' }}>
                    <RatingBadge value={reply.author_rating.value} intensity={reply.author_rating.intensity} size="sm" />
                </div>
            )}

            <div
                style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: reply.body }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                <VoteButtons comment={reply} auth={auth} />

                {auth && !isStaff && !showReport && (
                    <button
                        style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.75rem', padding: '0' }}
                        onClick={() => setShowReport(true)}
                    >
                        Report
                    </button>
                )}

                {isStaff && (
                    <button
                        className="button b-danger nomargin"
                        style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}
                        onClick={() => router.delete(`/admin/comments/${reply.id}`, { preserveScroll: true })}
                    >
                        Delete
                    </button>
                )}
            </div>

            {showReport && <ReportForm commentId={reply.id} onClose={() => setShowReport(false)} />}
        </div>
    );
}

// ── Comment thread ────────────────────────────────────────────────────────────

function CommentThread({ comment, horse, auth, isStaff }) {
    const [showReplies,   setShowReplies]   = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReport,    setShowReport]    = useState(false);

    const replyCount = comment.replies?.length ?? 0;

    return (
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem' }}>
            {/* Pinned indicator */}
            {comment.is_sticky && (
                <div style={{ marginBottom: '0.25rem' }}><StickyBadge /></div>
            )}

            <AuthorLine user={comment.user} createdAt={comment.created_at} />

            {comment.author_rating && (
                <div style={{ marginTop: '0.2rem' }}>
                    <RatingBadge value={comment.author_rating.value} intensity={comment.author_rating.intensity} size="sm" />
                </div>
            )}

            <div style={{ margin: '0.3rem 0 0', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: comment.body }} />

            {/* Action row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                <VoteButtons comment={comment} auth={auth} />

                {auth && !horse.is_locked && (
                    <button className="button b-primary nomargin"
                        style={{ fontSize: '0.8rem', padding: '0.15rem 0.55rem' }}
                        onClick={() => setShowReplyForm((v) => !v)}>
                        {showReplyForm ? 'Cancel' : 'Reply'}
                    </button>
                )}

                {replyCount > 0 && (
                    <button className="button b-primary nomargin"
                        style={{ fontSize: '0.8rem', padding: '0.15rem 0.55rem', backgroundColor: 'transparent' }}
                        onClick={() => setShowReplies((v) => !v)}>
                        {showReplies ? '▲ Hide replies' : `▼ ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
                    </button>
                )}

                {isStaff && (
                    <>
                        <button className="button b-danger nomargin"
                            style={{ fontSize: '0.8rem', padding: '0.15rem 0.55rem' }}
                            onClick={() => router.delete(`/admin/comments/${comment.id}`, { preserveScroll: true })}>
                            Delete
                        </button>
                        <button className="button b-warning nomargin"
                            style={{ fontSize: '0.8rem', padding: '0.15rem 0.55rem' }}
                            onClick={() => router.patch(`/admin/comments/${comment.id}/sticky`, {}, { preserveScroll: true })}>
                            {comment.is_sticky ? 'Unpin' : 'Pin'}
                        </button>
                    </>
                )}

                {auth && !isStaff && !showReport && (
                    <button
                        style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.75rem', padding: '0' }}
                        onClick={() => setShowReport(true)}>
                        Report
                    </button>
                )}
            </div>

            {showReport    && <ReportForm commentId={comment.id} onClose={() => setShowReport(false)} />}
            {showReplyForm && <ReplyForm commentId={comment.id} horseSlug={horse.slug} onClose={() => setShowReplyForm(false)} />}

            {showReplies && replyCount > 0 && (
                <div style={{ marginTop: '0.3rem' }}>
                    {comment.replies.map((reply) => (
                        <ReplyRow key={reply.id} reply={reply} isStaff={isStaff} auth={auth} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Sort dropdown ─────────────────────────────────────────────────────────────

const SORT_OPTS = [
    { value: 'popular',       label: 'Most Popular' },
    { value: 'controversial', label: 'Controversial' },
    { value: 'latest',        label: 'Latest' },
    { value: 'oldest',        label: 'Oldest' },
    { value: 'highest_rated', label: 'Highest Rated' },
    { value: 'lowest_rated',  label: 'Lowest Rated' },
];

function SortDropdown({ current, horseSlug }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#555' }}>Sort by:</label>
            <select
                value={current}
                onChange={(e) =>
                    router.visit(`/horses/${horseSlug}?sort=${e.target.value}`, {
                        preserveState:  false,
                        preserveScroll: false,
                    })
                }
                style={{ fontSize: '0.875rem', padding: '0.2rem 0.4rem', borderRadius: '0.13rem' }}
            >
                {SORT_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HorseShow({ horse, stickyComments, comments, userRating, currentSort }) {
    const auth    = usePage().props;
    const isStaff = auth?.user?.role === 'admin' || auth?.user?.role === 'moderator';

    const ratingForm = useForm({
        value:     userRating?.value     ?? 5,
        intensity: userRating?.intensity ?? 'normal',
    });

    const commentForm = useForm({ body: '', parent_id: '' });

    function submitRating(e) {
        e.preventDefault();
        ratingForm.post(`/horses/${horse.slug}/rate`);
    }

    function submitComment(e) {
        e.preventDefault();
        commentForm.post(`/horses/${horse.slug}/comments`, {
            onSuccess: () => commentForm.reset(),
        });
    }

    return (
        <Layout>
            <Head title={horse.name} />

            <div className="section s-xl" id="page-start">
                <div className="restrained-text" style={{ width: '100%', maxWidth: '48rem' }}>
                    <a href="/" style={{ textDecoration: 'none' }}>← All Horses</a>

                    <h1 style={{ marginTop: '1rem' }}>{horse.name}</h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        {horse.episode       !== null && <span>Episode {horse.episode}</span>}
                        {horse.weight_lbs              && <span>{horse.weight_lbs} lbs</span>}
                        {horse.age_at_capture          && <span>Captured age {horse.age_at_capture}</span>}
                    </div>

                    {horse.parents?.length > 0 && (
                        <p><strong>Parents:</strong> {horse.parents.join(', ')}</p>
                    )}
                    {horse.description && <p>{horse.description}</p>}
                    {horse.notes       && <blockquote>{horse.notes}</blockquote>}

                    {horse.avg_rating !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <span>Community Rating:</span>
                            <RatingBadge value={horse.avg_rating} isAvg avgTier={horse.tier} />
                            <small>({horse.ratings_count} vote{horse.ratings_count !== 1 ? 's' : ''})</small>
                        </div>
                    )}

                    {horse.is_locked && (
                        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                            Comments are locked for this horse.
                        </div>
                    )}

                    {/* ── Rating form ── */}
                    {auth && (
                        <div style={{ marginTop: '1.75rem' }}>
                            <h2>{userRating ? 'Update Your Rating' : 'Rate This Horse'}</h2>
                            <form onSubmit={submitRating}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span>Value (1–10)</span>
                                        <input type="number" min={1} max={10}
                                            value={ratingForm.data.value}
                                            onChange={(e) => ratingForm.setData('value', Number(e.target.value))}
                                            style={{ width: '5rem' }} />
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span>Intensity</span>
                                        <select value={ratingForm.data.intensity}
                                            onChange={(e) => ratingForm.setData('intensity', e.target.value)}>
                                            <option value="strong">Strong</option>
                                            <option value="normal">Normal</option>
                                            <option value="light">Light</option>
                                        </select>
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span>Preview</span>
                                        <RatingBadge value={ratingForm.data.value} intensity={ratingForm.data.intensity} />
                                    </div>
                                </div>
                                <button type="submit" className="button b-primary nomargin"
                                    disabled={ratingForm.processing} style={{ marginTop: '0.75rem' }}>
                                    {userRating ? 'Update Rating' : 'Submit Rating'}
                                </button>
                                {ratingForm.errors.value && (
                                    <div className="alert alert-danger">{ratingForm.errors.value}</div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* ── Comments ── */}
                    <div style={{ marginTop: '2rem' }}>
                        <h2>Comments</h2>

                        {auth && !horse.is_locked && (
                            <form onSubmit={submitComment} style={{ marginBottom: '1.5rem' }}>
                                <RichTextInput
                                    value={commentForm.data.body}
                                    onChange={(html) => commentForm.setData('body', html)}
                                    placeholder="Leave a comment..."
                                    minRows={3}
                                />
                                {commentForm.errors.body && (
                                    <div className="alert alert-danger">{commentForm.errors.body}</div>
                                )}
                                <button type="submit" className="button b-primary nomargin"
                                    disabled={commentForm.processing} style={{ marginTop: '0.4rem' }}>
                                    Post Comment
                                </button>
                            </form>
                        )}

                        {/* Sticky comments — always first, not affected by sort */}
                        {stickyComments?.map((comment) => (
                            <CommentThread key={`sticky-${comment.id}`}
                                comment={comment} horse={horse} auth={auth} isStaff={isStaff} />
                        ))}

                        {/* Sort dropdown — only shown if there are non-sticky comments */}
                        {(comments.data.length > 0 || currentSort !== 'popular') && (
                            <SortDropdown current={currentSort} horseSlug={horse.slug} />
                        )}

                        {stickyComments?.length === 0 && comments.data.length === 0 && (
                            <p>No comments yet.</p>
                        )}

                        {comments.data.map((comment) => (
                            <CommentThread key={comment.id}
                                comment={comment} horse={horse} auth={auth} isStaff={isStaff} />
                        ))}

                        {/* Pagination */}
                        {comments.links && (
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                                {comments.links.map((link) => (
                                    <button key={link.label} className="button b-primary nomargin"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
