import Layout from '@/Root';
import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
// import Layout from '../../components/Layout';

export default function AdminBlacklist({ words }) {
    const form = useForm({ word: '' });

    function submit(e) {
        e.preventDefault();
        form.post('/admin/blacklist', { onSuccess: () => form.reset() });
    }

    return (
        <Layout>
            <Head title="Blacklist — Admin" />

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%', maxWidth: '48rem' }}>
                    <a href="/admin" style={{ textDecoration: 'none' }}>
                        ← Admin Panel
                    </a>

                    <h1 style={{ marginTop: '1rem' }}>Word Blacklist</h1>
                    <p>
                        Words added here are automatically censored in all
                        comments, replacing matched text with asterisks.
                    </p>

                    {/* ── Add word form ── */}
                    <form
                        onSubmit={submit}
                        style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}
                    >
                        <input
                            type="text"
                            placeholder="Add word..."
                            value={form.data.word}
                            onChange={(e) => form.setData('word', e.target.value)}
                            style={{ flexGrow: 1 }}
                        />
                        <button
                            type="submit"
                            className="button b-primary nomargin"
                            disabled={form.processing}
                        >
                            Add
                        </button>
                    </form>
                    {form.errors.word && (
                        <div className="alert alert-danger">{form.errors.word}</div>
                    )}

                    {/* ── Word list ── */}
                    {words.length === 0 ? (
                        <p>No words on the blacklist.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem' }}>Word</th>
                                    <th style={{ padding: '0.5rem' }}>Added by</th>
                                    <th style={{ padding: '0.5rem' }}>Date</th>
                                    <th style={{ padding: '0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {words.map((w) => (
                                    <tr
                                        key={w.id}
                                        style={{ borderBottom: '1px solid #eee' }}
                                    >
                                        <td style={{ padding: '0.5rem' }}>
                                            <code>{w.word}</code>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {w.added_by?.name ?? '—'}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {new Date(w.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <button
                                                className="button b-danger nomargin"
                                                onClick={() =>
                                                    router.delete(
                                                        `/admin/blacklist/${w.id}`,
                                                        { preserveScroll: true },
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
}