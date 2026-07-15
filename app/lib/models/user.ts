import mongoose,{Document,Model,Schema} from "mongoose";
import bcrypt from "bcrypt";

export interface User extends Document{
    email: string;
    password:string;
    username:string;
    createdAt:Date;
    updatedAt:Date;
    role: "superadmin" | "admin" | "editor" | "contributor";
    
    comparePassword(password:string): Promise<boolean>;
}

export interface UserModel extends Model<User>{}

const userSchema = new Schema<User,UserModel>(
    {
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please provide a valid email address",
        ],
        index: true,
      },
      username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        index: true,
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false, 
      },
      role: {
        type: String,
        enum: ["superadmin", "admin", "editor", "contributor"],
        default: "contributor",
        required: true,
      }
    },
    {
      timestamps: true, 
    }
  );

  userSchema.methods.comparePassword = async function (
    password: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  };

  const User: UserModel =
  (mongoose.models.User as UserModel) ||
  mongoose.model<User, UserModel>("User", userSchema, "users");

export default User;

