const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const chalk = require("chalk");
const fetch = (args) => import('node-fetch').then(({default: fetch}) => fetch(args));
const conf = require("./ekmek.json");

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    allowedMentions:{
        repliedUser: false,
        parse: ['users','roles','everyone']
    },
    presence: {
        activities: [
            {
                name: `null 💛 Steam`,
            }
        ],
           status: "dnd",
           
    }, 
});

client.once('ready', () => {
    console.log(chalk.bgGreen('Hello World.'));
    setInterval(sendIndirimBot, 18000000);

});


async function sendIndirimBot() {

    const channelName = conf.DISCORD_CHANNEL;
    const channel = client.channels.cache.find(channel => channel.name.toLowerCase() === channelName.toLowerCase());
    if (!channel) return console.error('Kanal ismi yanlış.');
    const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
    const data = await response.json();
    
    for (let i = 0; i < data.applist.apps.length; i++) {
        const app = data.applist.apps[i];
        const appInfo = await fetch(`https://store.steampowered.com/api/appdetails?appids=${app.appid}`);
        const appDetails = await appInfo.json();

        if (appDetails[app.appid] && appDetails[app.appid].success && appDetails[app.appid].data.price_overview && appDetails[app.appid].data.price_overview.initial !== appDetails[app.appid].data.price_overview.final) {
            const indirimYuzdesi = (((appDetails[app.appid].data.price_overview.initial / 100) - (appDetails[app.appid].data.price_overview.final / 100)) / ((appDetails[app.appid].data.price_overview.initial / 100))) * 100;
            const embed = {
                title: 'YENİ İNDİRİM!!!',
                url: `https://store.steampowered.com/app/${app.appid}`,
                color: 16766720,
                fields: [
                    {
                        name: 'Oyun İsmi',
                        value: appDetails[app.appid].data.name,
                        inline: true
                    },
                    {
                        name: 'Eski Fiyat',
                        value: appDetails[app.appid].data.price_overview ? `$${appDetails[app.appid].data.price_overview.initial / 100}` : 'Ücretsiz',
                        inline: true
                    },
                    {
                        name: 'Yeni Fiyat',
                        value: appDetails[app.appid].data.price_overview ? `$${appDetails[app.appid].data.price_overview.final / 100}` : 'Ücretsiz',
                        inline: true
                    },
                    {
                        name: 'İndirim Yüzdesi',
                        value: `${indirimYuzdesi.toFixed(2)}%`,
                        inline: true
                    },
                ],
                footer: {
                    text: `Steam İndirim Botu`
                },
                timestamp: new Date(),
                Image:{
                    url: appDetails[app.appid].data.header_image
                }
            };
            const button = new ButtonBuilder()
                .setURL('https://github.com/This-null')
                .setLabel('Github 💛')
                .setStyle(ButtonStyle.Link)
				.setDisabled(false);

            const row = new ActionRowBuilder()
                .addComponents(button);

            await channel.send({ embeds: [embed], components: [row] }).catch(err => console.log(chalk.red('Mesaj Gönderirken Bir Hata Oluştu.')))
            await new Promise(resolve => setTimeout(resolve, 15000)); 
        }
    }
}
        
    






client.login(conf.TOKEN);