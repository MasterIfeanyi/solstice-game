import PropTypes from "prop-types";
import styles from "./SplitScreen.module.css";

export default function SplitScreen({ darkWidth, lightWidth }) {
  return (
    <div className={styles.container}>
      <div className={styles.dark} style={{ width: `${darkWidth}%` }} />
      <div className={styles.light} style={{ width: `${lightWidth}%` }} />
    </div>
  );
}

SplitScreen.propTypes = {
  darkWidth: PropTypes.number.isRequired,
  lightWidth: PropTypes.number.isRequired,
};