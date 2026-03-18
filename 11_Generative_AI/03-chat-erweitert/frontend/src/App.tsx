import { useState } from "react";
import { ChatCompletionStream } from "openai/lib/ChatCompletionStream";

import Markdown from "marked-react";
import Lowlight from "react-lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import "highlight.js/styles/night-owl.css";

Lowlight.registerLanguage("js", javascript);
Lowlight.registerLanguage("javascript", javascript);
Lowlight.registerLanguage("ts", typescript);
Lowlight.registerLanguage("typescript", typescript);
Lowlight.registerLanguage("bash", bash);

import "./App.css";

const renderer = {
  code(snippet, lang) {
    const usedLang = Lowlight.hasLanguage() ? lang : "bash";
    return <Lowlight key={this.elementId} language={usedLang} value={snippet} />;
  },
};

function App() {
  const [pending, setPending] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatId, setChatId] = useState<string | null>("");
  const [aiResponse, setAiResponse] = useState("");

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setAiResponse("");

    try {
      setPending(true);

      const res = await fetch("http://localhost:8080/messages/streaming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // chatId als Request-Header statt im Body – passend zum Backend
          ...(chatId && { "x-chat-id": chatId }),
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.body) throw new Error("Request failed");

      setChatId(res.headers.get("x-chat-id"));

      const runner = ChatCompletionStream.fromReadableStream(res.body);

      runner.on("content", (delta) => {
        setAiResponse((p) => p + delta);
      });

      await runner.finalChatCompletion();
    } catch (error) {
      console.error("Error ", error);
    } finally {
      setPending(false);
    }
  };

  const reset = () => {
    setAiResponse("");
    setPrompt("");
    setChatId("");
  };

  return (
    <main className="h-screen p-2 mx-auto w-5xl flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end" inert={pending}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={"State your question..."}
          className="textarea textarea-primary flex-10/12 h-40 resize-none"
        />
        <div className="flex-2/12 flex flex-col gap-2">
          <button type="submit" className="btn btn-primary " disabled={pending}>
            {pending ? <span className="loading loading-spinner" /> : <span>Send</span>}
          </button>
          <button className="btn btn-secondary" type="reset" onClick={reset}>
            Clear
          </button>
        </div>
      </form>
      <div className="mockup-window border w-full my-4 flex-1 overflow-y-auto text-start px-4">
        <Markdown value={aiResponse} renderer={renderer} />
      </div>
    </main>
  );
}

export default App;
