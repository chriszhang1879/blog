//创建用户模型
import mongoose from "mongoose";

// 定义打卡记录的子文档结构  定义了用户每次打开需要记录的数据结构 作为嵌套在用户文档中的子文档不会创建单独的集合
const checkInSchema = new mongoose.Schema(
  {
    //用户打卡的日期
    date: {
      //类型是日期
      type: Date,
      //默认值是当前时间
      default: Date.now
    },
    //用户打卡的地理位置信息
    location: {
      //类型是一个对象
      type: {
        //城市
        city: String,
        //国家
        country: String,
        //ip地址
        ip: String,
        //坐标
        coordinates: {
          //纬度
          latitude: Number,
          //经度
          longitude: Number
        }
      },
      //默认值是null
      default: null
    }
  },
  // _id: false 表示不创建id和独立的集合 减少数据冗余
  { _id: false }
);



const userSchema = new mongoose.Schema(
    {
    //clerk的用户id
    clerkId: String,

    username: {
        type: String,
        //默认值 这里必须传入this的明确包含email类型 否则会报错 因为this不知道什么类型是可用的
        //这里的this是UserSchema中的this 传入的是UserSchema中的email类型 其他类型有传入吗？
        //没有
        default:function(this: {email:string}){
            return this.email.split("@")[0]||`user_${Date.now()}`
        }
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },

    password: String,

    image: String,

    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },

    // 收藏的博客列表
    favorites: {
      //类型是一个对象数组 期中的type是mongoose.Schema.Types.ObjectId 指向了Blog模型
      type: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
        }
      ],
      default: []
    },
    // 用户积分
    points: {
      type: Number,
      default: 0
    },
    // 连续打卡天数
    consecutiveCheckIns: {
      type: Number,
      default: 0
    },

    // 总打卡天数
    totalCheckIns: {
      type: Number,
      default: 0
    },

    // 上次打卡日期
    lastCheckIn: {
      type: Date,
      default: null
    },

    // 打卡历史记录 [checkInSchema]作用是解析checkInSchema中的数据 []是数组允许每一个用户有多个打卡记录 形成历史打卡记录
    checkInHistory: {
      type: [checkInSchema],
      default: []
    },

    // 最后一次获取的地理位置信息
    lastLocation: {
      type: {
        city: String,
        country: String,
        ip: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      default: null
    },

    provider: {
        type: String,
        default: "credentials"
    },
    //providerId: String,
  },


  //timestamps: true是mongoose的内置属性 用于自动添加 createdAt 和 updatedAt 字段
  {
    timestamps: true
});

// Check if the model is already defined to prevent overwriting moogoose.models和mongoose.model
// mongoose.models.User是mongoose缓存的模型  作用是避免重复定义模型
// mongoose.model("User", userSchema)是创建模型
// (mongoose.models.User as IUserModel) || mongoose.model("User", userSchema)是创建模型
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
