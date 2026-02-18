import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { window, events } from "@neutralinojs/lib";
import ModInfoGenerator from './components/ModInfoGenerator';
import ItemGenerator from './components/ItemGenerator';
import BlockGenerator from './components/BlockGenerator';
import RecipeGenerator from './components/RecipeGeneratorV2';
import Home from './components/Home';
import NewModWizard from './components/NewModWizard';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <h1>
            <Link to="/" className={isHomePage ? 'active' : ''}>
              Vintage Story Mod Maker
            </Link>
          </h1>
          <nav>
            <Link to="/" className={isHomePage ? 'nav-link active' : 'nav-link'}>
              Home
            </Link>
            <Link to="/new-mod" className={location.pathname === '/new-mod' ? 'nav-link active' : 'nav-link'}>
              New Mod
            </Link>
            <Link to="/generator" className={location.pathname === '/generator' ? 'nav-link active' : 'nav-link'}>
              ModInfo Generator
            </Link>
            <Link to="/item-generator" className={location.pathname === '/item-generator' ? 'nav-link active' : 'nav-link'}>
              Item Generator
            </Link>
            <Link to="/block-generator" className={location.pathname === '/block-generator' ? 'nav-link active' : 'nav-link'}>
              Block Generator
            </Link>
            <Link to="/recipe-generator" className={location.pathname === '/recipe-generator' ? 'nav-link active' : 'nav-link'}>
              Recipe Generator
            </Link>
          </nav>
        </div>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-mod" element={<NewModWizard />} />
          <Route path="/generator" element={<ModInfoGenerator />} />
          <Route path="/item-generator" element={<ItemGenerator />} />
          <Route path="/block-generator" element={<BlockGenerator />} />
          <Route path="/recipe-generator" element={<RecipeGenerator />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-buttons">
          <button 
            onClick={() => { events.broadcast("backend:minimize"); }} 
            className="footer-button"
          >
            Minimize
          </button>
          <button 
            onClick={() => { window.minimize(); }} 
            className="footer-button"
          >
            Minimize from Frontend
          </button>
          <button 
            onClick={() => { window.maximize(); }} 
            className="footer-button"
          >
            Toggle Maximize
          </button>
          <button 
            onClick={() => { window.close(); }} 
            className="footer-button"
          >
            Close
          </button>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;