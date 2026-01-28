"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { clerkClient } from "@clerk/nextjs/server";
export default function EditProfilePage() {

  //clerk的useUser hook 这里的user是clerk的用户信息
  const { isLoaded, isSignedIn, user } = useUser();

  // Debug logs
  useEffect(() => {
    if (user) {
      console.log('User data:', {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        primaryEmailAddress: user.primaryEmailAddress?.emailAddress,
        primaryPhoneNumber: user.primaryPhoneNumber?.phoneNumber
      });
    }
  }, [ user]);

  // Debug logs
  useEffect(() => {
    //console.log('Auth state:', { isLoaded, isSignedIn });
    if (user) {
      console.log('User data:', {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl
      });
    }
  }, [ user]);


  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  //存储表单数据 存储的表单数据是name和image 只有这两个字段 但是表单有多个字段
  //这里使用name和image是因为clerk的用户信息中只有这两个字段
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
    } else if (user) {
      setFormData({
        name: user.fullName || "",
        image: user.imageUrl || "",
      });
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user, router]);



  //处理表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //e.target是事件目标 事件目标是触发事件的元素
    //这里的name是表单元素的name属性 value是表单元素的value属性 同时获取事件目标的name和value属性
    const { name, value } = e.target;
    //setFormData是设置表单数据
    //prev是上一次的表单数据
    //...prev是展开上一次的表单数据
    //name是计算属性 value是表单元素的value属性
    setFormData((prev) => ({
      //这里的...prev是展开上一次的表单数据 所以了存储多个字段
      ...prev,
      // [name ]的意义是动态设置属性名
      // 例如name是name 那么[name]就是name
      // 所以[name]: value 就是 name: value
      // 这里是动态设置属性名
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update Clerk user data
      if (user) {
         const clerkClientInstance = await clerkClient();
         // 使用正确的 Clerk API 属性名称
         await clerkClientInstance.users.updateUser(user.id, {
             firstName: formData.name,
          // 根据 IDE 提示，正确的属性可能是 profileImageID
          // 但我们这里只更新名字，先不更新图像
          // 图像更新需要先上传到 Clerk的文件存储 然后获取图像ID 使用profileImageID属性更新用户图像
          // profileImageID是Clerk的文件ID
        });
      }

      // Refresh the user session
      await user?.reload();



      setSuccess("Profile updated successfully!");

      // Redirect back to profile page after a short delay
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>


          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/your-image.jpg"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter a URL to your profile image. Leave empty to use your default avatar.
            </p>
          </div>



          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </label>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200">
              <Image
                src={formData.image || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=random&size=128`}
                alt="Profile Preview"
                //fill的意义是让图片填满整个div
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
          </div>


          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              //这个disabled属性是禁用按钮 表示当saving为true时禁用按钮
              disabled={saving}
            >
              Cancel
            </button>
            {/* 这个按钮的意义是保存修改 如何保存？
            1. 首先需要获取表单数据
            2. 然后需要将表单数据发送到服务器
            3. 最后需要更新用户信息
            */}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
