const { PrismaClient } = require('@prisma/client');
const { response } = require('express');
const prisma = new PrismaClient();


const obtenerCompras = async (req, res) => {
    const respuesta = await prisma.purchase.findMany({
        include: {
            products: true,
            customer: true,
        }
    });
    res.status(200).json(respuesta);
}


// agregar compras con los productos.

const agregarCompra = async (req, res) => {
    const { customer_id, productos, name, payday, orderdate } = req.body;
    console.log(productos[0].price)
    let precioTotal = precioCompra(productos);
    const formatofechaorderdate = new Date(orderdate).toISOString();

if(orderdate === null ){
    orderdate = new Date();
}
if (payday === null)    {
    payday = new Date();}

    const formatofechapayday = new Date(payday).toISOString();
    const respuesta = await prisma.purchase.create({

        data: {
            custormerId: customer_id,
            price: precioTotal,
            name: name,
            debt: precioTotal,
            payday: formatofechapayday,
            orderdate: formatofechaorderdate,
            products: {
                create: productos.map((producto) => ({
                    name: producto.name,
                    quantity: producto.quantity,
                    price: producto.price
                }))
            }
        },
        include: {
            products: true
        }

    });
    res.status(200).json(respuesta);

}
/*
Lo que quiero es que cuando se agregue una compra se asigne
el precio de total de la compra en base al precio de los productos y la cantidad.
 */

// Agregar precio total de la compra

const precioCompra = (productos) => {
    console.log(productos)
    let precio = 0;
    
    // Verificar si productos es un array o un objeto individual
    const productosArray = Array.isArray(productos) ? productos : [productos];
    
    productosArray.forEach(producto => {
        precio += producto.price * producto.quantity;
        console.log(precio)
    });
    return precio;
}

// agregar compra con cliente

const agregarCompraClienteNuevo = async (req, res) => {
    const data = req.body;
    
    let precioTotal = precioCompra(data.productos);

    console.log(data)
    try {
        const formatofechaorderdate = new Date(data.orderdate).toISOString();
        const formatofechapayday = new Date(data.payday).toISOString();
        const respuestaCliente = await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone
            }
        })

        const respuesta = await prisma.purchase.create({
            data: {
                custormerId: respuestaCliente.id,
                name: data.nameCompra,
                price: precioTotal,
                debt: precioTotal,
                payday: formatofechapayday,
                orderdate: formatofechaorderdate,
                products: {
                    create: data.productos.map((producto) => ({
                        name: producto.name,
                        quantity: producto.quantity,
                        price: producto.price
                    }))
                }
            },
            include: {
                products: true
            }
        });
        res.status(200).json(respuesta);

    } catch (error) {
        res.status(400).json({ error: 'No se pudo agregar la compra' });
        console.error(error)
    }


}

// Eliminar compras

const eliminarCompra = async (req, res) => {
    const id = req.params.id;

    try {
        await prisma.product.deleteMany({
            where: {
                purchaseId: parseInt(id)
            }
        });

        await prisma.payment.deleteMany({
            where: {
                purchaseId: parseInt(id)
            }
        });

        const respuesta = await prisma.purchase.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo eliminar la compra' });
    }

}

// Editar una compra

const editarCompra = async (req, res) => {
    const id = req.params.id;
    let precioTotal = precioCompra(req.body.productos);
    const { customer_id, status, productos, purchaseName, payDay, orderDay } = req.body;

    const formatofechaorderdate = new Date(orderDay).toISOString();
    const formatofechapayday = new Date(payDay).toISOString();



    try {
        const respuesta = await prisma.purchase.update({
            where: {
                id: parseInt(id)
            },
            data: {
                custormerId: customer_id,
                name: purchaseName,
                price: precioTotal,
                status: status,
                debt: precioTotal,
                payday: formatofechapayday,
                orderdate: formatofechaorderdate,
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
            include: {
                products: true
            }
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo actualizar la compra' });
    }
}

//eliminar productos individuales, no se está actualizando el precio de la compra. 

const eliminarProducto = async (req, res) => {
    const id = req.params.id;
    try {

        // obtener el precio del producto y el id de la compra
        const precio = await prisma.product.findUnique({
            where: {
                id: parseInt(id)

            },
            select: {
                purchaseId: true,
                price: true
            }
        });

        // obtener el precio de la compra
        const obtenerPrecio = await prisma.purchase.findUnique({
            where: {
                id: precio.purchaseId
            },
            select: {
                price: true
            }
        });

        // restar el precio del producto al precio de la compra 
        const nuevoPrecio = obtenerPrecio.price - precio.price;

        // actualizar el precio de la compra
        await prisma.purchase.update({
            where: {
                id: precio.purchaseId
            },
            data: {
                price: nuevoPrecio
            }

        });

        //eliminar el producto 
        const respuesta = await prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo eliminar el producto' });
    }
}

// ver compras por id de compra
const obtenerCompraPorId = async (req, res) => {
    const id = req.params.id;
    try {
        const respuesta = await prisma.purchase.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                products: true
            }
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo obtener la compra' });
    }
}

// Obtener compras por id de cliente

const obtenerComprasUsuarioID = async (req, res) => {
    const id = req.params.id
    respuesta = await prisma.customer.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            purchases: true
        }
    });
    res.send(respuesta);
}

// Ver compras nombre de revista (revistas, vitrina).

const obtenerComprasPorRevista = async (req, res) => {
    const name = req.params.name
    respuesta = await prisma.purchase.findMany({
        where: {
            name: name
        }
    });
    res.status(200).json(respuesta);
}


// Exportar los modulos para los routes.

module.exports = { agregarCompra, eliminarCompra, editarCompra, eliminarProducto, obtenerCompras, obtenerCompraPorId, obtenerComprasUsuarioID, obtenerComprasPorRevista, agregarCompraClienteNuevo };

