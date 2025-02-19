const express = require("express");
const app = express();
const clienteRoute = require("./routes/clienteRoutes");
const comprasRoute = require("./routes/comprasRoutes");
const abonoRoute = require("./routes/abonoRoutes");
const cors = require("cors");


app.use(cors(
    {
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
        allowedHeaders: "Content-Type, Authorization"
    }
));

app.use(express.json());

app.use("/clientes", clienteRoute);
app.use("/compras", comprasRoute);
app.use("/abonos", abonoRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    });
    

