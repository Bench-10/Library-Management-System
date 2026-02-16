// Input Validation Middleware
// Protects against SQL injection, XSS, and invalid data

/**
 * Validate numeric IDs from request parameters or body
 * @param {string} paramName - Name of the parameter to validate
 */
export const validateNumericId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName] || (req.body && req.body[paramName]);
    
    if (!id) {
      return res.status(400).json({ 
        message: `${paramName} is required` 
      });
    }
    
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
      return res.status(400).json({ 
        message: `Invalid ${paramName}. Must be a positive integer.` 
      });
    }
    
    // Check for unreasonably large numbers (potential overflow)
    if (numericId > 2147483647) { // PostgreSQL INT max value
      return res.status(400).json({ 
        message: `${paramName} value too large` 
      });
    }
    
    // Replace with validated numeric value
    if (req.params[paramName]) {
      req.params[paramName] = numericId;
    }
    if (req.body && req.body[paramName]) {
      req.body[paramName] = numericId;
    }
    
    next();
  };
};

/**
 * Validate numeric field from request body only
 * @param {string} fieldName - Name of the field to validate
 * @param {boolean} required - Whether the field is required
 */
export const validateNumericField = (fieldName, required = true) => {
  return (req, res, next) => {
    const value = req.body[fieldName];
    
    if (!value && !required) {
      return next();
    }
    
    if (!value && required) {
      return res.status(400).json({ 
        message: `${fieldName} is required` 
      });
    }
    
    const numericValue = parseInt(value, 10);
    
    if (isNaN(numericValue) || numericValue <= 0 || !Number.isInteger(numericValue)) {
      return res.status(400).json({ 
        message: `Invalid ${fieldName}. Must be a positive integer.` 
      });
    }
    
    // Check for unreasonably large numbers (potential overflow)
    if (numericValue > 2147483647) { // PostgreSQL INT max value
      return res.status(400).json({ 
        message: `${fieldName} value too large` 
      });
    }
    
    // Replace with validated numeric value
    req.body[fieldName] = numericValue;
    
    next();
  };
};

/**
 * Validate string inputs with length and pattern restrictions
 * @param {string} field - Field name to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {RegExp} pattern - Optional regex pattern for additional validation
 * @param {boolean} required - Whether the field is required
 */
export const validateString = (field, maxLength = 255, pattern = null, required = false) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    // Check if required
    if (required && (value === undefined || value === null || value.trim() === '')) {
      return res.status(400).json({ 
        message: `${field} is required` 
      });
    }
    
    // Skip validation if optional and not provided
    if (!required && (value === undefined || value === null)) {
      return next();
    }
    
    // Type check
    if (typeof value !== 'string') {
      return res.status(400).json({ 
        message: `${field} must be a string` 
      });
    }
    
    // Length check
    if (value.length > maxLength) {
      return res.status(400).json({ 
        message: `${field} exceeds maximum length of ${maxLength} characters` 
      });
    }
    
    // Pattern check (if provided)
    if (pattern && !pattern.test(value)) {
      return res.status(400).json({ 
        message: `${field} contains invalid characters` 
      });
    }
    
    // Check for SQL injection patterns (defense in depth)
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT)\b)/gi,
      /(--|;|\/\*|\*\/|xp_|sp_)/gi
    ];
    
    for (const sqlPattern of sqlPatterns) {
      if (sqlPattern.test(value)) {
        return res.status(400).json({ 
          message: `${field} contains invalid characters or patterns` 
        });
      }
    }
    
    // Trim the value
    req.body[field] = value.trim();
    
    next();
  };
};

/**
 * Validate email format and length
 */
export const validateEmail = (field = 'email', required = true) => {
  return (req, res, next) => {
    const email = req.body[field];
    
    if (!email && !required) {
      return next();
    }
    
    if (!email && required) {
      return res.status(400).json({ message: `${field} is required` });
    }
    
    if (typeof email !== 'string') {
      return res.status(400).json({ message: `${field} must be a string` });
    }
    
    // Strict email regex
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }
    
    if (email.length > 255) {
      return res.status(400).json({ 
        message: 'Email exceeds maximum length of 255 characters' 
      });
    }
    
    // Normalize email (lowercase, trim)
    req.body[field] = email.toLowerCase().trim();
    
    next();
  };
};

