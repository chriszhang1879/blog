import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * 自定义 Hook，用于在用户登录后加载数据库中的用户数据
 * 并将其合并到 Clerk 的用户元数据中
 */
export function useUserData() {
 //这里的isloaded和isSignedIn是clerk的hook 表示用户是否加载完成和是否登录 这个useauth是客户端方法
  const { isLoaded, isSignedIn } = useAuth();
  //useuser解析出来的是一个clerk的user对象
  const { user } = useUser();
  //user是clerk的user对象
  useEffect(() => {
    // 确保用户已加载且已登录
    if (!isLoaded || !isSignedIn || !user) {
      //如果用户未加载 那么就返回 返回的是undefined 然后执行什么代码？
      //执行return之后就不会执行下面的代码了
      return;
    }
    // 检查是否已经有元数据，避免不必要的API调用 这个元数据在哪里定义的？
    // 这个元数据是clerk的publicmetadata原生的字段 允许我们自定义外来数据库的数据  这里判断是否有外源数据
    // 如果存在外援数据那么hasmetadata就为true 使用.keys()方法获取元数据的键值
  
    const hasMetadata = user.publicMetadata && Object.keys(user.publicMetadata).length > 0;
    //这个metadata可以存储任何序列化的json数据 一般存储自定义的信息
    // 如果没有元数据，则从API获取 第一次使用或者缓存失效去获取用户的附加信息比如积分 用户角色 签到天数等
    if (!hasMetadata) {
      //这里只是定义一个loadUserMetadata函数但是不会执行 所以后面需要继续显示调用
      const loadUserMetadata = async () => {
        try {
          const response = await fetch('/api/user-metadata');
          if (!response.ok) {
            throw new Error('Failed to load user metadata');
          }
          // 元数据已更新，重新加载用户数据以获取更新后的元数据 这些元数据包括isloaded issignedin user等信息再暴露出去返回以后使用
          await user.reload();
          console.log('User metadata loaded successfully');
        } catch (error) {
          console.error('Error loading user metadata:', error);
        }
      };
      //调用loadUserMetadata函数    这里必须显示的调用才会生效  但是也可以直接写void（async()=>{}）()指定一次性写好函数马上执行更加简单
      loadUserMetadata();
    }
    //当isloaded issignedin user发生变化时重新执行 什么时候变化？
    //当用户登录时isloaded issignedin user都会变化
    //当用户退出登录时isloaded issignedin user都会变化
    //当用户刷新页面时isloaded issignedin user都会变化
    //当用户关闭浏览器时isloaded issignedin user都会变化
    //当用户重新打开浏览器时isloaded issignedin user都会变化
  }, [isLoaded, isSignedIn, user]);


  // 返回用户的公共元数据 存储在clerk的publicmetadata中 位于clerk 的服务器中
  return {
    //这个userdata是metadata中的自定义字段 用于返回存储自己数据库中的业务信息
    //clerk的publicmetadata是clerk的字段 用于存储clerk的用户信息
    userData: user?.publicMetadata,
    isLoaded,
    isSignedIn,
    //这个返回的user是clerk的user对象 包含了clerk的用户信息
    user
  };
}
