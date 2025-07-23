"use client";

import React from 'react';
import Select from 'react-select';
import { useTheme } from 'next-themes';

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface UserAutocompleteProps {
  users: UserOption[];
  selectedUsers: UserOption[];
  onSelectionChange: (users: UserOption[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  isMulti?: boolean;
}

const UserAutocomplete: React.FC<UserAutocompleteProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  isLoading = false,
  placeholder = "Search users...",
  isMulti = true,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const options = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
    user: user,
  }));

  const selectedOptions = selectedUsers.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
    user: user,
  }));

  const handleChange = (selected: any) => {
    if (isMulti) {
      const selectedUsers = selected ? selected.map((option: any) => option.user) : [];
      onSelectionChange(selectedUsers);
    } else {
      const selectedUser = selected ? selected.user : null;
      onSelectionChange(selectedUser ? [selectedUser] : []);
    }
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDark ? '#374151' : 'white',
      borderColor: state.isFocused 
        ? (isDark ? '#60a5fa' : '#3b82f6') 
        : (isDark ? '#4b5563' : '#d1d5db'),
      borderWidth: '1px',
      borderRadius: '0.375rem',
      boxShadow: state.isFocused 
        ? `0 0 0 1px ${isDark ? '#60a5fa' : '#3b82f6'}` 
        : 'none',
      '&:hover': {
        borderColor: isDark ? '#60a5fa' : '#3b82f6',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#374151' : 'white',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      borderRadius: '0.375rem',
      boxShadow: isDark 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? (isDark ? '#60a5fa' : '#3b82f6')
        : state.isFocused 
        ? (isDark ? '#4b5563' : '#eff6ff')
        : 'transparent',
      color: state.isSelected 
        ? 'white' 
        : (isDark ? '#f9fafb' : '#374151'),
      '&:hover': {
        backgroundColor: state.isSelected 
          ? (isDark ? '#60a5fa' : '#3b82f6')
          : (isDark ? '#4b5563' : '#eff6ff'),
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#1f2937' : '#dbeafe',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#1e40af',
      fontWeight: '500',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#1e40af',
      '&:hover': {
        backgroundColor: isDark ? '#374151' : '#bfdbfe',
        color: isDark ? '#e5e7eb' : '#1e3a8a',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDark ? '#9ca3af' : '#9ca3af',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#374151',
    }),
    input: (provided: any) => ({
      ...provided,
      color: isDark ? '#f9fafb' : '#374151',
    }),
  };

  return (
    <Select
      isMulti={isMulti}
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      isLoading={isLoading}
      placeholder={placeholder}
      styles={customStyles}
      isClearable={true}
      isSearchable={true}
      closeMenuOnSelect={!isMulti}
      hideSelectedOptions={false}
      noOptionsMessage={() => "No users found"}
      loadingMessage={() => "Loading users..."}
    />
  );
};

export default UserAutocomplete; 