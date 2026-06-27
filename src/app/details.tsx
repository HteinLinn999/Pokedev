import BottomSheet, {
    BottomSheetBackdrop,
    //  BottomSheetView,
    BottomSheetFooter,
    BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { Pressable } from "react-native";
import { useSelectedPokemon } from "../../contexts/SelectedPokemonContext";
interface PokemonStat {
    name: string,
    value: number;
}
interface PokemonDetails {
    name: string;
    height: number;
    weight: number;
    image: string;
    types: string[];
    abilities: string[];
    stats: PokemonStat[];
}
export default function Details() {

    const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const { name } = useLocalSearchParams();
    const snapPoints = useMemo(() => ["40%", "65%", "90%"], []);

    const { choosePokemon } = useSelectedPokemon();

    useEffect(() => {
        if (name) {
            fetchPokemonByName(name as string);
        }
    }, [name])

    async function fetchPokemonByName(name: string) {
        try {
            //fetch 
            setLoading(true);
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!response.ok) {
                throw new Error("Pokemon detail fetch failed");
            }
            const data = await response.json();

            setPokemon({
                name: data.name,
                height: data.height,
                weight: data.weight,
                image: data.sprites.front_default,
                types: data.types.map((item: any) => item.type.name),
                abilities: data.abilities.map((item: any) => item.ability.name),
                stats: data.stats.map((item: any) => ({
                    name: item.stat.name,
                    value: item.base_stat
                }))
            });


        } catch (error) {
            console.log("Fetch pokemon detail error:", error);
        } finally {
            setLoading(false);
        }
    }
    if (Platform.OS === "ios") {
        return (
            <>
                <ScrollView contentContainerStyle={styles.content}>
                    <DetailsBody pokemon={pokemon} loading={loading} name={name as string} />

                    {pokemon && !loading && (
                        <Pressable style={styles.chooseButton} onPress={chooseCurrentPokemon}>
                            <Text style={styles.chooseButtonText}>Choose Pokemon</Text>
                        </Pressable>
                    )}
                </ScrollView>
            </>
        );
    }

   async function chooseCurrentPokemon() {
        if (!pokemon) return;

        const stats = Object.fromEntries(
            pokemon.stats.map((stat) => [stat.name, stat.value])
        );
        // const hp = pokemon?.stats.find((stat) => stat.name === "hp")?.value ?? 50;
        // const attack =
        //     pokemon?.stats.find((stat) => stat.name === "attack")?.value ?? 50;
        // const defense =
        //     pokemon?.stats.find((stat) => stat.name === "defense")?.value ?? 50;
        // const speed =
        //     pokemon?.stats.find((stat) => stat.name === "speed")?.value ?? 50;

        await choosePokemon({
            name: pokemon?.name as string,
            image: pokemon?.image as string,
            types: pokemon?.types as string[],
            hp: stats.hp ?? 50,
            attack: stats.attack ?? 50,
            defense: stats.defense ?? 50,
            speed: stats.speed ?? 50,
        });

        router.back();
    }
    return (
        <>
            <View style={styles.androidModal}>
                <BottomSheet
                    index={1}
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

                    footerComponent={(props) =>
                        pokemon && !loading ? (
                            <BottomSheetFooter {...props} bottomInset={0}>
                                <View style={styles.footer}>
                                    <Pressable style={styles.chooseButton} onPress={chooseCurrentPokemon}>
                                        <Text style={styles.chooseButtonText}>Choose Pokemon</Text>
                                    </Pressable>
                                </View>
                            </BottomSheetFooter>
                        ) : null
                    }
                >


                    <BottomSheetScrollView contentContainerStyle={styles.content}>
                        <DetailsBody pokemon={pokemon} loading={loading} name={name as string} />
                    </BottomSheetScrollView>


                </BottomSheet>
            </View>
        </>
    );
}

function DetailsBody({
    pokemon,
    loading,
    name,
}: {
    pokemon: PokemonDetails | null;
    loading: boolean;
    name?: string;
}) {
    if (loading) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" />
                <Text>Loading {name}...</Text>
            </View>
        );
    }

    if (!pokemon) {
        return (
            <View style={styles.centerContent}>
                <Text>No Pokemon found.</Text>
            </View>
        );
    }

    return (
        <>
            <Text style={styles.title}>{pokemon.name}</Text>

            <Image source={{ uri: pokemon.image }} style={styles.image} />

            <Text style={styles.label}>Types</Text>
            <Text style={styles.value}>{pokemon.types.join(", ")}</Text>

            <Text style={styles.label}>Abilities</Text>
            <Text style={styles.value}>{pokemon.abilities.join(", ")}</Text>

            <View style={styles.row}>
                <View style={styles.statBox}>
                    <Text style={styles.label}>Height</Text>
                    <Text style={styles.value}>{pokemon.height}</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.label}>Weight</Text>
                    <Text style={styles.value}>{pokemon.weight}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Battle Stats</Text>

                {pokemon.stats.map((stat) => (
                    <StatBar key={stat.name} name={stat.name} value={stat.value} />
                ))}
            </View>
        </>
    );
}
// create resuable component 
function StatBar({ name, value }: { name: string; value: number }) {
    const maxStat = 160;
    const widthPercent = Math.min((value / maxStat) * 100, 100);

    return (
        <View style={styles.statRow}>
            <View style={styles.statHeader}>
                <Text style={styles.statName}>{formatStatName(name)}</Text>
                <Text style={styles.statValue}>{value}</Text>
            </View>

            <View style={styles.statTrack}>
                <View style={[styles.statFill, { width: `${widthPercent}%` }]} />
            </View>
        </View>
    );
}

function formatStatName(name: string) {
    if (name === "hp") {
        return "HP";
    }

    return name.replace("-", " ");
}

const styles = StyleSheet.create({
    androidModal: {
        flex: 1,
        backgroundColor: "transparent",
    },
    sheetContent: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    content: {
        gap: 12,
        padding: 20,
        paddingBottom: 120,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        textTransform: "capitalize",
        marginTop: 12,
    },
    image: {
        width: 160,
        height: 160,
        alignSelf: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
    },
    value: {
        fontSize: 16,
        textTransform: "capitalize",
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    statBox: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f1f1f1",
    },
    //--------------------
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    statRow: {
        gap: 6,
    },
    statHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statName: {
        fontSize: 14,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    statValue: {
        fontSize: 14,
        fontWeight: "700",
    },
    statTrack: {
        height: 10,
        borderRadius: 999,
        backgroundColor: "#e5e5e5",
        overflow: "hidden",
    },
    statFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#4ade80",
    },

    //=========================

    chooseButton: {
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#22c55e",
        alignItems: "center",
    },
    chooseButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },
    //--------------------------
    detailsContainer: {
        flex: 1,
    },
    scrollArea: {
        flex: 1,
    },

    footer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        marginBottom: 20,
        backgroundColor: "white",
    },


});