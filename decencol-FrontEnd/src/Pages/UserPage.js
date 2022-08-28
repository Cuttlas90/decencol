import TextEditor from "./Countiners/TextEditor";
import SildeBar from "./Countiners/SiledBar";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyFiles, selectUser} from "../features/Private/PrivateSlice";
import ShowDocs from "./Countiners/ShowDocs";

export default function UserPage() {
    const dispatch = useDispatch()
    const getMyFilesAPI = useSelector(selectUser).getMyFiles;
    const mounted = useRef(true);
    const [section,setSection] = useState("all");
    const [fileId,setFileId] = useState(0);
    


    useEffect(() => {
        var token = localStorage.getItem('token');
        if (mounted.current){
            dispatch(getMyFiles(token));
        }
        return () => mounted.current = false;
    }, [])

  


    return (
        <div className="d-flex" style={{ height: "calc(100vh - 0px)", overflowY: "auto" }}>
            <SildeBar setSection={setSection} />
            {(section === "all" ||section ==="myShared" ||section ==="sharedWithMe")  && <ShowDocs section={section} setSection={setSection} setFileId={setFileId}/>}
            {section === "editor" && <TextEditor section={section} setSection={setSection} fileId={fileId}/>}
            {section === "creator" && <TextEditor section={section} setSection={setSection} />}
            {/* <button onClick={() => dispatch(getFile({ fileId: 1, token: localStorage.getItem('token') }))}>createFile</button> */}
        </div>
    )
}