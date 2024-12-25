const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Almacenamiento en memoria
let dataHistory = [];
const MAX_HISTORY = 1000;
let lastSaveTime = Date.now();
const SAVE_INTERVAL = 30 * 60 * 1000;

// Endpoint para recibir datos
app.post('/datos', (req, res) => {
    console.log('Datos recibidos:', req.body); // Debug log

    const currentTime = new Date().toISOString();
    const dataPoint = {
        timestamp: currentTime,
        ...req.body
    };

    // Siempre guardar el dato más reciente para debugging
    dataHistory.push(dataPoint);
    if (dataHistory.length > MAX_HISTORY) {
        dataHistory.shift();
    }
    
    console.log('Datos almacenados:', dataHistory[dataHistory.length - 1]); // Debug log
    
    res.status(200).json({
        message: 'Data received',
        lastDataPoint: dataPoint
    });
});

app.get('/history', (req, res) => {
    console.log('Datos históricos solicitados. Cantidad:', dataHistory.length); // Debug log
    res.json(dataHistory);
});

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/test', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
