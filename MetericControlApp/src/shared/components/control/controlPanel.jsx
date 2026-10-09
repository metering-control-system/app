import { View, StyleSheet, LayoutAnimation } from 'react-native';
import Picker from '@/shared/components/picker/picker';
import { SearchInput } from '@/shared/components/input/searchInput';
import { useEffect, useState } from 'react';

export const ControlPanel = ({
    filtering,
    setFiltering,
    sorting,
    setSorting,
    filteringVariants,
    sortingVariants,
    search,
    setSearch,
    children,
}) => {
    const [isNotSearched, setIsNotSearched] = useState(true);

    useEffect(() => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: { type: 'linear' },
        });
    }, [isNotSearched]);

    return (
        <View style={styles.container}>
            <SearchInput
                searchState={search}
                setSearchState={setSearch}
                searched={isNotSearched}
                setSearched={setIsNotSearched}
            />
            {sortingVariants && (
                <Picker
                    variants={sortingVariants}
                    label='Сортировка'
                    state={sorting}
                    setState={setSorting}
                    canBeOpened={isNotSearched}
                    setCanBeOpened={setIsNotSearched}
                    icon='sort-amount-up'
                />
            )}
            {filteringVariants && (
                <Picker
                    variants={filteringVariants}
                    label='Фильтрация'
                    state={filtering}
                    setState={setFiltering}
                    canBeOpened={isNotSearched}
                    setCanBeOpened={setIsNotSearched}
                    multiSelect
                    icon='filter'
                />
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: '#e8e8e8',
        marginBottom: 15,
    },
});
