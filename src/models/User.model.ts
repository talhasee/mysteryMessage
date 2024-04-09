import mongoose, {Schema, Document} from "mongoose";

/***************************************
                MESSAGE SCHEMA
****************************************/


export interface Message extends Document{
    content: string;
    createdAt: Date
}

const messageSchema: Schema<Message> = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date, 
            required: true,
            default: Date.now
        }
    }
);

/***************************************
                USER SCHEMA
****************************************/

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verifyCode: string;
    verifyCodeExpiry: string;
    isAcceptingMessage: boolean;
    messages: Message[]
};

const UserSchema: Schema<User> = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            unique: true
        },
        email:{
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [/.+\@.+\..+/, "Please use a valid email"]
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        verifyCode: {
            type: String,
            required: [true, "Verify Code is required"]
        },
        verifyCodeExpiry: {
            type: String,
            required: [true, "Verify Code Expiry is required"]
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isAcceptingMessage: {
            type: Boolean,
            default: true
        },
        messages: [
            messageSchema
        ]
    }
);

const userModel = 
    (
        mongoose.models.User as mongoose.Model<User>
    ) 
    || 
    (
        mongoose.model<User>("User", UserSchema)
    )

export default userModel;