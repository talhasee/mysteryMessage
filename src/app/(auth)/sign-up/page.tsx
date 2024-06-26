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
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";

const signUpStates = [
  {
    text: "Initializing sign-up process...",
  },
  {
    text: "Checking for existing user credentials...",
  },
  {
    text: "Creating a new user account...",
  },
  {
    text: "Setting up your user session...",
  },
  {
    text: "Sending verification email...",
  },
  {
    text: "Sign-up successful! Welcome!",
  },
];


function SignUp() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 300);
  const { toast } = useToast();
  const router = useRouter();
  const [signUpLoading, setSignUpLoading] = useState(false);

  //zod implementation
  const form = useForm< z.infer<typeof signUpSchema> >({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  });

  useEffect(() => 
    {
      const checkUsernameUnique = async () => {
        if(username){
          setIsCheckingUsername(true);
          setUsernameMessage('');
          try {
            const response = await axios.get(`/api/check-unique-username?username=${username}`)
            setUsernameMessage(response.data.message);
          } catch (error) {
            const axiosError = error as AxiosError<apiResponse>;
            setUsernameMessage(
              axiosError.response?.data.message ?? "Error checking username"
            )
          }finally{
            setIsCheckingUsername(false);
          }
        }
      }
      checkUsernameUnique();
    }, 
    [username]
  );

  const onSubmit = async (data: z.infer<typeof signUpSchema> ) => {
    setIsSubmitting(true);
    setSignUpLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post<apiResponse>(`/api/sign-up`, data);

      //check response validation

      // console.log(`Response - ${JSON.stringify(response)}`);
      // console.log(`CHECKING HERE`);

      if(response.data.message === "User already exists with email. Please verify your email"){
        setShowAlertDialog(true);
      }
      else{
        toast({
          title: 'Success',
          description: response.data.message
        });

        //redirecting on successfull submission
        routeToVerifyPage();
      }
    } catch (error) {
      console.error("Error in sign-up user", error);
      
      const axiosError = error as AxiosError<apiResponse>;
      let errorMessage = axiosError.response?.data.message;

      toast({
        title: "Sign-up Failed!",
        description: errorMessage,
        variant: "destructive"
      })

    }finally{
      setIsSubmitting(false);
      while (Date.now() - startTime < 3550) {
        // Wait until at least 2550ms have elapsed
        await new Promise(resolve => setTimeout(resolve, 10)); // Introduce a small delay to avoid blocking the event loop
      }
      setSignUpLoading(false);
    }
  }

  const routeToVerifyPage = () => {
    router.replace(`/verify/${username}`);
  }

  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Loader loadingStates={signUpStates} loading={signUpLoading} duration={592} />
      {
        showAlertDialog && (
          <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Given Email is already Registered!
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You are already registered with given email. We will be using your older username. 
                  Click OK to proceed for verification of your email
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogAction onClick={routeToVerifyPage}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      }
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md mx-5">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Join Mystery Message
            </h1>
            <p className="mb-4">
              Sign up to start your anonymous adventure
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={ form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username" 
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin"/>}
                  <p className={`text-sm ${usernameMessage === 'Username is unique' ? 'text-green-500' : 'text-red-500'}`}>
                      {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email" 
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
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {
                isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
                  </>
                ) : ( 'Sign-up' )
              }
            </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Already a member?{' '}
              <Link href="/sign-in" className="text-blue-500 hover:text-blue-800">
                Sign-in
              </Link>
            </p>
          </div>
        </div>
    </div>
  )
}

export default SignUp 