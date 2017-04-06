#!/usr/bin/env node

/*

Dabbsy2000 is a Chris Dabbs simulator based on a fork of the node-irc library by Martyn Smyth


TO DO:

    Basic:

        - Add / list / remove quotes
        - Detect changes to github repositories and announce to channel

        - Greeting on join (done)
        - Detect technical terms and respond (done)
        - Nuke command (done)
        - Randomly timed messages (done)
        - Op command / auto Op (done)
        - Check auth & auto op authorised users (based on whois data and nickname) (done)
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
        debug: false,
        channels: ['#wangerz'],
    }
);

// Categorise people by nickname

const PEOPLE = {
    admins: [
        'BillTheBloke'
    ],
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
            let channel_users = BOT.chans['#wangerz'].users;
            let nicks_to_kick = [];
            
            for (nick in channel_users) {
                if (nick !== BOT.nick) {
                    nicks_to_kick.push(nick);
                }
            }

            nicks_to_kick.forEach((nick) => {
                BOT.send('KICK', DABBSY.channel, nick, `NUKED BY ${from}`);
            });
        },

        // Give operator status
        op(nick) {
            BOT.send('MODE', DABBSY.channel, '+o', nick);
        },
        // Dance!!!
        dance(channel) {
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D\\-<\u0001'); }, 1000);
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D|-<\u0001');  }, 2000);
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D/-<\u0001');  }, 3000);
                setTimeout(function() { BOT.say(channel, '\u0001ACTION dances: :D|-<\u0001');  }, 4000);
        },
        voice(nick) {
            BOT.send('MODE', DABBSY.channel, '+v', nick);
        }
    },
    responses: {
        excuses: [
            'I had to walk the cat!',
            'I literally just got back from America!',
            'I just got off the phone with the guys at Google!',
            'I\'ve literally just gotten out of a meeting!',
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
            'hello',
            'hi',
            'hola',
            'alright',
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
            'c#',
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
    },
};

// --------------------------------------------------------------------------------------------------------------

// --- Functions ---

// Check user's whois account data against admin list and return true or false

function isAnAdmin(nick) {
    return new Promise((resolve, reject) => {
        let info = BOT.whois(nick, (info) => {
            if (PEOPLE.admins.includes(info.account)) {
                resolve(true);
            } else {
                reject(`${nick} is not authorised to be an operator`);
            }
        });
    });
}

function randomItemFromArray(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Returns random time in milliseconds between minimum and maximum amount in minutes
function randomTimeBetween(min, max) {
    let time = Math.floor(Math.random()*(max-min+1)+min)*60*1000;;
    return time;
}

// Splits a string into an array containing each word and then checks 
// if any element of that array matches any element of another array
function searchArrayForString(string, array) {
    let stringArr = string.split(' ');
    return stringArr.some((item) => array.includes(item.toLowerCase())); 
}

// --------------------------------------------------------------------------------------------------------------

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
            DABBSY.methods.nuke(from);
            return;
        }

        if (DABBSY.triggers.commands.dance.includes(message)) {
            DABBSY.methods.dance(to);
            return;
        }
    }

    // Message to channel that includes 'Dabbsy2000'
    if (to.match(/^[#&]/) && message.includes(DABBSY.name)) {
        if (searchArrayForString(message, DABBSY.triggers.greetings)) { 
            BOT.say(to, `Hellooo ${from}!`);
            return;
        }
    }

    // Message to channel
    if (to.match(/^[#&]/)) {
        // Message to channel contains item from technical terms array, randomised to occur 2/5 of the time
        if (searchArrayForString(message, DABBSY.triggers.technicalTerms) && Math.random() > 0.6) {
            BOT.say(to, randomItemFromArray(DABBSY.responses.error));
            return;
        }
    }
});

BOT.addListener('pm', function(nick, message) {
    console.log(`Got private message from ${nick}: ${message}`);

    if (DABBSY.triggers.commands.op.includes(message)) {
        isAnAdmin(nick).then(() => {
            DABBSY.methods.op(nick);
        }).catch(() => {
            BOT.say(nick, "You are not authorised to be a channel operator!");
        });
    }
});

BOT.addListener('join', function(channel, who) {
    if (who === DABBSY.name) {
        BOT.say(channel, `Helloooo! Sorry I'm late ${randomItemFromArray(DABBSY.responses.excuses)}`);
    } else {
        BOT.say(channel, `Helloooooo ${who}!`);
        isAnAdmin(who).then(() => {
            DABBSY.methods.op(who);
        }).catch(() => {
            DABBSY.methods.voice(who);
        });
    }
});

BOT.addListener('part', function(channel, who, reason) {
    console.log(`${who} has left ${channel}: ${reason}`);
});

BOT.addListener('kick', function(channel, who, by, reason) {
    console.log(`${who} was kicked from ${channel} by ${by}: ${reason}`);
});

// Say random quote at a random interval between 15 and 60 minutes
(function loop() {
    let rand = randomTimeBetween(30, 90);
    setTimeout(function() {
        BOT.say(DABBSY.channel, randomItemFromArray(DABBSY.responses.quotes));
        loop();      
    }, rand);
})();
