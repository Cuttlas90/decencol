import { useState } from "react";
import SwitchNetwork from "./SwitchNetwork";

export default function ExampleSwitchNetwork() {
    const [network, setNetwork] = useState("");

    return(
        <>
        <h1>this is Example of Switch MetaMask network button </h1>
        <div className="row">
            <div className="col-sm-4">
                <SwitchNetwork
                chainId = {network}
                class = "btn btn-primary px-3"
                btnText = "switch network"
                />
            </div>
            <div className="col-sm-8">
        <input type="text" onChange={(e)=>setNetwork(e.target.value)}/>
            </div>
        </div>
        </>
    )
}