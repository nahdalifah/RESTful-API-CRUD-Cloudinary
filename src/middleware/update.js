import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const updateUser = async (req, res) => {
  try {
    const userIdFromToken = req.user.id; // dari JWT token
    const userIdFromParams = parseInt(req.params.id);

    // Cek apakah user update profilnya sendiri
    if (userIdFromToken !== userIdFromParams) {
      return res.status(403).json({ message: 'Forbidden: cannot update other user profile' });
    }

    const { username, email, password } = req.body;

    // Validasi sederhana contoh
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash password kalau ada update password
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update data user di DB, COALESCE buat gak update kalau null
    const query = `
      UPDATE users SET 
        username = COALESCE($1, username),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, username, email, role, avatar_url
    `;

    const values = [
      username || null,
      email || null,
      hashedPassword || null,
      userIdFromParams,
    ];

    const { rows } = await pool.query(query, values);

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated', user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// Fungsi validasi email sederhana
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}