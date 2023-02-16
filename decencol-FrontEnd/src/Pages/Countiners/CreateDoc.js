import { handelCreate, handelEdit, selectUser } from '../../features/Private/PrivateSlice'
import '../../Styles/TextEditor.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import LoadingAPI from './LoadingAPI';
import ModalShare from "./ModalShare";
import ReactMarkdown from 'https://esm.sh/react-markdown@7'


export default function CreateDoc(props) {

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
    const [modalShow, setModalShow] = useState(false);
    const [modalAlloShare, setMmodalAlloShare] = useState(true);
    const newDocId = useSelector(selectUser).createFile.fileId;



    const handelCreateDoc = () => {
        var token = localStorage.getItem("token");
        dispatch(handelCreate({ token: token, body: { fileName: fileName, content: content } }));
        setNewMount(false);
    }

    return (
        <div className='p-4 w-100'>
            <div className='statusBar d-flex align-items-center justify-content-between mb-3'>
                <div className='docInputName'>
                    <span className='fs-6 me-1'>Document Name:</span>
                    <input className='inputName' onChange={(e) => setFileName(e.target.value)} placeholder='Enter your file name:' />
                </div>
                <div className='navStatusBar'>
                    <ul className='d-flex ps-0'>
                        <li className='me-2'>Preview</li>
                        <li>Review & Compair</li>
                    </ul>
                </div>
            </div>
            <div className='navHelp d-flex'>
                <h6>this Editor Support Markdown syntax and formatting.</h6>
                <a href='https://www.google.com' target='_blank' rel="noreferrer">Markdown Syntax</a>
            </div>
            <div className='tools d-flex justify-content-between'>
                <span>list</span>
                <div>
                    <span className='me-2'>edit</span>
                    <span>copy</span>
                </div>
            </div>
            <textarea className='w-100' style={{ minHeight: "calc(100vh - 13em)" }} onChange={(e) => setContent(e.target.value)} />
            <div className='row align-items-center justify-content-between'>
                {
                    (createFileAPI.Status === "rejected" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-danger text-center mx-auto'>Saving IPFS Doc has error</span>
                }
                {
                    (createFileAPI.Status === "idle" && !newMount) &&
                    <>
                        <span style={{ marginBottom: "-20px" }} className='text-success text-center mx-auto'>IPFS Doc is successfully Saved</span>
                        {
                            modalAlloShare &&
                            <div className='modalAlloShare'>
                                <div className='modalBody'>
                                    <div className='modalHead'>
                                        <button className='btn icon fs-3 d-block me-1 ms-auto p-0' onClick={() => setMmodalAlloShare(false)}>close</button>
                                    </div>
                                    <div className='modalContent'>
                                        <h5 className='mx-auto text-center mb-4'>IPFS Doc is successfully Saved </h5>
                                        <h6 className='mx-auto text-center mb-3'>Do You Whant To Shahr It?</h6>
                                        <button onClick={() => { setModalShow(true); setMmodalAlloShare(false) }} className='btn btn-success d-flex align-items-center px-4 mx-auto py-0'>
                                            <span className='icon fs-2 text-light me-2'>share</span>
                                            <span className='text-light'>Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </>
                }
                <button className='col-sm-5 btn btn-primary mt-4 mx-auto d-flex align-items-center justify-content-center' onClick={() => handelCreateDoc()}>
                    <span>Create</span>
                    {
                        createFileAPI.Status === "loading" && <LoadingAPI color="white small" />
                    }
                </button>
                <button className='col-sm-5 btn btn-danger mt-1 mt-sm-4 mx-auto d-flex align-items-center justify-content-center' onClick={() => props.setSection("myFile")}>
                    <span>Cancel</span>
                </button>
            </div>
            {
                modalShow &&
                <ModalShare setModalShow={setModalShow} docId={newDocId} />
            }
        </div>

    )
}