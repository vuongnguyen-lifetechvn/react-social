import React, { useEffect, useState } from 'react';
import { Divider, Layout,Menu,Skeleton,theme } from 'antd';
import { HomeOutlined,BookOutlined, UserOutlined, SettingOutlined, LogoutOutlined, LoginOutlined, SearchOutlined} from '@ant-design/icons';
import HomeContent from './Content/HomeContent';
import BlogContent from './Blog/BlogContent'
import ProfileContent from './Profile/ProfileContent';
import { useNavigate } from 'react-router-dom';
import initApp from '../../db';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import SearchContent from './Search/SearchContent';
import './all.css'

const { Header, Footer, Content } = Layout;

const HomePage =  ()=>{
    const navigate = useNavigate();
    const auth = getAuth(initApp)
    const [user,setUser] = useState();
    const [currentContent,SetcurrentContent] = useState();
    useEffect(()=>{
            onAuthStateChanged(auth,(user)=>{
                if(user){
                setUser(user)
                }
               else{
                navigate('/login')
               }
            })
        SetcurrentContent(<HomeContent/>)
    },[user,auth])
    const {
        token: { colorBgContainer },
      } = theme.useToken();
    const menuItems = [{
        label: 'Home',
        key: 'home',
        icon: <HomeOutlined />,
    }, {
        label:'Blogs',
        key:'blog',
        icon:<BookOutlined />
    }, {
        label:'Profiles',
        key:'profile',
        icon:<UserOutlined />
    },{
        label:'Search',
        key:'search',
        icon:<SearchOutlined />
    }, {
        label:'Settings',
        key:'setting',
        icon:<SettingOutlined />,
        children:[
            !user?{
                key:'signin',
                label:"Sign In",
                icon:<LoginOutlined />,
                onClick: ()=>navigate('/login')
            }:{
                key:'signout',
                label:"Sign out",
                icon:<LogoutOutlined />,
                onClick:()=> {
                    signOut(auth)
                    navigate('/login')
                 }
            },
            {
                type:'divider'
            },
        ]
    }]
    const changeContent = (e)=>{
        if(!user) return 0;
        switch (e.key) {
            case 'home':
                SetcurrentContent(<HomeContent/>)
                break;
            case 'blog':
                SetcurrentContent(<BlogContent/>)
            break;
            case 'profile':
                SetcurrentContent(<ProfileContent/>)
            break;
            case 'search':
                SetcurrentContent(<SearchContent/>)
            break;
            default:
                break;
        }

    }
    return(
      <Layout style={{minHeight:'100vh', backgroundColor:'#ffffff'}}>
            <Header
            style={{
                display:'flex',
                justifyContent:'center',
                backgroundColor:'#ffffff',
                height: 90,
                padding: '16px 35px'
              }}
            >
                    <Menu
                    style={{fontSize: 17, minWidth: 540}}
                    mode='horizontal'
                    defaultSelectedKeys={['home']}
                    items={menuItems}
                    onClick={changeContent}
                    >
                    </Menu>
            </Header>
            <Content
                 style={{
                    margin: '24px 16px',
                    padding: 24,
                    minHeight: 280,
                    background: colorBgContainer,
                    display:'flex',
                    justifyContent:'center'
                  }}
            >
                {user?currentContent:<Skeleton active/>}
            </Content>
            <Footer>
                  <h3 style={{textAlign:'center'}}>Ant Design ©2023 Created by Ant UED</h3>
            </Footer>
        </Layout>
    )
}

export default HomePage