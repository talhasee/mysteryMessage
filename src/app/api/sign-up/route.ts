import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect();

    try {
        const {username, email, password} = await request.json();

        //CHECKING IS USER WITH SAME USERNAME EXISTS OR NOT
        const existingUserVerifiedByUsername = await userModel.findOne({
            username,
            isVerified: true
        });

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400});
        }
        
        const existingUserByEmail = await userModel.findOne(
            {email}
        );

        
        
        const verifyCode = Math.floor(100000 + Math.random()*900000).toString();
        //User already exists but email is not verified so its username will 
        //be same as the first time when he tried to registered on our website
        let existingEmailNotVerifiedUser = false;
        let usernameToSend = "";
        
        if(existingUserByEmail){
            // console.log(`CHECKING INSIDE - ${existingUserByEmail}`);
            usernameToSend = existingUserByEmail.username; 
            if(existingUserByEmail.isVerified){
                console.log("Email already used!!");

                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                }, {status: 400});
            }
            else{
                existingEmailNotVerifiedUser = true;
                const hashedPassword = await bcrypt.hash(password, 10);

                //UPDATING USER DETAILS AND SAVING IT
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000).toString();
                await existingUserByEmail.save();
            }
        }
        else{

            const hashedPassword = await bcrypt.hash(password, 10);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new userModel({
                username,
                email,
                password: hashedPassword,
                isVerified: false,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isAcceptingMessage: true,
                messages: []
            });

            await newUser.save();

            usernameToSend = newUser.username;
        }

        //SEND VERIFICATION EMAIL
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500});
        }

        // console.log(`EMAIL - ${emailResponse}`);
        

        return Response.json({
            success: true,
            message: existingEmailNotVerifiedUser ? "User already exists with email. Please verify your email" : "User Registered Successfully. Please verify your email",
            username: usernameToSend
        }, {status: 201});

    } catch (error) {
        console.error(`Error registering user`, error);
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
        
    }
}