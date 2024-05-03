"use client"
import { useSession, signOut} from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { User } from "next-auth";
import { Button } from './ui/button';
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
import { Input } from "@/components/ui/input";
import { Settings } from 'lucide-react';

function Navbar() {
    const {data: session} = useSession();

    const user: User = session?.user as User;

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
            <nav className='p-4 md:p-6 md:gap-5 shadow-md w-full'>
                <div className="container mx-auto flex flex-row md:flex-row justify-between items-center">
                    <a className="text-lg md:text-xl font-bold" href="#">Mystery Message</a>
                    {
                        session  ? (
                            <>
                                <span className=' font-bolder text-base md:text-2xl'>Welcome, {user?.username || user?.email}</span>
                                <Button className='w-auto md:w-auto mr-4 ml-2 md:ml-0' onClick={() => signOut()}>Logout</Button>
                                
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Settings className='cursor-pointer h-8 w-8 md:h-5 md:w-5'/>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                        <SheetTitle>Change Password</SheetTitle>
                                        <SheetDescription>
                                            You can change password from here.<br/>
                                            Note: If this drawer is closed you have to start again 
                                        </SheetDescription>
                                        </SheetHeader>
                                        <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right text-pretty h-auto text-xs md:text-sm">
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
                                                <InputOTPGroup className="w-48 md:w-auto">
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

                                    {alert &&
                                        <div className='mx-5'>
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
                                        </div>
                                    }

                                
                            </>
                        ) : (
                            <Link href='/sign-in'>
                                <Button className='w-full md:w-auto'>Login</Button>
                            </Link>
                        )
                    }
                </div>
            </nav>
    )
}

export default Navbar
