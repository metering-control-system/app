export const isPriority = (task) => task.manual_priority !== 'NOT_SPECIFIED';

const getAddressKey = (task) => {
    const {
        district = '',
        locality = '',
        street = '',
        house = '',
        building = '',
    } = task.address || {};
    return `${district}_${locality}_${street}_${house}_${building}`;
};

const groupTasks = (tasks) => {
    const map = new Map();
    tasks.forEach((task) => {
        const key = getAddressKey(task);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(task);
    });
    return Array.from(map.values());
};

export const processTasks = (tasks = []) => {
    const priority = [];
    const normal = [];
    tasks.forEach((task) => {
        (isPriority(task) ? priority : normal).push(task);
    });
    return {
        groupedPriority: groupTasks(priority),
        groupedNormal: groupTasks(normal),
    };
};
