// src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '@/screens/HomeScreen';
import MenuScreen from '@/screens/MenuScreen';
import CartScreen from '@/screens/CartScreen';
import AdminScreen from '@/screens/AdminScreen';
// import OrdersScreen from '@/screens/OrdersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Menu') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'Cart') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else {
                        iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF0000',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Menu" component={MenuScreen} />
            <Tab.Screen name="Cart" component={CartScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Customer"
                    component={CustomerTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                {/* <Stack.Screen
                    name="Orders"
                    component={OrdersScreen}
                    options={{ title: 'Meus Pedidos' }}
                />*/}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
