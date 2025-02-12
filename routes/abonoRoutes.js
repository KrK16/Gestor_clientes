const express = require("express");
const router  = express.Router();
const abonoController = require("../controllers/abonoController");


router.post("/", abonoController.crearAbono);
router.get("/cliente/:id", abonoController.consultarAbonosC);
router.put("/editar/:id", abonoController.editarAbono);
router.get("/", abonoController.consultarAbonos);
router.delete("/:id", abonoController.eliminarAbono);
router.get("/abonoTotal/:id", abonoController.pagarCompras);

module.exports = router;