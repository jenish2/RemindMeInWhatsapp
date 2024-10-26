const makeWASocket = require("@whiskeysockets/baileys").default;
const {
    DisconnectReason,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

class Bot {
    #socket;
    #saveCred;
    #authFolder;
    
    constructor(config){
        this.#authFolder = config.authFolder || "auth";
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(this.#authFolder);
        this.#saveCred = saveCreds;

        this.#socket = makeWASocket({
            printQRInTerminal: true,
            auth: state
        })
    }

    async read_reminder()
    {
        this.#socket.ev.on('messages.upsert', m => {
            console.log(JSON.stringify(m, undefined, 2))

            console.log('replying to', m.messages[0].key.remoteJid)
                // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
        });
    }

    async #restart() {
        await this.connect();
        await this.run();
    }

    
    async run() {
        this.#socket.ev.process(async (events) => {
          if (events["connection.update"]) {
            const update = events["connection.update"];
            const { connection, lastDisconnect } = update;
    
            if (connection === "close") {
              // reconnect if not logged out
              if (
                lastDisconnect?.error?.output?.statusCode ===
                DisconnectReason.loggedOut
              ) {
                console.log("Connection closed. You are logged out.");
              } else if (
                lastDisconnect?.error?.output?.statusCode ===
                DisconnectReason.timedOut
              ) {
                console.log(
                  new Date().toLocaleTimeString(),
                  "Timed out. Will retry in 1 minute."
                );
                setTimeout(this.#restart.bind(this), 60 * 1000);
              } else {
                this.#restart();
              }
            }
          }
    
          if (events["creds.update"]) {
            this.#socket.ev.on('creds.update', this.#saveCred);
          }
    
          if (events["messages.upsert"]) {
            const { messages } = events["messages.upsert"];
            
            messages.forEach(async (msg) => {
              const { key, message } = msg;
              const remoteJid = key["remoteJid"] 
              const messageText = message["conversation"]
              console.log(remoteJid);
              console.log(messageText);
              await this.#socket.sendMessage(remoteJid, { text: 'Reminder Noted : ' + messageText })
            });
          }
        });
      }    
}

module.exports = Bot;