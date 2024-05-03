import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/User.model";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    await dbConnect();

    try {
        
        const {username, email, code, password} = await request.json();

        const user = await userModel.findOne({
            $or: [
                {
                    username: username
                },
                {
                    email: email
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

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();


        if(isCodeValid && isCodeNotExpired){
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();

            return Response.json(
                {
                    success: true,
                    message: "Password Updated Successfully"
                },
                {
                    status: 200
                }
            );
        }
        else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired. Please request again code"
                },
                {
                    status: 410
                }
            );
        }
        else{
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code"
                },
                {
                    status: 400
                }
            );
        }

    } catch (error) {
        console.error(`Error in verifying code or saving password - ${error}`);
        return Response.json(
            {
                success: false,
                message: "Error in verifying code or saving password"
            },
            {
                status: 500
            }
        );
    }
}