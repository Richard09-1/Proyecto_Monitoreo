// server.js
const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let dataHistory = [];
const MAX_HISTORY = 1000;
const SAVE_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Save data to file every 30 minutes
function saveDataToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const data = dataHistory.map(entry => {
        return `${entry.timestamp},${entry.voltaje},${entry.corriente},${entry.potencia},${entry['# vueltas']},${entry.bateriaPorcentaje}`;
    }).join('\n');
    
    fs.writeFileSync(`data-${timestamp}.txt`, data);
}

app.post('/datos', (req, res) => {
    const currentTime = Date.now();
    const dataPoint = {
        timestamp: new Date().toISOString(),
        ...req.body
    };
    
    dataHistory.push(dataPoint);
    if (dataHistory.length > MAX_HISTORY) {
        dataHistory.shift();
    }
    
    // Save data every 30 minutes
    if (currentTime - lastSaveTime >= SAVE_INTERVAL) {
        saveDataToFile();
        lastSaveTime = currentTime;
    }
    
    res.status(200).json({
        message: 'Data received',
        lastDataPoint: dataPoint
    });
});

app.get('/download/:format', (req, res) => {
    const { format } = req.params;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    let content = '';
    const header = 'Timestamp,Voltage,Current,Power,Rotations,Battery\n';
    
    if (format === 'csv') {
        content = header + dataHistory.map(entry => {
            return `${entry.timestamp},${entry.voltaje},${entry.corriente},${entry.potencia},${entry['# vueltas']},${entry.bateriaPorcentaje}`;
        }).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=data-${timestamp}.csv`);
    } else {
        content = dataHistory.map(entry => {
            return `${entry.timestamp},${entry.voltaje},${entry.corriente},${entry.potencia},${entry['# vueltas']},${entry.bateriaPorcentaje}`;
        }).join('\n');
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=data-${timestamp}.txt`);
    }
    
    res.send(content);
});

app.get('/history', (req, res) => {
    res.json(dataHistory);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
