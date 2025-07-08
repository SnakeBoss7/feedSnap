import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../../services/firebase";
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;
export const Login =()=>
{
    const handleGoogleLogin = async () =>
        {
            try
            {
                const result = await signInWithPopup(auth, provider); 
                const token = await result.user.getIdToken();
                console.log(token);
                let res = axios.post(`${apiUrl}/api/auth/firebase`,token);
                console.log('Login success',res);
            }catch(err)
            {
                console.err('login failed',err);
            }
        }

        return(
            <>
                <div>
                    <button onClick={handleGoogleLogin}></button>
                </div>
            </>
        );
}