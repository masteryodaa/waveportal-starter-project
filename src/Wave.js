import React, { useEffect, useState, useCallback } from "react";
import abi from "./Contract.json";
import { ethers } from "ethers";
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css'
// import icon from './yoda.png'
import icon from './babyyoda.gif'
import loader from './loader.gif';

function Wave() {

    const [currentAccount, setCurrentAccount] = useState(null);
    const [metamask, setMetamask] = useState(true);
    const [loading, setLoading] = useState(false);

    const [allWaves, setAllWaves] = useState([]);
    const contractAddress = "0x303847a36807BD36415eCB27679FCE1267FBa318";
    const contractAbi = abi.abi;

    const [msgValue, setMsgValue] = useState("");
    const [sending, setSending] = useState(false);
    const [txnHash, setTxnHash] = useState("");
    const [connectClass, setConnectClass] = useState("");

    const msgHandle = (e) => {
        setMsgValue(e.target.value);
    }

    const connectMetamask = async () => {

        setLoading(true);

        let provider = await detectEthereumProvider();

        try {

            if (provider) {
                console.log("Metamask is available");
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                console.log("Found an account:", accounts[0]);
                setCurrentAccount(accounts[0]);
                setLoading(false);
                // setMetamask();
            }
            else {
                console.log("Metamask is not available");
                setMetamask(false);
                setLoading(false);
            }

        }
        catch (err) {
            console.log("Error:", err);
            setMetamask(false);
            setLoading(false);
        }

    }

    const getAllWaves = useCallback(
        async () => {
            console.log("Getting all waves");

            try {
                const { ethereum } = window;    
                if (ethereum) {

                    // const provider = new ethers.providers.Web3Provider(ethereum);
                    const provider = new ethers.providers.AlchemyProvider('kovan', 'bJ-98LmpdxJRG8XZkLVgJPHyjakMoJmf'); // Alchemy api

                    // const signer = provider.getSigner();
                    const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, provider);


                    const waves = await wavePortalContract.getAllWaves();


                    let wavesCleaned = [];
                    waves.forEach(wave => {
                        wavesCleaned.unshift({
                            address: wave.sender,
                            timestamp: new Date(wave.timestamp * 1000),
                            message: wave.message
                        });
                    });

                    setAllWaves(wavesCleaned);

                } else {
                    console.log("Ethereum object doesn't exist!")
                }
            } catch (error) {
                console.log(error);
            }
        }, [contractAbi]
    )


    const waveMe = () => {

        console.log(msgValue);
        

        const get = async() => {

            setSending(true);

            try {


                const { ethereum } = window;


                if (ethereum) {

                    const provider = new ethers.providers.Web3Provider(ethereum);

                    // const provider = new ethers.providers.AlchemyProvider('kovan', 'bJ-98LmpdxJRG8XZkLVgJPHyjakMoJmf'); // Alchemy api

                    const signer = provider.getSigner();

                    const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);


                    let waveTxn = await wavePortalContract.wave(msgValue, {gasLimit: 1000000});
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

        if(currentAccount){
            get();
        }
        else{
            setConnectClass("wallet");
            setTimeout(() => {
                setConnectClass("");
            }, 1000);
        }
        

        
    }

    useEffect(() => {
        // connectMetamask();
        getAllWaves();
        console.log("getAllWaves called");
    }, [getAllWaves]);

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                

                <div className="head">
                    <img src={icon} id='png' alt="yoda" />
                    <div className="header">send waves to the yoda community</div>
                </div>


                

                {
                   loading ? <button disabled className={`spinner ${connectClass}`}>
                       <img src={loader} alt="loading" width="25px" height="25px" />
                   </button> :

                   (
                    metamask ? 
                    
                    (!currentAccount ?
                        <button className={`waveButton ${connectClass}`} onClick={connectMetamask}>
                            Connect Wallet
                        </button> :
                        <h4 className='account'>{currentAccount}</h4>
                    )
                    
                    : <h4 className="account">Please Install Metamask</h4>
                   )
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
