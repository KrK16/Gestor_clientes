const { PrismaClient } = require('@prisma/client');
const { response } = require('express');
const prisma = new PrismaClient();

// Crear un abono a una compra

const crearAbono = async (req, res) => {
    const { purchase_id, amount, date } = req.body;
    try {

        const fecha = new Date(date).toISOString();

        const deuda = await prisma.purchase.findUnique({
            where:{
                id: purchase_id
            },
            select:{
                debt: true
            }
        })

        const resta = deuda.debt - amount;

        if (resta >= 0) {
            const respuesta = await prisma.payment.create({
                data: {
                    purchaseId: purchase_id,
                    amount: amount,
                    createdAt: fecha
                },
                include: {
                    purchase: true
                }
            });

            await deudaCompra(amount, purchase_id);
        
            const debtmiss = await prisma.purchase.findUnique({
                    where: {
                        id: purchase_id
                    },
                    select: {
                        debt: true
                    }
                });
        
            if (debtmiss.debt === 0) {
            const estado =  await prisma.purchase.update({
                    where: {
                        id: purchase_id
                    },
                    data: {
                        status: "pagado"
                    }
                });
            }
            //console.log("es igual a cero")
        res.status(200).json(respuesta);
        } 
        else {
            res.status(400).json("El monto del abono no puede ser mayor que la deuda")
        }
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ error: "Failed to create payment" });
    }
}

// Actualizar la deuda de la compra.

const deudaCompra = async (cantidad, id) => {
    console.log("deudacompra cantidad", cantidad);
    const compra = await prisma.purchase.findUnique({
        where: {
            id: parseInt(id)
        },
        select: {
            debt: true
        }
    });

    const deuda = compra.debt - cantidad;

    const respuesta = await prisma.purchase.update({
        where: {
            id: parseInt(id)
        },
        data: {
            debt: deuda

            
        }
    });
    return respuesta;
}

// Consultar abonos por cliente.
const consultarAbonosC = async (req, res) => {
    const id = req.params.id;
    try {
        const respuesta = await prisma.payment.findMany({
            where: {
                purchase: {
                    custormerId: parseInt(id)
                }
            },
        });
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json(error);
    }
}

// Eliminar abono
const eliminarAbono = async (req, res) => {
    const { id } = req.params;
    try {

        const devuelta = await prisma.payment.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                amount: true,
                purchaseId: true
            }
        });

        const obtenerDebt = await prisma.purchase.findUnique({
            where: {
                id: devuelta.purchaseId
            },
            select: {
                debt: true
            }
        });

        const nuevitaDeuda = obtenerDebt.debt + devuelta.amount;

        const actualizardebt = await prisma.purchase.update({
            where: {
                id: devuelta.purchaseId
            },
            data: {
                debt: nuevitaDeuda
            }
        });

        const debtmiss = await prisma.purchase.findUnique({
            where: {
                id: devuelta.purchaseId
            },
            select: {
                debt: true
            }
        });

        if(debtmiss.debt > 0){
        const estado = await prisma.purchase.update({
                where: {
                    id: devuelta.purchaseId
                },
                data: {
                    status: "pendiente"
                }
            });
        }

        const respuesta = await prisma.payment.delete({
            where: {
                id: parseInt(id)
            }
        });


        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo eliminar el abono' });
    }
}

// consultar abonos
const consultarAbonos = async (req, res) => {
    try {
        const respuesta = await prisma.payment.findMany();
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo consultar los abonos' });
    }
}

