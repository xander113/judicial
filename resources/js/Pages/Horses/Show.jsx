import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Layout from '@/Root';
import RatingBadge from '@/components/RatingBadge';

// ── Reply inline form ────────────────────────────────────────────────────────

function ReplyForm({ commentId, horseSlug, onClose }) {
    const form = useForm({ body: '', parent_id: commentId });

    function submit(e) {
        e.preventDefault();
        form.post(`/horses/${horseSlug}/comments`, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    }

    return (
        <form onSubmit={submit} style={{ marginTop: '0.5rem' }}>
            <textarea
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {form.errors.body && (
                <div className="alert alert-danger">{form.errors.body}</div>
            )}
            <div
                style={{
                    display:   'flex',
                    gap:       '0.5rem',
                    marginTop: '0.25rem',
                    flexWrap:  'wrap',
                }}
            >
                <button
                    type="submit"
                    className="button b-primary nomargin"
                    disabled={form.processing}
                >
                    Reply
                </button>
                <button
                    type="button"
                    className="button b-danger nomargin"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ── Single reply row ─────────────────────────────────────────────────────────

function ReplyRow({ reply, isStaff }) {
    return (
        <div
            style={{
                borderLeft:   '3px solid #CBF1F6',
                paddingLeft:  '0.75rem',
                marginTop:    '0.75rem',
            }}
        >
            <div
                style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '0.5rem',
                    flexWrap:   'wrap',
                }}
            >
                <strong style={{ fontSize: '0.875rem' }}>
                    {reply.user.name}
                </strong>

                {reply.author_rating && (
                    <RatingBadge
                        value={reply.author_rating.value}
                        intensity={reply.author_rating.intensity}
                        size="sm"
                    />
                )}

                <small style={{ color: '#666' }}>
                    {new Date(reply.created_at).toLocaleDateString()}
                </small>
            </div>

            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                {reply.body}
            </p>

            {isStaff && (
                <button
                    className="button b-danger nomargin"
                    style={{ marginTop: '0.25rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() =>
                        router.delete(`/admin/comments/${reply.id}`, {
                            preserveScroll: true,
                        })
                    }
                >
                    Delete
                </button>
            )}
        </div>
    );
}

// ── Comment thread (top-level comment + collapsible replies) ─────────────────

function CommentThread({ comment, horse, auth, isStaff }) {
    const [showReplies,   setShowReplies]   = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    const replyCount = comment.replies?.length ?? 0;

    return (
        <div
            style={{
                borderBottom:   '1px solid #ddd',
                paddingBottom:  '1rem',
                marginBottom:   '1rem',
            }}
        >
            {/* Author row */}
            <div
                style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '0.5rem',
                    flexWrap:   'wrap',
                }}
            >
                <strong>{comment.user.name}</strong>

                {comment.author_rating && (
                    <RatingBadge
                        value={comment.author_rating.value}
                        intensity={comment.author_rating.intensity}
                        size="sm"
                    />
                )}

                <small style={{ color: '#666' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                </small>
            </div>

            {/* Body */}
            <p style={{ margin: '0.3rem 0 0' }}>{comment.body}</p>

            {/* Action row */}
            <div
                style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '0.5rem',
                    marginTop:  '0.4rem',
                    flexWrap:   'wrap',
                }}
            >
                {auth && !horse.is_locked && (
                    <button
                        className="button b-primary nomargin"
                        style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
                        onClick={() => setShowReplyForm((v) => !v)}
                    >
                        {showReplyForm ? 'Cancel' : 'Reply'}
                    </button>
                )}

                {replyCount > 0 && (
                    <button
                        className="button b-primary nomargin"
                        style={{
                            fontSize:        '0.8rem',
                            padding:         '0.2rem 0.6rem',
                            backgroundColor: 'transparent',
                        }}
                        onClick={() => setShowReplies((v) => !v)}
                    >
                        {showReplies
                            ? '▲ Hide replies'
                            : `▼ ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
                    </button>
                )}

                {isStaff && (
                    <button
                        className="button b-danger nomargin"
                        style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}
                        onClick={() =>
                            router.delete(`/admin/comments/${comment.id}`, {
                                preserveScroll: true,
                            })
                        }
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Inline reply form */}
            {showReplyForm && (
                <ReplyForm
                    commentId={comment.id}
                    horseSlug={horse.slug}
                    onClose={() => setShowReplyForm(false)}
                />
            )}

            {/* Expanded replies */}
            {showReplies && replyCount > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                    {comment.replies.map((reply) => (
                        <ReplyRow key={reply.id} reply={reply} isStaff={isStaff} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HorseShow({ horse, comments, userRating }) {
    const auth    = usePage().props;
    const isStaff = auth?.role === 'admin' || auth?.role === 'moderator';

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
                <div
                    className="restrained-text"
                    style={{ width: '100%', maxWidth: '48rem' }}
                >
                    <a href="/" style={{ textDecoration: 'none' }}>
                        ← All Horses
                    </a>

                    {/* ── Header ── */}
                    <h1 style={{ marginTop: '1rem' }}>{horse.name}</h1>

                    <div
                        style={{
                            display:      'flex',
                            flexWrap:     'wrap',
                            gap:          '0.75rem',
                            marginBottom: '0.5rem',
                        }}
                    >
                        {horse.episode       !== null && <span>Episode {horse.episode}</span>}
                        {horse.weight_lbs              && <span>{horse.weight_lbs} lbs</span>}
                        {horse.age_at_capture          && <span>Captured age {horse.age_at_capture}</span>}
                    </div>

                    {horse.parents?.length > 0 && (
                        <p>
                            <strong>Parents:</strong> {horse.parents.join(', ')}
                        </p>
                    )}

                    {horse.description && <p>{horse.description}</p>}
                    {horse.notes       && <blockquote>{horse.notes}</blockquote>}

                    {/* ── Overall rating badge ── */}
                    {horse.avg_rating !== null && (
                        <div
                            style={{
                                display:    'flex',
                                alignItems: 'center',
                                gap:        '0.75rem',
                                marginTop:  '1rem',
                                flexWrap:   'wrap',
                            }}
                        >
                            <span>Community Rating:</span>
                            <RatingBadge
                                value={horse.avg_rating}
                                isAvg
                                avgTier={horse.tier}
                            />
                            <small>
                                ({horse.ratings_count} vote
                                {horse.ratings_count !== 1 ? 's' : ''})
                            </small>
                        </div>
                    )}

                    {horse.is_locked && (
                        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                            Comments are locked for this horse.
                        </div>
                    )}

                    {/* ── Your rating form ── */}
                    {auth && (
                        <div style={{ marginTop: '1.75rem' }}>
                            <h2>{userRating ? 'Update Your Rating' : 'Rate This Horse'}</h2>
                            <form onSubmit={submitRating}>
                                <div
                                    style={{
                                        display:    'flex',
                                        flexWrap:   'wrap',
                                        gap:        '1rem',
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    <label
                                        style={{
                                            display:       'flex',
                                            flexDirection: 'column',
                                            gap:           '0.25rem',
                                        }}
                                    >
                                        <span>Value (1–10)</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={ratingForm.data.value}
                                            onChange={(e) =>
                                                ratingForm.setData(
                                                    'value',
                                                    Number(e.target.value),
                                                )
                                            }
                                            style={{ width: '5rem' }}
                                        />
                                    </label>

                                    <label
                                        style={{
                                            display:       'flex',
                                            flexDirection: 'column',
                                            gap:           '0.25rem',
                                        }}
                                    >
                                        <span>Intensity</span>
                                        <select
                                            value={ratingForm.data.intensity}
                                            onChange={(e) =>
                                                ratingForm.setData('intensity', e.target.value)
                                            }
                                        >
                                            <option value="strong">Strong</option>
                                            <option value="normal">Normal</option>
                                            <option value="light">Light</option>
                                        </select>
                                    </label>

                                    {/* Live preview badge */}
                                    <div
                                        style={{
                                            display:       'flex',
                                            flexDirection: 'column',
                                            gap:           '0.25rem',
                                        }}
                                    >
                                        <span>Preview</span>
                                        <RatingBadge
                                            value={ratingForm.data.value}
                                            intensity={ratingForm.data.intensity}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="button b-primary nomargin"
                                    disabled={ratingForm.processing}
                                    style={{ marginTop: '0.75rem' }}
                                >
                                    {userRating ? 'Update Rating' : 'Submit Rating'}
                                </button>

                                {ratingForm.errors.value && (
                                    <div className="alert alert-danger">
                                        {ratingForm.errors.value}
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* ── Comments ── */}
                    <div style={{ marginTop: '2rem' }}>
                        <h2>Comments</h2>

                        {/* New top-level comment form */}
                        {auth && !horse.is_locked && (
                            <form
                                onSubmit={submitComment}
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <textarea
                                    value={commentForm.data.body}
                                    onChange={(e) =>
                                        commentForm.setData('body', e.target.value)
                                    }
                                    placeholder="Leave a comment..."
                                    rows={3}
                                    style={{
                                        width:     '100%',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                {commentForm.errors.body && (
                                    <div className="alert alert-danger">
                                        {commentForm.errors.body}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="button b-primary nomargin"
                                    disabled={commentForm.processing}
                                    style={{ marginTop: '0.25rem' }}
                                >
                                    Post Comment
                                </button>
                            </form>
                        )}

                        {comments.data.length === 0 && <p>No comments yet.</p>}

                        {comments.data.map((comment) => (
                            <CommentThread
                                key={comment.id}
                                comment={comment}
                                horse={horse}
                                auth={auth}
                                isStaff={isStaff}
                            />
                        ))}

                        {/* Pagination */}
                        {comments.links && (
                            <div
                                style={{
                                    display:   'flex',
                                    gap:       '0.25rem',
                                    flexWrap:  'wrap',
                                    marginTop: '1rem',
                                }}
                            >
                                {comments.links.map((link) => (
                                    <button
                                        key={link.label}
                                        className="button b-primary nomargin"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.visit(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
