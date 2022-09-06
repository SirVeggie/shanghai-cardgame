import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type IconTheme = 'classic' | 'chess';

export const themeSlice = createSlice({
    name: 'themes',
    initialState: 'chess' as IconTheme,
    reducers: {
        setTheme: (state, action: PayloadAction<IconTheme>) => {
            return action.payload;
        },
    }
});

export const themeReducer = themeSlice.reducer;
export const themeActions = themeSlice.actions;