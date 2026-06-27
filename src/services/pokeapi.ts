import type {
  BattlePokemon,
  PokeAPIListResponse,
  PokeAPIPokemon,
  PokemonDetails,
  PokemonListItem,
} from "@/types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export function mapToListItem(data: PokeAPIPokemon): PokemonListItem {
  return {
    name: data.name,
    image: data.sprites.front_default,
    imageBack: data.sprites.back_default ?? "",
    types: data.types.map((entry) => ({
      type: { name: entry.type.name, url: "" },
    })),
  };
}

export function mapToDetails(data: PokeAPIPokemon): PokemonDetails {
  return {
    name: data.name,
    height: data.height,
    weight: data.weight,
    image: data.sprites.front_default,
    types: data.types.map((entry) => entry.type.name),
    abilities: data.abilities.map((entry) => entry.ability.name),
    stats: data.stats.map((entry) => ({
      name: entry.stat.name,
      value: entry.base_stat,
    })),
  };
}

export function mapToBattlePokemon(data: PokeAPIPokemon): BattlePokemon {
  const getStat = (statName: string) =>
    data.stats.find((entry) => entry.stat.name === statName)?.base_stat ?? 50;

  return {
    name: data.name,
    image: data.sprites.front_default,
    types: data.types.map((entry) => entry.type.name),
    hp: getStat("hp"),
    attack: getStat("attack"),
    defense: getStat("defense"),
    speed: getStat("speed"),
  };
}

export async function fetchPokemonList(limit: number, offset: number) {
  return fetchJson<PokeAPIListResponse>(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    "Pokemon list fetch failed"
  );
}

export async function fetchPokemonByUrl(url: string, name: string) {
  return fetchJson<PokeAPIPokemon>(url, `Fetch failed for ${name}`);
}

export async function fetchPokemonByName(name: string) {
  return fetchJson<PokeAPIPokemon>(
    `${BASE_URL}/pokemon/${name}`,
    "Pokemon detail fetch failed"
  );
}

export async function fetchPokemonById(id: number) {
  return fetchJson<PokeAPIPokemon>(
    `${BASE_URL}/pokemon/${id}`,
    "Enemy pokemon fetch failed"
  );
}

export async function fetchPokemonPage(
  limit: number,
  offset: number
): Promise<{ pokemons: PokemonListItem[]; hasMore: boolean }> {
  const data = await fetchPokemonList(limit, offset);

  const pokemons = await Promise.all(
    data.results.map(async (pokemon) => {
      const details = await fetchPokemonByUrl(pokemon.url, pokemon.name);
      return mapToListItem(details);
    })
  );

  return {
    pokemons,
    hasMore: Boolean(data.next),
  };
}
