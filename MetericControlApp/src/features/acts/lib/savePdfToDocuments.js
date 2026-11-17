import useAuth from '@/features/auth/store/useAuth';
import { File, Directory, Paths } from 'expo-file-system';

const getActsFolder = () => {
    const { login } = useAuth.getState();
    if (login === null) {
        throw new Error('No account selected');
    }
    const actsFolder = new Directory(
        Paths.document,
        'meteric-control-app-acts',
        `account-${encodeURIComponent(login)}`
    );
    if (!actsFolder.exists) {
        actsFolder.create({ intermediates: true });
    }
    return actsFolder;
};

export const deleteAct = (uri) => {
    if (!uri) {
        return;
    }
    const file = new File(uri);
    if (file.exists) {
        file.delete();
    }
};

export const savePdfToDocuments = async ({ fileName, sourceUri }) => {
    const actsFolder = getActsFolder();
    const target = new File(actsFolder, `${fileName}.pdf`);
    deleteAct(target.uri);
    new File(sourceUri).copy(target);
    return target.uri;
};
