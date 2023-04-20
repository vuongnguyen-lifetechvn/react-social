import {SearchOutlined} from '@ant-design/icons';
import { Avatar, Button, Col, Divider, Form, Input, List, Space, message } from 'antd';
import { useState } from 'react';
import { getAuth } from "firebase/auth";
import {  addDoc, collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import initApp from '../../db';

const SearchContent = ()=>{
    const db = getFirestore(initApp)
    const user = getAuth(initApp).currentUser
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const searchData = async(values)=>{
        setData([])
        setLoading(true)
        const name = values['search'] === undefined ? '' : values['search']
        const data = [];
        const queryRef = query(collection(db,'users'),where('__name__','!=',user.uid))
        getDocs(queryRef).then((snapShot=>{
            snapShot.forEach(doc=>{
                if(doc.data().name.includes(name)||doc.data().name.includes(name.toUpperCase()))
                    data.push({...doc.data(),uid:doc.id})
            })
        })).catch(err=>console.log(`Error: ${err.code}`))
           .finally(()=>{
            setData(data)
            setLoading(false)
        })
    }
    async function followUser (item){
        const docRef = doc(db,'following',user.uid,'userFollowing',item.uid)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists()){
            message.error(`You are followed ${item.name}`)
            return;
        }
        const data = {
            name: item.name,
            avatar: item.avatar,
            email: item.email
        }
        console.log(data);
        setDoc(docRef,data).then(
            message.success(`You are following ${item.name}`)
        ).catch(err=>message.error(`Error: ${err.code}`))
    }
    return (
        <>
        <Form
            onFinish={searchData}
            layout='horizontal'
            >
            <Space direction='horizontal' align='center'>
                <Form.Item
                    name='search'
                    label='Search User'
                >
                    <Input placeholder='User name' />
                </Form.Item>
                <Form.Item>
                    <Button htmlType='submit'>
                        <SearchOutlined/>
                    </Button>
                </Form.Item>
            </Space>
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
            <Space>
                <Button >Details</Button>
                <Divider type='vertical' />
                <a onClick={(e)=>{e.preventDefault(); followUser(item);}}>Follow</a>
            </Space>
          </List.Item>
          </Col>
        )}
      />
        </>
        
    )
}

export default SearchContent