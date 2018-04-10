const google         = require('googleapis');
const authentication = require("./authentication");
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Telegraf = require('telegraf');

// const bot = new Telegraf("572580310:AAECk16vsEulh9r-H_awrtUd3NIbW33l7H8");
const bot = new Telegraf('534687045:AAHH2pPr2tYPDMiyRTlv83QmmTAbIAChUjs');

let datum    = [['test', '1', '1']];
let appointment = [];
let discounts = [];
let abouts = [];
let guest_id;

const admin_id = "264414372";
// 401516375
// 264414372
bot.webhookReply = true;

function getDataDiscounts(auth) {
    guests = [];
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: '1dpG3kWhjxTCoDtJ6kQ5C9ESPpCA_kyYfzWq_u6Xq7u0',
        range: 'Discounts!A2:A', //Change Sheet1 if your worksheet's name is something else
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var rows = response.values;
        if (rows.length === 0) {
            console.log('No data found.');
        } else {
            for (var i = 0; i < rows.length; i++) {
                var cell = rows[i][0];
                discounts.push(cell)
            }
        }
        // console.log(guest_id)
        // console.log(guests.includes(guest_id))

    });
}

function getDataAbout(auth) {
    guests = [];
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: '1dpG3kWhjxTCoDtJ6kQ5C9ESPpCA_kyYfzWq_u6Xq7u0',
        range: 'About!A2:C19', //Change Sheet1 if your worksheet's name is something else
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var rows = response.values;
        if (rows.length === 0) {
            console.log('No data found.');
        } else {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (abouts.phones){
                    abouts.phones = abouts.phones + "\n" + row[0]
                } else {
                    abouts.phones = row[0]
                }

                if (abouts.hours){
                    abouts.hours = abouts.hours + "\n" + row[1]
                } else {
                    abouts.hours = row[1]
                }

                if (abouts.address && row[2]){
                    abouts.address = abouts.address + "\n" + row[2]
                } else if (row[2]) {
                    abouts.address = row[2]
                }

            }
            console.log(abouts)
        }
    });
}

function appendData(auth) {
    var sheets = google.sheets('v4');
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
            console.log("Appended");
        }
    });
}


authentication.authenticate().then((auth)=>{
    appendData(auth);
});
authentication.authenticate().then((auth)=>{
    getDataDiscounts(auth);
});
authentication.authenticate().then((auth)=>{
    getDataAbout(auth);
});

bot.command('menu', (ctx) => {
    ctx.reply('Ваше меню, сэр', Markup
    .keyboard(['Забронировать', 'Акции', 'О нас'])
    .resize()
    .extra()
)
})

bot.start(({ reply }) =>
reply('Привет! Этот бот поможет тебе забронировать душевное местечко ВДУШЕ и получить всю необходимую информацию! ;)', Markup
    .keyboard(['Забронировать', 'Акции', 'О нас'])
    .resize()
    .extra()
)
)

bot.hears('Забронировать', (ctx) => {
    ctx.reply('Отлично, давай забронируем тебе местечко!\n' +
    'У нас тут есть форма, с которой всё быстро и красиво, заполняй быстрее, мы тебя ждем)')
    return ctx.reply('https://docs.google.com/forms/d/e/1FAIpQLScuq7RFVw0JGdhUB-06nwvi_GLL5PjMZwDJNfkSe9M4kQclvg/viewform')
});

bot.hears('Акции', (ctx) => {
    ctx.reply(`Смотри, что у нас есть на сегодня:`)
    for (let item of discounts) {
        ctx.reply(item)
    }
})

bot.hears('О нас', ({ reply }) =>
reply('Выбери ону из категорий', Markup
    .keyboard(['Часы работы', 'Телефон', 'Адрес', '/menu'])
    .resize()
    .extra()
)
)

bot.hears('Часы работы', (ctx) => {
    ctx.reply(abouts.hours)
})

bot.hears('Телефон', (ctx) => {
    ctx.reply(abouts.phones)
})

bot.hears('Адрес', (ctx) => {
    ctx.reply(abouts.address)
})

bot.startPolling();


require('http')
    .createServer(bot.webhookCallback('/secret-path'))
    .listen(3000);