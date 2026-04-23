import Layout from '@/Root';
import { Head, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
// import Layout from '../../components/Layout';

export default function AdminBans({ bans }) {
    const auth = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const form = useForm({
        user_id:    '',
        reason:     '',
        type:       'permanent',
        expires_at: '',
    });

    function submit(e) {
        e.preventDefault();
        form.post('/admin/bans', { onSuccess: () => form.reset() });
    }

    return (
        <Layout>
            <Head title="Bans — Admin" />

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%', maxWidth: '64rem' }}>
                    <a href="/admin" style={{ textDecoration: 'none' }}>
                        ← Admin Panel
                    </a>

                    <h1 style={{ marginTop: '1rem' }}>Bans</h1>

                    {/* ── Issue ban form ── */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2>Issue Ban</h2>
                        <form
                            onSubmit={submit}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '32rem' }}
                        >
                            <label>
                                User ID
                                <input
                                    type="text"
                                    placeholder="Numeric user ID"
                                    value={form.data.user_id}
                                    onChange={(e) =>
                                        form.setData('user_id', e.target.value)
                                    }
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </label>
                            {form.errors.user_id && (
                                <div className="alert alert-danger">
                                    {form.errors.user_id}
                                </div>
                            )}

                            <label>
                                Reason
                                <textarea
                                    placeholder="Reason for ban..."
                                    value={form.data.reason}
                                    onChange={(e) =>
                                        form.setData('reason', e.target.value)
                                    }
                                    rows={3}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            </label>
                            {form.errors.reason && (
                                <div className="alert alert-danger">
                                    {form.errors.reason}
                                </div>
                            )}

                            <label>
                                Type
                                <select
                                    value={form.data.type}
                                    onChange={(e) =>
                                        form.setData('type', e.target.value)
                                    }
                                    style={{ display: 'block', width: '100%' }}
                                >
                                    <option value="permanent">Permanent</option>
                                    <option value="temporary">Temporary</option>
                                </select>
                            </label>

                            {form.data.type === 'temporary' && (
                                <label>
                                    Expires at
                                    <input
                                        type="datetime-local"
                                        value={form.data.expires_at}
                                        onChange={(e) =>
                                            form.setData('expires_at', e.target.value)
                                        }
                                        style={{ display: 'block', width: '100%' }}
                                    />
                                    {form.errors.expires_at && (
                                        <div className="alert alert-danger">
                                            {form.errors.expires_at}
                                        </div>
                                    )}
                                </label>
                            )}

                            <button
                                type="submit"
                                className="button b-danger nomargin"
                                disabled={form.processing}
                            >
                                Issue Ban
                            </button>
                        </form>
                    </div>

                    {/* ── Ban list ── */}
                    <h2>Active &amp; Past Bans</h2>

                    {bans.data.length === 0 ? (
                        <p>No bans on record.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem' }}>User</th>
                                    <th style={{ padding: '0.5rem' }}>Reason</th>
                                    <th style={{ padding: '0.5rem' }}>Type</th>
                                    <th style={{ padding: '0.5rem' }}>Expires</th>
                                    <th style={{ padding: '0.5rem' }}>Active</th>
                                    <th style={{ padding: '0.5rem' }}>Issued by</th>
                                    <th style={{ padding: '0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {bans.data.map((ban) => (
                                    <tr
                                        key={ban.id}
                                        style={{ borderBottom: '1px solid #eee' }}
                                    >
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.user.name}
                                            <br />
                                            <small>{ban.user.email}</small>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.reason}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.type}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.expires_at
                                                ? new Date(ban.expires_at).toLocaleString()
                                                : '—'}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.is_active ? 'Yes' : 'No'}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.banned_by.name}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {ban.is_active && isAdmin && (
                                                <button
                                                    className="button b-warning nomargin"
                                                    onClick={() =>
                                                        router.patch(
                                                            `/admin/bans/${ban.id}/override`,
                                                            {},
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                >
                                                    Override
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {bans.links && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {bans.links.map((link) => (
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
        </Layout>
    );
}