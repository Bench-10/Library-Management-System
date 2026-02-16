import pool from "../db.js";

// Get all staff members
export const getAllStaff = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        staff_id,
        email,
        first_name,
        last_name,
        is_admin
      FROM staff
      WHERE is_admin = false  
      ORDER BY staff_id DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

// Add new staff member
export const addStaff = async (staffData) => {
  const { firstName, lastName, email, password } = staffData;
  
  try {
    // Check if email already exists
    const existingStaff = await pool.query(`
      SELECT email FROM staff WHERE email = $1
    `, [email]);
    
    if (existingStaff.rows.length > 0) {
      throw new Error('Email already registered');
    }
    
    // Insert new staff
    const result = await pool.query(`
      INSERT INTO staff (first_name, last_name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING staff_id, first_name, last_name, email
    `, [firstName, lastName, email, password]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error adding staff:', error);
    throw error;
  }
};

// Update staff member
export const updateStaff = async (staffId, staffData) => {
  const { firstName, lastName, email, password } = staffData;
  
  try {
    // Check if email already exists for other staff
    const existingStaff = await pool.query(`
      SELECT staff_id FROM staff WHERE email = $1 AND staff_id != $2
    `, [email, staffId]);
    
    if (existingStaff.rows.length > 0) {
      throw new Error('Email already used by another staff member');
    }
    
    // Update staff - only update password if provided
    let query;
    let params;
    
    if (password && password.trim() !== '') {
      query = `
        UPDATE staff 
        SET first_name = $1, last_name = $2, email = $3, password = $4
        WHERE staff_id = $5
        RETURNING staff_id, first_name, last_name, email
      `;
      params = [firstName, lastName, email, password, staffId];
    } else {
      query = `
        UPDATE staff 
        SET first_name = $1, last_name = $2, email = $3
        WHERE staff_id = $4
        RETURNING staff_id, first_name, last_name, email
      `;
      params = [firstName, lastName, email, staffId];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('Staff member not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

// Delete staff member
export const deleteStaff = async (staffId) => {
  try {
    const result = await pool.query(`
      DELETE FROM staff 
      WHERE staff_id = $1
      RETURNING staff_id, first_name, last_name, email
    `, [staffId]);
    
    if (result.rows.length === 0) {
      throw new Error('Staff member not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};
