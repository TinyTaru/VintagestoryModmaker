import React, { useState } from 'react';

const RecipeGenerator = () => {
  const [recipeData, setRecipeData] = useState({
    enabled: true,
    ingredientPattern: '',
    ingredients: {},
    width: 3,
    height: 3,
    output: {
      type: 'item',
      code: '',
      quantity: 1
    },
    shapeless: false,
    recipeGroup: 0
  });
  
  const [showOutput, setShowOutput] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('1');
  const [ingredientCode, setIngredientCode] = useState('');
  const [ingredientType, setIngredientType] = useState('item');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setRecipeData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOutputChange = (e) => {
    const { name, value } = e.target;
    setRecipeData(prev => ({
      ...prev,
      output: {
        ...prev.output,
        [name]: name === 'quantity' ? parseInt(value, 10) || 1 : value
      }
    }));
  };

  const addIngredient = () => {
    if (!ingredientCode.trim() || !activeIngredient) return;
    
    setRecipeData(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        [activeIngredient]: {
          type: ingredientType,
          code: ingredientCode.trim(),
          name: `ingredient-${activeIngredient}`
        }
      }
    }));
    
    setIngredientCode('');
  };

  const removeIngredient = (key) => {
    const newIngredients = { ...recipeData.ingredients };
    delete newIngredients[key];
    
    setRecipeData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const generateJson = () => {
    const recipeDataCopy = JSON.parse(JSON.stringify(recipeData));
    
    // Clean up the data
    if (recipeDataCopy.enabled === true) {
      delete recipeDataCopy.enabled;
    }
    
    if (recipeDataCopy.recipeGroup === 0) {
      delete recipeDataCopy.recipeGroup;
    }
    
    // Format ingredients
    Object.keys(recipeDataCopy.ingredients).forEach(key => {
      const ing = recipeDataCopy.ingredients[key];
      if (ing.type === 'item') {
        delete ing.type;
      }
      delete ing.name;
    });
    
    // Format output
    if (recipeDataCopy.output.type === 'item') {
      delete recipeDataCopy.output.type;
    }
    
    setJsonOutput(JSON.stringify(recipeDataCopy, null, 2));
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
    <div className="generator-container">
      <h2>Recipe Generator</h2>
      
      <div className="form-section">
        <h3>Recipe Pattern</h3>
        <div className="form-group">
          <label>Pattern (e.g., "AAA A A"):</label>
          <input
            type="text"
            name="ingredientPattern"
            value={recipeData.ingredientPattern}
            onChange={handleInputChange}
            placeholder="Enter pattern (e.g., 'AAA A A' for a T shape)"
          />
          <small className="hint">Use letters to represent ingredients in the grid</small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Grid Width:</label>
            <select
              name="width"
              value={recipeData.width}
              onChange={handleInputChange}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Grid Height:</label>
            <select
              name="height"
              value={recipeData.height}
              onChange={handleInputChange}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="shapeless"
              checked={recipeData.shapeless}
              onChange={handleInputChange}
            />
            Shapeless Recipe
          </label>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Ingredients</h3>
        <div className="form-group">
          <label>Select Position:</label>
          <select
            value={activeIngredient}
            onChange={(e) => setActiveIngredient(e.target.value)}
          >
            {Array.from({ length: recipeData.width * recipeData.height }, (_, i) => (
              <option key={i + 1} value={String.fromCharCode(65 + i)}>
                {String.fromCharCode(65 + i)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Ingredient Type:</label>
          <select
            value={ingredientType}
            onChange={(e) => setIngredientType(e.target.value)}
          >
            <option value="item">Item</option>
            <option value="block">Block</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Ingredient Code:</label>
          <div className="input-with-button">
            <input
              type="text"
              value={ingredientCode}
              onChange={(e) => setIngredientCode(e.target.value)}
              placeholder="game:ingot-copper"
            />
            <button onClick={addIngredient} className="small-button">Add</button>
          </div>
          <small className="hint">Format: domain:itemid (e.g., game:ingot-copper)</small>
        </div>
        
        <div className="ingredients-list">
          <h4>Current Ingredients:</h4>
          {Object.keys(recipeData.ingredients).length > 0 ? (
            <ul>
              {Object.entries(recipeData.ingredients).map(([key, ing]) => (
                <li key={key}>
                  <span className="ingredient-key">{key}:</span> {ing.code}
                  <button 
                    onClick={() => removeIngredient(key)}
                    className="small-button danger"
                    title="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ingredients added yet</p>
          )}
        </div>
      </div>
      
      <div className="form-section">
        <h3>Output</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select
              name="type"
              value={recipeData.output.type}
              onChange={handleOutputChange}
            >
              <option value="item">Item</option>
              <option value="block">Block</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Code:</label>
            <input
              type="text"
              name="code"
              value={recipeData.output.code}
              onChange={handleOutputChange}
              placeholder="game:ingot-copper"
            />
          </div>
          
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={recipeData.output.quantity}
              onChange={handleOutputChange}
              min="1"
              max="64"
            />
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button onClick={generateJson} className="generate-button">
          Generate JSON
        </button>
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

export default RecipeGenerator;
