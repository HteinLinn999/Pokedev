import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelectedPokemon } from "../../contexts/SelectedPokemonContext";

interface PokemonAPI {
  name: string;
  url: string;
}
interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  }
}

const colorByType: { [key: string]: string } = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD"
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { selectedPokemon, clearSelectedPokemon, loadingSelectedPokemon } = useSelectedPokemon();

  //  console.log("pokemon[0]:", JSON.stringify(pokemons[0], null, 2));

  useEffect(() => {
    // fetch data from pokeapi 
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");

      if (!response.ok) {
        throw new Error("Pokemon list fetch failed");
      }

      const data = await response.json();
      // console.log("Fetched Pokemon data:", data);

      //fetch detailed info for each Pokemon in parallel
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: PokemonAPI) => {
          const res = await fetch(pokemon.url);

          if (!res.ok) {
            throw new Error(`Fetch failed for ${pokemon.name}`);
          }
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,

          }
        })
      );

      //console.log("Pokemon data:", data);
      //setPokemons(data.results);

      //   console.log("Detailed Pokemon data:", detailedPokemons);
      setPokemons(detailedPokemons);

    } catch (error) {
      console.error("Fetch Pokemon error:", error);
      setErrorMessage("Cannot fetch pokemon data , ။Please retry again");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchPokemon();
  }
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Pokemon...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Text style={styles.hintText}>အောက်ကိုဆွဲပြီး refresh ပြန်လုပ်နိုင်ပါတယ်။</Text>
      </ScrollView>
    );
  }


  return (
    <ScrollView contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing}
          onRefresh={onRefresh} />
      }
    >

      {loadingSelectedPokemon && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedLabel}>Loading selected Pokemon...</Text>
        </View>
      )}

      {!loadingSelectedPokemon && selectedPokemon && (
        <View style={styles.selectedCard}>
          <Image source={{ uri: selectedPokemon.image }} style={styles.selectedImage} />

          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Your Pokemon</Text>
            <Text style={styles.selectedName}>{selectedPokemon.name}</Text>
            <Text style={styles.selectedType}>
              {selectedPokemon.types.join(", ")}
            </Text>
          </View>
          <View style={{ gap: 15 }}>
            <Pressable
              onPress={() => router.push("/battle")}
              style={styles.battleButton}
            >
              <Text style={styles.battleButtonText}>Start Battle</Text>
            </Pressable>
            <Pressable onPress={clearSelectedPokemon} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Change</Text>
            </Pressable>
          </View>


        </View>
      )}
      {
        pokemons.map((pokemon) => {

          const mainType = pokemon.types[0].type.name;
          const backgroundColor = colorByType[mainType] + "50";

          return (
            <Pressable key={pokemon.name}
              onPress={() => {
                router.push({
                  pathname: "/details",
                  params: {
                    name: pokemon.name,
                  }
                });
              }}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor,
                  opacity: pressed ? 0.7 : 1,
                }
              ]

              }

            >

              <Text style={styles.name}>{pokemon.name}</Text>
              <Text style={styles.type}>
                {pokemon.types.map((type) => type.type.name).join(", ")}
              </Text>
              <View style={styles.imageRow}>
                <Image source={{ uri: pokemon.image }} style={{ width: 150, height: 150 }} />
                <Image source={{ uri: pokemon.imageBack }} style={{ width: 150, height: 150 }} />

              </View>

            </Pressable>

          )
        })
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
  },
  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray",
    textAlign: "center",
    textTransform: "capitalize",
  },
  //****************/
  centerContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "gray",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  hintText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  listContent: {
    gap: 20,
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  //---------------
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#111827",
  },
  selectedImage: {
    width: 70,
    height: 70,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  selectedName: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textTransform: "capitalize",
  },
  selectedType: {
    fontSize: 14,
    color: "#d1d5db",
    textTransform: "capitalize",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  clearButtonText: {
    color: "white",
    fontWeight: "700",
  },
  //=========================
  selectedActions: {
    gap: 8,
  },
  battleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#22c55e",
  },
  battleButtonText: {
    color: "white",
    fontWeight: "700",
  },


});

