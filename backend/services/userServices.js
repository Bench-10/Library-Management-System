import pool from "../db.js";


export const registerUser = async (userData) => {
  const { username, email, password } = userData;
  try {
    const result =  await pool.query(`
      INSERT INTO users ( username, email, password)
      VALUES ($1, $2, $3) RETURNING *
    `, [username, email, password]);
    
  } catch (error) {
    
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