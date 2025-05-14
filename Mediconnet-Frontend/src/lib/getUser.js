import { BASE_URL } from "./utils";

const getUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      });
      const user = await res.json()
       return user;  
    } catch (err) {
      console.error(err.response);
    }
  };
  

  export default getUser;