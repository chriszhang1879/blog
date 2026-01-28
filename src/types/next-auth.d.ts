 //这些都是nextauth的类型扩展

// import "next-auth";

// declare module "next-auth" {
//   /**
//    * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
//    
//      这个是客户端可以访问的会话数据类型 前端组件通过useSession hook访问 或者getSession函数访问
//      服务器端通过getServerSession函数访问
       //因为发送到客户端的数据是经过序列化的 所以不能包含敏感信息
// */
//   interface Session {
//     user: {
//       id?: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//       role?: string;
//     };
//   }
 //这个interface user 的作用是： 定义在后端数据库中存储的用户信息的类型 作用域是服务器端 可以包含敏感信息
 //1. 定义用户对象的类型
 //2. 用于类型检查   
 //属于nextauth的类型扩展 定义了上述Session接口中的user属性的类型
//   interface User {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     role?: string;
//   }
// }
//以上定义了两个user接口 一个用于客户端 一个用于服务器端  
// nextjs从数据库获取user对象 然后将其转换成Session对象 发送到客户端 
// 这两个对象可能不同 一般来说session中的user是user的子集 sessionuser中不包含password等敏感信息
// 扩展user接口确保数据库操作类型安全 sessionuser接口确保客户端类型安全 如果只扩展一个可能导致另一个环境中类型不匹配
// 比如添加了role属性以便在数据库中存储  session 中也添加以便客户端使用

 //这个declare module "next-auth/jwt" 的作用是：
 //1. 定义JWT对象的类型
 //2. 用于类型检查   
 //属于nextauth的类型扩展 定义了上述JWT接口中的sub和role属性的类型

// declare module "next-auth/jwt" {
//   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
//   interface JWT {
//     sub?: string;
//     role?: string;
//   }
// }
