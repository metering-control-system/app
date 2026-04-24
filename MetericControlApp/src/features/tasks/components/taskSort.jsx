export const isPriority = (task) => task.manual_priority !== 'NOT_SPECIFIED';

const getAddressKey = (task) => {
    const { district, locality, street, house, building } = task.address;

    return `${district}_${locality}_${street}_${house}_${building}`;
};

const groupTasks = (tasks) => {
    const map = {};

    tasks.forEach((task) => {
        const key = getAddressKey(task);

        if (!map[key]) {
            map[key] = [];
        }

        map[key].push(task);
    });

    return Object.values(map);
};

export const processTasks = (tasks) => {
    const priorityTasks = tasks.filter(isPriority);
    const normalTasks = tasks.filter((task) => !isPriority(task));

    return {
        groupedPriority: groupTasks(priorityTasks),
        groupedNormal: groupTasks(normalTasks),
    };
};
