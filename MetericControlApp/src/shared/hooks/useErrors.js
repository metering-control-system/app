import { useCallback, useState } from 'react';

const useErrors = () => {
    const [error, setError] = useState(null);
    const handleError = useCallback((title, message) => {
        setError(message ? `${title}. ${message}` : title);
    }, []);
    const dismissError = useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, dismissError };
};

export default useErrors;
