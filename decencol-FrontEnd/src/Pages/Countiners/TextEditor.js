import { handelCreate, handelEdit, selectUser } from '../../features/Private/PrivateSlice'
import '../../Styles/TextEditor.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import LoadingAPI from './LoadingAPI';

export default function TextEditor(props) {

    const dispatch = useDispatch();
    const getFileAPI = useSelector(selectUser).getFile
    const DOC = getFileAPI.doc;
    const getMyFilesAPI = useSelector(selectUser).getMyFiles;
    const [DocDetail, setDocDetail] = useState("");
    const [content, setContent] = useState("");
    const [fileName, setFileName] = useState("");
    const createFileAPI = useSelector(selectUser).createFile;
    const editFileAPI = useSelector(selectUser).editFile;
    const [newMount, setNewMount] = useState(true);

    useEffect(() => {
        if (getMyFilesAPI.Status === "idle" && props.section === "editor") {
            setDocDetail(getMyFilesAPI.data.find(item => item.id === props.fileId))
        }
    }, [props, getMyFilesAPI])

    const handelEditDoc = () => {
        var token = localStorage.getItem("token");
        dispatch(handelEdit({ token: token, body: { fileId: props.fileId, content: content } }));
        setNewMount(false);
    }

    const handelCreateDoc = () => {
        var token = localStorage.getItem("token");
        dispatch(handelCreate({ token: token, body: { fileName: fileName, content: content } }));
        setNewMount(false);
    }

    return (
        <div className='p-4 w-100'>
            <div className='statusBar d-flex align-items-center justify-content-between mb-3'>
                {
                    (props.section === "editor" && DocDetail.id)
                        ? <div className='docName d-flex w-100 align-items-center'>
                            <span className='fs-6'>Document Name:</span>
                            <span className='fs-5 ms-1'>{DocDetail.fileName}</span>
                        </div>
                        :
                        <div className='docInputName'>
                            <span className='fs-6 me-1'>Document Name:</span>
                            <input className='inputName' onChange={(e) => setFileName(e.target.value)} placeholder='Enter your file name:' />
                        </div>
                }
                {
                    (props.section === "editor" && DocDetail.id)
                        ?
                        <div className='dropdown'>
                            <div className="btn dropdown-toggle" id="dropdownMoreDetails" data-bs-auto-close="outside" data-bs-toggle="dropdown" aria-expanded="false">
                                More Info
                            </div>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMoreDetails">
                                <li className="dropdown-item">
                                    <span>Create Time: </span>
                                    <p>{DocDetail.createDateTime}</p>
                                </li>
                                <li className="dropdown-item">
                                    <span>Last Update: </span>
                                    <p>{DocDetail.lastUpdate}</p>
                                </li>
                                <li className="dropdown-item">
                                    <span>Creator Address: </span>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <p>{DocDetail.creatorAddress.substring(0, 7) + " . . . " + DocDetail.creatorAddress.substring(DocDetail.creatorAddress.length - 7, DocDetail.creatorAddress.length)}</p>
                                        <i className='icon text-primary ms-2' onClick={() => navigator.clipboard.writeText(DocDetail.creatorAddress)} title="copy Creator address">copy</i>
                                    </div>
                                </li>
                                {DocDetail.sharedWithAddress &&
                                    <li className="dropdown-item">
                                        <span>Co-Worker: </span>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <p>{DocDetail.sharedWithAddress.substring(0, 7) + " . . . " + DocDetail.sharedWithAddress.substring(DocDetail.sharedWithAddress.length - 7, DocDetail.sharedWithAddress.length)}</p>
                                            <i className='icon text-primary ms-2' onClick={() => navigator.clipboard.writeText(DocDetail.sharedWithAddress)} title="copy Co-Worker address">copy</i>
                                        </div>
                                    </li>}
                            </ul>
                        </div>
                        : <></>
                }
            </div>
            {
                props.section === "editor"
                    ?
                    <>
                        {
                            getFileAPI.Status === "loading"
                            &&
                            <div style={{ height: "50vh" }} className='d-flex align-items-center justify-content-center'>
                                <span>IPFS DOC is loading</span>
                                <LoadingAPI color="gray" />
                            </div>
                        }
                        {
                            getFileAPI.Status === "rejected"
                            &&
                            <div style={{ height: "50vh" }} className='d-flex align-items-center justify-content-center'>
                                <span className='text-danger'>IPFS DOC has Error</span>
                            </div>
                        }
                        {
                            (DocDetail.id && getFileAPI.Status === "idle") &&
                            <textarea className='w-100'
                                style={{ minHeight: "calc(100vh - 13em)" }}
                                defaultValue={DOC.content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        }
                    </>
                    :
                    <textarea className='w-100' style={{ minHeight: "calc(100vh - 13em)" }} defaultValue={props.section === "editor" ? DOC.content : ""} onChange={(e) => setContent(e.target.value)} />

            }
            {
                props.section === "creator"
                &&
                <div className='row align-items-center justify-content-between'>
                    {
                        (createFileAPI.Status === "rejected" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-danger text-center mx-auto'>Saving IPFS Doc has error</span>
                    }
                    {
                        (createFileAPI.Status === "idle" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-success text-center mx-auto'>IPFS Doc is successfully Saved</span>
                    }
                    <button className='col-sm-5 btn btn-primary mt-4 mx-auto d-flex align-items-center justify-content-center' onClick={() => handelCreateDoc()}>
                        <span>Create</span>
                        {
                            createFileAPI.Status === "loading" && <LoadingAPI color="white small" />
                        }
                    </button>
                    <button className='col-sm-5 btn btn-danger mt-1 mt-sm-4 mx-auto d-flex align-items-center justify-content-center' onClick={() => props.setSection("all")}>
                        <span>Cancel</span>
                    </button>
                </div>
            }
            {
                (props.section === "editor" && DocDetail.id)
                &&
                <>
                    <div className='row'>
                        {
                            (editFileAPI.Status === "rejected" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-danger text-center mx-auto'>Edit IPFS Doc has error</span>
                        }
                        {
                            (editFileAPI.Status === "idle" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-success text-center mx-auto'>IPFS Doc is successfully Edited</span>
                        }
                    {getFileAPI.Status==="idle"&& 
                    <div className='row align-items-center justify-content-center'>
                        <button className='col-sm-5 btn btn-primary mt-4 mx-auto d-flex align-items-center justify-content-center' onClick={() => handelEditDoc()}>
                            <span>Edit</span>
                            {
                                editFileAPI.Status === "loading" && <LoadingAPI color="white small" />
                            }
                        </button>
                        <button className='col-sm-5 btn btn-danger mt-1 mt-sm-4 mx-auto d-flex align-items-center justify-content-center' onClick={() => props.setSection("all")}>
                        <span>Cancel</span>
                    </button>
                        </div>}
                    </div>
                </>
            }
        </div>

    )
}