const express = require("express");
const app = express();
const clienteRoute = require("./routes/clienteRoutes");
const comprasRoute = require("./routes/comprasRoutes");
const abonoRoute = require("./routes/abonoRoutes");
const cors = require("cors");

const corsOptions = {
    origin: [
        'http://26.241.225.40:3001',
        'http://localhost:3002',
        'http://localhost:3001',
        'https://effervescent-florentine-6f5672.netlify.app'
        // Agrega aquí otros orígenes permitidos
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ],
    credentials: true,
    maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/clientes", clienteRoute);
app.use("/compras", comprasRoute);
app.use("/abonos", abonoRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});


