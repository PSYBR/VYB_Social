import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Filter {
  id: string;
  name: string;
  icon: string;
  filter: string;
}

const filters: Filter[] = [
  { id: 'normal', name: 'Normal', icon: 'filter-none', filter: 'normal' },
  { id: 'vintage', name: 'Vintage', icon: 'filter-vintage', filter: 'vintage' },
  { id: 'warm', name: 'Warm', icon: 'wb-sunny', filter: 'warm' },
  { id: 'cool', name: 'Cool', icon: 'ac-unit', filter: 'cool' },
  { id: 'bw', name: 'B&W', icon: 'filter-b-and-w', filter: 'bw' },
  { id: 'sepia', name: 'Sepia', icon: 'filter-drama', filter: 'sepia' },
];

interface VideoFiltersProps {
  onFilterSelect: (filter: string) => void;
  selectedFilter: string;
}

const VideoFilters: React.FC<VideoFiltersProps> = ({
  onFilterSelect,
  selectedFilter,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.selectedFilter,
            ]}
            onPress={() => onFilterSelect(filter.id)}
          >
            <Icon
              name={filter.icon}
              size={24}
              color={selectedFilter === filter.id ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.filterName,
                selectedFilter === filter.id && styles.selectedFilterName,
              ]}
            >
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  filterButton: {
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  selectedFilter: {
    backgroundColor: '#ff4444',
  },
  filterName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  selectedFilterName: {
    fontWeight: 'bold',
  },
});

export default VideoFilters; 