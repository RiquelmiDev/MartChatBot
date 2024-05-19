import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import KEY_API from "./apikey.js";

// Nome do modelo a ser utilizado
const MODEL_NAME = "gemini-1.5-pro-latest";

// Chave da API
const API_KEY = KEY_API;

// Criação da instância da API generativa do Google
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  systemInstruction: {
    role: "system",
    parts: [{ text: "Você é um chatbot que usa o Gemini API do google chamado MART que significa 'Meu Amigo Resolve Tudo', você foi criado por Riquelmi. Seja engraçado" }]
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
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
];

//

// Array para armazenar o histórico do chat
const historicoChat = [];

// Adiciona um evento de clique ao botão "Enviar"
document.getElementById("bt-enviar").addEventListener("click", async () => {
  const inputValue = document.getElementById("inputValue").value;
  if (inputValue.trim() !== "") {
    mensagemUsuario(inputValue); // Exibe a mensagem do usuário na tela
    sendMessageToChat(inputValue); // Envia a mensagem para o chat
    document.getElementById("inputValue").value = ""; // Limpa o campo de input
  }
});

// Adiciona um evento de pressionar tecla ENTER no input
document.getElementById("inputValue").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const inputValue = document.getElementById("inputValue").value;
    if (inputValue.trim() !== "") {
      mensagemUsuario(inputValue); // Exibe a mensagem do usuário na tela
      sendMessageToChat(inputValue); // Envia a mensagem para o chat
      document.getElementById("inputValue").value = ""; // Limpa o campo de input
    }
  }
});

// Função para exibir a mensagem do usuário
function mensagemUsuario(inputValue) {
    //Limpa a mensagem inicial
    const textoInicial = document.getElementById("textoInicial");
    if(textoInicial){
        textoInicial.remove();
    }

    const elementoHistoricoChat = document.getElementById("elementoHistoricoChat");
  
    const tituloUser = document.createElement("h1");
    tituloUser.textContent = "Você";
    tituloUser.className = "elementoUser-h1";
    elementoHistoricoChat.appendChild(tituloUser);
  
    const paragrafoPergunta = document.createElement("p");
    paragrafoPergunta.className = "elementoUser-p";
    paragrafoPergunta.textContent = inputValue;
    elementoHistoricoChat.appendChild(paragrafoPergunta);
}

// Função para enviar a mensagem para o chat
async function sendMessageToChat(message) {
    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: historicoChat
    });

    // Cria a div para a resposta da API e adiciona o spinner de carregamento
    const paragrafoResposta = document.createElement("div");
    paragrafoResposta.className = "elementoMart-div";

    const containerDivCarregamento = document.createElement("div");
    containerDivCarregamento.className="container-carregamento";
    //Cria 5 divs com a class "carregando"
    for (let i = 0; i < 5; i++){
        const divCarregamento = document.createElement("div");
        divCarregamento.className = "carregando";
        containerDivCarregamento.appendChild(divCarregamento);
    }
    paragrafoResposta.appendChild(containerDivCarregamento);

    const tituloMart = document.createElement("h1");
    tituloMart.textContent ="Mart";
    tituloMart.className="elementoMart-h1";
    elementoHistoricoChat.appendChild(tituloMart); 

    // Adiciona a div ao histórico do chat
    document.getElementById("elementoHistoricoChat").appendChild(paragrafoResposta);

    try {
        const resultado = await chat.sendMessage(message);
        const resposta = await resultado.response;

        // Atualiza o histórico do chat com a mensagem do usuário e a resposta da API
        historicoChat.push({
            role: "user",
            parts: [{ text: message }]
        });
        historicoChat.push({
            role: "model",
            parts: [{ text: resposta.text() }]
        });

    // Remove o spinner de carregamento e adiciona a resposta da API
    containerDivCarregamento.remove();
    paragrafoResposta.insertAdjacentHTML('beforeend', marked.parse(resposta.text()));
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        containerDivCarregamento.remove(); // Remove o spinner em caso de erro também
    }
}


function displayChatHistory() {
  // Função para usar em atualizações futuras
}
