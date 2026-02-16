import * as staffServices from '../services/staffServices.js';

// Get all staff members
export const getAllStaff = async (req, res) => {
  try {
    const staff = await staffServices.getAllStaff();
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
};

// Add new staff member
export const addStaff = async (req, res) => {
  const staffData = req.body;
  
  try {
    // Basic validation
    if (!staffData.firstName || !staffData.lastName || !staffData.email || !staffData.password) {
      return res.status(400).json({ 
        message: "First name, last name, email, and password are required" 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffData.email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }
    
    // Password length validation
    if (staffData.password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }
    
    const newStaff = await staffServices.addStaff(staffData);
    
    res.status(201).json({ 
      message: "Staff member added successfully", 
      data: newStaff 
    });
  } catch (error) {
    console.error('Error adding staff:', error);
    
    if (error.message === 'Email already registered') {
      return res.status(409).json({ 
        message: "Email address is already registered" 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to add staff member" 
    });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  const { staffId } = req.params;
  const staffData = req.body;
  
  try {
    // Basic validation
    if (!staffData.firstName || !staffData.lastName || !staffData.email) {
      return res.status(400).json({ 
        message: "First name, last name, and email are required" 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffData.email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }
    
    // Password length validation (only if password is provided)
    if (staffData.password && staffData.password.trim() !== '' && staffData.password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }
    
    const updatedStaff = await staffServices.updateStaff(staffId, staffData);
    
    res.status(200).json({ 
      message: "Staff member updated successfully", 
      data: updatedStaff 
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    
    if (error.message === 'Email already used by another staff member') {
      return res.status(409).json({ 
        message: error.message 
      });
    }
    
    if (error.message === 'Staff member not found') {
      return res.status(404).json({ 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update staff member" 
    });
  }
};

// Delete staff member
export const deleteStaff = async (req, res) => {
  const { staffId } = req.params;
  
  try {
    const deletedStaff = await staffServices.deleteStaff(staffId);
    
    res.status(200).json({ 
      message: "Staff member deleted successfully", 
      data: deletedStaff 
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    
    if (error.message === 'Staff member not found') {
      return res.status(404).json({ 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to delete staff member" 
    });
  }
};
