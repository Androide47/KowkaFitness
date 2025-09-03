import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth-store';
import { colors } from '@/constants/colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add any custom fonts here if needed
  });
  
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  useEffect(() => {
    // Check if the user is authenticated
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      // Redirect to the home page if already authenticated
      router.replace('/');
    }
  }, [isAuthenticated, segments]);
  
  if (!loaded) {
    return null;
  }
  
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen 
          name="workouts/[id]" 
          options={{ 
            title: 'Workout Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="workouts/create" 
          options={{ 
            title: 'Create Workout',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="progress/[id]" 
          options={{ 
            title: 'Progress Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="progress/photo" 
          options={{ 
            title: 'Add Photos',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="progress/measurement" 
          options={{ 
            title: 'Add Measurements',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="progress/note" 
          options={{ 
            title: 'Add Note',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="messages/[id]" 
          options={{ 
            title: 'Conversation',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="calendar" 
          options={{ 
            title: 'Calendar',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="calendar/[id]" 
          options={{ 
            title: 'Appointment Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="clients/[id]" 
          options={{ 
            title: 'Client Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="broadcast" 
          options={{ 
            title: 'Send Broadcast',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </>
  );
}