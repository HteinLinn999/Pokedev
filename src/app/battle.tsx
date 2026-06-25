import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSelectedPokemon } from "../../contexts/SelectedPokemonContext";

interface BattlePokemon {
    name: string;
    image: string;
    types: string[];
    hp: number;
    attack: number;
    defense: number;
    speed: number;
}

export default function Battle() {
    const { selectedPokemon } = useSelectedPokemon();

    const [enemyPokemon, setEnemyPokemon] = useState<BattlePokemon | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRandomEnemy();
    }, []);


    async function fetchRandomEnemy() {
        try {
            setLoading(true);
            const randomId = Math.floor(Math.random() * 151) + 1;
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

            if (!response.ok) {
                throw new Error("Enemy pokemon fetch failed");
            }
            const data = await response.json();

            setEnemyPokemon({
                name: data.name,
                image: data.sprites.front_default,
                types: data.types.map((item: any) => item.type.name),
                hp: data.stats.find((item: any) => item.stat.name === "hp")?.base_stat ?? 50,
                attack:
                    data.stats.find((item: any) => item.stat.name === "attack")
                        ?.base_stat ?? 50,
                defense:
                    data.stats.find((item: any) => item.stat.name === "defense")
                        ?.base_stat ?? 50,
                speed:
                    data.stats.find((item: any) => item.stat.name === "speed")
                        ?.base_stat ?? 50,
            });

        } catch (error) {
            console.log("Fetch enemy error:", error);
        } finally {
            setLoading(false);
        }
    }

    if (!selectedPokemon) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyTitle}>No Pokemon selected</Text>
                <Text style={styles.emptyText}>Choose a Pokemon first.</Text>

                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
                <Text>Finding enemy Pokemon...</Text>
            </View>
        );
    }

    if (!enemyPokemon) {
        return (
            <View style={styles.centerContainer}>
                <Text>Enemy Pokemon not found.</Text>

                <Pressable style={styles.backButton} onPress={fetchRandomEnemy}>
                    <Text style={styles.backButtonText}>Retry</Text>
                </Pressable>
            </View>
        );
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Battle Arena</Text>

            <PokemonBattleCard label="Enemy" pokemon={enemyPokemon} />

            <Text style={styles.vsText}>VS</Text>

            <PokemonBattleCard label="You" pokemon={selectedPokemon} />

            <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Attack</Text>
            </Pressable>
        </ScrollView>
    );
}


function PokemonBattleCard({
  label,
  pokemon,
}: {
  label: string;
  pokemon: BattlePokemon;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.name}>{pokemon.name}</Text>

      <Image source={{ uri: pokemon.image }} style={styles.image} />

      <Text style={styles.type}>{pokemon.types.join(", ")}</Text>

      <HpBar hp={pokemon.hp} />

      <View style={styles.statsRow}>
        <Text style={styles.statText}>ATK {pokemon.attack}</Text>
        <Text style={styles.statText}>DEF {pokemon.defense}</Text>
        <Text style={styles.statText}>SPD {pokemon.speed}</Text>
      </View>
    </View>
  );
}
function HpBar({ hp }: { hp: number }) {
  const maxHp = 160;
  const widthPercent = Math.min((hp / maxHp) * 100, 100);

  return (
    <View style={styles.hpContainer}>
      <View style={styles.hpHeader}>
        <Text style={styles.hpLabel}>HP</Text>
        <Text style={styles.hpValue}>{hp}</Text>
      </View>

      <View style={styles.hpTrack}>
        <View style={[styles.hpFill, { width: `${widthPercent}%` }]} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
        gap: 18,
        padding: 20,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
    },
    card: {
        padding: 18,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
        gap: 10,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#6b7280",
    },
    name: {
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
        textTransform: "capitalize",
    },
    image: {
        width: 150,
        height: 150,
        alignSelf: "center",
    },
    type: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4b5563",
        textAlign: "center",
        textTransform: "capitalize",
    },
    hpContainer: {
        gap: 6,
    },
    hpHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    hpLabel: {
        fontWeight: "800",
    },
    hpValue: {
        fontWeight: "800",
    },
    hpTrack: {
        height: 12,
        borderRadius: 999,
        backgroundColor: "#e5e7eb",
        overflow: "hidden",
    },
    hpFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#22c55e",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statText: {
        fontWeight: "700",
    },
    vsText: {
        fontSize: 24,
        fontWeight: "900",
        textAlign: "center",
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#ef4444",
        alignItems: "center",
    },
    actionButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "800",
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "800",
    },
    emptyText: {
        color: "#6b7280",
    },
    backButton: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#111827",
    },
    backButtonText: {
        color: "white",
        fontWeight: "700",
    },
})