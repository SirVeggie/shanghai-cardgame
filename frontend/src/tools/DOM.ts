
export function resetDragAnimations() {
    document.querySelectorAll('.dropped').forEach((el) => {
        el.classList.add('no-transition');
        el.classList.add('hidden');
        setTimeout(() => {
            el.classList.remove('no-transition');
            el.classList.remove('hidden');
        }, 100);
    });
}