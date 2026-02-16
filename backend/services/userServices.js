import pool from "../db.js";

export const registerUser = async (userData) => {
  const { firstName, lastName, email, password, phone, address } = userData;
  
  try {
    // Check if email already exists
    const existingUser = await pool.query(`
      SELECT email FROM customers WHERE email = $1
    `, [email]);
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }
    
    // Insert new customer
    const result = await pool.query(`
      INSERT INTO customers (first_name, last_name, email, password, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING customer_id, first_name, last_name, email
    `, [firstName, lastName, email, password, phone, address]);
    
    return result.rows[0];
    
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}




export const loginUser = async (email, password, role) => {
  try {
    
    if (role === 'staff') {
  
      const result = await pool.query(`
        SELECT * FROM staff WHERE email = $1 AND password = $2
      `, [email, password]); 
      return result.rows[0];
    }

    if (role === 'customer') {
      const result = await pool.query(`
        SELECT * FROM customers WHERE email = $1 AND password = $2
      `, [email, password]);
      return result.rows[0];
    }
    
    return null; 
    
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error; 
  }  
}