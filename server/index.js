import express from "express";
import cors from "cors";

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
// Agrega credenciales
//AQUI VA EL ACCES TOKEN
const client = new MercadoPagoConfig({ accessToken: 'TEST-8450248338878252-090414-2a2ae4250848ddeabfd96dd510aa1ef5-1046078811' });


const app = express()
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req,res) =>{
    res.send("servidor");
});

app.post("/create_preference", async (req,res) => {
    try{
        const body = {
            items: [
                {
                    title: req.body.title, 
                    quantity: Number(req.body.quantity),
                    unit_price:Number(req.body.price),
                    currency_id: "COP",
                },
            ],
            //DEBO MODIFICAR LOS URLS DEPENDIENDO DE LA SITUACION
            back_urls: {
                success: "https://www.google.com/",
                failure: "https://www.google.com/",
                pending: "https://www.google.com/"
            },
            auto_return: "approved",
            notification_url: "https://742b-2800-484-277d-b500-817b-8a54-b1ab-a89c.ngrok-free.app/webhook"
        };
        const preference = new Preference(client);
        const result = await preference.create({ body });   
        res.json({
            id: result.id,
        });
    }catch (error){
        console.log(error)
        res.status(500).json({
            error: "Error al crear la preferencia :("
        });
    }
});

//esto es para el tema de las notificaciones
app.post("/webhook", async function (req,res){
    const paymentId = req.query

    try{
        const response = await fetch (`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${client.accessToken}`
            }
        });

    if(response.ok) {
        const data = await response.json();
        console.log(data);
    }

    res.sendStatus(200); //por doc se debe enviar un estado 200 para que no envie multiples notificaciones
    }catch(error){
        console.error('Error', error);
        res.sendStatus(500);
    }
});
//========================================================================

app.listen(port, ()=> {
    console.log(`Servidor corriendo en el puerto ${port}`);
});