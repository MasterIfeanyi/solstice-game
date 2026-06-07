"use client";

import Header from "../../components/Header/Header";
import SplitScreen from "../../components/SplitScreen/SplitScreen";

export default function Home() {
  const darkWidth = 70;
  const lightWidth = 30;

  return (
    <>
      <Header />
      <SplitScreen darkWidth={darkWidth} lightWidth={lightWidth} />
    </>
  );
}