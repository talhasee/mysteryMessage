import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import userModel from "@/models/User.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;
//6626ba0ad62f0c2db45cc2e3
    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message: "Not authenticated"
            },
            {
                status: 401
            }
        );
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    console.log(`userid - ${userId}`);
    
    try {
        const _user = await userModel.aggregate([
            {
                $match: {
                    _id: userId
                }
            },
            {
                $unwind: {
                    path: '$messages',
                    preserveNullAndEmptyArrays: true
                }
 
            },
            {
                $sort: {
                    'messages.createdAt' : -1
                }
            },
            {
                $group: {
                    _id: '$_id',
                    messages: {
                        $push: '$messages'
                    }
                }
            }
        ]);

        console.log(`User - ${JSON.stringify(_user)}`);
        

        if(!_user || _user.length === 0){
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

        return Response.json(
            {
                success: true,
                messages: _user[0].messages
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error("An unexpected error occured: ", error);
        return Response.json(
            {
                success: false,
                message: "Error in getting messages"
            },
            {
                status: 500
            }
        );
        
    }
}