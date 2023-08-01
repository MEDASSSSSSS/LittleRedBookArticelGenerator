import { OpenAIChat } from "langchain/llms/openai";
import {
	ChatOpenAI,
	PromptLayerChatOpenAI,
} from "langchain/chat_models/openai";
import {
	HumanChatMessage,
	SystemChatMessage,
	FunctionChatMessage,
} from "langchain/schema";

function responseNormally() {
	return "对不起！暂时我只能为您提供运输相关的查询，其他的技能我正在加强练习。";
}
function get_current_weather(params) {
	const { location, unit = "fahrenheit" } = params;
	const weather_info = {
		location: location,
		temperature: "72",
		unit: unit,
		forecast: ["sunny", "windy"],
	};

	return JSON.stringify(weather_info);
}

function checkMore(params) {
	console.log("checkMore params---------------> ", params);
	return "这是更多信息";
}

function getShipmentOrderInfo(searchParams) {
	return JSON.stringify(searchParams);
}

const description4ShipmentOrderInfo = {
	name: "getShipmentOrderInfo",
	description: "查询运单或者货运信息",
	parameters: {
		type: "object",
		properties: {
			shipmentNo: {
				type: "string",
				description: "任何出现的单号都是运单号",
			},
			transportType: {
				type: "string",
				enum: ["陆运", "空运", "海运", "铁运"],
				description:
					"货物的运输方式,默认为null，如果出现车，运输方式则是陆运；如果出现船,运输方式为海运；如果出现航班,飞机,运输方式为空运，如果出现火车，运输方式为铁运，其他用名词类推",
			},
			destination: {
				type: "string",
				description: "目的地",
			},
			origin: {
				type: "string",
				description: "出发地",
			},
			expectDepartDateTo: {
				type: "string",
				format: "date-time",
				description:
					"结束时间，如果客户的语句出现日期的表达，请结合当前时间推理客户表达的时间段的结束时间,时间格式显示为yyyy-MM-dd,如果未解析出结束时间则传值为今天；",
			},
			expectDepartDateFrom: {
				type: "string",
				format: "date-time",
				description:
					"开始时间，如果客户的语句出现日期的表达，请结合当前时间推理客户表达的时间段的开始时间,时间格式显示为yyyy-MM-dd,如果未解析出开始时间则传值为两个月前的今天；",
			},
		},
	},
};

const checkMoreDescription = {
	name: "checkMore",
	description: "根据之前对话的查询条件,查询更多符合查询条件的运单信息",
	parameters: {
		type: "object",
		properties: {
			lastFunctionName: {
				type: "string",
				description: "上一次查询触发的方法名",
			},
			lastFunctionParams: {
				type: "string",
				description: "上一次查询的参数",
			},
		},
	},
};

export const run = async () => {
	const chat = new ChatOpenAI({
		modelName: "gpt-3.5-turbo-0613",
		temperature: 0.7,
		maxTokens: 1000,
		maxRetries: 5,
		openAIApiKey: "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",
		timeout: 60000,
		// prefixMessages: [{role:"system", content:`当前日期是${new Date()}`}]
	});
	const messages = [
		new SystemChatMessage(`当前日期是${new Date()}`),
		new HumanChatMessage("查一下本月的运单?"),
	];
	const response = await chat.call(messages, {
		functions: [
			description4ShipmentOrderInfo,
			checkMoreDescription,
		],
	});

	console.log("response ------------------>", response);
	const functionCall = response.additional_kwargs.function_call;
	if (!functionCall) {
		console.log("end-------------->", response);
		return;
	}
	const availableFunctions = {
		get_current_weather: get_current_weather,
		getShipmentOrderInfo,
		responseNormally,
		checkMore,
	};

	const { name, arguments: args } = functionCall;

	const functionToCall = availableFunctions[name];
	const objectedArgs = JSON.parse(args);
	const functionResult = functionToCall(objectedArgs);
	messages.push(response);
	console.log('functionResult ------------>', functionResult);
	messages.push(new FunctionChatMessage(functionResult, name));

	console.log("maxmium msg ------------>", messages);

	const response2 = await chat.call(messages);

	messages.push(response2);
	messages.push(new HumanChatMessage("还有其他的么"));

	console.log("response2 ---------------->", response2);
  const response3 = await chat.call(messages,{
		functions: [
			description4ShipmentOrderInfo,
			checkMoreDescription,
		],
	});
	console.log("response3 ---------------->", response3);


	// const model = new OpenAIChat({
	// 	prefixMessages: [
	// 		{
	// 			role: "system",
	// 			content:
	// 				"You are a helpful assistant that answers in pirate language",
	// 		},
	// 	],
	// 	maxTokens: 50,
	// });
	// const res = await model.call("hello?");

	// console.log({ res });
};
