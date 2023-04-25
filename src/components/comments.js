import { Modal, List, Tooltip, Form, Input, Button, Skeleton, message } from "antd"
import { LikeFilled, DislikeFilled, SendOutlined } from '@ant-design/icons';
import { Comment } from '@ant-design/compatible';
import moment from "moment";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import initApp from "../db";
import _ from 'lodash'

const CommentsModal = ({isOpen, onCancel, id})=>{
    const user = getAuth(initApp).currentUser
    const db = getFirestore(initApp)
    const [comments,setComments] = useState([])
    const [loading,setLoading] = useState(false)
    const [form] = Form.useForm()
    const fetchComment = async ()=>{
        const commentsRef = query(collection(db,'comments',id,'postComments'),orderBy('createdAt','desc'))
        onSnapshot(commentsRef,async (querySnapshot)=>{
            const comments = []
            setLoading(true)
            querySnapshot.forEach(async docs=>{
                const comment = {...docs.data()}
                comments.push(comment)
            })
            const newComments = []
            for (const comment of comments) {
                const userDoc = await getDoc(doc(db,comment.userRef))
                const newComment = {...comment,user: userDoc.data()}
                newComments.push(newComment)
            }

            setComments(newComments)
            setLoading(false)
        })
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
    useEffect(()=>{
        fetchComment()
        form.resetFields()
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
                itemLayout="vertical"
                dataSource={comments}
                renderItem={(item)=>(
                    <List.Item>
                        <Comment
                            author={item.user.name}
                            avatar={item.user.avatar}
                            content={item.content}
                            datetime={moment(item.createdAt.toDate()).fromNow()}
                            actions={[<Tooltip title='Like'><LikeFilled/></Tooltip>,<Tooltip title='Dislike'><DislikeFilled/></Tooltip>,<span>Reply to</span>]}
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