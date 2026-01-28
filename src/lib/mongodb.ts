import mongoose from 'mongoose';

// MongoDB connection URL for local development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-quote-app';

// Global variable to maintain the connection across hot reloads in development
declare global {
  var mongoose: {
    //定义mongoose连接 类型为mongoose.Mongoose | null
    conn: mongoose.Mongoose | null;
    //定义mongoose连接Promise 类型为Promise<mongoose.Mongoose> | null
    promise: Promise<mongoose.Mongoose> | null;
  };
}

// Initialize the global mongoose object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Connect to MongoDB
 */
export async function connectToDatabase() {
  if (global.mongoose.conn) {
    // Use existing database connection
    console.log('Using existing MongoDB connection');
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection');
    // 连接数据库
    global.mongoose.promise = mongoose.connect(MONGODB_URI, opts);
  }
  
  try {
    //等待连接完成
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    //连接失败
    global.mongoose.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }
//返回mongoose连接 是一个mongoose.Mongoose类型
  return global.mongoose.conn;
}

/**
 * Disconnect from MongoDB (useful for testing)
 */
export async function disconnectFromDatabase() {
  if (!global.mongoose.conn) {
    return;
  }
  
  await mongoose.disconnect();
  global.mongoose.conn = null;
  global.mongoose.promise = null;
  console.log('Disconnected from MongoDB');
}
