"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { authFetch, getToken } from "@/lib/session";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

function decodeUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const myUserId = decodeUserId(getToken());
  const bottomRef = useRef<HTMLDivElement>(null);

  function load() {
    authFetch<Message[]>(`/messaging/conversations/${params.id}/messages`)
      .then(setMessages)
      .catch(() => undefined);
  }

  useEffect(load, [params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    await authFetch(`/messaging/conversations/${params.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    setContent("");
    load();
  }

  return (
    <AppShell>
      <h1 className="font-serif text-2xl">Conversation</h1>

      <div className="mt-4 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.senderId === myUserId ? "ml-auto bg-laiton text-ivoire" : "bg-white/60"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="fixed inset-x-0 bottom-16 mx-auto flex max-w-xl gap-2 bg-ivoire px-4 py-3">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 rounded-full border border-noir-chaud/20 bg-white px-4 py-2 text-sm outline-none focus:border-laiton"
        />
        <button type="submit" className="rounded-full bg-noir-chaud px-5 py-2 text-sm text-ivoire">
          Envoyer
        </button>
      </form>
    </AppShell>
  );
}
