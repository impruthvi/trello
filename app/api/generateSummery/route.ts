import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // todos in the body of the Post request
  const { todos } = await request.json();

  // communicate with the openAi GPT
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    n: 1,
    stream: false,
    messages: [
      {
        role: "system",
        content:
          "When responding, welcome the user always as Pruthvisinh Rajput and say welcome to the Trello 2.0. Limit the response 200 characters.",
      },

      {
        role: "user",
        content: `Hi there, provide a summary of the following todos.
          Count how many todos are in each category such as To do, in progress and done, then tell the user to have a profuctive day!
          Here's the data: ${JSON.stringify(todos)}`,
      },
    ],
  });

  // return the response from the openAi GPT
  const { data } = response;

  return NextResponse.json(data.choices[0].message);
}
