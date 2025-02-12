const { PrismaClient } = require('@prisma/client');
const { response } = require('express');
const prisma = new PrismaClient();



const obtenerCompras = async (req, res) => {
    const respuesta = await prisma.purchase.findMany({
        include:{
            products: true
        }
    });
    res.status(200).json(respuesta);
}


// agregar compras con los productos.

const agregarCompra = async (req, res) => {
    const {customer_id, status, productos, name} = req.body;
        let precioTotal = precioCompra(productos);
        const respuesta = await prisma.purchase.create({
            data:{
                custormerId: customer_id,
                price: precioTotal,
                status: status,
                name: name,
                debt: precioTotal,
                products:{
                    create: productos.map((producto) => ({
                            name: producto.name,
                            quantity: producto.quantity,
                            price: producto.price
                    }))
                }
            },
            include:{
                products: true
            }
            
        });
        res.status(200).json(respuesta);
    
}

// Agregar precio total de la compra

const precioCompra = (productos) => {
    let precio = 0;
    productos.forEach(producto => {
        precio += producto.price;
    });
    return precio;
}

// Eliminar compras

const eliminarCompra = async (req, res) => {
    const id = req.params.id;
    
    try {
        await prisma.product.deleteMany({
            where:{
                purchaseId : parseInt(id)
            }
        });

        await prisma.payment.deleteMany({
            where:{
                purchaseId: parseInt(id)
            }});    
        
        const respuesta = await prisma.purchase.delete({
            where:{
                id: parseInt(id)
            }
        });

        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({error: 'No se pudo eliminar la compra'});
         console.error(error); 
    }
    
}

// Editar una compra

const editarCompra = async (req, res) => {
    const id = req.params.id;
    const {customer_id, price, status, productos} = req.body;
    console.log(req.body);
    try {
        const respuesta = await prisma.purchase.update({
            where:{
                id: parseInt(id)
            },
            data:{
                custormerId: customer_id,
                price: price,
                status: status,
                products: {
                    upsert: productos.map((producto) => ({
                        where: { id: producto.product_id },
                        update: {
                            name: producto.name,
                            quantity: producto.quantity,
                            price: producto.price
                        },
                        create: {
                            name: producto.name,
                            quantity: producto.quantity,
                            price: producto.price
                        }
                    }))
                }
            },
            include:{
                products: true
            }
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({error: 'No se pudo actualizar la compra'});
    }
}



//eliminar productos individuales, no se está actualizando el precio de la compra. 

const eliminarProducto = async (req, res) => {
    const id = req.params.id;
    try {
        const respuesta = await prisma.product.delete({
            where:{
                id: parseInt(id)
            }
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({error: 'No se pudo eliminar el producto'});
    }
}

// ver compras por id de compra
const obtenerCompraPorId = async (req, res) => {
    const id = req.params.id;
    try {
        const respuesta = await prisma.purchase.findUnique({
            where:{
                id: parseInt(id)
            },
            include:{
                products: true
            }
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({error: 'No se pudo obtener la compra'});
    }
}

// Obtener compras por ide de cliente

const obtenerComprasUsuarioID = async (req, res) => {
    const id = req.params.id
    respuesta = await prisma.customer.findUnique({
        where:{
            id: parseInt(id)
        },
        include:{
            purchases: true
        }
    });
    res.send(respuesta);
}

// Ver compras nombre de revista (revistas, vitrina).

const obtenerComprasPorRevista = async (req, res) => {
    const name = req.params.name
    respuesta = await prisma.purchase.findMany({
        where:{
            name: name
        }
    });
    res.status(200).json(respuesta);
} 


// Exportar los modulos para los routes.

module.exports = {agregarCompra, eliminarCompra, editarCompra, eliminarProducto, obtenerCompras, obtenerCompraPorId, obtenerComprasUsuarioID, obtenerComprasPorRevista};

