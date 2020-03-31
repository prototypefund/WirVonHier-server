import bcrypt from 'bcrypt';

class Hashingservice {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(20);
    return await bcrypt.hash(password, salt);
  }

  checkPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

export const hashingService = new Hashingservice();
