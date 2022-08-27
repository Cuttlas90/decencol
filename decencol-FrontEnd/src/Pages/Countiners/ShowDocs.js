import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFile, handelShare, selectUser } from "../../features/Private/PrivateSlice";
import "../../Styles/showDocs.css"
import LoadingAPI from "./LoadingAPI";

export default function ShowDocs(props) {
    const dispatch = useDispatch();
    const getMyFilesAPI = useSelector(selectUser).getMyFiles;
    const allFilesUser = useSelector(selectUser).getMyFiles.data;
    const [allFiles,setAllFiles]=useState([]);
    const walletAddress = useSelector(selectUser).wallet.account[0] || localStorage.getItem("address");
    const [shareAddress, setShareAddress] = useState(null);
    const [docId, setDocId] = useState("");
    const [modalShow, setModalShow] = useState(false);
    const shareFileAPI=useSelector(selectUser).shareFile;
    const [shareMessage,setShareMessage] = useState({class:"",message:""});


// useEfect for filter docs
useEffect(()=>{
    if (props.section === "all") setAllFiles(allFilesUser);
    if (props.section === "myShared") setAllFiles(allFilesUser.filter((item)=>item.sharedWith !==null && item.creatorAddress.toLocaleLowerCase()=== walletAddress.toLocaleLowerCase()));
    if (props.section === "sharedWithMe") setAllFiles(allFilesUser.filter((item)=>item.sharedWith !==null && item.creatorAddress.toLocaleLowerCase()!== walletAddress.toLocaleLowerCase()));
},[props.section,allFilesUser])

    // for show file content and edit
    const handelShowDoc = (fileid) => {
            var token = localStorage.getItem("token");
            dispatch(getFile({ token: token, fileId: fileid }));
        props.setFileId(fileid);
        props.setSection("editor");
    }

    //for search 
    const handelSerchDoc = (item) => {
        var filter, continer, Docs, p, txtValue;
        filter = item.toUpperCase();
        continer = document.getElementById("docsContiner");
        Docs = continer.getElementsByClassName("fileHolder");
        for (let i = 0; i < Docs.length; i++) {
            p = Docs[i].getElementsByTagName("p")[0];
            txtValue = p.textContent || p.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                Docs[i].style.display = "";
            } else {
                Docs[i].style.display = "none";
            }
        }
    }

    // for share Docs
    const handelShareDoc = (fileId) => {
        var patternAddress = /^0x[a-fA-F0-9]{40}$/;
        var token = localStorage.getItem("token");
        var address = shareAddress;
        if (shareAddress === null){address=allFiles.find((item)=>item.id === docId).sharedWithAddress}
        if (patternAddress.test(address)) {
            if (address.toLowerCase() === walletAddress.toLowerCase()) {
                setShareMessage({class:"text-danger",message:"you cant share doc with your address"})
                console.log("you cant share doc with your address");
            } else {
                dispatch(handelShare({ token: token, body: { fileId: fileId, ethereumAddress: address.toLowerCase() } }));
            }
            
        } else {
            setShareMessage({class:"text-danger",message:"this address is not correct!"})
            console.log("this address is not correct!")
        }
    }
    //  useEfect for close modal if shreFile success full
    useEffect(()=>{
        if (shareFileAPI.Status === "idle"){
            setShareMessage({class:"text-success",message:"IPFS DOC Shared Successfully."})
            setTimeout(()=>{
                if (document.getElementById("modalShareClose")){
                    document.getElementById("modalShareClose").click();
                };
                setShareMessage({class:"",message:""})
            },500)
        };
        if (shareFileAPI.Status === "rejected"){
            setShareMessage({class:"text-danger",message:shareFileAPI.error})

        }
    },[shareFileAPI.Status])

    return (
        <div id="showDocs" className="w-100  continer p-4">
            <div className="search py-2">
                <input placeholder="Search ..." onChange={(e) => handelSerchDoc(e.target.value)} />
            </div>
            <div id="docsContiner" className="docFileRow w-100 py-2">
                {
                    getMyFilesAPI.Status === "loading"
                        ? <div className="d-flex align-items-center justify-content-center w-100"><span>Loading Files</span><LoadingAPI color="gray" /></div>
                        : <>
                            {
                                allFiles.length < 1
                                    ? <div className="d-flex w-100 justify-content-center align-items-center" style={{height:"50vh",fontSize:"3em",color:"var(--bs-gray-300)"}}>No Doc</div>
                                    :
                                    <>
                                        {allFiles.map((row, index) =>
                                            <div key={index} className="fileHolder " >
                                                <div className="docFile">
                                                    <div>
                                                        {row.sharedWith === null && <img src={window.location.origin + "/Images/icon/DocBlue.png"} alt="doqument" />}
                                                        {(row.sharedWith !== null && row.creatorAddress.toLocaleLowerCase() === walletAddress.toLocaleLowerCase()) && <img src={window.location.origin + "/Images/icon/DocBlueShared.png"} alt="doqument" />}
                                                        {(row.sharedWith !== null && row.creatorAddress.toLocaleLowerCase() !== walletAddress.toLocaleLowerCase()) && <img src={window.location.origin + "/Images/icon/DocGreen.png"} alt="doqument" />}
                                                    </div>
                                                    <div className="d-flex flex-column justify-content-between">
                                                        <span className="r1">Doc name:<br /><p>{row.fileName}</p></span>
                                                        <div>
                                                            {
                                                                row.creatorAddress.toLowerCase() === walletAddress.toLowerCase()
                                                                    ? <div className="r2">Owner:<p style={{ display: "inline-block" }}>Me</p></div>
                                                                    : <div className="r2">Owner:<p style={{ display: "inline-block" }}>{row.creatorAddress.substring(0, 8)}{row.creatorAddress.length > 8 && "..."}</p></div>
                                                            }
                                                            <div className="r3">Last Update:{row.lastUpdate.substring(0, 10)}</div>
                                                            <div className="r4">Create Time:{row.createDateTime.substring(0, 10)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="action">
                                                    <div className="d-flex">
                                                        <button onClick={() => handelShowDoc(row.id)} className="btn btn-primary d-flex align-items-center justify-content-center me-2" ><span className="icon">visibility</span></button>
                                                        <button disabled={(row.sharedWith !== null) && (row.creatorAddress.toLocaleLowerCase() !== walletAddress.toLocaleLowerCase()) ? true : false} onClick={() => {setDocId(row.id);setModalShow(true)}} className="btn btn-success d-flex align-items-center justify-content-center" >
                                                            <span className="icon">share</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                            }
                        </>
                }
            </div>
            {
                modalShow &&
                <div className="modalE1" id="ShareModal" aria-labelledby="exampleModalLabel" aria-hidden="false">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Enter ETH Address for Share Your Doc</h5>
                                <button id="modalShareClose" type="button" className="btn-close" onClick={()=>{setModalShow(false);setShareMessage({class:"",message:""})}}></button>
                            </div>
                            <div className="modal-body">
                                <span className="mb-2">Ethereum Address for share Doc</span>
                                <input type="text" defaultValue={allFiles.find((item)=>item.id === docId).sharedWithAddress} onChange={(e) => setShareAddress(e.target.value)} placeholder="Enter ETH Address" />
                                {
                                    shareMessage.message !=="" && <div style={{marginBottom:"-20px"}} className={`${shareMessage.class} mx-auto text-center mt-1`}>{shareMessage.message}</div>
                                }
                            </div>
                            <div className="modal-footer mt-2">
                                <button type="button" onClick={() => handelShareDoc(docId)} className="btn btn-success d-flex align-items-center justify-content-center" >
                                    <span className="icon">share</span>
                                    Share
                                    {
                                        shareFileAPI.Status === "loading" && <LoadingAPI color="white small"/>
                                    }
                                    </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>

    )
}