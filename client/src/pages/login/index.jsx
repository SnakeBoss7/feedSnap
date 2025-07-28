import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../services/firebase";
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

export const Login =()=>
{
    const navigate = useNavigate();
    const handleGoogleLogin = async () =>
        {
            try
            {
                const result = await signInWithPopup(auth, provider); 
                const token = await result.user.getIdToken();
                console.log("Frontend API URL:", apiUrl);
                console.log(token);
                let res = await  axios.post(`${apiUrl}/api/auth/firebase`,{idToken:token},
                    {
                        withCredentials:true
                    });
                console.log('Login success',res);
                navigate("/dashboard");
            }catch(err)
            {
                console.log('login failed',err);
            }
        }

        return(
            <>
                <div>
                    <button className="bg-black" onClick={handleGoogleLogin}>Click here to loging using gooel</button>
                </div>
            </>
        );
}