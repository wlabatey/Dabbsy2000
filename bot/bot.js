#!/usr/bin/env node

/*

Dabbsy2000 is a Chris Dabbs simulator based on a fork of the node-irc library by Martyn Smyth


TO DO:

    Basic:
        - Greeting on join
        - Detect technical terms and respond
        - Nuke command
        - Randomly timed messages
        - Op command
        - Check auth (based on whois data and/or nickname)

    Advanced:
        - Add / remove users from auth'd users list
        - More complete response chains / conversations
        - Meeting mode 

*/

const IRC = require('../lib/irc.js');

// Bot Config

const BOT = new IRC.Client('chat.freenode.net', 'Dabbsy2000',
    {   
        userName: 'Dabbsy2000',
        realName: 'Chris Dabbs',
        port: 6697,
        showErrors: true,
        autoRejoin: true,
        autoConnect: true,
        secure: true,
        debug: true,
        channels: ['#wangerz'],
    }
);

// Categorise people by nickname

const PEOPLE = {
    devs: [
        'BillTheBloke',
        'SimoneLivngstone',
        'SimoneLivingstone',
    ],
    streaming: [
        'U1',
        'crossthestreams',
    ],
};

// Dabbsy config

const DABBSY = {
    name: 'Dabbsy2000',
    channel: '#wangerz',
    methods: {
        // Kick everybody else from channel
        nuke(from) {

        },

        // Give operator status
        op(from) {

        },
        // Dance!!!
        dance(channel) {
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D\\-<\u0001'); }, 1000);
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D|-<\u0001');  }, 2000);
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D/-<\u0001');  }, 3000);
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D|-<\u0001');  }, 4000);
        }
    },
    responses: {
        greetings: [
            'Hellooooo!',
            'Helloo Helloo Helloo!',
            'Hi how\'s it going?',
        ],
        quotes: [
            'What\'s the ping rate onto that?',
            'Have you guys got your head around CDNs yet?',
            'Are we using Akamai or Cloudfront?',
            'I know the guys at Facebook... they\'re a really good bunch.',
            'Let me know if you want to take another peek at that code.',
            'Dev dev dev dev dev!', 
        ],
        error: [
            'Okay, I\'ll leave you guys to get on with that.',
            'I\'d love to stay and chat but I\'ve got a meeting with Ali in 5 minutes.',
            'Okay, that sounds great. Let\'s catch up tomorrow morning.',
            'Good work guys. Keep it up.',
        ],
    },
    triggers: {
        commands: {
            help: ['!help', '!commands'],
            nuke: ['!nuke', '!fuck', '!shit'],
            op: ['!op'],
            dance: ['!dance'],
        },
        greetings: [
            'Hello',
            'Hi',
            'Hola',
            'Alright',
        ],
        technicalTerms: [
            'database',
            'mongo',
            'mongodb',
            'meteor',
            'javascript',
            'bitrate',
            'CDN',
            'wordpress',
            'server',
            'C#',
            'c++',
            'php',
            'html',
            'css',
            'linux',
            'debian',
            'ubuntu',
            'arch',
            'isomorphic',
            'fullstack',
            'frontend',
            'backend',
            'developer',
            'dev',
        ],
    }
}

// Check user's whois data and/or nickname against admin list and return true or false

// function isAdmin(from) {
//     BOT.whois(from, function() {
//         console.log(this)
//     })
// }

function randomItemFromArray(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Returns random time in milliseconds between minimum and maximum amount in minutes
function randomTimeBetween(min, max) {
    let time = Math.floor(Math.random()*(max-min+1)+min)*60*1000;;
    console.log(time);
    return time;
}

BOT.addListener('error', function(message) {
    console.error(`ERROR: ${message.command}: ${message.args.join(' ')}`);
});

BOT.addListener('message#wangerz', function(from, message) {
    console.log(`${from}: ${message}`);
});

BOT.addListener('message', function(from, to, message) {
    console.log(`${from} => ${to}: ${message}`);

    // Message to channel that includes the command prefix '!'
    if (to.match(/^[#&]/) && message.match(/^[!&]/)) {


        if (DABBSY.triggers.commands.nuke.includes(message)) {
            let channel_users = BOT.chans['#wangerz'].users;
            let nicks_to_kick = [];

            console.log(nicks_to_kick);
            console.log(BOT.nick);

            for (nick in channel_users) {
                if (nick !== BOT.nick) {
                    nicks_to_kick.push(nick);
                }
            }

            nicks_to_kick.forEach((nick) => {
                BOT.send('KICK', DABBSY.channel, nick, `NUKED BY ${from}`);
            });
        }

        if (DABBSY.triggers.commands.dance.includes(message)) {
            DABBSY.methods.dance(to);
        }

        // BOT.say(to, 'Sorry I don\'t recognise that command!');
    }

    // Message to channel that includes 'Dabbsy2000'
    if (to.match(/^[#&]/) && message.includes(DABBSY.name)) {
        console.log("Message to Dabbsy2000!");
        // channel message to bot
        // if (message.includes(DABBSY.triggers.technicalTerms.forEach((el) => el))) {
        // // })       DABBSY.triggers.technicalTerms.includes(message)) {
        //     BOT.say(to, DABBSY.responses.quotes[0]);
        //     return;
        // }
        // if (DABBSY.triggers.greetings.includes(message)) {
        //     console.log('greeting detected!');
        //     BOT.say(to, greeting(from, DABBSY.responses.greetings));
        //     return;
        // }

        if (message.includes('hi') || message.includes('hello')) {
            BOT.say(to, `Hellooo ${from}!`);
            return;
        }
        if (message.includes('dance')) {
            Dabbsy.methods.dance(to);
        }
    }
    else {
        // private message
        console.log('private message');
    }
});

BOT.addListener('pm', function(nick, message) {
    console.log(`Got private message from ${nick}: ${message}`);
});

BOT.addListener('join', function(channel, who) {
    if (who === DABBSY.name) {
        BOT.say(channel, 'Hellooo Hellooo Helloooo! Sorry I\'m late, I had to walk the cat!');
    } else {
        BOT.say(channel, `Helloooooo ${who}!`);
    }
});

BOT.addListener('part', function(channel, who, reason) {
    console.log(`${who} has left ${channel}: ${reason}`);
});

BOT.addListener('kick', function(channel, who, by, reason) {
    console.log(`${who} was kicked from ${channel} by ${by}: ${reason}`);
});

// Repeatedly say quotes at random intervals
// For now, just says something every 15 minutes...

global.setInterval(() => {

    BOT.say(DABBSY.channel, randomItemFromArray(DABBSY.responses.quotes));

}, 600000);
