import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteFile, getFile, getMyFiles, selectUser } from "../../features/Private/PrivateSlice";
import "../../Styles/showDocs.css";
import LoadingAPI from "./LoadingAPI";
import ModalShare from "./ModalShare";


export default function ShowDocs(props) {
    const dispatch = useDispatch();
    const getMyFilesAPI = useSelector(selectUser).getMyFiles;
    const allFilesUser = useSelector(selectUser).getMyFiles.data;
    const [allFiles, setAllFiles] = useState([]);
    const walletAddress = useSelector(selectUser).wallet.account[0] || localStorage.getItem("address");
    const [docId, setDocId] = useState("");
    const [modalShow, setModalShow] = useState(false);
    const mounted = useRef(false);
    const deleteFileAPI = useSelector(selectUser).deleteFile
    const [deletedFileIds, setDeletedFileIds] = useState([]);

    // useefect for get files for ech section
    useEffect(() => {
        var token = localStorage.getItem('token');
        if (!mounted.current) {
            props.section === "myFile" && dispatch(getMyFiles({ folder: "getMyFiles", token: token }));
            props.section === "shared" && dispatch(getMyFiles({ folder: "getSharedByFiles", token: token }));
            mounted.current = true
        }
        setAllFiles(allFilesUser);
    }, [mounted.current, props.section, allFilesUser, setAllFiles])

    // for show file content and edit
    const handelShowDoc = (fileid) => {
        var token = localStorage.getItem("token");
        dispatch(getFile({ token: token, fileId: fileid }));
        props.setFileId(fileid);
        props.setSection("editor");
    }
    // useEfect for handel deletFile before refresh component
    useEffect(() => {
        if (deleteFileAPI.Status === 'idle') {
            setDeletedFileIds([deleteFileAPI.deletedId, ...deletedFileIds])
        }
    }, [deleteFileAPI])
    //for search 
    const handelSearchDoc = (item) => {
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

    return (
        <div id="showDocs" className="w-100  continer p-4">
            <div className="search py-2">
                <input placeholder="Search ..." onChange={(e) => handelSearchDoc(e.target.value)} />
            </div>
            <div id="docsContiner" className="docFileRow w-100 py-2">
                {
                    getMyFilesAPI.Status === "loading"
                        ? <div className="d-flex align-items-center justify-content-center w-100"><span>Loading Files</span><LoadingAPI color="gray" /></div>
                        : <>
                            {
                                (allFiles.length < 1 || allFiles.filter(item => item.id !== deletedFileIds.find(r => r === item.id)).length < 1)
                                    ? <div className="d-flex w-100 justify-content-center align-items-center" style={{ height: "50vh", fontSize: "3em", color: "var(--bs-gray-300)" }}>No Doc</div>
                                    :
                                    <>
                                        {allFiles.map((row, index) =>
                                            !deletedFileIds.find(item => item === row.id) &&
                                            <div key={index} className="fileHolder " >
                                                <div className="docFile">
                                                    <div>
                                                        <img src={window.location.origin + "/Images/icon/DocBlue.png"} alt="doqument" />
                                                        {(row.sharedWith !== null && row.creatorAddress.toLowerCase() === walletAddress.toLowerCase()) && <img src={window.location.origin + "/Images/icon/DocBlueShared.png"} alt="doqument" />}
                                                        {(row.sharedWith !== null && row.creatorAddress.toLowerCase() !== walletAddress.toLowerCase()) && <img src={window.location.origin + "/Images/icon/DocGreen.png"} alt="doqument" />}
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

                                                {
                                                    (deleteFileAPI.Status === 'loading' && deleteFileAPI.deletedId === row.id)
                                                        ?
                                                        <div className="actionDeleting" >
                                                            <div disabled className="btn btn-danger d-flex align-items-center justify-content-center">
                                                                <span>Deletting...</span>
                                                                <div style={{ marginBottom: "-12px" }}><LoadingAPI color="white small" /></div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <div className="action">
                                                            <div className="d-flex">
                                                                <button onClick={() => handelShowDoc(row.id)} className="btn btn-primary d-flex align-items-center justify-content-center" ><span className="icon">visibility</span></button>
                                                                <button disabled={(row.sharedWith !== null) && (row.creatorAddress.toLocaleLowerCase() !== walletAddress.toLocaleLowerCase()) ? true : false}
                                                                    onClick={() => { setDocId(row.id); setModalShow(true) }}
                                                                    className="mx-2 btn btn-success d-flex align-items-center justify-content-center" >
                                                                    <span className="icon">share</span>
                                                                </button>
                                                                <button disabled={row.creatorAddress.toLocaleLowerCase() !== walletAddress.toLocaleLowerCase() ? true : false}
                                                                    onClick={() => dispatch(deleteFile(row.id))}
                                                                    className="btn btn-danger d-flex align-items-center justify-content-center" >
                                                                    <span className="icon">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                        )}
                                    </>
                            }
                        </>
                }
            </div >
            {
                modalShow &&
                <ModalShare setModalShow={setModalShow} docId={docId} />
            }
        </div >

    )
}