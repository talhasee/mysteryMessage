"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import dayjs from 'dayjs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Message } from "@/models/User.model"
import { useToast } from "./ui/use-toast"
import axios from "axios"
import { apiResponse } from "@/types/apiResponse"


type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void
}

const MessageCard = ({message, onMessageDelete}: MessageCardProps) => {
    const { toast } = useToast();
 
    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<apiResponse>(`/api/delete-message/${message._id}`)
            toast({
                title: response.data.message,
            });
    
            onMessageDelete(message._id);
        } catch (error) {
            console.error(`Error in deleting - ${error}`);
        }
    }

    return (
        <Card className="card-bordered">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{message.content}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><X className="w-5 h-5"/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this message
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="text-sm">
                {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
            </CardContent>
        </Card>

    )
}

export default MessageCard
