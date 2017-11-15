const token       = process.env.TOKEN;
const dw          = require('dungeonworld-data');
const Discord     = require('discord.js');

const client      = new Discord.Client();
const data        = dw.basicData;

function sendNotFound (message, params) {
  return message.channel.send('Could not find: `' + params + '`');
}

function sendBasicReply (message, obj) {
  return message.channel.send(getBasicReply(obj));
}

function paramToKey (param) {
  return param.trim().toLowerCase().split('&').join('and').split(' ').join('_').split("'").join('');
}

function listToNames (list) {
  return list.map((item) => {
    return item.name
  }).join(', ');
}

function findClosestKey (map, givenKey) {
  let closest = false;
  let keys = Object.keys(map);
  for(var i = 1; i <= givenKey.length; i++) {
    let piece = givenKey.substr(0, i);
    console.log('Searching for: ' + piece);
    for(var k = 0; k < keys.length; k++) {
      let key = keys[k];
      console.log('Checking ' + key);
      if(key.indexOf(piece) != -1) {
        closest = key;
        console.log('New closest: ' + closest);
        break;
      }
    }
  }
  return closest;
}

//Returns the pieces of the most basic type of response
function getBasicReply (obj) {
  let reply = [];
  if(obj.name) {
    reply.push('**' + obj.name + '**');
  }
  if(obj.description) {
    reply.push(obj.description);
  }
  if(obj.tags) {
    const tags = obj.tags.map((tag) => {
      return dw.helpers.tag(tag);
    });

    reply.push('*Tags:* ' + tags.join(', '));
  }
  console.log('reply',reply);
  return reply;
}

const commands = {
  move: {
    fn: function (message, params) {
      params = paramToKey(params);
      const key = findClosestKey(data.moves, params);
      const move = data.moves[key];
      if(!move) {
        return sendNotFound(message, params);
      }
      let reply = ['**' + move.name + '**'];
      if(move.requires) {
        reply.push('*Requires: ' + data.moves[move.requires].name + '*');
      }
      reply.push(move.description);
      return message.channel.send(reply.join("\n"));
    },
    help: "Returns info on a move. Example: `!move Duelist's Parry`"
  },
  item: {
    fn: function (message, params) {
      params = paramToKey(params);
      const key = findClosestKey(data.equipment, params);
      const move = data.equipment[key];
      if(!move) {
        return sendNotFound(message, params);
      }
      return sendBasicReply(message, move);
    },
    help: "Returns info on an item. Example: !item short sword"
  },
  tag: {
    fn: function (message, params) {
      params = paramToKey(params);
      const tag = dw.helpers.getTag(params);
      if(!tag) {
        return sendNotFound(message, params);
      }
      return sendBasicReply(message, tag);
    },
    help: 'Returns info on a tag. Example: `!tag near`'
  },
  'class': {
    fn: function (message, params) {
      params = params.split(' ');
      params = paramToKey(params[0]);
      const key = findClosestKey(data.classes, params);
      if(!key) {
        return sendNotFound(message, key);
      }
      const cls = data.classes[key];
      let reply = ['**' + cls.name + '**'];
      reply.push('Hit Points: ' + cls.base_hp + '+Constitution');
      reply.push('Damage: ' + cls.damage);
      reply.push('Alignments: ' + listToNames(cls.alignments_list));
      reply.push('Races: ' + listToNames(cls.race_moves));
      reply.push('Starting Moves: ' + listToNames(cls.starting_moves));
      return message.channel.send(reply.join("\n"));
    },
    help: 'Returns some basic info about a class. Example: `!class fighter`'
  },
  looks: {
    fn: function (message, params) {
      params = params.split(' ');
      params = paramToKey(params[0]);
      const key = findClosestKey(data.classes, params);
      if(!key) {
        return sendNotFound(message, key);
      }
      const cls = data.classes[key];
      let reply = cls.looks.map((list) => {
        return list.join(', ');
      });
      message.channel.send('**' + cls.name + '** looks *(choose one from each)*:\n' + reply.join('\n'));
    },
    help: 'Shows all the look options for a class.\nExample: `!looks fighter`'
  },
  help: {
    fn: function (message, params) {
      if(params) {
        params = paramToKey(params);
        if(commands[params]) {
          return message.channel.send(commands[params].help);
        }
      }
      else {
        return message.channel.send('**Usage:** `!help ' + Object.keys(commands).filter((cmd) => {
          return commands[cmd].help
        }).join('|') + '`')
      }
    }
  }
}

client.on('ready', () => {
  console.log('Bot is ready.');
});

client.on('message', message => {
  const content = message.content;
  //All commands are prefaced by a !
  if (content.substr(0, 1) == '!') {
    const until = content.indexOf(' ') == -1 ? content.length : content.indexOf(' ');
    const command = content.substr(1, until).trim();

    if(commands.hasOwnProperty(command)) {
      const params = content.substr(command.length+1).trim();
      return commands[command].fn(message, params);
    }
    else {
      console.log('commands[command]',commands[command]);
      message.channel.send('Command not found: `' + command + '`');
    }
  }
});

//Log the bot in
client.login(token);