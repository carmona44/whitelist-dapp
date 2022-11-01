import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };

  const addAddressToWhitelist = async () => {

    try {

      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.addAddressToWhitelist();

      setLoading(true);
      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);

    } catch (err) {
      console.error(err);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            ¡Gracias por unirte! Pronto tendrás más noticias 🔜
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Cargando...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Únete a la Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Conecta tu wallet
        </button>
      );
    }
  };

  const renderJoinedCount = () => {
    if (walletConnected) {
      return (
        <div className={styles.description}>
          {numberOfWhitelisted}/4 personas ya se han unido a la Whitelist.
        </div>
      );
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>BuenaChica 🐶 Whitelist</title>
        <meta name="description" content="Whitelist-BuenaChica" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>¡Bienvenido a la colección NFT BuenaChica 🐶!</h1>
          <div className={styles.description}>
            BuenaChica 🐶 es una colección de NFTs que hace referencia
            a una gran mascota y que es símbolo de una gran amistad.
            Los holders de estos NFTs podrán participar en nuestra próxima ICO
            y en las votaciones de la DAO llamada voDkAO.
          </div>
          {renderJoinedCount()}
          {renderButton()}
        </div>
        <div className={styles.picture}>
          <img className={styles.image} src="./bc1.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with ❤️ by Carmona44
      </footer>
    </div>
  );
}