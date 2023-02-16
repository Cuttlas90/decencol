import TextEditor from "./Countiners/TextEditor";
import SildeBar from "./Countiners/SiledBar";
import ShowDocs from "./Countiners/ShowDocs";
import { useState } from "react";
import PreviewDoc from "./Countiners/PreviewDoc";
import CreateDoc from "./Countiners/CreateDoc";
import Navbar from "./Countiners/Navbar";

export default function UserPage() {
    const [section, setSection] = useState("myFile");
    const [fileId, setFileId] = useState(0);

    return (<>
    {/* <Navbar setSection={setSection}/> */}
        <div className="d-flex" style={{ height: "calc(100vh - 0px)", overflowY: "auto" }}>
            <SildeBar setSection={setSection} />
            {(section === "myFile") && <ShowDocs section={section} setSection={setSection} setFileId={setFileId} />}
            {(section === "shared") && <ShowDocs section={section} setSection={setSection} setFileId={setFileId} />}
            {/* {section === "editor" && <TextEditor section={section} setSection={setSection} fileId={fileId} />}
            {section === "creator" && <TextEditor section={section} setSection={setSection} />} */}
            {section === "editor" && <PreviewDoc section={section} setSection={setSection} fileId={fileId} />}
            {section === "creator" && <CreateDoc section={section} setSection={setSection} />}
        </div>
        </>
    )
}