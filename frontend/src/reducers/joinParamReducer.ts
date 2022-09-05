import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameJoinParams } from 'shared';


export const joinParamSlice = createSlice({
    name: 'params',
    initialState: null as GameJoinParams | null,
    reducers: {
        setParams: (state, action: PayloadAction<GameJoinParams>) => {
            return action.payload;
        },
        
        clearParams: () => {
            return null;
        },
    }
});

export const joinParamReducer = joinParamSlice.reducer;
export const joinParamActions = joinParamSlice.actions;