import { Avatar, Button, Card, Form, Input, List, Modal, Skeleton, Space, message } from "antd"
import Meta from "antd/es/card/Meta";
import { HeartOutlined, CommentOutlined,EllipsisOutlined, EditOutlined, DeleteOutlined} from "@ant-design/icons";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore,collection, addDoc, query, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import initApp from "../../db";
import moment from "moment";

const BlogContent = ()=>{
    
    const user = getAuth(initApp).currentUser;
    const db = getFirestore(initApp)
    const colRef = collection(db,'posts',user.uid,'userPosts');
    const [openModal, setOpenMoDal] = useState(false)
    const [form] = Form.useForm()
    const btnItems = [{
        label: 'Edit',
        key: 'edit',
        icon: <EditOutlined />,
    },{
        label: 'Delete',
        key: 'delete',
        icon: <DeleteOutlined />,
    }]
    const toggleModal = ()=>{
        setOpenMoDal(!openModal)
    }
    const [value,loading,error] = useCollection(query(colRef,orderBy('createdAt','desc')),{snapshotListenOptions: { includeMetadataChanges: true },});
    const saveBlog = (values)=>{
        const messKey = 'createBlog'
        const data = {
            title: values['title'],
            content: values['content']?values['content']: '',
            createdAt: new Date(),
            updatedAt: null
        }
        message.open({key:messKey, type:'loading', content:'Creating post...'})
        addDoc(colRef,data).then(
            message.open({key:messKey,type:'success', content: 'Creating post successfully'})
        ).catch(err=>{
            message.open({key:messKey,type:'error', content: err.code})
        }).finally(
            toggleModal()
        )
    }
    return(
        <>
        <Space direction="vertical" size={24} >
        <Button type="primary" onClick={toggleModal}>Create new blog</Button>
        {error&&<h4 style={{textAlign:'center', color:'red'}}>{error}</h4>}
        <Skeleton loading ={loading} active>
                {value&&value.docs.length > 0 ? 
                    <List
                        grid
                        itemLayout="horizontal"
                        size="default"
                        dataSource={value.docs}
                        renderItem={(doc,index)=>(
                            <List.Item style={{minWidth: 600, marginLeft: 16, marginTop: 8}}>
                                 <Card
                                key={index}
                                actions={[
                                <HeartOutlined  key="like" />,
                                <CommentOutlined key="comment" />,
                                <EllipsisOutlined key="ellipsis" />,
                                ]}
                                extra={<a onClick={(e)=>{e.preventDefault()}}>Read more</a>}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={user.photoURL}/>}
                                    title={doc.data().title}
                                    description={moment(doc.data().createdAt.toDate()).fromNow()}
                                />
                                {`${doc.data().content !== "" ? doc.data().content : "There is no content" }`}
                            </Card>
                            </List.Item>
                        )}
                    />
                : <h4 style={{textAlign:'center'}}>You don't have any blog</h4>}
        </Skeleton>
        </Space>
        <Modal 
            title = 'Create new blog' 
            open={openModal} 
            onCancel={toggleModal} 
            okText="Create"
            onOk={()=>{
                form.validateFields().then((values)=>{
                    form.resetFields()
                    saveBlog(values)
                })
            }}
            >
                <Form
                    form={form}
                    name="blog"
                    layout="vertical"
                >
                    <Form.Item
                        name='title'
                        label='Title'
                        rules={[{required:true,message:'Please input title!', whitespace:false}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name='content'
                        label='Content'
                    >
                        <Input.TextArea rows={15} />
                    </Form.Item>
                </Form>
        </Modal>
        </>
    )
}

export default BlogContent