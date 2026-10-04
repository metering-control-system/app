import { useMutation, useMutationState } from '@tanstack/react-query';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useActTemplatesStore from '@/features/reports/store/useActTemplatesStore';
import { getActTemplatesApi } from '@/features/reports/api/getActTemplatesApi';
import { useCallback, useState } from 'react';

const mutationKey = ['actTemplates'];

const useActTemplates = () => {
    const setTemplates = useActTemplatesStore((state) => state.setTemplates);
    const setSyncTime = useActTemplatesStore((state) => state.setSyncTime);
    const [isUpToDated, setIsUpToDated] = useState(false);
    const { isChecked, isOnline } = useNetwork();

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const lastSyncAt = useActTemplatesStore.getState().lastSyncAt;
            return await getActTemplatesApi(lastSyncAt);
        },
        onSuccess: (data) => {
            if (!data.results) {
                setIsUpToDated(true);
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
        filters: { mutationKey, status: 'error' },
        select: (mutation) => mutation.state.error,
    });

    const requestActTemplates = useCallback(() => {
        if (isChecked && isOnline) {
            mutate();
        }
    }, [isChecked, isOnline, mutate]);

    return {
        requestActTemplates,
        requestedTemplatesError,
        isUpToDated,
        isPending,
    };
};

export default useActTemplates;
