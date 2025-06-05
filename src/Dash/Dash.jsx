import React, {useState, useEffect} from 'react'
import Logo from '../../public/FavIcon.svg'
import {ethers, parseUnits, formatUnits} from 'ethers'
import './Dash.css'
import {CryptoLogoABI,CryptoLogoAddress} from './chainConfigs'
import {createPublicClient,http} from 'viem'
import {baseSepolia} from 'viem/chains'

  const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
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
  
 

  // ---Connect Function----
  const connect = async () => {
    if(window.ethereum) {
        try {
            const _Provider = new ethers.BrowserProvider(window.ethereum)
            const _Signer =  await _Provider.getSigner()
            const _accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
            const _activeChain =  await window.ethereum.request({method: "eth_chainId"})
            // await _Signer.signMessage(`Welcome to Guess-The-Crypto-Logo`)
            setProvider(_Provider)
            setSigner(_Signer)
            setAccounts(_accounts);
            setIsConnected(true);
            setActiveChain(_activeChain);
            console.log('Assigned provider..',Provider)
            console.log('Assigned signer..',Signer)
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

  
      const Spend  = async () => {
          
 
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
          <h3 id="AssignSecConnect">Connect Wallet</h3> 
          : 
          //This is the Spend Area
          <div id="SpendArea">

            <div id="SpendHead">
            <h2 className='head'>What Web3 entity does the logo represent</h2>
            <hr className='hr'/>
           
            </div>

            <div className='spendContent'>  
               <h5 className='warning'>
            Note: You have a really short time and this is the only time we have to do it
            </h5>
            <img src={LogoData[2]} alt={`${LogoData[1]} Logo`} />
              <div id='recepient'>
                <h4>Enter your answer</h4>
                <input type="text" placeholder='e.g ethereum' value={RecepientAcc} 
                onChange={(e)=>{setRecepient(e.target.value);}}
                />
                <button onClick={()=>{}}>Submit Answer</button>
              </div>
            </div>
          </div>

          }
        
        </div>

    </div>


  )
}

export default Herodash