import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  whatsapp?: boolean;
};

const QUICK_REPLIES = [
  "How do I borrow?",
  "What's the price?",
  "Return policy",
  "No account needed?",
  "Book unavailable?",
];

const WHATSAPP_NUMBER = "919346553583";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

function getBotReply(input: string): { text: string; whatsapp?: boolean } {
  const q = input.toLowerCase();

  if (/hello|hi\b|hey|namaste/.test(q)) {
    return {
      text: "Hello! \uD83D\uDC4B Welcome to The Community Store. I can help answer your questions about renting books. What would you like to know?",
    };
  }
  if (/how to borrow|how do i borrow|borrow a book|rent/.test(q)) {
    return {
      text: "It's simple! Browse the book catalog, click 'Borrow This Book' on any available title, fill in your name and email, and submit the request. We'll contact you to confirm the rental.",
    };
  }
  if (/price|cost|how much|\u20b9|rupee/.test(q)) {
    return {
      text: "All books are rented at a flat rate of \u20b910. There are no hidden charges!",
    };
  }
  if (/return|condition|give back/.test(q)) {
    return {
      text: "Books must be returned in the same condition they were borrowed. Please take good care of them \u2014 no torn pages, writing, or damage.",
    };
  }
  if (/unavailable|rented out|not available/.test(q)) {
    return {
      text: "If a book shows 'Rented Out', it's currently with another borrower. Check back soon \u2014 books are returned regularly!",
    };
  }
  if (/account|sign up|register|login/.test(q)) {
    return {
      text: "No account needed! Just browse the books, fill in your name and email when borrowing, and you're all set.",
    };
  }
  if (/contact|email|reach|support|help|whatsapp/.test(q)) {
    return {
      text: "You can reach the store owner directly on WhatsApp for any queries!",
      whatsapp: true,
    };
  }
  if (/how long|duration|days|keep/.test(q)) {
    return {
      text: "Rental duration is agreed upon at the time of pickup. Please return the book as soon as you're done reading!",
    };
  }

  return {
    text: "I'm not sure about that one! For further help, you can contact the store owner directly on WhatsApp.",
    whatsapp: true,
  };
}

const GREETING: Message = {
  id: 0,
  role: "bot",
  text: "Hello! \uD83D\uDC4B Welcome to The Community Store. I can help answer your questions about renting books. What would you like to know?",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open && !initialized) {
      setMessages([GREETING]);
      setInitialized(true);
      setTimeout(scrollToBottom, 50);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, initialized, scrollToBottom]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(scrollToBottom, 50);

    setTimeout(() => {
      const reply = getBotReply(trimmed);
      const botMsg: Message = {
        id: nextId.current++,
        role: "bot",
        text: reply.text,
        whatsapp: reply.whatsapp,
      };
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(scrollToBottom, 50);
    }, 400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Floating toggle button */}
      <div
        className="fixed bottom-6 right-6 z-50"
        data-ocid="chatbot.open_modal_button"
      >
        <AnimatePresence mode="wait">
          {!open && (
            <motion.button
              key="open"
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setOpen(true)}
              aria-label="Open chatbot"
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              style={{ backgroundColor: "#1a2744" }}
            >
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: "#1a2744" }}
              />
              <MessageCircle className="w-6 h-6 text-amber-400" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white"
              style={{
                width: "min(380px, calc(100vw - 24px))",
                height: "500px",
                transformOrigin: "bottom right",
                position: "absolute",
                bottom: 0,
                right: 0,
              }}
              data-ocid="chatbot.modal"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 shrink-0"
                style={{ backgroundColor: "#1a2744" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
                    <Bot className="w-4 h-4" style={{ color: "#1a2744" }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">
                      Community Store Assistant
                    </p>
                    <p className="text-green-300 text-xs">Online</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chatbot"
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  data-ocid="chatbot.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {msg.role === "bot" && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1"
                        style={{ backgroundColor: "#1a2744" }}
                      >
                        <Bot className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2 max-w-[78%]">
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "text-white rounded-br-sm"
                            : "bg-white border border-gray-200 rounded-bl-sm"
                        }`}
                        style={
                          msg.role === "user"
                            ? { backgroundColor: "#1a2744", color: "#fff" }
                            : { color: "#1a2744" }
                        }
                      >
                        {msg.text}
                      </div>
                      {msg.whatsapp && msg.role === "bot" && (
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 self-start"
                          style={{ backgroundColor: "#25D366" }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 shrink-0"
                            aria-hidden="true"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp the owner
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply chips */}
              <div className="px-3 py-2 flex gap-2 overflow-x-auto shrink-0 border-t border-gray-100 bg-white">
                {QUICK_REPLIES.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap hover:bg-amber-400"
                    style={{ borderColor: "#f59e0b", color: "#1a2744" }}
                    data-ocid="chatbot.button"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white shrink-0"
                data-ocid="chatbot.panel"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a question..."
                  className="flex-1 text-sm h-9 border-gray-200 focus-visible:ring-amber-400"
                  data-ocid="chatbot.input"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  style={{ backgroundColor: "#1a2744" }}
                  disabled={!input.trim()}
                  data-ocid="chatbot.submit_button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
