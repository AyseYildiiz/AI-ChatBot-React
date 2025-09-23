import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useEffect, useRef, useState } from "react";
import "./ChatBotApp.css";

const ChatBotApp = ({
  onGoBack,
  chats,
  setChats,
  activeChat,
  setActiveChat,
  onNewChat,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const chatEndRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchSource, setSearchSource] = useState("");

  const searchKeywords = [
    "güncel",
    "son haberler",
    "bugün",
    "şu anda",
    "haber",
    "fiyat",
    "hava durumu",
    "ne zaman",
    "kim",
    "nerede",
    "hangi",
    "kaç",
    "ne kadar",
    "son dakika",
    "canlı",
    "search",
    "ara",
    "bul",
    "google",
    "internet",
  ];

  useEffect(() => {
    const activeChatObj = chats.find((chat) => chat.id === activeChat);

    setMessages(activeChatObj ? activeChatObj.messages : []);
  }, [activeChat, chats]);

  useEffect(() => {
    if (activeChat) {
      const storedMessages = JSON.parse(localStorage.getItem(activeChat)) || [];
      setMessages(storedMessages);
    }
  }, [activeChat]);

  const needsWebSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    return searchKeywords.some((keyword) => lowerQuery.includes(keyword));
  };

  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const SEARCH_ENGINE_ID = import.meta.env.VITE_SEARCH_ENGINE_ID;

  const performWebSearch = async (query) => {
    try {
      setIsSearching(true);
      console.log("Performing web search for query:", query);

      const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        query
      )}`;

      const googleResponse = await fetch(googleSearchUrl);

      if (!googleResponse.ok) {
        console.error("Google API hatası:", googleResponse.statusText);
        throw new Error(`Google API hatası: ${googleResponse.statusText}`);
      }

      const data = await googleResponse.json();
      console.log("Google search yanıtı alındı.");

      if (data.items && data.items.length > 0) {
        return data.items.slice(0, 3).map((item) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          source: "Google",
        }));
      } else {
        console.log("Google aramasında sonuç bulunamadı");
        return [];
      }
    } catch (error) {
      console.error("Web araması hatası:", error);
      return [
        {
          title: "Arama Hatası",
          snippet:
            "Web araması şu anda kullanılamıyor. Normal AI yanıtı kullanılacak.",
          link: "#",
          source: "Error",
        },
      ];
    } finally {
      setIsSearching(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputValue((prevInput) => prevInput + emoji.native);
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    const newMessage = {
      type: "prompt",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };
    if (!activeChat) {
      onNewChat(inputValue);
      setInputValue("");
      return;
    } else {
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem(activeChat, JSON.stringify(updatedMessages));
      const currentInput = inputValue;
      setInputValue("");

      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
      setChats(updatedChats);
      localStorage.setItem("chats", JSON.stringify(updatedChats));
      setIsTyping(true);

      let searchContext = "";
      let webSearchResults = [];

      if (needsWebSearch(currentInput)) {
        const results = await performWebSearch(currentInput);

        setSearchResults(results);
        webSearchResults = results;

        if (results.length > 0) {
          setSearchSource(results[0].source || "Google");

          searchContext =
            `\n\nWeb'den güncel bilgiler (${
              results[0].source || "Google"
            }):\n` +
            results
              .map(
                (result, index) =>
                  `${index + 1}. ${result.title}\n${result.snippet}\nKaynak: ${
                    result.link
                  }`
              )
              .join("\n\n");

          const searchInfoMessage = {
            type: "system",
            text: `🔍 ${
              results[0].source || "Google"
            } ile web araması yapıldı. Yanıt güncel bilgilere göre hazırlanıyor.`,
            timestamp: new Date().toLocaleTimeString(),
          };

          const updatedMessagesWithSearchInfo = [
            ...updatedMessages,
            searchInfoMessage,
          ];
          setMessages(updatedMessagesWithSearchInfo);
          localStorage.setItem(
            activeChat,
            JSON.stringify(updatedMessagesWithSearchInfo)
          );
        }
      }

      const systemContent = `
