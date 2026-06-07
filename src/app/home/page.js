"use client";

import Header from "../../components/Header/Header";

export default function Home() {
  const darkWidth = 50;
  const lightWidth = 50;

  return (
    <>
      <Header />
      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        <div style={{ width: `${darkWidth}%`, height: "100%", backgroundColor: "var(--game-dark)", transition: "width 0.6s ease" }} />
        <div style={{ width: `${lightWidth}%`, height: "100%", backgroundColor: "var(--game-light)", transition: "width 0.6s ease" }} />
      </div>
    </>
  );
}