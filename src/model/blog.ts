import mongoose, { Schema, Document, Model } from 'mongoose';

// 定义博客文档的接口，包含我们的自定义文档实例的方法 用于类型化单个实例文档 继承子document
interface IBlog extends Document {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  author: mongoose.Types.ObjectId; //这里为啥定义为mongoose.Types.ObjectId？
  //这里type: Schema.Types.ObjectId是保存已存在的用户文档的_id 来建立引用关系
  //ref: 'User'是告诉mongoose这个字段引用的是User集合  不需要加unique true因为多篇文章可以有同一个作者
  //这里的user的大小写必须和moogoose.model("User", userSchema)中的User一致 与文件名字user.ts不必一致
  featured: boolean;
  categories: string[];
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  shares: number;
  heatScore: number;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
  timeAgo?: string;
  // 定义实例方法
  getTimeAgo(): string;
  incrementViews(): Promise<IBlog>;
  like(): Promise<IBlog>;
  addComment(): Promise<IBlog>;
  share(): Promise<IBlog>;
}

// 定义博客模型的静态方法 为什么要定义这个静态方法？
interface IBlogModel extends Model<IBlog> {
    getHotBlogs(limit?: number): Promise<IBlog[]>;
}


//以上需要两个接口的定义 不能合并为一个 定义了单个文档的字段的接口和模型的接口要去分开
//mongoose使用不同基类型Document和Model  一个接口不能同时表示这两种类型
//mongoose明确区分了实例方法和静态方法

//实现一个关联字段user
// 博客模型定义
const blogSchema = new Schema(
  {

    title: {
      type: String,
      required: [true, '标题是必填项'],
      trim: true,
      maxlength: [100, '标题不能超过100个字符']
    },
    content: {
      type: String,
      required: [true, '内容是必填项']
    },
    excerpt: {
      type: String,
      maxlength: [200, '摘要不能超过200个字符']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    author: {
      //这里type: Schema.Types.ObjectId是保存已存在的用户文档的_id 来建立引用关系
      //ref: 'User'是告诉mongoose这个字段引用的是User集合  不需要加unique true因为多篇文章可以有同一个作者
      //这里的user的大小写必须和moogoose.model("User", userSchema)中的User一致 与文件名字user.ts不必一致
      ref: 'User',
      //这里的true代表必须插入author字段 否则验证失败
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    categories: [{
      type: String,
      required: true,
      //这个enum的作用是限制categories字段的值只能是数组中的一个
      enum: ['all posts', ' web design', 'development', 'database', 'search engines', 'marketing', 'life music', 'life movie', 'life book', 'life game', 'life sport', 'life fashion', 'life beauty', 'life health', 'life finance', 'life education', 'life technology', 'life other']
    }],
    //tags字段存储的是字符串数组  数组的方法有foreach pop push 等
    tags: [String],

    // 热度相关字段
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },

    comments: [{
      //comments字段存储的是评论文档的_id 明确用唯一标识符号来关联评论文档
      //当需要引用其他集合的文档时候必须使用ObjectId类型并指定ref类型
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],


    shares: {
      type: Number,
      default: 0
    },
    // 热度分数 - 将由中间件自动计算
    heatScore: {
      type: Number,
      default: 0,
      index: true // 添加索引以优化排序查询
    },
    // 记录用户交互的时间戳，用于热度衰减计算
    lastInteraction: {
      type: Date,
      default: Date.now
    },
     // 时间间隔显示格式（由虚拟字段计算，不存储在数据库中 可以删除这个字段）
    // timeAgo: {
    //   type: String,
    // 这个字段不会存储在数据库中，只在查询时计算
    // 实际值由 timeAgoVirtual 虚拟字段提供 前端调用的使用使用的时 timeAgoVirtual这个字段
    // }
  },
  { timestamps: true } // 自动添加 createdAt 和 updatedAt 字段
);

// 这个方法是中间件方法 属于schema级别配置的内置方法 属于全局的内部实现细节 不属于单个文档 不是公共api的一部分 还有一个是blogscnema.post
// 不需要暴露在接口中 是在特定事件比如save时候自动执行 不是显示调用的方法
// 添加中间件：在保存前计算热度分数  在特定的操作之前比如保存  更新 删除等的前后会自动执行 可以修改数据或者执行额外的逻辑   用户数据u暗转僧 自动计算字段 日志记录等
blogSchema.pre('save', function(next) {
  // 热度计算公式：views + likes*5 + comments*10 + shares*15
  // 可以根据实际需求调整权重
  this.heatScore =
    this.views +
    this.likes * 5 +
    this.comments * 10 +
    this.shares * 15;

  // 时间衰减因子：随着时间推移，热度逐渐降低
  // 计算文章发布至今的天数
  const now = new Date();
  //计算文章发布至今的天数
  const daysSinceCreation = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));

  // 应用时间衰减：热度随时间指数衰减
  // 衰减公式：score * Math.exp(-0.05 * days)
  // 0.05 是衰减系数，可以根据需要调整
  this.heatScore = this.heatScore * Math.exp(-0.05 * daysSinceCreation);

  // 更新最后交互时间
  this.lastInteraction = now;

  //next的作用是让 mongoose 继续执行后续的保存操作
  next();
});


