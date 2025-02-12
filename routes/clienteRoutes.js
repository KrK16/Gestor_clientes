const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController")

router.post("/", clienteController.agregarCliente);
router.get("/", clienteController.consultarCliente);
router.put("/:id", clienteController.actualizarCliente);
router.delete("/:id", clienteController.eliminarCliente);


module.exports = router;