// Type definitions for mod info
interface ModInfo {
  modid: string;
  name: string;
  description?: string;
  version: string;
  authors: string[];
  dependencies?: Record<string, string>;
  side?: string;
  type?: string;
  [key: string]: any;
}

interface CreateModResult {
  success: boolean;
  path?: string;
  message: string;
}

interface DirectoryDialogResult {
  canceled?: boolean;
  error?: boolean;
  path?: string;
  name?: string;
  message?: string;
}

// This file is for the Neutralino backend functionality
// It will be bundled with the Neutralino app

// This function will be called from the frontend to create a new mod
export async function createMod({ modInfo, targetDirectory }: { modInfo: ModInfo; targetDirectory: string }): Promise<CreateModResult> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    const targetDir = path.join(targetDirectory, modInfo.modid);
    console.log(`Creating mod in directory: ${targetDir}`);
    
    // Ensure the target directory exists
    await fs.mkdir(targetDir, { recursive: true });
    
    // Create modinfo.json
    const modInfoPath = path.join(targetDir, 'modinfo.json');
    await fs.writeFile(modInfoPath, JSON.stringify(modInfo, null, 2), 'utf8');
    
    // Create assets directory structure
    const assetsDir = path.join(targetDir, 'assets', modInfo.modid);
    await fs.mkdir(assetsDir, { recursive: true });
    
    // Create subdirectories for different asset types
    const assetDirs = [
      'blocktypes',
      'itemtypes',
      'recipes/grid',
      'patches',
      'textures',
      'shaders'
    ];
    
    for (const dir of assetDirs) {
      const fullPath = path.join(assetsDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
    
    // Create a README.md file
    const readmeContent = `# ${modInfo.name}

${modInfo.description || 'A mod for Vintage Story.'}

## Installation
1. Place this folder in your Vintage Story mods folder
2. Launch the game

## Features
- Add your mod features here

## Dependencies
${Object.entries(modInfo.dependencies || {}).map(([mod, version]) => `- ${mod}: ${version}`).join('\n') || 'None'}
`;
    
    await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent, 'utf8');
    
    return {
      success: true,
      path: targetDir,
      message: 'Mod created successfully!'
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error creating mod:', errorMessage);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// This function will be called from the frontend to open a directory dialog
export async function openDirectoryDialog({ defaultPath = 'my_mod' } = {}): Promise<DirectoryDialogResult> {
  try {
    // Use the global Neutralino object for dialogs
    // @ts-ignore - Neutralino is available in the global scope at runtime
    const result = await Neutralino.os.showDialog('Select Mod Folder', {
      isDirectorySelected: true,
      defaultPath
    });
    
    if (!result || !result.file || result.file.length === 0) {
      // User cancelled the dialog
      return { canceled: true };
    } else {
      // User selected a directory
      const path = await import('path');
      const filePath = result.file[0];
      return {
        path: path.dirname(filePath),
        name: path.basename(filePath)
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error opening directory dialog:', errorMessage);
    
    return {
      error: true,
      message: errorMessage
    };
  }
}
// -----------------------------------------------------------------------------
// Keep the Node process alive when Neutralino CLI launches this script in dev
// mode.  Without it, the script exits immediately and `neu run` quits.
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Wire Neutralino events so the frontend can call backend functions via
// app.events.emit('createMod', ...) etc.
// -----------------------------------------------------------------------------
// @ts-ignore – Neutralino global is injected at runtime
if (typeof Neutralino !== 'undefined') {
  // listen for directory dialog requests
  Neutralino.events.on('openDirectoryDialog', async (evt) => {
    const result = await openDirectoryDialog(evt.detail || {});
    Neutralino.events.emit('directorySelected', result);
  });

  // listen for mod creation requests
  Neutralino.events.on('createMod', async (evt) => {
    const result = await createMod(evt.detail);
    Neutralino.events.emit('modCreated', result);
  });
}

if (process.env.NEU_CLI) {
  setInterval(() => { /* no-op */ }, 1 << 30);   // ≈ 12 years
}