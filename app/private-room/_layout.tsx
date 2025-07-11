import { Stack } from 'expo-router';

export default function PrivateRoomLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="join" />
      <Stack.Screen name="[roomId]" />
    </Stack>
  );
}