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
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import axios, { AxiosError } from "axios";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const [code, setCode] = useState("");
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [alert, setAlert] = useState(false);
  const [alertHeader, setAlertHeader] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [codeSentSuccess, setCodeSentSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

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

  const sendCode = async () => {
    if(!identifier || !password || !retypePassword){
        setAlert(true);
        setAlertHeader("Empty Fields");
        setAlertMessage("Provided Username/Email or Password fields are empty");
        return;
    }

    try {
      const response = await axios.post(`/api/passUpdate-code`,
        {
          identifier
        }
      );
      

      if(!response.data.success){
        setAlert(true);
        setAlertHeader(
          response.data.status === 404 ? "User Not found" : "Verification Code Error"
        )
        setAlertMessage(
          response.data.status === 404 ? "User does not exists with given username or email." 
          : "Error sending code please try again later"
        )
      }else{
        setCodeSentSuccess(true);
        setUsername(response.data.user.username);
        setEmail(response.data.user.email);
      }
    } catch (error) {
      console.error(`Error in sending code for password updation - ${error}`);   
      const axiosError = error as AxiosError;
      if(axiosError.response?.status !== 200){
        setAlert(true);
        setAlertHeader(
          axiosError.response?.status === 404 ? "User Not found" : "Verification Code Error"
        )
        setAlertMessage(
          axiosError.response?.status === 404 ? "User does not exists with given username or email." 
          : "Error sending code please try again later"
        )
      }   
    }
  }

  const verifyCodeUpdatePassword = async () => {
    try {
      const response = await axios.post('/api/update-password',
        {
          username: username,
          email: email,
          code: code,
          password: password
        }
      );

      if(!response.data.success){
        setAlert(true);
        setAlertHeader(
          response.data.status === 404 ? "User not found" 
          : response.data.status === 410  ? "Code Expired" : "Incorrect Verification Code"
        );
        setAlertMessage(
          response.data.status === 404 ? "User does not exists with given email or username" 
          : response.data.status === 410  ? "Provided code is expired. Please request it again and restart the password updation process" 
          : "Provided Verification Code is not correct. Please request it again and restart the password updation process "
        )
      }
      else{
        setAlert(true);
        setAlertHeader("SUCCESS");
        setAlertMessage("Password has been updated successfully now you can sign-in");
      }


    } catch (error) {
      console.error(`Error in password verification - ${error}`);
      const axiosError = error as AxiosError;
      if(axiosError.response?.status !== 200){
        setAlert(true);
        setAlertHeader(
          axiosError.response?.status === 404 ? "User not found" 
          : axiosError.response?.status === 410  ? "Code Expired" : "Incorrect Verification Code"
        )
        setAlertMessage(
          axiosError.response?.status === 404 ? "User does not exists with given email or username" 
          : axiosError.response?.status === 410  ? "Provided code is expired. Please request it again and restart the password updation process" 
          : "Provided Verification Code is not correct. Please request it again and restart the password updation process "
        )
      }   
      
    }finally{
      setCodeSentSuccess(false);
    }
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
            

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" className="underline">Forgot Password</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Reset Password</SheetTitle>
                  <SheetDescription>
                    You can reset password from here.<br/>
                    Note: If this drawer is closed you have to start again 
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-pretty text-xs md:text-sm">
                      Username<br/> or Email
                    </Label>
                    <Input disabled={codeSentSuccess} id="name" onChange={(e) => setIdentifier(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs md:text-sm">
                      New Password
                    </Label>
                    <Input disabled={codeSentSuccess} type="password" onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs md:text-sm">
                      Retype Password
                    </Label>
                    <Input disabled={codeSentSuccess} type="password" onChange={(e) => setRetypePassword(e.target.value)} className="col-span-3" />
                  </div>
                  { !codeSentSuccess && 
                      <div className="text-center text-sm">
                      { ( password === "" || retypePassword === "") ? (
                          <div></div>
                        ) : 
                        (password.length < 6) ? ( 
                          <div className="text-red-600">Password must be atleast 6 characters</div>
                        ) :
                        (password === retypePassword) ? (
                        <div className="text-green-500">Password matched</div>
                        ) : (
                          <div className="text-red-600">Password not matched</div>
                        )}
                      </div>
                  }
                  {
                    codeSentSuccess && 
                    <div className="text-sm text-center font-bold">
                      Submit code which is sent to your registered email. 
                    </div>
                  }
                  <Button disabled={codeSentSuccess} onClick={sendCode} className="w-1/3 justify-self-end">Send Code</Button>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs md:text-sm">
                      Verification Code
                    </Label>
                    <InputOTP disabled={!codeSentSuccess} maxLength={6} onComplete={(value) => setCode(value)}>
                        <InputOTPGroup className="w-48 md:w-auto" >
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>     
                  </div>
                  <SheetFooter>
                  <SheetClose asChild>  
                    <Button  onClick={verifyCodeUpdatePassword} disabled={!codeSentSuccess} className="w-1/3 justify-self-end">Submit</Button>
                  </SheetClose>
                </SheetFooter>
                </div>
              </SheetContent>
            </Sheet>

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

        {alert &&
          <AlertDialog open={alert} onOpenChange={setAlert} >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{alertHeader}</AlertDialogTitle>
                <AlertDialogDescription>
                  {alertMessage}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction >OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        }
    </div>
    </>
  )
}

export default SignIn 