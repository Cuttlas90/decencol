import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { modalChekWallet, selectshowModalwallet, selectWallet } from "../../features/Private/PrivateSlice"
import '../../Styles/setConectWallet.css'
export default function SetConectWallet() {
    const dispatch = useDispatch();
    const wallet = useSelector(selectWallet);
    const hasMetamask = wallet.hasMetamask;
    const status = wallet.Status;
    const showModalwallet = useSelector(selectshowModalwallet);
    var count = null;
    const success = () => {
        count === false ? clearTimeout()
            : setTimeout(() => {
                dispatch(modalChekWallet());
                count = true;
            }, 2000)
        count = false;
    }

    return (
        <>
            {(hasMetamask === false && showModalwallet) && <>
                <div className="SetConectWallet" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h6 className=" w-100 text-center m-0">You need an Ethereum wallet</h6>
                                <button type="button" className="btn-close" onClick={() => dispatch(modalChekWallet())}></button>
                            </div>
                            <div className="modal-body d-flex flex-column align-items-center">
                                <div className="installMetaMask">
                                    <div>
                                        <img src={window.location.origin + "/Images/icon/metamask.webp"} alt="" />
                                        <span>Metamask</span>
                                    </div>
                                    <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">download Metamask</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            }
            {(hasMetamask === true && showModalwallet) && <>
                <div className="SetConectWallet" tabIndex="-1">

                    {status === "loading" &&
                        <div className="modal-body d-flex flex-column align-items-center">
                            <div className="modal-body d-flex flex-column align-items-center">
                                <div className="idle alert alert-success">
                                    wallet is conecting...
                                    <div className="lds-defaultWallet"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                                </div>
                            </div>
                        </div>
                    }
                    {status === "idle" &&
                        <div className="modal-body d-flex flex-column align-items-center">
                            <div className="idle alert alert-success">
                                wallet conected successfully
                                <img src={window.location.origin + "/Images/icon/success.png"} alt="" onLoad={() => success()} />
                            </div>
                        </div>
                    }
                    {status === "rejected" &&
                        <div className="modal-body d-flex flex-column align-items-center">
                            <div className="idle alert alert-danger">
                                wallet conect has Error
                                <img src={window.location.origin + "/Images/icon/fail.png"} alt="" onLoad={() => success()} />
                            </div>
                        </div>
                    }
                </div>
            </>
            }
        </>

    )
}