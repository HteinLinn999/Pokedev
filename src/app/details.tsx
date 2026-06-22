import { useLocalSearchParams, router, Stack } from "expo-router";
import { useMemo, useEffect } from "react";
import { ScrollView, StyleSheet, Text, Platform, View } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";

export default function Details() {

    const { name } = useLocalSearchParams();
    const snapPoints = useMemo(() => ["30%", "50%", "70%"], []);

    useEffect(() => {
        if (name) {
            fetchPokemonByName(name as string);
        }
    }, [name])

    async function fetchPokemonByName(name: string) {
        try {
            //fetch 
        } catch (error) {
            console.log("error ", error);
        }
    }
    if (Platform.OS === "ios") {
        return <DetailsContent name={name as string} />;
    }

    return (
        <>
            {/* <Stack.Screen options={{  title:"test"}} /> */}

            <View style={styles.androidModal}>
                <BottomSheet
                    index={0}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    onClose={() => router.back()}
                    backdropComponent={(props) => (
                        <BottomSheetBackdrop
                            {...props}
                            appearsOnIndex={0}
                            disappearsOnIndex={-1}
                            pressBehavior="close"
                        />
                    )}
                >
                    <BottomSheetView style={styles.sheetContent}>
                        <DetailsContent name={name as string} />
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </>
    );
}

function DetailsContent({ name }: { name?: string }) {
    return (
        <>
            <Text style={styles.title}>{name}</Text>
            <ScrollView contentContainerStyle={styles.content}>
                <Text>Pokemon Name: {name}</Text>
            </ScrollView>

        </>
    );
}

const styles = StyleSheet.create({
    androidModal: {
        flex: 1,
        backgroundColor: "transparent",
    },
    sheetContent: {
        flex: 1,
    },
    content: {
        gap: 20,
        padding: 20,
        backgroundColor: "red"
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center"
    },
});

// export default function Details() {
//     const { name } = useLocalSearchParams();
//     const params = useLocalSearchParams();
//     console.log(params)


//     useEffect(()=>{},[])

//     async function fetchPokemonByName(name: string){
//         try{
//             //fetch
//         }catch(error){}
//     }

//     return (
//         <ScrollView contentContainerStyle={{
//             gap: 20,
//             padding: 20,
//         }}>
//             <Text>Details</Text>
//             <Text>Pokemon Name: {name}</Text>
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({

// });