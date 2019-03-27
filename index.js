if (!process.env.TOKEN) {
    require(`dotenv`).config();
}

const request = require(`request-promise`);
const telegraf = require(`telegraf`);
const bot = new telegraf(process.env.TOKEN);

const chars = {
    '&quot;': `"`,
    '&gt;': `>`,
    '&lt;': `<`,
};

const charsRegex = new RegExp(`(${Object.keys(chars).join(`|`)})`, `g`);
const decode = text => text.replace(charsRegex, (_, char) => chars[char]);
const getInsult = async () => decode(await request(`https://evilinsult.com/generate_insult.php?lang=en`));

bot.catch(console.log);

bot.start(async ctx => {
    await ctx.reply(`Hi, I'm an evil insulter bot. Send /insult or click the button under this message to use me.`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `Use me inline`,
                        switch_inline_query: ``,
                    },
                ],
            ],
        },
    });
});

bot.command(`insult`, async ctx => {
    const insult = await getInsult();
    await ctx.reply(insult);
});

bot.on(`inline_query`, async ctx => {
    const insult = await getInsult();
    await ctx.answerInlineQuery(
        [
            {
                type: `article`,
                id: 0,
                title: `Insult`,
                description: insult,
                input_message_content: {
                    message_text: insult,
                },
            },
        ], {
            cache_time: 0,
            is_personal: true,
        }
    );
});

bot.launch();
