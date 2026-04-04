const date1 = new Date(2025, 10, 9);
const date2 = new Date(2025, 10, 10);

export const tasks = [
    {
        addr: 'Task 1',
        customerName: 'Иванов Иван Иванович',
        id: date1.toISOString(),
        isUrgent: true,
        period: date1.toLocaleDateString(),
        personalAccount: '1234567890',
        meter: { type: 'HC-131', number: '0012234' },
    },
    {
        addr: 'Task 1',
        customerName: 'Иванов Иван Иванович',
        id: date2.toISOString(),
        isUrgent: false,
        period: date2.toLocaleDateString(),
        personalAccount: '9876543210',
        meter: { type: 'HC-131', number: '00563753' },
    },
];
