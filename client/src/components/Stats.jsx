import { useState, useEffect } from 'react';
import './Stats.css';
import Header from './Header.jsx';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const Stats = () => {
    const [clientCount, setClientCount] = useState(0);

    useEffect(() => {
        const fetchClientCount = async () => {
            try {
                const response = await fetch(baseURI + 'api/users-count', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setClientCount(data.count);
                } else {
                    console.error('Failed to fetch client count');
                }
            } catch (error) {
                console.error('Network error:', error);
            }
        };

        fetchClientCount();
    }, []);

    return (
        <>
            <Header />
            <div className="stats-container">
                <h2>Nombre de clients :</h2>
                <p>{clientCount}</p>
            </div>
        </>
    );
};

export default Stats;
