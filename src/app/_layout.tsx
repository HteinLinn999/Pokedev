import { Stack } from "expo-router";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack >
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="details"
          options={{
            presentation: Platform.OS === "ios" ? "formSheet" : "transparentModal",
            animation: Platform.OS === "ios" ? "fade_from_bottom" : "fade",

            sheetAllowedDetents: Platform.OS === "ios" ? [0.3, 0.5, 0.7] : undefined,
            sheetGrabberVisible: true,

            headerShown: false,

          }} />
      </Stack>
    </GestureHandlerRootView>
  );

}

// export default function RootLayout() {
//   return (<Stack >
//     <Stack.Screen name="index" options={{ title: "Home" }} />
//     <Stack.Screen name="details"
//       options={{
//         title: "Details",
//         headerBackButtonDisplayMode:
//           Platform.OS === "ios" ? "minimal" : undefined,
//           presentation :"fullScreenModal",
//           animation:"fade_from_bottom",
//           sheetAllowedDetents:[0.3, 0.5 , 0.7]
//       }} />
//   </Stack>
//   );
// }