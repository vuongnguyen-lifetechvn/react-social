import { } from '@ant-design/icons'
import { Divider, List, Modal, Skeleton, Space, Tooltip } from 'antd'
import { addDoc, collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore'
import initApp from '../db'
import { getAuth } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Comment } from '@ant-design/compatible';
import moment from 'moment'

const Emoji = ({ postId, onCancel, isOpened }) => {
    const db = getFirestore(initApp)
    const user = getAuth(initApp).currentUser
    const [emoji, setEmoji] = useState([]);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchEmoji = async () => {
        const data = []
        const emojiRef = query(collection(db, 'emoji'), orderBy('index', 'asc'))
        const emojiDocs = await getDocs(emojiRef)
        emojiDocs.forEach(emojiDoc => {
            const item = { ...emojiDoc.data(), id: emojiDoc.id }
            data.push(item)
        })
        setEmoji(data)
    }

    const fetchData = async () => {
        const blockingUser = []
        const ref = query(collectionGroup(db,'emojiPost'),orderBy('createdAt','asc'), where('postId','==',postId))
        const blockingDoc = await getDocs(collection(db,'blocking',user.uid,'userBlocking'))
        blockingDoc.forEach(snap=>{
            blockingUser.push(snap.id)
        })
        onSnapshot(ref, async (snapshot)=>{
            const reactions = []
            snapshot.forEach(async snap=>{
                    const userId = snap.ref.path.substring(9,37)
                    const reaction = {emojiRef: snap.data().emojiRef, uid: userId}
                    reactions.push(reaction)
            })

            const filtered = []
            for (const reaction of reactions) {
                if(!blockingUser.includes(reaction.uid)){
                    const userDoc = await getDoc(doc(db,'users',reaction.uid))
                    const reactDoc = await getDoc(doc(db,reaction.emojiRef))
                    const filter = {...reactDoc.data() ,user: userDoc.data()}
                    filtered.push(filter)
                }
            }
            setData(filtered)
        })
    }

    const sendEmoji = async (emoji)=>{
        const ref = doc(db,'reaction',user.uid,'emojiPost',postId)
        const docSnap = await getDoc(ref)
        var data = {
            emojiRef: `emoji/${emoji.id}`,
            postId: postId
        }
        if(docSnap.exists()){
            if(docSnap.data().emojiRef === `emoji/${emoji.id}`){
                await deleteDoc(ref);
            }else{
                data = {...data,updatedAt: new Date()}
                await updateDoc(ref,data)
            }
        }else {
            data = {...data,createdAt: new Date()}
            await setDoc(ref,data)
        }

    }
    useEffect(()=>{
        (async ()=>{
            await fetchEmoji()
        })()
    },[])

    useEffect(() => {
        (async ()=>{
            setLoading(true)
            if(postId !== ' '){
                await fetchData()
                setLoading(false)
               }
        })()
    }, [postId])
    return (
        <Modal
            title={'Emoji'}
            open={isOpened}
            onCancel={onCancel}
            footer={null}
            style={{position: 'relative'}}
        >
            <Skeleton active loading={loading}>
                <List
                    itemLayout='vertical'
                    dataSource={data}
                    renderItem={(item) =>( 
                        <List.Item>
                            <Comment
                                author={item.user.name}
                                avatar={item.user.avatar}
                                content={<img style={{maxHeight: 80, maxWidth: 80}} src={item.img} />}
                                //datetime={moment((item.updatedAt||item.createdAt).toDate()).fromNow()}
                            />
                        </List.Item>
                    )}
                />
                <Divider type='horizontal'/>
                <Space direction='horizontal' style={{position:'relative', left:'13%'}}>
                    {emoji && emoji.map((e,index)=> (
                        <Tooltip title={e.title} key={index}>
                            <img style={{maxWidth: 52, maxHeight: 52}} src={e.img} alt={e.title}  onClick={()=>sendEmoji(e)}/>
                        </Tooltip>
                    ))}
                </Space>
            </Skeleton>
        </Modal>
    )
}

export default Emoji