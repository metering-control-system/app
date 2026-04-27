import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import useParams from '@/features/tasks/store/useParams';
import useStorePictures from '@/shared/store/useStorePictures';

const clearSessionState = async (queryClient) => {
    await tokenStorage.clearTokens();
    useAuth.getState().clearSession();
    useParams.getState().setUpdateSince(null);
    queryClient.removeQueries();
    useStorePictures.getState().resetPhotos();
};

export default clearSessionState;
