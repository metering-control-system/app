import { create } from 'zustand/react';

const useCommentsSyncStore = create((set, get) => ({
    lastSyncAt: {},
    setLastSyncAt: (serverDate, id) =>
        set({ lastSyncAt: { ...get().lastSyncAt, [id]: serverDate } }),
    resetSync: () => set({ lastSyncAt: {} }),
}));

export default useCommentsSyncStore;
