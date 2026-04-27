import { create } from 'zustand/react';

const useTasksSyncStore = create((set) => ({
    lastSyncAt: null,
    listSnapshotAt: null,
    setLastSyncAt: (serverDate) => set({ lastSyncAt: serverDate }),
    setListSnapshotAt: (serverDate) => set({ listSnapshotAt: serverDate }),
}));

export default useTasksSyncStore;
