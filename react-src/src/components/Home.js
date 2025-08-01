import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Vintage Story Mod Maker</h1>
      <p>Easily create JSON files for your Vintage Story mods</p>
      
      <div className="generator-grid">
        <Link to="/modinfo-generator" className="generator-card">
          <span className="generator-icon">📄</span>
          <h3>ModInfo Generator</h3>
          <p>Create a modinfo.json file for your mod</p>
        </Link>
        
        <Link to="/item-generator" className="generator-card">
          <span className="generator-icon">🛠️</span>
          <h3>Item Generator</h3>
          <p>Create item JSON files for your mod</p>
        </Link>
        
        <Link to="/block-generator" className="generator-card">
          <span className="generator-icon">🧱</span>
          <h3>Block Generator</h3>
          <p>Create block JSON files for your mod</p>
        </Link>
        
        <Link to="/recipe-generator" className="generator-card">
          <span className="generator-icon">📝</span>
          <h3>Recipe Generator</h3>
          <p>Create grid recipe JSON files for your mod</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
