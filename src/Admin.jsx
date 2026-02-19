import { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/users`);
                setUsers(data);
            } catch (err) {
                const msg = err.response?.data?.error || err.message || 'Failed to fetch users';
                setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Admin Database View</h1>
                <Link to="/" style={styles.backBtn}>Back to Movies</Link>
            </div>

            {loading ? (
                <p style={{ color: 'white' }}>Loading users...</p>
            ) : error ? (
                <div style={styles.errorBox}>{error}</div>
            ) : users.length === 0 ? (
                <div style={styles.empty}>
                    <p>No users found in the database.</p>
                    <p style={{ fontSize: '14px', color: '#777' }}>Try registering a new account first!</p>
                </div>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.uid} style={styles.tr}>
                                <td style={styles.td}>{user.uid}</td>
                                <td style={styles.td}>{user.uname}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.phone || 'N/A'}</td>
                                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', padding: '50px 4%', backgroundColor: '#141414', color: 'white' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '30px', color: '#e50914' },
    backBtn: { padding: '8px 16px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' },
    empty: { textAlign: 'center', padding: '100px', backgroundColor: '#181818', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#181818', borderRadius: '8px', overflow: 'hidden' },
    thead: { backgroundColor: '#333', textAlign: 'left' },
    th: { padding: '15px' },
    td: { padding: '15px', borderBottom: '1px solid #333' },
    tr: { transition: 'background 0.2s' },
    errorBox: { background: '#e50914', color: 'white', padding: '15px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' },
};
