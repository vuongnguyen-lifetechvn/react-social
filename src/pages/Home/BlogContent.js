import { Avatar, Button, Card, Dropdown, Form, Input, List, Modal, Skeleton, Space, Tooltip, message } from "antd"
import Meta from "antd/es/card/Meta";
import { HeartOutlined, CommentOutlined, EllipsisOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import initApp from "../../db";
import moment from "moment";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './all.css'
const BlogContent = () => {
    const user = getAuth(initApp).currentUser;
    const db = getFirestore(initApp)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenMoDal] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [postId, setPostId] = useState('')
    const [form] = Form.useForm()
    const [formEdit] = Form.useForm()
    const { confirm } = Modal;

    const colRef = collection(db, 'posts', user.uid, 'userPosts');

    const toggleModal = () => {
        setOpenMoDal(!openModal)
    }
    const toggleEdit = ()=>{
        setOpenEdit(!openEdit)
    }
    const showConfirmDelete = (id)=>{
        confirm({
            title: 'Are you sure delete this post?',
            icon: <ExclamationCircleFilled/>,
            onCancel: ()=>{},
            onOk: async ()=>{
                message.open({key:'delete', type:'loading',content:'Deleting...'})
                await deleteDoc(doc(db,'posts',user.uid,'userPosts',id)).then(async ()=>{
                    await deleteDoc(doc(db,'comments',id))
                    message.open({key:'delete', type:'success',content:'Deleting post success!'})
                }).catch(err=>console.log(`Error: ${err.code}`))
            }
        })
    }

    const fetchPosts = async ()=>{
        const postRef = query(colRef, orderBy('createdAt','desc'));
        onSnapshot(postRef, (querySnaphot)=>{
            const posts = []
            querySnaphot.forEach(doc=>{
                const post = {...doc.data(), id: doc.id}
                posts.push(post)
            })
            setPosts(posts)
            setLoading(false)
        })
    }

    const saveBlog = (values) => {
        const messKey = 'createBlog'
        const data = {
            title: values['title'],
            content: values['content'] ? values['content'] : '',
            createdAt: new Date(),
            updatedAt: null
        }
        message.open({ key: messKey, type: 'loading', content: 'Creating post...' })
        addDoc(colRef, data).then(
            message.open({ key: messKey, type: 'success', content: 'Creating post successfully' })
        ).catch(err => {
            message.open({ key: messKey, type: 'error', content: err.code })
        }).finally(
            toggleModal()
        )
    }
    const updateBlog = (values)=>{
        const blogRef = doc(db,'posts',user.uid,'userPosts',postId)
        const data = {
            title: values['title'],
            content: values['content'],
            updatedAt: new Date()
        }
        updateDoc(blogRef,data).catch(err=>console.log(`Error: ${err.code}`))
        toggleEdit()
    }
    

    const onFinishFail = (values) => {
        console.log(`Error: ${values}`);
    }

    useEffect(()=>{
        fetchPosts()
    },[])
    return (
        <>
            <Space direction="vertical" size={24} >
                <Button type="primary" onClick={toggleModal}>Create new blog</Button>
                <Skeleton loading={loading} active>
                    {posts && posts.length > 0 ?
                        <List
                            grid={{
                                gutter: 16,
                                xs: 1,
                                sm: 2,
                                md: 2,
                                lg: 2,
                                xl: 2,
                            }}
                            itemLayout="horizontal"
                            size="large"
                            dataSource={posts}
                            renderItem={(item) => (
                                <List.Item style={{ margin: '10px 0', padding: 0, minHeight: 280, minWidth: '60%' }}>
                                    <Card
                                        key={item.id}
                                        actions={[
                                            <HeartOutlined key="like" />,
                                            <CommentOutlined key="comment" />,
                                            <EditOutlined key="edit" onClick={() => {
                                                setPostId(item.id)
                                                formEdit.setFieldsValue({
                                                    'title': item.title,
                                                    'content': item.content
                                                })
                                                toggleEdit()
                                            }} />,
                                            <DeleteOutlined key="delete" onClick={()=>{
                                                showConfirmDelete(item.id)  
                                            }}/>,
                                            <EllipsisOutlined key="ellipsis" />
                                        ]}
                                        extra={<a onClick={(e) => { e.preventDefault() }}>Read more</a>}
                                    >
                                        <Meta
                                            avatar={<Avatar src={user.photoURL} />}
                                            title={item.title}
                                            description={<p><span style={{ fontWeight: 'bold', color: 'gray' }}>{user.displayName}</span>  .  <Tooltip title={`${moment(item.createdAt && item.createdAt.toDate()).format('DD-MM-YYYY, h:mm:ss a')}`}>{moment(item.createdAt && item.createdAt.toDate()).fromNow()}</Tooltip></p>}
                                        />
                                        {item.content !== "" ? <div dangerouslySetInnerHTML={{ __html: item.content }}></div> : <p>There is no content</p>}
                                    </Card>
                                </List.Item>
                            )}
                        />
                        : <h4 style={{ textAlign: 'center' }}>You don't have any blog</h4>}
                </Skeleton>
            </Space>
            <Modal
                title='Create new blog'
                open={openModal}
                onCancel={toggleModal}
                okText="Create"
                onOk={() => {
                    form.validateFields().then((values) => {
                        form.resetFields()
                        saveBlog(values)
                    }).catch(err => 0)
                }}
            >
                <Form
                    form={form}
                    name="blog"
                    layout="vertical"
                    onFinishFailed={onFinishFail}
                >
                    <Form.Item
                        name='title'
                        label='Title'
                        rules={[{ required: true, message: 'Please input title!', whitespace: false }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name='content'
                        label='Content'
                    >
                        <ReactQuill theme="snow" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                key='modal-edit'
                title='Edit'
                open={openEdit}
                onCancel={toggleEdit}
                okText="Save"
                onOk={() => {
                    formEdit.validateFields().then((values) => {
                        formEdit.resetFields()
                        updateBlog(values)
                    }).catch(err => 0)
                }}
            >
                <Form
                    form={formEdit}
                    name="blog"
                    layout="vertical"
                    onFinishFailed={onFinishFail}
                >
                    <Form.Item
                        name='title'
                        label='Title'
                        rules={[{ required: true, message: 'Please input title!', whitespace: false }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name='content'
                        label='Content'
                    >
                        <ReactQuill theme="snow" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default BlogContent