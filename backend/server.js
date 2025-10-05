const express = require('express');
const { spawn } = require('child_process');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const configPath = path.join(__dirname, 'config.yaml');
const defaultSmells = {
  LongMethod: true,
  GodClass: true,
  DuplicatedCode: true,
  LargeParameterList: true,
  MagicNumbers: true,
  FeatureEnvy: true
};

let configSmells = { ...defaultSmells };
if (fs.existsSync(configPath)) {
  configSmells = yaml.load(fs.readFileSync(configPath, 'utf8')) || defaultSmells;
}

app.post('/api/analyze', (req, res) => {
  console.log('Received analyze request:', req.body);
  const { files, config = {} } = req.body;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No code provided' });
  }

  let enabledSmells = { ...configSmells };

  // Step 1: Apply individual toggle switches from frontend
  if (config.enabled) {
    Object.keys(config.enabled).forEach(smell => {
      if (smell in enabledSmells) {
        enabledSmells[smell] = config.enabled[smell];
      }
    });
  }

  // Step 2: Handle "Only" filter (highest priority - overrides everything)
  if (config.only && config.only.length > 0) {
    console.log('Applying ONLY filter:', config.only);
    Object.keys(enabledSmells).forEach(smell => {
      // Only enable smells that are in the "only" list
      enabledSmells[smell] = config.only.includes(smell);
    });
  } 
  // Step 3: Handle "Exclude" filter (only if "only" is not set)
  else if (config.exclude && config.exclude.length > 0) {
    console.log('Applying EXCLUDE filter:', config.exclude);
    config.exclude.forEach(smell => {
      if (smell in enabledSmells) {
        enabledSmells[smell] = false;
      }
    });
  }

  // Get the final list of active smells
  const activeSmells = Object.keys(enabledSmells).filter(smell => enabledSmells[smell]);
  
  console.log('Final enabled smells:', enabledSmells);
  console.log('Active smells to analyze:', activeSmells);

  // If no smells are enabled, return early
  if (activeSmells.length === 0) {
    return res.json({
      activeSmells: [],
      findings: {}
    });
  }

  const tempDir = fs.mkdtempSync(path.join(__dirname, 'temp-'));
  try {
    const filePaths = files.map((file, index) => {
      const filePath = path.join(tempDir, file.name);
      fs.writeFileSync(filePath, file.content);
      console.log(`Wrote file to ${filePath}`);
      return filePath;
    });

    const pythonScript = path.join(__dirname, 'code_smell_detector.py');
    if (!fs.existsSync(pythonScript)) {
      throw new Error(`Python script not found at ${pythonScript}`);
    }

    const pythonProcess = spawn('python', [pythonScript, ...filePaths, JSON.stringify(enabledSmells)]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`Python output: ${data}`);
    });
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (fs.existsSync(tempDir)) {
        fs.rm(tempDir, { recursive: true, force: true }, (err) => {
          if (err) console.error('Error removing temp dir:', err);
        });
      }
      
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        return res.status(500).json({ error: 'Analysis failed', details: `Exit code: ${code}` });
      }

      try {
        const allFindings = JSON.parse(output);
        console.log('Raw findings from Python:', allFindings);

        // Filter findings to only include active smells
        const filteredFindings = {};
        activeSmells.forEach(smell => {
          filteredFindings[smell] = allFindings[smell] || { count: 0, items: [] };
        });

        console.log('Filtered findings for response:', filteredFindings);
        res.json({ 
          activeSmells, 
          findings: filteredFindings 
        });
      } catch (e) {
        console.error('Failed to parse output:', e.message, 'Output:', output);
        res.status(500).json({ error: 'Invalid analysis output', details: output });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      if (fs.existsSync(tempDir)) {
        fs.rm(tempDir, { recursive: true, force: true }, (err) => {
          if (err) console.error('Error removing temp dir:', err);
        });
      }
      res.status(500).json({ error: 'Failed to start analysis process', details: err.message });
    });

  } catch (e) {
    if (fs.existsSync(tempDir)) {
      fs.rm(tempDir, { recursive: true, force: true }, (err) => {
        if (err) console.error('Error removing temp dir:', err);
      });
    }
    console.error('Error in analysis process:', e.message);
    res.status(500).json({ error: 'Server error', details: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));