import { getAuth } from "firebase/auth"
import initApp from "../../db"
import { getFirestore, collection, getDoc, query, orderBy, doc, onSnapshot, getDocs, collectionGroup } from 'firebase/firestore';
import { List, Skeleton, Space, Avatar, Card, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { HeartOutlined, CommentOutlined, EllipsisOutlined } from "@ant-design/icons";
import moment from "moment";
import Meta from "antd/es/card/Meta";
import Comments from "../../components/comments";
import './all.css'
const HomeContent = () => {
    const auth = getAuth(initApp)
    const db = getFirestore(initApp)
    const user = auth.currentUser;
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
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
    const toggleModal = (id) => {
        setPostId(id)
        setOpenModal(!openModal)
    }
    const onCancel = ()=>{
        setOpenModal(!openModal)
    }

    useEffect(() => {
        fetchData()
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
                                        <HeartOutlined key="like" />,
                                        <CommentOutlined key="comment" onClick={() => toggleModal(item.id)} />,
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
            <Comments isOpen={openModal} onCancel={onCancel} id={postId} />
        </>
    )
}


export default HomeContent