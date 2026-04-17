import TasksList from '@/features/tasks/components/taskList';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useState } from 'react';
import Notification from '@/shared/components/notification/Notification';

const TaskScreen = () => {
    const [error, setError] = useState(null);

    return (
        <ScreenLayout safe>
            {error && <Notification variant='warning' message={error} />}
            <TasksList setError={setError} />
        </ScreenLayout>
    );
};

export default TaskScreen;
