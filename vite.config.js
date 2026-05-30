import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { GoogleGenerativeAI } from "@google/generative-ai"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "")

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-chatbot-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/chatbot' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const { prompt, history = [] } = JSON.parse(body);
                  if (!prompt) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Prompt kosong' }));
                    return;
                  }

                  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                  const formatHistory = history.map((msg) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }],
                  }));

                  const chat = model.startChat({ history: formatHistory });
                  const result = await chat.sendMessage(prompt);
                  const reply = await result.response.text();

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ reply }));
                } catch (err) {
                  console.error("Gemini Middleware Error: ", err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: "Internal server error" }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
  }
})
