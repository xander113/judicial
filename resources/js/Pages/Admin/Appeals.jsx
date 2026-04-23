import Layout from '@/Root';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
// import Layout from '../../components/Layout';

export default function AdminAppeals({ appeals }) {
    const auth = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    function decide(id, status) {
        router.patch(`/admin/appeals/${id}`, { status }, { preserveScroll: true });
    }

    return (
        <Layout>
            <Head title="Ban Appeals — Admin" />

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%', maxWidth: '64rem' }}>
                    <a href="/admin" style={{ textDecoration: 'none' }}>
                        ← Admin Panel
                    </a>

                    <h1 style={{ marginTop: '1rem' }}>Ban Appeals</h1>
                    <p>
                        Only admins may approve or deny appeals. Approving an
                        appeal lifts the associated ban immediately.
                    </p>

                    {appeals.data.length === 0 ? (
                        <p>No appeals on record.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem' }}>User</th>
                                    <th style={{ padding: '0.5rem' }}>Ban reason</th>
                                    <th style={{ padding: '0.5rem' }}>Appeal message</th>
                                    <th style={{ padding: '0.5rem' }}>Status</th>
                                    <th style={{ padding: '0.5rem' }}>Decided by</th>
                                    <th style={{ padding: '0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {appeals.data.map((appeal) => (
                                    <tr
                                        key={appeal.id}
                                        style={{ borderBottom: '1px solid #eee' }}
                                    >
                                        <td style={{ padding: '0.5rem' }}>
                                            {appeal.user.name}
                                            <br />
                                            <small>{appeal.user.email}</small>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {appeal.ban.reason}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {appeal.message}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <strong>{appeal.status}</strong>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {appeal.decided_by?.name ?? '—'}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {appeal.status === 'pending' && isAdmin && (
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button
                                                        className="button b-primary nomargin"
                                                        onClick={() =>
                                                            decide(appeal.id, 'approved')
                                                        }
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="button b-danger nomargin"
                                                        onClick={() =>
                                                            decide(appeal.id, 'denied')
                                                        }
                                                    >
                                                        Deny
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {appeals.links && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {appeals.links.map((link) => (
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