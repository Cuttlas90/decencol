import chainlist from "./Chains.json"
export default function SwitchNetwork(props){

    const switchNetwork = () => {
      console.log(props)
        var curentNet = window.ethereum.networkVersion;
        var toSwitchNetwork = chainlist.find(item=> item.chainId === Number(props.chainId) )
        var paramsToswitch = [{
          "chainName": toSwitchNetwork.name,
          "chainId": "0x"+toSwitchNetwork.chainId.toString(16),
          "rpcUrls": toSwitchNetwork.rpc,
          "blockExplorerUrls": [toSwitchNetwork.explorers.url]
      }]
      console.log(paramsToswitch[0].chainId)
        if (curentNet !== props.chainId){
            try {
                 window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: paramsToswitch[0].chainId }],
                });
              } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                  window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: paramsToswitch
                  });
                }
              }
        }
    }
    return(
        <button onClick={()=>switchNetwork()} className={props.class}>{props.btnText}</button>
    )
}