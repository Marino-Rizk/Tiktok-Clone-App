import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius, globalStyles } from '../../constants/globalStyles'

const Input = ({ 
    icon, 
    placeholder, 
    formData, 
    handleInputChange, 
    isLoading,
    type = 'text' 
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const getInputConfig = () => {
        switch (type) {
            case 'phone':
                return {
                    keyboardType: 'phone-pad',
                    autoCapitalize: 'none',
                    secureTextEntry: false,
                    maxLength: 15,
                };
            case 'password':
                return {
                    keyboardType: 'default',
                    autoCapitalize: 'none',
                    secureTextEntry: !showPassword,
                };
            case 'otp':
                return {
                    keyboardType: 'number-pad',
                    autoCapitalize: 'none',
                    secureTextEntry: false,
                    maxLength: 6,
                };
            default:
                return {
                    keyboardType: 'default',
                    autoCapitalize: 'none',
                    secureTextEntry: false,
                };
        }
    };

    const inputConfig = getInputConfig();

    return (
        <View>
            <View style={globalStyles.inputContainer}>
                <Ionicons name={icon} size={20} color={colors.gray[500]} style={globalStyles.inputIcon} />
                <TextInput
                    style={[globalStyles.input, { flex: 1 }]}
                    placeholder={placeholder}
                    value={formData}
                    onChangeText={handleInputChange}
                    editable={!isLoading}
                    placeholderTextColor={colors.gray[400]}
                    {...inputConfig}
                />
                {type === 'password' && (
                    <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ padding: spacing.xs }}
                    >
                        <Ionicons 
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                            size={20} 
                            color={colors.gray[500]} 
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default Input