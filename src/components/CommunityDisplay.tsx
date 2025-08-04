import { useQuery } from "@tanstack/react-query"
import { Post } from "./PostList"
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";

interface Props{
    communityId: number

}

interface PostWithCommunity extends Post {
communities:{
    name: string
}

}


// eslint-disable-next-line react-refresh/only-export-components
export const fetchCommunityPost = async(communityId: number): Promise<PostWithCommunity[] > =>{
const {data, error} = await supabase.from("posts").select("*, communities(name)")
.eq("community_id", communityId)
.order("created_at", {ascending: false});
if (error) throw new Error(error.message);
console.log(data);

return data as PostWithCommunity[]
}

// eslint-disable-next-line react-refresh/only-export-components
export const getCommunityName = async (
  communityId: number
): Promise<string> => {
  const { data, error } = await supabase
    .from("communities")
    .select("name")
    .eq("id", communityId)
    .single();

  if (error) throw new Error(error.message);
  return data.name;
};




export const CommunityDisplay = ({communityId}: Props) =>{
       const {
    data: posts,
    error: postError,
    isLoading: postsLoading,
  } = useQuery<PostWithCommunity[], Error>({
    queryKey: ["communityPost", communityId],
    queryFn: () => fetchCommunityPost(communityId),
  });

    const {
    data: communityName,
    error: nameError,
    isLoading: nameLoading,
  } = useQuery<string, Error>({
    queryKey: ["communityName", communityId],
    queryFn: () => getCommunityName(communityId),
  });
            
    
  if (postsLoading || nameLoading) {
    return <div>Loading community...</div>;
  }

       if (postError || nameError){
        return <div>Error: {postError?.message || nameError?.message}</div>
    }

    
    return (
         <div>
          {posts && posts.length > 0 ? <h2 className="leading-[1.4] text-4xl sm:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        @{posts && posts[0].communities.name}
      </h2> : <h2 className="leading-[1.4] text-4xl sm:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
         @{communityName}
      </h2>}
      

      {posts && posts.length > 0 ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">
          There are no posts in this community yet.
        </p>
      )}
    </div>
    )
}