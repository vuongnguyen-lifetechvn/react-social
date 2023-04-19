import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
const NotAuth = () => {
    const navigate = useNavigate();
    const backHome = ()=>{
        navigate('/login')
    }
    return (
    <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={<Button type="primary" onClick={backHome}>Back to login</Button>}
  />
  )
  };
export default NotAuth;