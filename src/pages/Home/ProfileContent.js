import { Button, DatePicker, Form, Input, Row, Skeleton, Space, Upload, message } from "antd"
import {PlusOutlined } from "@ant-design/icons";
import { useDocumentOnce } from "react-firebase-hooks/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import initApp from "../../db";
import { getAuth, updateProfile } from "firebase/auth";
import {  doc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import moment from "moment/moment";

const ProfileContent = ()=>{
    const user = getAuth(initApp).currentUser;
    const db = getFirestore(initApp)
    const storage = getStorage(initApp)
    const formRef = useRef(null)
    const [fileList, setFileList] = useState([]);
    const docRef = doc(db,'users',user.uid)
    const [value, loading, error] = useDocumentOnce(docRef);
    const onReload = ()=>{
        value && formRef.current?.setFieldsValue({
            email: value.data().email,
            dob: moment(value.data().dob.toDate()),
            name: value.data().name,
        })
        setFileList([{uid:user.uid,url:user.photoURL}])
    }
    const onChange=({fileList: newFileList})=>{
        setFileList(newFileList)
    }
    useEffect(()=>{
        onReload()
    },[value])
    const onFinish = async (values)=>{
        const messKey = 'updateprofile'
        var data = {
            name: values['name'],
            dob: new Date(values['dob'].format('YYYY-MM-DD')),
            updatedAt: new Date(),
        }
        message.open({key:messKey, type:'loading', content:'Updating...'})
        if(values['image']!== undefined){
            const file = values['image'].file;
            const fileExtension = file.name.split('.').pop();
            const storageRef = ref(storage,`avatar/${user.uid}.${fileExtension}`)
            const uploadFile = await uploadBytes(storageRef,file)
            const photoURL = await getDownloadURL(uploadFile.ref)
            await updateProfile(user, {photoURL: photoURL})
            data = {...data, avatar: photoURL}
        }
        updateDoc(doc(db,'users',user.uid),data).then(async ()=>{
            await updateProfile(user,{displayName: data.name})
            message.open({content:'Update profile successfully', type: 'success', key:messKey})
        }).catch(err=>{
            message.open({type: 'error', key:messKey, content:`Error: ${err.code}`})
        })
    }
    return(
        <Skeleton active loading = {loading}>
            {error&&<h4 style={{textAlign:'center', color:'red'}}>Catch error:  {error}</h4>}
            {value&&<h3 style={{marginLeft: '3em', color:'#3498DB'}}>{`${value.data().name}'s Profiles`}</h3>}
            <Form
                labelCol={{span:8}}
                wrapperCol={{span:16}}
                layout="horizontal"
                style={{maxWidth: 600}}
                ref={formRef}
                onFinish={onFinish}
            >
                <Form.Item
                    name='email'
                    label = 'Email'
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    name='name'
                    label = 'Username'
                    rules={[{required:true, message:'Please input your Name', whitespace:true}]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name='dob'
                    label='Date of Birth'
                    rules={[{required: true, message:'Please input tour date of birth'},()=>({
                        validator(_,value){
                            if(!value||new Date(value.format('YYYY-MM-DD')) < new Date()){
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Please input valid date'));
                        }
                    })]}
                >
                    <DatePicker style={{width: '100%'}}  format='DD-MM-YYYY'/>
                </Form.Item>
                <Form.Item
                    name='image'
                    label='Image'
                >
                    
                    <Upload listType="picture-card" maxCount={1} accept="image/png, image/jpeg" beforeUpload={() => false} fileList={fileList} onChange={onChange} onRemove={() => false}>
                        <div>
                            <PlusOutlined/>
                            <div style={{marginTop:8}}>
                                Upload
                            </div>
                        </div>
                    </Upload>
                </Form.Item>
                <Row justify={'center'} >
                <Space direction="horizontal">
                    <Form.Item>
                        <Button type="default" onClick={onReload}>Reload</Button>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Update</Button>
                    </Form.Item>
                </Space>
                </Row>
            </Form>
        </Skeleton>
    )
}

export default ProfileContent;