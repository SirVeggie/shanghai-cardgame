import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DropType = 'hand-card' | 'meld-card' | 'discard-card' | 'deck-card';
export type DropInfo = {
    type: DropType;
    data?: any;
}

export type Drop = {
    id: string;
    name: string;
    func: (info: DropInfo) => void;
    getArea: () => DOMRect;
};

export const dropSlice = createSlice({
    name: 'drops',
    initialState: [] as Drop[],
    reducers: {
        setDrops: (state, action: PayloadAction<Drop[]>) => {
            return action.payload;
        },

        addDrop: (state, action: PayloadAction<Drop>) => {
            state.push(action.payload);
        },

        removeDrop: (state, action: PayloadAction<string>) => {
            return state.filter(x => x.id === action.payload);
        }
    }
});

export const dropReducer = dropSlice.reducer;
export const dropActions = dropSlice.actions;