import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Mail, User, Dumbbell, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useLanguageStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(true);
  
  const handleSignup = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth.allFieldsRequired'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, this would call an API to create a new user
      // For demo purposes, we'll simulate a successful signup and login
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Login the user after successful signup
      const success = await login(email, password);
      
      if (success) {
        router.replace('/');
      } else {
        setError(t('auth.signupError'));
      }
    } catch (err) {
      setError(t('auth.signupError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const goBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Button
              title=""
              onPress={goBack}
              variant="text"
              style={styles.backButton}
              icon={<ArrowLeft size={24} color={colors.primary} />}
            />
            <View style={styles.logoContainer}>
              <Dumbbell size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.createAccount')}</Text>
            <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Input
              label={t('auth.name')}
              placeholder={t('auth.enterName')}
              value={name}
              onChangeText={setName}
              leftIcon={<User size={20} color={colors.textSecondary} />}
            />
            
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
            
            <Input
              label={t('auth.confirmPassword')}
              placeholder={t('auth.enterConfirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
            />
            
            <View style={styles.accountTypeContainer}>
              <Text style={styles.accountTypeLabel}>{t('auth.accountType')}</Text>
              <View style={styles.accountTypeButtons}>
                <Button
                  title={t('auth.client')}
                  onPress={() => setIsClient(true)}
                  variant={isClient ? 'primary' : 'outline'}
                  style={[styles.accountTypeButton, isClient && styles.activeAccountTypeButton]}
                  textStyle={isClient ? styles.activeAccountTypeText : {}}
                />
                
                <Button
                  title={t('auth.trainer')}
                  onPress={() => setIsClient(false)}
                  variant={!isClient ? 'primary' : 'outline'}
                  style={[styles.accountTypeButton, !isClient && styles.activeAccountTypeButton]}
                  textStyle={!isClient ? styles.activeAccountTypeText : {}}
                />
              </View>
            </View>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Button
              title={t('auth.signUp')}
              onPress={handleSignup}
              loading={isLoading}
              style={styles.signupButton}
            />
            
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>{t('auth.alreadyHaveAccount')} </Text>
              <Button
                title={t('auth.login')}
                onPress={goBack}
                variant="text"
                style={styles.loginLink}
                textStyle={styles.loginLinkButtonText}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  accountTypeContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  accountTypeLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  accountTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountTypeButton: {
    flex: 0.48,
  },
  activeAccountTypeButton: {
    backgroundColor: colors.primary,
  },
  activeAccountTypeText: {
    color: colors.text,
  },
  signupButton: {
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    padding: 0,
    margin: 0,
    height: 20,
  },
  loginLinkButtonText: {
    fontSize: 14,
  },
});