import mongoose, { Schema, Document } from 'mongoose';

//document是mongoose中的一个接口 里面的字段是mongoose的默认字段 为什么要集成Document接口？
//因为Document接口中包含了_id createdAt updatedAt等字段  不继承Document接口那么这些字段就不会被自动添加?
export interface IComment extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
}

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, '评论内容不能为空'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    //这里使用了多对一的关联 一个博客可以有多个评论 多个不同的post可以对应同一个blog 
    //但是反过来blog模型中有commets字段的话那么一个blog可以有多个评论 多个不同的post可以对应同一个blog
      //那么数据模型设计应该为 comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
  },
  { timestamps: true }
);

// 使用mongoose.models检查模型是否已经存在，避免热重载时重复定义模型
const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
