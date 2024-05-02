import { Message } from "@/models/User.model";

export interface apiResponse{
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean 
    messages?: Array<Message>
}