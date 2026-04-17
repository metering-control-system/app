import { create } from 'zustand/react';

const useParams = create((set) => ({
    updateSince: null,
    setUpdateSince: (serverDate) => set({ updateSince: serverDate }),
}));

export default useParams;
