import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export default async function handler(req:any, res:any) {
    if (req.method != 'POST') {
        return res.status(405).json({error: 'Method tidak valid'});
    } 

    try {
        const {prompt, history = []} = req.body;
        
        if (!prompt) {
            return res.status(400).json({error: 'Prompt kosong'});
        }

        const model = genAI.getGenerativeModel({model: "gemini-3-flash-preview"});

        const formatHistory = history.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{text: msg.content}],
        }));

        const chat = model.startChat({history:formatHistory});
        const result = await chat.sendMessage(prompt);
        const reply = await result.response.text();

        return res.status(200).json({reply});
    } catch (err: any) {
        console.error("Gemini Error: ", err);
        return res.status(500).json({error: "Internal server error"});
    }
}
