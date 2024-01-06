import DrawingApp from './drawing';
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <DrawingApp/>
    </main>
  )
}
