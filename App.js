import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import StudentHome from './screens/StudentScreen/Home';
import TeacherHome from './screens/TeacherScreen/Home';
import StudentList from './screens/TeacherScreen/StudentList';
import StudentDetails from './screens/TeacherScreen/StudentDetails';
import CreateStudent from './screens/TeacherScreen/CreateStudent';
import Settings from './screens/Settings';
import SectionDetails from './screens/TeacherScreen/SectionDetails';
import StudentSignup from './screens/StudentScreen/StudentSignup';
import Scanner from './screens/StudentScreen/Scanner';
import CalendarScreen from './screens/StudentScreen/CalendarScreen';
import FAQ from './screens/FAQ';
import DocumentImport from './screens/TeacherScreen/DocumentImport';

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
        <Stack.Screen name="CreateStudent" component={CreateStudent} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="SectionDetails" component={SectionDetails} />
        <Stack.Screen name="StudentSignup" component={StudentSignup} />
        <Stack.Screen name="Scanner" component={Scanner} />
        <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
        <Stack.Screen name="FAQ" component={FAQ} />
        <Stack.Screen name="DocumentImport" component={DocumentImport} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}