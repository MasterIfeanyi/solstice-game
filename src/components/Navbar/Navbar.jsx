import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>
        Solstice <span>Cipher</span>
      </h1>
      <p className={styles.subtitle}>
        Decode the cipher before the darkness consumes the light
      </p>
    </nav>
  );
}