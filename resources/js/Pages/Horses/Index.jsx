import Layout from '@/Root';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
// import Layout from '../../components/Layout';

export default function HorsesIndex({ horses }) {
    return (
        <Layout>
            <Head title="CaseOh's Ranch — All Horses" />

            <div className="section s-xl" id="page-start">
                <div style={{ width: '100%' }}>
                    <h1>All Horses</h1>
                    <p className="restrained-text">
                        Every horse from CaseOh's Horsey Game series, catalogued
                        and rated by the community.
                    </p>

                    <div className="horse-grid">
                        {horses.map((horse) => (
                            <div
                                key={horse.id}
                                className="horse-card"
                                onClick={() =>
                                    router.visit(`/horses/${horse.slug}`)
                                }
                            >
                                {horse.image_path && (
                                    <img
                                        className="place-image"
                                        src={horse.image_path}
                                        alt={horse.name}
                                    />
                                )}

                                <h2>{horse.name}</h2>

                                {horse.episode !== null && (
                                    <small>Episode {horse.episode}</small>
                                )}

                                {horse.weight_lbs && (
                                    <small>{horse.weight_lbs} lbs</small>
                                )}

                                {horse.avg_rating !== null ? (
                                    <p style={{ marginTop: '0.5rem' }}>
                                        {horse.avg_rating} &mdash;{' '}
                                        <strong>{horse.tier}</strong>
                                        <br />
                                        <small>
                                            {horse.ratings_count} rating
                                            {horse.ratings_count !== 1 ? 's' : ''}
                                        </small>
                                    </p>
                                ) : (
                                    <small style={{ marginTop: '0.5rem' }}>
                                        No ratings yet
                                    </small>
                                )}

                                {horse.is_locked && (
                                    <small>
                                        <strong>[Comments Locked]</strong>
                                    </small>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}