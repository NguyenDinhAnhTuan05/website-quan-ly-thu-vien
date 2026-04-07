import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import aiApi from "../api/aiApi";
import { useAuthStore } from "../store/index";

const SUGGESTIONS = [
  "Gợi ý sách về lập trình Java",
  "Cuốn sách nào đang hot nhất?",
  "Tôi muốn đọc tiểu thuyết hay",
  "Sách về kỹ năng quản lý thời gian",
];

export default function AIChatWidget() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: msg },
        { role: "bot", content: "Vui lòng **đăng nhập** để sử dụng AI Assistant." },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await aiApi.chat(msg);
      const reply = typeof res === "string" ? res : res?.assistant_reply || res?.reply || res?.data?.assistant_reply || res?.data?.reply || res?.message || JSON.stringify(res);
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up"
             style={{ height: "min(520px, calc(100vh - 160px))" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">eLibConnect AI</h3>
                <p className="text-white/70 text-xs">Tư vấn & gợi ý sách cho bạn</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-gray-700 font-semibold mb-1">Xin chào!</p>
                <p className="text-gray-500 text-sm mb-4">Tôi có thể giúp bạn tìm sách hay</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="block w-full text-left text-sm px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-700"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <button
                              onClick={() => {
                                if (href?.startsWith("/")) navigate(href);
                                else window.open(href, "_blank", "noopener");
                              }}
                              className="text-primary-600 underline font-medium hover:text-primary-700 cursor-pointer bg-transparent border-none p-0"
                            >
                              {children}
                            </button>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về sách bạn muốn tìm..."
                rows={1}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 max-h-24 bg-gray-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 sm:right-6 z-[9999] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-gray-700 rotate-90"
            : "bg-gradient-to-r from-primary-600 to-accent-600 hover:shadow-primary-500/40 hover:shadow-2xl"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>
    </>
  );
}
