const Markup         = require('telegraf/markup');
const Extra          = require('telegraf/extra');
const Telegraf       = require('telegraf');
const google         = require('googleapis');
const authentication = require("./authentication");
// const Telegram = require('telegraf/telegram');
const fs             = require('fs');

let datum    = [['test', '1', '1']];
let appointment = [];

const bot = new Telegraf('534687045:AAHH2pPr2tYPDMiyRTlv83QmmTAbIAChUjs');
bot.webhookReply = true;

function appendCost(auth) {
    let sheets = google.sheets('v4');
    sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: '1dpG3kWhjxTCoDtJ6kQ5C9ESPpCA_kyYfzWq_u6Xq7u0',
        range: 'TBot!A2', //Change Sheet1 if your worksheet's name is something else
        valueInputOption: "USER_ENTERED",
        resource: {
            values: appointment
        }
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log("Costs Appended");
        }
    });
}
//
// bot.on('text', (ctx) => {
//     // Some logic goes here
//     datum = [[ctx.from.id, ctx.from.first_name + ' ' + ctx.from.last_name, ctx.from.username, ctx.update.message.text]];
//     console.log(ctx.update.message.text);
//     // Append data and send response to the user
//     authentication.authenticate().then((auth)=>{
//         // appendCost(auth);
//         appendCost(auth);
//         ctx.reply("Отлично, мы получили заявку и скоро позвоним, чтобы всё уточнить!")
//     })
// });


// ----------------------------------------


// let appointment = [];

bot.start((ctx) => ctx.reply('Привет! Этот бот поможет тебе забронировать душевное местечко ВДУШЕ! ;) \nНапиши /book для создания брони! Админ обязательно уточнит твою заявку, как только увидит.'));

bot.command('book', (ctx, next) => {
    appointment = [];
    appointment.push(ctx.message.from.id, ctx.message.from.first_name, ctx.message.from.last_name);
    console.log(ctx.message.from)
    ctx.reply('Отлично, давай забронируем тебе местечко!')
    return ctx.reply('Для начала, напиши свой номер, чтобы мы могли связаться с тобой и уточнить детали. \nЕщё мы можем иногда писать тебе о наших акциях, если захочешь.');
    // return next();
});

bot.use((ctx, next) => {
    ctx.state.role = 'started_booking';
    console.log(ctx.state.role);
    return next();
});

bot.hears(/^((\\+7|7|8)+([0-9]){10})$/gm, (ctx, next) => {
    // console.log(ctx.state.role)
    // appointment.push(ctx.message.text);
    appointment[3] = ctx.message.text;
    return ctx.reply("Отлично, осталось немного! \nСколько будет человек?");
});

bot.use((ctx, next) => {
    ctx.state.role = 'entered_phone';
    console.log(ctx.state.role);
    return next();
});

bot.hears(/\d{1}/, (ctx, next) => {
    if (ctx.message.text.length != 1) {
        return ctx.reply("Это уже многовато... Пожалуйста, позвоните по номеру 8 800 355 35 35 для уточнения деталей.");
    } else {
        // appointment.push(ctx.match[0]);
        appointment[4] = ctx.match[0];
        // ctx.reply("Прекрасно! Теперь только укажи, когда планируется визит и заказ улетит админам!)");
        ctx.reply(Markup.keyboard(['Сегодня', 'Завтра', 'Другое']).oneTime().resize().extra());
            // .extra()
    }
});

bot.hears('Сегодня', (ctx, next) => {
    // console.log(ctx.state.role)
    // appointment.push(ctx.message.text);
    appointment[5] = ctx.message.text;
    return ctx.reply("Супер! Отправь /send, чтобы подтвердить заказ");

});
bot.hears('Завтра', (ctx, next) => {
    // console.log(ctx.state.role)
    // appointment.push(ctx.message.text);
    appointment[5] = ctx.message.text;
    return ctx.reply("Супер! Отправь /send, чтобы подтвердить заказ");

});
bot.hears('Другое', (ctx, next) => {
    // console.log(ctx.state.role)
    // appointment.push(ctx.message.text);
    appointment[5] = ctx.message.text;
    return ctx.reply("Супер! Отправь /send, чтобы подтвердить заказ");

});

bot.use((ctx, next) => {
    ctx.state.role = 'entered_persons';
    console.log(ctx.state.role);
    return next();
});

bot.use((ctx, next) => {
    ctx.state.role = 'completed';
    console.log(ctx.state.role);
    console.log(appointment);
    return next();
});

bot.command('send', (ctx) => {
    if (appointment.length != 6) {
        ctx.reply("Так-так... Что-то заполнено не правильно, проверь ещё разок.");
        ctx.reply(
            `Номер телефона: ${appointment[3]}
Количество человек: ${appointment[4]}
Дата визита: ${appointment[5]}`
        );
        ctx.reply("Чтобы поправить запрос, отправь /book ещё раз, постарайся не ошибиться)");
    } else {
        console.log(appointment);
        ctx.reply(
            `Номер телефона: ${appointment[3]}
Количество человек: ${appointment[4]}
Дата визита: ${appointment[5]}`
        );
        authentication.authenticate().then((auth)=>{
            // appendCost(auth);
            appendCost(auth);
            ctx.reply("Gotcha! Скоро мы позвоним тебе и уточним всё ещё разок!)")
        })
    }
});

// ----------------------------------------
bot.startPolling();

require('http')
    .createServer(bot.webhookCallback('/secret-path'))
    .listen(3000);