import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Globe, 
  Bell, 
  Moon, 
  User, 
  HelpCircle, 
  Info, 
  FileText, 
  Shield, 
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore, Language } from '@/store/language-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };
  
  if (!user) return null;
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('nav.settings')}</Text>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          </View>
          
          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'en' && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.languageText,
                language === 'en' && styles.selectedLanguageText
              ]}>
                {t('settings.english')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'es' && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageChange('es')}
            >
              <Text style={[
                styles.languageText,
                language === 'es' && styles.selectedLanguageText
              ]}>
                {t('settings.spanish')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('settings.notifications')}</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.darkMode')}</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('settings.darkMode')}</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>{t('settings.account')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.help')}</Text>
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>{t('settings.help')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('app.name')}</Text>
            <Text style={styles.aboutValue}>Kwoka Fitness</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.termsOfService')}</Text>
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>{t('settings.termsOfService')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('settings.privacyPolicy')}</Text>
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>{t('settings.privacyPolicy')}</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
        
        <Button
          title={t('auth.logout')}
          onPress={logout}
          variant="outline"
          icon={<LogOut size={20} color={colors.error} />}
          style={styles.logoutButton}
          textStyle={{ color: colors.error }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: theme.spacing.sm,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  languageOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedLanguage: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  selectedLanguageText: {
    color: colors.text,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  aboutItem: {
    marginBottom: theme.spacing.sm,
  },
  aboutLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  aboutValue: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    marginVertical: theme.spacing.lg,
    borderColor: colors.error,
  },
});