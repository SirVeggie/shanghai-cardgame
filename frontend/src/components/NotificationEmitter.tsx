import { useNotification } from '../hooks/useNotification';
import { Notification } from './Notification';

export function NotificationEmitter() {
  const { notifications } = useNotification();
  
  return (
    <div>
      {notifications.map(n =>
        <Notification key={n.id} notification={n} />
      )}
    </div>
  );
}