import { useParams } from "react-router";
import { CommunityDisplay } from "../components/CommunityDisplay";


export const CommunityPage = () => {

    const {id} = useParams<{id: string}>()
  return (
   <div className="pt-20 sm:pt-10">
      <CommunityDisplay communityId={Number(id)}/>
    </div>
  );
};