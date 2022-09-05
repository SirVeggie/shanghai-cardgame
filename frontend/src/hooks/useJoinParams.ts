import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GameJoinParams, validateJoinParams } from 'shared';
import { joinParamActions } from '../reducers/joinParamReducer';
import { RootState } from '../store';

let hasInitialised = false;

export function useJoinParams() {
    const dispatch = useDispatch();
    const params = useSelector((state: RootState) => state.joinParams);

    useEffect(() => {
        if (hasInitialised)
            return;
        hasInitialised = true;
        try {
            const params = JSON.parse(localStorage.getItem('joinParams') ?? '{}') as GameJoinParams;
            validateJoinParams(params);
            set(params);
        } catch {
            console.log('Failed to get params from memory');
            localStorage.removeItem('joinParams');
        }
    }, []);

    const set = (params: GameJoinParams | null) => {
        try {
            validateJoinParams(params!);
            localStorage.setItem('joinParams', JSON.stringify(params));
            dispatch(joinParamActions.setParams(params!));
        } catch {
            localStorage.removeItem('joinParams');
            dispatch(joinParamActions.clearParams());
        }
    };

    return [params, set] as [typeof params, typeof set];
}