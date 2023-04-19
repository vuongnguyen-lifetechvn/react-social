import React from "react"
import {Form, Input, message, Checkbox, Button, Space} from "antd"
import { LockOutlined,MailOutlined, GoogleCircleFilled, GithubFilled } from "@ant-design/icons";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { getFirestore, getDoc, setDoc, doc } from 'firebase/firestore';
import initApp from '../../db.js'
import { useNavigate } from "react-router-dom";
import './all.css'
import moment from "moment";
const auth = getAuth(initApp)
const LoginPage = ()=>{
    const navigate = useNavigate();
    const onFinish = values => {
        const key = 'login'
        message.open({key:key,type:'loading', content:'Signing...'})
        signInWithEmailAndPassword(auth,values['email'],values['password']).then(()=>{
          message.open({key:key,type:'success', content:'Login successfully'})
            navigate('/')
        }).catch(err=>{
          message.open({key:key,type:'error', content:`Error: ${err.code}`})
        })
      };
      const signInWithGoogle = ()=>{
        const key = 'login'
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({prompt: 'select_account'})
        message.open({key:key,type:'loading', content:'Signing...'})
        signInWithPopup(auth,provider).then(async userCredential=>{
          const user = userCredential.user;
          const docRef = doc(getFirestore(initApp),"users",user.uid)
          const docSnap = await getDoc(docRef)

          if(!docSnap.exists()){
            setDoc(docRef,{
              email: user.email,
              name: user.displayName,
              dob: moment().format('YYYY-MM-DD'),
              createdAt: new Date(),
              updatedAt: null
            })
          }
          message.open({key:key,type:'success', content:'Login successfully'})
          navigate('/')
        }).catch(err=> message.open({key:key,type:'error', content:`Error: ${err.code}`}))
      }
      const signInWithGithub= ()=>{
        const key = 'login'
        const provider = new GithubAuthProvider();
        provider.setCustomParameters({prompt: 'select_account'})
        message.open({key:key,type:'loading', content:'Signing...'})
        signInWithPopup(auth,provider).then(async userCredential=>{
          const user = userCredential.user;
          const docRef = doc(getFirestore(initApp),"users",user.uid)
          const docSnap = await getDoc(docRef)

          if(!docSnap.exists()){
            setDoc(docRef,{
              email: user.email,
              name: user.displayName,
              dob: moment().format('YYYY-MM-DD'),
              createdAt: new Date(),
              updatedAt: null
            })
          }
          message.open({key:key,type:'success', content:'Login successfully'})
          navigate('/')
        }).catch(err=> message.open({key:key,type:'error', content:`Error: ${err.code}`}))
      }
      return (
        <div className="page">
          <div className="box">
            <div className="illustration-wrapper">
              <img src="https://mixkit.imgix.net/art/preview/mixkit-left-handed-man-sitting-at-a-table-writing-in-a-notebook-27-original-large.png?q=80&auto=format%2Ccompress&h=700" alt="Login"/>
            </div>
            <Form
              name="form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <p className="form-title">Welcome back</p>
              <p>Login to the Website</p>
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }, {type:'email', message: 'Please input valid email'}]}
              >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                />
              </Form.Item>
    
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' },{min:6, message:'Password must be at least 6 characters'}]}
              >
                <Input.Password 
                  prefix = {<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>
    
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
    
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  LOGIN
                </Button>
                <Space></Space>
                <Button type="none" onClick={()=>navigate('/register')} className="login-form-button">
                  REGISTER
                </Button>
              </Form.Item>
              <Space direction="horizontal" size={'middle'}>
              <p style={{fontSize:'14px'}}>Sign in with: </p>
              <Button onClick={signInWithGoogle}><GoogleCircleFilled /></Button>
              <Button onClick={signInWithGithub}><GithubFilled /></Button>
              </Space>
            </Form>
          </div>
        </div>
      );
}

export default LoginPage