import express from "express";
import cors from "cors";

// SDK de Mercado Pago
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
// Agrega credenciales
//AQUI VA EL ACCES TOKEN
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-8450248338878252-090414-f5263c986ad5a0c0cfeb4bbf70553203-1046078811' });


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
            notification_url: "https://fc77-2800-484-277d-b500-3416-7af8-ebde-17c6.ngrok-free.app/webhook"
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
    const paymentId = req.query.id;
    //console.log({payment})
    //console.log("prueba")

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