"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";

const WriteForm = () => {

  //todo 使用react-query进行重构 

  // Custom CSS for editor placeholder and formatting
  const editorStyles = `
    .editor-content:empty:before {
      content: 'Write your story here...';
      color: #9ca3af;
      position: absolute;
      pointer-events: none;
    }
    
    .editor-content blockquote {
      border-left: 3px solid #d1d5db;
      margin-left: 0;
      margin-right: 0;
      padding-left: 1rem;
      color: #4b5563;
      font-style: italic;
    }
    
    .editor-content ul {
      list-style-type: disc;
      padding-left: 1.5rem;
    }
    
    .editor-content ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
    }
  `;

//这个状态用于存储标题
  const [title, setTitle] = useState("My Awesome Story");

//这个状态用于存储分类
  const [category, setCategory] = useState("General");

//这个状态用于存储描述
  const [description, setDescription] = useState("");

//这个状态用于存储格式化后的内容
  const [formattedContent, setFormattedContent] = useState("");

//这个useref是用于获取dom元素的引用 操作dom元素
 const imageInputRef = useRef<HTMLInputElement>(null);
 //这个useref是用于获取dom元素的引用 操作dom元素
 const videoInputRef = useRef<HTMLInputElement>(null);
  //这个useref是用于获取dom元素的引用 操作dom元素
const editorRef = useRef<HTMLDivElement>(null);
  
  //这个状态用于存储封面图片
const [coverImage, setCoverImage] = useState<string | null>(null);

// 我们直接将媒体内容插入到编辑器中，不需要单独存储

  // 这些状态用于跟踪上传进度和状态
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video' | null>(null);

  //这个状态用于存储是否正在提交
const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 这个状态用于存储当前文本格式
const [currentFormat, setCurrentFormat] = useState("Normal");

const categories = [
    "General",
    "Technology",
    "Travel",
    "Food",
    "Lifestyle",
    "Health",
    "Business",
    "Entertainment",
    "Sports",
    "Science"
  ];

  // 使用useMutation处理图片上传
  const uploadImageMutation = useMutation({
    //这个mutationFn是用于处理图片上传的 传入的file是File类型
    mutationFn: async (file: File) => {
      return new Promise<string>((resolve, reject) => {
        // 设置上传状态
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);
        setUploadType('image');
        
        const reader = new FileReader();
        //读取文件 将文件转换成base64编码的字符串
        reader.readAsDataURL(file);
        
        // 模拟上传进度
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 90) {
            setUploadProgress(progress);
          } else {
            clearInterval(progressInterval);
          }
        }, 200);
        
        //读取文件完成进行处理数据
        reader.onloadend = (e) => {
          //这里获取的result是base64编码的字符串
          const result = e.target?.result;
          if (result) {
            // 模拟完成上传
            setTimeout(() => {
              clearInterval(progressInterval);
              setUploadProgress(100);
              //成功读取文件后返回base64编码的字符串
              resolve(result as string);
            }, 500);
          } else {
            clearInterval(progressInterval);
            setIsUploading(false);
            //失败读取文件后返回错误信息
            reject(new Error('Failed to read file'));
          }
        };
        //读取文件失败进行处理
        reader.onerror = () => {
          clearInterval(progressInterval);
          setIsUploading(false);
          reject(new Error('Error reading file'));
        };
      });
    },
    //上传成功后的处理 这里的data是base64编码的字符串
    onSuccess: (data) => {
      //成功上传后将数据设置到coverImage状态变量中
      setCoverImage(data);
      setUploadSuccess(true);
      // 清除成功状态显示
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(false);
      }, 2000);
    },
    //上传失败后的处理
    onError: (error) => {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  });

  // 使用useMutation处理视频上传
  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      return new Promise<string>((resolve, reject) => {
        // 设置上传状态
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);
        setUploadType('video');
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        // 模拟上传进度
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5; // 视频上传速度更慢
          if (progress <= 90) {
            setUploadProgress(progress);
          } else {
            clearInterval(progressInterval);
          }
        }, 200);
        
        reader.onloadend = (e) => {
          const result = e.target?.result;
          if (result) {
            // 模拟完成上传
            setTimeout(() => {
              clearInterval(progressInterval);
              setUploadProgress(100);
              resolve(result as string);
            }, 800);
          } else {
            clearInterval(progressInterval);
            setIsUploading(false);
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => {
          clearInterval(progressInterval);
          setIsUploading(false);
          reject(new Error('Error reading file'));
        };
      });
    },
    onSuccess: (data) => {
      // 将视频插入到编辑器
      insertMediaToEditor(data, 'video');
      setUploadSuccess(true);
      // 清除成功状态显示
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(false);
      }, 2000);
    },
    onError: (error) => {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
      setIsUploading(false);
    }
  });


  // 插入媒体到编辑器
  const insertMediaToEditor = (src: string, type: 'image' | 'video') => {
    if (!editorRef.current) return;
    
    // 获取当前选中的位置
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (range) {
      // 创建媒体元素
      let mediaElement: HTMLElement;
      
      if (type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.setAttribute('src', src);
        mediaElement.setAttribute('alt', 'Uploaded image');
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.height = 'auto';
        mediaElement.style.margin = '10px 0';
      } else {
        mediaElement = document.createElement('video');
        mediaElement.setAttribute('src', src);
        mediaElement.setAttribute('controls', 'true');
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.height = 'auto';
        mediaElement.style.margin = '10px 0';
        
        // 将视频插入到编辑器底部
        if (editorRef.current) {
          // 创建新的段落元素
          const paragraph = document.createElement('p');
          paragraph.appendChild(mediaElement);
          
          // 将段落添加到编辑器底部
          editorRef.current.appendChild(paragraph);
          
          // 更新编辑器内容
          const html = editorRef.current.innerHTML;
          setFormattedContent(html);
          
          // 滚动到底部
          editorRef.current.scrollTop = editorRef.current.scrollHeight;
          return;
        }
      }
    
      // 插入图片元素到当前光标位置
      range.deleteContents();
      range.insertNode(mediaElement);
      
      // 将光标移动到媒体元素之后
      range.setStartAfter(mediaElement);
      range.setEndAfter(mediaElement);
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // 更新编辑器内容
      const html = editorRef.current.innerHTML;
      setFormattedContent(html);
    } else if (editorRef.current) {
      // 如果没有选中范围，则在编辑器的当前位置添加
      let mediaElement: HTMLElement;
      
      if (type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.setAttribute('src', src);
        mediaElement.setAttribute('alt', 'Uploaded image');
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.height = 'auto';
        mediaElement.style.margin = '10px 0';
      } else {
        mediaElement = document.createElement('video');
        mediaElement.setAttribute('src', src);
        mediaElement.setAttribute('controls', 'true');
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.height = 'auto';
        mediaElement.style.margin = '10px 0';
      }
      
      // 将媒体元素添加到编辑器的当前位置
      if (type === 'video') {
        // 视频添加到底部
        editorRef.current.appendChild(mediaElement);
        // 滚动到底部
        editorRef.current.scrollTop = editorRef.current.scrollHeight;
      } else {
        // 图片添加到当前位置
        editorRef.current.appendChild(mediaElement);
      }
      
      // 更新编辑器内容
      const html = editorRef.current.innerHTML;
      setFormattedContent(html);
    }
  };

  //这个方法是用于处理图片上传的
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //这里返回的files是一个特殊的FileList对象而不是数组 所以后面遍历的时候需要先转换成array.from数组形式再遍历
    const files = e.target.files;
    //这里判断files是否存在以及长度是否大于0
    if (!files || files.length === 0) {
      return;
    }
    
    // 使用useMutation上传第一张图片作为封面
    uploadImageMutation.mutate(files[0]);
  };

  // 处理编辑器中的图片上传
  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    // 使用useMutation上传图片并插入到编辑器
    uploadImageMutation.mutate(files[0]);
  };

  // 处理编辑器中的视频上传
  const handleEditorVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    // 使用useMutation上传视频并插入到编辑器
    uploadVideoMutation.mutate(files[0]);
  };

  //触发文件上传
  const triggerImageUpload = () => {
    //触发文件上传 这里的imageInputRef是文件上传的引用指向一个input元素 .current是访问这个引用当前指向的dom元素 然后调用click方法触发文件上传
    imageInputRef.current?.click();
  };

  // 触发编辑器图片上传
  const triggerEditorImageUpload = () => {
    imageInputRef.current?.click();
  };

  // 触发编辑器视频上传
  const triggerEditorVideoUpload = () => {
    videoInputRef.current?.click();
  };

  
