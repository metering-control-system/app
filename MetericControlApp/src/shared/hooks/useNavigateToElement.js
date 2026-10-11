import { useCallback, useRef } from 'react';

export const useScrollToPosition = (scrollRef) => {
    const elementsRef = useRef({});
    const pendingFieldRef = useRef(null);
    const laidOutFieldsRef = useRef(new Set());

    const scrollToElement = useCallback(
        (element) => {
            const field = element?.field ?? pendingFieldRef.current;
            if (!field) return;
            pendingFieldRef.current = field;
            const node = elementsRef.current[field];
            const content = scrollRef.current?.getInnerViewRef();
            if (!node || !content || !laidOutFieldsRef.current.has(field))
                return;
            node.measureLayout(content, (_, y) => {
                if (pendingFieldRef.current !== field) return;
                scrollRef.current?.scrollTo({
                    y: Math.max(0, y - 16),
                    animated: true,
                });
                pendingFieldRef.current = null;
            });
        },
        [scrollRef]
    );

    const fillPositions = useCallback(
        ({ name, node }) => {
            if (node !== undefined) {
                if (node) elementsRef.current[name] = node;
                else delete elementsRef.current[name];
                return;
            }
            laidOutFieldsRef.current.add(name);
            if (pendingFieldRef.current === name) scrollToElement();
        },
        [scrollToElement]
    );

    return [fillPositions, scrollToElement];
};

export const useNavigateToElement = (scrollRef, setCurrentStep) => {
    const [fillPositions, scrollToElement] = useScrollToPosition(scrollRef);
    const navigateToElement = useCallback(
        ({ elements, scrollableEl }) => {
            const element = elements[scrollableEl];
            if (!element) return;
            setCurrentStep(element.step ?? 0);
            scrollToElement(element);
        },
        [setCurrentStep, scrollToElement]
    );
    return [navigateToElement, fillPositions];
};