//添加虚拟字段：计算创建时间与当前时间的间隔
//这个virtual是虚拟字段不是方法你是scheme级别定义配置的 不是文档实例的方法 不需要暴露给接口可以直接访问
//这个方法是虚拟字段的get函数  虚拟字段只在运行时计算 可以不用在schema中定义 最终前端返回的也是timeAgoVirtual这个字段
//这里我们传入的是IBlog类型文档实例，但是在某些场景下仍有可能this被视为基础的Document类型不包含这个getTimeAgo方法 特别是当虚拟字段内序列化或者在某些mongoose内部操作的时候
//还有因为iblog这个接口是定义在blog.ts文件中 在其他模块或者mongoose内部操作的时候 可能无法访问这个接口 那么通过全局扩展Document接接口确保在任何地方都能识别这个方法
blogSchema.virtual('timeAgoVirtual').get(function(this: IBlog) {
  return this.getTimeAgo();
});



//实例方法和静态方法的区别是
//实例方法是通过模型的实例调用的
//    比如  blogpost = await blog.findbyid(id)   blogpost.incrementViews()
           //this指向blogpost当前实例文档
           //用于操作单个文档 实现特定的业务逻辑
//静态方法是通过模型直接调用的 \
     //  比如  const hotblogs = await Blog.gethotblogs(10)直接获取热门博客列表
          //用于适合操作整个集合的场景 会查询操作所有的文档  通过模型直接调用gethotblogs方法 通常用于执行与整个集合相关的操作 适合查询 聚合等功能
           // this指向的时模型本身 不会依赖特定文档实例的操作
//
// 静态方法：获取热门博客  静态方法不是实例方法 通过模型直接调用gethotblogs方法 通常用于执行与整个集合相关的操作 适合查询 聚合等功能
//在这里用户获取热门博客列表
blogSchema.statics.getHotBlogs = async function(limit = 10) {
  //find()是查询所有文档
  return this.find()
    //sort({ heatScore: -1 })是按热度降序排序
    .sort({ heatScore: -1 }) // 按热度降序排序
    //limit(limit)是限制返回的文档数量
    .limit(limit)
    //populate('author', 'name image')是关联作者信息
    .populate('author', 'name image') // 关联作者信息
    //select('title excerpt slug author categories views likes comments heatScore createdAt')是选择性字段 作用是只返回需要的字段
    .select('title excerpt slug author categories views likes comments heatScore createdAt');
};

// 实例方法：这里是增加浏览量并更新热度
// 实例方法是通过模型的实例调用的
// 附加到模型的实例文档上 通过调用实例方法来修改文档
// 用于操作单个文档的数据 适合实现特定的文档的业务逻辑
//这些函数的优势是
//1. 代码组织更清晰
//2. 逻辑逻辑集中 将数据相关的业务逻辑集中在模型中
//3. 可以避免重复代码
//4. 可以方便地扩展
//5. 一致性 确保相同操作在所有文档上执行一致
//6. 抽象性 提供统一api操作

blogSchema.methods.incrementViews = async function() {
  this.views += 1;
  this.lastInteraction = new Date();
  //这里的this代表当前的blog文档  save()是保存文档
  await this.save();
  //返回当前的blog文档
  return this;
};

// 实例方法：点赞并更新热度
blogSchema.methods.like = async function() {
  this.likes += 1;
  this.lastInteraction = new Date();
  await this.save();
  return this;
};

// 实例方法：添加评论并更新热度
blogSchema.methods.addComment = async function() {
  this.comments += 1;
  this.lastInteraction = new Date();
  await this.save();
  return this;
};

// 实例方法：分享并更新热度
blogSchema.methods.share = async function() {
  this.shares += 1;
  this.lastInteraction = new Date();
  await this.save();
  return this;
};

// 实例方法：计算并格式化时间间隔  计算时间间隔是在服务器端完成的 基于请求时的时间计算的
blogSchema.methods.getTimeAgo = function(this: IBlog): string {
  const now = new Date();
  const createdAt = this.createdAt;
  const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  // 不同时间单位的秒数
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  // 根据时间差返回不同格式
  if (diffInSeconds < minute) {
    return `${diffInSeconds} 秒前`;
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `${minutes} 分钟前`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `${hours} 小时前`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return `${days} 天前`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return `${weeks} 周前`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `${months} 个月前`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return `${years} 年前`;
  }
};

// 配置 toJSON 和 toObject 选项，确保虚拟字段timeAgoVirtual被包含在输出中
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

// 创建模型
// mongoose.models.Blog是mongoose缓存的模型
// 看做是iblogmodel类型 确保了从缓存中获取模型也有我们定义的静态类型方法gethotblogs
// IBlogModel是接口类型
// mongoose.model<IBlog, IBlogModel>('Blog', blogSchema)是创建模型
// 这里定义是明确告诉ts编译器blog被视为IBlog类型期中所包含的方法和字段和iblgomodel类型的所有方法和字段
// (mongoose.models.Blog as IBlogModel) || mongoose.model<IBlog, IBlogModel>('Blog', blogSchema)是创建模型
const Blog = (mongoose.models.Blog as IBlogModel) || mongoose.model<IBlog, IBlogModel>('Blog', blogSchema);

export default Blog;
