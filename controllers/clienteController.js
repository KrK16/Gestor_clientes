const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



//agregar clientes post

const agregarCliente = async (req, res) => {
    const {name, phone} = req.body;

    try {
        const respuesta = await prisma.customer.create({
            data:{
                name: name,
                phone: phone
                
            }
        });
        res.status(200).json(respuesta);
        
        
    } catch (error) {
        res.status(400).json({error: 'No se pudo agregar el cliente'}); 
    }
}

// consultar cliente

const consultarCliente = async (req, res) => {
    try {
        repuesta = await prisma.customer.findMany();

        res.status(200).json(respuesta);

    } catch (error) {
        res.status(400).json({error: 'No se pudo consultar el cliente'});
    }
}

// actaulizar cliente

const actualizarCliente = async (req, res) => {
    const {id} = req.params;
    const {name, phone} = req.body;

    try {
        const respuesta = await prisma.customer.update({
            where:{
                id: parseInt(id)
            },
            data:{
                name: name,
                phone: phone
            }
        });

        res.status(200).json(respuesta);
        
    } catch (error) {
        res.status(400).json({error: 'No se pudo actualizar el cliente'});
    }
}

// Eliminar cliente

const eliminarCliente = async (req, res) => {
    const {id} = req.params;

    try {
        const respuesta = await prisma.customer.delete({
            where:{
                id: parseInt(id)
            }
        });

        res.status(200).json(respuesta);
        
    } catch (error) {
        res.status(400).json({error: 'No se pudo eliminar el cliente'});
    }
}

module.exports={agregarCliente, consultarCliente, actualizarCliente, eliminarCliente};

