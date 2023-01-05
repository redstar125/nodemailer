const nodemailer=require('nodemailer')
const{google}=require('googleapis')
const config=require('./config.js')
const { appengine } = require('googleapis/build/src/apis/appengine/index.js')
const OAuth2=google.auth.OAuth2
const express=require("express")
var cors=require('cors')
const Jsontableify = require('./src/jsontableify')
const app=express()
app.use(cors())
/*app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested, Content-Type, Accept"
    )
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "POST, PUT, PATCH, GET, DELETE"
      )
      return res.status(200).json({})
    }
    next()
  })*/
const OAuth2_client=new OAuth2(config.clientId,config.clientSecret)
//const {User}=require('./Models/User')
const bodyParser=require('body-parser')
OAuth2_client.setCredentials({refresh_token:config.refreshToken})
app.use(bodyParser.json());
const { attachment } = require('express/lib/response.js')
/*app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Access-Control-Allow-Credentials', true);
    next();
    });*/
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');
    
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    
        // Pass to next layer of middleware
        next();
    });
  app.use(express.static(__dirname+'/public'));
app.get('/', (req, res) => {

    res.send('Heello world');
})
 
app.listen(process.env.PORT||3000,()=>{
    console.log(`Server is running in port ${process.env.PORT||3000}! `);
})

app.post('/sendmail',(req,res)=>{
    
    let email=req.body.user.email
    let info=req.body.user.data
    let nom=req.body.user.nom
    let prenom=req.body.user.prenom
    let tel=req.body.user.tel
    let address=req.body.user.address
    let steps=req.body.user.step
    let infosup=req.body.user.comment
   // console.log("<!DOCTYPE html><html><head><style>body {background-color: powderblue;}h1{color: blue;}p{color: red;}</style></head> <body>"+new Jsontableify({}).toHtml(info)+"</body></html>")
   // console.log(info.salleDeBain.items[0]);
    //res.send("<!DOCTYPE html><html><head><style>body {background-color: powderblue;}h1{color: blue;}p{color: red;}</style></head> <body>"+new Jsontableify({}).toHtml(info)+"</body></html>");
    console.log("mail send it successfully !");
    send_mail(info,email,nom,prenom,tel,address,steps,infosup);

})

