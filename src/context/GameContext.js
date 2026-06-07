"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getStoredItem, storeItem, clearItems } from "../utils/storage";

const GameContext = createContext(null);

const STEP = 10;
const STORAGE_KEYS = {
  darkWidth: "darkWidth",
  lightWidth: "lightWidth",
};

export function GameProvider({ children }) {
  const [darkWidth, setDarkWidth] = useState(() => getStoredItem(STORAGE_KEYS.darkWidth, 50));
  const [lightWidth, setLightWidth] = useState(() => getStoredItem(STORAGE_KEYS.lightWidth, 50));
  const [secretWord, setSecretWord] = useState("");
  const [cipherText, setCipherText] = useState("");
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    storeItem(STORAGE_KEYS.darkWidth, darkWidth);
    storeItem(STORAGE_KEYS.lightWidth, lightWidth);
  }, [darkWidth, lightWidth]);

  const fetchNewWord = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/word");

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch word.");
      }

      const data = await res.json();
      setSecretWord(data.word);
      setCipherText(data.cipher);
      setGuess("");
      setFeedback(null);
    } catch (err) {
      console.error("fetchNewWord error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function submitGuess() {
    if (!guess.trim() || !secretWord) return;

    const isCorrect = guess.trim().toUpperCase() === secretWord;

    if (isCorrect) {
      const newLight = Math.min(lightWidth + STEP, 100);
      const newDark = 100 - newLight;
      setLightWidth(newLight);
      setDarkWidth(newDark);
      setFeedback("correct");

      if (newLight >= 100) {
        setGameOver(true);
        setWinner("light");
        return;
      }

    } else {
      const newDark = Math.min(darkWidth + STEP, 100);
      const newLight = 100 - newDark;
      setDarkWidth(newDark);
      setLightWidth(newLight);
      setFeedback("wrong");

      if (newDark >= 100) {
        setGameOver(true);
        setWinner("dark");
        return;
      }
    }
  }

  function resetGame() {
    setDarkWidth(70);
    setLightWidth(30);
    clearItems(Object.values(STORAGE_KEYS));
    setSecretWord("");
    setCipherText("");
    setGuess("");
    setFeedback(null);
    setGameOver(false);
    setWinner(null);
    setError(null);
  }

  return (
    <GameContext.Provider value={{
      darkWidth,
      lightWidth,
      secretWord,
      cipherText,
      guess,
      setGuess,
      feedback,
      gameOver,
      winner,
      isLoading,
      error,
      fetchNewWord,
      submitGuess,
      resetGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside a GameProvider");
  }
  return context;
}