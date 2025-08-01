import React, { useState, useRef, useEffect } from 'react';

const ItemGenerator = () => {
  const [itemData, setItemData] = useState({
    code: '',
    class: 'Item',
    texture: {
      base: ''
    },
    shape: {
      base: ''
    },
    creativeinventory: {
      general: ['*']
    },
    maxstacksize: 64,
    materialDensity: 300,  // Default to a more reasonable density
    nutritionProps: {
      satiety: 80,        // Integer value, higher means longer lasting
      nutrition: { fruit: 0.5 },  // Nutrition values (0-1) per food category
      health: 0,          // How much health is restored (0 = none)
      eatingTime: 32,     // Time in ticks to eat the food (20 ticks = 1 second)
      foodCategory: 'fruit',  // Lower-case category affects eating animation and sound
      eatingSound: 'sounds/player/eat',  // Sound played when eating
      eatingAnimation: 'eat',  // Animation to play when eating
      eatingAnimationEnd: 'eatend',  // Animation to play when done eating
      effects: []  // Effects when eaten
    },
    combustibleProps: null,  // Will be populated if the item is fuel
    tags: []
  });

  const [showOutput, setShowOutput] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [isFood, setIsFood] = useState(false);  // UI state for food toggle
  const shapeDropdownRef = useRef(null);

  // Common shape paths for the dropdown
  const commonShapes = [
    { value: '', label: '-- Select a common shape --' },
    { value: 'item/basic/cube', label: 'Basic Cube' },
    { value: 'item/tool/pickaxe/head', label: 'Pickaxe Head' },
    { value: 'item/tool/axe/head', label: 'Axe Head' },
    { value: 'item/tool/shovel/head', label: 'Shovel Head' },
    { value: 'item/tool/sword/blade', label: 'Sword Blade' },
    { value: 'item/tool/hammer/head', label: 'Hammer Head' },
    { value: 'item/tool/prospectingpick/head', label: 'Prospecting Pick Head' },
    { value: 'item/weapon/spear/head', label: 'Spear Head' },
    { value: 'item/ingot', label: 'Ingot' },
    { value: 'item/plate', label: 'Plate' },
    { value: 'item/gear', label: 'Gear' },
    { value: 'item/food/fruit/blackcurrant', label: 'Berry' },
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

  // Toggle food properties
  const toggleFood = (isFoodChecked) => {
    setIsFood(isFoodChecked);
    if (isFoodChecked) {
      // If checking food, set class to ItemFood and initialize food properties
      setItemData(prev => ({
        ...prev,
        class: 'ItemFood',
        nutritionProps: {
          ...prev.nutritionProps,
          nutrition: { fruit: 0.5 },
          satiety: 80,
          health: 0,
          eatingTime: 32,
          foodCategory: 'fruit',
          eatingSound: 'sounds/player/eat',
          eatingAnimation: 'eat',
          eatingAnimationEnd: 'eatend',
          effects: []
        }
      }));
    } else {
      // If unchecking food, set class back to Item
      setItemData(prev => ({
        ...prev,
        class: 'Item'
      }));
    }
  };

  const handleShapeSelect = (shapePath) => {
    setItemData(prev => ({
      ...prev,
      shape: {
        base: shapePath
      }
    }));
    setShowShapeDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setItemData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setItemData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setItemData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const updateNestedState = (obj, path, value) => {
    const keys = path.split('.');
    const newObj = { ...obj };
    let current = newObj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = { ...current[key] };
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    
    return newObj;
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
  };

  const handleArrayChange = (e, path, index) => {
    const { value } = e.target;
    setItemData(prev => {
      const array = getNestedValue(prev, path);
      const newArray = [...array];
      newArray[index] = value;
      return updateNestedState(prev, path, newArray);
    });
  };

  const addToArray = (path, defaultValue = '') => {
    setItemData(prev => {
      const array = getNestedValue(prev, path);
      return updateNestedState(prev, path, [...array, defaultValue]);
    });
  };

  const removeFromArray = (path, index) => {
    setItemData(prev => {
      const array = getNestedValue(prev, path);
      return updateNestedState(prev, path, array.filter((_, i) => i !== index));
    });
  };

  const generateJson = () => {
    console.log('Generate JSON button clicked');
    // Create a deep copy of itemData to avoid mutating the state directly
    const itemDataCopy = JSON.parse(JSON.stringify(itemData));
    
    // Remove baseShape if it exists (we use shape.base instead)
    if ('baseShape' in itemDataCopy) {
      delete itemDataCopy.baseShape;
    }
    
    console.log('Initial itemDataCopy:', itemDataCopy);
    
    // Ensure shape is properly formatted with base property
    if (itemDataCopy.shape && (!itemDataCopy.shape.base || itemDataCopy.shape.base === '')) {
      delete itemDataCopy.shape;
    } else if (itemDataCopy.shape) {
      // Ensure shape is always wrapped in a shape object with a base property
      itemDataCopy.shape = { base: itemDataCopy.shape.base };
    }
    
    // Handle food item specific properties
    if (itemDataCopy.class !== 'ItemFood') {
      delete itemDataCopy.nutritionProps;
    } else if (itemDataCopy.nutritionProps) {
      // Ensure satiety is an integer
      if (itemDataCopy.nutritionProps.satiety !== undefined) {
        itemDataCopy.nutritionProps.satiety = parseInt(itemDataCopy.nutritionProps.satiety, 10);
      }
    }
    
    // Remove empty shape base if not set
    if (itemDataCopy.shape && !itemDataCopy.shape.base) {
      delete itemDataCopy.shape;
    }
    
    // Remove empty arrays
    Object.keys(itemDataCopy).forEach(key => {
      if (Array.isArray(itemDataCopy[key]) && itemDataCopy[key].length === 0) {
        delete itemDataCopy[key];
      }
    });
    
    // Remove empty objects
    Object.keys(itemDataCopy).forEach(key => {
      if (typeof itemDataCopy[key] === 'object' && 
          itemDataCopy[key] !== null && 
          Object.keys(itemDataCopy[key]).length === 0) {
        delete itemDataCopy[key];
      }
    });
    
    // Convert materialDensity to materialdensity (all lowercase)
    if ('materialDensity' in itemDataCopy) {
      itemDataCopy.materialdensity = itemDataCopy.materialDensity;
      delete itemDataCopy.materialDensity;
    }
    
    // Remove null/undefined values
    Object.keys(itemDataCopy).forEach(key => {
      if (itemDataCopy[key] === null || itemDataCopy[key] === undefined) {
        delete itemDataCopy[key];
      }
    });
    
    setJsonOutput(JSON.stringify(itemDataCopy, null, 2));
    setShowOutput(true);
  };

  const downloadJson = () => {
    const element = document.createElement('a');
    const file = new Blob([jsonOutput], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'item.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="item-generator">
      <h2>Vintage Story Item Generator</h2>
      
      <div className="form-section">
        <h3>Basic Properties</h3>
        <div className="form-group">
          <label>Item Code:</label>
          <input
            type="text"
            name="code"
            value={itemData.code}
            onChange={handleInputChange}
            placeholder="game:ingot-{metal}"
          />
        </div>

        <div className="form-group">
          <label>Class:</label>
          <select
            name="class"
            value={itemData.class}
            onChange={handleInputChange}
          >
            <option value="Item">Item</option>
            <option value="ItemAxe">Axe</option>
            <option value="ItemPickaxe">Pickaxe</option>
            <option value="ItemShovel">Shovel</option>
            <option value="ItemSword">Sword</option>
            <option value="ItemHammer">Hammer</option>
            <option value="ItemProspectingPick">Prospecting Pick</option>
          </select>
        </div>

        <div className="form-group">
          <label>Base Texture Path:</label>
          <input
            type="text"
            name="texture.base"
            value={itemData.texture.base}
            onChange={handleInputChange}
            placeholder="item/ingot/{metal}"
          />
        </div>

        <div className="form-group">
          <label>Base Shape Path:</label>
          <div className="shape-path-input" ref={shapeDropdownRef}>
            <div className="input-with-dropdown">
              <input
                type="text"
                name="baseShape"
                value={itemData.baseShape}
                onChange={handleInputChange}
                onFocus={() => setShowShapeDropdown(true)}
                placeholder="item/basic/cube"
                title="Path to the shape file (e.g., item/basic/cube, item/tool/pickaxe/head, etc.)"
              />
              <button 
                type="button" 
                className="dropdown-toggle"
                onClick={() => setShowShapeDropdown(!showShapeDropdown)}
                title="Show common shapes"
              >
                ▼
              </button>
              {showShapeDropdown && (
                <div className="shape-dropdown">
                  {commonShapes.map((shape, index) => (
                    <div 
                      key={index} 
                      className={`dropdown-item ${!shape.value ? 'dropdown-header' : ''}`}
                      onClick={() => shape.value && handleShapeSelect(shape.value)}
                    >
                      {shape.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Properties</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Max Stack Size:</label>
            <input
              type="number"
              name="maxstacksize"
              value={itemData.maxstacksize}
              onChange={handleInputChange}
              min="1"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Material Density (kg/m³):</label>
            <input
              type="number"
              name="materialDensity"
              value={itemData.materialDensity}
              onChange={handleInputChange}
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Durability:</label>
            <input
              type="number"
              name="durability"
              value={itemData.durability}
              onChange={handleInputChange}
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Attack Power:</label>
            <input
              type="number"
              name="attackpower"
              value={itemData.attackpower}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Creative Inventory</h3>
        <div className="form-group">
          <label>Creative Tabs:</label>
          <div className="array-input">
            {itemData.creativeinventory.general.map((tab, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={tab}
                  onChange={(e) => handleArrayChange(e, 'creativeinventory.general', index)}
                  placeholder="tabname"
                />
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeFromArray('creativeinventory.general', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="add-button"
              onClick={() => addToArray('creativeinventory.general', '*')}
            >
              Add Tab
            </button>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={itemData.class === 'ItemFood'}
              onChange={(e) => {
                const isFood = e.target.checked;
                setItemData(prev => ({
                  ...prev,
                  class: isFood ? 'ItemFood' : 'Item',
                  nutritionProps: {
                    ...prev.nutritionProps,
                    nutrition: isFood ? { fruit: 0.5 } : {}
                  }
                }));
              }}
            />
            Is Food Item
          </label>
        </div>
        
        {itemData.class === 'ItemFood' && (
          <>
            <h3>Food Properties</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nutrition (0-1 per category):</label>
                <div className="nutrition-categories">
                  {Object.entries({
                    'fruit': 'Fruit',
                    'vegetable': 'Vegetable',
                    'protein': 'Protein',
                    'grain': 'Grain',
                    'dairy': 'Dairy',
                    'meat': 'Meat'
                  }).map(([key, label]) => (
                    <div key={key} className="nutrition-category">
                      <label>{label}:</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={itemData.nutritionProps.nutrition?.[key] || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setItemData(prev => ({
                            ...prev,
                            nutritionProps: {
                              ...prev.nutritionProps,
                              nutrition: {
                                ...prev.nutritionProps.nutrition,
                                [key]: value
                              }
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Satiety (higher = lasts longer):</label>
                <input
                  type="number"
                  name="nutritionProps.satiety"
                  value={itemData.nutritionProps.satiety}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  placeholder="80"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Health Restored (half-hearts):</label>
                <input
                  type="number"
                  value={itemData.nutritionProps.health || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setItemData(prev => ({
                      ...prev,
                      nutritionProps: {
                        ...prev.nutritionProps,
                        health: value
                      }
                    }));
                  }}
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Eating Time (ticks, 20 = 1 second):</label>
                <input
                  type="number"
                  value={itemData.nutritionProps.eatingTime || 32}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 32;
                    setItemData(prev => ({
                      ...prev,
                      nutritionProps: {
                        ...prev.nutritionProps,
                        eatingTime: value
                      }
                    }));
                  }}
                  min="1"
                  step="1"
                  placeholder="32"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Food Category:</label>
                <select
                  value={itemData.nutritionProps.foodCategory}
                  onChange={(e) => {
                    setItemData(prev => ({
                      ...prev,
                      nutritionProps: {
                        ...prev.nutritionProps,
                        foodCategory: e.target.value
                      }
                    }));
                  }}
                >
                  <option value="fruit">Fruit</option>
                  <option value="vegetable">Vegetable</option>
                  <option value="protein">Protein</option>
                  <option value="grain">Grain</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="soup">Soup</option>
                  <option value="stew">Stew</option>
                  <option value="sweets">Sweets</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>
              <div className="form-group">
                <label>Eating Sound:</label>
                <input
                  type="text"
                  name="nutritionProps.eatingSound"
                  value={itemData.nutritionProps.eatingSound}
                  onChange={handleInputChange}
                  placeholder="sounds/player/eat"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Eating Animation:</label>
                <input
                  type="text"
                  name="nutritionProps.eatingAnimation"
                  value={itemData.nutritionProps.eatingAnimation}
                  onChange={handleInputChange}
                  placeholder="eat"
                />
              </div>
              <div className="form-group">
                <label>End Animation:</label>
                <input
                  type="text"
                  name="nutritionProps.eatingAnimationEnd"
                  value={itemData.nutritionProps.eatingAnimationEnd}
                  onChange={handleInputChange}
                  placeholder="eatend"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h3>Tags</h3>
        <div className="form-group">
          <div className="array-input">
            {itemData.tags.map((tag, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange(e, 'tags', index)}
                  placeholder="tag-name"
                />
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeFromArray('tags', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="add-button"
              onClick={() => addToArray('tags', '')}
            >
              Add Tag
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button onClick={generateJson} className="generate-button">
          Generate JSON
        </button>
      </div>

      {showOutput && (
        <div className="json-output">
          <h3>Generated Item JSON</h3>
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

export default ItemGenerator;
