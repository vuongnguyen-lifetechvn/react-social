import { getAuth } from "firebase/auth"
import initApp from "../../db"
import { getFirestore, collection, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { Avatar, Button, Card, Col, List, Skeleton, Space, Tooltip } from "antd";
import { HeartOutlined, CommentOutlined,EllipsisOutlined} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Meta from "antd/es/card/Meta";
import moment from "moment";

const HomeContent = ()=>{
    const auth = getAuth(initApp)
    const db = getFirestore(initApp)
    const user = auth.currentUser;
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(false)

    const fetchData = async ()=>{
        setLoading(true)
        const posts = []
        const following = []
        const followRef = collection(db,'following',user.uid,'userFollowing')
        getDocs(followRef).then(snap=>{
            snap.docs.map(doc=>{
                const temp = {...doc.data(),uid: doc.id}
                following.push(temp)
            })
            following.push({uid: user.uid, email: user.email, name:user.displayName, avatar: user.photoURL})
            following.map(async follower=>{
                const docs = await getDocs(query(collection(db,'posts',follower.uid,'userPosts'),orderBy('createdAt','desc')))
                docs.docs.map(doc=>{
                    const temp = {...doc.data(), follower: follower}
                    posts.push(temp)
                    setData(posts)
                })
            })
        }).finally(()=>{
            setLoading(false)
        })
    }

    useEffect(()=>{
        fetchData()
    },[])

    return(
       <Space direction="vertical">
        <h2>Wellcome back, <span style={{color:'#FF6F61'}}>{user.displayName}</span></h2>
        <Skeleton loading ={loading} active>
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 6,
                    xxl: 3,
                }}
                style={{marginLeft:24, marginTop: 8}}
                dataSource={data}
                renderItem={(item,index)=>(
                    <List.Item>
                            <Card
                                style={{minWidth: 400}}
                                key={index}
                                actions={[
                                <HeartOutlined  key="like" />,
                                <CommentOutlined key="comment" />,
                                <EllipsisOutlined key="ellipsis" />,
                                ]}
                                xtra={<a onClick={(e)=>{e.preventDefault()}}>Read more</a>}
                            >
                            <Meta
                                avatar={<Avatar src= {item.follower.avatar} />}
                                title={item.title}
                                description={<p><span style={{fontWeight:'bold', color:'gray'}}>{item.follower.name}</span>  .  <Tooltip title={`${moment(item.createdAt&&item.createdAt.toDate()).format('DD-MM-YYYY, h:mm:ss a')}`}>{moment(item.createdAt&&item.createdAt.toDate()).fromNow()}</Tooltip></p>}
                                />
                                <p>{`${item.content !== "" ?item.content: "There is no content" }`}</p>
                            </Card>
                    </List.Item>
                )}
            />
        </Skeleton>
       </Space>
    )
}

export default HomeContent