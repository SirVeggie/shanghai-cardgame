import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionPublic } from 'shared';

export const sesssionSlice = createSlice({
    name: 'session',
    initialState: null as SessionPublic | null,
    reducers: {
        setSession: (state, action: PayloadAction<SessionPublic | null>) => {
            return action.payload;
        },

        clearSession: () => {
            return null;
        },
    }
});

export const sessionReducer = sesssionSlice.reducer;
export const sessionActions = sesssionSlice.actions;