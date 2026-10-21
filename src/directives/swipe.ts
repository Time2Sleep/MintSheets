import type { Directive } from 'vue';

interface SwipeHTMLElement extends HTMLElement {
  _swipeHandler?: {
    touchstart: (event: TouchEvent) => void;
    touchend: (event: TouchEvent) => void;
    mousedown: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
  };
}

const createSwipeDirective = (direction: 'up' | 'down'): Directive<SwipeHTMLElement, () => void> => {
  return {
    mounted(el, binding) {
      let touchStartY = 0;
      let mouseStartY: number | null = null;
      const MIN_SWIPE_DISTANCE = 20;

      const handleSwipe = (swipeDistance: number) => {
        if (direction === 'up' && swipeDistance < -MIN_SWIPE_DISTANCE) {
          binding.value();
        }

        if (direction === 'down' && swipeDistance > MIN_SWIPE_DISTANCE) {
          binding.value();
        }
      };

      const touchstart = (event: TouchEvent) => {
        touchStartY = event.touches[0].clientY;
      };

      const touchend = (event: TouchEvent) => {
        const touchEndY = event.changedTouches[0].clientY;
        handleSwipe(touchEndY - touchStartY);
      };

      const mousedown = (event: MouseEvent) => {
        if (event.button === 0) {
          mouseStartY = event.clientY;
        }
      };

      const mouseup = (event: MouseEvent) => {
        if (mouseStartY !== null) {
          handleSwipe(event.clientY - mouseStartY);
          mouseStartY = null;
        }
      };

      el.addEventListener('touchstart', touchstart);
      el.addEventListener('touchend', touchend);
      el.addEventListener('mousedown', mousedown);
      document.addEventListener('mouseup', mouseup);

      el._swipeHandler = { touchstart, touchend, mousedown, mouseup };
    },

    unmounted(el) {
      if (el._swipeHandler) {
        el.removeEventListener('touchstart', el._swipeHandler.touchstart);
        el.removeEventListener('touchend', el._swipeHandler.touchend);
        el.removeEventListener('mousedown', el._swipeHandler.mousedown);
        document.removeEventListener('mouseup', el._swipeHandler.mouseup);
        delete el._swipeHandler;
      }
    },
  };
};

export const vSwipeUp = createSwipeDirective('up');
export const vSwipeDown = createSwipeDirective('down');
