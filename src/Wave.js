import React, { useEffect, useState, useCallback } from "react";
import abi from "./Contract.json";
import { ethers } from "ethers";
import './App.css'
import icon from './yoda.png'

function Wave() {

    const [currentAccount, setCurrentAccount] = useState("");

    const [allWaves, setAllWaves] = useState([]);
    const contractAddress = "0x303847a36807BD36415eCB27679FCE1267FBa318";
    const contractAbi = abi.abi;

    const [msgValue, setMsgValue] = useState("");
    const [sending, setSending] = useState(false);
    const [txnHash, setTxnHash] = useState("");

    const msgHandle = (e) => {
        setMsgValue(e.target.value);
    }

    const connectMetamask = async () => {

        if (!window.ethereum) {
            console.log("Metamask is not available");
        }
        else {
            console.log("Metamask is available");
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log("Found an account:", accounts[0]);
            setCurrentAccount(accounts[0]);
        }

    }

    const getAllWaves = useCallback( 
        async () => {
            try {
                const { ethereum } = window;
                if (ethereum) {
                    // const provider = new ethers.providers.Web3Provider(ethereum);
                    const provider = new ethers.providers.AlchemyProvider('kovan', 'bJ-98LmpdxJRG8XZkLVgJPHyjakMoJmf'); // Alchemy api
    
                    // const signer = provider.getSigner();
                    const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, provider);
    
                    /*
                     * Call the getAllWaves method from your Smart Contract
                     */
                    const waves = await wavePortalContract.getAllWaves();
    
    
                    /*
                     * We only need address, timestamp, and message in our UI so let's
                     * pick those out
                     */
                    let wavesCleaned = [];
                    waves.forEach(wave => {
                        wavesCleaned.unshift({
                            address: wave.sender,
                            timestamp: new Date(wave.timestamp * 1000),
                            message: wave.message
                        });
                    });
    
                    /*
                     * Store our data in React State
                     */
                    setAllWaves(wavesCleaned);
                } else {
                    console.log("Ethereum object doesn't exist!")
                }
            } catch (error) {
                console.log(error);
            }
        }, [contractAbi]
    )    
    
    
    const waveMe = async () => {

        console.log(msgValue);

        setSending(true);

        try {
            const { ethereum } = window;


            if (ethereum) {

                const provider = new ethers.providers.Web3Provider(ethereum);

                // const provider = new ethers.providers.AlchemyProvider('kovan', 'bJ-98LmpdxJRG8XZkLVgJPHyjakMoJmf'); // Alchemy api

                const signer = provider.getSigner();

                const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);


                let waveTxn = await wavePortalContract.wave(msgValue);
                console.log('sending...', waveTxn.hash);
                setTxnHash(waveTxn.hash);

                await waveTxn.wait().then(() => {
                        console.log('done', waveTxn.hash);
                        setSending(false);
                    }).catch(error => {
                        console.log('txn error', error);
                        setSending(false);
                    });

                getAllWaves();
            }
        }
        catch (error) {
            console.log("Error:", error);
            setSending(false);
        }
    }

    useEffect(() => {
        connectMetamask();
        getAllWaves();
    }, [getAllWaves]);

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                {/* <div className="header">
                     <div>Hey there!</div>
                </div> */}

                <div className="header">
                    <img src={icon} id='png' alt="yoda" />
                    <div>yoda, i am.</div>
                </div>


                {!currentAccount ?
                    <button className="waveButton" onClick={connectMetamask}>
                        Connect Wallet
                    </button> :
                    <h4 className='account'>{currentAccount}</h4>
                }

                <input type="text" id='input' onChange={msgHandle} value={msgValue} placeholder="type your message here" />

                {
                    sending ? <button className="waveButton">Sending...</button> :
                        <button className="waveButton" onClick={waveMe}>
                            Wave <span role='img' aria-label="wave" >👋</span>
                        </button>
                }

                {/* <button className='waveButton' onClick={getAllWaves}>Get your secret Waves</button> */}

                <div className="txnHash bio">
                    {
                        txnHash ? <a className="link" href={`https://kovan.etherscan.io/tx/${txnHash}`} target="_blank" rel="noopener noreferrer">Txn Hash: {txnHash}</a>
                            : "Your Transaction Hash will appear here"}
                </div>


            </div>

            <div className="waveContainer">

                <div className="waveContent">

                    {
                        allWaves.map(wave => {
                            return (
                                <div className="wave" key={wave.address + wave.timestamp}>
                                    <div className="wave-message">
                                        Message :  {wave.message}
                                    </div>
                                    <div className="wave-address">
                                        sender : {wave.address}
                                    </div>
                                    <div className="wave-timestamp">
                                        Time : {wave.timestamp.toLocaleString()}
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>



            </div>

        </div>


    );

}

export default Wave;