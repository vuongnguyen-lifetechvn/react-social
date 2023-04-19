import { getAuth } from "firebase/auth"
import initApp from "../../db"
import { getFirestore, doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { Skeleton } from "antd";

const HomeContent = ()=>{
    const auth = getAuth(initApp)
    const db = getFirestore(initApp)
    const user = auth.currentUser;
    const [value,loading,error] =  useDocument(doc(db,'users',user.uid),{snapshotListenOptions: { includeMetadataChanges: true },});
    return(
       <div>
        {error&&<span>Error: {error}</span>}
        {loading&&<Skeleton active></Skeleton>}
        {!loading&&value&&<h1>Wellcome back, <span style={{color:'blueviolet'}}>{value.data().name}</span></h1>}
       </div>
    )
}

export default HomeContent