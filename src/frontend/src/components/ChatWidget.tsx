import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  onClose: () => void;
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
  const { actor } = useActor(createActor);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hallo! Ich bin dein iReport Support-Assistent. Wie kann ich dir helfen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !actor) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const result = await actor.sendChatMessage(trimmed, conversationHistory);
      if (result.__kind__ === "ok") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.ok },
        ]);
      } else {
        const errorText = result.err || "Unbekannter Fehler";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Entschuldigung, es ist ein Fehler aufgetreten: ${errorText}`,
          },
        ]);
      }
    } catch (error) {
      console.error("ChatWidget sendChatMessage error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed bottom-20 right-6 z-50 w-[380px] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{ maxHeight: "520px", background: "#ffffff" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "#00182b" }}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">
            iReport Assistent
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chat schliessen"
          className="text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, idx) => (
          <div
            key={`msg-${idx}-${msg.role}`}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-800"
              }`}
              style={
                msg.role === "user" ? { background: "#006066" } : undefined
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Tippe...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-3 py-3 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht eingeben..."
          disabled={isLoading || !actor}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006066]/30 focus:border-[#006066] disabled:opacity-50"
          aria-label="Chat Eingabe"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={isLoading || !input.trim() || !actor}
          className="shrink-0 px-3"
          style={{ background: "#006066" }}
          aria-label="Senden"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
