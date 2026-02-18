import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authAPI } from '@/services/api';
import { API_BASE_URL } from '@/config/api.config';

export default function LoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle focus untuk scroll ke input yang aktif
  const handleInputFocus = (offsetY: number = 0) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: offsetY,
        animated: true,
      });
    }, 300);
  };

  // Handle keyboard hide untuk kembali ke posisi awal
  React.useEffect(() => {
    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }
    );

    return () => {
      keyboardHideListener.remove();
    };
  }, []);

  // Validasi email
  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let error = '';

    if (emailStr && !emailRegex.test(emailStr)) {
      error = 'Please enter a valid email address';
    }

    setEmailError(error);
    return emailRegex.test(emailStr) || !emailStr;
  };

  const handleEmailChange = (emailStr: string) => {
    setEmail(emailStr);
    // Update error message on each change
    if (emailStr) {
      validateEmail(emailStr);
    } else {
      setEmailError('');
    }
  };

  // Validasi password
  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);

    let error = '';
    if (pwd && !hasMinLength) {
      error = 'Password must be at least 8 characters';
    } else if (pwd && !hasLetter) {
      error = 'Password must contain at least one letter';
    } else if (pwd && !hasNumber) {
      error = 'Password must contain at least one number';
    }

    setPasswordError(error);
    return hasMinLength && hasLetter && hasNumber;
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    // Update error message on each change
    if (pwd) {
      validatePassword(pwd);
    } else {
      setPasswordError('');
    }
  };

  // Test API connectivity
  const testAPIConnection = async () => {
    try {
      console.log(`Testing connection to ${API_BASE_URL}`);
      const response = await axios.get(`${API_BASE_URL}/test`, {
        timeout: 5000,
      });
      console.log('Connection test successful:', response.data);
      Alert.alert('Connection Success', `✓ Backend is running at ${API_BASE_URL}`);
      return true;
    } catch (error: any) {
      console.log('Connection test failed:', error.message);
      let message = `Cannot connect to ${API_BASE_URL}\n\n`;

      if (error.code === 'ECONNREFUSED') {
        message += 'Backend is not running. Start it with:\ncd backend-laravel\nphp artisan serve';
      } else if (error.code === 'ECONNABORTED') {
        message += 'Connection timeout. Backend may be overloaded or server is down.';
      } else if (error.message === 'Network Error') {
        message += 'Network unreachable. Check if device and server are on same network.';
      } else {
        message += `Error: ${error.message}`;
      }

      Alert.alert('Connection Failed', message);
      return false;
    }
  };

  const handleLogin = async () => {
    // Validasi input
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validasi email format
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Don't validate password complexity on login - only check if it's not empty

    setIsLoading(true);
    try {
      console.log(`Attempting login to ${API_BASE_URL}`);

      // Call actual login API (no connection test, let the login request handle errors)
      const response = await authAPI.login(email, password);

      console.log('Login successful:', response);

      // Navigate ke tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Invalid email or password';

      // Handle different error types
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = `Cannot connect to server at ${API_BASE_URL}\n\nMake sure:\n1. Backend is running (php artisan serve:urls)\n2. You're using the correct IP address\n3. Your device and server are on the same network`;
      } else if (error.response?.status === 422 || error.response?.status === 401) {
        errorMessage = error.response?.data?.message || 'Invalid email or password';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="#1F2937" />
      {/* Decorative Background */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.circle, styles.circleTop]} />
        <View style={[styles.circle, styles.circleBottom]} />
      </View>

      {/* Form Section with Keyboard Handling */}
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header Section - Will scroll up with keyboard */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <IconSymbol size={40} name="location.fill" color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.appTitle}>MOOD TRACKER</Text>
              <Text style={styles.subtitle}>Track Your Journey</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.loginSubtext}>Sign in to continue tracking</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                  <IconSymbol size={20} name="envelope.fill" color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    onFocus={() => handleInputFocus(200)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {emailError && (
                  <View style={styles.errorContainer}>
                    <IconSymbol size={14} name="exclamationmark.circle.fill" color="#EF4444" />
                    <Text style={styles.errorText}>{emailError}</Text>
                  </View>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                  <IconSymbol size={20} name="lock.fill" color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onFocus={() => handleInputFocus(300)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <IconSymbol
                      size={20}
                      name={showPassword ? 'eye.fill' : 'eye'}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && (
                  <View style={styles.errorContainer}>
                    <IconSymbol size={14} name="exclamationmark.circle.fill" color="#EF4444" />
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                )}
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={isLoading}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <IconSymbol size={14} name="checkmark" color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
                {!isLoading && <IconSymbol size={20} name="arrow.right" color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  backgroundDecor: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  circleTop: {
    width: 300,
    height: 300,
    top: -150,
    right: -100,
  },
  circleBottom: {
    width: 250,
    height: 250,
    bottom: -100,
    left: -80,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  loginSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  inputWrapperError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 30,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signUpLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
});
