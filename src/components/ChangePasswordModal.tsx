"use client";

import { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';


//这里传递的是一个对象props
interface ChangePasswordModalProps {
  isOpen: boolean;
  //这里是一个函数类型 onClose: () => void; 不返回任何值 实际情况是函数可能返回任何值但是调用者不关心返回值
  onClose: () => void;
}

//这里接收一个对象props 传进来的这个onclose是父组件传进来的具体作用是关闭modal 因为已经定义好了
export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {

  //以下几个usestat是定义modal打开状态 存储在这个字段用于表单校验环节


  //这里设置旧密码验证的目的是安全性确保本人操作 以防用户离开电脑未锁屏被他人操作
  // 防止csrf攻击 防止恶意网站利用已经登录状态进行密码修改
  // 避免了会话被劫持后用户可以随意修改密码  即使当前会话被劫持也只有使用当前密码才能修改密码增强安全性
  const [currentPassword, setCurrentPassword] = useState('');
  //定义新密码状态
  const [newPassword, setNewPassword] = useState('');
  //定义确认密码状态
  const [confirmPassword, setConfirmPassword] = useState('');
  //定义当前密码显示状态
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  //定义新密码显示状态
  const [showNewPassword, setShowNewPassword] = useState(false);
  //定义确认密码显示状态
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //定义loading状态
  const [loading, setLoading] = useState(false);
  //定义错误状态
  const [error, setError] = useState('');
  //定义成功状态
  const [success, setSuccess] = useState('');

  // 验证表单 这个validateform函数返回一个布尔值 这里的if语句是同时判断的吗?
  // 是的
  const validateForm = () => {
    if (!currentPassword) {
      setError('请输入当前密码');
      return false;
    }
    if (!newPassword) {
      setError('请输入新密码');
      return false;
    }
    if (newPassword.length < 8) {
      setError('新密码长度至少为8位');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return false;
    }
    return true;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //这里发送的是json格式的数据f 将{currentPassword,newPassword}js对象转换成json字符串
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || '密码修改成功');
        // 清空表单
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // 3秒后关闭弹窗
        setTimeout(() => {
          //设置弹窗关闭
          onClose();
          //设置成功提示为空
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || '密码修改失败');
      }
    } catch (error) {
      setError('请求失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    //fixed的目的是将模态框固定在页面上不随滚动条滚动 inset-0表示将模态框固定在中间
    //bg-black bg-opacity-100表示模态框的背景色为黑色不透明度为100%  这样设置的好处是模态框会覆盖不相关的页面阻挡用户对页面其他部分的交互
    <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50">
      {/* //max-w-md是最大宽度 */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* //absolute top-4 right-4表示将按钮固定在右上角 */}
        <button  type='button'
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FaLock className="text-blue-800 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">修改密码</h2>
          <p className="text-gray-600 mt-1">请输入您的当前密码和新密码</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="currentPassword">
              当前密码
            </label>
            <div className="relative">
              <input
                id='currentPassword'
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入当前密码"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <FaEyeSlash className="text-gray-400" />
                ) : (
                  <FaEye className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="newPassword">
              新密码
            </label>
            <div className="relative">
              <input
                id='newPassword'
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入新密码"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <FaEyeSlash className="text-gray-400" />
                ) : (
                  <FaEye className="text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">密码长度至少为8位</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
              确认新密码
            </label>
            <div className="relative">
              <input
                id='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="再次输入新密码"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-gray-400" />
                ) : (
                  <FaEye className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            //这个属性是禁用状态 false表示不禁用 true表示禁用
            disabled={loading}
            //这个属性是按钮的样式 w-full表示宽度占满 占满的是父元素的宽度 父元素是form
            className="w-full bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                {/*这个图标是旋转的加载动画*/}
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
            ) : (
              "确认修改"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
