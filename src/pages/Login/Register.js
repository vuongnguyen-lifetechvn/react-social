import React from "react"
import {Form, Input, message, Checkbox, Button, DatePicker} from "antd"
import { LockOutlined,MailOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import initApp from '../../db.js'
import './all.css'

const auth = getAuth(initApp);
const db = getFirestore(initApp)
const RegisterPage = ()=>{
    const navigate = useNavigate();
    const onFinish = values => {
        const messKey = 'register';
        var messInfo = {key:messKey};
        message.open({key:messKey, type:'loading', content: 'Sign up...'})
        const data = {
            name: values['username'],
            email: values['email'],
            dob: values['dateOfBirth'].format('YYYY-MM-DD'),
            createdAt: new Date(),
            updateAt: null
        }
        createUserWithEmailAndPassword(auth,values['email'],values['password']).then(async (userCredential)=>{
            const user = userCredential.user;
            await setDoc(doc(db,"users",user.uid),data);
            messInfo = {...messInfo,type:'success',content:'Sign up successfully'}
            setTimeout(navigate('/login'),2000)
        }).catch(err=>{
            messInfo = {...messInfo,type:'error'};
            switch (err.code) {
                case 'auth/email-already-exists':
                    messInfo = {...messInfo,content:'Email already exists'}
                    break;
                default:
                    messInfo = {...messInfo,content:'Invalid error'}
                    console.log(err.code);
                    break;
            }
        }).finally(()=>{
            message.open(messInfo)
        })
      };
    
      return (
        <div className="page">
          <div className="box">
            <div className="illustration-wrapper">
              <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp" alt="Login"/>
            </div>
            <Form
              name="form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <h1 className="form-title">Sign in</h1>
              <p>Create new account</p>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your email!' }, {type:'string', whitespace: false}]}
              >
                <Input
                    prefix={<UserOutlined />}
                    placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name='dateOfBirth'
                rules={[{required:true, type:'date', message:'Please input your birthday!'}]}
              >
                <DatePicker style={{width:'100%',minHeight:'48px'}} placeholder="Date of Birth" prevIcon ={<CalendarOutlined/>}/>
              </Form.Item>
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
              <Form.Item
                name="confirm-password"
                dependencies={['password']}
                rules={[{ required: true, message: 'Please input confirm password!' },
                    ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),]}
              >
                <Input.Password 
                  prefix = {<LockOutlined />}
                  placeholder="Confirm Password"
                />
              </Form.Item>
              <Form.Item name="agreement"
                    valuePropName="checked"
                    rules={[
                    {
                        validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
                    },
                    ]}>
                <Checkbox>I have read the <span style={{color:'blue', fontWeight:'bold'}}>agreement</span></Checkbox>
              </Form.Item>
    
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  REGISTER
                </Button>
                <Button type="none" onClick={()=>navigate('/login')} className="login-form-button">
                  Back to sign in
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      );
}

export default RegisterPage;