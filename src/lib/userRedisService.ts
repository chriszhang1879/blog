import { getRedisClient } from './redis';
import mongoose from 'mongoose';




// 用户打卡相关的 Redis 键 这里的user:checkin:是前缀
const USER_CHECKIN_KEY = 'user:checkin:';           // 用户打卡记录前缀
const USER_CONSECUTIVE_CHECKINS = 'user:consecutive:'; // 连续打卡天数前缀
const USER_TOTAL_CHECKINS = 'user:total_checkins:';   // 总打卡天数前缀
const USER_POINTS = 'user:points:';                  // 用户积分前缀
const USER_LOCATION = 'user:location:';              // 用户地理位置前缀
const USER_LAST_CHECKIN = 'user:last_checkin:';      // 用户上次打卡时间前缀

// 地理位置缓存过期时间（24小时）
const LOCATION_CACHE_TTL = 60 * 60 * 24;






/**
 * 获取用户打卡信息
 * @param userId 用户ID
 */
export async function getUserCheckInInfo(userId: string) {
  const redis = getRedisClient();

  //这个方括号的意义是将Promise.all返回的数组解构  promise.all是并行执行多个Promise
  const [consecutiveCheckIns, totalCheckIns, points, lastCheckIn] = await Promise.all([
    redis.get(`${USER_CONSECUTIVE_CHECKINS}${userId}`).then(val => parseInt(val || '0')),
    redis.get(`${USER_TOTAL_CHECKINS}${userId}`).then(val => parseInt(val || '0')),
    redis.get(`${USER_POINTS}${userId}`).then(val => parseInt(val || '0')),
    redis.get(`${USER_LAST_CHECKIN}${userId}`).then(val => val ? new Date(parseInt(val)) : null)
  ]);

  return {
    consecutiveCheckIns,
    totalCheckIns,
    points,
    lastCheckIn
  };
}

/**
 * 检查用户今天是否已经打卡
 * @param userId 用户ID
 */
export async function hasCheckedInToday(userId: string) {
  const redis = getRedisClient();
  const today = new Date();
  //获取今天的日期 格式化为年月日
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  //检查用户今天是否已经打卡 sismember是检查集合中是否存在某个元素  接受两个参数 第一个参数是集合的key 第二个参数是元素  返回1表示存在 0表示不存在
  const result = await redis.sismember(`${USER_CHECKIN_KEY}${userId}`, dateKey);
  //返回一个布尔值
  return result === 1;
}



/**
 * 用户打卡
 * @param userId 用户ID
 * @param location 地理位置信息
 */
export async function checkIn(userId: string, location: any = null) {
  const redis = getRedisClient();
  const now = new Date();

  //getTime()返回自1970年1月1日午夜（UTC）以来的毫秒数
  const today = now.getTime();
  //获取今天的日期
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  // 检查是否已经打卡
  const alreadyCheckedIn = await hasCheckedInToday(userId);
  if (alreadyCheckedIn) {
    return { success: false, message: '今天已经打卡过了' };
  }

  // 获取上次打卡时间
  const lastCheckInStr = await redis.get(`${USER_LAST_CHECKIN}${userId}`);
  //将时间戳转换为日期 parseInt()将字符串转换为整数
  const lastCheckIn = lastCheckInStr ? new Date(parseInt(lastCheckInStr)) : null;

  // 计算是否连续打卡
  let isConsecutive = false;
  if (lastCheckIn) {
    //获取今天的日期
    const yesterday = new Date(now);
    //设置昨天的日期
    yesterday.setDate(yesterday.getDate() - 1);

    // 检查上次打卡是否是昨天
    isConsecutive =
    //检查上次打卡是否是昨天  如果
      lastCheckIn.getFullYear() === yesterday.getFullYear() &&
      lastCheckIn.getMonth() === yesterday.getMonth() &&
      lastCheckIn.getDate() === yesterday.getDate();
  }

  // 开始事务
  const multi = redis.multi();

  // 记录打卡
  //sadd是向集合中添加元素  sadd(key, value) 效果是向集合中添加一个元素
  multi.sadd(`${USER_CHECKIN_KEY}${userId}`, dateKey);
  //set是设置键值对
  multi.set(`${USER_LAST_CHECKIN}${userId}`, today);
  // 更新总打卡次数
  //incr是增加键的值
  multi.incr(`${USER_TOTAL_CHECKINS}${userId}`);

  // 更新连续打卡天数
  if (isConsecutive) {
    multi.incr(`${USER_CONSECUTIVE_CHECKINS}${userId}`);
  } else {
    multi.set(`${USER_CONSECUTIVE_CHECKINS}${userId}`, 1);
  }

  // 计算积分奖励
  let pointsToAdd = 10; // 基础积分

  // 连续打卡额外奖励
  let consecutiveCheckIns = 1;
  if (isConsecutive) {
    //获取连续打卡天数 +1
    consecutiveCheckIns = await redis.get(`${USER_CONSECUTIVE_CHECKINS}${userId}`)
      .then(val => parseInt(val || '0') + 1);

    // 连续打卡奖励规则
    if (consecutiveCheckIns >= 30) {
      pointsToAdd += 50; // 连续30天以上
    } else if (consecutiveCheckIns >= 15) {
      pointsToAdd += 30; // 连续15天以上
    } else if (consecutiveCheckIns >= 7) {
      pointsToAdd += 20; // 连续7天以上
    } else if (consecutiveCheckIns >= 3) {
      pointsToAdd += 10; // 连续3天以上
    }
  }

  // 添加积分
  multi.incrby(`${USER_POINTS}${userId}`, pointsToAdd);

  // 如果有地理位置信息，保存
  if (location) {
    multi.set(
      `${USER_LOCATION}${userId}`,
      JSON.stringify(location),
      'EX',
      LOCATION_CACHE_TTL
    );
  }

  // 执行事务
  await multi.exec();

  // 同步到MongoDB (这个操作应该在后台进行，不影响用户体验)
  syncUserDataToMongoDB(userId).catch(console.error);


  //返回一个对象
  return {
    success: true,
    consecutiveCheckIns,
    pointsAdded: pointsToAdd,
    totalPoints: await redis.get(`${USER_POINTS}${userId}`).then(val => parseInt(val || '0')),
    message: `打卡成功！获得${pointsToAdd}积分，当前连续打卡${consecutiveCheckIns}天`
  };
}



