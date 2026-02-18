import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewModWizard = () => {
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
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModInfo({
      ...modInfo,
      [name]: value
    });
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

  const handleDependencyChange = (key, value) => {
    const newDependencies = { ...modInfo.dependencies };
    if (value === '') {
      delete newDependencies[key];
    } else {
      newDependencies[key] = value;
    }
    setModInfo({
      ...modInfo,
      dependencies: newDependencies
    });
  };

  const addDependency = () => {
    const modId = prompt('Enter mod ID (e.g., game, survival, etc.):');
    if (modId) {
      const version = prompt('Enter required version (e.g., 1.0.0 or * for any):', '*');
      if (version !== null) {
        handleDependencyChange(modId, version);
      }
    }
  };

  const removeDependency = (modId) => {
    const newDependencies = { ...modInfo.dependencies };
    delete newDependencies[modId];
    setModInfo({
      ...modInfo,
      dependencies: newDependencies
    });
  };

  // Handle mod creation
  const createMod = () => {
    if (!modInfo.modid || !modInfo.name) {
      alert('Please fill in all required fields (Mod ID and Name)');
      return;
    }

    setIsCreating(true);
    setCreationStatus('Waiting for directory selection...');

    // Ask backend to open directory picker via Neutralino events
    const directoryListener = (evt) => {
      Neutralino.events.off('directorySelected', directoryListener);

      if (evt.detail?.canceled) {
        setCreationStatus('Mod creation cancelled');
        setIsCreating(false);
        return;
      }

      const targetPath = evt.detail.path;
      setCreationStatus('Creating mod files...');

      const modCreatedListener = (e) => {
        Neutralino.events.off('modCreated', modCreatedListener);
        setIsCreating(false);

        if (e.detail?.success) {
          setCreationStatus(`Mod created successfully at: ${e.detail.path}`);
          setTimeout(() => {
            setModInfo({
              ...defaultModInfo,
              version: '1.0.0',
              side: 'Universal',
              type: 'code'
            });
            navigate('/');
          }, 2000);
        } else {
          setCreationStatus(`Error: ${e.detail?.message || 'Failed to create mod'}`);
        }
      };

      Neutralino.events.on('modCreated', modCreatedListener);
      Neutralino.events.emit('createMod', {
        modInfo: {
          ...modInfo,
          authors: modInfo.authors?.length ? modInfo.authors : ['Your Name']
        },
        targetDirectory: targetPath
      });
    };

    Neutralino.events.on('directorySelected', directoryListener);
    Neutralino.events.emit('openDirectoryDialog', { defaultPath: modInfo.modid });
  };
        setCreationStatus('Mod creation cancelled');
        setIsCreating(false);
        return;
      }

      setCreationStatus('Creating mod files...');
      
      // Call the backend function to create the mod
      const { createMod } = await import('../../server');
      const creationResult = await createMod({
        modInfo: {
          ...modInfo,
          authors: modInfo.authors?.length ? modInfo.authors : ['Your Name']
        },
        targetDirectory: result.path
      });
      
      if (creationResult.success) {
        setCreationStatus(`Mod created successfully at: ${creationResult.path}`);
        
        // Reset form after successful creation
        setTimeout(() => {
          setModInfo({
            ...defaultModInfo,
            version: '1.0.0',
            side: 'Universal',
            type: 'code'
          });
          navigate('/'); // Navigate back to home after successful creation
        }, 2000);
      } else {
        throw new Error(creationResult.message || 'Failed to create mod');
      }
      
    // no try/catch needed; errors communicated via events

      console.error('Error in mod creation:', error);
      setCreationStatus(`Error: ${error.message}`);
      // Event flow will handle state updates
  };
      setIsCreating(false);
    }
  };

  return (
    <div className="generator-container">
      <h2>Create New Mod</h2>
      <p>Fill in the details below to create a new Vintage Story mod.</p>
      
      <div className="form-group">
        <label>Mod ID* (must be unique, no spaces or special characters)</label>
        <input
          type="text"
          name="modid"
          value={modInfo.modid}
          onChange={handleInputChange}
          placeholder="myfirstmod"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Mod Name*</label>
        <input
          type="text"
          name="name"
          value={modInfo.name}
          onChange={handleInputChange}
          placeholder="My First Mod"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={modInfo.description}
          onChange={handleInputChange}
          placeholder="A short description of your mod"
          className="form-control"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Version</label>
        <input
          type="text"
          name="version"
          value={modInfo.version}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Authors</label>
        {modInfo.authors.map((author, index) => (
          <div key={index} className="input-group mb-2">
            <input
              type="text"
              value={author}
              onChange={(e) => handleAuthorChange(index, e.target.value)}
              className="form-control"
              placeholder="Author name"
            />
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => removeAuthor(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={addAuthor}
        >
          Add Author
        </button>
      </div>

      <div className="form-group">
        <label>Dependencies</label>
        {Object.entries(modInfo.dependencies).map(([modId, version]) => (
          <div key={modId} className="input-group mb-2">
            <span className="input-group-text">{modId}</span>
            <input
              type="text"
              value={version}
              onChange={(e) => handleDependencyChange(modId, e.target.value)}
              className="form-control"
            />
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => removeDependency(modId)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={addDependency}
        >
          Add Dependency
        </button>
      </div>

      <div className="form-group">
        <label>Side</label>
        <select
          name="side"
          value={modInfo.side}
          onChange={handleInputChange}
          className="form-control"
        >
          <option value="Universal">Universal (both client and server)</option>
          <option value="Client">Client only</option>
          <option value="Server">Server only</option>
        </select>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={createMod}
          disabled={isCreating}
        >
          {isCreating ? 'Creating Mod...' : 'Create Mod'}
        </button>
      </div>

      {creationStatus && (
        <div className={`alert ${creationStatus.startsWith('Error') ? 'alert-danger' : 'alert-success'} mt-3`}>
          {creationStatus}
        </div>
      )}
    </div>
  );
};

export default NewModWizard;
