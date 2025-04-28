/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import { Button } from "@heroui/react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MessageList,
  Message,
  MessageInput,
  ChatContainer,
  MainContainer,
  ConversationHeader,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import { useNavigate } from "react-router";
import { MessageCircle } from "lucide-react";

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const validCategories = [
    'Tecnologia', 'Peluches', 'Accesorios', 'Libros', 'Deporte',
    'Tazas', 'Ropa', 'Salud', 'Electronica', 'Hogar', 'Juguetes',
    'Decoracion', 'Juegosmesa', 'Moda', 'Cocina', 'Coleccionables',
    'Herramientas', 'Instrumentos', 'Musica', 'Electrodomesticos',
    'Videojuegos', 'Merchandising', 'Entretenimiento', 'Calzadodeportivo',
    'Ropadeportiva', 'Bebidas'
  ];
  
  // Modifica la función extractCategoryFromMessage
  const extractCategoryFromMessage = async (message: string) => {
    try {
      const response = await fetch(`${API_URL}/chatbot/extract-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
  
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      const data = await response.json();
      
      // Convertir a formato con primera letra mayúscula
      const formattedCategory = data.category 
        ? data.category
            .toLowerCase()
            .split('&')
            .map((cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1))
            .join('&')
        : null;
  
      if (formattedCategory && validCategories.some(c => formattedCategory.includes(c))) {
        navigate(`/category`, { 
          state: { 
            category: formattedCategory,
            timestamp: Date.now()
          }
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const handleSend = async (messageText: string) => {
    const categoryDetected = await extractCategoryFromMessage(messageText);
    if (categoryDetected) return;

    const newMessages = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setMessages(prev => [...prev, { role: "model", content: "Escribiendo..." }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const data = await response.json();
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.content !== "Escribiendo...");
        return [...filtered, { role: "model", content: data.text }];
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.content !== "Escribiendo...");
        return [...filtered, { role: "model", content: "Error al obtener respuesta" }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => setMessages([]);

  const handleOpenChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setMessages([{ 
        role: "model", 
        content: "¡Hola! Soy tu asistente de compras. ¿En qué puedo ayudarte hoy?" 
      }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-300 ease-in-out"
        onClick={handleOpenChat}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          <MainContainer style={{ height: "500px" }}>
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Content>
                  Asistente E-commerce
                </ConversationHeader.Content>
              </ConversationHeader>
              <MessageList>
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    model={{
                      message: msg.content,
                      sender: msg.role === "user" ? "Usuario" : "Asistente",
                      direction: msg.role === "user" ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  >
                    <Avatar
                      src={
                        msg.role === "user"
                          ? "https://th.bing.com/th/id/OIP.rIsI3TvodysyTi_2VOGK3gHaHa?rs=1&pid=ImgDetMain"
                          : "https://static.vecteezy.com/system/resources/previews/004/996/790/non_2x/robot-chatbot-icon-sign-free-vector.jpg"
                      }
                    />
                  </Message>
                ))}
              </MessageList>
              <MessageInput
                disabled={isLoading}
                placeholder="Escribe tu consulta..."
                onSend={handleSend}
              />
            </ChatContainer>
          </MainContainer>
          <div className="p-2">
            <Button fullWidth color="secondary" variant="solid" onPress={handleReset}>
              Limpiar Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;