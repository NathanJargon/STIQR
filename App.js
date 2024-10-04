import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import StudentHome from './screens/StudentScreen/Home';
import TeacherHome from './screens/TeacherScreen/Home';
import StudentList from './screens/TeacherScreen/StudentList';
import StudentDetails from './screens/TeacherScreen/StudentDetails';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TeacherHome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="StudentHome" component={StudentHome} />
        <Stack.Screen name="TeacherHome" component={TeacherHome} />
        <Stack.Screen name="StudentList" component={StudentList} />
        <Stack.Screen name="StudentDetails" component={StudentDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}