import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, Image } from "react-native";

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

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  console.log("pokemon[0]:", JSON.stringify(pokemons[0], null, 2));

  useEffect(() => {
    // fetch data from pokeapi 
    fetchPokemon();
  }, []);

  async function fetchPokemon() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");

      const data = await response.json();

      // console.log("Fetched Pokemon data:", data);

      //fetch detailed info for each Pokemon in parallel
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: PokemonAPI) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types
          }
        })
      );

      //console.log("Pokemon data:", data);
      //setPokemons(data.results);

      //   console.log("Detailed Pokemon data:", detailedPokemons);
      setPokemons(detailedPokemons);

    } catch (error) {
      console.error("Fetch Pokemon error:", error);
    }
  }

  return (
    <ScrollView >
      {
        pokemons.map((pokemon) => {
          return (
            <View key={pokemon.name}>
              <Text style={styles.name}>{pokemon.name}</Text>
              <Text style={styles.type}>
                {pokemon.types.map((type) => type.type.name).join(", ")}
              </Text>
              <View style={{
                flexDirection: "row-reverse",
                justifyContent: "space-around"
              }}>
                <Image source={{ uri: pokemon.image }}
                  style={{ width: 150, height: 150 }} />

                <Image source={{ uri: pokemon.imageBack }}
                  style={{ width: 150, height: 150 }} />

              </View>
            </View>
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
  },
  type: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray"
  }

});

