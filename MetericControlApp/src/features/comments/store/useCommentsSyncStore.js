import { create } from 'zustand/react';

const useCommentsSyncStore = create((set, get) => ({
    lastSyncAt: {},
    setLastSyncAt: (serverDate, id) =>
        set({ lastSyncAt: { ...get().lastSyncAt, [id]: serverDate } }),
}));

export default useCommentsSyncStore;
