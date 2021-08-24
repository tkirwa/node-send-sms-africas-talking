const app = require("express")();
const express = require("express");
const path = require("path");
const request = require("request");

const http = require("http").Server(app);
const public_dir = path.join(__dirname, "public");
const views_dir = path.join(__dirname, "views");

const PORT = 3000;

const base_url ='http://localhost';

const africas_username='alboom25';
const africas_api_key = '99a476f54f2322fddeab594568c1e5e2111d42dd0a038f0bb23a0fe8b96c9cc8';

app.use(function (req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token");
    req.__base_url = base_url;
    next();
});

app.disable("x-powered-by");

app.set("view engine", "ejs");
app.set("views", views_dir);

app.use(express.json({limit: "1mb",}));

app.use(express.urlencoded({limit: "1mb", extended: true }));

app.use(express.static(public_dir, {etag: false,maxAge: 365 * 24 * 3600000,}));

app.get("/", (req, res) => {
    res.render("main");
});

app.post("/", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "application/json",
    });

    var phone = req.body.smsPhone;
    var message = req.body.smsMessage;

    const options = {
        url: "https://api.africastalking.com/restless/send?username=" + africas_username + "&Apikey=" + africas_api_key + "&to=+" + phone + "&message=" + message,
        method: "GET",
        headers: {
            Accept: "application/json",
            "Accept-Charset": "utf-8",
        },
    };

    request(options, function (err, sms_res, body) {
        if (err) {
            let result = {sent:0, message:err};
            res.end(JSON.stringify(result));
        } else {
            if (body.toString().includes("requirement failed")) {
                let result = {sent:0, message:body};
                res.end(JSON.stringify(result));
            } else {
                var bd = JSON.parse(body);                
                if(bd){
                    var status = bd.SMSMessageData.Recipients[0].statusCode;                    
                    if (status == 100 || status == 101 || status == 102) {
                        let result = {sent:1, message:body};
                        res.end(JSON.stringify(result));
                    }else{
                        let result = {sent:0, message:bd.SMSMessageData.Recipients[0].status};
                        res.end(JSON.stringify(result));
                    }
                }
            }
        }
    });
    
   
   
    
 
});

function sendApiRequest(url, method, params, callback) {   
    const options = {
        url: url,
        method: method,
        headers: {
            Accept: "application/json",
            "Accept-Charset": "utf-8",           
        },
    };    
    request(options, function (err, res, body) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {       
            callback(null, body); 
        }
    });
}

http.listen(PORT, () => {
    console.log(`server running at ${base_url}:${PORT}`);
});

