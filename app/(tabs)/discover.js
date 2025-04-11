import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import React, { useState } from 'react';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';
import SearchBar from '../../components/ui/SearchBar';

const mockTrendingItems = [
  { id: '1', title: '#trending1', views: '1.2M' },
  { id: '2', title: '#trending2', views: '980K' },
  { id: '3', title: '#trending3', views: '750K' },
  { id: '4', title: '#trending4', views: '500K' },
  { id: '5', title: '#trending5', views: '300K' },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (text) => {
    setSearchQuery(text);
    
  };

  const handleSearchFocus = () => {
    setIsSearching(true);
  };

  const handleSearchBlur = () => {
    setIsSearching(false);
  };

  const renderTrendingItem = ({ item }) => (
    <View style={styles.trendingItem}>
      <Text style={[typography.body, { color: colors.primary }]}>{item.title}</Text>
      <Text style={[typography.caption, { color: colors.gray[400] }]}>{item.views} views</Text>
    </View>
  );

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.searchContainer}>
        <Text style={[typography.h2, { color: colors.black }]}>Discover</Text>
      </View>
      <ScrollView style={styles.contentContainer}>
        <SearchBar
          placeholder="Search videos, users, or sounds"
          onSearch={handleSearch}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        
        {!isSearching && (
          <>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Trending</Text>
            <View style={styles.trendingContainer}>
              <FlatList
                data={mockTrendingItems}
                renderItem={renderTrendingItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          </>
        )}

        {isSearching && searchQuery && (
          <View style={styles.searchResultsContainer}>
            <Text style={[typography.body, { color: colors.gray[400] }]}>
              Search results for: {searchQuery}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.xl,
  },
  contentContainer: {
    flex: 1,
  },
  trendingContainer: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchResultsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
}); 