import {useState, useEffect} from 'react';
import './Header.css';
import {Link} from 'react-router-dom';
import Cookies from 'js-cookie';

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const baseURI = import.meta.env.VITE_API_BASE_URL
    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = Cookies.get('token');
            if (token) {
                setIsAuthenticated(true);
                try {
                    const response = await fetch(baseURI + 'api/user-details', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsAdmin(data.isAdmin);
                    } else {
                        console.error('Failed to fetch user details');
                    }
                } catch (error) {
                    console.error('Network error:', error);
                }
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <header className="headerhead">
            <Link to="/">
                <h1>Garage Auto</h1>
            </Link>
            <div className="underheaderhead">
                {!isAuthenticated && (
                    <Link to="/auth">
                        <button className="login-button">Connexion</button>
                    </Link>
                )}
                {isAuthenticated && isAdmin && (
                    <>
                        <Link to="/listing-user">
                            <button>Gestion des clients</button>
                        </Link>
                        <Link to="/stats">
                            <button>Statistiques</button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
