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

type BattleResult = "playing" | "win" | "lose";


export default function Battle() {
    const { selectedPokemon } = useSelectedPokemon();

    const [enemyPokemon, setEnemyPokemon] = useState<BattlePokemon | null>(null);
    const [loading, setLoading] = useState(true);

    const [playerHp, setPlayerHp] = useState(0);
    const [enemyHp, setEnemyHp] = useState(0);
    const [battleLog, setBattleLog] = useState("Battle started!");
    const [battleLogs, setBattleLogs] = useState<string[]>([]);
    const [battleResult, setBattleResult] = useState<BattleResult>("playing");

    const [round, setRound] = useState(1);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const [playerMaxHp, setPlayerMaxHp] = useState(0);

    useEffect(() => {
        fetchRandomEnemy();
    }, []);

    useEffect(() => {
        if (selectedPokemon) {
            setPlayerHp(selectedPokemon.hp);
            setPlayerMaxHp(selectedPokemon.hp);
        }
    }, [selectedPokemon]);

    function scaleEnemyByRound(enemy: BattlePokemon, currentRound: number) {
        const bonus = Math.max(currentRound - 1, 0);

        return {
            ...enemy,
            hp: enemy.hp + bonus * 8,
            attack: enemy.attack + bonus * 3,
            defense: enemy.defense + bonus * 2,
            speed: enemy.speed + bonus * 2,
        };
    }


    async function fetchRandomEnemy(roundForEnemy = round) {

        try {
            setLoading(true);
            setBattleResult("playing");
            setBattleLog("Finding enemy Pokemon...");
            setBattleLogs([]);
            setEnemyPokemon(null);
            setEnemyHp(0);

            if (selectedPokemon) {
                setPlayerHp(selectedPokemon.hp);
            }
            const randomId = Math.floor(Math.random() * 151) + 1;
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

            if (!response.ok) {
                throw new Error("Enemy pokemon fetch failed");
            }
            const data = await response.json();

            const enemy: BattlePokemon = {
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
            };

            const scaledEnemy = scaleEnemyByRound(enemy, roundForEnemy);

            setEnemyPokemon(scaledEnemy);
            setEnemyHp(scaledEnemy.hp);
            setBattleLog(`${scaledEnemy.name} appeared!`);
            setBattleLogs([`${scaledEnemy.name} appeared!`]);

        } catch (error) {
            console.log("Fetch enemy error:", error);
            setBattleLog("Enemy Pokemon fetch failed.");
        } finally {
            setLoading(false);
        }
    }


    const typeAdvantages: { [key: string]: string[] } = {
        fire: ["grass", "ice", "bug", "steel"],
        water: ["fire", "ground", "rock"],
        grass: ["water", "ground", "rock"],
        electric: ["water", "flying"],
        ice: ["grass", "ground", "flying", "dragon"],
        fighting: ["normal", "ice", "rock", "dark", "steel"],
        poison: ["grass", "fairy"],
        ground: ["fire", "electric", "poison", "rock", "steel"],
        flying: ["grass", "fighting", "bug"],
        psychic: ["fighting", "poison"],
        bug: ["grass", "psychic", "dark"],
        rock: ["fire", "ice", "flying", "bug"],
        ghost: ["psychic", "ghost"],
        dragon: ["dragon"],
        dark: ["psychic", "ghost"],
        steel: ["ice", "rock", "fairy"],
        fairy: ["fighting", "dragon", "dark"],
    };

    function getTypeMultiplier(attacker: BattlePokemon, defender: BattlePokemon) {
        const attackerType = attacker.types[0];
        const defenderTypes = defender.types;

        const strongAgainst = typeAdvantages[attackerType] ?? [];
        const hasAdvantage = defenderTypes.some((type) => strongAgainst.includes(type));

        return hasAdvantage ? 1.5 : 1;
    }

    function calculateDamage(attacker: BattlePokemon, defender: BattlePokemon) {
        const baseDamage = attacker.attack - defender.defense / 2;
        const randomBonus = Math.floor(Math.random() * 8) + 4;
        const typeMultiplier = getTypeMultiplier(attacker, defender);
        const isCritical = Math.random() < 0.15;
        const criticalMultiplier = isCritical ? 1.8 : 1;

        const damage = Math.max(
            Math.floor((baseDamage / 4 + randomBonus) * typeMultiplier * criticalMultiplier), 5);

        return {
            damage,
            isCritical,
            isSuperEffective: typeMultiplier > 1,
        };
    }


    function addBattleLogs(newLogs: string[]) {
        setBattleLogs((currentLogs) => [...newLogs, ...currentLogs].slice(0, 6));
    }

    function attack() {
        if (!selectedPokemon || !enemyPokemon || battleResult !== "playing") {
            return;
        }

        const playerFirst = selectedPokemon.speed >= enemyPokemon.speed;

        const firstAttacker = playerFirst ? selectedPokemon : enemyPokemon;
        const firstDefender = playerFirst ? enemyPokemon : selectedPokemon;

        const firstAttack = calculateDamage(firstAttacker, firstDefender);

        const logs: string[] = [];

        logs.push(
            `${firstAttacker.name} attacked for ${firstAttack.damage} damage.`
        );

        if (firstAttack.isSuperEffective) {
            logs.push("It's super effective!");
        }

        if (firstAttack.isCritical) {
            logs.push("Critical hit!");
        }

        if (playerFirst) {
            const nextEnemyHp = Math.max(enemyHp - firstAttack.damage, 0);
            setEnemyHp(nextEnemyHp);

            if (nextEnemyHp <= 0) {
                setBattleResult("win");
                setWins((currentWins) => currentWins + 1);
                setBattleLog("You win!");
                addBattleLogs(["You win!", ...logs]);
                return;
            }

            const enemyAttack = calculateDamage(enemyPokemon, selectedPokemon);
            const nextPlayerHp = Math.max(playerHp - enemyAttack.damage, 0);

            logs.push(`${enemyPokemon.name} fought back for ${enemyAttack.damage} damage.`);

            if (enemyAttack.isSuperEffective) {
                logs.push("Enemy attack is super effective!");
            }

            if (enemyAttack.isCritical) {
                logs.push("Enemy got a critical hit!");
            }

            setPlayerHp(nextPlayerHp);

            if (nextPlayerHp <= 0) {
                setBattleResult("lose");
                setLosses((currentLosses) => currentLosses + 1);
                setBattleLog("You lose.");
                addBattleLogs(["You lose.", ...logs]);
                return;
            }

            setBattleLog(`${selectedPokemon.name} attacked first.`);
            addBattleLogs(logs);
            return;
        }

        const nextPlayerHp = Math.max(playerHp - firstAttack.damage, 0);
        setPlayerHp(nextPlayerHp);

        if (nextPlayerHp <= 0) {
            setBattleResult("lose");
            setLosses((currentLosses) => currentLosses + 1);
            setBattleLog("You lose.");
            addBattleLogs(["You lose.", ...logs]);
            return;
        }

        const playerAttack = calculateDamage(selectedPokemon, enemyPokemon);
        const nextEnemyHp = Math.max(enemyHp - playerAttack.damage, 0);

        logs.push(`${selectedPokemon.name} fought back for ${playerAttack.damage} damage.`);

        if (playerAttack.isSuperEffective) {
            logs.push("Your attack is super effective!");
        }

        if (playerAttack.isCritical) {
            logs.push("You got a critical hit!");
        }

        setEnemyHp(nextEnemyHp);

        if (nextEnemyHp <= 0) {
            setBattleResult("win");
            setWins((currentWins) => currentWins + 1);
            setBattleLog("You win!");
            addBattleLogs(["You win!", ...logs]);
            return;
        }

        setBattleLog(`${enemyPokemon.name} attacked first.`);
        addBattleLogs(logs);
    }

    function playAgain() {
        const nextRound = battleResult === "win" ? round + 1 : 1;

        if (battleResult === "win") {
            const healedHp = Math.min(playerHp + 20, playerMaxHp);
            setPlayerHp(healedHp);
        }

        if (battleResult === "lose" && selectedPokemon) {
            setPlayerHp(selectedPokemon.hp);
            setPlayerMaxHp(selectedPokemon.hp);
        }

        setRound(nextRound);
        fetchRandomEnemy(nextRound);
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

                <Pressable style={styles.backButton} onPress={() => fetchRandomEnemy()}>
                    <Text style={styles.backButtonText}>Retry</Text>
                </Pressable>
            </View>
        );
    }
    function resetGame() {
        if (!selectedPokemon) return;

        setRound(1);
        setWins(0);
        setLosses(0);
        setPlayerHp(selectedPokemon.hp);
        setPlayerMaxHp(selectedPokemon.hp);
        setBattleResult("playing");
        setBattleLogs([]);
        fetchRandomEnemy(1);
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Battle Arena</Text>

            <View style={styles.scoreBoard}>
                <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Round</Text>
                    <Text style={styles.scoreValue}>{round}</Text>
                </View>

                <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Wins</Text>
                    <Text style={styles.scoreValue}>{wins}</Text>
                </View>

                <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Losses</Text>
                    <Text style={styles.scoreValue}>{losses}</Text>
                </View>
            </View>

            <PokemonBattleCard
                label="Enemy"
                pokemon={enemyPokemon}
                currentHp={enemyHp} />

            <View style={styles.logBox}>
                <Text style={styles.logText}>{battleLog}</Text>
            </View>
            {battleLogs?.length > 0 && (
                <View style={styles.historyBox}>
                    <Text style={styles.historyTitle}>Battle History</Text>

                    {battleLogs.map((log, index) => (
                        <Text key={`${log}-${index}`} style={styles.historyText}>
                            {log}
                        </Text>
                    ))}
                </View>
            )}

            <Text style={styles.vsText}>VS</Text>

            <PokemonBattleCard
                label="You"
                pokemon={selectedPokemon}
                currentHp={playerHp} />

            {battleResult === "playing" ? (
                <Pressable style={styles.actionButton} onPress={attack}>
                    <Text style={styles.actionButtonText}>Attack</Text>
                </Pressable>
            ) : (
                <View style={styles.resultActions}>
                    <Text style={styles.resultText}>
                        {battleResult === "win" ? "You Win!" : "You Lose!"}
                    </Text>

                    <Pressable style={styles.actionButton} onPress={playAgain}>
                        <Text style={styles.actionButtonText}>
                            {battleResult === "win" ? "Next Round" : "Try Again"}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.resetButton} onPress={resetGame}>
                        <Text style={styles.resetButtonText}>Reset Game</Text>
                    </Pressable>

                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Back Home</Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );
}


