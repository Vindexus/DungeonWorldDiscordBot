const token       = process.env.TOKEN;
const dw          = require('dungeonworld-data');
const Discord     = require('discord.js');

const client      = new Discord.Client();
const data        = dw.basicData;


client.on('ready', () => {
  console.log('Bot is ready.');
});

client.on('message', message => {
  //All commands are prefaced by a !
  if (message.content.substr(0, 1) == '!') {
    const key = message.content.substr(1).toLowerCase().split(' ').join('_').split('&').join('and');
    const toSearch = [data, data.moves, data.classes, data.tags, data.monsters, data.equipment];
    let found = false;
    for(var i = 0; i < toSearch.length; i++) {
      const searching = toSearch[i];
      if(searching[key]) {
        found = true;
        let reply = '';
        let parts = [];
        const obj = searching[key];
        if(obj.name) {
          parts.push('**' + obj.name + '**');
        }
        if(obj.description) {
          parts.push(obj.description);
        }
        message.channel.send(parts.join("\n"));
        break;
      }
    };
    if(!found) {
      message.channel.send('Could not find: *' + key + '*');
    }
  }
});

//Log the bot in
client.login(token);