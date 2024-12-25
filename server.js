const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let sensorData = [];
let lastSaveTime = Date.now();
const SAVE_INTERVAL = 30 * 60 * 1000; // 30 minutes

app.post('/datos', (req, res) => {
    const data = {
        ...req.body,
        timestamp: new Date().toISOString()
    };
    sensorData.push(data);
    
    // Save data every 30 minutes
    if (Date.now() - lastSaveTime >= SAVE_INTERVAL) {
        const filename = `sensor_data_${new Date().toISOString().slice(0,10)}.txt`;
        const content = sensorData.map(d => JSON.stringify(d)).join('\n');
        
        fs.writeFile(path.join(__dirname, 'data', filename), content, (err) => {
            if (err) console.error('Error saving data:', err);
            lastSaveTime = Date.now();
        });
    }
    
    // Keep only last 100 readings in memory
    if (sensorData.length > 100) {
        sensorData = sensorData.slice(-100);
    }
    
    res.json({ status: 'success' });
});

app.get('/data', (req, res) => {
    res.json(sensorData);
});

app.get('/download', (req, res) => {
    const filename = `sensor_data_${new Date().toISOString().slice(0,10)}.txt`;
    const filePath = path.join(__dirname, 'data', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('No data file available');
    }
});

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
