'use client'
import { zodResolver} from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { apiResponse } from "@/types/apiResponse";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

function page() {
  const { toast } = useToast();
  const router = useRouter();

  //zod implementation
  const form = useForm< z.infer<typeof signInSchema> >({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof signInSchema> ) => {
    const result = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password
    });

    if(result?.error){
        toast({
            title: "Login failed",
            description: "Incorrect username or password",
            variant: "destructive"
        })
    }

    if(result?.url){
        router.replace(`/dashboard`);
    }
  }
  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join Mystery Message
            </h1>
            <p className="mb-4">
              Sign-In to start your anonymous adventure
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={ form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier" 
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email"  
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password" 
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password"  
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              Sign-In
            </Button>
            </form>
          </Form>
        </div>
    </div>
  )
}

export default page 