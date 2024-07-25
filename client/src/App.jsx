import HomePage from './components/HomePage';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AuthPage from './components/AuthPage';
import './App.css';
import ListingUser from "./components/ListingUser.jsx";
import Stats from "./components/Stats.jsx";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/auth" element={<AuthPage/>}/>
                    <Route path="/listing-user" element={<ListingUser/>}/>
                    <Route path="/stats" element={<Stats/>}/>

                </Routes>
            </div>
        </Router>
    );
}

export default App;