function send_mail(info,reciepent,nom,prenom,tel,address,steps,infosup){
    var now = new Date();
    var timestamp = "A00"+(now.getFullYear()-2000).toString(); 
    timestamp += (now.getMonth < 9 ? '0' : '') + now.getMonth().toString(); // JS months are 0-based, so +1 and pad with 0's
    timestamp += ((now.getDate < 10) ? '0' : '') + now.getDate().toString();
    timestamp+=now.getHours().toString();
    timestamp+=now.getMinutes().toString()
    timestamp+=now.getSeconds().toString();
    const accessToken=OAuth2_client.getAccessToken()

    const transport=nodemailer.createTransport({
        service:'gmail',
        auth:{
            type:'OAuth2',
            user:config.user,
            clientId:config.clientId,
            clientSecret:config.clientSecret,
            refreshToken:config.refreshToken,
            accessToken:accessToken
        }
    })

    const mail_options={
        from:'Batideco.fr <$config.user}>',
        to: reciepent,
        subject:`Nouveau devis-${timestamp}`,
        html:"<!DOCTYPE html><html><head><style> h4,h3,p{color: black;} table{font-family: 'Source Sans Pro', sans-serif;border: 1px solid thin #c1c1c1;background-color: #EEEEEE;width: 100%; text-align: left;table-layout:fixed;border-collapse: collapse;} td,th{ border: 1px solid;text-transform: capitalize;text-align: left; vertical-align: center; text-overflow: ellipsis; border: 2px solid thin #c1c1c1;word-wrap: break-word; padding: 3px 3px; font-size: 13px; }table tr:nth-child(even) {background: #e5e5e5; } .thead{ font-size: 15px;font-weight: bold;color: #FFFFFF;border-left: 1px solid thin #a3a3a3;background: #5585b9; } hr{ border-top: 1px dotted black;} .no-break{ page-break-inside: avoid !important;} table,tr,td,div { page-break-inside: auto !important;}th { width: 30%; border-right: 1px solid #c1c1c1 !important;}.b{margin-bottom: 15px;margin-top: 15px;background-color:#051259;position:relative;width:50%;align-items: center;justify-content: center;} .c{margin-left:5px;align-items: center;justify-content: center;} .t{text-align: center;padding: 3px;background:#ED6F86;color: white;}</style></head> <body><div class='b'><div class='c'><img  width='100%' height='50%' src='cid:uniqueID@creata.ee'></div></div> <h2> Bonjour "+nom+" "+prenom+",</h2><h4>Nous avons bien enregistré votre demande de devis, Elle va être traitée au plus vite. À très bientôt.</h4><h3>Informations :</h3>Nom: "+nom+"<br>Prénom: "+prenom+"<br>Téléphone: "+tel+"<br>E-mail: "+reciepent+"<br>Code Postale: "+address+"<h3>Détails du projet</h3><p>Ref:"+timestamp+"<br>"+steps.replace(',',' ')+"<br><br>"+get_html_message(info).html.replaceAll('Count','Nombre').replaceAll('Items','Elements').replaceAll('Size','Taille').replaceAll('True','Vrai').replaceAll('False','Faux').replaceAll('null','0').replaceAll('true','ok')+"<h3>Informations complémentaires:</h3><p>"+infosup+"</p><br><div class='t'><p style='color:white'>Ceci est un courriel automatisé.<br> Merci de ne pas répondre.Vous avez reçu ce message car vous nous avez communiqué votre adresse électronique.</div></body></html>",
       //<img  style:'width:50px' src='cid:uniqueID@creata.ee'> 
       attachments:[{
            filename:"logobd.jpg",
            path:`public/images/logobd.jpg`,
            cid:"uniqueID@creata.ee"

        }]
    }

    const mail_options1={
        from:'Batideco.fr <$config.user}>',
        to: 'batideco.fr@gmail.com',
        subject:`Nouveau devis-${timestamp}`,
        html:"<!DOCTYPE html><html><head><style> h4,h3,p{color: black;} table{font-family: 'Source Sans Pro', sans-serif;border: 1px solid thin #c1c1c1;background-color: #EEEEEE;width: 100%; text-align: left;table-layout:fixed;border-collapse: collapse;} td,th{ border: 1px solid;text-transform: capitalize;text-align: left; vertical-align: center; text-overflow: ellipsis; border: 2px solid thin #c1c1c1;word-wrap: break-word; padding: 3px 3px; font-size: 13px; }table tr:nth-child(even) {background: #e5e5e5; } .thead{ font-size: 15px;font-weight: bold;color: #FFFFFF;border-left: 1px solid thin #a3a3a3;background: #5585b9; } hr{ border-top: 1px dotted black;} .no-break{ page-break-inside: avoid !important;} table,tr,td,div { page-break-inside: auto !important;}th { width: 30%; border-right: 1px solid #c1c1c1 !important;}.b{margin-bottom: 15px;margin-top: 15px;background-color:#051259;position:relative;width:50%;align-items: center;justify-content: center;} .c{margin-left:5px;align-items: center;justify-content: center;} .t{text-align: center;padding: 3px;background:#ED6F86;color: white;}</style></head> <body><div class='b'><div class='c'><img  width='100%' height='50%' src='cid:uniqueID@creata.ee'></div></div> <h2> Bonjour "+nom+" "+prenom+",</h2><h4>Nous avons bien enregistré votre demande de devis, Elle va être traitée au plus vite. À très bientôt.</h4><h3>Informations :</h3>Nom: "+nom+"<br>Prénom: "+prenom+"<br>Téléphone: "+tel+"<br>E-mail: "+reciepent+"<br>Code Postale: "+address+"<h3>Détails du projet</h3><p>Ref:"+timestamp+"<br>"+steps.replace(',',' ')+"<br><br>"+get_html_message(info).html.replaceAll('Count','Nombre').replaceAll('Items','Elements').replaceAll('Size','Taille').replaceAll('True','Vrai').replaceAll('False','Faux').replaceAll('null','0').replaceAll('true','ok').replaceAll('Surface','Surface (m²)')+"<h3>Informations complémentaires:</h3><p>"+infosup+"</p><br><div class='t'><p style='color:white'>Ceci est un courriel automatisé.<br> Merci de ne pas répondre.Vous avez reçu ce message car vous nous avez communiqué votre adresse électronique.</div></body></html>",
       //<img  style:'width:50px' src='cid:uniqueID@creata.ee'> 
       attachments:[{
            filename:"logobd.jpg",
            path:`public/images/logobd.jpg`,
            cid:"uniqueID@creata.ee"

        }]
    }

    console.log(get_html_message(info));

    transport.sendMail(mail_options,function(error,result){
        if(error){
            console.log('error',error)
        }else{
            console.log('success',result)
        }
        transport.close()
    })

    transport.sendMail(mail_options1,function(error,result){
        if(error){
            console.log('error',error)
        }else{
            console.log('success',result)
        }
        transport.close()
    })
    
}

function get_html_message(name){
    let script=new Jsontableify({headerList: ['Salle De Bain', 'Cuisine', 'Buanderie'],
    excludeKeys: ['Count'],}).toHtml(name);
    return script
}

