const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Store for the last 1000 readings
let dataHistory = [];
const MAX_HISTORY = 1000;
let lastSaveTime = Date.now();
const SAVE_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

app.post('/datos', (req, res) => {
    const currentTime = new Date().toISOString();
    const dataPoint = {
        timestamp: currentTime,
        ...req.body
    };

    // Add to real-time data
    if (Date.now() - lastSaveTime >= SAVE_INTERVAL) {
        dataHistory.push(dataPoint);
        if (dataHistory.length > MAX_HISTORY) {
            dataHistory.shift(); // Remove oldest entry if we exceed 1000
        }
        lastSaveTime = Date.now();
        
        // Save to file
        const csvData = `${currentTime},${dataPoint.voltaje},${dataPoint.corriente},${dataPoint.potencia},${dataPoint['# vueltas']},${dataPoint[' % Bateria']}\n`;
        fs.appendFile('data_history.csv', csvData, (err) => {
            if (err) console.error('Error saving to file:', err);
        });
    }

    res.status(200).send('Data received');
});

// Endpoint to get historical data
app.get('/history', (req, res) => {
    res.json(dataHistory);
});

// Endpoint to download CSV
app.get('/download/csv', (req, res) => {
    res.download('data_history.csv', 'solar_panel_data.csv');
});

// Endpoint to download TXT
app.get('/download/txt', (req, res) => {
    const txtContent = dataHistory.map(entry => 
        `Time: ${entry.timestamp}, Voltage: ${entry.voltaje}V, Current: ${entry.corriente}mA, Power: ${entry.potencia}mW, Rotations: ${entry['# vueltas']}, Battery: ${entry[' % Bateria']}%`
    ).join('\n');

    fs.writeFileSync('data_export.txt', txtContent);
    res.download('data_export.txt', 'solar_panel_data.txt');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
