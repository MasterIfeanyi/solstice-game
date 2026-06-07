"use client";

import { useGame } from "../../context/GameContext";
import Header from "../../components/Header/Header";
import SplitScreen from "../../components/SplitScreen/SplitScreen";
import CipherModal from "../../components/CipherModal/CipherModal";

export default function Home() {
  const { darkWidth, lightWidth } = useGame();

  return (
    <>
      <Header />
      <SplitScreen darkWidth={darkWidth} lightWidth={lightWidth} />
      <CipherModal />
    </>
  );
}