import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationType } from 'shared/src/types';
import { arrayRemove } from '../tools/utils';

export const notificationSlice = createSlice({
    name: 'notifications',
    initialState: [] as NotificationType[],
    reducers: {
        addNotif: (state, action: PayloadAction<NotificationType>) => {
            state.push(action.payload);
        },
        removeNotif: (state, action: PayloadAction<string>) => {
            arrayRemove(state, n => n.id === action.payload);
        },
        clearNotif: (state) => {
            state.splice(0, state.length);
        },
        hideNotif: (state, action: PayloadAction<string>) => {
            const n = state.find(n => n.id === action.payload);
            if (n) {
                n.hidden = true;
            }
        },
        showNotif: (state, action: PayloadAction<string>) => {
            const n = state.find(n => n.id === action.payload);
            if (n) {
                n.hidden = false;
            }
        }
    }
});

export const notificationReducer = notificationSlice.reducer;
export const notificationActions = notificationSlice.actions;