/**
 * Validate phone number format
 */
export const validatePhone = (field = 'phoneNumber', required = false) => {
  return (req, res, next) => {
    const phone = req.body[field];
    
    // If not required and not provided, skip
    if (!required && !phone) {
      return next();
    }
    
    // If required and not provided, error
    if (required && !phone) {
      return res.status(400).json({ 
        message: `${field} is required` 
      });
    }
    
    if (typeof phone !== 'string') {
      return res.status(400).json({ 
        message: `${field} must be a string` 
      });
    }
    
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Allow only digits and + sign
    if (!/^[\d\+]+$/.test(cleanedPhone)) {
      return res.status(400).json({ 
        message: 'Phone number contains invalid characters' 
      });
    }
    
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return res.status(400).json({ 
        message: 'Phone number must be between 10 and 15 digits' 
      });
    }
    
    next();
  };
};

/**
 * Validate password requirements
 */
export const validatePassword = (field = 'password', required = true) => {
  return (req, res, next) => {
    const password = req.body[field];
    
    if (!password && !required) {
      return next();
    }
    
    if (!password && required) {
      return res.status(400).json({ message: `${field} is required` });
    }
    
    if (typeof password !== 'string') {
      return res.status(400).json({ message: `${field} must be a string` });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    if (password.length > 255) {
      return res.status(400).json({ 
        message: 'Password exceeds maximum length' 
      });
    }
    
    next();
  };
};

/**
 * Validate boolean field
 */
export const validateBoolean = (field, required = false) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (!required && (value === undefined || value === null)) {
      return next();
    }
    
    if (required && (value === undefined || value === null)) {
      return res.status(400).json({ 
        message: `${field} is required` 
      });
    }
    
    if (typeof value !== 'boolean') {
      return res.status(400).json({ 
        message: `${field} must be a boolean (true or false)` 
      });
    }
    
    next();
  };
};

/**
 * Validate numeric range
 */
export const validateNumericRange = (field, min, max, required = false) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (!required && (value === undefined || value === null)) {
      return next();
    }
    
    if (required && (value === undefined || value === null)) {
      return res.status(400).json({ 
        message: `${field} is required` 
      });
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return res.status(400).json({ 
        message: `${field} must be a number` 
      });
    }
    
    if (numValue < min || numValue > max) {
      return res.status(400).json({ 
        message: `${field} must be between ${min} and ${max}` 
      });
    }
    
    req.body[field] = numValue;
    next();
  };
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (field, required = false) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (!required && !value) {
      return next();
    }
    
    if (required && !value) {
      return res.status(400).json({ 
        message: `${field} is required` 
      });
    }
    
    // Check date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(value)) {
      return res.status(400).json({ 
        message: `${field} must be in format YYYY-MM-DD` 
      });
    }
    
    // Validate actual date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        message: `${field} is not a valid date` 
      });
    }
    
    next();
  };
};

/**
 * Sanitize text input (additional defense layer)
 * Removes potential XSS and SQL injection patterns
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove dangerous patterns
  const dangerous = [
    /(<script|<iframe|javascript:|onerror=|onload=|onclick=)/gi,
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b.*\b(FROM|INTO|WHERE|SET)\b)/gi
  ];
  
  let sanitized = input;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

/**
 * Validate request body size
 */
export const validateBodySize = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  
  if (contentLength && parseInt(contentLength) > 1048576) { // 1MB limit
    return res.status(413).json({ 
      message: 'Request body too large' 
    });
  }
  
  next();
};

/**
 * Validate array input
 */
export const validateArray = (field, maxLength = 100, required = false) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (!required && (value === undefined || value === null)) {
      return next();
    }
    
    if (required && (value === undefined || value === null)) {
      return res.status(400).json({ 
        message: `${field} is required` 
      });
    }
    
    if (!Array.isArray(value)) {
      return res.status(400).json({ 
        message: `${field} must be an array` 
      });
    }
    
    if (value.length > maxLength) {
      return res.status(400).json({ 
        message: `${field} exceeds maximum length of ${maxLength} items` 
      });
    }
    
    next();
  };
};
