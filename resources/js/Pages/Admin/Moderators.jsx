import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Layout from '@/Root';

export default function AdminModerators({ moderators, users }) {
    const form = useForm({ user_id: '' });

    function submit(e) {
        e.preventDefault();
        form.post('/admin/moderators', { onSuccess: () => form.reset() });
    }

    return (
        <Layout>
            <Head title="Moderators — Admin" />

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%', maxWidth: '48rem' }}>
                    <a href="/admin" style={{ textDecoration: 'none' }}>
                        ← Admin Panel
                    </a>

                    <h1 style={{ marginTop: '1rem' }}>Moderator Management</h1>

                    {/* Promote form */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2>Promote User to Moderator</h2>
                        <form
                            onSubmit={submit}
                            style={{
                                display:    'flex',
                                gap:        '0.5rem',
                                flexWrap:   'wrap',
                                alignItems: 'center',
                            }}
                        >
                            <select
                                value={form.data.user_id}
                                onChange={(e) =>
                                    form.setData('user_id', e.target.value)
                                }
                                style={{ flexGrow: 1, minWidth: '12rem' }}
                            >
                                <option value="">— Select user —</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="button b-primary nomargin"
                                disabled={form.processing}
                            >
                                Promote
                            </button>
                        </form>
                        {form.errors.user_id && (
                            <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
                                {form.errors.user_id}
                            </div>
                        )}
                    </div>

                    {/* Current moderators */}
                    <h2>Current Moderators</h2>

                    <div style={{ overflowX: 'auto' }}>
                        {moderators.length === 0 ? (
                            <p>No moderators assigned.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '22rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Name</th>
                                        <th style={{ padding: '0.5rem' }}>Email</th>
                                        <th style={{ padding: '0.5rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {moderators.map((m) => (
                                        <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.5rem' }}>{m.name}</td>
                                            <td style={{ padding: '0.5rem' }}>{m.email}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <button
                                                    className="button b-danger nomargin"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/admin/moderators/${m.id}`,
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                >
                                                    Demote
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
