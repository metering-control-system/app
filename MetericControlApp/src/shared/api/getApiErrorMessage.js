const userMessages = new Set([
    'Сгенерируйте акт перед подписанием или отправкой отчёта.',
    'Данные отчёта или шаблон изменились. Пересоздайте акт. Прежние подписи будут удалены.',
    'Файл акта не найден. Сгенерируйте акт заново.',
    'Акт изменился. Вернитесь в отчёт и пересоздайте его.',
]);

export const getApiErrorMessage = (
    error,
    fallbackMessage = 'Не удалось выполнить действие. Попробуйте ещё раз.'
) => {
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        return 'Сервер не ответил вовремя. Попробуйте ещё раз через минуту.';
    }
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        return 'Нет соединения с сервером. Проверьте подключение к интернету и попробуйте ещё раз.';
    }
    if (!error?.response && userMessages.has(error?.message))
        return error.message;
    if (error?.code === 'REPORT_READ_ONLY')
        return 'Этот отчёт уже отправлен. Откройте его в списке отчётов, чтобы проверить статус.';
    const status = error?.response?.status;
    if (status === 401) return 'Сеанс завершён. Войдите в приложение заново.';
    if (status === 403)
        return 'У вас нет доступа к этому действию. Обратитесь к руководителю.';
    if (status === 413)
        return 'Файл слишком большой. Выберите фотографию меньшего размера.';
    if (status === 429)
        return 'Слишком много попыток. Подождите немного и повторите действие.';
    if (status >= 500)
        return 'Сервер временно недоступен. Попробуйте ещё раз позже.';
    return fallbackMessage;
};
