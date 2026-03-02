"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMsg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "portfolio_copilot_messages_v1";
const OPEN_KEY = "portfolio_copilot_open_v1";

export default function PortfolioCopilot() {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(true);

    const abortRef = useRef<AbortController | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setMessages(JSON.parse(saved));
            const savedOpen = localStorage.getItem(OPEN_KEY);
            if (savedOpen) setOpen(savedOpen === "true");
        } catch { }
    }, []);

    // Persist
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch { }
    }, [messages]);

    useEffect(() => {
        try {
            localStorage.setItem(OPEN_KEY, String(open));
        } catch { }
    }, [open]);

    // Auto-scroll
    useEffect(() => {
        if (!open) return;
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, open]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text || isLoading) return;

        const nextMessages: ChatMsg[] = [...messages, { role: "user", content: text }];
        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        try {
            const res = await fetch("/api/ai/copilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: nextMessages }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                const text = await res.text();
                let detail = text;
                try {
                    const json = JSON.parse(text);
                    detail = json?.error || json?.detail || text;
                } catch { }
                throw new Error(detail);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response body.");

            let assistantText = "";
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                assistantText += decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = { role: "assistant", content: assistantText };
                    return copy;
                });
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: `AI is unavailable: ${err?.message ?? "Please try again."}` },
                ]);
                console.error(err);
            }
        } finally {
            setIsLoading(false);
        }
    }

    function clearChat() {
        abortRef.current?.abort();
        setMessages([]);
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 rounded-full bg-black text-white px-4 py-3 shadow-2xl"
                aria-label="Open Portfolio Copilot"
            >
                Copilot
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[95vw] bg-white shadow-2xl rounded-2xl border flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
                <div className="font-semibold">Portfolio Copilot</div>
                <div className="flex gap-2">
                    <button onClick={clearChat} className="text-xs px-2 py-1 border rounded-lg">
                        Clear
                    </button>
                    <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 border rounded-lg">
                        Minimize
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
                {messages.length === 0 && (
                    <div className="text-sm opacity-60">
                        Try: “Which project fits Azure DevOps?” or “Write 3 resume bullets for SmartOps.”
                    </div>
                )}

                {messages.map((m, idx) => (
                    <div key={idx}>
                        <div className="text-xs opacity-60 mb-1">{m.role === "user" ? "You" : "AI"}</div>
                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    </div>
                ))}

                {isLoading && <div className="text-sm opacity-60">Thinking...</div>}
            </div>

            <form onSubmit={onSubmit} className="p-3 border-t flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about skills, projects, tech stack..."
                    className="flex-1 border rounded-xl px-3 py-2 text-sm"
                />
                <button
                    type="submit"
                    disabled={!canSend}
                    className="px-4 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}