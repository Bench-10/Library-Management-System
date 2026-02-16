import React, { useState, useEffect } from 'react';
import { FaBook, FaUsers, FaClipboardList, FaUserPlus, FaChartBar, FaExclamationTriangle, FaStar, FaTrophy } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalCustomers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });
    const [recentActivity, setRecentActivity] = useState([]);
  const [analytics, setAnalytics] = useState({
    highestRatedBook: null,
    mostBorrowedBooks: []
  });
  const [chartData, setChartData] = useState({
    bookDistribution: [],
    loanActivity: []
  });


  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
     
      // Fetch books data
      const booksResponse = await api.get('/books');
      const books = booksResponse.data;
      
      // Fetch loans data - this requires authentication
      let loans = [];
      try {
        const loansResponse = await api.get('/loans');
        loans = loansResponse.data;
      } catch (loanError) {
        console.log('Unable to fetch loans data (authentication required):', loanError.message);
        // Continue with empty loans array if user is not authenticated
      }
      
      // Calculate statistics
      const totalBooks = books.length;
      const availableBooks = books.reduce((sum, book) => sum + book.available_copies, 0);
      const borrowedBooks = books.reduce((sum, book) => sum + (book.total_copies - book.available_copies), 0);
      const activeLoans = loans.filter(loan => loan.status === 'Borrowed').length;
      
      // Get recent activity (last 5 loans)
      const recent = loans.slice(0, 5);
      
      // Calculate analytics
      // Find highest rated book
      const highestRatedBook = books
        .filter(book => book.rating && book.rating > 0)
        .sort((a, b) => b.rating - a.rating)[0] || null;
      
      // Calculate most borrowed books
      const borrowCounts = {};
      loans.forEach(loan => {
        if (loan.book_title) {
          const bookTitle = loan.book_title;
          borrowCounts[bookTitle] = (borrowCounts[bookTitle] || 0) + (loan.copies_borrowed || 1);
        }
      });
      
      const mostBorrowedBooks = Object.entries(borrowCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([title, count]) => ({ title, borrowCount: count }));
      
      setStats({
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalCustomers: loans.filter((loan, index, self) => 
          index === self.findIndex(l => l.borrower_name === loan.borrower_name)
        ).length,
        activeLoans,
        overdueLoans: 0 // You can implement overdue calculation based on dates
      });
        setAnalytics({
        highestRatedBook,
        mostBorrowedBooks
      });
      
      // Prepare chart data
      setChartData({
        bookDistribution: [
          { name: 'Available', value: availableBooks, color: '#10b981' },
          { name: 'Borrowed', value: borrowedBooks, color: '#f59e0b' }
        ],
        loanActivity: calculateLoanActivity(loans)
      });
      
      setRecentActivity(recent);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);    }
  };

  const calculateLoanActivity = (loans) => {
    // Group loans by month for the last 6 months
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    loans.forEach(loan => {
      if (loan.loan_date) {
        const date = new Date(loan.loan_date);
        const monthYear = `${months[date.getMonth()]}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear]++;
      }
    });
    
    // Get last 6 months
    const currentDate = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      last6Months.push({
        month: monthName,
        loans: monthlyData[monthName] || 0
      });
    }
    
    return last6Months;
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor}) => (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className={`text-sm font-medium ${color} opacity-80`}>{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`text-4xl ${color} opacity-60`} />
      </div>
    </div>
  );

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
          Admin Dashboard
        </h1>
        <p className='text-gray-600 mt-2'>Library management overview and statistics</p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        <StatCard
          icon={FaBook}
          title="Total Books"
          value={stats.totalBooks}
          color="text-blue-600"
          bgColor="bg-blue-200"
        />
        
        <StatCard
          icon={FaBook}
          title="Available Books"
          value={stats.availableBooks}
          color="text-green-600"
          bgColor="bg-green-200"
        />
        
        <StatCard
          icon={FaClipboardList}
          title="Borrowed Books"
          value={stats.borrowedBooks}
          color="text-orange-600"
          bgColor="bg-orange-200"
        />
        
        <StatCard
          icon={FaUsers}
          title="Active Customers"
          value={stats.totalCustomers}
          color="text-purple-600"
          bgColor="bg-purple-200"
        />
        
        <StatCard
          icon={FaClipboardList}
          title="Active Loans"
          value={stats.activeLoans}
          color="text-indigo-600"
          bgColor="bg-indigo-200"
        />
        
        <StatCard
          icon={FaExclamationTriangle}
          title="Overdue Loans"
          value={stats.overdueLoans}
          color="text-red-600"
          bgColor="bg-red-200"
        />      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Books Distribution Pie Chart */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
            <FaChartBar className='text-gray-600' />
            Books Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.bookDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.bookDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Activity Bar Chart */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
            <FaChartBar className='text-gray-600' />
            Loan Activity (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.loanActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="loans" fill="#3b82f6" name="Loans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Highest Rated Book */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
            Highest Rated Book
          </h2>
          
          {analytics.highestRatedBook ? (
            <div className='bg-gray-100 rounded-lg p-4'>
              <div className='flex gap-x-4'>
                 <h3 className='text-lg font-bold text-gray-800 mb-2'>
                    {analytics.highestRatedBook.title}
                </h3>
                 <span className='inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                    {analytics.highestRatedBook.genre}
                </span>
              </div>
              <p className='text-sm text-gray-600 mb-3'>
                by {analytics.highestRatedBook.author}
              </p>
              <div className='flex items-center gap-2'>
                <div className='flex items-center'>
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i}
                      className={`text-sm ${i < Math.floor(analytics.highestRatedBook.rating) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className='text-lg font-bold text-yellow-600'>
                  {analytics.highestRatedBook.rating}/5
                </span>
              </div>
             
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <FaStar className='text-4xl mx-auto mb-2 opacity-50' />
              <p>No rated books available</p>
            </div>
          )}
        </div>

        {/* Most Borrowed Books */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
            Most Borrowed Books
          </h2>
          
          {analytics.mostBorrowedBooks.length > 0 ? (
            <div className='space-y-3'>
              {analytics.mostBorrowedBooks.map((book, index) => (
                <div key={index} className={`${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-amber-100'} rounded-lg p-4 flex items-center gap-4`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-800'>{book.title}</h4>
                    <p className='text-sm text-gray-600'>
                      Borrowed {book.borrowCount} time{book.borrowCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-600' : 
                      index === 1 ? 'text-gray-600' : 'text-orange-600'
                    }`}>
                      {book.borrowCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <FaTrophy className='text-4xl mx-auto mb-2 opacity-50' />
              <p>No borrowing data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <FaClipboardList className='text-gray-600' />
          Recent Borrowing Activity
        </h2>
        
        {recentActivity.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Loan ID</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Book Title</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Borrower</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Date</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Type</th>
                  <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {recentActivity.map((activity, index) => (
                  <tr key={activity.loan_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className='px-4 py-3 text-sm text-gray-900'>#{activity.loan_id}</td>
                    <td className='px-4 py-3 text-sm text-gray-900 font-medium'>{activity.book_title}</td>
                    <td className='px-4 py-3 text-sm text-gray-700'>{activity.borrower_name}</td>
                    <td className='px-4 py-3 text-sm text-gray-700'>{activity.loan_date}</td>
                    <td className='px-4 py-3 text-sm'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.loan_type === 'Walk-in' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {activity.loan_type}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.status === 'Borrowed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <FaClipboardList className='text-4xl mx-auto mb-2 opacity-50' />
            <p>No recent borrowing activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
