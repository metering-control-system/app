import { useCallback, useRef } from 'react';

export const useScrollToPosition = (scrollRef) => {
    const elementsPositionsRef = useRef(null);

    const fillPositions = ({ e, name }) => {
        elementsPositionsRef.current = {
            ...(elementsPositionsRef.current ?? {}),
            [name]: e.nativeEvent.layout.y,
        };
    };

    const scrollToElement = useCallback((scrollableEl) => {
        if (scrollableEl && scrollRef && elementsPositionsRef.current) {
            scrollRef.current.scrollTo({
                y: elementsPositionsRef.current[scrollableEl?.field],
                animated: true,
            });
        }
    }, []);

    return [fillPositions, scrollToElement];
};

export const useNavigateToElement = (scrollRef, setCurrentStep) => {
    const [fillPositions, scrollToElement] = useScrollToPosition(scrollRef);

    const navigateToElement = ({ elements, scrollableEl }) => {
        const element = elements[scrollableEl];
        if (element) {
            setCurrentStep(element?.step ?? 0);
            setTimeout(() => {
                scrollToElement(element);
            }, 50);
        }
    };

    return [navigateToElement, fillPositions];
};
