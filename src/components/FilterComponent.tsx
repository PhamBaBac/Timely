import React from 'react';
import {View, ScrollView, Pressable, Text, StyleSheet} from 'react-native';
import {Category} from 'iconsax-react-native';
import {appColors} from '../constants/appColor';
import {SpaceComponent} from '../components';

interface FilterComponentProps {
  filters: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onCategoryPress: () => void;
}

const FilterComponent = ({
  filters,
  activeFilter,
  setActiveFilter,
  onCategoryPress,
}: FilterComponentProps) => {
  return (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {filters.map((filter, index) => (
          <Pressable
            key={index}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(filter)}>
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter && styles.activeFilterText,
              ]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <SpaceComponent width={10} />
      <Pressable onPress={onCategoryPress}>
        <Category size="24" color={appColors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: appColors.gray2,
    borderRadius: 14,
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: appColors.primary,
  },
  filterButtonText: {
    fontSize: 15,
    color: appColors.black,
  },
  activeFilterText: {
    color: appColors.white,
  },
});

export default FilterComponent;
