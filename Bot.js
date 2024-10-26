const makeWASocket = require("@whiskeysockets/baileys").default;
const {
    DisconnectReason,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

class Bot {
    #socket;
    #saveCred;
    #authFolder;
    #messageStore = {};
    
    constructor(config){
        this.#authFolder = config.authFolder || "auth";
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(this.#authFolder);
        this.#saveCred = saveCreds;

        this.#socket = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            getMessage: this.#getMessageFromStore,
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
    
    #getText(key, message) {
      try {
        let text = message.conversation || message.extendedTextMessage.text;
  
        if (key.participant) {
          const me = key.participant.slice(0, 12);
          text = text.replace(/\@me\b/g, `@${me}`);
        }
  
        return text;
      } catch (err) {
        return "";
      }
    }

    #getMessageFromStore = (key) => {
      const { id } = key;
      if (this.#messageStore[id]) return this.#messageStore[id].message;
    };

    #sendMessage = async (jid, messageText, ...args) => {
      try {
        // if (!this.#selfReply) content.text = content.text + this.#emptyChar;
  
        const sent = await this.#socket.sendMessage(jid,{ text : messageText}, ...args);
        this.#messageStore[sent.key.id] = sent;
      } catch (err) {
        console.log("Error sending message", err);
      }
    };

    #checkFormatOfInput(remoteJid,messageText)
    {
        this.#sendMessage(remoteJid,messageText);
    }

    #saveMessage(remoteJid,messageText)
    {
        this.#checkFormatOfInput(remoteJid,messageText);
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
            const {messages,type}  = events["messages.upsert"];
            if(type === "append")
            {
              return;
            }
            // console.log(JSON.stringify(messages, undefined, 2))
            // console.log(type)
         
            messages.map(async (msg) => {
              const { key, message } = msg;
              const text = this.#getText(key, message);
              // console.log("text : before "  + text);

              if (!message || text === "" ){
                // console.log('message _ '  + message);
                return;
              }
              this.#saveMessage(key.remoteJid,text);
            });
          }
        });
      }    
}

module.exports = Bot;