function PokemonBattleCard({
    label,
    pokemon,
    currentHp,
}: {
    label: string;
    pokemon: BattlePokemon;
    currentHp: number;
}) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.name}>{pokemon.name}</Text>

            <Image source={{ uri: pokemon.image }} style={styles.image} />

            <Text style={styles.type}>{pokemon.types.join(", ")}</Text>

            <HpBar currentHp={currentHp} maxHp={pokemon.hp} />

            <View style={styles.statsRow}>
                <Text style={styles.statText}>ATK {pokemon.attack}</Text>
                <Text style={styles.statText}>DEF {pokemon.defense}</Text>
                <Text style={styles.statText}>SPD {pokemon.speed}</Text>
            </View>
        </View>
    );
}
function HpBar({ currentHp, maxHp }:
    { currentHp: number; maxHp: number }) {

    const widthPercent = Math.max((currentHp / maxHp) * 100, 0);

    return (
        <View style={styles.hpContainer}>
            <View style={styles.hpHeader}>
                <Text style={styles.hpLabel}>HP</Text>
                <Text style={styles.hpValue}>{currentHp} / {maxHp}</Text>
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

    //-----------------
    logBox: {
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#111827",
    },
    logText: {
        color: "white",
        fontWeight: "700",
        textAlign: "center",
        textTransform: "capitalize",
    },
    resultActions: {
        gap: 12,
    },
    resultText: {
        fontSize: 24,
        fontWeight: "900",
        textAlign: "center",
    },
    //===============
    historyBox: {
        gap: 6,
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: "800",
    },
    historyText: {
        fontSize: 14,
        color: "#374151",
        textTransform: "capitalize",
    },

    //-------------------
    scoreBoard: {
        flexDirection: "row",
        gap: 10,
    },
    scoreItem: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#111827",
        alignItems: "center",
    },
    scoreLabel: {
        color: "#9ca3af",
        fontSize: 13,
        fontWeight: "700",
    },
    scoreValue: {
        color: "white",
        fontSize: 22,
        fontWeight: "900",
    },
    resetButton: {
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#e5e7eb",
        alignItems: "center",
    },
    resetButtonText: {
        color: "#111827",
        fontWeight: "800",
    },

})