import { useMutation, useMutationState } from '@tanstack/react-query';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';
import { getActTemplatesApi } from '@/features/acts/api/getActTemplatesApi';
import { useCallback, useEffect } from 'react';

const mutationKey = ['actTemplates'];

const useActTemplates = ({
    defaultActTemplate,
    setDefaultActTemplate,
    enabled = true,
}) => {
    const templates = useActTemplatesStore((state) => state.templates);

    useEffect(() => {
        if (defaultActTemplate == null && templates.length) {
            setDefaultActTemplate(templates.at(-1).id);
        }
    }, [defaultActTemplate, templates, setDefaultActTemplate]);

    const setTemplates = useActTemplatesStore((state) => state.setTemplates);
    const setSyncTime = useActTemplatesStore((state) => state.setSyncTime);
    const { isChecked, isOnline } = useNetwork();

    const { mutate } = useMutation({
        mutationKey,
        mutationFn: async () => {
            const lastSyncAt = useActTemplatesStore.getState().lastSyncAt;
            return await getActTemplatesApi(lastSyncAt);
        },
        onSuccess: (data) => {
            if (!data.results) {
                return;
            }

            setTemplates(data.results);

            const serverDate = data?.snapshot_at;
            if (serverDate) {
                setSyncTime(serverDate);
            }
        },
    });

    const requestedTemplatesError = useMutationState({
        filters: { mutationKey },
        select: (mutation) => mutation.state.error,
    });

    const requestActTemplates = useCallback(() => {
        if (enabled && isChecked && isOnline) {
            mutate();
        }
    }, [enabled, isChecked, isOnline, mutate]);

    return {
        requestActTemplates,
        requestedTemplatesError: requestedTemplatesError.at(-1) ?? null,
    };
};

export default useActTemplates;
