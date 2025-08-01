import React, { useState, useRef, useEffect } from 'react';

const BlockGenerator = () => {
  const [blockData, setBlockData] = useState({
    code: '',
    class: 'Block',
    shape: {
      base: 'block/basic/cube'
    },
    textures: {
      all: ''
    },
    creativeinventory: {
      general: ['*']
    },
    blockmaterial: 'Stone',
    resistance: 3.5,
    sounds: {
      place: 'game:block/stone',
      break: 'game:block/stone',
      walk: 'game:walk/stone'
    },
    drop: {
      type: 'block',
      code: ''
    },
    lightlevel: 0,
    lighthsv: [0, 0, 255],
    requirestooltier: 0
  });

  const [showOutput, setShowOutput] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const shapeDropdownRef = useRef(null);

  // Common shape paths for the dropdown
  const commonShapes = [
    { value: 'block/basic/cube', label: 'Basic Cube' },
    { value: 'block/stairs/stone', label: 'Stairs' },
    { value: 'block/slab/stone', label: 'Slab' },
    { value: 'block/wall/stone', label: 'Wall' },
    { value: 'block/fence/wood', label: 'Fence' },
    { value: 'block/door/wood', label: 'Door' },
    { value: 'block/trapdoor/wood', label: 'Trapdoor' },
    { value: 'block/button/wood', label: 'Button' },
    { value: 'block/lever/wood', label: 'Lever' },
    { value: 'block/torch', label: 'Torch' },
    { value: 'block/ladder', label: 'Ladder' },
    { value: 'block/chest', label: 'Chest' },
    { value: 'block/furnace', label: 'Furnace' },
    { value: 'block/craftingtable', label: 'Crafting Table' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (shapeDropdownRef.current && !shapeDropdownRef.current.contains(event.target)) {
        setShowShapeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle nested properties with dot notation (e.g., 'sounds.place')
    if (name.includes('.')) {
      const path = name.split('.');
      
      // Special handling for lighthsv array (e.g., 'lighthsv.0')
      if (path[0] === 'lighthsv' && path.length === 2) {
        const index = parseInt(path[1], 10);
        if (!isNaN(index)) {
          setBlockData(prev => {
            const newHsv = [...prev.lighthsv];
            newHsv[index] = type === 'number' ? parseFloat(value) || 0 : value;
            return {
              ...prev,
              lighthsv: newHsv
            };
          });
          return;
        }
      }
      
      // Handle other nested properties (e.g., 'sounds.place')
      setBlockData(prev => ({
        ...prev,
        [path[0]]: {
          ...prev[path[0]],
          [path[1]]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      // Handle top-level properties
      setBlockData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleShapeSelect = (shapePath) => {
    setBlockData(prev => ({
      ...prev,
      shape: {
        base: shapePath
      }
    }));
    setShowShapeDropdown(false);
  };

  const generateJson = () => {
    const blockDataCopy = JSON.parse(JSON.stringify(blockData));
    
    // Clean up the data
    if (blockDataCopy.lightlevel === 0) {
      delete blockDataCopy.lighthsv;
    } else if (blockDataCopy.lighthsv) {
      // Ensure light color is valid (h: 0-360, s: 0-255, v: 0-255)
      blockDataCopy.lighthsv = blockDataCopy.lighthsv.map((val, i) => {
        if (i === 0) return Math.max(0, Math.min(360, val)); // Hue: 0-360
        return Math.max(0, Math.min(255, val)); // Saturation and Value: 0-255
      });
    }
    
    if (blockDataCopy.drop.code === '') {
      delete blockDataCopy.drop;
    }
    
    // Remove empty arrays and objects
    Object.keys(blockDataCopy).forEach(key => {
      if (Array.isArray(blockDataCopy[key]) && blockDataCopy[key].length === 0) {
        delete blockDataCopy[key];
      } else if (typeof blockDataCopy[key] === 'object' && blockDataCopy[key] !== null) {
        if (Object.keys(blockDataCopy[key]).length === 0) {
          delete blockDataCopy[key];
        } else {
          // Clean nested objects
          Object.keys(blockDataCopy[key]).forEach(subKey => {
            if (blockDataCopy[key][subKey] === '' || blockDataCopy[key][subKey] === null) {
              delete blockDataCopy[key][subKey];
            }
          });
        }
      }
    });
    
    setJsonOutput(JSON.stringify(blockDataCopy, null, 2));
    setShowOutput(true);
  };

  const downloadJson = () => {
    const element = document.createElement('a');
    const file = new Blob([jsonOutput], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'block.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="block-generator">
      <h2>Vintage Story Block Generator</h2>
      
      <div className="form-section">
        <h3>Basic Properties</h3>
        <div className="form-group">
          <label>Block Code:</label>
          <input
            type="text"
            name="code"
            value={blockData.code}
            onChange={handleInputChange}
            placeholder="myblock"
          />
        </div>
        
        <div className="form-group">
          <label>Base Texture Path:</label>
          <input
            type="text"
            name="textures.all"
            value={blockData.textures.all}
            onChange={handleInputChange}
            placeholder="block/stone/granite"
          />
        </div>
        
        <div className="form-group">
          <label>Shape:</label>
          <div className="shape-input" ref={shapeDropdownRef}>
            <input
              type="text"
              value={blockData.shape.base}
              onChange={(e) => handleShapeSelect(e.target.value)}
              onFocus={() => setShowShapeDropdown(true)}
              placeholder="block/basic/cube"
            />
            <button 
              type="button" 
              className="dropdown-button"
              onClick={() => setShowShapeDropdown(!showShapeDropdown)}
            >
              ▼
            </button>
            {showShapeDropdown && (
              <div className="dropdown-menu">
                {commonShapes.map((shape, index) => (
                  <div 
                    key={index} 
                    className="dropdown-item"
                    onClick={() => handleShapeSelect(shape.value)}
                  >
                    {shape.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Block Material:</label>
          <select
            name="blockmaterial"
            value={blockData.blockmaterial}
            onChange={handleInputChange}
          >
            <option value="Air">Air</option>
            <option value="Liquid">Liquid</option>
            <option value="Lava">Lava</option>
            <option value="Snow">Snow</option>
            <option value="Ice">Ice</option>
            <option value="Leaves">Leaves</option>
            <option value="Wood">Wood</option>
            <option value="Stone">Stone</option>
            <option value="Soil">Soil</option>
            <option value="Sand">Sand</option>
            <option value="Gravel">Gravel</option>
            <option value="Ore">Ore</option>
            <option value="Metal">Metal</option>
            <option value="Plant">Plant</option>
            <option value="Cloth">Cloth</option>
            <option value="Liquid">Liquid</option>
            <option value="Fire">Fire</option>
            <option value="Glass">Glass</option>
            <option value="Ceramic">Ceramic</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Resistance:</label>
          <input
            type="number"
            name="resistance"
            value={blockData.resistance}
            onChange={handleInputChange}
            step="0.1"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label>Light Level (0-31):</label>
          <input
            type="number"
            name="lightlevel"
            value={blockData.lightlevel}
            onChange={handleInputChange}
            min="0"
            max="31"
          />
          <small className="hint">Set to 0 for no light emission</small>
        </div>
        
        {blockData.lightlevel > 0 && (
          <div className="form-section">
            <h3>Light Color (HSV)</h3>
            <div className="form-group">
              <label>Hue (0-360):</label>
              <input
                type="number"
                name="lighthsv.0"
                value={blockData.lighthsv[0]}
                onChange={handleInputChange}
                min="0"
                max="360"
              />
              <small className="hint">0=Red, 120=Green, 240=Blue</small>
            </div>
            <div className="form-group">
              <label>Saturation (0-255):</label>
              <input
                type="number"
                name="lighthsv.1"
                value={blockData.lighthsv[1]}
                onChange={handleInputChange}
                min="0"
                max="255"
              />
              <small className="hint">0=Grayscale, 255=Full color</small>
            </div>
            <div className="form-group">
              <label>Value (0-255):</label>
              <input
                type="number"
                name="lighthsv.2"
                value={blockData.lighthsv[2]}
                onChange={handleInputChange}
                min="0"
                max="255"
              />
              <small className="hint">0=Dark, 255=Full brightness</small>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <div 
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: `hsl(${blockData.lighthsv[0]}, ${(blockData.lighthsv[1] / 255) * 100}%, ${(blockData.lighthsv[2] / 255) * 100}%)`,
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)'
                }}
              ></div>
              <small className="hint">Preview (approximate color)</small>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label>Requires Tool Tier (0-7):</label>
          <input
            type="number"
            name="requirestooltier"
            value={blockData.requirestooltier}
            onChange={handleInputChange}
            min="0"
            max="7"
          />
          <small className="hint">0 = any tool, 1-7 = requires specific tool tier</small>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Sound Properties</h3>
        <div className="form-group">
          <label>Place Sound:</label>
          <input
            type="text"
            name="sounds.place"
            value={blockData.sounds.place}
            onChange={handleInputChange}
            placeholder="game:block/stone"
          />
        </div>
        
        <div className="form-group">
          <label>Break Sound:</label>
          <input
            type="text"
            name="sounds.break"
            value={blockData.sounds.break}
            onChange={handleInputChange}
            placeholder="game:block/stone"
          />
        </div>
        
        <div className="form-group">
          <label>Walk Sound:</label>
          <input
            type="text"
            name="sounds.walk"
            value={blockData.sounds.walk}
            onChange={handleInputChange}
            placeholder="game:walk/stone"
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Drop Properties</h3>
        <div className="form-group">
          <label>Drop Type:</label>
          <select
            name="drop.type"
            value={blockData.drop?.type || 'block'}
            onChange={handleInputChange}
          >
            <option value="block">Block</option>
            <option value="item">Item</option>
            <option value="nothing">Nothing</option>
          </select>
        </div>
        
        {blockData.drop?.type !== 'nothing' && (
          <div className="form-group">
            <label>Drop Code (leave empty for self):</label>
            <input
              type="text"
              name="drop.code"
              value={blockData.drop?.code || ''}
              onChange={handleInputChange}
              placeholder="game:plank-oak"
            />
          </div>
        )}
      </div>
      
      <div className="form-actions">
        <button onClick={generateJson} className="generate-button">
          Generate JSON
        </button>
      </div>

      {showOutput && (
        <div className="json-output">
          <h3>Generated Block JSON</h3>
          <pre>{jsonOutput}</pre>
          <div className="json-actions">
            <button onClick={downloadJson} className="download-button">
              Download JSON
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(jsonOutput)}
              className="copy-button"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockGenerator;
