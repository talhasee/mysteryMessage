import { Message } from "@/models/User.model";

export interface apiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean 
    messages?: Array<Message>
}