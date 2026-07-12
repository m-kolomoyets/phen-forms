import { useEffect, useState } from 'react';

// Returns `value` delayed by `delay` ms — updates only after the input settles.
// Used to throttle work driven by fast-changing input (e.g. filtering on keystrokes).
export const useDebouncedValue = <T>(value: T, delay = 250): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(
        function scheduleUpdate() {
            const timeout = setTimeout(() => {
                setDebounced(value);
            }, delay);

            return () => {
                clearTimeout(timeout);
            };
        },
        [value, delay]
    );

    return debounced;
};
