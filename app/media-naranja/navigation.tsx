import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import MatchProfiles from './MatchProfiles';

const Stack = createNativeStackNavigator();

export default function MediaNaranjaNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="MatchProfiles" component={MatchProfiles} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
