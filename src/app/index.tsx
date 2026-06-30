import { colorByType, PAGE_SIZE } from "@/constants/pokemonTypes";
import { fetchPokemonPage } from "@/services/pokeapi";
import type { PokemonListItem } from "@/types/pokemon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSelectedPokemon } from "../../contexts/SelectedPokemonContext";

const FAVORITE_STORAGE_KEY = "favorite_pokemon_names";

export default function Index() {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePokemon, setHasMorePokemon] = useState(true);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [favoritePokemonNames, setFavoritePokemonNames] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);




  const { selectedPokemon, clearSelectedPokemon, loadingSelectedPokemon } = useSelectedPokemon();

  //  console.log("pokemon[0]:", JSON.stringify(pokemons[0], null, 2));

  useEffect(() => {
    fetchPokemon(0, false);
    loadFavoritePokemonNames();
  }, []);




  async function fetchPokemon(nextOffset = 0, shouldAppend = false) {
    try {
      setErrorMessage("");
      if (shouldAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const { pokemons: fetchedPokemons, hasMore } = await fetchPokemonPage(
        PAGE_SIZE,
        nextOffset
      );

      if (shouldAppend) {
        setPokemons((currentPokemons) => [
          ...currentPokemons,
          ...fetchedPokemons,
        ]);
      } else {
        setPokemons(fetchedPokemons);
      }

      setOffset(nextOffset + PAGE_SIZE);
      setHasMorePokemon(hasMore);
    } catch (error) {
      console.error("Fetch Pokemon error:", error);
      setErrorMessage("Cannot fetch Pokemon data. Please retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    setOffset(0);
    setHasMorePokemon(true);
    fetchPokemon(0, false);
  }

  function loadMorePokemon() {
    if (loadingMore || !hasMorePokemon) {
      return;
    }
    fetchPokemon(offset, true);
  }

  async function loadFavoritePokemonNames() {
    try {
      const savedFavorites = await AsyncStorage.getItem(FAVORITE_STORAGE_KEY);

      if (savedFavorites) {
        setFavoritePokemonNames(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.log("Load favorite pokemon error:", error);
    }
  }

  async function saveFavoritePokemonNames(nextFavorites: string[]) {
    try {
      await AsyncStorage.setItem(
        FAVORITE_STORAGE_KEY,
        JSON.stringify(nextFavorites)
      );
    } catch (error) {
      console.log("Save favorite pokemon error:", error);
    }
  }

  function toggleFavoritePokemon(name: string) {
    setFavoritePokemonNames((currentFavorites) => {
      const isFavorite = currentFavorites.includes(name);

      const nextFavorites = isFavorite
        ? currentFavorites.filter((pokemonName) => pokemonName !== name)
        : [...currentFavorites, name];

      saveFavoritePokemonNames(nextFavorites);

      return nextFavorites;
    });
  }


  const pokemonTypes = [
    "all",
    ...Array.from(
      new Set(
        pokemons.flatMap((pokemon) =>
          pokemon.types.map((item) => item.type.name)
        )
      )
    ),
  ];

  const filteredPokemons = pokemons.filter((pokemon) => {
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesType =
      selectedType === "all" ||
      pokemon.types.some((item) => item.type.name === selectedType);

    const matchesFavorite =
      !showFavoritesOnly || favoritePokemonNames.includes(pokemon.name);

    return matchesSearch && matchesType && matchesFavorite;
  });



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

      <View style={styles.filterSection}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search Pokemon"
          style={styles.searchInput}
          autoCapitalize="none"
        />

        <Pressable
          onPress={() => setShowFavoritesOnly((currentValue) => !currentValue)}
          style={[
            styles.favoriteFilterButton,
            showFavoritesOnly && styles.favoriteFilterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.favoriteFilterText,
              showFavoritesOnly && styles.favoriteFilterTextActive,
            ]}
          >
            {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
          </Text>
        </Pressable>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFilterRow}
        >
          {pokemonTypes.map((type) => {
            const isSelected = selectedType === type;

            return (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.typeFilterButton,
                  isSelected && styles.typeFilterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeFilterText,
                    isSelected && styles.typeFilterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {filteredPokemons.length === 0 && (
        <View style={styles.emptyListBox}>
          <Text style={styles.emptyListTitle}>No Pokemon found</Text>
          <Text style={styles.emptyListText}>Try another name or type.</Text>
        </View>
      )}
      {
        //pokemons.map((pokemon) => {
        filteredPokemons.map((pokemon) => {

          const mainType = pokemon.types[0].type.name;
          const backgroundColor = colorByType[mainType] + "50";
          const isFavorite = favoritePokemonNames.includes(pokemon.name);

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

              {/* <Text style={styles.name}>{pokemon.name}</Text> */}
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{pokemon.name}</Text>

                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    toggleFavoritePokemon(pokemon.name);
                  }}
                  style={[
                    styles.favoriteButton,
                    isFavorite && styles.favoriteButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.favoriteButtonText,
                      isFavorite && styles.favoriteButtonTextActive,
                    ]}
                  >
                    {isFavorite ? "Fav" : "Save"}
                  </Text>
                </Pressable>
              </View>
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
      {/* {hasMorePokemon && filteredPokemons.length > 0 && ( */}
      {hasMorePokemon && (
        <Pressable
          style={styles.loadMoreButton}
          onPress={loadMorePokemon}
          disabled={loadingMore}
        >
          <Text style={styles.loadMoreButtonText}>
            {loadingMore ? "Loading..." : "Load More"}
          </Text>
        </Pressable>
      )}
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
  //----------------
  filterSection: {
    gap: 12,
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    fontSize: 16,
  },
  typeFilterRow: {
    gap: 8,
  },
  typeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  typeFilterButtonActive: {
    backgroundColor: "#111827",
  },
  typeFilterText: {
    fontWeight: "700",
    color: "#374151",
    textTransform: "capitalize",
  },
  typeFilterTextActive: {
    color: "white",
  },
  emptyListBox: {
    gap: 6,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  emptyListTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyListText: {
    color: "#6b7280",
  },
  //=====================
  loadMoreButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    marginBottom: 20,
  },
  loadMoreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  //---------------------
  favoriteFilterButton: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  favoriteFilterButtonActive: {
    backgroundColor: "#f59e0b",
  },
  favoriteFilterText: {
    fontWeight: "800",
    color: "#374151",
  },
  favoriteFilterTextActive: {
    color: "white",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  favoriteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  favoriteButtonActive: {
    backgroundColor: "#f59e0b",
  },
  favoriteButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#374151",
  },
  favoriteButtonTextActive: {
    color: "white",
  },


});

