import { Fragment } from 'react';
import { Text, View } from 'react-native';
import Checkbox from '@/shared/components/button/checkbox';
import MediaBlock from '@/shared/components/media/mediaBlock';
import TaskDetailsTextField from '@/features/tasks/components/taskDetailsForm/taskDetailsTextField';
import { taskDetailsFormStyles as styles } from '@/features/tasks/components/taskDetailsForm/taskDetailsFormStyles';

const TaskRealMeterSection = ({
    active,
    editable,
    control,
    uri,
    onToggle,
    onOpenCamera,
    onDeletePhoto,
    onUploadPhoto,
}) => {
    return (
        <View style={styles.panel}>
            <View style={[styles.control, styles.switchRow]}>
                <Text>Фактический ПУ отличается</Text>
                <Checkbox size={30} active={active} setActive={onToggle} />
            </View>
            {active && (
                <Fragment>
                    <TaskDetailsTextField
                        nativeID='realMeterNumber'
                        label='Номер фактического ПУ'
                        name='realMeter.number'
                        control={control}
                        placeholder='Введите номер фактического ПУ'
                        editable={editable}
                    />
                    <View style={styles.control}>
                        <Text nativeID='realMeterImage' style={styles.label}>
                            Фото текущего счетчика
                        </Text>
                        <MediaBlock
                            handleOpenCamera={onOpenCamera}
                            handleDeletePhoto={onDeletePhoto}
                            handleUploadPhoto={onUploadPhoto}
                            handleUpdatePhoto={onUploadPhoto}
                            disabled={!editable}
                            uri={uri}
                        />
                    </View>
                </Fragment>
            )}
        </View>
    );
};

export default TaskRealMeterSection;
