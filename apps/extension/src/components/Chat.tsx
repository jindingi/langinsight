import { createDeepSeek } from "@ai-sdk/deepseek";
import { useChat } from "@ai-sdk/react";
import { convertToModelMessages, DefaultChatTransport, ModelMessage, streamText } from "ai";
import { useMemo, useState } from "react";
import { logger } from "@/utils/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
import { SELECTED_TEXT_MARKER, SELECTED_TEXT_MARKER_END } from "@/consts/selection"
import { configFields } from "@/config/atom";
import { useAtomValue } from "jotai";

const systemPrompt = `你是一位资深的语言学习导师，精通多种语言，擅长帮助学生通过上下文理解来掌握词汇和短语。
请根据我提供的文本，解释我选中的词语、短语或句子在上下文中的具体含义。你的解释应包括以下几个部分：

1. 释义： 给出该词语在当前语境下的直接意思，避免脱离语境的单一词典解释。

2. 核心概念/用法(可选): 解释该词语或短语背后的核心思想、情感或文化内涵，并说明它通常在什么情境下使用。

3. 示例(可选): 提供1到2个与原文语境相似的、简单易懂的例句,帮助我更好地理解和记忆。

请在解释时，使用简洁、清晰的语言，并针对语言学习者，避免使用过于专业的术语。选中的文本使用'${SELECTED_TEXT_MARKER}'和'${SELECTED_TEXT_MARKER_END}'包裹。`

const systemPromptV2 = `
你是一个高效精准的上下文翻译引擎，专为外语学习者设计。

# 我的任务
我将提供一段外文文本和你需要解释的划选内容（由 '${SELECTED_TEXT_MARKER}' 和 '${SELECTED_TEXT_MARKER_END}' 标注）。

# 你的任务
1.  唯一目标：给出划选内容在**当前上下文中最贴切、最自然的核心释义**，并给出简洁的解释(少于5句话)。
2.  输出要求：
    *   **简洁**：只输出释义和解释，不要有任何开场白、结束语。
    *   **准确**：释义必须严格基于当前文本的语境，避免通用解释。
    *   **语言**：使用流畅自然的中文。
    *   **格式**: 使用Markdown格式输出。

# 输出格式
严格且仅输出以下格式，不要有任何其他文字：
TODO: 使用模版
## 释义
[在这里填写唯一的核心释义]

## 解释
[在这里填写选中文本在上下文中的具体含义]

现在，请翻译我划选的内容。
`

function Chat({ initialInput }: { initialInput: string }) {
    logger.log('[ChatApp] initialInput:', initialInput)
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
        if (modelMessages.length > 0 && modelMessages[0].role !== "system") {
            modelMessages.unshift({
                role: "system",
                content: systemPrompt,
            })
        }
        const result = streamText({
            model: deepseek("deepseek-chat"),
            messages: modelMessages,
            abortSignal: init?.signal as AbortSignal | undefined,
        });
        return result.toUIMessageStreamResponse();
    }

    const { error, messages, sendMessage, stop, status} = useChat({
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
