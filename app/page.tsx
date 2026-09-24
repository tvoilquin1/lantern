"use client";

import { useChat } from "ai/react";
import { copy } from "@/constants/copy";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
  });

  return (
    <main className="flex flex-1 flex-col bg-paper-app">
      <header className="border-b border-paper-hairline bg-paper-app px-screen-gutter py-16">
        <h1 className="text-headline font-semibold text-ink-900">{copy.appName}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-screen-gutter py-20">
        {messages.length === 0 ? (
          <p className="text-body text-ink-500">{copy.chatEmptyState}</p>
        ) : (
          <div className="flex flex-col gap-card-gap">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[80%] rounded-bubble rounded-br-bubble-tail bg-sage-100 px-card-x py-card-y text-message text-ink-900"
                    : "mr-auto max-w-[80%] rounded-bubble rounded-bl-bubble-tail bg-paper-card px-card-x py-card-y text-message text-ink-900 shadow-hairline"
                }
              >
                {message.content}
              </div>
            ))}
          </div>
        )}
        {error ? <p className="mt-16 text-supporting text-clay-700">{copy.chatErrorMessage}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-12 border-t border-paper-hairline px-screen-gutter py-16">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={copy.chatInputPlaceholder}
          disabled={isLoading}
          className="flex-1 rounded-pill border border-paper-hairline bg-paper-card px-16 py-12 text-body text-ink-900 outline-none focus:border-sage-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-pill bg-sage-650 px-20 py-12 text-body font-medium text-paper-card disabled:opacity-50"
        >
          {isLoading ? copy.chatSendingLabel : copy.chatSendButton}
        </button>
      </form>
    </main>
  );
}
