"use client";

import { useEffect } from "react";
import { useGame } from "../../context/GameContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import styles from "./CipherModal.module.css";

export default function CipherModal() {
    const {
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
    } = useGame();

    useEffect(() => {
        if (!gameOver) {
            fetchNewWord();
        }
    }, [fetchNewWord, gameOver]);
    function handleKeyDown(e) {
        if (e.key === "Enter") submitGuess();
    }

    function handleNextWord() {
        fetchNewWord();
    }

    return (
        <Modal isShown={true}>
            <div className={styles.wrapper}>
                <div className={styles.card}>

                    {gameOver ? (
                        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <p className={styles.label}>Game Over</p>
                            <p style={{ color: winner === "light" ? "#FFC107" : "#ff6b6b", fontSize: "1.5rem", fontWeight: 700, marginBottom: 0 }}>
                                {winner === "light" ? "The light has won." : "The darkness has consumed everything."}
                            </p>
                            <Button
                                variant="primary"
                                size="large"
                                onClick={resetGame}
                            >
                                Restart Game
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className={styles.label}>Decode the cipher</p>
                                {isLoading && <p className={styles.loading}>Generating cipher...</p>}
                                {error && <p className={styles.error}>Failed to load word. Try refreshing.</p>}
                                {!isLoading && !error && (
                                    <p className={styles.cipherText}>{cipherText}</p>
                                )}
                            </div>

                            <div className={styles.inputRow}>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Type your answer"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading || !!error}
                                    autoFocus
                                />
                                <Button
                                    variant="game"
                                    size="large"
                                    onClick={submitGuess}
                                    disabled={isLoading || !!error || !guess.trim()}
                                >
                                    Submit
                                </Button>
                            </div>

                            {feedback === "correct" && (
                                <div>
                                    <p className={`${styles.feedback} ${styles.correct}`}>
                                        Correct! The light grows stronger.
                                    </p>
                                    <Button
                                        variant="game"
                                        size="large"
                                        onClick={handleNextWord}
                                        className={styles.nextBtn}
                                    >
                                        Next Word
                                    </Button>
                                </div>
                            )}

                            {feedback === "wrong" && (
                                <div>
                                    <p className={`${styles.feedback} ${styles.wrong}`}>
                                        Wrong. The darkness creeps closer.
                                    </p>
                                    <Button
                                        variant="game"
                                        size="large"
                                        onClick={handleNextWord}
                                        className={styles.nextBtn}
                                    >
                                        Try Another Word
                                    </Button>
                                </div>
                            )}

                            <p className={styles.hint}>
                                Caesar cipher — each letter is shifted by 3 positions
                            </p>
                        </>
                    )}

                </div>
            </div>
        </Modal>
    );
}