import * as userServices from '../services/userServices.js';
import { signedToken } from '../middleware/authController.js';


{/*implement later */}
export const registerUser = async (req, res) => {
  const userData = req.body;
  
  try {
    // Basic validation
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      return res.status(400).json({ 
        message: "First name, last name, email, and password are required" 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }
    
    // Password length validation
    if (userData.password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }
    
    // Register the user
    const newUser = await userServices.registerUser(userData);
    
    res.status(201).json({ 
      message: "Customer registered successfully", 
      data: newUser 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Email already registered') {
      return res.status(409).json({ 
        message: "Email address is already registered. Please use a different email." 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to register user. Please try again." 
    });
  }
}



export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  
    try {
        const user = await userServices.loginUser(email, password, role);
        if (user) {

          const tokenPayload = {
            id: user.customer_id || user.staff_id,
            email: user.email,
            role: role === 'customer' ? 'customer' : role === 'staff' && user.is_admin ? 'admin' : 'staff',
          };

          const token = signedToken(tokenPayload);


          res.status(200).json({ message: "Login successful", data: user, token: token });
        } else {
          res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Failed to login user", error: error.message });
        
    }
}