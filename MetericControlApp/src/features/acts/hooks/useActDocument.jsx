import { useCallback } from 'react';
import useActStore from '@/features/acts/store/useActStore';
import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';
import ActDocumentPanel from '@/features/acts/components/actDocumentPanel';
import { createActOperations } from '@/features/acts/lib/createActOperations';

const useActDocument = (taskId, getFields) => {
    const signatureResult = useActStore((state) => state.result);
    const savedAct = useActStore(
        (state) => state.actMetadataByTask[String(taskId)]
    );
    const templates = useActTemplatesStore((state) => state.templates);
    const renderActDocument = useCallback(
        (props) => <ActDocumentPanel {...props} />,
        []
    );

    return {
        actState: { signatureResult, savedAct, templates },
        actOperations: createActOperations(getFields),
        renderActDocument,
    };
};

export default useActDocument;
