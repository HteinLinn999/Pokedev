import type { SelectedPokemon } from "@/types/pokemon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";


interface SelectedPokemonContextValue {
    selectedPokemon: SelectedPokemon | null;
    loadingSelectedPokemon: boolean;
    choosePokemon: (pokemon: SelectedPokemon) => Promise<void>;
    clearSelectedPokemon: () => Promise<void>;
}


const SelectedPokemonContext = createContext<
    SelectedPokemonContextValue | undefined
>(undefined);

const SELECTED_POKEMON_STORAGE_KEY = "selected_pokemon";

export function SelectedPokemonProvider({ children }: { children: ReactNode }) {

    const [selectedPokemon, setSelectedPokemon] = useState<SelectedPokemon | null>(null);
    const [loadingSelectedPokemon, setLoadingSelectedPokemon] = useState(true);

    useEffect(() => {
        loadSelectedPokemon();
    }, []);

    async function loadSelectedPokemon() {
        try {
            const savedPokemon = await AsyncStorage.getItem(
                SELECTED_POKEMON_STORAGE_KEY
            );

            if (savedPokemon) {
                setSelectedPokemon(JSON.parse(savedPokemon));
            }
        } catch (error) {
            console.log("Load selected pokemon error:", error);
        } finally {
            setLoadingSelectedPokemon(false);
        }
    }

    const choosePokemon = useCallback(async (pokemon: SelectedPokemon) => {
        setSelectedPokemon(pokemon);

        try {
            await AsyncStorage.setItem(
                SELECTED_POKEMON_STORAGE_KEY,
                JSON.stringify(pokemon)
            );
        } catch (error) {
            console.log("Save selected pokemon error:", error);
        }
    }, []);

    const clearSelectedPokemon = useCallback(async () => {
        setSelectedPokemon(null);
        try {
            await AsyncStorage.removeItem(SELECTED_POKEMON_STORAGE_KEY);
        } catch (error) {
            console.log("Clear selected pokemon error:", error);
        }
    }, []);

    const value = useMemo(
        () => ({
            selectedPokemon,
            choosePokemon,
            clearSelectedPokemon,
            loadingSelectedPokemon,
        }),
        [selectedPokemon, choosePokemon, clearSelectedPokemon, loadingSelectedPokemon]
    );

    return (
        <SelectedPokemonContext.Provider value={value}>
            {children}

        </SelectedPokemonContext.Provider>
    );
}

export function useSelectedPokemon() {
    const context = useContext(SelectedPokemonContext);

    if (!context) {
        throw new Error("useSelectedPokemon must be used inside SelectedPokemonProvider");
    }

    return context;
}