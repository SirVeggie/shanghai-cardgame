import { createUseStyles } from 'react-jss';

type Props = {
  event: MouseEvent;
};

export function ContextMenu(p: Props) {
  const s = useStyles();
  
  console.log(`X: ${p.event.x}`);
  console.log(`clientX: ${p.event.clientX}`);
  console.log(`pageX: ${p.event.pageX}`);
  console.log(`screenX: ${p.event.screenX}`);
  console.log(`offsetX: ${p.event.offsetX}`);
  
  return (
    <div className={s.menu}>
      
    </div>
  );
}

const useStyles = createUseStyles({
  menu: {
    position: 'absolute',
    zIndex: 1000,
  }
});