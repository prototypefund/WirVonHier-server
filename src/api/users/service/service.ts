import { IUserFilter } from './service.types';
import { User, IUser } from 'persistance/models';
import { mailService } from 'modules';

class UserService {
  createUsers(users: IUser[]): Promise<IUser[]> {
    return User.create(users);
  }

  async deleteOneUser(id: string): Promise<void> {
    await User.deleteOne({ _id: id });
  }

  async updateOneUser(id: string, fieldsToUpdate: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, fieldsToUpdate);
  }

  async getOneUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).select('-password');
  }

  // TODO Write getFilteredUsers()
  async getFilteredUsers(filter: IUserFilter): Promise<IUser[]> {
    // calculate min/max lat + min/max long based on request location + max distance
    // filter businesses based on filter params
    await User.findById(filter).exec();
    return [];
  }

  async updatePassword(userId: string, newPassword: string): Promise<{ status: number; message?: string }> {
    const updates = {
      changeEmailToken: undefined,
      password: newPassword,
    };
    try {
      await this.updateOneUser(userId, updates);
      mailService.sendPasswordChangedEmail(userId);
      return { status: 204 };
    } catch (e) {
      return { status: 400, message: e.message };
    }
  }
}

export const userService = new UserService();
