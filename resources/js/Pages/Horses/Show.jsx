import Layout from '@/Root';
import { Head, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
// import Layout from '../../components/Layout';

export default function HorseShow({ horse, comments, userRating }) {

    const auth = usePage().props;

    const ratingForm = useForm({
        value: userRating?.value ?? 5,
        intensity: userRating?.intensity ?? 'normal',
    });

    const commentForm = useForm({ body: '' });

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

    const isStaff =
        auth?.user?.role === 'admin' || auth?.user?.role === 'moderator';

    return (
        <Layout>
            <Head title={horse.name} />

            <div className="section s-xl" id="page-start">
                <div className="restrained-text" style={{ width: '100%', maxWidth: '48rem' }}>

                    {/* ── Horse header ── */}
                    <a href="/" style={{ textDecoration: 'none' }}>
                        ← All Horses
                    </a>

                    <h1 style={{ marginTop: '1rem' }}>{horse.name}</h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                        {horse.episode      !== null && <span>Episode {horse.episode}</span>}
                        {horse.weight_lbs             && <span>{horse.weight_lbs} lbs</span>}
                        {horse.age_at_capture         && <span>Age at capture: {horse.age_at_capture}</span>}
                    </div>

                    {horse.parents?.length > 0 && (
                        <p>
                            <strong>Parents:</strong> {horse.parents.join(', ')}
                        </p>
                    )}

                    {horse.description && <p>{horse.description}</p>}
                    {horse.notes       && <blockquote>{horse.notes}</blockquote>}

                    {/* ── Community rating ── */}
                    {horse.avg_rating !== null && (
                        <div className="alert alert-information" style={{ marginTop: '1rem' }}>
                            Community rating:&nbsp;
                            <strong>{horse.avg_rating}</strong> &mdash;{' '}
                            <strong>{horse.tier}</strong>&nbsp;
                            ({horse.ratings_count} vote{horse.ratings_count !== 1 ? 's' : ''})
                        </div>
                    )}

                    {/* ── Locked notice ── */}
                    {horse.is_locked && (
                        <div className="alert alert-warning">
                            Comments are locked for this horse.
                        </div>
                    )}

                    {/* ── Rating form ── */}
                    {auth?.user && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h2>{userRating ? 'Update Your Rating' : 'Rate This Horse'}</h2>
                            <form onSubmit={submitRating}>
                                <label>
                                    Value (1–10):&nbsp;
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={ratingForm.data.value}
                                        onChange={(e) =>
                                            ratingForm.setData('value', Number(e.target.value))
                                        }
                                        style={{ width: '4rem', marginRight: '1rem' }}
                                    />
                                </label>
                                <label>
                                    Intensity:&nbsp;
                                    <select
                                        value={ratingForm.data.intensity}
                                        onChange={(e) =>
                                            ratingForm.setData('intensity', e.target.value)
                                        }
                                        style={{ marginRight: '1rem' }}
                                    >
                                        <option value="strong">Strong</option>
                                        <option value="normal">Normal</option>
                                        <option value="light">Light</option>
                                    </select>
                                </label>
                                <button
                                    type="submit"
                                    className="button b-primary nomargin"
                                    disabled={ratingForm.processing}
                                >
                                    Submit Rating
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

                        {auth?.user && !horse.is_locked && (
                            <form onSubmit={submitComment} style={{ marginBottom: '1.5rem' }}>
                                <textarea
                                    value={commentForm.data.body}
                                    onChange={(e) =>
                                        commentForm.setData('body', e.target.value)
                                    }
                                    placeholder="Leave a comment..."
                                    rows={3}
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
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
                                >
                                    Post Comment
                                </button>
                            </form>
                        )}

                        {comments.data.length === 0 && (
                            <p>No comments yet.</p>
                        )}

                        {comments.data.map((c) => (
                            <div
                                key={c.id}
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    paddingBottom: '1rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                <strong>{c.user.name}</strong>
                                <small style={{ marginLeft: '0.5rem' }}>
                                    {new Date(c.created_at).toLocaleDateString()}
                                </small>
                                <p style={{ margin: '0.25rem 0 0' }}>{c.body}</p>
                                {isStaff && (
                                    <button
                                        className="button b-danger nomargin"
                                        style={{ marginTop: '0.25rem' }}
                                        onClick={() =>
                                            router.delete(
                                                `/admin/comments/${c.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Pagination */}
                        {comments.links && (
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                {comments.links.map((link) => (
                                    <button
                                        key={link.label}
                                        className="button b-primary nomargin"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.visit(link.url)
                                        }
                                        dangerouslySetInnerHTML={{ __html: link.label }}
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