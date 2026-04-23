import Layout from '@/Root';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
// import Layout from '../../components/Layout';

const allLinks = [
    { label: 'Blacklist',  href: '/admin/blacklist', roles: ['admin', 'moderator'] },
    { label: 'Bans',       href: '/admin/bans',      roles: ['admin', 'moderator'] },
    { label: 'Appeals',    href: '/admin/appeals',   roles: ['admin', 'moderator'] },
    { label: 'Moderators', href: '/admin/moderators', roles: ['admin'] },
];

export default function AdminPanel() {
    const auth = usePage().props;
    const role = auth?.user?.role;

    const links = allLinks.filter((l) => l.roles.includes(role));

    return (
        <Layout>
            <Head title="Admin Panel" />

            <div className="section s-lg" id="page-start">
                <div>
                    <h1>Admin Panel</h1>
                    <p>Select a section to manage.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
                        {links.map((l) => (
                            <button
                                key={l.href}
                                className="button b-primary"
                                onClick={() => router.visit(l.href)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}