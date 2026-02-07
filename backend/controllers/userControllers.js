import * as userServices from '../services/userServices.js';


{/*implement later */}
export const registerUser = async (req, res) => {
  const userData = req.body;
    try {
        
    } catch (e) {
        
    }
}



export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  
    try {
        const user = await userServices.loginUser(email, password, role);
        if (user) {
          res.status(200).json({ message: "Login successful", data: user });
        } else {
          res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to login user" });
        
    }
}