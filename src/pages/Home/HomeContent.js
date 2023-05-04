import { getAuth } from "firebase/auth"
import initApp from "../../db"
import { getFirestore, collection, getDoc, query, orderBy, doc, onSnapshot, getDocs, collectionGroup, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { List, Skeleton, Space, Avatar, Card, Tooltip, Dropdown } from "antd";
import { useEffect, useState } from "react";
import { CommentOutlined, EllipsisOutlined } from "@ant-design/icons";
import moment from "moment";
import Meta from "antd/es/card/Meta";
import Comments from "../../components/comments";
import Emoji from "../../components/emoji"

import './all.css'
const HomeContent = () => {
    const auth = getAuth(initApp)
    const db = getFirestore(initApp)
    const user = auth.currentUser;
    const [data, setData] = useState([])
    const [emojiPost, setEmojiPost] = useState([])
    const [emoji, setEmoji] = useState([])
    const [loading, setLoading] = useState(false)
    const [openComment, setOpenComment] = useState(false)
    const [openEmoji, setOpenEmoji] = useState(false)
    const [postId, setPostId] = useState(' ');
    const fetchData = async () => {
        setLoading(true)
        const followers = []
        const followRef = collection(db, 'following', user.uid, 'userFollowing')
        const followerDocs = await getDocs(followRef)
        followerDocs.forEach(follower=>{
            followers.push(follower.id);
        })
        followers.push(user.uid)
        const postRef = query(collectionGroup(db,'userPosts'), orderBy('createdAt','asc'));
        onSnapshot(postRef, async querySnap => {
            const posts = []
            querySnap.forEach(docs=>{
                const userId = docs.ref.path.substring(6,34)
                    const post = {...docs.data(),id: docs.id, uid: userId}
                    posts.push(post)
            })

            const newPosts = []
            for (const post of posts) {
                if(followers.includes(post.uid)){
                    const userDoc = await getDoc(doc(db,'users',post.uid))
                    const newPost = {...post, follower: userDoc.data()}
                    newPosts.push(newPost)
                }
            }
            setData(newPosts)
            setLoading(false)
        })
    }
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

    const fetchEmojiPost = async ()=>{
        const emojiRef = collectionGroup(db,'emojiPost');
        onSnapshot(emojiRef, async querySnaps=>{
            const emoji = []
            querySnaps.forEach(snap=>{
                if(snap.ref.path.substring(9,37) === user.uid){
                    const emo = {...snap.data(), postId: snap.id}
                    emoji.push(emo)
                }
            })

            const emojiPost = []
            for (const emo of emoji) {
                const emoRef = await getDoc(doc(db,emo.emojiRef))
                const item = {...emoRef.data(), ...emo}
                emojiPost.push(item)
            }
            setEmojiPost(emojiPost)
        })
    }

    const getEmojiPost = (postId)=>{
        const emoji = [...emojiPost]
        for (const e of emoji) {
            if(e.postId === postId){
                return e.img
            }
        }
        return 'https://firebasestorage.googleapis.com/v0/b/vuongnguyen-social.appspot.com/o/emoji%2Fdefault.png?alt=media';
    }

    const sendEmoji = async (emoji, postId)=>{
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

    const toggleModalComment = (id) => {
        setPostId(id)
        setOpenComment(!openComment)
    }
    const onCancelComment = ()=>{
        setOpenComment(!openComment)
    }

    const toggleModalEmoji = (id) => {
        setPostId(id)
        setOpenEmoji(!openEmoji)
    }
    const onCancelEmoji= ()=>{
        setOpenEmoji(!openEmoji)
    }

    useEffect(() => {
        fetchData()
        fetchEmojiPost()
        fetchEmoji()
    }, [])

    return (
        <>
            <Space direction="vertical">
                <h2>Wellcome back, <span style={{ color: '#FF6F61' }}>{user.displayName}</span></h2>
                <Skeleton loading={loading} active>
                    {data&&<List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 2,
                            lg: 2,
                            xl: 2,
                        }}
                        itemLayout="horizontal"
                        style={{ marginTop: 8 }}
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item style={{ margin: '10px 8px', padding: 0,minHeight:280, minWidth:'60%', overflow: 'auto'}}>
                                <Card
                                    key={item.id}
                                    actions={[
                                        <Dropdown trigger={['contextMenu']} menu={{items: emoji.map((e,index)=>({key:index, label: <img style={{maxWidth: 32, maxHeight: 32}} src={e.img} alt={e.title} onClick={()=>sendEmoji(e, item.id)}/>}))}}>
                                        <img style={{width:28, height: 28}} key="like" src={getEmojiPost(item.id)} alt={item.title} onClick={()=>toggleModalEmoji(item.id)}/>
                                        </Dropdown>,
                                        <CommentOutlined key="comment" onClick={() => toggleModalComment(item.id)} />,
                                        <EllipsisOutlined key="ellipsis" />,
                                    ]}
                                    extra={<a onClick={(e) => { e.preventDefault() }}>Read more</a>}
                                >
                                    <Meta
                                        avatar={<Avatar src={item.follower.avatar} />}
                                        title={item.title}
                                        description={<p><span style={{ fontWeight: 'bold', color: 'gray' }}>{item.follower.name}</span>  .  <Tooltip title={`${moment(item.createdAt && item.createdAt.toDate()).format('DD-MM-YYYY, h:mm:ss a')}`}>{moment(item.createdAt && item.createdAt.toDate()).fromNow()}</Tooltip></p>}
                                    />
                                    {item.content !== "" ? <div dangerouslySetInnerHTML={{__html: item.content}}></div> :<p>There is no content</p>  }
                                </Card>
                            </List.Item>
                        )}
                    />}
                </Skeleton>
            </Space>
            <Comments isOpen={openComment} onCancel={onCancelComment} postId={postId} />
            <Emoji isOpened={openEmoji} onCancel={onCancelEmoji} postId={postId} />
        </>
    )
}


export default HomeContent