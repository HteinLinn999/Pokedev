export interface PokemonTypeSlot {
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonListItem {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonTypeSlot[];
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonDetails {
  name: string;
  height: number;
  weight: number;
  image: string;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
}

export interface BattlePokemon {
  name: string;
  image: string;
  types: string[];
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface SelectedPokemon extends BattlePokemon {}

interface PokeAPITypeEntry {
  type: { name: string };
}

interface PokeAPIAbilityEntry {
  ability: { name: string };
}

interface PokeAPIStatEntry {
  stat: { name: string };
  base_stat: number;
}

export interface PokeAPIPokemon {
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    back_default: string | null;
  };
  types: PokeAPITypeEntry[];
  abilities: PokeAPIAbilityEntry[];
  stats: PokeAPIStatEntry[];
}

export interface PokeAPIListResult {
  name: string;
  url: string;
}

export interface PokeAPIListResponse {
  results: PokeAPIListResult[];
  next: string | null;
}
