import { File, Directory, Paths } from 'expo-file-system';

const getActsFolder = () => {
    const actsFolder = new Directory(
        Paths.document,
        'meteric-control-app-acts'
    );
    if (!actsFolder.exists) {
        return actsFolder.create({ intermediates: true });
    }
    return actsFolder;
};

export const deleteAct = (uri) => {
    const file = new File(uri);
    if (file.exists) {
        file.delete();
    }
};

export const savePdfToDocuments = async ({ fileName, sourceUri }) => {
    const actsFolder = getActsFolder();
    const target = new File(actsFolder, `${fileName}.pdf`);
    await new File(sourceUri).copy(target, { overwrite: true });
    return target.uri;
};
