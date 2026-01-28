import { MongoClient } from "mongodb";
import mongoose from "mongoose";

// 定义MongoDB连接URI
const uri = process.env.MONGODB_URI;

// 检查URI是否存在
if (!uri) {
  throw new Error("环境变量 MONGODB_URI 未定义，请检查您的 .env 文件");
}

// MongoDB原生客户端连接选项
const mongoClientOptions = {};

// 最新版本的Mongoose已经默认启用必要的连接选项，不再需要显式指定
// 如需要自定义选项，可以直接在connect方法中传入

// 全局变量类型定义，用于在开发模式下保持连接实例
interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongooseConnection?: typeof mongoose;
  isConnected?: boolean;
}

// 将global断言为包含我们自定义属性的类型 unkonwn是类型安全的
const globalWithMongo = global as unknown as GlobalWithMongo;




/**
 * 获取MongoDB原生客户端连接
 * 返回Promise<MongoClient>类型
 */
export const getMongoClient = async (): Promise<MongoClient> => {
  if (process.env.NODE_ENV === "development") {
    // 开发模式下使用全局变量缓存连接，避免热重载时重复连接
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, mongoClientOptions);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise!;
  } else {
    // 生产模式下不使用全局变量
    const client = new MongoClient(uri, mongoClientOptions);
    return client.connect();
  }
};

/**
 * 获取Mongoose连接
 * 返回mongoose实例
 * 这里使用typeof mongoose的类型 是因为要返回的是一个mongoose模块而不是一个实例 typeof表示返回的是配置好的mongoose类型包含了所有的链接方法 模型创建的函数等
 * 里面包含了所有的功能 包括model scheme 等所有moogoose的功能
 */
export const getMongoose = async (): Promise<typeof mongoose> => {
  if (process.env.NODE_ENV === "development") {
    // 开发模式下使用全局变量缓存连接  因为开发环境避免热重载导致的重复连接
    if (!globalWithMongo._mongooseConnection) {
      // 如果mongoose当前未连接
      if (!globalWithMongo.isConnected) {
        await mongoose.connect(uri);
        globalWithMongo.isConnected = true;
      }
      //将mongoose实例赋值给全局变量 确保指向的是同一个mongoose实例对象
      globalWithMongo._mongooseConnection = mongoose;
    }
    //这里返回是globalWithMongo._mongooseConnection（指向mongoose模块） 
    // 不是实例  因为实例往往是构造函数创造的对象 但是mongoose不是new创建的他是模块本身
    return globalWithMongo._mongooseConnection!;
  
  } else {
    // 生产模式下，如果未连接则连接
    if (!mongoose.connection.readyState) {
      await mongoose.connect(uri);
    }
    //生产环境直接返回mongoose模块 因为生产环境一般只会启动时候链接一次 不需要特殊处理来防止重复链接
    return mongoose;
  }
};

// 为了向后兼容，默认导出MongoDB原生客户端Promise
const clientPromise = getMongoClient();

export default clientPromise;
