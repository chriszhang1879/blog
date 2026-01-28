import { Redis } from 'ioredis';

// Redis 客户端配置
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// 创建 Redis 客户端实例
let redis: Redis;

// 获取 Redis 客户端的函数
export function getRedisClient() {
  if (!redis) {
    redis = new Redis(redisUrl);
  }
  return redis;
}


// 关闭 Redis 连接的函数（用于测试或关闭应用时）
export async function closeRedisConnection() {
  if (redis) {
    await redis.quit();
    redis = undefined as any;
  }
}


//ToDo
// 博客热度相关的 Redis 键 后面的这个blog:views怎么用呢？

// Hash: 存储博客浏览量的 Hash

const BLOG_VIEWS_KEY = 'blog:views';       // 存储博客浏览量的 Hash
const BLOG_LIKES_KEY = 'blog:likes';       // 存储博客点赞数的 Hash
const BLOG_COMMENTS_KEY = 'blog:comments'; // 存储博客评论数的 Hash
const BLOG_SHARES_KEY = 'blog:shares';     // 存储博客分享数的 Hash
const BLOG_HEAT_KEY = 'blog:heat';         // 存储博客热度分数的 Sorted Set
const BLOG_LAST_INTERACTION_KEY = 'blog:last_interaction'; // 存储最后交互时间的 Hash

// 热度计算权重
const VIEW_WEIGHT = 1;
const LIKE_WEIGHT = 5;
const COMMENT_WEIGHT = 10;
const SHARE_WEIGHT = 15;
const TIME_DECAY_FACTOR = 0.05;

/**
 * 记录博客浏览
 * @param blogId 博客ID
 */
export async function recordBlogView(blogId: string) {
  const redis = getRedisClient();

  // 增加浏览量
  await redis.hincrby(BLOG_VIEWS_KEY, blogId, 1);

  // 更新最后交互时间
  await redis.hset(BLOG_LAST_INTERACTION_KEY, blogId, Date.now());

  // 更新热度分数
  await updateBlogHeatScore(blogId);
}

/**
 * 记录博客点赞
 * @param blogId 博客ID
 */
export async function recordBlogLike(blogId: string) {
  const redis = getRedisClient();

  // 增加点赞数
  await redis.hincrby(BLOG_LIKES_KEY, blogId, 1);

  // 更新最后交互时间
  await redis.hset(BLOG_LAST_INTERACTION_KEY, blogId, Date.now());

  // 更新热度分数
  await updateBlogHeatScore(blogId);
}

/**
 * 记录博客评论
 * @param blogId 博客ID
 */
export async function recordBlogComment(blogId: string) {
  const redis = getRedisClient();

  // 增加评论数
  await redis.hincrby(BLOG_COMMENTS_KEY, blogId, 1);

  // 更新最后交互时间
  await redis.hset(BLOG_LAST_INTERACTION_KEY, blogId, Date.now());

  // 更新热度分数
  await updateBlogHeatScore(blogId);
}

/**
 * 记录博客分享
 * @param blogId 博客ID
 */
export async function recordBlogShare(blogId: string) {
  const redis = getRedisClient();

  // 增加分享数
  await redis.hincrby(BLOG_SHARES_KEY, blogId, 1);

  // 更新最后交互时间
  await redis.hset(BLOG_LAST_INTERACTION_KEY, blogId, Date.now());

  // 更新热度分数
  await updateBlogHeatScore(blogId);
}

/**
 * 更新博客热度分数
 * @param blogId 博客ID
 */
export async function updateBlogHeatScore(blogId: string) {
  const redis = getRedisClient();

  // 获取各项指标
  const [views, likes, comments, shares, createdAt] = await Promise.all([
    redis.hget(BLOG_VIEWS_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget(BLOG_LIKES_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget(BLOG_COMMENTS_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget(BLOG_SHARES_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget('blog:created_at', blogId).then(val => parseInt(val || Date.now().toString()))
  ]);

  // 计算基础热度分数
  let heatScore =
    views * VIEW_WEIGHT +
    likes * LIKE_WEIGHT +
    comments * COMMENT_WEIGHT +
    shares * SHARE_WEIGHT;

  // 应用时间衰减
  const now = Date.now();
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
  heatScore = heatScore * Math.exp(-TIME_DECAY_FACTOR * daysSinceCreation);

  // 更新热度分数到 Sorted Set
  await redis.zadd(BLOG_HEAT_KEY, heatScore, blogId);

  return heatScore;
}



/**
 * 获取热门博客ID列表
 * @param limit 返回的博客数量
 */
export async function getHotBlogIds(limit = 10) {
  const redis = getRedisClient();

  // 使用 ZREVRANGE 获取热度排名前 limit 的博客ID
  // ZREVRANGE 按分数从高到低排序
  return redis.zrevrange(BLOG_HEAT_KEY, 0, limit - 1);
}




/**
 * 获取博客的热度统计信息
 * @param blogId 博客ID
 */
export async function getBlogStats(blogId: string) {
  const redis = getRedisClient();

  // 获取博客的各项统计数据
  const [views, likes, comments, shares, heatScore] = await Promise.all([
    //返回的是Promise v
    redis.hget(BLOG_VIEWS_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget(BLOG_LIKES_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget(BLOG_COMMENTS_KEY, blogId).then(val => parseInt(val || '0')),
    redis.hget(BLOG_SHARES_KEY, blogId).then(val => parseInt(val || '0')),
    redis.zscore(BLOG_HEAT_KEY, blogId).then(val => parseFloat(val || '0'))
  ]);

  return {
    views,
    likes,
    comments,
    shares,
    heatScore
  };
}

/**
 * 同步 MongoDB 中的博客数据到 Redis
 * 用于初始化或定期同步
 * @param blogs 博客数据数组
 */
export async function syncBlogsToRedis(blogs: any[]) {
  const redis = getRedisClient();
  const pipeline = redis.pipeline();

  for (const blog of blogs) {
    const blogId = blog._id.toString();

    // 设置各项指标
    pipeline.hset(BLOG_VIEWS_KEY, blogId, blog.views || 0);
    pipeline.hset(BLOG_LIKES_KEY, blogId, blog.likes || 0);
    pipeline.hset(BLOG_COMMENTS_KEY, blogId, blog.comments || 0);
    pipeline.hset(BLOG_SHARES_KEY, blogId, blog.shares || 0);

    // 设置创建时间
    pipeline.hset('blog:created_at', blogId, new Date(blog.createdAt).getTime());

    // 设置最后交互时间
    pipeline.hset(BLOG_LAST_INTERACTION_KEY, blogId,
      new Date(blog.lastInteraction || blog.updatedAt || blog.createdAt).getTime());

    // 计算并设置热度分数
    const heatScore =
      (blog.views || 0) * VIEW_WEIGHT +
      (blog.likes || 0) * LIKE_WEIGHT +
      (blog.comments || 0) * COMMENT_WEIGHT +
      (blog.shares || 0) * SHARE_WEIGHT;

    pipeline.zadd(BLOG_HEAT_KEY, heatScore, blogId);
  }

  // 执行所有命令
  await pipeline.exec();
}
