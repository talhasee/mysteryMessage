import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import { sendPasswordUpdationEmail } from "@/helpers/sendPasswordUpdationEmail";


export async function POST(request: Request) {
    await dbConnect();

    try {
        const {identifier} = await request.json();

        const user = await userModel.findOne({
            $or: [
                {
                    username: identifier
                },
                {
                    email: identifier
                }
            ]
        });

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }

        const username = user.username;
        const email = user.email;
        
        const verifyCode = Math.floor(100000 + Math.random()*900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        
        user.verifyCode = verifyCode;
        user.verifyCodeExpiry = expiryDate.toString();

        await user.save();

        const emailResponse = await sendPasswordUpdationEmail(
            email,
            username,
            verifyCode
        );

        if(!emailResponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                }, 
                {
                    status: 500
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Verification Code sent successfully",
                user: {
                    username: user.username,
                    email: user.email
                }
            }, 
            {
                status: 200
            }
        );
        
    } catch (error) {
        console.error("Error sending verification code", error);
        return Response.json(
            {
                success: false,
                message: "Error sending verification code"
            },
            {
                status: 500
            }
        )
    }
}