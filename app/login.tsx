import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Mail, User, Facebook, Instagram } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useLanguageStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClientMode, setIsClientMode] = useState(true);
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        router.replace('/');
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      setError(t('auth.loginError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickLogin = async (userType: 'trainer' | 'client') => {
    setIsLoading(true);
    setError('');
    
    try {
      let loginEmail = userType === 'trainer' ? 'trainer@example.com' : 'client@example.com';
      const success = await login(loginEmail, 'password');
      
      if (success) {
        router.replace('/');
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      setError(t('auth.loginError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleSocialLogin = (platform: string) => {
    setError('');
    // In a real app, this would integrate with social auth providers
    console.log(`Login with ${platform}`);
    
    // For demo purposes, we'll simulate a successful login as a client
    handleQuickLogin('client');
  };
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ 
              uri: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1920&auto=format&fit=crop' 
            }} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.formContainer}>
          <Input
            label={t('auth.email')}
            placeholder={t('auth.enterEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('auth.password')}
            placeholder={t('auth.enterPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <Button
            title={t('auth.signUp')}
            onPress={handleSignUp}
            variant="outline"
            style={styles.signUpButton}
          />
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{t('auth.accountType')}</Text>
            <View style={styles.switchWrapper}>
              <Text style={[
                styles.switchOption, 
                !isClientMode && styles.switchOptionActive
              ]}>{t('auth.trainer')}</Text>
              
              <Switch
                value={isClientMode}
                onValueChange={setIsClientMode}
                trackColor={{ false: colors.primary, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : colors.text}
                ios_backgroundColor={colors.backgroundLight}
                style={styles.switch}
              />
              
              <Text style={[
                styles.switchOption, 
                isClientMode && styles.switchOptionActive
              ]}>{t('auth.client')}</Text>
            </View>
          </View>

          {isClientMode && (
            <View style={styles.socialLoginContainer}>
              <Text style={styles.socialLoginText}>{t('auth.continueWith')}</Text>
              
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <Facebook size={24} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>{t('auth.facebook')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.socialButton, styles.instagramButton]}
                  onPress={() => handleSocialLogin('Instagram')}
                >
                  <Instagram size={24} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>{t('auth.instagram')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.quickLoginContainer}>
            <TouchableOpacity 
              style={styles.quickLoginLink}
              onPress={() => handleQuickLogin(isClientMode ? 'client' : 'trainer')}
            >
              <Text style={styles.quickLoginText}>
                {t('auth.quickLoginAs')} {isClientMode ? t('auth.client') : t('auth.trainer')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  logoImage: {
    width: width - theme.spacing.md * 2,
    height: (width - theme.spacing.md * 2) * (1106 / 2901), // Maintain aspect ratio of 2901x1106
    borderRadius: theme.borderRadius.md,
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  signUpButton: {
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  switchContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
  },
  switch: {
    marginHorizontal: theme.spacing.xs,
  },
  switchOption: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: theme.spacing.sm,
  },
  switchOptionActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  socialLoginContainer: {
    marginTop: theme.spacing.lg,
  },
  socialLoginText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 0.48,
    gap: theme.spacing.sm,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E1306C',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  quickLoginContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  quickLoginLink: {
    padding: theme.spacing.sm,
  },
  quickLoginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});