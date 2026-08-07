import { User, IUser } from "../models/user.model";
import { FilterQuery, UpdateQuery } from "mongoose";

export class UserRepository {
  public async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  public async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  public async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  }

  public async findByVerificationToken(token: string): Promise<IUser | null> {
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
  }

  public async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
  }

  public async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  public async update(id: string, updateData: UpdateQuery<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  public async findOne(query: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne(query);
  }

  public async delete(id: string): Promise<boolean> {
    const res = await User.findByIdAndDelete(id);
    return !!res;
  }
}

export const userRepository = new UserRepository();
