import type { Directive } from 'vue';

interface SwipeHTMLElement extends HTMLElement {
  _swipeHandler?: {
    touchstart: (event: TouchEvent) => void;
    touchend: (event: TouchEvent) => void;
  };
}

const createSwipeDirective = (direction: 'up' | 'down'): Directive<SwipeHTMLElement, () => void> => {
  return {
    mounted(el, binding) {
      let touchStartY = 0;
      const MIN_SWIPE_DISTANCE = 50;

      const touchstart = (event: TouchEvent) => {
        touchStartY = event.touches[0].clientY;
      };

      const touchend = (event: TouchEvent) => {
        const touchEndY = event.changedTouches[0].clientY;
        const swipeDistance = touchEndY - touchStartY;

        if (direction === 'up' && swipeDistance < -MIN_SWIPE_DISTANCE) {
          binding.value();
        }

        if (direction === 'down' && swipeDistance > MIN_SWIPE_DISTANCE) {
          const scrollableContainer = el.querySelector('.overflow-y-auto') || el;
          if (scrollableContainer.scrollTop === 0) {
            binding.value();
          }
        }
      };

      el.addEventListener('touchstart', touchstart);
      el.addEventListener('touchend', touchend);

      el._swipeHandler = { touchstart, touchend };
    },

    unmounted(el) {
      if (el._swipeHandler) {
        el.removeEventListener('touchstart', el._swipeHandler.touchstart);
        el.removeEventListener('touchend', el._swipeHandler.touchend);
        delete el._swipeHandler;
      }
    },
  };
};

export const vSwipeUp = createSwipeDirective('up');
export const vSwipeDown = createSwipeDirective('down');
