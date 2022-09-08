
export function resetDragAnimations() {
    document.querySelectorAll('.draggable').forEach((el) => {
        el.classList.add('no-transition');
        setTimeout(() => {
            el.classList.remove('no-transition');
        }, 10);
    });
}