export const primaryTaskDetailsFields = [
    {
        nativeID: 'consumerName',
        label: 'ФИО',
        name: 'consumer.full_name',
        placeholder: 'Введите имя клиента',
    },
    {
        nativeID: 'consumerPhoneNumber',
        label: 'Номер телефона',
        name: 'consumer.phone_number',
        placeholder: 'Введите номер телефона клиента',
    },
    {
        nativeID: 'personalAccount',
        label: 'Лицевой счет',
        name: 'address.account_number',
        placeholder: 'Введите номер лицевого счета',
    },
    {
        nativeID: 'meterType',
        label: 'Тип старого ПУ',
        name: 'meter.type',
        placeholder: 'Введите тип ПУ',
    },
    {
        nativeID: 'meterNumber',
        label: 'Номер старого ПУ',
        name: 'meter.number',
        placeholder: 'Введите номер ПУ',
    },
];

export const additionalTaskDetailsFields = [
    {
        nativeID: 'installationLocation',
        label: 'Место установки ПУ',
        name: 'meter.installation_location',
        placeholder: 'Введите место установки ПУ',
    },
    {
        nativeID: 'reason',
        label: 'Причина замены',
        name: 'task_data.service_reason',
        placeholder: 'Введите причину замены',
    },
];
