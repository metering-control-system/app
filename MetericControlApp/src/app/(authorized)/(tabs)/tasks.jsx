import TasksList from '@/features/tasks/components/taskList';
import ScreenLayout from '@/shared/components/screen/screenLayout';

const TaskScreen = () => {
    return (
        <ScreenLayout safe>
            <TasksList />
        </ScreenLayout>
    );
};

export default TaskScreen;
