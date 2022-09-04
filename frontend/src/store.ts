import { configureStore } from '@reduxjs/toolkit';
import { dropReducer } from './reducers/dropReducer';
import { gameReducer } from './reducers/gameReducer';
import { notificationReducer } from './reducers/notificationReducer';
import { sessionReducer } from './reducers/sessionReducer';

export const store = configureStore({
    reducer: {
        notifications: notificationReducer,
        games: gameReducer,
        session: sessionReducer,
        drops: dropReducer,
    },
    
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;