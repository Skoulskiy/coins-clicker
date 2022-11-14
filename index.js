const mysql = require('mysql');
const TelegramApi = require('node-telegram-bot-api');
const token = "#";
const bot = new TelegramApi(token, {polling: true});

const opts = {
    reply_markup: JSON.stringify({ force_reply: true }
)};

const connect = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    database: "clicker",
    password: ""
});

connect.connect(err => {
    if(err) {
        return err;
    } else {
        console.log('Connection sucesfully!');
    }
});

const start = () => {
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if(text == "Click 👆") {
            let query = "SELECT `id` FROM `users` WHERE `id` = ";
            let query1 = query + `${msg.from.id}`;
            connect.query(query1, (err, result) => {
                if(result != 0) {
                    let query2 = "UPDATE `users` SET `coins` = `coins` + 1 WHERE `id` = "
                    let query3 = query2 + msg.from.id;
                    connect.query(query3);
                    bot.sendMessage(chatId, "You have earned 1 coin 💰")
                } else {
                    bot.sendMessage(chatId, "You are not authorization, please use: /start😱");
                }
            })
        }
        if(text == "My profile 🔍") {
            let query = "SELECT `id` FROM `users` WHERE `id` = ";
            let query1 = query + `${msg.from.id}`;
            connect.query(query1, async (err, result) => {
                if(result != 0) {
                    let query2 = "SELECT `id` , `name` , `coins` FROM `users` WHERE `id` = "
                    let query3 = query2 + msg.from.id;
                    connect.query(query3, (err, rows) =>{
                        console.log(rows);
                        connect.query(query3, (err, result) => {
                            bot.sendMessage(chatId, `🔍 ${rows[0].name} | ${rows[0].id}\n\n💰 Your coins: ${rows[0].coins}`);
                            console.log(err);
                        });
                    }) } else {
                    bot.sendMessage(chatId, "You are not authorization, please use: /start😱");
                }
            })
        }
        if(text == "/start") {
            let query = "SELECT `id` FROM `users` WHERE `id` = ";
            let query1 = query + `${msg.from.id}`;
            connect.query(query1, async (err, result) => {
                if(result != 0){
                    bot.sendMessage(chatId, "You alerady registraion 😱", {
                        "reply_markup": {
                            "keyboard": [["Click 👆", "My profile 🔍"]]
                        }
                    }); 
                } else{
                    const start = await bot.sendMessage(chatId, "Hi, what can i call you?", {
                        reply_markup: {
                            force_reply: true
                        },
                    });
                    bot.onReplyToMessage(chatId, start.message_id, async (nameMsg) => {
                        const name = nameMsg.text;
                        let query1 = "INSERT INTO `users` (`id`, `name`, `coins`) VALUES ";
                        let query = query1 + `(${msg.from.id}, "${name}", 0);`;
                        console.log(query);
                        connect.query(query);
                        await bot.sendMessage(chatId, `Okay, i call you: ${name} 🐱`, {
                            "reply_markup": {
                                "keyboard": [["Click 👆", "My profile 🔍"]]
                            }
                        })
                    })
                    console.log(err);
                }
            });
        }
    });
};

start();