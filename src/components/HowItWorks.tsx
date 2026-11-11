import styles from './HowItWorks.module.css'

const STEPS = [
  {
    title: 'Ort wählen',
    text: 'Suche eine von 52 Städten oder verwende deinen aktuellen Standort.',
  },
  {
    title: '3D-Szene erkunden',
    text: 'Drehe, kippe und zoome die Landschaft. Wolken, Niederschlag, Nebel und Tageslicht entsprechen der Vorhersage.',
  },
  {
    title: 'Zeitleiste bewegen',
    text: 'Schiebe den Regler durch die nächsten 48 Stunden oder lass die Vorhersage wie einen Film ablaufen.',
  },
]

/** The three steps that explain how to use the app. */
export function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="how-it-works-title">
      <h2 id="how-it-works-title" className={styles.title}>
        So funktioniert es
      </h2>
      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
