import { useState, useEffect } from 'react';
import './ListingUser.css';
import Header from './Header.jsx';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const ListingUser = () => {
    const [users, setUsers] = useState([]);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editUserData, setEditUserData] = useState({ id: '', lastname: '', firstname: '', email: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(baseURI + 'api/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    console.error('Failed to fetch users');
                }
            } catch (error) {
                console.error('Network error:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditUserData(user);
        setIsEditPopupOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${baseURI}api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (response.ok) {
                setUsers(users.filter(user => user.id !== id));
                console.log(`Deleted user with ID: ${id}`);
            } else {
                console.error('Failed to delete user');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUserData({ ...editUserData, [name]: value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${baseURI}api/users/${editUserData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(editUserData)
            });
            if (response.ok) {
                setUsers(users.map(user => (user.id === editUserData.id ? editUserData : user)));
                setIsEditPopupOpen(false);
                console.log(`Edited user with ID: ${editUserData.id}`);
            } else {
                console.error('Failed to edit user');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <>
            <Header />
            <div className="listing-container">
                <h2>Liste des utilisateurs</h2>
                <table className="user-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.lastname}</td>
                            <td>{user.firstname}</td>
                            <td>{user.email}</td>
                            <td>
                                <button onClick={() => handleEdit(user)}>Modifier</button>
                                <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {isEditPopupOpen && (
                <div className="edit-popup">
                    <form onSubmit={handleEditSubmit} className="edit-form">
                        <h2>Modifier l'utilisateur</h2>
                        <input
                            type="text"
                            name="lastname"
                            value={editUserData.lastname}
                            onChange={handleEditChange}
                            placeholder="Nom"
                            required
                        />
                        <input
                            type="text"
                            name="firstname"
                            value={editUserData.firstname}
                            onChange={handleEditChange}
                            placeholder="Prénom"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={editUserData.email}
                            onChange={handleEditChange}
                            placeholder="Email"
                            required
                        />
                        <button type="submit">Enregistrer</button>
                        <button type="button" onClick={() => setIsEditPopupOpen(false)}>Annuler</button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ListingUser;