/**
 * 获取用户地理位置信息
 * @param userId 用户ID
 * @param ip 用户IP地址
 */
export async function getUserLocation(userId: string, ip: string) {
  const redis = getRedisClient();

  // 先尝试从Redis获取缓存的位置信息
  const cachedLocation = await redis.get(`${USER_LOCATION}${userId}`);
  if (cachedLocation) {
    return JSON.parse(cachedLocation);
  }

  // 如果没有缓存，调用IP地理位置API
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const locationData = await response.json();

    if (locationData.status === 'success') {
      const location = {
        city: locationData.city,
        country: locationData.country,
        ip: ip,
        coordinates: {
          latitude: locationData.lat,
          longitude: locationData.lon
        }
      };

      // 缓存位置信息
      await redis.set(
        `${USER_LOCATION}${userId}`,
        JSON.stringify(location),
        'EX',
        LOCATION_CACHE_TTL
      );

      return location;
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
  }

  return null;
}

/**
 * 同步Redis中的用户数据到MongoDB
 * @param userId 用户ID
 */
async function syncUserDataToMongoDB(userId: string) {
  const redis = getRedisClient();

  try {
    // 获取Redis中的数据
    const [consecutiveCheckIns, totalCheckIns, points, lastCheckInStr, locationStr] = await Promise.all([
      redis.get(`${USER_CONSECUTIVE_CHECKINS}${userId}`).then(val => parseInt(val || '0')),
      redis.get(`${USER_TOTAL_CHECKINS}${userId}`).then(val => parseInt(val || '0')),
      redis.get(`${USER_POINTS}${userId}`).then(val => parseInt(val || '0')),
      redis.get(`${USER_LAST_CHECKIN}${userId}`),
      redis.get(`${USER_LOCATION}${userId}`)
    ]);

    const lastCheckIn = lastCheckInStr ? new Date(parseInt(lastCheckInStr)) : null;
    const location = locationStr ? JSON.parse(locationStr) : null;

    // 获取今天的日期键
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    // 创建打卡记录
    const checkInRecord = {
      date: now,
      location
    };

    // 更新MongoDB中的用户数据
    // 注意：这里需要导入用户模型，但为了避免循环依赖，我们使用mongoose直接操作
    await mongoose.model('User').findByIdAndUpdate(
      userId,
      {
        $set: {
          consecutiveCheckIns,
          totalCheckIns,
          points,
          lastCheckIn,
          lastLocation: location
        },
        $push: {
          checkInHistory: checkInRecord
        }
      }
    );

    return true;
  } catch (error) {
    console.error('Error syncing user data to MongoDB:', error);
    return false;
  }
}

/**
 * 从MongoDB初始化Redis中的用户数据
 * @param userId 用户ID
 */
export async function initUserRedisData(userId: string) {
  try {
    // 获取用户数据
    const user = await mongoose.model('User').findById(userId);
    if (!user) return false;

    const redis = getRedisClient();
    const multi = redis.multi();

    // 设置Redis数据
    multi.set(`${USER_CONSECUTIVE_CHECKINS}${userId}`, user.consecutiveCheckIns || 0);
    multi.set(`${USER_TOTAL_CHECKINS}${userId}`, user.totalCheckIns || 0);
    multi.set(`${USER_POINTS}${userId}`, user.points || 0);

    if (user.lastCheckIn) {
      multi.set(`${USER_LAST_CHECKIN}${userId}`, user.lastCheckIn.getTime());
    }

    if (user.lastLocation) {
      multi.set(
        `${USER_LOCATION}${userId}`,
        JSON.stringify(user.lastLocation),
        'EX',
        LOCATION_CACHE_TTL
      );
    }

    // 如果有打卡历史，添加到集合中
    if (user.checkInHistory && user.checkInHistory.length > 0) {
      for (const record of user.checkInHistory) {
        const date = new Date(record.date);
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        multi.sadd(`${USER_CHECKIN_KEY}${userId}`, dateKey);
      }
    }

    await multi.exec();
    return true;
  } catch (error) {
    console.error('Error initializing user Redis data:', error);
    return false;
  }
}
