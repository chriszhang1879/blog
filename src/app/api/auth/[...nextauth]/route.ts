// import NextAuth, { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// import bcrypt from "bcryptjs";
// import clientPromise from "@/mongodb/clientPromise";
// import User from "@/model/user";
// import connectDB from "@/mongodb/mongodb";
// import { JWT } from "next-auth/jwt";
// import { Session } from "next-auth";

// // Connect to MongoDB 使用mongoose连接MongoDB 
// connectDB();

// // 提取并导出authOptions配置
// export const authOptions: NextAuthOptions = {
//   //连接MongoDB 用于创建mongoDB的适配器  这个clientpromise专门为nextauth创建mongodb客户端连接
//   //总的来说这个clientpromise确保了nextauth的mongodb适配器有一个稳定高效的数据库连接 特别是在开发环境下避免了热更新时重复连接数据库的问题
//   adapter: MongoDBAdapter(clientPromise),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID as string,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }
        
//         await connectDB();
        
//         const user = await User.findOne({ email: credentials.email });
        
//         if (!user) {
//           return null;  //这个null 会导致 login代码中return { error: "User not found" };
//           //返回null触发登录失败流程 会生成一个错误信息credentialssignin传递给客户端最终在客户端的signin函数结果中体现
//           //自己的代码中透出错误信息 result.error会显示 页面显示invalid emailor password 用户不会被重定向到首页
         
//           //在自己的login代码中完全控制认证的逻辑   同时保持了nextauth的安全性和灵活性
//         }
        
//         const isPasswordValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );
        
//         if (!isPasswordValid) {
//           return null;
//           //return { error: "Invalid password" };
//         }
//         //这个返回对象会传递给nextauth的jwt回调函数 在jwt回调函数中可以决定那些字段会存储到jwt中  
//         //然后通过session回调函数决定哪些字段会存储到session中
//          //在nextauth 返回的对象中只会默认存储id name email image这些基础属性  如果从数据库中查出的其他额外的属性会被过滤掉
//          //这是为了更好的安全性和性能考虑
//          //但是后面的session回调函数中可以决定哪些字段会存储到session中
//         return {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//           image: user.image,
//         };
//       }
//     })
//   ],
//   //这里的session配置指定了使用jwt策略
//   session: {
//     strategy: "jwt" as const,
//   },
//   //这里的pages配置指定了登录、退出和错误页面的路径 
//   pages: {
//     signIn: "/login",
//     signOut: "/",
//     error: "/login",
//   },
  
//   //这里的callbacks配置指定了session和jwt回调函数
// callbacks: {
//     //这里传入的session是authorize回调函数返回的对象
//     //token是jwt回调函数返回的对象
//     async session({ session, token }: { session: Session; token: JWT }) {
//       //在这里我们可以自定义session对象的内容
//       //将token.sub赋值给session.user.id
//       if (session.user) {
//         session.user.id = token.sub;
//       }
//       return session;
//     },
//     //jwt可以自定义存储的用户信息 用于服务器端验证用户身份 好处是减少数据库查询 还可以包含额外的权限信息
//     //这个jwt先于session回调函数执行 然后执行session回调 
//     //当用户登录成功后 将认证用户的数据返回传递给jwt函数 执行完jwt函数后 其返回的token继续传递给session回调函数
//     //这里传入的user是authorize回调函数返回的对象
//     //token是jwt回调函数返回的对象
//     //作用是存储数据(哪些用户数据会被存储到jwt中) 而且这些数据是加密的存储在客户端一般是在cookie中携带
//     //每次请求都会发送cookie中的jwt到服务器
//     //服务器会解密jwt并获取其中的数据
//     //然后将这些数据传递给session回调函数
//     //无需查询数据库即可验证用户身份
//     async jwt({ token, user }: { token: JWT; user: any }) {
//       if (user && 'id' in user) {
//         //将user.id赋值给token.sub  用户id存储到jwt中
//         token.sub = user.id;
//       }
//       //jwt回调函数的返回对象会被存储在jwt中
//       //nextauth会将这个对象序列化成json字符串然后将其作为jwt的payload
//       //在session回调函数中可以从JWT中获取这个对象
//       //在jwt回调函数中可以返回null来表示不存储jwt
//       //在jwt回调函数中可以返回一个对象来表示要存储的jwt
//       //在jwt回调函数中可以抛出一个错误来表示jwt回调函数执行失败
//       return token;
//     }
//   },
//   //这里的secret配置指定了nextauth的密钥
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
