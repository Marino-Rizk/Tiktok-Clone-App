import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, globalStyles } from '../../constants/globalStyles';

const SearchBar = ({ 
  placeholder = 'Search...',
  onSearch,
  onFocus,
  onBlur
}) => {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (text) => {
    setSearchText(text);
    onSearch?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const clearSearch = () => {
    setSearchText('');
    onSearch?.('');
  };

  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused
    ]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={colors.gray[400]} 
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        value={searchText}
        onChangeText={handleSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.gray[400]} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 40,
    marginBottom: spacing.lg,
  },
  containerFocused: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.body.fontSize,
    color: colors.black,
  },
  clearButton: {
    padding: spacing.xs,
  },
});

export default SearchBar; 