// Editar abono
const editarAbono = async (req, res) => {
    const id = req.params.id;
    const { purchaseId, amount, date } = req.body;
    
    try {
        // Get original payment
        const abonoAnterior = await prisma.payment.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                amount: true,
                purchaseId: true
            }
        });
        
        if (!abonoAnterior) {
            return res.status(404).json({ error: "Abono no encontrado" });
        }
        
        // First restore the original debt by adding back the previous payment
     
        
        // Check if new amount is valid for current debt
   

        const deudaActual = await prisma.purchase.findUnique({
            where: {
                id: parseInt(purchaseId)
            },
            select: {
                debt: true
            }
        });
             
        const nuevaDeuda = deudaActual.debt - amount + abonoAnterior.amount;

        
        if (nuevaDeuda < 0) {
            return res.status(400).json("El monto del abono no puede ser mayor que la deuda");
        }
        
        // Update debt
        await deudaCompra(-abonoAnterior.amount, purchaseId);

        
        // Update payment record
        const fecha = new Date(date).toISOString();
        const respuesta = await prisma.payment.update({
            where: {
                id: parseInt(id)
            },
            data: {
                purchaseId: parseInt(purchaseId),
                amount: amount,
                createdAt: fecha
            }
        });
        
        // Apply the new payment to debt
        const resultadoDeuda = await deudaCompra(amount, purchaseId);
        
        // Update purchase status based on remaining debt
        await prisma.purchase.update({
            where: {
                id: purchaseId
            },
            data: {
                status: resultadoDeuda.debt === 0 ? 'pagado' : 'pendiente'
            }
        });
        
        res.status(200).json(respuesta);
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: 'No se pudo editar el abono' });
    }
}


// Pagar todos las compras de un cliente 

/*
traer todas las compras de un cliente donde debt sea mayor a 0
(tenemos json con multiples compras )
cogemos debt de cada compra y creamos un abono con el monto de debt asociado a la compra 
y luego actualizamos debt de la compra a 0
cambiar status a pagado

*/

const consultarAbonosAgrupados = async (req, res) => {
    try {
        const respuesta = await prisma.payment.findMany({
            include: {
                purchase: {
                    include: {
                        customer: true
                    }
                }
            }
        });

        const abonosAgrupados = respuesta.reduce((acc, abono) => {
            const customerId = abono.purchase.customer.id;
            const customerName = abono.purchase.customer.name;
            
            if (!acc[customerId]) {
                acc[customerId] = {
                    customer: {
                        id: customerId,
                        name: customerName
                    },
                    payments: []
                };
            }
            
            acc[customerId].payments.push({
                id: abono.id,
                amount: abono.amount,
                purchaseId: abono.purchaseId,
                createdAt: abono.createdAt
            });
            
            return acc;
        }, {});

        res.status(200).json(Object.values(abonosAgrupados));
    } catch (error) {
        res.status(400).json({ 
            error: 'No se pudieron consultar los abonos agrupados',
            details: error.message 
        });
    }
}



const consultarAbonosCompra = async (req, res) => {
    const { id } = req.params;
    try {
        const respuesta = await prisma.payment.findMany({
            where: {
                purchaseId: parseInt(id)
            },
            include: {
                purchase: {
                    include: {
                        customer: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!respuesta.length) {
            return res.status(404).json({ 
                message: 'No se encontraron abonos para esta compra' 
            });
        }

        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ 
            error: 'Error al consultar los abonos de la compra',
            details: error.message 
        });
    }
}


const pagarCompras = async (req, res) => {
    const custormerid = req.param.id;

    const respuesta = await prisma.purchase.findMany({
        where: {
            custormerId: custormerid,
            debt: {
                gt: 0
            }

        }
    });
    try {
        respuesta.forEach(async (compra) => {
            await prisma.payment.create({
                data: {
                    purchaseId: compra.id,
                    amount: compra.debt
                }
            });

            await prisma.purchase.update({
                where: {
                    id: compra.id
                },
                data: {
                    debt: 0,
                    status: 'pagado'
                }

            });
        });
        res.status(200).json({ message: 'Todas las compras han sido pagadas' });
    } catch (error) {
        res.status(400).json(error);
    }
}

















module.exports = { crearAbono, consultarAbonosC, editarAbono, eliminarAbono, consultarAbonos, pagarCompras, consultarAbonosAgrupados, consultarAbonosCompra };

