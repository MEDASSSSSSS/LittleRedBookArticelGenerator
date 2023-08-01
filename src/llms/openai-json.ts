import * as fs from "fs";
import * as yaml from "js-yaml";
import { OpenAI } from "langchain/llms/openai";
import { JsonSpec, JsonObject } from "langchain/tools";
import { JsonToolkit, createJsonAgent } from "langchain/agents";
import path from "path";

export const run = async () => {
	let data: JsonObject;
	try {
		const yamlFile = fs.readFileSync(
			path.resolve("./package.json"),
			"utf8"
		);
		data = yaml.load(yamlFile) as JsonObject;
		if (!data) {
			throw new Error("Failed to load OpenAPI spec");
		}
	} catch (e) {
		console.error(e);
		return;
	}

	const toolkit = new JsonToolkit(new JsonSpec(data));
	const model = new OpenAI(
        {
		modelName: "gpt-3.5-turbo",
		temperature: 0.7,
		maxTokens: 1000,
		maxRetries: 5,
		openAIApiKey: "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",
		timeout: 660000,
	}
    );
    
	const executor = createJsonAgent(model, toolkit);

	const input = `What are the required dependencies in the json`;

	console.log(`Executing with input "${input}"...`);

	const result = await executor.call({ input });

	console.log(`Got output ${result.output}`);

	console.log(
		`Got intermediate steps ${JSON.stringify(
			result.intermediateSteps,
			null,
			2
		)}`
	);
};
