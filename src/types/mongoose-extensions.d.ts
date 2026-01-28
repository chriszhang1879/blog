// 扩展 Mongoose 的 Document 接口，添加我们的自定义方法
//这个扩展是为了解决ts和mongoose动态方法机制之间的不匹配问题 特别是在虚拟字段的上下文中
//
declare module 'mongoose' {
  interface Document {
    //这里:后面是返回值类型 string
    //这里扩展Document接口 添加getTimeAgo方法的意义在于 虚拟字段vitural（timeAgoVirtual）中使用了这个方法
    getTimeAgo(): string;
    //  incrementViews(): Promise<IBlog>;
    // like(): Promise<IBlog>;
    // addComment(): Promise<IBlog>;
    // share(): Promise<IBlog>;
  }
}
