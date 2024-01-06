import CanvasComponent from './canvas';
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <CanvasComponent/>
    </main>
  )
}
