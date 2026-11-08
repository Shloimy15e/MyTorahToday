import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "./DynamiqCredit.module.css";

export default function DynamiqCredit() {
  const label = "Built by";

  return (
    <a
      href="https://www.dynamiq.dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Built by Dynamiq Solutions"
      className={styles.credit}
    >
      <span aria-hidden="true" className={styles.caption}>
        {Array.from(label).map((letter, index) => (
          <span key={index} className={styles.cell}>
            <span className={styles.reserve}>{letter}</span>
            <span
              className={styles.letter}
              style={{
                "--letter-in": `${index * 18}ms`,
                "--letter-out": `${(label.length - 1 - index) * 18}ms`,
              } as CSSProperties}
            >{letter}</span>
          </span>
        ))}
      </span>
      <Image src="/images/dynamiq-horizontal.svg" alt="" width={1600} height={520} className={styles.horizontal} />
      <Image src="/images/dynamiq-stacked.svg" alt="" width={1200} height={1100} className={styles.stacked} />
    </a>
  );
}
