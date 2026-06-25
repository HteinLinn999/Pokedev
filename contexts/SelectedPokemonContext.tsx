import { createContext, ReactNode, useContext, useState } from "react";
interface SelectedPokemon {
    name: string;
    image: string;
    types: string[];
    hp: number;
    attack: number;
    defense: number;
    speed: number;
}


interface SelectedPokemonContextValue {
    selectedPokemon: SelectedPokemon | null;
    choosePokemon: (pokemon: SelectedPokemon) => void;
    clearSelectedPokemon: () => void;
}

const SelectedPokemonContext = createContext<
    SelectedPokemonContextValue | undefined
>(undefined);


export function SelectedPokemonProvider({ children }: { children: ReactNode }) {

    const [selectedPokemon, setSelectedPokemon] = useState<SelectedPokemon | null>(null);

    function choosePokemon(pokemon: SelectedPokemon) {
        setSelectedPokemon(pokemon);
    }

    function clearSelectedPokemon() {
        setSelectedPokemon(null);
    }

    return (
        <SelectedPokemonContext.Provider
            value={
                {
                    selectedPokemon,
                    choosePokemon,
                    clearSelectedPokemon
                }
            }
        >
            {children}

        </SelectedPokemonContext.Provider>
    );
}

export function useSelectedPokemon(){
    const context = useContext(SelectedPokemonContext);

    if ( !context){
        throw new Error("useSelectedPokemon must be used inside SelectedPokemonProvider");
    }

    return context;
}