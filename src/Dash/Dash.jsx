import React, {useState, useEffect} from 'react'
import Logo from '../../public/FavIcon.svg'
import './Dash.css'
import {CryptoLogoABI,CryptoLogoAddress} from './chainConfigs'
import {createPublicClient,http,createWalletClient,custom} from 'viem'
import {baseSepolia} from 'viem/chains'

  const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
})

const walletClient = createWalletClient({
  chain:baseSepolia,
  transport:custom(window.ethereum)
})

const Herodash = () => {

  const [isConnected, setIsConnected] = useState(false);
  const [Provider, setProvider] = useState();
  const [Signer, setSigner] = useState() 
  const [Accounts, setAccounts] = useState([]);
  const [activeChainId, setChainId] = useState('')
  const [RecepientAcc,setRecepient] = useState('')
  const [DelegatedAcc,setDelegate] = useState()
  const [LogoData,setLogoData] = useState([])
  const [ActiveChain,setActiveChain] = useState()
  const [play,setPlay] = useState(false)
 

  // ---Connect Function----
  const connect = async () => {
    if(window.ethereum) {
        try {
            const _accounts = await walletClient.requestAddresses()
            const _activeChain =  await window.ethereum.request({method: "eth_chainId"})
            setAccounts(_accounts);
            setIsConnected(true);
            setActiveChain(_activeChain);
            fetchLogoData() 
        }
        catch(error){
            window.alert(`There was an error ${error}`)
        }
    }  
}

  //---Disconnect Function----
  const disconnect = async () => {
      await window.ethereum.request({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]})
      setIsConnected(false);
      setPlay(false)
  }

  const generateLogo = async () => {
      await walletClient.writeContract({
        address:CryptoLogoAddress,
        abi:CryptoLogoABI,
        functionName: 'requestRandomWords',
        account: Accounts[0]
      })
  }

  const fetchLogoData = async () =>{
    const LogoData = await publicClient.simulateContract({
      address:CryptoLogoAddress,
      abi: CryptoLogoABI,
      functionName:'generatedLogo',
      account: Accounts[0]
    })
    setLogoData(LogoData.result)
    console.log("The Logo Data is",LogoData.result)
  }

  
      const setPlayFunc  = async () => {
          setPlay(true)
      }
 

  // Check for Account Change and Check for Connected accounts
    useEffect(()=>{
        
    const check = async () => {
          try {
          const _Accounts =  await window.ethereum.request({method: "eth_accounts"})
           if(_Accounts > 0) { 
            setAccounts(_Accounts)
            setIsConnected(true)
            console.log('The connectec accouunts are',_Accounts)
            setIsConnected(true)
            fetchLogoData()
           } 
          }catch(error){
            window.alert('The designs failed',error)
          }
    } 

    check()

    window.ethereum.on('accountsChanged',(accounts)=> {
      if(accounts.length > 0 ){
        setAccounts(accounts)
        console.log('New accounts',accounts)
      }
    })

  },[])
 
  return (
    <div>

        {/* Dashboard */}
        <div className='dashboard'>

            {/* Header */}
            <div className='header'>
                <div className='Logo'>
                    <img src={Logo} id='Logo' alt="DystryCap Logo" />
                    <h2>Guess-The-Crypto-Logo</h2>
                </div>
            
                <div className='connectButton'>
                    { isConnected && Accounts ? <h2>{`${Accounts[0].substring(0,6)}...${Accounts[0].substring(Accounts[0].length-4)}`}</h2> : ''}
                    <button style = {{display: isConnected ? 'none' : 'flex'}} onClick={connect} id='connectbtn'>Connect</button>
                    <button style = {{display: isConnected? 'flex' : 'none'}} onClick={disconnect} id='connectbtn'>Disconnect</button>
                </div>
            </div>
        </div>

        {/* content Area */}
        <div className='contentArea'>
          
          { !isConnected ? 
          <h1 id="AssignSecConnect">Connect Wallet</h1> 
          : 
           !play ? <button id='Play' onClick={setPlayFunc}><h1>Play</h1></button> :
          
          <div id="GameArea">

            <div id="GameHead">
            <h2 className='head'>What Web3 entity does the logo represent</h2>
            <hr className='hr'/>
           
            </div>

            <div className='gameContent'>  
               <h5 className='warning'>
            Note: You have a really short time and this is the only time we have to do it
            </h5>
            <img id="cryptoLogo" src={LogoData[2]} alt={`${LogoData[1]} Logo`} />
              <div id='answer'>
                <h4>Enter your answer</h4>
                <input type="text" placeholder='e.g ethereum' value={RecepientAcc} 
                onChange={(e)=>{setRecepient(e.target.value);}}
                />
                <button onClick={async ()=>{
                  await generateLogo()
                  await fetchLogoData()
                }}>Submit Answer</button>
              </div>
            </div>
          </div>
          
          }
        
        </div>

    </div>


  )
}

export default Herodash