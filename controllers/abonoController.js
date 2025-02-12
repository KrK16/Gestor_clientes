const { PrismaClient } = require('@prisma/client');
const {response} = require('express');
const prisma = new PrismaClient();

// Crear un abono a una compra

const crearAbono = async (req, res) => {
    const {purchase_id, amount} = req.body;
    deudaCompra(amount, purchase_id);
    const respuesta = await prisma.payment.create({
        data:{
            purchaseId: purchase_id,
            amount: amount
        },
        include:{
            purchase: true
        }
    });
    
    res.status(200).json(respuesta);
}

// Actualizar la deuda de la compra.

const deudaCompra = async (cantidad, id) => {
    console.log(cantidad, id);
    const compra = await prisma.purchase.findUnique({
        where:{
            id: parseInt(id)
        },
        select:{
            debt: true
        }
    });

    const deuda = compra.debt - cantidad;

    const respuesta = await prisma.purchase.update({
        where:{
            id: id
        },
        data:{
            debt: deuda
            
        }
    });
}   

// Consultar abonos por cliente.

const consultarAbonosC = async (req, res) => {
    const id = req.params.id;
    try {
        const respuesta = await prisma.payment.findMany({
            where:{
                purchase:{
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
    const {id} = req.params;
    try {

        const devuelta = await prisma.payment.findUnique({
            where:{
                id: parseInt(id)
            },
            select:{
                amount: true,
                purchaseId: true
            }
        });

        const obtenerDebt = await prisma.purchase.findUnique({
            where:{
                id: devuelta.purchaseId
            },
            select:{
                debt: true
            }
        });

        const nuevitaDeuda = obtenerDebt.debt + devuelta.amount;

        const actualizardebt = await prisma.purchase.update({
            where:{
                id: devuelta.purchaseId
            },
            data:{
                debt: nuevitaDeuda
            }
        });
        
        const respuesta = await prisma.payment.delete({
            where:{
                id: parseInt(id)
            }
        });

        
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({error: 'No se pudo eliminar el abono'});
    }
}


// consultar abonos
const consultarAbonos = async (req, res) => {
    try {
        const respuesta = await prisma.payment.findMany();
        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({error: 'No se pudo consultar los abonos'});
    }
}   

// Editar abono
/*const editarAbono = async (req, res) => {
    const id = req.params.id;
    const { purchase_id, amount } = req.body;

    try {
        // Obtener la deuda actual 
        const compra = await prisma.purchase.findUnique({
            where: {
                id: parseInt(purchase_id)
            },
            select: {               90, 40, 50.
                debt: true          
            }
        });

        // Obtener el abono anterior.
        const abonoAnterior = await prisma.payment.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                amount: true
            }
        });


        // Calcular la nueva deuda
        const nuevaDeuda = compra.debt + abonoAnterior.amount - amount;

        // Actualizar la deuda de la compra
        await prisma.purchase.update({
            where: {
                id: parseInt(purchase_id)
            },
            data: {
                debt: nuevaDeuda
            }
        });

        // Actualizar el abono
        const respuesta = await prisma.payment.update({
            where: {
                id: parseInt(id)
            },
            data: {
                purchaseId: purchase_id,
                amount: amount
            }
        });

        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo editar el abono' });
        console.error(error);
    }
} */


// Editar abono 2

const editarAbono = async (req, res) => {
    const id = req.params.id;
    const {purchaseId, amount} = req.body;

    try {
        //Obtener el abono que se quiere cambiar, abono anterior.
        const abonoAnterior = await prisma.payment.findUnique({
            where:{
                id: parseInt(id)
            },
            select:{
                amount: true
            }

        });
        console.log(abonoAnterior);

        // Restaurar el valor de la deuda
        await deudaCompra(-abonoAnterior.amount, purchaseId);

        // Actualizar abono
        const ActualizarAbono = async (req, res) => {
            const respuesta = await prisma.payment.update({
                where:{
                    id: parseInt(id)
                },
                data:{
                    purchaseId: parseInt(purchase_id),
                    amount: amount
                }

            });
            await deudaCompra(respuesta.amount, purchaseId);
        }
        ActualizarAbono();

        // Descontar el abono a la deuda actual
        

        res.status(200).json(respuesta);
    } catch (error) {
        res.status(400).json(error);
        console.error(error);
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

const pagarCompras = async (req, res) => {
    const custormerid = req.param.id;

    const respuesta = await prisma.purchase.findMany({
        where:{
            custormerId: custormerid,
                debt:{
                    gt: 0
                }
             
        }
    });
    try {
        respuesta.forEach(async(compra) =>{
            await prisma.payment.create({
                data:{
                    purchaseId: compra.id,
                    amount: compra.debt
                }
            });

            await prisma.purchase.update({
                where:{ 
                    id:compra.id
                },
                data:{
                    debt:0,
                    status: 'pagado'
                }

                });
            });   
            res.status(200).json({message: 'Todas las compras han sido pagadas'});
    } catch (error) {
        res.status(400).json(error);
    }
}
















module.exports = {crearAbono, consultarAbonosC, editarAbono, eliminarAbono, consultarAbonos,pagarCompras};

