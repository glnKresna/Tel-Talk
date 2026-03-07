import { create } from 'zustand';

interface chatbotMsg {
    role: "user" | "model";
    content: string;
}

interface ChatState {
    pesan: chatbotMsg[];
    isLoading: boolean;
    sendMsg(prompt: string): Promise<void>;
}

export const useChatbotStore = create<ChatState> ((set, get) => ({
    pesan: [],
    isLoading: false,
    sendMsg: async(prompt) => {
        const userMsg: chatbotMsg = {role: "user", content: prompt};

        set ({
            isLoading: true,
            pesan: [...get().pesan, userMsg]
        });

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({prompt: prompt, history: get().pesan})
            });

            const data = await response.json();
            const botMsg: chatbotMsg = {role: "model", content: data.reply};

            set ({
                isLoading: false,
                pesan: [...get().pesan, botMsg]
            });
        } catch (err: any) {
            console.error("Chatbot error: ", err);
        }
    }
}));