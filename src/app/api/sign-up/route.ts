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

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                }, {status: 400});
            }
            else{
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
            message: "User Registered Successfully. Please verify your email"
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