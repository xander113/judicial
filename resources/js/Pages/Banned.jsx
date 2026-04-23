import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Layout from '@/Root';

export default function Banned({ ban }) {
    const form = useForm({ message: '' });

    function submit(e) {
        e.preventDefault();
        form.post('/appeals', { onSuccess: () => form.reset() });
    }

    return (
        <Layout>
            <Head title="Banned" />

            <div className="section s-xl sec-red" id="page-start">
                <div
                    className="restrained-text text-black"
                    style={{ width: '100%', maxWidth: '32rem' }}
                >
                    <h1>You are banned.</h1>

                    <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                        <div>
                            <strong>Reason:</strong> {ban.reason}
                            <br />
                            <strong>Type:</strong>{' '}
                            {ban.type.charAt(0).toUpperCase() + ban.type.slice(1)}
                            {ban.expires_at && (
                                <>
                                    <br />
                                    <strong>Expires:</strong>{' '}
                                    {new Date(ban.expires_at).toLocaleString()}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Appeal form */}
                    {!ban.has_appeal ? (
                        <div>
                            <h2>Submit an Appeal</h2>
                            <p>
                                State your case below. An admin will make the
                                final decision.
                            </p>
                            <form onSubmit={submit}>
                                <textarea
                                    value={form.data.message}
                                    onChange={(e) =>
                                        form.setData('message', e.target.value)
                                    }
                                    placeholder="Explain your appeal..."
                                    rows={5}
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                                {form.errors.message && (
                                    <div className="alert alert-danger">
                                        {form.errors.message}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="button b-primary"
                                    disabled={form.processing}
                                >
                                    Submit Appeal
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            Your appeal has been submitted and is pending admin
                            review.
                        </div>
                    )}

                    <button
                        className="button b-danger"
                        onClick={() => router.post('/logout')}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </Layout>
    );
}