Sen bir AI asistanısın. SADECE kullanıcı direkt olarak "Seni kim üretti?", "Seni kim yaptı?", 
"Seni kim geliştirdi?" veya başka bir şekilde senin yaratıcın hakkında açıkça soru sorduğunda 
"Ayşe Yıldız tarafından üretildim." cevabını ver. 

SADECE bu özel durumda bu cevabı ver. Tüm diğer sorular için - konudan bağımsız olarak - normal bir 
asistan gibi yanıt ver ve Ayşe Yıldız'dan bahsetme.${
        searchContext ? searchContext : ""
      }`;

      const apiMessages = [
        {
          role: "system",
          content: systemContent,
        },
        ...updatedMessages.map((m) => ({
          role: m.type === "prompt" ? "user" : "assistant",
          content: m.text,
        })),
      ];

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: apiMessages,
            max_tokens: 500,
            temperature: 0.2,
          }),
        }
      );
      const data = await response.json();
      let chatResponse = data.choices[0].message.content.trim();
      if (webSearchResults && webSearchResults.length > 0) {
        chatResponse +=
          "\n\n🔍 Kaynak Bağlantıları:\n" +
          webSearchResults
            .map((result, index) => `• ${result.title}: ${result.link}`)
            .join("\n");
      }

      const responseMessage = {
        type: "response",
        text: chatResponse,
        timestamp: new Date().toLocaleTimeString(),
      };

      let finalUpdatedMessages;
      if (webSearchResults && webSearchResults.length > 0) {
        const searchInfoMessage = {
          type: "system",
          text: `🔍 ${
            webSearchResults[0].source || "Google"
          } ile web araması yapıldı. Yanıt güncel bilgilere göre hazırlanıyor.`,
          timestamp: new Date().toLocaleTimeString(),
        };
        finalUpdatedMessages = [
          ...updatedMessages,
          searchInfoMessage,
          responseMessage,
        ];
      } else {
        finalUpdatedMessages = [...updatedMessages, responseMessage];
      }

      setMessages(finalUpdatedMessages);
      localStorage.setItem(activeChat, JSON.stringify(finalUpdatedMessages));
      setIsTyping(false);

      const updatedChatsWithResponse = chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: finalUpdatedMessages };
        }
        return chat;
      });
      setChats(updatedChatsWithResponse);
      localStorage.setItem("chats", JSON.stringify(updatedChatsWithResponse));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectedChat = (id) => {
    setActiveChat(id);
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
    localStorage.removeItem(id);
    if (id === activeChat) {
      const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      setActiveChat(newActiveChat);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-app">
      <div className={`chat-list ${showChatList ? "show" : ""}`}>
        <div className="chat-list-header">
          <h2>Chat List</h2>
          <i
            className="bx bx-edit-alt new-chat"
            onClick={() => onNewChat()}
          ></i>
          <i
            className="bx bx-x-circle close-list"
            onClick={() => setShowChatList(false)}
          ></i>
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${
              chat.id === activeChat ? "active" : ""
            }`}
            onClick={() => handleSelectedChat(chat.id)}
          >
            <h4>{chat.displayId}</h4>
            <i
              className="bx bx-x-circle"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
            ></i>
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="chat-title">
          <h3>Chat with AI {isSearching && "🔍"}</h3>
          <i className="bx bx-menu" onClick={() => setShowChatList(true)}></i>
          <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
        </div>
        <div className="chat" onClick={() => setShowChatList(false)}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.type === "prompt"
                  ? "prompt"
                  : msg.type === "system"
                  ? "system"
                  : "response"
              }
            >
              {msg.text}
              <span> {msg.timestamp}</span>
            </div>
          ))}
          {isTyping && (
            <div className="typing">
              {isSearching ? "Web'de arıyor..." : "Typing..."}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          className="msg-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <i
            className="fa-solid fa-face-smile emoji"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          ></i>
          {showEmojiPicker && (
            <div className="picker">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                width={200}
              />
            </div>
          )}
          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            type="text"
            className="msg-input"
            placeholder="Type a message..."
            onFocus={() => setShowEmojiPicker(false)}
          />
          <i
            className="fa-solid fa-paper-plane"
            onClick={handleSendMessage}
          ></i>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;
