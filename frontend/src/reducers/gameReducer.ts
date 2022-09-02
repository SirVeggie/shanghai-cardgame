import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionPublic } from 'shared';


export const gameSlice = createSlice({
    name: 'games',
    initialState: [] as SessionPublic[],
    reducers: {
        setGames: (state, action: PayloadAction<SessionPublic[]>) => {
            state.splice(0, state.length);
            action.payload.forEach(game => state.push(game));
        },
        
        addGame: (state, action: PayloadAction<SessionPublic>) => {
            state.push(action.payload);
        },
        
        removeGame: (state, action: PayloadAction<string>) => {
            const index = state.findIndex(x => x.id === action.payload);
            if (index !== -1)
                state.splice(index, 1);
        },
    }
});

export const gameReducer = gameSlice.reducer;
export const gameActions = gameSlice.actions;