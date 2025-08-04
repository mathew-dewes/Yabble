import { ChangeEvent, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { supabase } from "../supabase-client";
import { useAuth } from "../context/authContext";
import { Community, fetchCommunites } from "./CommunityList";
import { useNavigate } from "react-router";

export default function CreatePost() {
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("");
  const [communtiyId, setCommunityId] = useState<number | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
      const navigate = useNavigate();

  interface PostInput {
    title: string
    content: string
    avatar_url: string | null
    community_id?: number | null
  }

  const { user } = useAuth();

  const { data: communities } = 
  useQuery<Community[], Error>(
    { queryKey: ["communities"], queryFn: fetchCommunites })


  const createPost = async (post: PostInput, imageFile: File) => {

    const filePath = `${Date.now()}-${imageFile.name}`

    const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, imageFile)
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicURLData } = supabase.storage.from("post-images").getPublicUrl(filePath)

    const { data, error } = await supabase.from("posts").insert({ ...post, image_url: publicURLData.publicUrl });
    if (error) throw new Error(error.message);
    return data;
  }


  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: { post: PostInput, imageFile: File }) => {
      return createPost(data.post, data.imageFile)
    }, onSuccess: ()=>{
        navigate('/')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) return;
    mutate({ post: { 
      title, 
      content, 
      avatar_url: user?.user_metadata.avatar_url || null,
      community_id: communtiyId
    }, imageFile: selectedFile })
  }

   const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null)
  }


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }


  if (!user) return <h1 className="text-center">You must be logged in to create new posts</h1>
  
  return (
     <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="title" className="block mb-2 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-white/40 bg-transparent p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block mb-2 font-medium">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-white/40 bg-transparent p-2 rounded"
          rows={5}
          required
        />
      </div>

      <div className="flex flex-col gap-2 w-60">
        <label> Select Community</label>
        <select className="border p-1 rounded border-white/40 cursor-pointer" id="community" onChange={handleCommunityChange}>
          <option className="text-black"  value={""}>Choose a Community</option>
          {communities?.map((community, key) => (
            <option className="text-black" key={key} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block mb-2 font-medium">
          Upload Image (Click input below)
        </label>
        <input
        placeholder="Hello"
        required
          type="file"
          id="image"
          accept="image/*"
          onChange={handleFileChange}
          className="w-60 p-3 text-gray-200 border border-white/40 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>

      {isError && <p className="text-red-500"> Error creating post.</p>}
    </form>
  )
}