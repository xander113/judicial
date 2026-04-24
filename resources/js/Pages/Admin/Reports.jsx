import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Layout from '@/Root';

export default function AdminReports({ reportedComments }) {
    function dismiss(commentId) {
        router.patch(`/admin/reports/${commentId}/dismiss`, {}, { preserveScroll: true });
    }

    function deleteComment(commentId) {
        if (!window.confirm('Delete this comment? This cannot be undone.')) return;
        router.delete(`/admin/comments/${commentId}`, { preserveScroll: true });
    }

    return (
        <Layout>
            <Head title="Reports — Admin" />

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%', maxWidth: '64rem' }}>
                    <a href="/admin" style={{ textDecoration: 'none' }}>← Admin Panel</a>

                    <h1 style={{ marginTop: '1rem' }}>Reports</h1>
                    <p>
                        Multiple reports on the same comment are combined into one row.
                        Dismiss to clear without deleting; Delete to remove the comment entirely.
                    </p>

                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        {reportedComments.data.length === 0 ? (
                            <p>No open reports.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '44rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Horse</th>
                                        <th style={{ padding: '0.5rem' }}>Author</th>
                                        <th style={{ padding: '0.5rem' }}>Comment</th>
                                        <th style={{ padding: '0.5rem' }}>Reports</th>
                                        <th style={{ padding: '0.5rem' }}>Reasons</th>
                                        <th style={{ padding: '0.5rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportedComments.data.map((item) => {
                                        const reasons = [
                                            ...new Set(item.reports.map((r) => r.reason).filter(Boolean)),
                                        ];

                                        return (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
                                                <td style={{ padding: '0.5rem' }}>
                                                    {item.horse ? (
                                                        <a href={`/horses/${item.horse.slug}`}
                                                            style={{ textDecoration: 'none', fontWeight: 600 }}>
                                                            {item.horse.name}
                                                        </a>
                                                    ) : '—'}
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    {item.user?.name ?? '[deleted]'}
                                                </td>
                                                <td style={{ padding: '0.5rem', maxWidth: '16rem' }}>
                                                    <div
                                                        style={{
                                                            maxHeight:    '4rem',
                                                            overflow:     'hidden',
                                                            fontSize:     '0.85rem',
                                                            lineHeight:   1.4,
                                                            color:        item.deleted_at ? '#aaa' : 'inherit',
                                                            fontStyle:    item.deleted_at ? 'italic' : 'normal',
                                                        }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: item.deleted_at
                                                                ? '[Deleted]'
                                                                : item.body?.substring(0, 200),
                                                        }}
                                                    />
                                                    {item.parent_id && (
                                                        <small style={{ color: '#999' }}>(reply)</small>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    <strong style={{ fontSize: '1.1rem' }}>{item.open_count}</strong>
                                                </td>
                                                <td style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#555' }}>
                                                    {reasons.length > 0
                                                        ? reasons.join(', ')
                                                        : '—'}
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                        <button className="button b-primary nomargin"
                                                            style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}
                                                            onClick={() => dismiss(item.id)}>
                                                            Dismiss
                                                        </button>
                                                        {!item.deleted_at && (
                                                            <button className="button b-danger nomargin"
                                                                style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}
                                                                onClick={() => deleteComment(item.id)}>
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {reportedComments.links && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {reportedComments.links.map((link) => (
                                <button key={link.label} className="button b-primary nomargin"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
