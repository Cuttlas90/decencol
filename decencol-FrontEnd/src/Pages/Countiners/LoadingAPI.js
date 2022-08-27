import '../../Styles/LoadingAPI.css'
export default function LoadingAPI(props) {
    return (
        <>
            <div className={"lds-default "+props.color}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </>
    )
}