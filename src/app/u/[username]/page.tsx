'use client'

import { useParams } from "next/navigation"
import { useCompletion } from "ai/react";
import { useForm } from "react-hook-form";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { apiResponse } from "@/types/apiResponse";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const specialPipe = '||';

const stringMessageParse = (messageString: string): string[] => {
  return messageString.split(specialPipe);
}

const initialMessageString = "What's your favorite cuisine?||Have you traveled to any exotic destinations?||What's your go-to hobby?";

function SendMessage() {
  const params = useParams<{username: string}>();
  const  username = params.username;
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [completion, setCompletion] = useState(initialMessageString);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  // const{
  //   complete,
  //   completion,
  //   isLoading: isSuggestLoading,
  //   error,
  // } = useCompletion({
  //   api: '/api/suggest-messages',
  //   initialCompletion: initialMessageString
  // });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  }

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async(data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post<apiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: "default"
      });

      form.reset({...form.getValues(), content: ''});
    } catch (error) {
      const axiosError = error as AxiosError<apiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? 'Failed to send message',
        variant: "destructive"
      })
    }finally{
      setIsLoading(false);
    }
  }

  const fetchSuggestedMessages = async() => {

    try {
      // complete('');
      setIsSuggestLoading(true);
      const response = await axios.post(`/api/suggest-messages`);
      if(response.data.suggestMessages){
        setCompletion(response.data.suggestMessages);
      }

    } catch (error) {
      console.error('Error in fetching suggested messages: ', error);
      toast({
        title: "Error",
        description: "Failed to fetch suggested messages",
        variant: "destructive"
      });
    } finally{
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Send Anonymous Message to @{username}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resise-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}  
          />
          <div className="flex justify-center">
            {
              isLoading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Please wait
                </Button>
              ) : (
                <Button type="submit" disabled = {isLoading || !messageContent}>
                  Send It
                </Button>
              )
            }
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
            <Button
              onClick={fetchSuggestedMessages}
              className="my-4"
              disabled={isSuggestLoading}
            >
              Suggest Messages
            </Button>
            <p>Select a message by clicking on it</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
                <p className="text-red-500">Error in Fetching Suggested Messages</p>
              ) : (
                isSuggestLoading ? (
                  <div className="flex flex-col">
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-8 w-full mb-4" />
                  </div>
                ) : (
                  stringMessageParse(completion).map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="mb-2"
                      onClick={ () => handleMessageClick(message)}
                    >
                      {message}
                    </Button>
                  ))
                )
                
              )
            }
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  )
}

export default SendMessage