import Picker from '@/shared/components/picker/picker';
import { modes } from '@/features/gis/constants/mapModes';

export const MapModeSwitch = ({ currentMode, setCurrentMode }) => {
    return (
        <Picker
            variants={modes}
            label='Режим карты'
            state={currentMode}
            setState={setCurrentMode}
            canBeOpened={true}
            icon='sort-amount-up'
        />
    );
};
