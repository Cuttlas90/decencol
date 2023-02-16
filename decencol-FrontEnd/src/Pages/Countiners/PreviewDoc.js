import { acceptDeclineChanges, handelEdit, selectUser } from '../../features/Private/PrivateSlice'
import '../../Styles/TextEditor.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import LoadingAPI from './LoadingAPI';
import ModalShare from "./ModalShare";
import ReactMarkdown from 'react-markdown'


export default function PreviewDoc(props) {

    const dispatch = useDispatch();
    const getFileAPI = useSelector(selectUser).getFile
    const DOC = getFileAPI.doc;
    const getMyFilesAPI = useSelector(selectUser).getMyFiles;
    const [DocDetail, setDocDetail] = useState("");
    const [content, setContent] = useState(false);
    const editFileAPI = useSelector(selectUser).editFile;
    const [newMount, setNewMount] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    const [viewMode, setViewMode] = useState('viewMode');
    const [reviewSidebarShow, setReviewSidebarShow] = useState(false);
    const [reviewItem, setReviewItem] = useState();
    const [numberReview, setNumberReview] = useState(1);
    const [reviewContent, setReviewContent] = useState([]);
    const acceptDeclineChangesAPI = useSelector(selectUser).acceptDeclineChanges;
    const menuRef = useRef(null);
    const [numberOfSuggestions, setNumberOfSuggestions] = useState(0);
    const [disableSaveBtn, setDisableSaveBtn] = useState(true);
    // useEfect for set reviewContent and set first reviewItem 

    useEffect(() => {
        if (getFileAPI.Status === 'idle') {
            setReviewContent(getFileAPI.doc);
            var firstItem = getFileAPI.doc.content.indexOf(getFileAPI.doc.content.filter(item => item.data.find(row => row.status === 0))[0])
            setReviewItem(firstItem);
        }
    }, [getFileAPI])

    useEffect(() => {
        if (getMyFilesAPI.Status === "idle") {
            setDocDetail(getMyFilesAPI.data.find(item => item.id === props.fileId))
        }
    }, [props, getMyFilesAPI])

    const handelEditDoc = () => {
        var token = localStorage.getItem("token");
        dispatch(handelEdit({ token: token, body: { fileId: props.fileId, content: content } }));
        setNewMount(false);
    }
    const handelChangeView = (index) => {
        if (reviewContent.content[index].data.find(item => item.status === 0)) {
            setReviewSidebarShow(true);
            setReviewItem(index);
            var element = document.getElementsByClassName('hasChange');
            for (let i = 0; i < element.length; i++) {
                if (Number(element[i].getAttribute('arrayindex')) === index) {
                    setNumberReview(i + 1);
                    return
                }
            }

        }
    }
    const handelNextPreviwItem = (sign) => {
        var hasChanges = document.getElementsByClassName('hasChange');
        if (sign === '+' && numberReview < numberOfSuggestions) {
            for (let i = 0; i < reviewContent.content.length; i++) {
                if (i > reviewItem && reviewContent.content[i].data.find(item => item.status === 0)) {
                    setNumberReview(numberReview + 1)
                    setReviewItem(Number(i));
                    break
                }
            }

        }
        if (sign === '-' && reviewItem > 0) {
            for (let i = reviewContent.content.length; i > 0; i--) {
                if (i < reviewItem && reviewContent.content[i].data.find(item => item.status === 0)) {
                    setNumberReview(numberReview - 1)
                    setReviewItem(Number(i));
                    break
                }
            }
        }
        if (sign === 'adjast') {
            if (numberReview === numberOfSuggestions) {
                for (let i = reviewContent.content.length; i > 0; i--) {
                    numberReview > 0 && setNumberReview(numberReview - 1)
                    if (i < reviewItem && reviewContent.content[i].data.find(item => item.status === 0)) {
                        setReviewItem(Number(i));
                        break
                    }
                }
            } else {
                for (let i = 0; i < reviewContent.content.length; i++) {
                    if (i > reviewItem && reviewContent.content[i].data.find(item => item.status === 0)) {
                        // setNumberReview(numberReview + 1)
                        setReviewItem(Number(i));
                        break
                    }
                }
            }
        }
    }
    const handelAction = (item, index, action) => {
        var body = {
            "fileId": reviewContent.fileId,
            "key": reviewContent.content[item].key,
            "keyId": reviewContent.content[item].id,
            "changeId": reviewContent.content[item].data[index].id,
            "action": action === "accept" ? 1 : action === "decline" && 2
        };
        var token = localStorage.getItem('token');
        var arg = {
            "item": item,
            "index": index,
            "action": action
        }
        dispatch(acceptDeclineChanges({ body: body, token: token, arg: arg }));
    }
    // useEfeect for calculate nubmber Of item of review user suggestions
    useEffect(() => {
        var number = 0
        if (reviewContent.content) {
            for (let i = 0; i < reviewContent.content.length; i++) {
                for (let j = 0; j < reviewContent.content[i].data.length; j++) {
                    if (reviewContent.content[i].data[j].status === 0) {
                        number++;
                        break
                    }
                }
            }
            setNumberOfSuggestions(number);
        }

    }, [reviewContent, numberOfSuggestions, setNumberOfSuggestions]);
    console.log('numberOfSuggestions' + ':' + numberOfSuggestions)
    console.log('reviewItem' + ':' + reviewItem)
    // useEfect for show changes after accept or decline
    useEffect(() => {
        if (acceptDeclineChangesAPI.Status === 'idle') {
            var tempContent = JSON.parse(JSON.stringify(reviewContent));
            var item = acceptDeclineChangesAPI.arg.item;
            var index = acceptDeclineChangesAPI.arg.index;
            var action = acceptDeclineChangesAPI.arg.action;
            for (let i = 0; i < tempContent.content[item].data.length; i++) {
                if (action === 'accept') {
                    if (i !== index) { tempContent.content[item].data[i].status = 2 }
                    tempContent.content[item].data[index].status = 1;
                }
                if (action === 'decline') {
                    tempContent.content[item].data[index].status = 2
                }
            }
            setReviewContent(tempContent);
            handelNextPreviwItem('adjast')
        }
    }, [acceptDeclineChangesAPI]);

    const handelMenu = (mode, e) => {
        var menuUl = menuRef.current;
        menuUl.classList.toggle('open');
        for (let li of menuUl.children) {
            li.classList.remove('active');
        };
        if (mode === 'viewMode') {
            setContent('');
        };
        setViewMode(mode);
        e.target.classList.add('active');
    }
    // useEffect for close sidbar when no suggestion
    useEffect(() => {
        if (numberOfSuggestions < 1) {
            setReviewSidebarShow(false);
        }
    }, [numberOfSuggestions]);
    // useEffect for handel save change btn
    useEffect(() => {
        if (content !== DOC.docText || !content) {
            setDisableSaveBtn(false);
        } else {
            setDisableSaveBtn(true);
        }
    }, [content, setContent, DOC.docText])
    // useEfect for disble save btn after edited success
    useEffect(() => {
        if (editFileAPI.Status === 'idle') {
            setDisableSaveBtn(true);
        }
    }, [editFileAPI])

    // useEffect for set content fron doc.doctext
    useEffect(() => {
        if (getFileAPI.Status === 'idle') {
            setContent(DOC.docText);
        }
    }, [getFileAPI])
    return (
        <div className='ps-4 w-100'>
            <div className='d-flex' >
                <div className='w-100 pe-4 pt-4 mainSide'>
                    <div className='statusBar d-flex align-items-center justify-content-between mb-3'>
                        {
                            DocDetail.id &&
                            <>
                                <div className='docName d-flex w-100 align-items-center'>
                                    <span className='fs-6'>Document Name:</span>
                                    <p className='fs-5 ms-1 mb-0' title={DocDetail.fileName}>{DocDetail.fileName.length > 15 ? DocDetail.fileName.substring(0, 15) + '...' : DocDetail.fileName}</p>
                                </div>
                            </>

                        }
                    </div>
                    <div className='mainHead'>
                        <div className='navStatusBar'>
                            <ul onBlur={() => menuRef.current.classList.remove('open')} ref={menuRef} className='d-flex ps-0 align-items-center mb-0'>
                                <li className='me-2 btn btn-outline-primary' onClick={(e) => handelMenu('viewMode', e)}>
                                    Document
                                </li>
                                <li className='me-2 btn btn-outline-primary' onClick={(e) => handelMenu('editMode', e)}>
                                    Edit
                                </li>
                                <li className='btn btn-outline-primary' onClick={(e) => handelMenu('reviewMode', e)}>
                                    Review
                                </li>
                            </ul>
                            {
                                DocDetail.id &&
                                <div className='dropdown ms-auto'>
                                    <div className="btn  btn-outline-secondary dropdown-toggle" id="dropdownMoreDetails" data-bs-auto-close="outside" data-bs-toggle="dropdown" aria-expanded="false">
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
                                        {DocDetail.creatorAddress.toLowerCase() === localStorage.getItem('address').toLowerCase() &&
                                            <li className="dropdown-item ">
                                                <button onClick={() => setModalShow(true)} className='btn btn-success d-flex align-items-center justify-content-center w-100 mx-auto'>
                                                    <span className='icon text-light fs-3'>co_present</span>
                                                    <span className='text-light ms-2'>Co-Worker(s)</span>
                                                </button>
                                            </li>}
                                    </ul>
                                </div>
                            }
                        </div>
                        <div className='tools d-flex justify-content-between mb-2'>
                            {/* {
                            viewMode === 'previewMode' &&
                            <button onClick={() => setViewMode('editMode')} className='btn btn-outline'>
                                <span className='icon'>edit</span>
                                <span className=''>edit/source<small>(markdown)</small></span>
                            </button>
                        }
                        {
                            viewMode === 'editMode' &&
                            <button onClick={() => setViewMode('previewMode')} className='btn btn-outline'>
                                <span className='icon'>visibility</span>
                                <span className=''>preview</span>
                            </button>
                        } */}
                            <div className='w-100'>
                                {viewMode === 'editMode' &&
                                    <button onClick={() => handelEditDoc()} disabled={disableSaveBtn} className='btn btn-outline-primary ms-auto d-flex align-items-center'>
                                        <span>Save Changes</span>
                                        {
                                            editFileAPI.Status === "loading" && <LoadingAPI color="primary small" />
                                        }
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
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
                        <>
                            {viewMode === 'viewMode' &&
                                <div style={{ whiteSpace: "pre-wrap" }}>{DOC.docText}</div>
                            }
                            {viewMode === 'previewMode' &&
                                <div style={{ whiteSpace: "pre-wrap" }}>{content || DOC.docText}</div>
                            }
                            {viewMode === 'editMode' &&
                                <textarea className='w-100'
                                    style={{ minHeight: "calc(100vh - 18em)" }}
                                    defaultValue={content || DOC.docText}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            }
                            {viewMode === 'reviewMode' &&
                                <div>
                                    {reviewContent.content.length > 0 ?
                                        reviewContent.content.map((row, index) =>
                                            (row.data.find(item => item.status === 0) || row.data.find(item => item.status === 1)) &&
                                            <div
                                                key={index}
                                                arrayindex={index}
                                                className={row.data.find(item => item.status === 0) ? index === reviewContent.content.indexOf(reviewContent.content.filter(item => item.data.find(row => row.status === 0))[numberReview - 1]) ? 'reviwMarkdown hasChange reviewActiveRow' : 'reviwMarkdown hasChange' : "reviwMarkdown"}
                                                onClick={() => handelChangeView(index)}
                                            >
                                                <ReactMarkdown>{row.data.find(item => item.status === 1) ? row.data.find(item => item.status === 1).newValue : row.data.find(item => item.status === 0) && "`New`"}</ReactMarkdown>
                                            </div>
                                        )
                                        :
                                        <span>Not has Review</span>
                                    }
                                </div>
                            }


                        </>

                    }

                    {
                        DocDetail.id
                        &&
                        <>
                            <div className='row'>
                                {viewMode === 'editMode' && <>
                                    {
                                        (editFileAPI.Status === "rejected" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-danger text-center mx-auto'>Edit IPFS Doc has error</span>
                                    }
                                    {
                                        (editFileAPI.Status === "idle" && !newMount) && <span style={{ marginBottom: "-20px" }} className='text-success text-center mx-auto'>IPFS Doc is successfully Edited</span>
                                    }
                                </>}
                            </div>
                        </>
                    }
                    {
                        modalShow &&
                        <ModalShare setModalShow={setModalShow} docId={props.fileId} />
                    }
                </div>
                {viewMode === 'reviewMode' &&
                    <div className={reviewSidebarShow ? 'reviewSidebar' : 'reviewSidebar close'}>
                            <div onClick={() => setReviewSidebarShow(!reviewSidebarShow)} className='r-collapser icon'>{reviewSidebarShow ? 'arrow_forward_ios' : 'arrow_back_ios'}</div>
                            <img onClick={() => setReviewSidebarShow(!reviewSidebarShow)} src='Images/icon/LINE.svg' alt='' />
                        <div className='forCollaps'>
                            <div className='r-SidebarHead'>
                                <h5 className='mb-0 text-center'>Review Suggestions</h5>
                                <div className='d-flex align-items-center justify-content-between'>
                                    <button onClick={() => handelNextPreviwItem('-')} className='btn btn-outline icon'>arrow_back_ios</button>
                                    <span>{numberReview + "/" + numberOfSuggestions}</span>
                                    <button onClick={() => handelNextPreviwItem('+')} className='btn btn-outline icon'>arrow_forward_ios</button>
                                </div>
                            </div>
                            <div className='r-Sidebarbody'>
                                {
                                    numberOfSuggestions === 0 ?
                                        <div className='mx-auto text-center'>
                                            No Suggestions
                                        </div>
                                        : reviewContent.content && reviewContent.content[reviewItem].data.map((row, index) =>
                                            row.status === 0 &&
                                            <div className='m-0' key={index}>
                                                {
                                                    row.action !== '=' &&
                                                    <div className='mb-4'>
                                                        <div className='d-flex align-items-center justify-content-between mb-1'>
                                                            <h6 className='mb-0 d-flex align-items-center'>
                                                                <span className='icon fs-4'>person</span>{row.user.substring(0, 5) + '...'} :
                                                            </h6>
                                                            {acceptDeclineChangesAPI.Status === 'loading' && <div style={{ margin: '0 0 -10px -10px ' }}><LoadingAPI color='gray small' /></div>}
                                                            <div>
                                                                <button
                                                                    onClick={() => handelAction(reviewItem, index, 'accept')}
                                                                    disabled={acceptDeclineChangesAPI.Status === 'loading'}
                                                                    className='btn btn-outline-primary btn_mini me-1'>
                                                                    <span className='icon'>done</span>
                                                                    <span>Accept</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handelAction(reviewItem, index, 'decline')}
                                                                    disabled={acceptDeclineChangesAPI.Status === 'loading'}
                                                                    className='btn btn-outline-danger btn_mini'>
                                                                    <span className='icon'>close</span>
                                                                    <span>Decline</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {row.action === '*' &&
                                                            <>
                                                                <div className='d-flex align-items-center mt-1 text-primary'>
                                                                    <span className='icon fs-5 me-1'>cached</span>
                                                                    <span>Change This Line To:</span>
                                                                </div>
                                                                <ReactMarkdown>{row.newValue}</ReactMarkdown>
                                                            </>}
                                                        {row.action === '+' &&
                                                            <>
                                                                <div className='d-flex align-items-center mt-1 text-success'>
                                                                    <span className='icon fs-5 me-1'>add_circle</span>
                                                                    <span>ADD This Line :</span>
                                                                </div>
                                                                <ReactMarkdown>{row.newValue}</ReactMarkdown>
                                                            </>}
                                                        {row.action === '-' &&
                                                            <>
                                                                <div className='d-flex align-items-center mt-1 text-danger'>
                                                                    <span className='icon fs-5 me-1'>cancel</span>
                                                                    <span>DELETE This Line.</span>
                                                                </div>
                                                            </>}
                                                    </div>
                                                }
                                            </div>
                                        )
                                }
                            </div>
                            <div className='r-SidebarFooter'></div>
                        </div>
                    </div>
                }
            </div>
        </div >

    )
}