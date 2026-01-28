//这个文件的作用是整合了mongoose和mongodb两种数据库的连接方式

import mongoose from "mongoose";
import { MongoClient } from "mongodb";




if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  bufferCommands: false,
};

// 全局类型定义 var的作用域是全局的在整个函数中都是可以访问的 无论这个变量定义在哪里 在全局声明中的变量会成为全局对象的属性 可以变量提升 console.log(x)  var x=1合法 但是只会输出undefined不会是1 因为值不会提升
// let和const是块级作用域 只在声明的块级作用域内可以访问 不会成为全局变量 不存在变量提升 console.log(x)  let x=1不合法
// var在同一作用域内可以重复声明 var x = 1; var x = 2;合法现在是2
// let和const在同一作用域内不能重复声明 let x = 1; let x = 2;不合法
// var和let可以被重新赋值 var x = 1; x = 2;合法 let x = 1; x = 2;合法
// const不能被重新赋值 const x = 1; x = 2;不合法 但对象和数组内的元素属性可以修改 但是不能重新赋值
// var 和let 可以先声明后赋值 const必须先赋值后声明 var x  x=1合法 let x x=1合法 const x 不合法
   //var在循环中有闭包的问题
//  var和let的区别：现代js中推荐使用let和const
  //declare global 声明一个全局变量 这个全局变量可以在整个项目中使用
declare global {
  var mongoClient: {
    conn: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
  var mongooseClient: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

// 初始化全局变量
if (!global.mongoClient) {
  global.mongoClient = {
    conn: null,
    promise: null,
  };
}

if (!global.mongooseClient) {
  global.mongooseClient = {
    conn: null,
    promise: null,
  };
}

/**
 * 获取 MongoDB 原生客户端
 * 适用于需要直接使用 MongoDB 驱动的场景
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (global.mongoClient.conn) {
    return global.mongoClient.conn;
  }

  if (!global.mongoClient.promise) {
    const client = new MongoClient(uri);
    global.mongoClient.promise = client.connect();
  }

  try {
    global.mongoClient.conn = await global.mongoClient.promise;
  } catch (e) {
    global.mongoClient.promise = null;
    throw e;
  }

  return global.mongoClient.conn;
}

/**
 * 连接到 MongoDB 使用 Mongoose
 * 适用于使用 Mongoose 模型和架构的场景
 */
export async function connectToDatabase(): Promise<mongoose.Mongoose> {
  if (global.mongooseClient.conn) {
    return global.mongooseClient.conn;
  }

  if (!global.mongooseClient.promise) {
    global.mongooseClient.promise = mongoose.connect(uri, options);
  }

  try {
    global.mongooseClient.conn = await global.mongooseClient.promise;
  } catch (e) {
    global.mongooseClient.promise = null;
    throw e;
  }

  return global.mongooseClient.conn;
}

/**
 * 断开所有数据库连接
 * 用于测试或应用关闭时
 */
export async function disconnectFromDatabase() {
  if (global.mongooseClient.conn) {
    await mongoose.disconnect();
    global.mongooseClient.conn = null;
    global.mongooseClient.promise = null;
  }

  if (global.mongoClient.conn) {
    await global.mongoClient.conn.close();
    global.mongoClient.conn = null;
    global.mongoClient.promise = null;
  }
}

// 为了向后兼容，导出 clientPromise
export const clientPromise = global.mongoClient.promise ||
  (new MongoClient(uri)).connect();

// 默认导出 connectToDatabase 函数，与现有代码兼容
export default connectToDatabase;
