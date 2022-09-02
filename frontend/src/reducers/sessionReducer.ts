import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionPublic } from 'shared';

type InitialSession = typeof initialState;
const initialState = {
    game: undefined as SessionPublic | undefined,
    socket: undefined as WebSocket | undefined
};

export const sesssionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<InitialSession>) => {
            return action.payload;
        },

        clearSession: () => {
            return {
                game: undefined,
                socket: undefined
            };
        },
    }
});

export const sessionReducer = sesssionSlice.reducer;
export const sessionActions = sesssionSlice.actions;