const express = require("express");
const router  = express.Router();
const abonoController = require("../controllers/abonoController");


router.post("/", abonoController.crearAbono);
router.get("/cliente/:id", abonoController.consultarAbonosC);
router.put("/:id", abonoController.editarAbono);
router.get("/", abonoController.consultarAbonos);
router.delete("/:id", abonoController.eliminarAbono);
router.get("/abonoTotal/:id", abonoController.pagarCompras);
router.get("/abonosagrupados", abonoController.consultarAbonosAgrupados);
router.get("/abonocompra/:id", abonoController.consultarAbonosCompra);

module.exports = router;