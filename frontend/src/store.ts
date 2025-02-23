import { configureStore } from '@reduxjs/toolkit';
import { dropReducer } from './reducers/dropReducer';
import { gameReducer } from './reducers/gameReducer';
import { joinParamReducer } from './reducers/joinParamReducer';
import { notificationReducer } from './reducers/notificationReducer';
import { sessionReducer } from './reducers/sessionReducer';
import { themeReducer } from './reducers/themeReducer';

export const store = configureStore({
    reducer: {
        notifications: notificationReducer,
        games: gameReducer,
        session: sessionReducer,
        drops: dropReducer,
        joinParams: joinParamReducer,
        theme: themeReducer,
    },
    
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;