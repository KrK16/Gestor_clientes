const express = require("express");
const router = express.Router();
const comprasController = require("../controllers/comprasController");

router.delete("/producto/:id", comprasController.eliminarProducto);
router.post("/", comprasController.agregarCompra);
router.delete("/:id", comprasController.eliminarCompra);
router.put("/:id", comprasController.editarCompra);
router.get("/", comprasController.obtenerCompras);
router.get("/:id", comprasController.obtenerCompraPorId);
router.get("/compraU/:id", comprasController.obtenerComprasUsuarioID);
router.get("/compraR/:name", comprasController.obtenerComprasPorRevista);


module.exports = router;