//处理文本格式化
const handleFormatText = (format: string) => {
    //检查编辑器是否存在
    if (!editorRef.current) return;
    //设置样式
    document.execCommand('styleWithCSS', false, 'true');
    //根据不同的格式执行不同的命令
    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'quote':
        document.execCommand('formatBlock', false, '<blockquote>');
        break;
      case 'ul':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'ol':
        document.execCommand('insertOrderedList', false);
        break;
      case 'paragraph':
        document.execCommand('formatBlock', false, '<p>');
        break;
    }
    //将焦点返回到编辑器
    editorRef.current?.focus();
  };
  
  //处理格式选择变化
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    setCurrentFormat(format);
    
    if (!editorRef.current) return;
    
    document.execCommand('styleWithCSS', false, 'true');
    
    switch (format) {
      case 'Normal':
        document.execCommand('formatBlock', false, '<p>');
        break;
      case 'Heading 1':
        document.execCommand('formatBlock', false, '<h1>');
        break;
      case 'Heading 2':
        document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'Heading 3':
        document.execCommand('formatBlock', false, '<h3>');
        break;
    }
    
    // Focus back on the editor
    editorRef.current.focus();
  };

  // 使用useMutation处理表单提交
  const submitPostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      category: string;
      description: string;
      formattedContent: string; // 改名为formattedContent，与状态变量保持一致
      coverImage: string | null;
      // 移除createdAt，将在服务器端生成
    }) => {
      // 模拟API调用 - 在实际应用中，这里应该是真实的API调用
      // 例如：
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...postData,
      //     createdAt: new Date().toISOString() // 在API调用时添加createdAt
      //   }),
      // });
      // if (!response.ok) throw new Error('Failed to create post');
      // return await response.json();
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 模拟成功响应
      console.log("Post submitted:", {
        ...postData,
        createdAt: new Date().toISOString() // 记录日志时添加createdAt
      });
      return { success: true, id: 'post-' + Date.now() };
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      // 成功后的处理
      alert("Post created successfully!");
      
      // 可以在这里添加重定向逻辑
      // router.push('/');
      
      // 重置表单 - 所有状态变量都重置
      setTitle("");
      setCategory("General");
      setDescription("");
      setFormattedContent("");
      setCoverImage(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  //处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !editorRef.current?.innerHTML.trim()) {
      alert("Please fill in the title and content fields");
      return;
    }
    
    const editorContent = formattedContent || "";

    // 使用useMutation提交表单
    submitPostMutation.mutate({
      title,
      category,
      description,
      formattedContent: editorContent, // 修改为formattedContent以匹配mutationFn中的参数类型
      coverImage,
      // 移除createdAt，现在在mutationFn内部处理
    });
  };





  return (
    <div className="max-w-4xl mx-auto bg-white/80 rounded-lg shadow-sm">
      {/* Inject custom CSS */}
      <style>{editorStyles}</style>
 
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Create a New Post</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Cover Image Upload */}
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerImageUpload}
              className="bg-white text-gray-600 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition"
            >
              Add a cover image
            </button>
            
            {coverImage && (
              <div className="mt-4 relative h-48 w-full">
                <Image
                  src={coverImage}
                  alt="Cover preview"
                  fill
                  className="object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          {/* Title */}
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-medium border-none outline-none bg-transparent"
              placeholder="Title"
            />
          </div>
          
          {/* Category Selection */}
          <div className="mb-6 flex items-center">
            <span className="mr-2 text-gray-600">Choose a Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-md"
              placeholder="A Short Description"
            />
          </div>
          
          {/* Text Editor Toolbar */}
          <div className="flex items-center space-x-2 mb-2 border-b pb-2">
            <select
              value={currentFormat}
              onChange={handleFormatChange}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            >
              <option value="Normal">Normal</option>
              <option value="Heading 1">Heading 1</option>
              <option value="Heading 2">Heading 2</option>
              <option value="Heading 3">Heading 3</option>
            </select>
            
            <button
              type="button"
              onClick={() => handleFormatText('bold')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            
            <button
              type="button"
              onClick={() => handleFormatText('italic')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Italic"
            >
              <em>I</em>
            </button>
            
            <button
              type="button"
              onClick={() => handleFormatText('underline')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Underline"
            >
              <span className="underline">U</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleFormatText('strikethrough')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Strikethrough"
            >
              <span className="line-through">S</span>
            </button>
            
            <button 
              type="button" 
              onClick={() => handleFormatText('quote')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Quote"
            >
              <span>« »</span>
            </button>
            
            <button 
              type="button" 
              onClick={() => handleFormatText('ul')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Bullet List"
            >
              <span>•</span>
            </button>
            
            <button 
              type="button" 
              onClick={() => handleFormatText('ol')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Numbered List"
            >
              <span>1.</span>
            </button>
            
            <button 
              type="button" 
              onClick={() => handleFormatText('paragraph')}
              className="px-2 py-1 rounded hover:bg-gray-100"
              title="Paragraph"
            >
              <span>¶</span>
            </button>
          </div>
          
          {/* 编辑器媒体上传输入 */}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleEditorImageUpload}
            className="hidden"
          />
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={handleEditorVideoUpload}
            className="hidden"
          />
          
          {/* 内容编辑器 */}
          <div className="mb-6 relative">
            <div
              ref={editorRef}
              contentEditable
              className="w-full p-3 min-h-[300px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 overflow-auto editor-content"
              onInput={(e) => {
                const html = (e.target as HTMLDivElement).innerHTML;
                setFormattedContent(html);
              }}
              style={{
                minHeight: '300px',
                position: 'relative'
              }}
            />
            
            {/* 媒体上传按钮 - 移动到编辑器内部 */}
            <div className="absolute right-3 bottom-3 flex space-x-2 bg-white bg-opacity-80 p-1 rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => triggerEditorImageUpload()}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition flex items-center"
                title="Upload Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                </svg>
                <span className="ml-1 text-xs">图片</span>
              </button>
              <button
                type="button"
                onClick={() => triggerEditorVideoUpload()}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition flex items-center"
                title="Upload Video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
                </svg>
                <span className="ml-1 text-xs">视频</span>
              </button>
            </div>
          </div>
          
          {/* 上传进度条 */}
          {isUploading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>
                  {uploadType === 'image' ? 'Uploading image' : 'Uploading video'}... {uploadProgress}%
                </span>
                {uploadSuccess && (
                  <span className="text-green-600 font-medium">
                    Upload successful!
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* 提交按钮 */}
          <div className="flex justify-start">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition disabled:bg-blue-400"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteForm;
