import { Text, View } from 'react-native';
import { FormInput } from '@/shared/components/input/input';
import { taskDetailsFormStyles as styles } from '@/features/tasks/components/taskDetailsForm/taskDetailsFormStyles';

const TaskDetailsTextField = ({
    control,
    editable,
    label,
    name,
    nativeID,
    placeholder,
}) => {
    return (
        <View style={styles.control}>
            <Text nativeID={nativeID} style={styles.label}>
                {label}
            </Text>
            <FormInput
                name={name}
                control={control}
                placeholder={placeholder}
                editable={editable}
            />
        </View>
    );
};

export default TaskDetailsTextField;
