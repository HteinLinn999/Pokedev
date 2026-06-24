import { useLocalSearchParams, router, Stack } from "expo-router";
import { useMemo, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, Platform, View, ActivityIndicator, Image } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";

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
        return <DetailsContent pokemon={pokemon}
            loading={loading}
            name={name as string} />;
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
                >
                    <BottomSheetView style={styles.sheetContent}>
                        <DetailsContent pokemon={pokemon}
                            loading={loading}
                            name={name as string} />
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </>
    );
}

function DetailsContent(
    { pokemon, loading, name }:
        {
            pokemon: PokemonDetails | null,
            loading: boolean,
            name?: string
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
            <ScrollView contentContainerStyle={styles.content}>
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

            </ScrollView>

        </>
    );
}

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
        paddingBottom: 40,
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

});