import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSharedList, handelShare, selectUser, resetShareFileData, removeShare, resetremoveShare } from '../../features/Private/PrivateSlice';
import '../../Styles/ModalShare.css';
import LoadingAPI from "./LoadingAPI";


export default function MolaShare(props) {

    const [shareMessage, setShareMessage] = useState({ class: "", message: "" });
    const [inputAddress, setInputAddress] = useState(null);
    const [listToShare, setlistToShare] = useState([]);
    const shareFileAPI = useSelector(selectUser).shareFile;
    const walletAddress = useSelector(selectUser).wallet.account[0] || localStorage.getItem("address");
    const dispatch = useDispatch();
    const calledShareList = useRef(false);
    const sharedListAPI = useSelector(selectUser).getSharedList;
    const removSharedAPI = useSelector(selectUser).removeShare;


    // for get shared list
    useEffect(() => {
        if (!calledShareList.current) {
            dispatch(resetShareFileData());
            dispatch(resetremoveShare());
            var token = localStorage.getItem('token');
            dispatch(getSharedList({ fileId: props.docId, token: token }))
            calledShareList.current = true
        }
    }, [props.docId, calledShareList.current])

    // for share Docs
    const handelShareDoc = (fileId) => {
        var token = localStorage.getItem("token");
        dispatch(handelShare({ token: token, body: { fileId: fileId, ethereumAddress: listToShare } }));
    }
    //  useEfect for close modal if shreFile success full
    // useEffect(() => {
    //     if (shareFileAPI.Status === "idle") {
    //         setShareMessage({ class: "text-success", message: "IPFS DOC Shared Successfully." })
    //         setTimeout(() => {
    //             if (document.getElementById("modalShareClose")) {
    //                 document.getElementById("modalShareClose").click();
    //             };
    //             setShareMessage({ class: "", message: "" })
    //         }, 500)
    //     };
    //     if (shareFileAPI.Status === "rejected") {
    //         setShareMessage({ class: "text-danger", message: shareFileAPI.error })

    //     }
    // }, [shareFileAPI.Status])
    // for create list for share
    const addToListForShare = () => {
        var patternAddress = /^0x[a-fA-F0-9]{40}$/;
        var address = inputAddress;
        if (patternAddress.test(address)) {
            if (address.toLowerCase() === walletAddress.toLowerCase()) {
                setShareMessage({ class: "text-danger", message: "you cant share doc with your address" })
            } else {
                var dublicate = listToShare.find((item) => item === inputAddress.toLowerCase());
                if(dublicate){
                    setShareMessage({ class: "text-success blink", message: "Dublicated" })
                }else{
                    setlistToShare((list) => [...list, inputAddress.toLowerCase()])
                    document.getElementById('inputShareAddress').value = ''
                    setShareMessage({ class: "", message: "" })
                }
            }

        } else {
            setShareMessage({ class: "text-danger", message: "this address is not correct!" })
        }
    }
    // for delet item from sharing list
    const deletListSharedItem = (index) => {
        var temp = JSON.parse(JSON.stringify(listToShare));
        temp.splice(index, 1)
        setlistToShare(temp);
    }
    // for remove shared
    const HandelremoveShare = (address, index) => {
        var token = localStorage.getItem('token');
        dispatch(removeShare({
            token: token,
            body: {
                fileId: props.docId,
                ethereumAddress: address.toLowerCase()
            },
            index: index
        }))
    }
    return (
        <div className="modalE1" id="ShareModal" aria-labelledby="exampleModalLabel" aria-hidden="false">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Enter ETH Address for Share Your Doc</h5>
                        <button id="modalShareClose" type="button" className="btn-close" onClick={() => { props.setModalShow(false); setShareMessage({ class: "", message: "" }) }}></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <span className="mb-2"><strong>This Doc is shared with :</strong></span>
                            <ul className='listSharedAddress row'>
                                {sharedListAPI.Status === 'loading' &&
                                    <li className='w-100 d-flex align-items-center justify-content-center'>
                                        <span>Geting shared List</span><LoadingAPI color="gray" />
                                    </li>
                                }
                                {sharedListAPI.Status === 'idle' && sharedListAPI.listAddress.length > 0 &&
                                    sharedListAPI.listAddress.map((row, index) =>
                                        <li key={index} className='d-flex align-items-center px-2 position-relative'>
                                            <span className='elipsed'>{row.userAddress}</span>
                                            {removSharedAPI.rows.find((item) => item.index === index) 
                                                ? removSharedAPI.rows.find((item) => item.index === index).Status === "loading" ? <LoadingAPI color="gray small me-1" />
                                                    : removSharedAPI.rows.find((item) => item.index === index).Status === "idle" ? <span style={{ cursor: "help" }} className='icon text-success fs-2 deleted' title="Deleted">task_alt</span>
                                                        : removSharedAPI.rows.find((item) => item.index === index).Status === "rejected" && <span style={{ cursor: "help" }} className='icon text-danger fs-2' title="Not deleted try again">error</span>
                                                : <></>
                                            }
                                            <button onClick={()=>navigator.clipboard.writeText(row.userAddress)} className='btn btn-outline-primary icon fs-4 px-1 py-0'>copy</button>
                                            <button onClick={() => HandelremoveShare(row.userAddress, index)} className='btn btn-outline-danger icon fs-4 px-1 py-0 ms-1'>delete</button>
                                        </li>
                                    )}

                                {sharedListAPI.Status === 'idle' && sharedListAPI.listAddress.length < 1 &&
                                    <li className='w-100 d-flex align-items-center justify-content-center text-primary'><strong> Not Shared </strong></li>
                                }
                                {sharedListAPI.Status === 'rejected' &&
                                    <li className='w-100 d-flex align-items-center justify-content-center text-danger'><strong> Getting list has Error </strong></li>
                                }
                            </ul>
                        </div>
                        <div>
                            <span className="mb-2">
                                <strong>List of Ethereum Address for share Doc</strong>
                            </span>
                            <ul className='listSharedAddress'>
                                {
                                    listToShare.map((row, index) =>
                                        <li key={index} className='d-flex align-items-center justify-content-between'>
                                            <span>{row}</span>
                                            {shareFileAPI.Status === "" && <span className='text-primary'>listed</span>}
                                            {shareFileAPI.Status === "loading" && <LoadingAPI color="gray small me-1" />}
                                            {shareFileAPI.Status === "rejected" && <span className='icon'>error</span>}
                                            {shareFileAPI.Status === "idle" &&
                                                (() => {
                                                    var findedItem = shareFileAPI.result.find((item) => item.ethereumAddress.toLowerCase() === row.toLowerCase());
                                                    var spanTag = <>
                                                        <span className='text-primary'>listed</span>
                                                        <div>
                                                            <button onClick={() => deletListSharedItem(index)} className='btn btn-outline-danger icon fs-4 px-1 py-0'>delete</button>
                                                        </div>
                                                    </>
                                                    if (findedItem) {
                                                        findedItem.status === 0
                                                            ?
                                                            spanTag = (<span style={{ cursor: "help" }} className='icon text-success fs-2' title={findedItem.message}>task_alt</span>)
                                                            :
                                                            spanTag = <span style={{ cursor: "help" }} className='icon text-danger fs-2' title={findedItem.message}>error</span>
                                                    }
                                                    return spanTag
                                                })()}
                                            {shareFileAPI.Status === "" &&
                                                <div>
                                                    <button onClick={() => deletListSharedItem(index)} className='btn btn-outline-danger icon'>delete</button>
                                                </div>
                                            }
                                        </li>
                                    )
                                }
                            </ul>
                            <div className='d-flex align-items-center justify-content-center'>
                                <input id="inputShareAddress" className='px-2' type="text" onChange={(e) => setInputAddress(e.target.value)} placeholder="Enter ETH Address" />
                                <button onClick={() => addToListForShare()} className='btn btn-outline-primary icon d-flex align-items-center justify-content-center '>add</button>
                            </div>
                            {
                                shareMessage.message !== "" && <div style={{ marginBottom: "-20px" }} className={`${shareMessage.class} mx-auto text-center mt-1`}>{shareMessage.message}</div>
                            }
                        </div>
                    </div>
                    <div className="modal-footer mt-2">
                        <button disabled={listToShare.length < 1} type="button" onClick={() => handelShareDoc(props.docId)} className="btn btn-success d-flex align-items-center justify-content-center" >
                            <span className="icon">share</span>
                            Share
                            {
                                shareFileAPI.Status === "loading" && <LoadingAPI color="white small" />
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}