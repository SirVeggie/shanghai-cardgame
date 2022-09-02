import { useDispatch, useSelector } from 'react-redux';
import { NotificationClass, NotificationType, uuid } from 'shared';
import { notificationActions } from '../reducers/notificationReducer';
import { RootState } from '../store';

const { addNotif, removeNotif, clearNotif, hideNotif, showNotif } = notificationActions;

export function useNotification() {
    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => state.notifications);

    const create = (type: NotificationClass, message: string): NotificationType => {
        const n = {
            id: uuid(),
            type,
            message,
            hidden: true
        };

        dispatch(addNotif(n));

        setTimeout(() => {
            dispatch(showNotif(n.id));
        }, 100);
        
        setTimeout(() => {
            hide(n.id);
        }, 5000);

        return n;
    };

    const remove = (id: string): void => {
        dispatch(removeNotif(id));
    };

    const clear = () => {
        dispatch(clearNotif());
    };

    const hide = (id: string): void => {
        dispatch(hideNotif(id));
        
        setTimeout(() => {
            remove(id);
        }, 2000);
    };

    return {
        create,
        // remove,
        close: hide,
        clear,
        notifications
    };
}