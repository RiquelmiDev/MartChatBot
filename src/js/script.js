import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

import KEY_API from "./apikey.js";

const MODEL_NAME = "gemini-1.5-pro-latest";

const API_KEY = KEY_API;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
  model: MODEL_NAME,
  systemInstruction: {
    role: "system",
    parts: [{text: "Você é um chatbot que usa o Gemini API do google chamado MART que significa Meu Amigo Resolve Tudo, você foi criado por Riquelmi. Seja engraçado e manere nos emojis"}]
  } 
});

// Configurações de geração de texto
const generationConfig = {
    temperature: 1,
    topK: 0,
    topP: 0.95
};

// Configurações de segurança para bloqueio de conteúdo prejudicial
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

// Array para armazenar o histórico do chat
const historicoChat = [];

// Adiciona um evento de clique ao botão "Enviar"
document.getElementById("bt-enviar").addEventListener("click", async () => {
    // Obtém o valor do input
    const inputValue = document.getElementById("inputValue").value;
    // Verifica se o valor não está vazio
    if (inputValue.trim() !== "") {
      // Envia a mensagem para o chat
        sendMessageToChat(inputValue);
        document.getElementById("inputValue").value = "";
    }
});

// Adiciona um evento de pressionar tecla ENTER no input
document.getElementById("inputValue").addEventListener("keypress", async (e) => {
    // Verifica se a tecla pressionada é "Enter"
    if (e.key === "Enter") {
        e.preventDefault();
        const inputValue = document.getElementById("inputValue").value;
        if (inputValue.trim() !== "") {
            sendMessageToChat(inputValue);
            document.getElementById("inputValue").value = "";
        }
    }
});

// Função para enviar a mensagem para o chat
async function sendMessageToChat(message) {
    // Inicia uma conversa com o modelo, passando as configurações de geração e o histórico atual
    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: historicoChat,
    });

    // Envia a mensagem para o chat e aguarda a resposta
    const resultado = await chat.sendMessage(message);
    const resposta = resultado.response;

    // Adiciona a mensagem de usuário e a resposta do modelo ao histórico
    historicoChat.push({
        role: "user",
        parts: [{ text: message }],
    });
    historicoChat.push({
        role: "model",
        parts: [{ text: resposta.text() }],
    });

    // Exibe o histórico atualizado
    displayChatHistory();
}

function displayChatHistory() {
  // Obtém o elemento onde o histórico será exibido
  const elementoHistoricoChat = document.getElementById("elementoHistoricoChat");

  // Limpa o conteúdo anterior do elemento
  /* elementoHistoricoChat.innerHTML = ""; */

  // Filtra apenas as mensagens do usuário e as respostas da API
  const mensagensUsuario = historicoChat.filter(message => message.role === "user");
  const respostasAPI = historicoChat.filter(message => message.role === "model");

  // Cria um parágrafo para exibir a pergunta do usuário
  const tituloUser = document.createElement("h1");
  tituloUser.textContent ="Você";
  tituloUser.className="elementoUser-h1";
  elementoHistoricoChat.appendChild(tituloUser);

  const paragrafoPergunta = document.createElement("p");
  paragrafoPergunta.className="elementoUser-p";
  paragrafoPergunta.textContent = mensagensUsuario[mensagensUsuario.length - 1].parts[0].text; // Última pergunta do usuário
  elementoHistoricoChat.appendChild(paragrafoPergunta);

  const tituloMart = document.createElement("h1");
  tituloMart.textContent ="Mart";
  tituloMart.className="elementoMart-h1";
  elementoHistoricoChat.appendChild(tituloMart);

  // Cria um parágrafo para exibir a resposta da API
  const paragrafoResposta = document.createElement("p");
  paragrafoResposta.className="elementoMart-p";
  paragrafoResposta.textContent = respostasAPI[respostasAPI.length - 1].parts[0].text; // Última resposta da API
  elementoHistoricoChat.appendChild(paragrafoResposta);

}
