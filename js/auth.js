import { Storage } from "./storage.js";

export const Auth = {
  register: (email, password, age, firstName, lastName) => {
    const users = Storage.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }
    
    const newUser = { 
      email, 
      password, 
      age: parseInt(age), 
      firstName, 
      lastName,
      avatar: null 
    };
    Storage.saveUser(newUser);
    return newUser;
  },
  
  login: (email, password) => {
    const users = Storage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    Storage.setCurrentUser(user);
    return user;
  },
  
  logout: () => {
    Storage.setCurrentUser(null);
  },
  
  getCurrentUser: () => {
    return Storage.getCurrentUser();
  },
  
  isAuthenticated: () => {
    return !!Storage.getCurrentUser();
  },
  
  isAdult: () => {
    const user = Storage.getCurrentUser();
    return user && user.age >= 18;
  }
};
