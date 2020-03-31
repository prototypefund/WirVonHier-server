import { IUserFilter } from './service.types';
import { User, IUser } from '@/persistance/models';

class UserService {
  createUsers(businesses: IUser[]): Promise<IUser[]> {
    return User.create(businesses);
  }

  async deleteOneUser(id: string): Promise<void> {
    await User.deleteOne({ _id: id });
  }

  async updateOneUser(id: string, fieldsToUpdate: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, fieldsToUpdate, { new: true });
  }

  getOneUserById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  // TODO Write getFilteredUsers()
  async getFilteredUsers(filter: IUserFilter): Promise<IUser[]> {
    // calculate min/max lat + min/max long based on request location + max distance
    // filter businesses based on filter params
    await User.findById(filter).exec();
    return [];
  }
}

export const userService = new UserService();
