import mongoose from 'mongoose';
import User from './models/user.js';
import Project from './models/project.js';
import DailyForm from './models/dailyForm.js';

export async function seedTestData() {
  try {
    console.log("Seeding test data...");
    
    // Create test employees if none exist
    const employeeCount = await User.countDocuments({ 
      $or: [{ roles: "employee" }, { roles: { $in: ["employee"] } }] 
    });
    
    if (employeeCount === 0) {
      console.log("Creating test employees...");
      
      const testEmployees = [
        {
          email: "john.doe@company.com",
          name: "John Doe",
          roles: ["employee"],
          status: "approved",
          department: "Engineering",
          designation: "Software Developer",
          profileCompleted: true,
          lastLogin: new Date()
        },
        {
          email: "jane.smith@company.com", 
          name: "Jane Smith",
          roles: ["employee"],
          status: "approved",
          department: "Design",
          designation: "UI/UX Designer",
          profileCompleted: true,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          email: "mike.wilson@company.com",
          name: "Mike Wilson",
          roles: ["employee"],
          status: "pending",
          department: "Marketing",
          designation: "Marketing Specialist",
          profileCompleted: false,
          lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      ];
      
      await User.insertMany(testEmployees);
      console.log("Test employees created");
    }
    
    // Create test projects if none exist
    const projectCount = await Project.countDocuments();
    
    if (projectCount === 0) {
      console.log("Creating test projects...");
      
      const testProjects = [
        {
          projectName: "E-commerce Website",
          clientName: "Tech Corp",
          clientEmail: "client@techcorp.com",
          description: "Modern e-commerce platform with React and Node.js",
          status: "Active",
          priority: "High",
          estimatedHoursRequired: 200,
          estimatedHoursTaken: 120,
          completionPercentage: 60,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          projectName: "Mobile App Development",
          clientName: "StartupXYZ", 
          clientEmail: "hello@startupxyz.com",
          description: "Cross-platform mobile app using React Native",
          status: "New",
          priority: "Medium",
          estimatedHoursRequired: 150,
          estimatedHoursTaken: 0,
          completionPercentage: 0,
          startDate: new Date(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          projectName: "Dashboard Analytics",
          clientName: "Data Solutions Inc",
          clientEmail: "contact@datasolutions.com",
          description: "Business intelligence dashboard with real-time analytics",
          status: "Completed",
          priority: "Low",
          estimatedHoursRequired: 80,
          estimatedHoursTaken: 85,
          completionPercentage: 100,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        }
      ];
      
      await Project.insertMany(testProjects);
      console.log("Test projects created");
    }
    
    // Create test daily forms if none exist
    const formCount = await DailyForm.countDocuments();
    
    if (formCount === 0) {
      console.log("Creating test daily forms...");
      
      const employees = await User.find({ 
        $or: [{ roles: "employee" }, { roles: { $in: ["employee"] } }]
      }).limit(2);
      
      if (employees.length > 0) {
        const testForms = [];
        
        // Create forms for the last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          employees.forEach(emp => {
            testForms.push({
              employee: emp._id,
              date: date,
              submitted: true,
              submittedAt: new Date(date.getTime() + 9 * 60 * 60 * 1000), // 9 AM
              hoursAttended: Math.floor(Math.random() * 4) + 6, // 6-9 hours
              score: Math.floor(Math.random() * 3) + 7, // 7-9 score
              screensharing: Math.random() > 0.3, // 70% chance
              adminConfirmed: Math.random() > 0.4, // 60% chance
              tasks: [
                {
                  taskId: "task1",
                  taskText: "Complete assigned project work",
                  category: "Project Tasks",
                  employeeChecked: true,
                  adminChecked: Math.random() > 0.3,
                  isCompleted: false
                },
                {
                  taskId: "task2", 
                  taskText: "Attend daily standup meeting",
                  category: "Team Communication",
                  employeeChecked: true,
                  adminChecked: Math.random() > 0.2,
                  isCompleted: false
                }
              ]
            });
          });
        }
        
        // Update isCompleted for tasks
        testForms.forEach(form => {
          form.tasks.forEach(task => {
            task.isCompleted = task.employeeChecked && task.adminChecked;
          });
        });
        
        await DailyForm.insertMany(testForms);
        console.log("Test daily forms created");
      }
    }
    
    console.log("Test data seeding completed");
    
    // Return summary
    const finalCounts = {
      employees: await User.countDocuments({ 
        $or: [{ roles: "employee" }, { roles: { $in: ["employee"] } }] 
      }),
      projects: await Project.countDocuments(),
      dailyForms: await DailyForm.countDocuments()
    };
    
    console.log("Final counts:", finalCounts);
    return finalCounts;
    
  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  }
}