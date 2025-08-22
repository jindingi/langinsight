import { createDeepSeek } from "@ai-sdk/deepseek";
import { useChat } from "@ai-sdk/react";
import { convertToModelMessages, DefaultChatTransport, ModelMessage, streamText } from "ai";
import { useMemo, useState } from "react";
import { logger } from "@/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
import { configFields } from "@/config/atom";
import { useAtomValue } from "jotai";
import { Response as AIResponse } from "@/components/ai-elements/response";
import { wordMeaningPrompt } from "@/prompts/word_meaning";

function Chat({ initialInput }: { initialInput: string }) {
    const [input, setInput] = useState(initialInput);
    const openaiApiKey = useAtomValue(configFields.openaiApiKey)
    const isApiKeyReady = useMemo(() => typeof openaiApiKey === 'string' && openaiApiKey.trim().length > 0, [openaiApiKey])

    const customFetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
        logger.info('[ChatApp] API key present:', isApiKeyReady, openaiApiKey)
        if (!isApiKeyReady) {
            return new Response('Missing API key', { status: 401, statusText: 'Unauthorized' })
        }
        const deepseek = createDeepSeek({
            apiKey: openaiApiKey || '',
        })
        const m = JSON.parse(init?.body as string);
        logger.log('[ChatApp.customFetch] messages:', m.messages)
        const modelMessages: ModelMessage[] = convertToModelMessages(m.messages)
        const systemPrompt = wordMeaningPrompt
        const result = streamText({
            model: deepseek("deepseek-chat"),
            system: systemPrompt,
            messages: modelMessages,
            abortSignal: init?.signal as AbortSignal | undefined,
        });
        return result.toUIMessageStreamResponse();
    }

    const { error, messages, sendMessage, stop, status } = useChat({
        transport: new DefaultChatTransport({
            fetch: customFetch,
        }),
    })

    const isGenerating = status === 'submitted' || status === 'streaming';

    return (
        <div className="flex flex-col h-full space-y-4 p-4 bg-white border shadow-xl dark:bg-gray-800">
            <div className="flex-1 overflow-y-auto space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                        >
                            {message.parts.map((part, i) => {
                                switch (part.type) {
                                    case "text":
                                        return (
                                            message.role !== "user" ?
                                                <AIResponse key={`${message.id}-${i}`}>
                                                    {part.text}
                                                </AIResponse>
                                                :
                                                <div
                                                    key={`${message.id}-${i}`}
                                                    className="whitespace-pre-wrap break-words"
                                                >
                                                    {part.text}
                                                </div>
                                        );
                                }
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!isApiKeyReady) {
                        return
                    }
                    if (isGenerating) {
                        stop();
                        return;
                    }
                    sendMessage({ text: input });
                    setInput("");
                }}
                className="space-y-2"
            >
                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error.message}
                    </div>
                )}
                <div className="flex gap-2">
                    <Input
                        value={input}
                        placeholder={isApiKeyReady ? "Say something..." : (openaiApiKey == null ? "Loading config…" : "Please set your API key in settings")}
                        onChange={(e) => setInput(e.currentTarget.value)}
                        className="flex-1 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                        disabled={!isApiKeyReady}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="shrink-0"
                        disabled={!isApiKeyReady}
                        aria-label={isGenerating ? "Stop generating" : "Send message"}
                        title={isGenerating ? "Stop" : "Send"}
                    >
                        {isGenerating ? (
                            <Square className="h-4 w-4" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Chat;
