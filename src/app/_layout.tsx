import { Stack } from "expo-router";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SelectedPokemonProvider } from "../../contexts/SelectedPokemonContext";
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SelectedPokemonProvider>
        <Stack >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="details"
            options={{
              headerShown: false,
              presentation: Platform.OS === "ios" ? "formSheet" : "transparentModal",
              animation: Platform.OS === "ios" ? "fade_from_bottom" : "fade",

              sheetAllowedDetents: Platform.OS === "ios" ? [0.4, 0.65, 0.9] : undefined,
              sheetGrabberVisible: Platform.OS === "ios",
            }} />

          <Stack.Screen
            name="battle"
            options={{
              title: "Battle",
            }}
          />
        </Stack>
      </SelectedPokemonProvider>
    </GestureHandlerRootView>
  );
}
