const User = require('../models/User');

const categoryDepartmentMap = {
  Frontend: 'Frontend',
  Backend: 'Backend',
  Database: 'Database',
  DevOps: 'DevOps',
  Mobile: 'Mobile',
  QA: 'QA',
  'UI/UX': 'Frontend',
  Security: 'Backend',
  Other: 'General',
};

/**
 * Automatically assign a developer based on category
 * @param {string} category 
 * @param {Array} mockUsersList (Optional fallback list for in-memory mode)
 */
const getAutoAssignedDeveloper = async (category, mockUsersList = null) => {
  const targetDepartment = categoryDepartmentMap[category] || 'General';

  try {
    // Search DB for developer matching department
    let assignedDev = await User.findOne({
      role: 'Developer',
      department: targetDepartment,
    });

    // If no exact department developer found, assign any Developer
    if (!assignedDev) {
      assignedDev = await User.findOne({ role: 'Developer' });
    }

    return assignedDev ? assignedDev._id : null;
  } catch (error) {
    if (mockUsersList && Array.isArray(mockUsersList)) {
      const dev = mockUsersList.find(
        (u) => u.role === 'Developer' && u.department === targetDepartment
      ) || mockUsersList.find((u) => u.role === 'Developer');
      return dev ? dev._id : null;
    }
    return null;
  }
};

module.exports = { getAutoAssignedDeveloper };
