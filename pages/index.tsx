import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import { RichEditorParent } from "../components/RichEditorParent";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Slate Demo</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Slate Demo</h1>

        <RichEditorParent />
      </main>
    </div>
  );
};

export default Home;
