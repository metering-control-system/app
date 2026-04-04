import ScreenLayout from '../../shared/components/screen/screenLayout';
import TasksList from '../../features/tasks/components/taskList';

const TaskScreen = () => {
    return (
        <ScreenLayout safe>
            <TasksList />
        </ScreenLayout>
    );
};

export default TaskScreen;
