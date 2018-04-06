const google         = require('googleapis');
const authentication = require("./authentication");
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Telegraf = require('telegraf');

// const bot = new Telegraf("572580310:AAECk16vsEulh9r-H_awrtUd3NIbW33l7H8");
const bot = new Telegraf('534687045:AAHH2pPr2tYPDMiyRTlv83QmmTAbIAChUjs');

let datum    = [['test', '1', '1']];
let appointment = [];
let guests = [];
let guest_id;

const admin_id = "401516375";
// 401516375
// 264414372
bot.webhookReply = true;

// function appendCost(auth) {
//     let sheets = google.sheets('v4');
//     sheets.spreadsheets.values.append({
//         auth: auth,
//         spreadsheetId: '1dpG3kWhjxTCoDtJ6kQ5C9ESPpCA_kyYfzWq_u6Xq7u0',
//         range: 'TBot!A2', //Change Sheet1 if your worksheet's name is something else
//         valueInputOption: "USER_ENTERED",
//         resource: {
//             values: appointment
//         }
//     }, (err, response) => {
//         if (err) {
//             console.log('The API returned an error: ' + err);
//             return;
//         } else {
//             console.log("Costs Appended");
//         }
//     });
// }

function getData(auth) {
    guests = [];
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: '1dpG3kWhjxTCoDtJ6kQ5C9ESPpCA_kyYfzWq_u6Xq7u0',
        range: 'TBot!A3:A', //Change Sheet1 if your worksheet's name is something else
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
                if ( cell == guest_id ) {
                    guest_id = true;
                }
                guests.push(cell)
            }
        }
        // console.log(guest_id)
        // console.log(guests.includes(guest_id))

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




bot.start((ctx) => ctx.reply('Привет! Этот бот поможет тебе забронировать душевное местечко ВДУШЕ! ;) \n' +
    'Нажми на /book для создания брони.'));

bot.command('book', (ctx, next) => {
    appointment = [[]];
    guest_id = ctx.message.from.id;
    authentication.authenticate().then((auth)=>{
        getData(auth);
    });
    if (guest_id == true) {
        return next();
    } else {
        appointment[0].push(ctx.message.from.id, ctx.message.from.first_name, ctx.message.from.last_name);
        let date = new Date(ctx.message.date * 1000);
        let dateRes = `${date.getFullYear()}.${date.getMonth() +1}.${date.getDate()}`;
        appointment[0][6] = dateRes;
        console.log(dateRes);
        ctx.reply('Отлично, давай забронируем тебе местечко!')
        ctx.reply(appointment[1])
        return ctx.reply('Для начала, напиши свой номер, чтобы мы могли связаться с тобой и уточнить детали. \n' +
            'Ещё мы можем иногда писать тебе о наших акциях, если захочешь.');
        // return next();
    }
});

bot.use((ctx, next) => {
        ctx.state.role = 'started_booking';
        console.log(ctx.state.role);
        return next();
});

bot.hears(/^((\\+7|7|8)+([0-9]){10})$/gm, (ctx, next) => {
    if (appointment[0] != undefined) {
        // console.log(ctx.state.role)
        // appointment.push(ctx.message.text);
        appointment[0][3] = ctx.message.text;
        return ctx.reply("Отлично, осталось немного! \nСколько будет человек?");
    }
});

bot.use((ctx, next) => {
        ctx.state.role = 'entered_phone';
        console.log(ctx.state.role); 
        return next();
});

bot.hears(/\d{1}/, (ctx, next) => {
    if (appointment[0] != undefined) {

        if (ctx.message.text.length != 1) {
            return ctx.reply("Это уже многовато... Пожалуйста, позвоните по номеру 8 800 355 35 35 для уточнения деталей.");
        } else {
            appointment[0][4] = ctx.match[0];
            return ctx.reply('Прекрасно! Теперь только укажи, когда планируется визит и заказ улетит админам!) ' +
                ' \nПока бот находится в разработке, поэтому допустимые значения:' +
                '\nСегодня, Завтра, Другое')
        }
    }
});

bot.hears('Сегодня', (ctx, next) => {
    if (appointment[0] != undefined) {

        // console.log(ctx.state.role)
        // appointment.push(ctx.message.text);
        appointment[0][5] = ctx.message.text;
        return ctx.reply("Супер! Нажми /send и столик будет забронирован!");
    }
});
bot.hears('Завтра', (ctx, next) => {
    if (appointment[0] != undefined) {

        // console.log(ctx.state.role)
        // appointment.push(ctx.message.text);
        appointment[0][5] = ctx.message.text;
        return ctx.reply("Супер! Нажми /send и столик будет забронирован!");
    }
});
bot.hears('Другое', (ctx, next) => {
    if (appointment[0] != undefined) {

        // console.log(ctx.state.role)
        // appointment.push(ctx.message.text);
        appointment[0][5] = ctx.message.text;
        // appointment[0][6] = ctx.message.text;
        return ctx.reply("Супер! Нажми /send и столик будет забронирован!");
    }
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
    if (appointment[0] != undefined) {

//     if (appointment[0].length != 6) {
//         ctx.reply("Так-так... Что-то заполнено не правильно, проверь ещё разок.");
//         ctx.reply(
//             `Номер телефона: ${appointment[0][3]}
// Количество человек: ${appointment[0][4]}
// Дата визита: ${appointment[0][5]}`
//         );
//         ctx.reply("Чтобы поправить запрос, отправь /book ещё раз, постарайся не ошибиться)");
//     } else {
        console.log(appointment);
        ctx.reply(
            `Номер телефона: ${appointment[0][3]}
Количество человек: ${appointment[0][4]}
Дата визита: ${appointment[0][5]}`
        );
        authentication.authenticate().then((auth) => {
            // appendCost(auth);
            appendData(auth);
            ctx.telegram.sendMessage(admin_id, `Номер телефона: ${appointment[0][3]}
Количество человек: ${appointment[0][4]}
Дата визита: ${appointment[0][5]}`);
            ctx.reply("Gotcha! Скоро мы позвоним тебе и уточним всё ещё разок!)")
        })
        // }
    }
});

// ----------------------------------------
bot.startPolling();

require('http')
    .createServer(bot.webhookCallback('/secret-path'))
    .listen(3000);

