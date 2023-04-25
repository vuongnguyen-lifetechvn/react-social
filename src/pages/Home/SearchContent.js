import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Divider, Form, Input, List, Space, message } from 'antd';
import { useState } from 'react';
import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, query, setDoc, where } from "firebase/firestore";
import initApp from '../../db';

const SearchContent = () => {
    const db = getFirestore(initApp)
    const user = getAuth(initApp).currentUser
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const searchData = async (values) => {
        const name = values['search'] === undefined ? '' : values['search']
        const queryRef = query(collection(db, 'users'), where('__name__', '!=', user.uid))
        onSnapshot(queryRef, async (querySnapshot) => {
            setLoading(true)
            const datas = [];
            querySnapshot.forEach(doc => {
                if (doc.data().name.includes(name) || doc.data().name.includes(name.toUpperCase())) {
                    datas.push({ ...doc.data(), uid: doc.id })
                }
            })
            const newDatas = []
            for (const data of datas) {
                let isFollowing = false;
                const userDoc = await getDoc(doc(db, 'following', user.uid, 'userFollowing', data.uid))
                if (userDoc.exists()) {
                    isFollowing = true
                }
                const newData = { ...data, isFollowing: isFollowing }
                newDatas.push(newData)
            }
            setData(newDatas)
            setLoading(false)
        })
    }
    async function followUser(item) {
        const docRef = doc(db, 'following', user.uid, 'userFollowing', item.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            deleteDoc(docRef).then(() => {
                message.success(`You are unFollowed ${item.name}`)
                searchData({search: ''});
            })
        }
        else {
            setDoc(docRef, {}).then(() => {
                message.success(`You are Following ${item.name}`)
                searchData({search: ''});
            }).catch(err => message.error(`Error: ${err.code}`))
        }
    }
    return (
        <>
            <Form
                onFinish={searchData}
                layout='inline'
            >
                <Form.Item
                    style={{ width: '40%' }}
                    name='search'
                >
                    <Input placeholder='User name' prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item>
                    <Button htmlType='submit'>
                        <SearchOutlined />
                    </Button>
                </Form.Item>
            </Form>
            <List
                pagination
                loading={loading}
                dataSource={data}
                renderItem={(item) => (
                    <Col span={24}>
                        <List.Item
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar src={`${item.avatar}`} />
                                }
                                title={item.name}
                                description={item.email}
                            />
                            <Space size={'small'}>
                                <Button >Details</Button>
                                <Divider type='vertical' />
                                <a onClick={(e) => { e.preventDefault(); followUser(item); }}>{item.isFollowing ? `unFollow` : `Follow`}</a>
                            </Space>
                        </List.Item>
                    </Col>
                )}
            />
        </>

    )
}

export default SearchContent