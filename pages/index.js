import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Header from '../components/Header'
import Login from '../components/Login'
import Footer from '../components/Footer'

export default function Home() {

  return (
    <div className={styles.container}>
      <Header corInicial="transparent"
        changeColorOnScroll={{
          height: 100,
          color: "black"
        }} />
      <main className={styles.main}>
        <Login />
      </main>
      <Footer />
    </div>
  )
}
