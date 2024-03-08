const WebSocket = require('ws');

// node --version # Should be >= 18
// npm install @google/generative-ai

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");


const Chat = async () => {
  try {
    // Create a WebSocket server`
    const wss = new WebSocket.Server({ port: 8080 });

    const MODEL_NAME = "gemini-1.0-pro";
    const API_KEY = process.env.API_KEY; // Replace with your actual API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    wss.on('connection', ws => {
      console.log('Client connected');

      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      let chat = null;

      ws.on('message', async message => {
        try {
          // Assume the message is the prompt for the chat
          const prompt = message.toString();

          if (!chat) {
            chat = model.startChat({
              generationConfig,
              safetySettings,
              history: [],
            });
          }

          chat.sendMessageStream(prompt).then(async (result) => {
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              const lines = chunkText.split('\n');
              for (const line of lines) {
                ws.send(line + '\n');
                await new Promise(resolve => setTimeout(resolve, 100)); // Delay between sending each line (adjust as needed)
              }
            }
          });          
        } catch (error) {
          console.error('Error in message handling:', error);
          ws.send('An error occurred while processing your message.');
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        chat = null;
      });
    });
  } catch (error) {
    console.error('Error in WebSocket server setup:', error);
  }
};

module.exports = Chat;