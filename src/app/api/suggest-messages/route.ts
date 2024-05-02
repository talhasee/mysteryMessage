import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
// Set the runtime to edge for best performance
export const runtime = 'edge';
 
export async function POST(req: Request) {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform. Like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, foucusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any hhistorical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the question are intriguing, foster curiositym and contribute to a positive and welcoming conversational environment.";

    const stringToStream = (str: string) => {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(str));
          controller.close();
        }
      });
    };

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
      const promptSend = prompt;
      const temp = await model.generateContentStream([promptSend]);
      for await (const chunk of temp.stream){
        const chunkText = chunk.text();
        console.log(chunkText);
        
      }
      const result = await model.generateContent(promptSend);
      const response = await result.response;
      const text = response.text();

      return Response.json(
        {
          success: true,
          message: "Fetched suggested messages",
          suggestMessages : text
        },
        {
          status: 200
        }
      )

      // console.log(`output message - ${text}`);
      // const output = stringToStream(text);
      
      // if(output){
      //   console.log("returned streaming response");
        
      //   return new StreamingTextResponse(output);
      // }
      // if(response.candidates){
      //   const output = response?.candidates[0]?.content?.parts[0].text;
      // // return new StreamingTextResponse(output);
      //   console.log(typeof output);
      // }    
      // return Response.json(
      //   {
      //     success: true,
      //     message: text
      //   },
      //   {
      //     status: 200
      //   }
      // )

    } catch (error) {
      console.log("Generative AI error", error);
      return Response.json(
        {
          success: false,
          message: "Gemini error"
        },
        {
          status: 500
        }
      )
      
    }
}