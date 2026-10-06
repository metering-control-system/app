import { create } from 'zustand/react';

const useReportsSyncStore = create((set) => ({
    lastSyncAt: null,
    lastFullSyncAt: null,
    generation: 0,
    listSnapshotAt: null,
    setLastSyncAt: (serverDate) => set({ lastSyncAt: serverDate }),
    setListSnapshotAt: (serverDate) => set({ listSnapshotAt: serverDate }),
    recordSync: (serverDate, full) => {
        if (!Number.isFinite(Date.parse(serverDate))) return;
        set((state) => ({
            lastSyncAt:
                Date.parse(serverDate) < Date.parse(state.lastSyncAt)
                    ? state.lastSyncAt
                    : serverDate,
            ...(full ? { lastFullSyncAt: Date.now() } : {}),
        }));
    },
    resetSync: () =>
        set((state) => ({
            lastSyncAt: null,
            lastFullSyncAt: null,
            listSnapshotAt: null,
            generation: state.generation + 1,
        })),
}));

export default useReportsSyncStore;
