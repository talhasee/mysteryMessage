'use client'
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  {
    text: "Initializing sign-in process...",
  },
  {
    text: "Checking for existing user credentials...",
  },
  {
    text: "Verifying username and password...",
  },
  {
    text: "Authenticating with the server...",
  },
  {
    text: "Setting up your user session...",
  },
  {
    text: "Sign-in successful! Welcome back!",
  },
];

function SignIn() {
  const { toast } = useToast();
  const router = useRouter();
  const [signInLoading, setSignInLoading] = useState(false);

  //zod implementation
  const form = useForm< z.infer<typeof signInSchema> >({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof signInSchema> ) => {
    setSignInLoading(true);
    const startTime = Date.now();

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

    while (Date.now() - startTime < 3550) {
      // Wait until at least 2550ms have elapsed
      await new Promise(resolve => setTimeout(resolve, 10)); // Introduce a small delay to avoid blocking the event loop
    }

    if(result?.url){
        router.replace(`/dashboard`);
    }
    setSignInLoading(false);

  }


  return (
    <>

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Loader loadingStates={loadingStates} loading={signInLoading} duration={592} />
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md mx-5">
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
                  <FormLabel>Email/Username</FormLabel>
                  <FormControl>
                    <Input placeholder="email/username"  
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
            <Button className="w-full" type="submit">
              Sign-In
            </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Not a member yet?{' '}
              <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                Sign up
              </Link>
            </p>
          </div>
        </div>
    </div>
    </>
  )
}

export default SignIn 