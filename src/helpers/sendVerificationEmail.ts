import { resend } from "@/lib/resend";
import verificationEmail from "../../emails/verificationEmail";
import { apiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<apiResponse> {
    try {
        await resend.emails.send({
            from: 'pk@theanonymousbaatein.online',
            to: email,
            subject: 'Mystery Message | VERIFICATION CODE',
            react: verificationEmail({username, otp: verifyCode}),
        })
        // console.log(`SENT VERIFICATION EMAIL TO - ${email}`);
        
        return { success: true, message: 'Verification email send successfully'}

    } catch (error) {
        console.log(`Error sending verification Email - ${error}`);
        return { success: false, message: 'Failed to send verification email'}
    }
}