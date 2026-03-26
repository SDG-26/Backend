import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-author-api';

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log('Successfully connected to MongoDB.');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Successfully disconnected from MongoDB.');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }
}

export default Database.getInstance();
