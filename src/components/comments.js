import { Modal, List, Form, Input, Button, Skeleton, message, Space } from "antd"
import { SendOutlined } from '@ant-design/icons';
import { Comment } from '@ant-design/compatible';
import moment from "moment";
import React, { useEffect, useState } from "react";
import { addDoc, collection, collectionGroup, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import initApp from "../db";

const CommentsModal = ({isOpen, onCancel, id})=>{
    const user = getAuth(initApp).currentUser
    const db = getFirestore(initApp)
    const [comments,setComments] = useState([])
    const [emoji, setEmoji] = useState([]);
    const [loading,setLoading] = useState(true)
    const [form] = Form.useForm()
    const fetchComment = async ()=>{
        setLoading(true)
        const commentsRef = query(collection(db,'comments',id,'postComments'),orderBy('createdAt','desc'))
        const reactionsRef = query(collectionGroup(db,'emojiComment'),where('postId','==',id))
        const blockingRef = collection(db,'blocking',user.uid,'userBlocking')
        const blockUser = []
        const userDocs = await getDocs(blockingRef)
        userDocs.forEach(user=>{
            blockUser.push(user.id)
        })
        onSnapshot(commentsRef,async (querySnapshot)=>{
            const comments = []
            querySnapshot.forEach(async docs=>{
                const comment = {...docs.data(), commentId: docs.id}
                comments.push(comment)
            })
            const newComments = []
            for (const comment of comments) {
                const userDoc = await getDoc(doc(db,comment.userRef))
                if (!blockUser.includes(userDoc.id)) {
                    const newComment = {...comment,user: userDoc.data()}
                    newComments.push(newComment)
                } else {
                    continue;
                }
            }
            setComments(newComments)
        })

        onSnapshot(reactionsRef, async snapshots=>{
            const reactions = []
            snapshots.forEach(async snapshot=>{
                const reactionDoc = await getDoc(doc(db,snapshot.data().emojiRef))
                const img = `https://firebasestorage.googleapis.com/v0/b/vuongnguyen-social.appspot.com/o/emoji%2F${reactionDoc.data().title}.png?alt=media`
                const reaction = {...reactionDoc.data(), img:img, commentId: snapshot.id}
                reactions.push(reaction)
                console.log(reaction);
            })
        })

    }

    const fetchEmoji = async ()=>{
        const data = []
        const emojiRef = query(collection(db, 'emoji'), orderBy('index', 'asc'))
        const emojiDocs = await getDocs(emojiRef)
        emojiDocs.forEach(emojiDoc => {
            const img = `https://firebasestorage.googleapis.com/v0/b/vuongnguyen-social.appspot.com/o/emoji%2F${emojiDoc.data().title}.png?alt=media`
            const item = { ...emojiDoc.data(), id: emojiDoc.id, img: img}
            data.push(item)
        })
        setEmoji(data)
    }

    const sendComment = (values)=>{
        const commentRef = collection(db,'comments',id,'postComments')
        const data = {
            userRef: `users/${user.uid}`,
            content: values['content'],
            createdAt: new Date()
        }
        addDoc(commentRef,data).catch(err=>message.error('Error: '+err.code))
        form.resetFields()
    }

    const sendEmoji = async (emoji, commentId)=>{
        const emojiRef = doc(db, 'reaction', user.uid,'emojiComment',commentId)
        const emojiDoc = await getDoc(emojiRef)
        var data = {
            emojiRef: `emoji/${emoji.id}`
        }
        if(emojiDoc.exists()){
            data = {...data, updatedAt: new Date()}
            await updateDoc(emojiRef,data)
        }else{
            data = {...data, createdAt: new Date()}
            await setDoc(emojiRef, data)
        }
    }

    useEffect(()=>{
        if (id !== ' ') {
            (async ()=>{
                form.resetFields()
                await fetchComment()
                await fetchEmoji()
            })()
        }
        setLoading(false)
    },[id])
    return (
        <Modal
            forceRender 
            open ={isOpen}
            onCancel={onCancel}
            title={`Comments`}
            footer={null}
        >
           <Skeleton active loading={loading}>
            <List
                style={{marginBottom:8}}
                pagination={{pageSize: 3}}
                itemLayout="vertical"
                dataSource={comments}
                renderItem={(item)=>(
                    <List.Item>
                        <Comment
                            author={item.user.name}
                            avatar={item.user.avatar}
                            content={item.content}
                            datetime={moment(item.createdAt.toDate()).fromNow()}
                            actions={[
                                <Space>
                                {emoji&&emoji.map((e,index)=>(
                                    <React.Fragment key={index}>
                                    <img style={{maxWidth: 36, maxHeight: 36}} src={e.img} alt={e.title} onClick={()=> sendEmoji(e, item.commentId)}/>
                                    <p>0</p>
                                    </React.Fragment>
                                ))}
                                </Space>
                            ]}
                        >
                        </Comment>
                    </List.Item>  
                )}
            >
            </List>
           </Skeleton>
           <Form
           form={form}
           layout="inline"
           style={{marginLeft:'32px'}}
           onFinish={sendComment}
           >
              
               <Form.Item
                    name='content'
                    style={{width:'85%'}}
                    rules={[{
                        required:true,message:'This field is required'
                    }]}
                >
                    <Input.TextArea rows={2} showCount maxLength={100} style={{resize:'none'}}/>
                </Form.Item>
                    <Form.Item>
                        <Button icon={<SendOutlined/>} type="ghost" style={{marginTop:'8px'}} htmlType="submit">
                    </Button>
                </Form.Item>
               
            </Form>
        </Modal>
    )
}

export default CommentsModal