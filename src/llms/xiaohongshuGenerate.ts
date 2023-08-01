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
  const text = fs.readFileSync(path.resolve("./src/llms/public/xiaohongshu高频用语.txt"), "utf8");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 400 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({openAIApiKey: "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"}));
  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  /* Ask it a question */
  const question = `请结合小红书高频用语，并使用从高级文案中提炼的形容词和结构，为一款用${messageRecord[1]}链生成一段高级的文案，包含一到两种用文中提到的饰品材质联想视觉效果，合理分段，配文精简，总字数在50以内并配一段标题。`;
  const res = await chain.call({ question, chat_history: [] });
  console.log(res);
  /* Ask it a follow up question */
//   const chatHistory = question + res.text;
//   const followUpRes = await chain.call({
//     question: "Was that nice?",
//     chat_history: chatHistory,
//   });
//   console.log(followUpRes);
};

const messageRecord =[
    '正圆珍珠及金色水滴形合金吊坠组成的项链',
    '扁圆珍珠及三角形碎金串珠组成的项链'
]