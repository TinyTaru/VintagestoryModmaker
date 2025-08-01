import React, { useState, useCallback, useRef, useEffect } from 'react';

// Grid cell component
const GridCell = ({ x, y, item, onDrop, onClick }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
    onDrop(x, y, itemData);
  };

  return (
    <div
      className="grid-cell"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onClick(x, y)}
    >
      {item && (
        <div className="ingredient-item" draggable onDragStart={(e) => {
          e.dataTransfer.setData('application/json', JSON.stringify(item));
          e.dataTransfer.effectAllowed = 'move';
        }}>
          {item.code.split(':').pop()}
          <button 
            className="remove-ingredient"
            onClick={(e) => {
              e.stopPropagation();
              onDrop(x, y, null);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

// Ingredient item component
const IngredientItem = ({ item, onSelect, isSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`ingredient-item ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onSelect(item)}
    >
      {item.code.split(':').pop()}
    </div>
  );
};

// Main component
const RecipeGeneratorV2 = () => {
  const [grid, setGrid] = useState(Array(3).fill().map(() => Array(3).fill(null)));
  const [ingredients, setIngredients] = useState([
    { id: '1', code: 'game:ingot-copper', type: 'item' },
    { id: '2', code: 'game:ingot-tin', type: 'item' },
    { id: '3', code: 'game:plank-oak', type: 'item' },
    { id: '4', code: 'game:stick', type: 'item' },
  ]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [output, setOutput] = useState({ code: '', quantity: 1, type: 'item' });
  const [shapeless, setShapeless] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [newIngredient, setNewIngredient] = useState('');

  const handleDrop = useCallback((x, y, item) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = item ? { ...item, id: `${x}-${y}-${Date.now()}` } : null;
      return newGrid;
    });
  }, []);

  const handleCellClick = useCallback((x, y) => {
    if (selectedIngredient) {
      handleDrop(x, y, { ...selectedIngredient });
    } else {
      handleDrop(x, y, null);
    }
  }, [selectedIngredient, handleDrop]);

  const addIngredient = () => {
    if (!newIngredient.trim()) return;
    
    const code = newIngredient.trim();
    const id = `ingredient-${Date.now()}`;
    const newItem = { id, code, type: 'item' };
    
    setIngredients(prev => [...prev, newItem]);
    setNewIngredient('');
    setSelectedIngredient(newItem);
  };

  const generateJson = () => {
    // Flatten the grid and create pattern
    let pattern = '';
    const usedIngredients = {};
    let nextCharCode = 65; // Start with 'A'
    
    const charMap = {};
    
    // First pass: assign characters to ingredients
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const item = grid[y][x];
        if (item && !charMap[item.code]) {
          charMap[item.code] = String.fromCharCode(nextCharCode++);
        }
      }
    }
    
    // Second pass: build pattern
    for (let y = 0; y < grid.length; y++) {
      let row = '';
      for (let x = 0; x < grid[y].length; x++) {
        const item = grid[y][x];
        row += item ? charMap[item.code] : ' ';
      }
      pattern += (pattern ? '|' : '') + row;
    }
    
    // Create ingredients object
    const ingredientsObj = {};
    Object.entries(charMap).forEach(([code, char]) => {
      ingredientsObj[char] = { type: 'item', code };
    });
    
    // Create the recipe object
    const recipe = {
      ingredientPattern: pattern,
      ingredients: ingredientsObj,
      width: grid[0].length,
      height: grid.length,
      output: {
        type: output.type,
        code: output.code,
        quantity: output.quantity
      },
      shapeless
    };
    
    // Clean up the recipe object
    if (shapeless) {
      delete recipe.ingredientPattern;
      recipe.shapeless = true;
    }
    
    setJsonOutput(JSON.stringify(recipe, null, 2));
    setShowOutput(true);
  };

  const downloadJson = () => {
    const element = document.createElement('a');
    const file = new Blob([jsonOutput], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'recipe.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
  };

  return (
    <div className="recipe-generator">
      <div className="recipe-container">
        <div className="recipe-grid">
          {grid.map((row, y) => (
            <div key={y} className="grid-row">
              {row.map((cell, x) => (
                <GridCell
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  item={cell}
                  onDrop={handleDrop}
                  onClick={handleCellClick}
                />
              ))}
            </div>
          ))}
        </div>
        
        <div className="recipe-controls">
          <div className="ingredients-panel">
            <h3>Ingredients</h3>
            <div className="ingredients-list">
              {ingredients.map((ingredient) => (
                <IngredientItem
                  key={ingredient.id}
                  item={ingredient}
                  onSelect={setSelectedIngredient}
                  isSelected={selectedIngredient?.id === ingredient.id}
                />
              ))}
            </div>
            
            <div className="add-ingredient">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="game:ingot-copper"
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
              />
              <button onClick={addIngredient}>Add</button>
            </div>
          </div>
          
          <div className="output-settings">
            <h3>Output</h3>
            <div className="form-group">
              <label>Item Code:</label>
              <input
                type="text"
                value={output.code}
                onChange={(e) => setOutput({...output, code: e.target.value})}
                placeholder="game:ingot-copper"
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max="64"
                value={output.quantity}
                onChange={(e) => setOutput({...output, quantity: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={shapeless}
                  onChange={(e) => setShapeless(e.target.checked)}
                />
                Shapeless Recipe
              </label>
            </div>
            
            <button className="generate-button" onClick={generateJson}>
              Generate JSON
            </button>
          </div>
        </div>
      </div>
      
      {showOutput && (
        <div className="output-section">
          <div className="output-actions">
            <h3>Generated JSON</h3>
            <div>
              <button onClick={copyToClipboard} className="small-button">
                Copy to Clipboard
              </button>
              <button onClick={downloadJson} className="small-button">
                Download JSON
              </button>
            </div>
          </div>
          <pre className="json-output">
            {jsonOutput}
          </pre>
        </div>
      )}
    </div>
  );
};

// Export the component
export default RecipeGeneratorV2;
