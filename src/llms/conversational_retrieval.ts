import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import path from "path";

export const run = async () => {
  /* Initialize the LLM to use to answer the question */
  const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
    maxRetries: 5,
    openAIApiKey: "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",
    timeout: 660000,
});
  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync(path.resolve("./src/llms/state_of_the_union.txt"), "utf8");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({openAIApiKey: "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"}));
  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  /* Ask it a question */
  const question = "What did the president say about Justice Breyer?";
  const res = await chain.call({ question, chat_history: [] });
  console.log(res);
  /* Ask it a follow up question */
  const chatHistory = question + res.text;
  const followUpRes = await chain.call({
    question: "Was that nice?",
    chat_history: chatHistory,
  });
  console.log(followUpRes);
};