import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents";
import { DataSource } from "typeorm";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

export const run = async () => {
	const datasource = new DataSource({
		type: "postgres",
		host: "10.25.7.22",
		port: 5432,
		username: "postgres",
		password: "12346",
		database: "shipment_query",
	});
	const db = await SqlDatabase.fromDataSourceParams({
		appDataSource: datasource,
	});
	const toolkit = new SqlToolkit(db);

	const model = new OpenAI({
		modelName: "gpt-3.5-turbo",
		temperature: 0.7,
		maxTokens: 1000,
		openAIApiKey: "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",
		maxRetries: 5,
		timeout: 660000,
	});
	const executor = createSqlAgent(model, toolkit);
	const input = `Please search the latest shipment order which start from Beijing to Shenzhen in last month?`;

	console.log(`Executing with input "${input}"...`);

	const res = await executor.call({ input });
	console.log({ res });
	console.log(
		`Got intermediate steps ${JSON.stringify(
			res.intermediateSteps,
			null,
			2
		)}`
	);
	await datasource.destroy();
};
