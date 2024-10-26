const Boom = require('@hapi/boom');


const makeWASocket = require("@whiskeysockets/baileys").default;
const {
    DisconnectReason,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const store = {};

const getMessage = key => {
    const { id } = key;
    if (store[id]) return store[id].message;
}

// async function WaBot() {
//     const { state, saveCreds } = await useMultiFileAuthState('auth');
//     const sock = makeWASocket({
//         printQRInTerminal: true,
//         auth: state,
//         getMessage,
//     });
// }

// WaBot();

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            // const shouimport { Boom } from '@hapi/boom';
            d out
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', m => {
        console.log(JSON.stringify(m, undefined, 2))

        console.log('replying to', m.messages[0].key.remoteJid)
            // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    })
}
// run in main file
connectToWhatsApp()





const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;


async function connection_logic() {

    // console.log('connection logic starts!!!')
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state
    })
    sock.ev.on("connection.update", async(update) => {
        const { connection, lastDisconnect, qr } = update || {}

        if (qr) {
            console.log(qr)
        }

        if (connection === "close") {
            // const shouldReconnect = lastDisconnect ? .error ? .output ? .statusCode !== DisconnectReason.loggedOut;
            const shouldReconnect =
                lastDisconnect !== undefined &&
                lastDisconnect !== null &&
                lastDisconnect.error !== undefined &&
                lastDisconnect.error !== null &&
                lastDisconnect.error.output !== undefined &&
                lastDisconnect.error.output !== null &&
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                connection_logic()
            }
        }
    });

    sock.ev.on('creds.update', saveCreds)


    sock.ev.on('messages.upsert', m => {
        console.log(JSON.stringify(m, undefined, 2))

        console.log('replying to', m.messages[0].key.remoteJid)
            // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    });
}

connection_logic()