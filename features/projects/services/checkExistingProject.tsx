import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getSession } from "@/lib/helpers";
import { Query } from "node-appwrite";

const checkExistingProject = async (contentHash: string, userId: string) => {
    const {session} = await getSession();
    if (!session) throw new Error('Unauthorized');
    const {DatabaseId, projectsCollectionId} = appwriteConfig;
    const { databases } = await createSessionClient(session);

    const projects = await databases.listDocuments(DatabaseId, projectsCollectionId, [
        Query.equal('contentHash', contentHash),
        Query.equal('userId', userId),
    ]);
    return projects.documents.length > 0 ? projects.documents[0] : null;
};

export default checkExistingProject;