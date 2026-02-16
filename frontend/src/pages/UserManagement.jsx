import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaUsers, FaUserShield, FaUser } from 'react-icons/fa';
import api from '../api/axios';

function UserManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentStaff, setCurrentStaff] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentStaff(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEditModal = (staffMember) => {
    setModalMode('edit');
    setCurrentStaff(staffMember);
    setFormData({
      firstName: staffMember.first_name,
      lastName: staffMember.last_name,
      email: staffMember.email,
      password: '',
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStaff(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    if (modalMode === 'add' && !formData.password) {
      setError('Password is required for new staff members');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      if (modalMode === 'add') {
        const response = await api.post('/staff', formData);
        setSuccess('Staff member added successfully');
        fetchStaff();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const response = await api.put(`/staff/${currentStaff.staff_id}`, formData);
        setSuccess('Staff member updated successfully');
        fetchStaff();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      setError(error.response?.data?.message || 'Failed to save staff member');
    }
  };

  const handleOpenDeleteModal = (staffMember) => {
    setStaffToDelete(staffMember);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setStaffToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/staff/${staffToDelete.staff_id}`);
      setSuccess('Staff member deleted successfully');
      fetchStaff();
      handleCloseDeleteModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setError(error.response?.data?.message || 'Failed to delete staff member');
      handleCloseDeleteModal();
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className='p-8'>
      {/* Header */}
      <div className='mb-8 flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
            <FaUsers className='text-red-600' />
            User Management
          </h1>
          <p className='text-gray-600 mt-2'>Manage staff members and their permissions</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className='bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold shadow-lg'
        >
          <FaUserPlus />
          Add Staff Member
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className='mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300'>
          {success}
        </div>
      )}
      {error && !showModal && (
        <div className='mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300'>
          {error}
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
          <p className='mt-4 text-gray-600'>Loading staff members...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
          <FaUsers className='text-6xl text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 text-lg'>No staff members found</p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-red-800 border-b'>
              <tr>
                <th className='px-6 py-4 text-left text-sm font-semibold text-white'>ID</th>
                <th className='px-6 py-4 text-left text-sm font-semibold text-white'>Name</th>
                <th className='px-6 py-4 text-left text-sm font-semibold text-white'>Email</th>
                <th className='px-6 py-4 text-left text-sm font-semibold text-white'>Role</th>
                <th className='px-6 py-4 text-center text-sm font-semibold text-white'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {staff.map((member) => (
                <tr key={member.staff_id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 text-sm text-gray-700'>{member.staff_id}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      {member.is_admin ? (
                        <FaUserShield className='text-red-600' />
                      ) : (
                        <FaUser className='text-gray-400' />
                      )}
                      <span className='font-medium text-gray-800'>
                        {member.first_name} {member.last_name}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{member.email}</td>
                  <td className='px-6 py-4'>
                    {member.is_admin ? (
                      <span className='inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold'>
                        Admin
                      </span>
                    ) : (
                      <span className='inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold'>
                        Staff
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center gap-2'>
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className='p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                        title='Edit'
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(member)}
                        className='p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                        title='Delete'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-md w-full p-6 shadow-xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>
              {modalMode === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}
            </h2>

            {error && (
              <div className='mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-sm'>
                {error}
              </div>
            )}

            {success && (
              <div className='mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300 text-sm'>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  First Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Last Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Password {modalMode === 'add' && <span className='text-red-500'>*</span>}
                  {modalMode === 'edit' && <span className='text-gray-500 text-xs'>(leave blank to keep current)</span>}
                </label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  required={modalMode === 'add'}
                  minLength={6}
                />
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={handleCloseModal}
                  className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold'
                >
                  {modalMode === 'add' ? 'Add Staff' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-md w-full p-6 shadow-xl'>
            <div className='text-center'>
              <FaTrash className='text-red-500 text-5xl mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>Confirm Delete</h2>
              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete <strong>{staffToDelete.first_name} {staffToDelete.last_name}</strong>?
                <br />
                <span className='text-sm text-gray-500'>This action cannot be undone.</span>
              </p>

              <div className='flex gap-3'>
                <button
                  onClick={handleCloseDeleteModal}
                  className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold'
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
