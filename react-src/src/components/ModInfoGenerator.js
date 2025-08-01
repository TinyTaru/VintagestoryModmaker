import React, { useState } from 'react';

const ModInfoGenerator = () => {
  // Default modinfo structure based on Vintage Story's modinfo.json schema
  const defaultModInfo = {
    type: "code",
    modid: "",
    name: "",
    description: "",
    version: "1.0.0",
    authors: [],
    dependencies: {},
    side: "Universal"
  };

  const [modInfo, setModInfo] = useState(defaultModInfo);
  const [jsonOutput, setJsonOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setModInfo({
        ...modInfo,
        [name]: checked
      });
    } else {
      setModInfo({
        ...modInfo,
        [name]: value
      });
    }
  };

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...modInfo.authors];
    newAuthors[index] = value;
    setModInfo({
      ...modInfo,
      authors: newAuthors
    });
  };

  const addAuthor = () => {
    setModInfo({
      ...modInfo,
      authors: [...modInfo.authors, '']
    });
  };

  const removeAuthor = (index) => {
    const newAuthors = modInfo.authors.filter((_, i) => i !== index);
    setModInfo({
      ...modInfo,
      authors: newAuthors
    });
  };

  const generateJson = () => {
    // Filter out empty authors
    const cleanModInfo = {
      ...modInfo,
      authors: modInfo.authors.filter(author => author.trim() !== '')
    };
    
    setJsonOutput(JSON.stringify(cleanModInfo, null, 2));
    setShowOutput(true);
  };

  const downloadJson = () => {
    const element = document.createElement('a');
    const file = new Blob([jsonOutput], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'modinfo.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modinfo-generator">
      <h2>Vintage Story Modinfo Generator</h2>
      
      <div className="form-group">
        <label>Mod ID:</label>
        <input
          type="text"
          name="modid"
          value={modInfo.modid}
          onChange={handleInputChange}
          placeholder="myawesomemod"
        />
      </div>

      <div className="form-group">
        <label>Mod Name:</label>
        <input
          type="text"
          name="name"
          value={modInfo.name}
          onChange={handleInputChange}
          placeholder="My Awesome Mod"
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={modInfo.description}
          onChange={handleInputChange}
          placeholder="A short description of what your mod does"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Version:</label>
        <input
          type="text"
          name="version"
          value={modInfo.version}
          onChange={handleInputChange}
          placeholder="1.0.0"
        />
      </div>

      <div className="form-group">
        <label>Authors:</label>
        {modInfo.authors.map((author, index) => (
          <div key={index} className="author-input">
            <input
              type="text"
              value={author}
              onChange={(e) => handleAuthorChange(index, e.target.value)}
              placeholder="Author name"
            />
            <button type="button" onClick={() => removeAuthor(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addAuthor}>Add Author</button>
      </div>

      <div className="form-group">
        <label>Mod Type:</label>
        <select
          name="type"
          value={modInfo.type}
          onChange={handleInputChange}
        >
          <option value="code">Code Mod</option>
          <option value="content">Content Pack</option>
          <option value="dlc">DLC</option>
        </select>
      </div>

      <div className="form-group">
        <label>Mod Side:</label>
        <select
          name="side"
          value={modInfo.side}
          onChange={handleInputChange}
        >
          <option value="Universal">Universal (both client and server)</option>
          <option value="Client">Client Only</option>
          <option value="Server">Server Only</option>
        </select>
      </div>

      <div className="button-group">
        <button onClick={generateJson}>Generate JSON</button>
        {showOutput && (
          <button onClick={downloadJson}>Download modinfo.json</button>
        )}
      </div>

      {showOutput && (
        <div className="json-output">
          <h3>Generated modinfo.json:</h3>
          <pre>{jsonOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default ModInfoGenerator;
